import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { catalogName, getSpecies, SPECIES } from "@/lib/catalog";
import { nextFlight, shortDate } from "@/lib/shipping";
import { useNow } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader, DockBar, Page, Screen } from "@/components/tt/shell";
import { btnPrimary, Card } from "@/components/tt/kit";
import { ChevronDown } from "@/components/tt/icons";
import { LABEL_TYPES, LabelPreview, PrintLabel, type LabelData, type LabelType } from "@/components/tt/labels";
import { Switch } from "@/components/ui/switch";

type LabelSearch = { species?: string; type?: LabelType };

export const Route = createFileRoute("/labels")({
  validateSearch: (search: Record<string, unknown>): LabelSearch => {
    const out: LabelSearch = {};
    const sp = search["species"];
    if (typeof sp === "string" && getSpecies(sp)) out.species = sp;
    const t = search["type"];
    if (t === "tub" || t === "box" || t === "tag") out.type = t;
    return out;
  },
  head: () => ({
    meta: [
      { title: "TinyTails Label Studio — Tub Labels & Export Stickers" },
      { name: "description", content: "Print enclosure tub labels, export box stickers and mini care tags with QR care sheets." },
      { property: "og:title", content: "TinyTails Label Studio" },
      { property: "og:description", content: "Print enclosure tub labels, export box stickers and mini care tags with QR care sheets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabelStudio,
});

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-[15px]">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer: ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid size-11 place-items-center rounded-full border border-line bg-peat text-mist disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-8 text-center text-[17px] font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More: ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid size-11 place-items-center rounded-full border border-line bg-peat text-em disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LabelStudio() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const species = getSpecies(search.species ?? "rubber-ducky") ?? SPECIES[0]!;
  const type: LabelType = search.type ?? "tub";
  const [copies, setCopies] = useState(10);
  const [count, setCount] = useState(10);
  const [withQr, setWithQr] = useState(true);
  const [origin, setOrigin] = useState("");
  const now = useNow();
  const flight = nextFlight(now);

  useEffect(() => setOrigin(window.location.origin), []);

  const data: LabelData = {
    species,
    batch: flight.batch,
    count,
    flight: shortDate(flight.date),
    qrUrl: withQr ? `${origin}/care/${species.slug}?batch=${flight.batch}` : null,
  };

  const set = (patch: LabelSearch) => navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  return (
    <Screen>
      <AppHeader title="TinyTails Label Studio" back="/" brand />
      <Page className="space-y-4 print:hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4 lg:order-2">
          <label className="relative flex h-12 items-center rounded-2xl border border-line px-4 text-[14px] focus-within:border-em/70">
            <span className="pointer-events-none min-w-0 flex-1 truncate">
              <span className="text-sage">Species</span> {catalogName(species)}
            </span>
            <ChevronDown className="pointer-events-none shrink-0" />
            <select
              aria-label="Species"
              value={species.slug}
              onChange={(e) => set({ species: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {SPECIES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {catalogName(s)}
                </option>
              ))}
            </select>
          </label>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="radiogroup" aria-label="Label type">
            {LABEL_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={type === t.id}
                onClick={() => set({ type: t.id })}
                className={cn(
                  "h-11 shrink-0 rounded-full px-4 text-[14px] font-semibold whitespace-nowrap",
                  type === t.id ? "bg-em text-peat" : "border border-line bg-moss text-mist hover:border-em/60",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Card className="divide-y divide-line py-1">
            <Stepper label="Copies to print" value={copies} onChange={setCopies} min={1} max={60} />
            <Stepper label="Isopods per container" value={count} onChange={setCount} min={1} max={99} />
            <label className="flex items-center justify-between gap-3 py-3">
              <span className="text-[15px]">Include TinyTails QR Verification</span>
              <Switch checked={withQr} onCheckedChange={setWithQr} className="data-[state=checked]:bg-em" />
            </label>
          </Card>
          <p className="text-[12px] text-sage">
            Prints at true size ({LABEL_TYPES.find((t) => t.id === type)!.size.join(" × ")} mm). In the print window choose "Save as PDF", or
            your label printer with scale set to 100%.
          </p>
        </div>

        <div className="rounded-[28px] border border-line bg-moss p-3 lg:order-1">
          <LabelPreview type={type} data={data} />
        </div>
      </Page>

      <DockBar>
        <button type="button" onClick={() => window.print()} disabled={!origin} className={cn(btnPrimary, "lg:ml-auto lg:max-w-sm")}>
          <Printer className="size-4" />
          Print Labels (PDF / AirPrint)
        </button>
      </DockBar>

      <div className="print-sheet" aria-hidden="true">
        {Array.from({ length: copies }, (_, i) => (
          <PrintLabel key={i} type={type} data={data} />
        ))}
      </div>
    </Screen>
  );
}
