import { getPack, getSpecies, packPrice, type PackId } from "./catalog";

export type CountryCode = "US" | "CA" | "GB" | "DE" | "NL" | "FR" | "ES" | "IT" | "JP";

export interface Country {
  code: CountryCode;
  name: string;
  /** Short name used in fee labels, e.g. "US". */
  short: string;
  hub: string;
  airFreightUsd: number;
  domesticUsd: number;
  zipLabel: string;
  zipPlaceholder: string;
  zipPattern: RegExp;
  /** Typical daytime °C in mid-winter and mid-summer. */
  climate: [number, number];
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", short: "US", hub: "US Clearance Hub (Dallas)", airFreightUsd: 25, domesticUsd: 35, zipLabel: "ZIP", zipPlaceholder: "90210", zipPattern: /^\d{5}$/, climate: [8, 30] },
  { code: "CA", name: "Canada", short: "Canada", hub: "Canada Clearance Hub (Toronto)", airFreightUsd: 30, domesticUsd: 40, zipLabel: "Postal code", zipPlaceholder: "M5V 2T6", zipPattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, climate: [-5, 25] },
  { code: "GB", name: "United Kingdom", short: "UK", hub: "UK Clearance Hub (London Heathrow)", airFreightUsd: 35, domesticUsd: 30, zipLabel: "Postcode", zipPlaceholder: "SW1A 1AA", zipPattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, climate: [8, 22] },
  { code: "DE", name: "Germany", short: "EU", hub: "EU Clearance Hub (Frankfurt)", airFreightUsd: 35, domesticUsd: 32, zipLabel: "Postcode", zipPlaceholder: "10115", zipPattern: /^\d{5}$/, climate: [3, 24] },
  { code: "NL", name: "Netherlands", short: "EU", hub: "EU Clearance Hub (Frankfurt)", airFreightUsd: 35, domesticUsd: 32, zipLabel: "Postcode", zipPlaceholder: "1012 AB", zipPattern: /^\d{4} ?[A-Z]{2}$/i, climate: [6, 22] },
  { code: "FR", name: "France", short: "EU", hub: "EU Clearance Hub (Frankfurt)", airFreightUsd: 35, domesticUsd: 32, zipLabel: "Postcode", zipPlaceholder: "75001", zipPattern: /^\d{5}$/, climate: [8, 26] },
  { code: "ES", name: "Spain", short: "EU", hub: "EU Clearance Hub (Frankfurt)", airFreightUsd: 35, domesticUsd: 32, zipLabel: "Postcode", zipPlaceholder: "28001", zipPattern: /^\d{5}$/, climate: [14, 32] },
  { code: "IT", name: "Italy", short: "EU", hub: "EU Clearance Hub (Frankfurt)", airFreightUsd: 35, domesticUsd: 32, zipLabel: "Postcode", zipPlaceholder: "00118", zipPattern: /^\d{5}$/, climate: [11, 30] },
  { code: "JP", name: "Japan", short: "Japan", hub: "Japan Clearance Hub (Tokyo Narita)", airFreightUsd: 22, domesticUsd: 28, zipLabel: "Postal code", zipPlaceholder: "100-0001", zipPattern: /^\d{3}-?\d{4}$/, climate: [10, 30] },
];

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]!;
}

export function isValidZip(country: CountryCode, zip: string): boolean {
  return getCountry(country).zipPattern.test(zip.trim());
}

export function domesticLabel(c: Country): string {
  return `${c.short} Domestic FedEx Overnight + Heat Pack`;
}

/** US climate by first ZIP digit: [winter, summer] daytime °C. */
const US_REGIONS: Record<string, [number, number]> = {
  "0": [1, 27],
  "1": [2, 29],
  "2": [9, 31],
  "3": [17, 33],
  "4": [1, 29],
  "5": [-6, 28],
  "6": [1, 31],
  "7": [14, 35],
  "8": [6, 34],
  "9": [21.5, 28],
};

/** Simulated destination forecast (°C) for the month of arrival (0 = January). */
export function destinationTemp(countryCode: CountryCode, zip: string, month: number): number {
  const country = getCountry(countryCode);
  const clean = zip.trim().toUpperCase();
  let climate = country.climate;
  if (country.code === "US") {
    const prefix = clean.slice(0, 2);
    climate = ["97", "98", "99"].includes(prefix) ? [6, 25] : (US_REGIONS[clean.charAt(0)] ?? country.climate);
  }
  const season = (1 - Math.cos((2 * Math.PI * month) / 12)) / 2; // Jan 0 → Jul 1
  const base = climate[0] + (climate[1] - climate[0]) * season;
  let sum = 0;
  for (const ch of clean) sum += /\d/.test(ch) ? Number(ch) : ch.charCodeAt(0) % 10;
  const jitter = (sum % 5) - 2;
  return Math.round(base + jitter);
}

export const SAFE_MIN_C = 10;
export const SAFE_MAX_C = 32;

export type WeatherStatus = "safe" | "cold" | "hot";

