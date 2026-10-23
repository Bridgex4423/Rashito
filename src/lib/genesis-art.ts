/**
 * Preview trait pack used on the homepage showcase. Files live in
 * /public/genesis/<layer>-<id>.webp and stack bottom-to-top in LAYER_ORDER.
 * `w` is the rarity weight the pack was authored with.
 */
export type LayerKey = "background" | "cape" | "weapon" | "armor" | "helmet" | "visor" | "effects";
export type Trait = { id: string; name: string; w: number };

export const LAYER_ORDER: LayerKey[] = [
  "background",
  "cape",
  "weapon",
  "armor",
  "helmet",
  "visor",
  "effects",
];

export const GENESIS: Record<LayerKey, Trait[]> = {
  background: [
    { id: "bamboo-mist-moon", name: "Bamboo Mist Moon", w: 15 },
    { id: "moonlit-torii-falls", name: "Moonlit Torii Falls", w: 30 },
    { id: "snowy-temple", name: "Snowy Temple", w: 15 },
  ],
  cape: [
    { id: "midnight-navy-pattern", name: "Midnight Navy Pattern", w: 30 },
    { id: "torn-crimson", name: "Torn Crimson", w: 15 },
  ],
  weapon: [{ id: "twin-katanas-crossed", name: "Twin Katanas Crossed", w: 15 }],
  armor: [
    { id: "black-antique-gold", name: "Black Antique Gold", w: 30 },
    { id: "crimson-lacquer-bronze", name: "Crimson Lacquer Bronze", w: 15 },
    { id: "indigo-silver", name: "Indigo Silver", w: 15 },
    { id: "jade-gold", name: "Jade Gold", w: 15 },
    { id: "pearl-white-silver", name: "Pearl White Silver", w: 15 },
  ],
  helmet: [
    { id: "gold-crescent-horns", name: "Gold Crescent Horns", w: 30 },
    { id: "dragon-crest", name: "Dragon Crest", w: 15 },
    { id: "silver-antlers", name: "Silver Antlers", w: 15 },
    { id: "wolf-ears", name: "Wolf Ears", w: 15 },
    { id: "phoenix-crest", name: "Phoenix Crest", w: 6 },
  ],
  visor: [
    { id: "cyan", name: "Cyan", w: 30 },
    { id: "crimson-red", name: "Crimson Red", w: 15 },
    { id: "emerald", name: "Emerald", w: 15 },
    { id: "gold", name: "Gold", w: 15 },
    { id: "violet", name: "Violet", w: 15 },
    { id: "white-hot", name: "White-Hot", w: 6 },
  ],
  effects: [
    { id: "embers", name: "Embers", w: 10 },
    { id: "cyan-sparks", name: "Cyan Sparks", w: 10 },
    { id: "snowfall", name: "Snowfall", w: 10 },
  ],
};

/** Selected trait id per layer; null/undefined = layer empty ("None"). */
export type Combo = Partial<Record<LayerKey, string | null>>;

export const traitSrc = (layer: LayerKey, id: string) => `/genesis/${layer}-${id}.webp`;

export function rarityLabel(w: number): "Common" | "Uncommon" | "Rare" {
  if (w >= 30) return "Common";
  if (w >= 10) return "Uncommon";
  return "Rare";
}

export const traitName = (layer: LayerKey, id: string | null | undefined) =>
  id ? (GENESIS[layer].find((t) => t.id === id)?.name ?? "None") : "None";

/** Hand-picked gallery combos for the Genesis band. */
export const GALLERY: Combo[] = [
  {
    background: "moonlit-torii-falls",
    armor: "black-antique-gold",
    helmet: "gold-crescent-horns",
    visor: "cyan",
    weapon: "twin-katanas-crossed",
    cape: "torn-crimson",
  },
  {
    background: "bamboo-mist-moon",
    armor: "jade-gold",
    helmet: "silver-antlers",
    visor: "violet",
    effects: "embers",
  },
  {
    background: "snowy-temple",
    armor: "pearl-white-silver",
    helmet: "dragon-crest",
    visor: "gold",
    effects: "snowfall",
    cape: "midnight-navy-pattern",
  },
  {
    background: "moonlit-torii-falls",
    armor: "indigo-silver",
    helmet: "phoenix-crest",
    visor: "white-hot",
    effects: "cyan-sparks",
  },
  {
    background: "bamboo-mist-moon",
    armor: "crimson-lacquer-bronze",
    helmet: "wolf-ears",
    visor: "crimson-red",
    cape: "torn-crimson",
    effects: "embers",
  },
  {
    background: "snowy-temple",
    armor: "black-antique-gold",
    helmet: "dragon-crest",
    visor: "emerald",
    weapon: "twin-katanas-crossed",
  },
  {
    background: "moonlit-torii-falls",
    armor: "jade-gold",
    helmet: "gold-crescent-horns",
    visor: "gold",
    cape: "midnight-navy-pattern",
  },
  {
    background: "bamboo-mist-moon",
    armor: "indigo-silver",
    helmet: "silver-antlers",
    visor: "cyan",
    effects: "cyan-sparks",
  },
];
