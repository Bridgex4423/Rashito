import type { ChainId } from "@/lib/types";

/**
 * The deployed RashitoStaking contract that /staking reads from. Starts
 * empty - see contracts/README.md ("Staking") for the deploy flow, or use
 * the "Deploy Staking Contract" button on /dashboard once you've deployed
 * both your official NFT collection (src/lib/official-collection.ts) and
 * the RASH token (src/lib/official-token.ts).
 */
export const OFFICIAL_STAKING: { address: `0x${string}` | ""; chain: ChainId } = {
  address: "",
  chain: "base",
};

export const OFFICIAL_STAKING_IS_LIVE = OFFICIAL_STAKING.address.length > 0;
