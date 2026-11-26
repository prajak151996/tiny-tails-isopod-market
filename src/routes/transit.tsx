import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { findOrder } from "@/lib/orders.functions";
import { getCountry, isValidZip, quote, upcomingFlights } from "@/lib/shipping";
import { countryNameL, orderWithinTextL, shortDateL, useI18n, zipLabelL } from "@/lib/i18n";
import { useNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, Page, Screen, TabBar } from "@/components/tt/shell";
import { btnPrimary, Card, inputBox, SectionTitle } from "@/components/tt/kit";
import { DestinationFields, WeatherStatusLine } from "@/components/tt/destination";
import { PlaneIcon } from "@/components/tt/icons";

export const Route = createFileRoute("/transit")({
  head: () => ({
    meta: [
      { title: "Export Flight Schedule — TinyTails" },
      { name: "description", content: "Countdown to the next Bangkok isopod export flight, upcoming batches and order tracking." },
      { property: "og:title", content: "Export Flight Schedule — TinyTails" },
      { property: "og:description", content: "Countdown to the next Bangkok isopod export flight, upcoming batches and order tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Transit,
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function Transit() {
  const now = useNow(1000);
  const { lang, t } = useI18n();
  const flights = upcomingFlights(now, 4);
  const next = flights[0]!;
  const left = Math.max(0, next.cutoff - now);
  const parts = [
    [Math.floor(left / 86_400_000), t("Days", "วัน")],
    [Math.floor(left / 3_600_000) % 24, t("Hrs", "ชม.")],
    [Math.floor(left / 60_000) % 60, t("Min", "นาที")],
    [Math.floor(left / 1000) % 60, t("Sec", "วิ")],
  ] as const;

  const { destination } = useStore();
  const q = quote([], destination.country, destination.zip, now);
  const zipOk = isValidZip(destination.country, destination.zip);

  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const find = useServerFn(findOrder);
  const lookup = useMutation({
    mutationFn: (query: string) => find({ data: { query } }),
    onSuccess: (orderNumber) => {
      if (orderNumber) navigate({ to: "/orders/$orderNumber", params: { orderNumber } });
    },
  });
  const cleaned = code.trim().toUpperCase();
  const codeOk = /^[A-Z0-9-]{4,24}$/.test(cleaned);

  return (
    <Screen>
      <AppHeader title={t("Export Flights", "เที่ยวบินส่งออก")} brand />
      <Page className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4">
          <section className="space-y-4 rounded-[24px] bg-sunset p-5 text-on-em shadow-glow-faint">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-peat/10">
                <PlaneIcon />
              </span>
              <div>
                <div className="text-[12px] font-bold tracking-wider uppercase">{t("Batch", "รอบ")} {next.batch}</div>
                <div className="font-display text-[22px] leading-tight">{t("Next Bangkok Cargo", "เที่ยวบินขนส่งรอบถัดไป")}: {shortDateL(next.date, lang)}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2" aria-label={t("Time left to order", "เวลาที่เหลือในการสั่ง")}>
              {parts.map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-peat/90 py-2 text-center text-mist">
                  <div className="text-[22px] font-bold tabular-nums" suppressHydrationWarning>
                    {pad(v)}
                  </div>
                  <div className="text-[11px] text-sage">{l}</div>
                </div>
              ))}
            </div>
            <p className="text-[13px] font-medium">
              {t("Order cutoff", "ปิดรับออร์เดอร์")} {shortDateL(new Date(next.cutoff + 7 * 3_600_000).toISOString().slice(0, 10), lang)}, {t("23:59 Bangkok time", "23:59 น. เวลาไทย")} ·{" "}
              {orderWithinTextL(next, now, lang)}
            </p>
            <Link to="/" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-peat text-[14px] font-bold text-em">
              {t("Pre-Order for Next Batch", "สั่งจองรอบถัดไป")}
            </Link>
          </section>

          <Card className="space-y-3">
            <SectionTitle>{t("Upcoming export flights", "เที่ยวบินส่งออกที่จะถึง")}</SectionTitle>
            <ul className="divide-y divide-line text-[14px]">
              {flights.map((f, i) => (
                <li key={f.date} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <div className="font-semibold">
                      {shortDateL(f.date, lang)} <span className="text-[12px] font-normal text-sage">· {f.batch}</span>
                    </div>
                    <div className="text-[12px] text-sage">{t("Door delivery", "ส่งถึงบ้าน")} {shortDateL(f.deliveryDate, lang, true)}</div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      i === 0 ? "bg-em/10 text-em" : "bg-bark text-sage",
                    )}
                  >
                    {i === 0 ? t("Booking now", "กำลังเปิดจอง") : t("Open", "เปิดรับ")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3">
            <SectionTitle>{t("Track an order", "ติดตามพัสดุ")}</SectionTitle>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (codeOk) lookup.mutate(cleaned);
              }}
            >
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  lookup.reset();
                }}
                placeholder={t("Order or tracking number", "หมายเลขคำสั่งซื้อหรือพัสดุ")}
                aria-label={t("Order or tracking number", "หมายเลขคำสั่งซื้อหรือพัสดุ")}
                className={inputBox}
              />
              <button
                type="submit"
                aria-label={t("Track", "ติดตาม")}
                disabled={!codeOk || lookup.isPending}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-em text-on-em shadow-glow disabled:opacity-50"
              >
                {lookup.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </button>
            </form>
            {lookup.isSuccess && !lookup.data && (
              <p className="text-[12px] text-warn">{t(`No order matches ${cleaned}. Check your confirmation email for the number.`, `ไม่พบคำสั่งซื้อ ${cleaned} ตรวจสอบหมายเลขในอีเมลยืนยัน`)}</p>
            )}
            {lookup.isError && <p className="text-[12px] text-destructive">{t("Tracking is unavailable right now. Try again shortly.", "ระบบติดตามพัสดุยังไม่พร้อม ลองใหม่อีกครั้ง")}</p>}
          </Card>

          <Card className="space-y-3">
            <SectionTitle>{t("Destination weather check", "เช็กสภาพอากาศปลายทาง")}</SectionTitle>
            <p className="text-[13px] text-sage">
              {t(`We only fly when your forecast sits between 10°C and 32°C. Check ${getCountry(destination.country).name} before you order.`, `เราส่งเฉพาะเมื่ออากาศปลายทางอยู่ระหว่าง 10°C ถึง 32°C เช็ก${countryNameL(getCountry(destination.country), lang)}ก่อนสั่งซื้อ`)}
            </p>
            <DestinationFields />
            {zipOk ? (
              <WeatherStatusLine status={q.status} tempC={q.tempC} />
            ) : (
              <p className="rounded-xl bg-warn/10 px-3 py-2 text-[12px] text-warn">{t(`Enter a valid ${q.country.zipLabel.toLowerCase()} to check.`, `กรอก${zipLabelL(q.country, lang)}ให้ถูกต้องเพื่อเช็ก`)}</p>
            )}
          </Card>

          <Link to="/orders" className={btnPrimary}>
            {t("View my orders", "ดูคำสั่งซื้อของฉัน")}
          </Link>
        </div>
      </Page>
      <TabBar />
    </Screen>
  );
}
