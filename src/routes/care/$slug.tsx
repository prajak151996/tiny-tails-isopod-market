import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { catalogName, displayName, familyTag, getSpecies } from "@/lib/catalog";
import { blurbL, careL, difficultyLabelL, originLineL, useI18n } from "@/lib/i18n";
import { AppHeader, Page, Screen } from "@/components/tt/shell";
import { btnPrimary, Card, Ledger, SectionTitle, SpeciesPhoto } from "@/components/tt/kit";

export const Route = createFileRoute("/care/$slug")({
  loader: ({ params }) => {
    if (!getSpecies(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ loaderData }) => {
    const s = loaderData ? getSpecies(loaderData.slug) : undefined;
    const title = s ? `${displayName(s)} Care Sheet — TinyTails` : "Care sheet — TinyTails";
    const description = s ? `Humidity, temperature and diet for ${catalogName(s)}.` : "TinyTails isopod care sheet.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: CareNotFound,
  errorComponent: CareError,
  component: CareSheet,
});

function CareNotFound() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t("Care sheet", "วิธีเลี้ยง")} back="/" />
      <Page>
        <Card className="space-y-3 text-center">
          <SectionTitle>{t("Care sheet not found", "ไม่พบวิธีเลี้ยง")}</SectionTitle>
          <Link to="/" className={btnPrimary}>{t("Browse species", "ดูสายพันธุ์")}</Link>
        </Card>
      </Page>
    </Screen>
  );
}

function CareError() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t("Care sheet", "วิธีเลี้ยง")} back="/" />
      <Page><Card>{t("This care sheet didn't load. Please try again.", "โหลดวิธีเลี้ยงไม่สำเร็จ กรุณาลองใหม่")}</Card></Page>
    </Screen>
  );
}

function CareSheet() {
  const { slug } = Route.useLoaderData();
  const s = getSpecies(slug)!;
  const { lang, t } = useI18n();
  const care = careL(s.care, lang);
  return (
    <Screen>
      <AppHeader title={t("Care Sheet", "วิธีเลี้ยง")} back="/" brand />
      <Page className="mx-auto max-w-2xl space-y-4">
        <SpeciesPhoto slug={s.slug} alt={catalogName(s)} className="aspect-[4/3] rounded-[24px]" />
        <div>
          <h2 className="text-[17px] font-bold">{catalogName(s)}</h2>
          <p className="text-[12px] text-sage">{familyTag(s)}</p>
        </div>
        <p className="text-[14px] text-sage">{blurbL(s, lang)}</p>
        <Card>
          <Ledger
            rows={[
              [t("Humidity", "ความชื้น"), `${care.humidity} · ${care.humidityNote}`],
              [t("Temperature", "อุณหภูมิ"), care.temp],
              [t("Diet", "อาหาร"), care.diet],
              [t("Care level", "ระดับการเลี้ยง"), difficultyLabelL(s.difficulty, lang)],
            ]}
            total={[t("Origin", "แหล่งที่มา"), originLineL(s, lang)]}
          />
          <p className="mt-3 text-[13px] text-sage">{care.substrate}</p>
        </Card>
        <Link to="/species/$slug" params={{ slug: s.slug }} className={btnPrimary}>
          {t("Shop this species", "ซื้อสายพันธุ์นี้")}
        </Link>
      </Page>
    </Screen>
  );
}
