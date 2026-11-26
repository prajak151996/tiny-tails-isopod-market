import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight } from "lucide-react";
import { getOrders } from "@/lib/orders.functions";
import { orderStage } from "@/lib/order-status";
import { shortDateL, stageLabelL, useI18n } from "@/lib/i18n";
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
  const { lang, t } = useI18n();
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
        title={t("Orders didn't load", "โหลดคำสั่งซื้อไม่สำเร็จ")}
        body={query.error instanceof Error ? query.error.message : t("Something went wrong.", "เกิดข้อผิดพลาด")}
        action={
          <button type="button" className={btnSecondary} onClick={() => query.refetch()}>
            {t("Try again", "ลองอีกครั้ง")}
          </button>
        }
      />
    );
  } else if (!query.data || query.data.length === 0) {
    body = (
      <EmptyState
        icon={<OrdersTabIcon />}
        title={t("No export orders yet", "ยังไม่มีคำสั่งซื้อ")}
        body={t("Orders you place on this device show up here with their flight and delivery status. Ordered on another device? Track it with your order number.", "คำสั่งซื้อจากเครื่องนี้จะแสดงที่นี่ พร้อมสถานะเที่ยวบินและการจัดส่ง สั่งจากเครื่องอื่น? ติดตามด้วยหมายเลขคำสั่งซื้อได้เลย")}
        action={
          <div className="space-y-2">
            <Link to="/" className={btnPrimary}>
              {t("Browse species", "ดูสายพันธุ์")}
            </Link>
            <Link to="/transit" className={btnSecondary}>
              {t("Track an order", "ติดตามพัสดุ")}
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
                      {stageLabelL(stage, o.weatherHold, lang)}
                    </span>
                  </div>
                  <div className="truncate text-[15px] font-medium">
                    {first ? `${first.count}x ${first.name}` : t("Export order", "คำสั่งซื้อส่งออก")}
                    {o.items.length > 1 && t(` +${o.items.length - 1} more`, ` +อีก ${o.items.length - 1} รายการ`)}
                  </div>
                  <div className="text-[12px] text-sage">
                    {t("Flight", "บิน")} {shortDateL(o.flightDate, lang)} · {t("Door", "ถึงบ้าน")} {shortDateL(o.deliveryDate, lang, true)}
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
      <AppHeader title={t("My Orders", "คำสั่งซื้อของฉัน")} brand />
      <Page className="space-y-4">{body}</Page>
      <TabBar />
    </Screen>
  );
}
