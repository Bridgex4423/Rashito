import type { ChainId } from "@/lib/types";

/**
 * The ONE canonical, deployed Rashito NFT collection that staking (and any
 * other "official collection" feature) points at - as opposed to the
 * Studio, where each creator deploys and owns their own separate contract.
 *
 * Starts empty. Fill in after deploying your official collection (e.g.
 * Rashito Genesis) through the Studio: copy its contract address and chain
 * here, commit, and redeploy the site.
 */
export const OFFICIAL_COLLECTION: { address: `0x${string}` | ""; chain: ChainId } = {
  address: "",
  chain: "base",
};

export const OFFICIAL_COLLECTION_IS_LIVE = OFFICIAL_COLLECTION.address.length > 0;
