export type Family =
  | "Armadillidae"
  | "Armadillidiidae"
  | "Porcellionidae"
  | "Trachelipodidae"
  | "Platyarthridae";

export type FamilyFilter = "all" | "armadillidae" | "armadillidiidae" | "porcellionidae" | "others";
export type Rarity = "collector" | "rare" | "common";
export type Difficulty = "easy" | "moderate" | "advanced";
export type PackId = "starter" | "colony" | "breeder";

export interface CareProfile {
  humidity: string;
  humidityNote: string;
  temp: string;
  diet: string;
  substrate: string;
}

export interface Species {
  slug: string;
  /** Scientific part as written by the owner, e.g. "Cubaris sp." */
  scientific: string;
  /** Trade/morph name, e.g. "Rubber Ducky"; null when the species has none. */
  morph: string | null;
  /** Extra tag shown after the name, e.g. "Mix Morph". */
  note?: string;
  family: Family;
  badge: string;
  rarity: Rarity;
  difficulty: Difficulty;
  starterPrice: number;
  generation: string;
  rating: number;
  reviews: number;
  blurb: string;
  care: CareProfile;
}

const cubarisCare: CareProfile = {
  humidity: "75-85%",
  humidityNote: "Wet Side Moss",
  temp: "22-26°C",
  diet: "Decayed Oak Leaf, Calcium, Protein",
  substrate: "Deep leaf-litter mix with a sphagnum wet side and cork bark",
};
const armadillidiumCare: CareProfile = {
  humidity: "60-70%",
  humidityNote: "Dry Side Bark",
  temp: "20-25°C",
  diet: "Leaf Litter, Calcium, Vegetables",
  substrate: "Ventilated tub, half moist and half dry, with limestone grit",
};
const porcellioCare: CareProfile = {
  humidity: "55-70%",
  humidityNote: "Ventilated Dry Side",
  temp: "20-28°C",
  diet: "Leaf Litter, Vegetables, Fish Flake",
  substrate: "Coco fibre and leaf litter with strong cross-ventilation",
};
const dwarfCare: CareProfile = {
  humidity: "80-90%",
  humidityNote: "Damp Soil",
  temp: "22-28°C",
  diet: "Leaf Litter, Springtail Food, Yeast",
  substrate: "Fine moist soil with crushed leaves; ideal clean-up crew",
};

type Seed = Omit<Species, "care" | "rating" | "reviews"> & {
  care?: CareProfile;
  rating?: number;
  reviews?: number;
};

