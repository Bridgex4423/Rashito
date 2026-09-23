import type { ChainId } from "@/lib/types";

/**
 * The deployed RASH token contract, read by the /tokenomics page once you've
 * deployed it. Starts empty - see contracts/README.md ("RASH Token") for the
 * Hardhat deploy flow.
 */
export const OFFICIAL_TOKEN: { address: `0x${string}` | ""; chain: ChainId } = {
  address: "",
  chain: "base",
};

export const OFFICIAL_TOKEN_IS_LIVE = OFFICIAL_TOKEN.address.length > 0;
