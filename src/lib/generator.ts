import type { Layer, Nft, Project, Rule, Trait } from "./types";

export function activeLayers(p: Project): Layer[] {
  return p.layers.filter((l) => l.enabled && l.traits.length > 0);
}

export function totalCombinations(p: Project): number {
  return activeLayers(p).reduce((acc, l) => acc * l.traits.length, 1);
}

export function traitProbability(layer: Layer, trait: Trait): number {
  const total = layer.traits.reduce((s, t) => s + Math.max(0, t.weight), 0);
  return total > 0 ? (Math.max(0, trait.weight) / total) * 100 : 0;
}

function pick(layer: Layer): Trait {
  const total = layer.traits.reduce((s, t) => s + Math.max(0, t.weight), 0);
  let r = Math.random() * (total || 1);
  for (const t of layer.traits) {
    r -= Math.max(0, t.weight);
    if (r <= 0) return t;
  }
  return layer.traits[layer.traits.length - 1]!;
}

export function violatesRules(traitIds: string[], rules: Rule[]): boolean {
  const set = new Set(traitIds);
  for (const r of rules) {
    if (r.type === "exclude" && set.has(r.a) && set.has(r.b)) return true;
    if (r.type === "require" && set.has(r.a) && !set.has(r.b)) return true;
  }
  return false;
}

export function rarityScore(p: Project, traits: Nft["traits"]): number {
  let score = 0;
  for (const t of traits) {
    const layer = p.layers.find((l) => l.id === t.layerId);
    const trait = layer?.traits.find((x) => x.id === t.traitId);
    if (!layer || !trait) continue;
    const prob = traitProbability(layer, trait);
    score += prob > 0 ? 100 / prob : 100;
  }
  return Math.round(score * 100) / 100;
}

export function rarityTier(score: number, max: number, min = 0): string {
  const pct = max > min ? (score - min) / (max - min) : 0;
  if (pct > 0.85) return "Mythic";
  if (pct > 0.7) return "Legendary";
  if (pct > 0.55) return "Epic";
  if (pct > 0.4) return "Rare";
  if (pct > 0.25) return "Uncommon";
  return "Common";
}

export function randomCombination(p: Project): Nft["traits"] {
  const layers = activeLayers(p);
  for (let attempt = 0; attempt < 200; attempt++) {
    const combo = layers.map((l) => ({ layerId: l.id, traitId: pick(l).id }));
    if (
      !violatesRules(
        combo.map((c) => c.traitId),
        p.rules,
      )
    )
      return combo;
  }
  return layers.map((l) => ({ layerId: l.id, traitId: l.traits[0]!.id }));
}

export interface GenerateResult {
  nfts: Nft[];
  duplicatesSkipped: number;
}

export function generateCollection(p: Project, size: number): GenerateResult {
  const layers = activeLayers(p);
  const nfts: Nft[] = [];
  const seen = new Set<string>();
  let duplicatesSkipped = 0;
  const maxAttempts = size * 40 + 500;
  let attempts = 0;

  while (nfts.length < size && attempts < maxAttempts) {
    attempts++;
    const combo = layers.map((l) => ({ layerId: l.id, traitId: pick(l).id }));
    const ids = combo.map((c) => c.traitId);
    if (violatesRules(ids, p.rules)) continue;
    const sig = ids.join("|");
    if (seen.has(sig)) {
      duplicatesSkipped++;
      continue;
    }
    seen.add(sig);
    const tokenId = nfts.length + 1;
    nfts.push({
      tokenId,
      name: `${p.name} #${String(tokenId).padStart(3, "0")}`,
      traits: combo,
      locked: [],
      rarityScore: rarityScore(p, combo),
    });
  }
  return { nfts, duplicatesSkipped };
}

export function buildMetadata(p: Project, nft: Nft) {
  const imageBase = p.upload?.imageCid ? `ipfs://${p.upload.imageCid}/` : "ipfs://<pending>/";
  return {
    name: nft.name,
    description: p.description,
    image: `${imageBase}${nft.tokenId}.png`,
    external_url: p.website || undefined,
    tokenId: nft.tokenId,
    attributes: nft.traits.map((t) => {
      const layer = p.layers.find((l) => l.id === t.layerId);
      const trait = layer?.traits.find((x) => x.id === t.traitId);
      return { trait_type: layer?.name ?? "Trait", value: trait?.name ?? "None" };
    }),
  };
}

export function fakeCid(seed: string) {
  let x = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    x ^= seed.charCodeAt(i);
    x = Math.imul(x, 16777619) >>> 0;
  }
  const chars = "abcdefghijklmnopqrstuvwxyz234567";
  let out = "bafybei";
  for (let i = 0; i < 45; i++) {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out += chars[x % chars.length];
  }
  return out;
}
