import { useCallback } from "react";
import type { CareProfile, Difficulty, FamilyFilter, PackId, Rarity, Species } from "./catalog";
import { daysToCutoff, type Country, type CountryCode, type Flight } from "./shipping";
import type { OrderStage } from "./order-status";
import { useStore, type Lang } from "./store";
import { BLURB_TH } from "./catalog-th";

export type { Lang };
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "th", label: "ไทย", short: "ไทย" },
];

/**
 * Inline translation: t("English text", "ข้อความไทย").
 * English is the default (SSR renders English; the saved choice applies after hydration).
 */
export function useI18n() {
  const { lang, setLang } = useStore();
  const t = useCallback((en: string, th: string) => (lang === "th" ? th : en), [lang]);
  return { lang, setLang, t };
}

const pick = (lang: Lang, en: string, th: string) => (lang === "th" ? th : en);

// ---------- Dates ----------
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "2026-11-28" → "Nov 28" (en) / "28 พ.ย." (th). */
export function shortDateL(isoDate: string, lang: Lang, pad = false): string {
  const [, m, d] = isoDate.split("-");
  const day = pad ? (d ?? "") : String(Number(d));
  const i = Number(m) - 1;
  return lang === "th" ? `${day} ${MONTHS_TH[i] ?? ""}` : `${MONTHS_EN[i] ?? ""} ${day}`;
}

export function orderWithinTextL(f: Flight, now: number, lang: Lang): string {
  const d = daysToCutoff(f, now);
  if (lang === "th") return d === 0 ? "สั่งภายในวันนี้" : `สั่งภายใน ${d} วัน`;
  if (d === 0) return "Order today";
  return `Order within ${d} day${d === 1 ? "" : "s"}`;
}

// ---------- Catalog ----------
const RARITY: Record<Rarity, [string, string]> = {
  collector: ["Collector", "สายสะสม"],
  rare: ["Rare", "หายาก"],
  common: ["Common", "ทั่วไป"],
};
export const rarityLabelL = (r: Rarity, lang: Lang) => pick(lang, ...RARITY[r]);

const DIFFICULTY: Record<Difficulty, [string, string]> = {
  easy: ["Easy", "เลี้ยงง่าย"],
  moderate: ["Moderate", "ปานกลาง"],
  advanced: ["Advanced", "ขั้นสูง"],
};
export const difficultyLabelL = (d: Difficulty, lang: Lang) => pick(lang, ...DIFFICULTY[d]);

const FAMILY_FILTER: Record<FamilyFilter, [string, string]> = {
  all: ["All", "ทั้งหมด"],
  armadillidae: ["Armadillidae", "Armadillidae"],
  armadillidiidae: ["Armadillidiidae", "Armadillidiidae"],
  porcellionidae: ["Porcellionidae", "Porcellionidae"],
  others: ["Others", "อื่นๆ"],
};
export const familyFilterLabelL = (f: FamilyFilter, lang: Lang) => pick(lang, ...FAMILY_FILTER[f]);

const BADGE_TH: Record<string, string> = {
  Collector: "สายสะสม",
  Rare: "หายาก",
  "Easy Care": "เลี้ยงง่าย",
  "Thai Origin": "สายพันธุ์ไทย",
  Vivarium: "ตู้จัดสวน",
  "Clean-Up": "ทีมเก็บกวาด",
};
export const badgeL = (badge: string, lang: Lang) => (lang === "th" ? (BADGE_TH[badge] ?? badge) : badge);

const PACK: Record<PackId, [string, string]> = {
  starter: ["Starter", "เริ่มต้น"],
  colony: ["Colony", "โคโลนี"],
  breeder: ["Breeder Pack", "แพ็กเพาะพันธุ์"],
};
export const packLabelL = (id: PackId, lang: Lang) => pick(lang, ...PACK[id]);

export function rarityHeadlineL(s: Species, lang: Lang): string {
  if (s.rarity === "collector") return pick(lang, "Rare Collector Morph", "มอร์ฟหายากสายสะสม");
  if (s.rarity === "rare") return pick(lang, "Rare Morph", "มอร์ฟหายาก");
  return pick(lang, "Hobby Favorite", "ขวัญใจนักเลี้ยง");
}

export const originLineL = (s: Species, lang: Lang) =>
  pick(lang, `Thailand • Captive Bred ${s.generation}`, `ประเทศไทย • เพาะพันธุ์ในฟาร์ม ${s.generation}`);

