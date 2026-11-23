import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, QrCode, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import {
  catalogName,
  DIFFICULTY_LABEL,
  FAMILY_FILTERS,
  familyCount,
  familyTag,
  filterSpecies,
  RARITY_LABEL,
  SPECIES,
  type Difficulty,
  type FamilyFilter,
  type Rarity,
} from "@/lib/catalog";
import { nextFlight, shortDate } from "@/lib/shipping";
import { useNow } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, Page, Screen, TabBar } from "@/components/tt/shell";
import { Badge, btnPrimary, btnSecondary, EmptyState, SpeciesPhoto, useMoney } from "@/components/tt/kit";
import { PlaneIcon } from "@/components/tt/icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const RARITIES: Rarity[] = ["collector", "rare", "common"];
const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "advanced"];
const FAMILY_IDS = FAMILY_FILTERS.map((f) => f.id);

type CatalogSearch = { q?: string; family?: FamilyFilter; rarity?: Rarity[]; level?: Difficulty[] };

function pickList<T extends string>(raw: unknown, allowed: T[]): T[] | undefined {
  const arr = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  const out = arr.filter((v): v is T => allowed.includes(v as T));
  return out.length ? out : undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => {
    const out: CatalogSearch = {};
    const q = search["q"];
    if (typeof q === "string" && q) out.q = q.slice(0, 60);
    const family = search["family"];
    if (typeof family === "string" && FAMILY_IDS.includes(family as FamilyFilter) && family !== "all")
      out.family = family as FamilyFilter;
    const rarity = pickList(search["rarity"], RARITIES);
    if (rarity) out.rarity = rarity;
    const level = pickList(search["level"], DIFFICULTIES);
    if (level) out.level = level;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Species Catalog — TinyTails Thai Isopods" },
      { name: "description", content: "Browse 32 captive-bred Thai isopod morphs and pre-order for the next Bangkok export flight." },
      { property: "og:title", content: "Species Catalog — TinyTails Thai Isopods" },
      { property: "og:description", content: "Browse 32 captive-bred Thai isopod morphs and pre-order for the next Bangkok export flight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const money = useMoney();
  const now = useNow();
  const flight = nextFlight(now);

  const family = search.family ?? "all";
  const rarity = search.rarity ?? [];
  const level = search.level ?? [];
  const [q, setQ] = useState(search.q ?? "");

  const results = useMemo(
    () => filterSpecies(SPECIES, { q: search.q ?? "", family, rarity, difficulty: level }),
    [search.q, family, rarity, level],
  );
  const activeFilters = rarity.length + level.length;

  const setSearch = (patch: { [K in keyof CatalogSearch]?: CatalogSearch[K] | undefined }) =>
    navigate({
      to: ".",
      search: (prev) => {
        const next = { ...prev, ...patch } as CatalogSearch & typeof patch;
        if (!next.rarity?.length) delete next.rarity;
        if (!next.level?.length) delete next.level;
        if (!next.q) delete next.q;
        if (!next.family) delete next.family;
        return next;
      },
      replace: true,
      resetScroll: false,
    });

  const toggle = <T extends string>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Screen>
      <AppHeader title="Species Catalog" brand />
      <Page className="space-y-4">
        <div className="flex gap-2">
          <label className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-line px-3 focus-within:border-em/70">
            <Search className="size-[18px] shrink-0 text-sage" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSearch({ q: e.target.value || undefined });
              }}
              placeholder={`Search ${SPECIES.length} species...`}
              aria-label="Search species"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-mist outline-hidden placeholder:text-sage"
            />
          </label>
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Filters"
                className="relative grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-moss text-mist hover:border-em/60"
              >
                <SlidersHorizontal className="size-[18px]" />
                {activeFilters > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-em text-[11px] font-bold text-peat">
                    {activeFilters}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[28px] border-line bg-moss text-mist">
              <SheetHeader>
                <SheetTitle className="font-display text-[20px] font-medium text-mist">Filter species</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <FilterGroup
                  title="Rarity"
                  options={RARITIES.map((r) => ({ id: r, label: RARITY_LABEL[r] }))}
                  selected={rarity}
                  onToggle={(r) => setSearch({ rarity: toggle(rarity, r as Rarity) })}
                />
                <FilterGroup
                  title="Care level"
                  options={DIFFICULTIES.map((d) => ({ id: d, label: DIFFICULTY_LABEL[d] }))}
                  selected={level}
                  onToggle={(d) => setSearch({ level: toggle(level, d as Difficulty) })}
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" className={btnSecondary} onClick={() => setSearch({ rarity: undefined, level: undefined })}>
                    Clear
                  </button>
                  <SheetTrigger asChild>
                    <button type="button" className={btnPrimary}>
                      Show {results.length} species
                    </button>
                  </SheetTrigger>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {FAMILY_FILTERS.map((f) => {
            const active = family === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSearch({ family: f.id === "all" ? undefined : f.id })}
                className={cn(
                  "h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active ? "bg-em text-peat" : "border border-line bg-moss text-mist hover:border-em/60",
                )}
              >
                {f.label} ({familyCount(SPECIES, f.id)})
              </button>
            );
          })}
        </div>

        <Link to="/transit" className="flex items-center gap-4 rounded-[24px] bg-em p-4 text-peat shadow-glow-faint">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-peat/10">
            <PlaneIcon />
          </span>
          <span className="min-w-0">
            <span className="font-display block text-[19px] leading-tight">Next Bangkok Cargo: {shortDate(flight.date)}</span>
            <span className="block text-[13px] font-medium">{SPECIES.length} Captive-Bred Morphs Available</span>
          </span>
        </Link>

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No morphs match"
            body="Try another name or family, or clear your filters to see every species we export."
            action={
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setQ("");
                  navigate({ to: ".", search: {}, replace: true });
                }}
              >
                Clear search & filters
              </button>
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/species/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full flex-col rounded-[24px] border border-line bg-moss p-2 transition-colors hover:border-em/50"
                >
                  <div className="relative">
                    <SpeciesPhoto slug={s.slug} alt={catalogName(s)} className="aspect-square rounded-[20px]" />
                    <Badge className="absolute top-2 left-2 bg-peat/70 backdrop-blur-sm">{s.badge}</Badge>
                  </div>
                  <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
                    <h3 className="text-[13px] leading-snug font-bold">{catalogName(s)}</h3>
                    <p className="mt-1 text-[11px] text-sage">{familyTag(s)}</p>
                    <p className="font-display mt-auto pt-2 text-[19px] text-em">From {money(s.starterPrice, { whole: true })}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link to="/labels" className="flex items-center gap-4 rounded-[24px] border border-line bg-moss p-4 hover:border-em/50">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-em/30 bg-em/10 text-em">
            <QrCode className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-display block text-[19px]">Print Enclosure Tub Labels</span>
            <span className="block text-[13px] text-sage">Generate printable cards with QR care sheets</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-sage" />
        </Link>
      </Page>
      <TabBar />
    </Screen>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-bold tracking-wider text-sage uppercase">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.id)}
              className={cn(
                "h-9 rounded-full px-4 text-[13px] font-semibold",
                on ? "bg-em text-peat" : "border border-line bg-peat text-mist",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