export function weatherStatus(tempC: number): WeatherStatus {
  if (tempC < SAFE_MIN_C) return "cold";
  if (tempC > SAFE_MAX_C) return "hot";
  return "safe";
}

// ---------- Export flight schedule (Bangkok, UTC+7) ----------

const DAY = 86_400_000;
const BKK_OFFSET = 7 * 3_600_000;
/** Flights leave Bangkok every Saturday; batch numbering starts at this flight. */
const FIRST_BATCH = Date.UTC(2026, 7, 29); // Sat 29 Aug 2026 = B01
const CUTOFF_DAYS = 3;

export interface Flight {
  /** Departure date in Bangkok, YYYY-MM-DD. */
  date: string;
  /** Last moment to order for this flight (epoch ms): 23:59 Bangkok time, 3 days before. */
  cutoff: number;
  /** FedEx door delivery date, YYYY-MM-DD (3 days after departure). */
  deliveryDate: string;
  batch: string;
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function flightFromDay(dayMs: number): Flight {
  const n = Math.round((dayMs - FIRST_BATCH) / (7 * DAY)) + 1;
  const year = new Date(dayMs).getUTCFullYear();
  return {
    date: iso(dayMs),
    cutoff: dayMs - (CUTOFF_DAYS - 1) * DAY - BKK_OFFSET - 60_000,
    deliveryDate: iso(dayMs + 3 * DAY),
    batch: `TT-${year}-B${String(Math.max(n, 1)).padStart(2, "0")}`,
  };
}

/** The next `count` flights still open for orders at `now`. */
export function upcomingFlights(now: number, count = 4): Flight[] {
  const bkk = new Date(now + BKK_OFFSET);
  let day = Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), bkk.getUTCDate());
  day += ((6 - new Date(day).getUTCDay() + 7) % 7) * DAY; // next Saturday (or today)
  const out: Flight[] = [];
  while (out.length < count) {
    const f = flightFromDay(day);
    if (f.cutoff > now) out.push(f);
    day += 7 * DAY;
  }
  return out;
}

export function nextFlight(now: number): Flight {
  return upcomingFlights(now, 1)[0]!;
}

export function daysToCutoff(f: Flight, now: number): number {
  return Math.max(0, Math.floor((f.cutoff - now) / DAY));
}

export function orderWithinText(f: Flight, now: number): string {
  const d = daysToCutoff(f, now);
  if (d === 0) return "Order today";
  return `Order within ${d} day${d === 1 ? "" : "s"}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-28" → "Nov 28"; "2026-12-01" → "Dec 01" when pad is set. */
export function shortDate(isoDate: string, pad = false): string {
  const [, m, d] = isoDate.split("-");
  const day = pad ? (d ?? "") : String(Number(d));
  return `${MONTHS[Number(m) - 1] ?? ""} ${day}`;
}

export function monthOf(isoDate: string): number {
  return Number(isoDate.split("-")[1] ?? "1") - 1;
}

// ---------- Landed cost ----------

export interface LineItem {
  slug: string;
  pack: PackId;
  qty: number;
}

export interface Quote {
  lines: { slug: string; pack: PackId; qty: number; count: number; unitUsd: number; totalUsd: number }[];
  itemsUsd: number;
  airFreightUsd: number;
  domesticUsd: number;
  totalUsd: number;
  tempC: number;
  status: WeatherStatus;
  flight: Flight;
  country: Country;
}

/** Door-to-door landed cost: isopods + Bangkok air cargo & transshipper fee + domestic overnight with heat pack. Shipping is charged once per order. */
export function quote(items: LineItem[], countryCode: CountryCode, zip: string, now: number): Quote {
  const country = getCountry(countryCode);
  const flight = nextFlight(now);
  const lines = items.flatMap((i) => {
    const s = getSpecies(i.slug);
    if (!s || i.qty < 1) return [];
    const unit = packPrice(s, i.pack);
    return [{ slug: i.slug, pack: i.pack, qty: i.qty, count: getPack(i.pack).count, unitUsd: unit, totalUsd: unit * i.qty }];
  });
  const itemsUsd = lines.reduce((a, l) => a + l.totalUsd, 0);
  const hasItems = lines.length > 0;
  const airFreightUsd = hasItems ? country.airFreightUsd : 0;
  const domesticUsd = hasItems ? country.domesticUsd : 0;
  const tempC = destinationTemp(country.code, zip || country.zipPlaceholder, monthOf(flight.deliveryDate));
  return {
    lines,
    itemsUsd,
    airFreightUsd,
    domesticUsd,
    totalUsd: itemsUsd + airFreightUsd + domesticUsd,
    tempC,
    status: weatherStatus(tempC),
    flight,
    country,
  };
}

// ---------- Currency ----------

export type Currency = "USD" | "EUR" | "GBP" | "JPY";
export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY"];
/** Indicative display rates from USD; orders are charged in USD. */
export const RATES: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155 };

export function convert(usd: number, currency: Currency): number {
  return usd * RATES[currency];
}

export function formatMoney(usd: number, currency: Currency, opts: { whole?: boolean } = {}): string {
  const value = convert(usd, currency);
  const digits = currency === "JPY" || opts.whole ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
