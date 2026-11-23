import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Video } from "lucide-react";
import { toast } from "sonner";
import { getOrder } from "@/lib/orders.functions";
import { orderStage, stageLabel } from "@/lib/order-status";
import { formatMoney, getCountry, shortDate, type Currency } from "@/lib/shipping";
import { useNow } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, Page, Screen } from "@/components/tt/shell";
import { btnPrimary, btnSecondary, Card, SectionTitle, SpeciesPhoto } from "@/components/tt/kit";
import { TransitJourney } from "@/components/tt/transit-journey";
import { PolicyDialog } from "@/components/tt/policy-dialog";

const orderQuery = (orderNumber: string) =>
  queryOptions({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const order = await getOrder({ data: { orderNumber } });
      if (!order) throw notFound();
      return order;
    },
  });

export const Route = createFileRoute("/orders/$orderNumber")({
  validateSearch: (search: Record<string, unknown>): { placed?: boolean } =>
    search["placed"] === true || search["placed"] === "true" ? { placed: true } : {},
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQuery(params.orderNumber.toUpperCase())),
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — TinyTails` },
      { name: "description", content: "Live transit status for your TinyTails isopod export." },
      { property: "og:title", content: `Order ${params.orderNumber} — TinyTails` },
      { property: "og:description", content: "Live transit status for your TinyTails isopod export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: OrderNotFound,
  errorComponent: OrderError,
  component: OrderPage,
});

function OrderNotFound() {
  const { orderNumber } = Route.useParams();
  return (
    <Screen>
      <AppHeader title="Order not found" back="/orders" />
      <Page>
        <Card className="space-y-3 text-center">
          <SectionTitle>We couldn't find {orderNumber}</SectionTitle>
          <p className="text-[13px] text-sage">Check the order number in your confirmation email and try again.</p>
          <Link to="/transit" className={btnPrimary}>
            Track another order
          </Link>
        </Card>
      </Page>
    </Screen>
  );
}

function OrderError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <Screen>
      <AppHeader title="Order" back="/orders" />
      <Page>
        <Card className="space-y-3 text-center">
          <SectionTitle>This order didn't load</SectionTitle>
          <p className="text-[13px] text-sage">{error instanceof Error ? error.message : "Something went wrong."}</p>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
        </Card>
      </Page>
    </Screen>
  );
}

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { placed } = Route.useSearch();
  const { data: o } = useSuspenseQuery(orderQuery(orderNumber.toUpperCase()));
  const now = useNow();
  const stage = orderStage(o.flightDate, o.deliveryDate, now);
  const country = getCountry(o.countryCode);
  const money = (usd: number) => formatMoney(usd, o.currency as Currency);
  const hold = o.weatherHold && stage === 0;

  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => toast.success("Copied"));
  };

  return (
    <Screen>
      <AppHeader title={placed ? "Order Confirmed" : `Order ${o.orderNumber}`} back="/orders" />
      <Page className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4">
          {placed && (
            <div className="flex items-start gap-3 rounded-[24px] bg-em p-4 text-peat shadow-glow-faint">
              <CheckCircle2 className="mt-0.5 size-6 shrink-0" />
              <div>
                <div className="font-display text-[19px] leading-tight">You're on the {shortDate(o.flightDate)} flight</div>
                <p className="text-[13px] font-medium">
                  Payment received. A confirmation is on its way to {o.email}.
                </p>
              </div>
            </div>
          )}

          <Card className="grid grid-cols-2 gap-3">
            <CodeBox label="Order number" value={o.orderNumber} onCopy={copy} />
            <CodeBox label="Tracking number" value={o.trackingNumber} onCopy={copy} />
            <div className="col-span-2 flex items-center justify-between rounded-xl bg-peat px-3 py-2 text-[13px]">
              <span className="text-sage">Status</span>
              <span className={cn("font-bold", hold ? "text-warn" : "text-em")}>{stageLabel(stage, o.weatherHold)}</span>
            </div>
          </Card>

          <TransitJourney
            country={country}
            city={o.city}
            zip={o.zip}
            flightDate={o.flightDate}
            deliveryDate={o.deliveryDate}
            stage={stage}
            hold={hold}
          />

          {hold && (
            <p className="rounded-[20px] border border-warn/40 bg-warn/10 p-4 text-[13px] text-warn">
              Your destination forecast was {o.tempC}°C at checkout, outside the 10–32°C safe range. We'll keep your colony in Bangkok and
              email you before it ships on the first safe flight.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <SectionTitle>In your crate</SectionTitle>
            <ul className="space-y-3">
              {o.items.map((i) => (
                <li key={`${i.slug}-${i.pack}`} className="flex items-center gap-3">
                  <SpeciesPhoto slug={i.slug} alt={i.name} className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">
                      {i.count}x {i.name}
                    </div>
                    <div className="text-[12px] text-sage">
                      {i.pack}
                      {i.qty > 1 && ` × ${i.qty}`}
                    </div>
                  </div>
                  <span className="text-[14px] tabular-nums">{money(i.unitUsd * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="divide-y divide-line border-t border-line text-[14px]">
              <Row k="Items Subtotal" v={money(o.itemsUsd)} />
              <Row k="Air Freight & Transshipper Clearance" v={money(o.airFreightUsd)} />
              <Row k="FedEx Priority Overnight Door Delivery" v={money(o.domesticUsd)} />
              <div className="flex justify-between gap-4 pt-3 font-bold">
                <dt>Total Landed Amount</dt>
                <dd className="text-lime tabular-nums">{money(o.totalUsd)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="space-y-1 text-[14px]">
            <SectionTitle className="mb-2">Delivering to</SectionTitle>
            <p>{o.customerName}</p>
            <p className="text-sage">{o.addressLine}</p>
            <p className="text-sage">
              {o.city} {o.zip}, {country.name}
            </p>
          </Card>

          <div className="flex items-start gap-3 rounded-[20px] border border-em/30 bg-lag p-4">
            <Video className="mt-0.5 size-6 shrink-0 text-em" />
            <div className="text-[13px]">
              <p className="font-semibold">Film your unboxing on {shortDate(o.deliveryDate, true)}</p>
              <p className="text-sage">Start recording within 2 hours of delivery to keep your Live Arrival Guarantee.</p>
              <PolicyDialog>
                <button type="button" className="mt-1 text-em underline underline-offset-2">
                  View 2h Unboxing Policy
                </button>
              </PolicyDialog>
            </div>
          </div>

          <Link to="/" className={btnSecondary}>
            Continue shopping
          </Link>
        </div>
      </Page>
    </Screen>
  );
}

function CodeBox({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="min-w-0 rounded-xl bg-peat px-3 py-2">
      <div className="text-[11px] text-sage">{label}</div>
      <div className="flex items-center gap-1">
        <span className="truncate text-[14px] font-bold tracking-wide">{value}</span>
        <button type="button" aria-label={`Copy ${label.toLowerCase()}`} onClick={() => onCopy(value)} className="shrink-0 text-sage hover:text-em">
          <Copy className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-sage">{k}</dt>
      <dd className="shrink-0 tabular-nums">{v}</dd>
    </div>
  );
}