const seeds: Seed[] = [
  { slug: "rubber-ducky", scientific: "Cubaris sp.", morph: "Rubber Ducky", family: "Armadillidae", badge: "Collector", rarity: "collector", difficulty: "advanced", starterPrice: 120, generation: "F3", rating: 4.9, reviews: 128, blurb: "The famous duck-faced Cubaris: a pale bill-shaped head lobe on a smoky body. Slow breeder, high demand." },
  { slug: "white-shark", scientific: "Cubaris sp.", morph: "White Shark", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "advanced", starterPrice: 150, generation: "F2", blurb: "Slate-grey back with crisp white edges like a shark's belly. One of the most requested Thai morphs." },
  { slug: "panda-king", scientific: "Cubaris sp.", morph: "Panda King", family: "Armadillidae", badge: "Easy Care", rarity: "rare", difficulty: "easy", starterPrice: 45, generation: "F4", blurb: "Chalk-white with bold black patches. Hardy and steady breeding, a great first Cubaris." },
  { slug: "red-pak-chong", scientific: "Cubaris sp.", morph: "Red Pak Chong", family: "Armadillidae", badge: "Thai Origin", rarity: "rare", difficulty: "moderate", starterPrice: 95, generation: "F3", blurb: "Deep brick-red Cubaris originally collected around Pak Chong, Nakhon Ratchasima." },
  { slug: "white-zebra", scientific: "Armadillidium maculatum", morph: "White Zebra", family: "Armadillidiidae", badge: "Vivarium", rarity: "common", difficulty: "easy", starterPrice: 35, generation: "F5", blurb: "Bold zebra banding that stands out in any display vivarium. Rolls into a perfect ball.", care: armadillidiumCare },
  { slug: "dairy-cow", scientific: "Porcellio laevis", morph: "Dairy Cow", family: "Porcellionidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 25, generation: "F6", blurb: "Fast-breeding, fast-eating clean-up crew with a cow-patch pattern. Great feeder colony.", care: porcellioCare },
  { slug: "cappuccino", scientific: "Cubaris sp.", morph: "Cappuccino", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 60, generation: "F3", blurb: "Creamy beige mottled with coffee brown. Gentle and easy to watch in a planted tub." },
  { slug: "murina-orange", scientific: "Cubaris murina", morph: "Orange", family: "Armadillidae", badge: "Easy Care", rarity: "common", difficulty: "easy", starterPrice: 30, generation: "F5", blurb: "Bright orange Cubaris murina. Prolific and forgiving, perfect for bioactive tanks." },
  { slug: "murina-papaya", scientific: "Cubaris murina", morph: "Papaya", family: "Armadillidae", badge: "Easy Care", rarity: "common", difficulty: "easy", starterPrice: 30, generation: "F5", blurb: "Warm papaya tones mottled orange, yellow and cream. A colourful, reliable breeder." },
  { slug: "orange-freezy", scientific: "Cubaris sp.", morph: "Orange Freezy", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 55, generation: "F3", blurb: "Pale orange with a frosted white dusting that looks freshly iced." },
  { slug: "firefly-holy-light", scientific: "Cubaris sp.", morph: "Firefly Holy Light", family: "Armadillidae", badge: "Collector", rarity: "collector", difficulty: "advanced", starterPrice: 110, generation: "F2", blurb: "Dark charcoal body with glowing pale tail spots, like a firefly at dusk." },
  { slug: "murina-wild-type", scientific: "Cubaris murina", morph: "Wild Type", family: "Armadillidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 20, generation: "F6", blurb: "The natural grey-brown murina. Tough, fast and an excellent clean-up crew." },
  { slug: "lemon-blue", scientific: "Cubaris sp.", morph: "Lemon Blue", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 85, generation: "F3", blurb: "Dusky blue-grey shell edged in lemon yellow. Striking under daylight LEDs." },
  { slug: "murina-glacier", scientific: "Cubaris murina", morph: "Glacier", family: "Armadillidae", badge: "Vivarium", rarity: "common", difficulty: "easy", starterPrice: 40, generation: "F4", blurb: "Icy blue-white murina line. Easy care with a cool, clean look." },
  { slug: "amber-ducky", scientific: "Cubaris sp.", morph: "Amber Ducky", family: "Armadillidae", badge: "Collector", rarity: "collector", difficulty: "advanced", starterPrice: 140, generation: "F2", blurb: "Amber colour form of the Rubber Ducky with the same cream duck-bill face." },
  { slug: "golden-powder", scientific: "Cubaris sp.", morph: "Golden Powder", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 75, generation: "F3", blurb: "A shimmering gold-dusted coat that catches the light." },
  { slug: "dakmil", scientific: "Cubaris sp.", morph: "Dakmil", family: "Armadillidae", badge: "Thai Origin", rarity: "rare", difficulty: "moderate", starterPrice: 65, generation: "F3", blurb: "Dark charcoal with fine white freckles. A Thai locality line." },
  { slug: "happy-nun", scientific: "Cubaris sp.", morph: "Happy Nun", family: "Armadillidae", badge: "Collector", rarity: "collector", difficulty: "moderate", starterPrice: 90, generation: "F3", blurb: "Black back, crisp white head and trim like a nun's habit." },
  { slug: "amber-panda", scientific: "Cubaris sp.", morph: "Amber Panda", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 70, generation: "F3", blurb: "Amber twist on the panda pattern with cream-white patches." },
  { slug: "penguin", scientific: "Cubaris sp.", morph: "Penguin", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 80, generation: "F3", blurb: "Glossy black back with white side plates, a tiny tuxedo." },
  { slug: "troglodillo-soil", scientific: "Troglodillo sp.", morph: "Soil", family: "Armadillidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 35, generation: "F4", blurb: "Small earthy pill isopod that lives in the soil layer and turns waste into compost.", care: dwarfCare },
  { slug: "red-panda", scientific: "Cubaris sp.", morph: "Red Panda", family: "Armadillidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 65, generation: "F3", blurb: "Rusty red-orange with white panda patches." },
  { slug: "amber-firefly-dcf", scientific: "Cubaris sp.", morph: "Amber Firefly DCF", family: "Armadillidae", badge: "Collector", rarity: "collector", difficulty: "advanced", starterPrice: 130, generation: "F2", blurb: "Amber body with glowing tail spots. DCF line, limited numbers each batch." },
  { slug: "gestroi", scientific: "Armadillidium", morph: "Gestroi", family: "Armadillidiidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 45, generation: "F4", blurb: "Glossy black with neat rows of yellow spots. A European classic, bred in Thailand.", care: armadillidiumCare },
  { slug: "peraccae", scientific: "Armadillidium", morph: "Peraccae", family: "Armadillidiidae", badge: "Rare", rarity: "rare", difficulty: "moderate", starterPrice: 50, generation: "F4", blurb: "Dark brown with a cream-yellow marbled pattern.", care: armadillidiumCare },
  { slug: "st-lucia", scientific: "Armadillidium vulgare", morph: "St. Lucia", note: "Mix Morph", family: "Armadillidiidae", badge: "Vivarium", rarity: "common", difficulty: "easy", starterPrice: 30, generation: "F5", blurb: "Mixed colony of orange, red and calico morphs. No two tubs look alike.", care: armadillidiumCare },
  { slug: "orange-dalmatian", scientific: "Porcellionides pruinosus", morph: "Orange Dalmatian", family: "Porcellionidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 20, generation: "F6", blurb: "Small, fast and spotted. Breeds quickly and keeps any tub clean.", care: porcellioCare },
  { slug: "sexfasciatus", scientific: "Porcellionides sexfasciatus ssp. sexfasciatus", morph: null, family: "Porcellionidae", badge: "Vivarium", rarity: "common", difficulty: "easy", starterPrice: 25, generation: "F5", blurb: "Banded orange-yellow and brown pattern. Active display species.", care: porcellioCare },
  { slug: "ornatus-yellow", scientific: "Porcellio ornatus", morph: "Yellow", family: "Porcellionidae", badge: "Vivarium", rarity: "common", difficulty: "moderate", starterPrice: 40, generation: "F4", blurb: "Yellow Porcellio with ornamented spot rows. Needs good ventilation.", care: porcellioCare },
  { slug: "nagurus-cristatus", scientific: "Nagurus cristatus", morph: null, family: "Trachelipodidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 25, generation: "F5", blurb: "Tiny crested dwarf isopod. A tireless clean-up crew for small vivaria.", care: dwarfCare },
  { slug: "nagurus-nanus", scientific: "Nagurus nanus", morph: null, family: "Trachelipodidae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 20, generation: "F5", blurb: "Dwarf tan isopod that reproduces quickly. Ideal for dart frog and gecko tanks.", care: dwarfCare },
  { slug: "trichorhina", scientific: "Trichorhina sp.", morph: null, family: "Platyarthridae", badge: "Clean-Up", rarity: "common", difficulty: "easy", starterPrice: 15, generation: "F6", blurb: "Tiny blind white dwarf isopod living in the soil. The classic micro clean-up crew.", care: dwarfCare },
];

export const SPECIES: Species[] = seeds.map((s) => ({
  ...s,
  care: s.care ?? cubarisCare,
  rating: s.rating ?? 4.8,
  reviews: s.reviews ?? 24 + ((s.slug.length * 7) % 60),
}));

export function getSpecies(slug: string): Species | undefined {
  return SPECIES.find((s) => s.slug === slug);
}

export const PACKS: { id: PackId; label: string; count: number }[] = [
  { id: "starter", label: "Starter", count: 6 },
  { id: "colony", label: "Colony", count: 10 },
  { id: "breeder", label: "Breeder Pack", count: 20 },
];

export function getPack(id: PackId) {
  return PACKS.find((p) => p.id === id) ?? PACKS[1]!;
}

const roundTo5 = (n: number) => Math.round(n / 5) * 5;

/** Pack price in USD. Colony is 1.5× the starter price, breeder 8/3×, both rounded to $5. */
export function packPrice(species: Species, pack: PackId): number {
  if (pack === "starter") return species.starterPrice;
  if (pack === "colony") return roundTo5(species.starterPrice * 1.5);
  return roundTo5((species.starterPrice * 8) / 3);
}

/** Catalog/label name in caps, e.g. CUBARIS SP. "RUBBER DUCKY" [MIX MORPH]. */
export function catalogName(s: Species): string {
  const base = s.morph ? `${s.scientific} "${s.morph}"` : s.scientific;
  return (s.note ? `${base} [${s.note}]` : base).toUpperCase();
}

/** Plain title, e.g. Cubaris sp. Rubber Ducky. */
export function displayName(s: Species): string {
  return s.morph ? `${s.scientific} ${s.morph}` : s.scientific;
}

export function familyTag(s: Species): string {
  return `[ FAMILY : ${s.family.toUpperCase()} ]`;
}

export function originLine(s: Species): string {
  return `Thailand • Captive Bred ${s.generation}`;
}

export function rarityHeadline(s: Species): string {
  if (s.rarity === "collector") return "Rare Collector Morph";
  if (s.rarity === "rare") return "Rare Morph";
  return "Hobby Favorite";
}

export function familyFilterOf(f: Family): Exclude<FamilyFilter, "all"> {
  if (f === "Armadillidae") return "armadillidae";
  if (f === "Armadillidiidae") return "armadillidiidae";
  if (f === "Porcellionidae") return "porcellionidae";
  return "others";
}

export const FAMILY_FILTERS: { id: FamilyFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "armadillidae", label: "Armadillidae" },
  { id: "armadillidiidae", label: "Armadillidiidae" },
  { id: "porcellionidae", label: "Porcellionidae" },
  { id: "others", label: "Others" },
];

export const RARITY_LABEL: Record<Rarity, string> = {
  collector: "Collector",
  rare: "Rare",
  common: "Common",
};
export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  advanced: "Advanced",
};

export interface CatalogFilters {
  q: string;
  family: FamilyFilter;
  rarity: Rarity[];
  difficulty: Difficulty[];
}

export function filterSpecies(list: Species[], f: CatalogFilters): Species[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((s) => {
    if (f.family !== "all" && familyFilterOf(s.family) !== f.family) return false;
    if (f.rarity.length && !f.rarity.includes(s.rarity)) return false;
    if (f.difficulty.length && !f.difficulty.includes(s.difficulty)) return false;
    if (q) {
      const hay = `${s.scientific} ${s.morph ?? ""} ${s.family} ${s.badge}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function familyCount(list: Species[], id: FamilyFilter): number {
  return id === "all" ? list.length : list.filter((s) => familyFilterOf(s.family) === id).length;
}
