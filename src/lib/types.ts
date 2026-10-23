export type ChainId = "ethereum" | "base" | "polygon" | "bnb" | "sepolia" | "base-sepolia";

export const CHAINS: {
  id: ChainId;
  name: string;
  symbol: string;
  testnet: boolean;
  explorer: string;
}[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    testnet: false,
    explorer: "https://etherscan.io",
  },
  { id: "base", name: "Base", symbol: "ETH", testnet: false, explorer: "https://basescan.org" },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "POL",
    testnet: false,
    explorer: "https://polygonscan.com",
  },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", testnet: false, explorer: "https://bscscan.com" },
  {
    id: "sepolia",
    name: "Sepolia Testnet",
    symbol: "ETH",
    testnet: true,
    explorer: "https://sepolia.etherscan.io",
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    symbol: "ETH",
    testnet: true,
    explorer: "https://sepolia.basescan.org",
  },
];

export const RARITY_TIERS = [
  { name: "Mythic", weight: 1 },
  { name: "Legendary", weight: 3 },
  { name: "Epic", weight: 8 },
  { name: "Rare", weight: 15 },
  { name: "Uncommon", weight: 30 },
  { name: "Common", weight: 60 },
] as const;

/** Steps for the non-layered "AI variations" mode. */
export const IMPORT_STEPS = ["Details", "Import", "Upload", "Deploy", "Mint"] as const;

export function stepsFor(p: { mode?: CreationMode | undefined }): readonly string[] {
  return p.mode === "imported" ? IMPORT_STEPS : STEPS;
}

export interface Trait {
  id: string;
  name: string;
  image?: string | undefined;
  color: string;
  weight: number;
  maxSupply?: number | undefined;
  description?: string | undefined;
}

export interface Layer {
  id: string;
  name: string;
  enabled: boolean;
  traits: Trait[];
}

export interface Rule {
  id: string;
  type: "exclude" | "require";
  a: string; // trait id
  b: string; // trait id
}

export interface Nft {
  tokenId: number;
  name: string;
  /** Imported (non-layered) collections store explicit attributes per token. */
  attributes?: { trait_type: string; value: string }[] | undefined;
  /** Imported collections: CID of this token's own image on IPFS. */
  imageCid?: string | undefined;
  traits: { layerId: string; traitId: string }[];
  locked: string[]; // layer ids
  rarityScore: number;
}

export interface Deployment {
  address: string;
  txHash: string;
  chain: ChainId;
  deployedAt: string;
  mintPrice: string;
  publicMint: boolean;
  paused: boolean;
}

export interface UploadInfo {
  imageCid: string;
  metadataCid: string;
  baseUri: string;
  uploadedAt: string;
}

/** Source of a non-layered ("AI variations") collection. Images are hosted on IPFS already. */
export interface ImportedSource {
  /** Folder CID when images were pre-hosted (advanced); empty when each token has its own imageCid. */
  imageCid: string;
  ext: string; // png | jpg | webp
  gateway: string;
  namePattern: string; // e.g. "Rashito Genesis #{id}"
  baseAttributes: { trait_type: string; value: string }[];
}

export type CreationMode = "layered" | "imported";

export interface Project {
  id: string;
  mode?: CreationMode | undefined;
  imported?: ImportedSource | undefined;
  name: string;
  symbol: string;
  description: string;
  logo?: string | undefined;
  banner?: string | undefined;
  base?: string | undefined;
  chain: ChainId;
  standard: "ERC-721" | "ERC-1155";
  size: number;
  royalty: number;
  wallet: string;
  website: string;
  twitter: string;
  discord: string;
  layers: Layer[];
  rules: Rule[];
  nfts: Nft[];
  upload?: UploadInfo | undefined;
  deployment?: Deployment | undefined;
  minted: number;
  holders: number;
  step: number;
  createdAt: string;
  updatedAt: string;
}

export const STEPS = [
  "Details",
  "Base",
  "Layers",
  "Traits",
  "Rarity",
  "Generate",
  "Review",
  "Upload",
  "Deploy",
  "Mint",
] as const;
