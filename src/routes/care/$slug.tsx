import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { catalogName, displayName, familyTag, getSpecies, originLine, DIFFICULTY_LABEL } from "@/lib/catalog";
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
  notFoundComponent: () => (
    <Screen>
      <AppHeader title="Care sheet" back="/" />
      <Page>
        <Card className="space-y-3 text-center">
          <SectionTitle>Care sheet not found</SectionTitle>
          <Link to="/" className={btnPrimary}>Browse species</Link>
        </Card>
      </Page>
    </Screen>
  ),
  errorComponent: () => (
    <Screen>
      <AppHeader title="Care sheet" back="/" />
      <Page><Card>This care sheet didn't load. Please try again.</Card></Page>
    </Screen>
  ),
  component: CareSheet,
});

function CareSheet() {
  const { slug } = Route.useLoaderData();
  const s = getSpecies(slug)!;
  return (
    <Screen>
      <AppHeader title="Care Sheet" back="/" brand />
      <Page className="mx-auto max-w-2xl space-y-4">
        <SpeciesPhoto slug={s.slug} alt={catalogName(s)} className="aspect-[4/3] rounded-[24px]" />
        <div>
          <h2 className="text-[17px] font-bold">{catalogName(s)}</h2>
          <p className="text-[12px] text-sage">{familyTag(s)}</p>
        </div>
        <p className="text-[14px] text-sage">{s.blurb}</p>
        <Card>
          <Ledger
            rows={[
              ["Humidity", `${s.care.humidity} · ${s.care.humidityNote}`],
              ["Temperature", s.care.temp],
              ["Diet", s.care.diet],
              ["Care level", DIFFICULTY_LABEL[s.difficulty]],
            ]}
            total={["Origin", originLine(s)]}
          />
          <p className="mt-3 text-[13px] text-sage">{s.care.substrate}</p>
        </Card>
        <Link to="/species/$slug" params={{ slug: s.slug }} className={btnPrimary}>
          Shop this species
        </Link>
      </Page>
    </Screen>
  );
}
