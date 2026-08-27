import { parseEther } from "viem";
import type { ChainId, Project } from "@/lib/types";
import { CHAIN_ID_MAP } from "@/lib/web3/config";

/** Resolves a Rashito ChainId to the viem/wagmi chain object used for deploys, reads and writes. */
export function resolveChain(chainId: ChainId) {
  return CHAIN_ID_MAP[chainId];
}

export interface DeployParams {
  name: string;
  symbol: string;
  maxSupply: number;
  mintPriceEth: string;
  maxPerWallet: number;
  unrevealedUri: string;
  royaltyReceiver: `0x${string}`;
  royaltyBps: number;
  owner: `0x${string}`;
}

/** Builds the constructor argument tuple for RashitoCollection, in ABI order. */
export function buildConstructorArgs(p: DeployParams) {
  return [
    p.name,
    p.symbol,
    BigInt(p.maxSupply),
    parseEther(p.mintPriceEth || "0"),
    BigInt(p.maxPerWallet),
    p.unrevealedUri,
    p.royaltyReceiver,
    p.royaltyBps,
    p.owner,
  ] as const;
}

/** A safe placeholder metadata URI used before the collection is uploaded/revealed. */
export function unrevealedUriFor(project: Project) {
  if (project.upload?.metadataCid) {
    return `ipfs://${project.upload.metadataCid}/unrevealed.json`;
  }
  return "ipfs://bafkreiabuhpevblwud5jjbmls7ka3verxjxdrwuo3bmnqfamqbyquch3f4/unrevealed.json";
}
