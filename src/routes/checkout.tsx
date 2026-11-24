import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Box, Check, Lock, Minus, Plus, Thermometer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { displayName, getPack, getSpecies } from "@/lib/catalog";
import { isValidZip, quote } from "@/lib/shipping";
import { placeOrder } from "@/lib/orders.functions";
import { useNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, DockBar, Page, Screen } from "@/components/tt/shell";
import { btnPrimary, Card, EmptyState, inputBox, SectionTitle, SpeciesPhoto, useMoney } from "@/components/tt/kit";
import { DestinationFields } from "@/components/tt/destination";
import { TransitJourney } from "@/components/tt/transit-journey";
import { PaymentSheet, type PaymentMethod } from "@/components/tt/payment-sheet";
import { BagIcon } from "@/components/tt/icons";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Export Checkout — TinyTails" },
      { name: "description", content: "Review your isopod export, live transit route and door-to-door landed cost." },
      { property: "og:title", content: "Secure Export Checkout — TinyTails" },
      { property: "og:description", content: "Review your isopod export, live transit route and door-to-door landed cost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Contact = { customerName: string; email: string; phone: string; addressLine: string; city: string };
const EMPTY_CONTACT: Contact = { customerName: "", email: "", phone: "", addressLine: "", city: "" };

function contactErrors(c: Contact): Partial<Record<keyof Contact, string>> {
  const e: Partial<Record<keyof Contact, string>> = {};
  if (c.customerName.trim().length < 2) e.customerName = "Enter the recipient's full name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = "Enter a valid email for tracking updates";
  if (c.addressLine.trim().length < 3) e.addressLine = "Enter the street address";
  if (c.city.trim().length < 2) e.city = "Enter the city";
  return e;
}

function Checkout() {
  const store = useStore();
  const { cart, destination, currency, hydrated } = store;
  const money = useMoney();
  const now = useNow();
  const navigate = useNavigate();
  const place = useServerFn(placeOrder);

  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const q = quote(cart, destination.country, destination.zip, now);
  const errors = contactErrors(contact);
  const zipOk = isValidZip(destination.country, destination.zip);
  const safe = q.status === "safe";

  const mutation = useMutation({
    mutationFn: (method: PaymentMethod) =>
      place({
        data: {
          items: cart,
          country: destination.country,
          zip: destination.zip,
          currency,
          ...contact,
          paymentMethod: method,
          lagAgreed: true as const,
        },
      }),
    onSuccess: ({ orderNumber }) => {
      store.rememberOrder(orderNumber);
      store.clearCart();
      setPayOpen(false);
      navigate({ to: "/orders/$orderNumber", params: { orderNumber }, search: { placed: true } });
    },
  });

  const startPayment = () => {
    setSubmitted(true);
    if (Object.keys(errors).length || !zipOk) {
      toast.error("Add your delivery details before paying.");
      document.getElementById("delivery")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the 2-Hour Unboxing Video policy.");
      document.getElementById("lag-agree")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    mutation.reset();
    setPayOpen(true);
  };

  if (hydrated && cart.length === 0) {
    return (
      <Screen>
        <AppHeader title="Secure Export Checkout" back="/" />
        <Page>
          <EmptyState
            icon={<BagIcon width={24} height={24} />}
            title="Your export crate is empty"
            body="Pick a colony pack from the catalog to see its door-to-door landed cost and reserve a seat on the next Bangkok flight."
            action={
              <Link to="/" className={btnPrimary}>
                Browse species
              </Link>
            }
          />
        </Page>
      </Screen>
    );
  }

  const field = (key: keyof Contact, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1 block text-[12px] text-sage">{label}</span>
      <input
        value={contact[key]}
        onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
        className={cn(inputBox, submitted && errors[key] && "border-warn/70")}
        {...props}
      />
      {submitted && errors[key] && <span className="mt-1 block text-[11px] text-warn">{errors[key]}</span>}
    </label>
  );

  return (
    <Screen>
      <AppHeader title="Secure Export Checkout" back="/" />
      <Page className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4">
          {!hydrated ? (
            <Card className="h-24 animate-pulse" />
          ) : (
            q.lines.map((l) => {
              const s = getSpecies(l.slug)!;
              return (
                <Card key={`${l.slug}-${l.pack}`} className="flex items-center gap-3 p-3">
                  <SpeciesPhoto slug={l.slug} alt={displayName(s)} className="size-16 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <Link to="/species/$slug" params={{ slug: l.slug }} className="block text-[15px] leading-snug font-medium hover:text-em">
                      {getPack(l.pack).count}x {displayName(s)}
                    </Link>
                    <div className="text-[13px] text-sage">Captive Bred • Thailand</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={l.qty === 1 ? "Remove from crate" : "Decrease quantity"}
                        onClick={() => store.setQty(l.slug, l.pack, l.qty - 1)}
                        className="grid size-7 place-items-center rounded-full border border-line bg-peat text-mist"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-5 text-center text-[13px] font-semibold tabular-nums">{l.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => store.setQty(l.slug, l.pack, l.qty + 1)}
                        className="grid size-7 place-items-center rounded-full border border-line bg-peat text-em"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 self-start pt-1 text-[16px] font-semibold tabular-nums">{money(l.totalUsd)}</div>
                </Card>
              );
            })
          )}

          <TransitJourney
            country={q.country}
            city={contact.city.trim()}
            zip={destination.zip}
            flightDate={q.flight.date}
            deliveryDate={q.flight.deliveryDate}
            stage={0}
            hold={!safe}
          />

          <Card className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", safe ? "bg-em/10 text-em" : "bg-warn/10 text-warn")}>
                <Thermometer className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-sage">Destination Temp</div>
                <div className="text-[17px] font-medium">{q.tempC}°C</div>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-bold",
                  safe ? "bg-em/10 text-em" : "bg-warn/10 text-warn",
                )}
              >
                {safe ? "Safe Range" : "Weather Hold"}
              </span>
            </div>
            {!safe && (
              <p className="text-[12px] text-warn">
                Outside the 10–32°C safe range. We'll hold your colony in Bangkok and ship it on the first flight with a safe forecast.
              </p>
            )}
            <div className="h-px bg-line" />
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bark text-lime">
                <Box className="size-5" />
              </span>
              <span className="text-[14px]">Double-wall insulated box + UniHeat 72h pack</span>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3" >
            <div id="delivery" className="scroll-mt-24" />
            <SectionTitle>Delivery details</SectionTitle>
            {field("customerName", "Full name", { autoComplete: "name", placeholder: "Jordan Rivera" })}
            {field("email", "Email for tracking", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
            {field("phone", "Phone (for FedEx)", { type: "tel", autoComplete: "tel", placeholder: "+1 310 555 0142" })}
            {field("addressLine", "Street address", { autoComplete: "street-address", placeholder: "123 Palm Drive" })}
            {field("city", "City", { autoComplete: "address-level2", placeholder: "Los Angeles" })}
            <div>
              <span className="mb-1 block text-[12px] text-sage">Country & {q.country.zipLabel.toLowerCase()}</span>
              <DestinationFields />
              {!zipOk && <span className="mt-1 block text-[11px] text-warn">Enter a valid {q.country.zipLabel.toLowerCase()}</span>}
            </div>
          </Card>

          <Card>
            <dl className="divide-y divide-line text-[14px]">
              {(
                [
                  ["Items Subtotal", q.itemsUsd],
                  ["Air Freight & Transshipper Clearance", q.airFreightUsd],
                  ["FedEx Priority Overnight Door Delivery", q.domesticUsd],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-sage">{k}</dt>
                  <dd className="shrink-0 tabular-nums">{money(v)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 pt-3">
                <dt className="font-bold">Total Landed Amount</dt>
                <dd className="shrink-0">
                  <span className="font-display text-[26px] text-em tabular-nums">{money(q.totalUsd)}</span>{" "}
                  <span className="text-[12px] text-sage">{currency}</span>
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-sage">
              Excludes any import duty or VAT your country may charge on arrival.
              {currency !== "USD" && " Charged in USD; the amount shown is an estimate in your currency."}
            </p>
          </Card>

          <label
            id="lag-agree"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[24px] border bg-lag/60 p-4 scroll-mt-24",
              submitted && !agreed ? "border-warn/70" : "border-em/40",
            )}
          >
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-em/40",
                agreed ? "border-em bg-em text-on-em" : "border-line bg-peat",
              )}
            >
              {agreed && <Check className="size-4" strokeWidth={3} />}
            </span>
            <span className="text-[14px]">
              I understand and agree to the 2-Hour Unboxing Video policy for 100% Live Arrival Guarantee (LAG)
            </span>
          </label>
        </div>
      </Page>

      <DockBar>
        <div className="lg:ml-auto lg:max-w-[calc(50%-12px)]">
          <button type="button" onClick={startPayment} disabled={!hydrated || q.lines.length === 0} className={btnPrimary}>
            <Lock className="size-4" />
            Pay {money(q.totalUsd)} with Card / Apple Pay
          </button>
          <p className="mt-2 text-center text-[12px] text-sage">Powered by Stripe • Live Arrival Protection Included</p>
        </div>
      </DockBar>

      <PaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        amountLabel={money(q.totalUsd)}
        pending={mutation.isPending}
        error={mutation.error ? (mutation.error instanceof Error ? mutation.error.message : "Payment failed. Please try again.") : null}
        onPay={(m) => mutation.mutate(m)}
      />
    </Screen>
  );
}
