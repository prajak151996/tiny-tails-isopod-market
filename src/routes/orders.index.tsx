import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { getOrders } from "@/lib/orders.functions";
import { orderStage, stageLabel } from "@/lib/order-status";
import { shortDate } from "@/lib/shipping";
import { useNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, Page, Screen, TabBar } from "@/components/tt/shell";
import { btnPrimary, btnSecondary, Card, EmptyState, SpeciesPhoto } from "@/components/tt/kit";
import { OrdersTabIcon } from "@/components/tt/icons";
import { formatMoney, type Currency } from "@/lib/shipping";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Export Orders — TinyTails" },
      { name: "description", content: "Your TinyTails isopod export orders and their flight status." },
      { property: "og:title", content: "My Export Orders — TinyTails" },
      { property: "og:description", content: "Your TinyTails isopod export orders and their flight status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { orderNumbers, hydrated } = useStore();
  const fetchOrders = useServerFn(getOrders);
  const now = useNow();
  const query = useQuery({
    queryKey: ["orders", orderNumbers],
    queryFn: () => fetchOrders({ data: { orderNumbers } }),
    enabled: hydrated && orderNumbers.length > 0,
  });

  let body;
  if (!hydrated || query.isLoading) {
    body = (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  } else if (query.isError) {
    body = (
      <EmptyState
        icon={<OrdersTabIcon />}
        title="Orders didn't load"
        body={query.error instanceof Error ? query.error.message : "Something went wrong."}
        action={
          <button type="button" className={btnSecondary} onClick={() => query.refetch()}>
            Try again
          </button>
        }
      />
    );
  } else if (!query.data || query.data.length === 0) {
    body = (
      <EmptyState
        icon={<OrdersTabIcon />}
        title="No export orders yet"
        body="Orders you place on this device show up here with their flight and delivery status. Ordered on another device? Track it with your order number."
        action={
          <div className="space-y-2">
            <Link to="/" className={btnPrimary}>
              Browse species
            </Link>
            <Link to="/transit" className={btnSecondary}>
              Track an order
            </Link>
          </div>
        }
      />
    );
  } else {
    body = (
      <ul className="space-y-3">
        {query.data.map((o) => {
          const stage = orderStage(o.flightDate, o.deliveryDate, now);
          const first = o.items[0];
          return (
            <li key={o.orderNumber}>
              <Link
                to="/orders/$orderNumber"
                params={{ orderNumber: o.orderNumber }}
                className="flex items-center gap-3 rounded-[24px] border border-line bg-moss p-3 hover:border-em/50"
              >
                {first && <SpeciesPhoto slug={first.slug} alt={first.name} className="size-16 shrink-0 rounded-2xl" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold tracking-wider text-sage">{o.orderNumber}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        o.weatherHold && stage === 0 ? "bg-warn/10 text-warn" : "bg-em/10 text-em",
                      )}
                    >
                      {stageLabel(stage, o.weatherHold)}
                    </span>
                  </div>
                  <div className="truncate text-[15px] font-medium">
                    {first ? `${first.count}x ${first.name}` : "Export order"}
                    {o.items.length > 1 && ` +${o.items.length - 1} more`}
                  </div>
                  <div className="text-[12px] text-sage">
                    Flight {shortDate(o.flightDate)} · Door {shortDate(o.deliveryDate, true)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[15px] font-semibold tabular-nums">{formatMoney(o.totalUsd, o.currency as Currency)}</div>
                  <ChevronRight className="ml-auto size-4 text-sage" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <Screen>
      <AppHeader title="My Orders" brand />
      <Page className="space-y-4">{body}</Page>
      <TabBar />
    </Screen>
  );
}
