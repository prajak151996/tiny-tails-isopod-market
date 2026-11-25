import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  catalogName,
  displayName,
  getPack,
  getSpecies,
  packPrice,
  PACKS,
  type PackId,
} from "@/lib/catalog";
import { isValidZip, quote } from "@/lib/shipping";
import { blurbL, domesticLabelL, orderWithinTextL, packLabelL, rarityHeadlineL, shortDateL, useI18n, zipLabelL } from "@/lib/i18n";
import { useNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, DockBar, Page, Screen } from "@/components/tt/shell";
import { Badge, btnPrimary, Card, Chip, Ledger, SectionTitle, SpeciesPhoto, useMoney } from "@/components/tt/kit";
import { DestinationFields, WeatherStatusLine } from "@/components/tt/destination";
import { PolicyDialog } from "@/components/tt/policy-dialog";
import { PlaneIcon, ShieldIcon } from "@/components/tt/icons";

export const Route = createFileRoute("/species/$slug")({
  loader: ({ params }) => {
    const species = getSpecies(params.slug);
    if (!species) throw notFound();
    return { slug: species.slug };
  },
  head: ({ loaderData }) => {
    const s = loaderData ? getSpecies(loaderData.slug) : undefined;
    if (!s) return { meta: [{ title: "Species not found — TinyTails" }, { name: "robots", content: "noindex" }] };
    const title = `${displayName(s)} — TinyTails Thai Isopods`;
    const description = `${catalogName(s)} from ${packPrice(s, "starter")} USD. ${s.blurb}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: SpeciesNotFound,
  errorComponent: SpeciesNotFound,
  component: SpeciesDetail,
});

function SpeciesNotFound() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t("Species not found", "ไม่พบสายพันธุ์")} back="/" />
      <Page>
        <Card className="space-y-3 text-center">
          <SectionTitle>{t("This morph isn't in our catalog", "ไม่มีมอร์ฟนี้ในรายการของเรา")}</SectionTitle>
          <p className="text-[13px] text-sage">{t("It may have sold out or the link is mistyped.", "อาจขายหมดแล้ว หรือลิงก์พิมพ์ผิด")}</p>
          <Link to="/" className={btnPrimary}>
            {t("Browse all species", "ดูสายพันธุ์ทั้งหมด")}
          </Link>
        </Card>
      </Page>
    </Screen>
  );
}

function SpeciesDetail() {
  const { slug } = Route.useLoaderData();
  const species = getSpecies(slug)!;
  const [pack, setPack] = useState<PackId>("colony");
  const { destination, currency, addToCart } = useStore();
  const navigate = useNavigate();
  const money = useMoney();
  const { lang, t } = useI18n();
  const now = useNow();

  const q = quote([{ slug, pack, qty: 1 }], destination.country, destination.zip, now);
  const zipOk = isValidZip(destination.country, destination.zip);
  const p = getPack(pack);

  const preOrder = () => {
    addToCart(slug, pack);
    navigate({ to: "/checkout" });
  };

  return (
    <Screen>
      <AppHeader title={displayName(species)} back="/" />
      <Page className="pb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="relative lg:sticky lg:top-20">
          <SpeciesPhoto
            slug={slug}
            alt={catalogName(species)}
            className="aspect-[4/3.4] rounded-[24px] outline-1 -outline-offset-1 outline-mist/5"
          />
          <Chip className="absolute bottom-3 left-3">{t(`Captive Bred ${species.generation} • Thailand`, `เพาะพันธุ์ในฟาร์ม ${species.generation} • ประเทศไทย`)}</Chip>
        </div>

        <div className="mt-4 space-y-4 lg:mt-0">
          <div className="flex items-center justify-between gap-3">
            <Badge>{rarityHeadlineL(species, lang)}</Badge>
            <span className="text-right text-[13px] text-sage">
              <b className="text-mist">★ {species.rating.toFixed(1)}</b> ({t(`${species.reviews} verified export reviews`, `${species.reviews} รีวิวจากผู้ซื้อต่างประเทศ`)})
            </span>
          </div>

          <p className="text-[14px] text-sage">{blurbL(species, lang)}</p>

          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("Colony size", "ขนาดโคโลนี")}>
            {PACKS.map((option) => {
              const active = option.id === pack;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPack(option.id)}
                  className={cn(
                    "relative rounded-2xl p-3 text-left transition-colors",
                    active ? "border-2 border-em bg-em/10 shadow-glow-faint" : "border border-line bg-moss hover:border-em/50",
                  )}
                >
                  {option.id === "colony" && (
                    <span className="absolute -top-2.5 left-2 rounded-full bg-em px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-on-em">
                      {t("Most Popular", "ยอดนิยม")}
                    </span>
                  )}
                  <div className={cn("text-[12px]", active ? "text-em" : "text-sage")}>{packLabelL(option.id, lang)}</div>
                  <div className="mt-1 text-[20px] font-bold">{option.count}x</div>
                  <div className={cn("text-[14px]", active ? "text-mist" : "text-sage")}>
                    {money(packPrice(species, option.id), { whole: true })}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 rounded-[20px] border border-em/30 bg-lag p-4">
            <ShieldIcon className="shrink-0 text-em" />
            <div>
              <div className="text-[14px] font-semibold">{t("100% Live Arrival Guarantee (LAG)", "รับประกันถึงมือแบบมีชีวิต 100% (LAG)")}</div>
              <PolicyDialog>
                <button type="button" className="text-[13px] text-em underline underline-offset-2">
                  {t("View 2h Unboxing Policy", "ดูนโยบายวิดีโอแกะกล่อง 2 ชม.")}
                </button>
              </PolicyDialog>
            </div>
          </div>

          <Card className="space-y-3">
            <SectionTitle>{t("Door-to-Door Landed Cost", "ค่าใช้จ่ายรวมถึงหน้าบ้าน")}</SectionTitle>
            <DestinationFields />
            {zipOk ? (
              <WeatherStatusLine status={q.status} tempC={q.tempC} />
            ) : (
              <p className="rounded-xl bg-warn/10 px-3 py-2 text-[12px] text-warn">
                {t(`Enter a valid ${q.country.zipLabel.toLowerCase()} to check the destination forecast.`, `กรอก${zipLabelL(q.country, lang)}ให้ถูกต้องเพื่อเช็กสภาพอากาศปลายทาง`)}
              </p>
            )}
            <Ledger
              rows={[
                [`${packLabelL(p.id, lang)} (${p.count}x)`, money(q.itemsUsd)],
                [t("Bangkok Air Cargo & Transshipper Fee", "ค่าขนส่งทางอากาศจากกรุงเทพฯ และค่าตัวแทนรับ-ส่ง"), money(q.airFreightUsd)],
                [domesticLabelL(q.country, lang), money(q.domesticUsd)],
              ]}
              total={[t("Total Estimated Landed Cost", "ประมาณการรวมถึงหน้าบ้าน"), money(q.totalUsd)]}
            />
            <p className="text-[11px] text-sage">{t("Excludes any import duty or VAT your country may charge on arrival.", "ไม่รวมภาษีนำเข้าหรือ VAT ที่ประเทศปลายทางอาจเรียกเก็บ")}</p>
          </Card>

          <Link
            to="/transit"
            className="flex items-center gap-3 rounded-[20px] border border-dashed border-lime/40 p-4 hover:border-lime/70"
          >
            <PlaneIcon className="shrink-0 text-lime" />
            <p className="text-[13px]">
              {t("Next Export Flight departs Bangkok", "เที่ยวบินส่งออกรอบถัดไปออกจากกรุงเทพฯ")} <b className="text-lime">{shortDateL(q.flight.date, lang)}</b>{" "}
              <span className="text-sage">({orderWithinTextL(q.flight, now, lang)})</span>
            </p>
          </Link>
        </div>
      </Page>

      <DockBar>
        <div className="flex items-center gap-3 lg:ml-auto lg:max-w-[calc(50%-12px)]">
          <div className="shrink-0">
            <div className="text-[18px] font-bold tabular-nums">{money(q.totalUsd)}</div>
            <div className="text-[11px] text-sage">{currency}</div>
          </div>
          <button type="button" onClick={preOrder} className={cn(btnPrimary, "flex-1")}>
            {t(`Pre-Order for ${shortDateL(q.flight.date, lang)} Flight`, `สั่งจองเที่ยวบิน ${shortDateL(q.flight.date, lang)}`)}
          </button>
        </div>
      </DockBar>
    </Screen>
  );
}