export const blurbL = (s: Species, lang: Lang) => (lang === "th" ? (BLURB_TH[s.slug] ?? s.blurb) : s.blurb);

const CARE_TH: Record<string, string> = {
  "Wet Side Moss": "มอสฝั่งชื้น",
  "Dry Side Bark": "เปลือกไม้ฝั่งแห้ง",
  "Ventilated Dry Side": "ฝั่งแห้ง ระบายอากาศดี",
  "Damp Soil": "ดินชื้น",
  "Decayed Oak Leaf, Calcium, Protein": "ใบโอ๊กแห้ง, แคลเซียม, โปรตีน",
  "Leaf Litter, Calcium, Vegetables": "ใบไม้แห้ง, แคลเซียม, ผัก",
  "Leaf Litter, Vegetables, Fish Flake": "ใบไม้แห้ง, ผัก, อาหารปลาแผ่น",
  "Leaf Litter, Springtail Food, Yeast": "ใบไม้แห้ง, อาหารสปริงเทล, ยีสต์",
  "Deep leaf-litter mix with a sphagnum wet side and cork bark": "ใบไม้แห้งผสมหนาๆ มีมอสสแฟกนัมฝั่งชื้น และเปลือกไม้คอร์ก",
  "Ventilated tub, half moist and half dry, with limestone grit": "กล่องระบายอากาศ ชื้นครึ่งแห้งครึ่ง โรยหินปูนบด",
  "Coco fibre and leaf litter with strong cross-ventilation": "ขุยมะพร้าวกับใบไม้แห้ง ระบายอากาศแบบไหลผ่านดีๆ",
  "Fine moist soil with crushed leaves; ideal clean-up crew": "ดินละเอียดชื้นผสมใบไม้บด เหมาะเป็นทีมเก็บกวาด",
};
/** Care profile with text fields translated; numbers (humidity, temp) are unchanged. */
export function careL(c: CareProfile, lang: Lang): CareProfile {
  if (lang !== "th") return c;
  const tr = (v: string) => CARE_TH[v] ?? v;
  return { ...c, humidityNote: tr(c.humidityNote), diet: tr(c.diet), substrate: tr(c.substrate) };
}

// ---------- Shipping ----------
const COUNTRY_TH: Record<CountryCode, string> = {
  US: "สหรัฐอเมริกา",
  CA: "แคนาดา",
  GB: "สหราชอาณาจักร",
  DE: "เยอรมนี",
  NL: "เนเธอร์แลนด์",
  FR: "ฝรั่งเศส",
  ES: "สเปน",
  IT: "อิตาลี",
  JP: "ญี่ปุ่น",
};
export const countryNameL = (c: Country, lang: Lang) => (lang === "th" ? COUNTRY_TH[c.code] : c.name);

/** "US Clearance Hub (Dallas)" → "ศูนย์ผ่านพิธีการ US (Dallas)". */
export function hubL(c: Country, lang: Lang): string {
  if (lang !== "th") return c.hub;
  const m = /^(.*) Clearance Hub \((.*)\)$/.exec(c.hub);
  return m ? `ศูนย์ผ่านพิธีการ ${m[1]} (${m[2]})` : c.hub;
}

export const domesticLabelL = (c: Country, lang: Lang) =>
  pick(lang, `${c.short} Domestic FedEx Overnight + Heat Pack`, `FedEx ข้ามคืนใน ${c.short} + แผ่นให้ความร้อน`);

export function zipLabelL(c: Country, lang: Lang): string {
  if (lang !== "th") return c.zipLabel;
  return c.zipLabel === "ZIP" ? "รหัส ZIP" : "รหัสไปรษณีย์";
}

// ---------- Orders ----------
export function stageLabelL(stage: OrderStage, hold: boolean, lang: Lang): string {
  if (hold && stage === 0) return pick(lang, "Weather hold", "พักส่งเพราะสภาพอากาศ");
  const en = ["Packing in Bangkok", "In transit", "Delivered"];
  const th = ["กำลังแพ็กที่กรุงเทพฯ", "กำลังขนส่ง", "ส่งถึงแล้ว"];
  return (lang === "th" ? th[stage] : en[stage]) ?? pick(lang, "Confirmed", "ยืนยันแล้ว");
}
