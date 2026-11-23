import { quote, type CountryCode, type LineItem } from "./shipping";
import { getSpecies, getPack, displayName } from "./catalog";

export interface PlaceOrderInput {
  items: LineItem[];
  country: CountryCode;
  zip: string;
  currency: string;
  customerName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  paymentMethod: "card" | "apple_pay";
  lagAgreed: true;
}

export interface OrderDTO {
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  email: string;
  addressLine: string;
  city: string;
  zip: string;
  countryCode: string;
  currency: string;
  items: { slug: string; name: string; pack: string; count: number; qty: number; unitUsd: number }[];
  itemsUsd: number;
  airFreightUsd: number;
  domesticUsd: number;
  totalUsd: number;
  flightDate: string;
  deliveryDate: string;
  tempC: number;
  weatherHold: boolean;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type Row = {
  order_number: string;
  tracking_number: string;
  customer_name: string;
  email: string;
  address_line: string;
  city: string;
  zip: string;
  country_code: string;
  currency: string;
  items: unknown;
  items_subtotal_usd: number | string;
  air_freight_usd: number | string;
  domestic_usd: number | string;
  total_usd: number | string;
  flight_date: string;
  delivery_date: string;
  destination_temp_c: number;
  weather_hold: boolean;
  payment_method: string;
  status: string;
  created_at: string;
};

function toDTO(r: Row): OrderDTO {
  return {
    orderNumber: r.order_number,
    trackingNumber: r.tracking_number,
    customerName: r.customer_name,
    email: r.email,
    addressLine: r.address_line,
    city: r.city,
    zip: r.zip,
    countryCode: r.country_code,
    currency: r.currency,
    items: Array.isArray(r.items) ? (r.items as OrderDTO["items"]) : [],
    itemsUsd: Number(r.items_subtotal_usd),
    airFreightUsd: Number(r.air_freight_usd),
    domesticUsd: Number(r.domestic_usd),
    totalUsd: Number(r.total_usd),
    flightDate: r.flight_date,
    deliveryDate: r.delivery_date,
    tempC: r.destination_temp_c,
    weatherHold: r.weather_hold,
    paymentMethod: r.payment_method,
    status: r.status,
    createdAt: r.created_at,
  };
}

/** Prices are recomputed on the server from the catalog; the client only sends species, pack and qty. */
export async function createOrder(input: PlaceOrderInput): Promise<{ orderNumber: string }> {
  const q = quote(input.items, input.country, input.zip, Date.now());
  if (q.lines.length === 0) throw new Error("Your crate is empty.");
  const items = q.lines.map((l) => {
    const s = getSpecies(l.slug)!;
    return { slug: l.slug, name: displayName(s), pack: getPack(l.pack).label, count: l.count, qty: l.qty, unitUsd: l.unitUsd };
  });
  const db = await admin();
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = `TT-${randomCode(6)}`;
    const { error } = await db.from("orders").insert({
      order_number: orderNumber,
      tracking_number: `TTX${randomCode(4)}${randomCode(6)}`,
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone,
      address_line: input.addressLine,
      city: input.city,
      zip: input.zip.toUpperCase(),
      country_code: input.country,
      currency: input.currency,
      items,
      items_subtotal_usd: q.itemsUsd,
      air_freight_usd: q.airFreightUsd,
      domestic_usd: q.domesticUsd,
      total_usd: q.totalUsd,
      flight_date: q.flight.date,
      delivery_date: q.flight.deliveryDate,
      destination_temp_c: q.tempC,
      weather_hold: q.status !== "safe",
      payment_method: input.paymentMethod,
      status: q.status === "safe" ? "confirmed" : "weather_hold",
    });
    if (!error) return { orderNumber };
    if (error.code !== "23505") {
      console.error("createOrder failed", error);
      throw new Error("We couldn't save your order. Please try again.");
    }
  }
  throw new Error("We couldn't save your order. Please try again.");
}

const COLUMNS =
  "order_number,tracking_number,customer_name,email,address_line,city,zip,country_code,currency,items,items_subtotal_usd,air_freight_usd,domestic_usd,total_usd,flight_date,delivery_date,destination_temp_c,weather_hold,payment_method,status,created_at";

export async function fetchOrder(orderNumber: string): Promise<OrderDTO | null> {
  const db = await admin();
  const { data, error } = await db.from("orders").select(COLUMNS).eq("order_number", orderNumber).maybeSingle();
  if (error) {
    console.error("fetchOrder failed", error);
    throw new Error("Couldn't load this order right now.");
  }
  return data ? toDTO(data as Row) : null;
}

export async function fetchOrders(orderNumbers: string[]): Promise<OrderDTO[]> {
  if (orderNumbers.length === 0) return [];
  const db = await admin();
  const { data, error } = await db
    .from("orders")
    .select(COLUMNS)
    .in("order_number", orderNumbers)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchOrders failed", error);
    throw new Error("Couldn't load your orders right now.");
  }
  return (data as Row[]).map(toDTO);
}

export async function lookupOrder(query: string): Promise<string | null> {
  const q = query.trim().toUpperCase();
  const db = await admin();
  const { data, error } = await db
    .from("orders")
    .select("order_number")
    .or(`order_number.eq.${q},tracking_number.eq.${q}`)
    .maybeSingle();
  if (error) {
    console.error("lookupOrder failed", error);
    throw new Error("Tracking lookup is unavailable right now.");
  }
  return data?.order_number ?? null;
}
