import { QRCodeSVG } from "qrcode.react";
import type { CSSProperties } from "react";
import { familyTag, originLine, type Species } from "@/lib/catalog";
import { IsopodMark } from "./icons";

export type LabelType = "tub" | "box" | "tag";

export const LABEL_TYPES: { id: LabelType; label: string; size: [number, number] }[] = [
  { id: "tub", label: "Enclosure Tub (75x50mm)", size: [75, 50] },
  { id: "box", label: "Export Box Sticker", size: [100, 150] },
  { id: "tag", label: "Mini Care Tag", size: [50, 30] },
];

export interface LabelData {
  species: Species;
  batch: string;
  count: number;
  flight: string;
  qrUrl: string | null;
}

function NameBlock({ s, size }: { s: Species; size: number }) {
  return (
    <div className="font-display leading-[1.02]" style={{ fontSize: size }}>
      <span className="font-medium">{s.scientific.toUpperCase()}</span>
      {s.morph && <span className="italic"> "{s.morph}"</span>}
      {s.note && <span className="text-[0.55em] font-semibold"> [{s.note.toUpperCase()}]</span>}
    </div>
  );
}

function Spec({ k, v, sub, className }: { k: string; v: string; sub?: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-ink/20 px-3 py-1.5 ${className ?? ""}`}>
      <div className="text-[14px]">
        <b>{k}</b> {v}
      </div>
      {sub && <div className="text-[13px] text-ink/60">{sub}</div>}
    </div>
  );
}

/** On-screen preview of a label, drawn like the Label Studio mockup. */
export function LabelPreview({ type, data }: { type: LabelType; data: LabelData }) {
  const { species: s } = data;
  return (
    <div className="overflow-hidden rounded-[20px] bg-paper text-ink">
      <div className="flex items-center gap-3 bg-peat px-4 py-3 text-mist">
        <IsopodMark className="size-5 text-em" />
        <span className="flex-1 truncate text-[11px] font-bold tracking-[0.25em]">
          {type === "box" ? "TINYTAILS EXOTICS • LIVE EXPORT" : "TINYTAILS ISOPODS • BANGKOK"}
        </span>
        <span className="size-2.5 rounded-full bg-em shadow-[0_0_8px_var(--em)]" />
      </div>
      <div className="space-y-3 p-4">
        <NameBlock s={s} size={type === "tag" ? 24 : 30} />
        <div className="text-[12px] font-bold tracking-[0.2em]">{familyTag(s)}</div>

        {type === "box" && (
          <div className="grid grid-cols-2 gap-2 text-center text-[12px] font-bold tracking-wider">
            <div className="rounded-xl bg-ink px-2 py-2 text-paper">LIVE INVERTEBRATES</div>
            <div className="rounded-xl bg-ink px-2 py-2 text-paper">THIS SIDE UP ↑</div>
            <div className="col-span-2 rounded-xl border-2 border-ink px-2 py-2">KEEP BETWEEN 10–30°C · DO NOT X-RAY</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Spec k="Humidity" v={s.care.humidity} sub={s.care.humidityNote} />
          <Spec k="Temp" v="" sub={s.care.temp} />
          {type !== "tag" && <Spec k="Diet" v={s.care.diet} className="col-span-2" />}
          {type !== "tag" && <Spec k="Origin" v={originLine(s)} className="col-span-2" />}
        </div>

        <div className="border-t-2 border-dashed border-ink/20" />
        <div className="flex items-center gap-6">
          {data.qrUrl && (
            <div className="shrink-0 text-center">
              <div className="rounded-xl border border-ink/20 bg-white p-2">
                <QRCodeSVG value={data.qrUrl} size={72} fgColor="#111813" level="M" />
              </div>
              <div className="mt-1 text-[11px] font-semibold">Scan for Care Sheet</div>
            </div>
          )}
          <div>
            <div className="text-[17px] font-bold">Batch: {data.batch}</div>
            <div className="text-[14px]">Count: {data.count}x</div>
            {type === "box" && <div className="text-[14px]">Flight: BKK {data.flight}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Print-size label in real millimetres, used only by the print sheet. */
export function PrintLabel({ type, data }: { type: LabelType; data: LabelData }) {
  const def = LABEL_TYPES.find((t) => t.id === type)!;
  const [w, h] = def.size;
  const { species: s } = data;
  const box: CSSProperties = {
    width: `${w}mm`,
    height: `${h}mm`,
    border: "0.3mm solid #111813",
    borderRadius: "2mm",
    overflow: "hidden",
    background: "#fff",
    color: "#111813",
    fontFamily: "Manrope, sans-serif",
    display: "flex",
    flexDirection: "column",
  };
  const header = (
    <div style={{ background: "#111813", color: "#E7EFE8", padding: "1mm 2mm", fontSize: "2mm", fontWeight: 700, letterSpacing: "0.3mm", display: "flex", gap: "1.5mm", alignItems: "center" }}>
      <span style={{ color: "#22C55E" }}>●</span>
      {type === "box" ? "TINYTAILS EXOTICS • LIVE EXPORT • THAILAND" : "TINYTAILS ISOPODS • BANGKOK"}
    </div>
  );
  const name = (fs: number) => (
    <div style={{ fontFamily: "Fraunces, serif", fontSize: `${fs}mm`, lineHeight: 1.05 }}>
      {s.scientific.toUpperCase()}
      {s.morph && <i> "{s.morph}"</i>}
      {s.note && <span style={{ fontSize: "0.6em" }}> [{s.note.toUpperCase()}]</span>}
    </div>
  );
  const fam = <div style={{ fontSize: "1.8mm", fontWeight: 700, letterSpacing: "0.2mm" }}>{familyTag(s)}</div>;

  if (type === "tag") {
    return (
      <div className="print-label" style={box}>
        {header}
        <div style={{ display: "flex", flex: 1, padding: "1.5mm", gap: "1.5mm" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.8mm" }}>
            {name(3)}
            {fam}
            <div style={{ fontSize: "1.9mm" }}>
              <b>RH</b> {s.care.humidity} · <b>T</b> {s.care.temp}
            </div>
            <div style={{ fontSize: "1.7mm", marginTop: "auto" }}>{data.batch}</div>
          </div>
          {data.qrUrl && <QRCodeSVG value={data.qrUrl} style={{ width: "14mm", height: "14mm", alignSelf: "center" }} level="M" />}
        </div>
      </div>
    );
  }

  if (type === "box") {
    return (
      <div className="print-label" style={box}>
        {header}
        <div style={{ padding: "4mm", display: "flex", flexDirection: "column", gap: "3mm", flex: 1 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: "6mm" }}>TinyTails</div>
          {name(7)}
          {fam}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm", fontSize: "3.2mm", fontWeight: 800, textAlign: "center" }}>
            <div style={{ background: "#111813", color: "#fff", padding: "2mm", borderRadius: "1.5mm" }}>LIVE INVERTEBRATES</div>
            <div style={{ background: "#111813", color: "#fff", padding: "2mm", borderRadius: "1.5mm" }}>THIS SIDE UP ↑</div>
            <div style={{ gridColumn: "span 2", border: "0.6mm solid #111813", padding: "2mm", borderRadius: "1.5mm" }}>
              KEEP BETWEEN 10–30°C · DO NOT X-RAY
            </div>
          </div>
          <div style={{ fontSize: "3.2mm", lineHeight: 1.5 }}>
            <div><b>Humidity</b> {s.care.humidity} · <b>Temp</b> {s.care.temp}</div>
            <div><b>Origin</b> {originLine(s)}</div>
            <div><b>Count</b> {data.count}x · <b>Batch</b> {data.batch}</div>
            <div><b>Flight</b> Bangkok (BKK) {data.flight}</div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ fontSize: "2.6mm" }}>Contains live captive-bred isopods. Handle with care.</div>
            {data.qrUrl && <QRCodeSVG value={data.qrUrl} style={{ width: "26mm", height: "26mm", flexShrink: 0 }} level="M" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="print-label" style={box}>
      {header}
      <div style={{ display: "flex", flex: 1, padding: "2mm", gap: "2mm" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1mm" }}>
          {name(4.2)}
          {fam}
          <div style={{ fontSize: "2.2mm", lineHeight: 1.35 }}>
            <div><b>Humidity</b> {s.care.humidity} · {s.care.humidityNote}</div>
            <div><b>Temp</b> {s.care.temp}</div>
            <div><b>Diet</b> {s.care.diet}</div>
            <div><b>Origin</b> {originLine(s)}</div>
          </div>
          <div style={{ fontSize: "2.2mm", marginTop: "auto", fontWeight: 700 }}>
            {data.batch} · {data.count}x
          </div>
        </div>
        {data.qrUrl && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.8mm" }}>
            <QRCodeSVG value={data.qrUrl} style={{ width: "17mm", height: "17mm" }} level="M" />
            <div style={{ fontSize: "1.6mm", fontWeight: 600 }}>Scan for Care Sheet</div>
          </div>
        )}
      </div>
    </div>
  );
}
