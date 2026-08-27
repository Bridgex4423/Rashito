import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

/**
 * Deploys RashitoCollection with sensible defaults you can override at deploy
 * time, e.g.:
 *
 *   npx hardhat ignition deploy ignition/modules/RashitoCollection.ts \
 *     --network sepolia \
 *     --parameters '{"RashitoCollection":{"name":"My Collection","symbol":"MYC","maxSupply":1000}}'
 *
 * Or simply edit the defaults below and run without --parameters. The
 * frontend does NOT need this script - it deploys directly from the
 * connected wallet in-browser (see src/lib/web3/contract.ts). This module is
 * for scripted/CI deploys and for verifying the contract source on Etherscan.
 */
export default buildModule("RashitoCollection", (m) => {
  const name = m.getParameter("name", "My Rashito Collection");
  const symbol = m.getParameter("symbol", "RASH");
  const maxSupply = m.getParameter("maxSupply", 1000n);
  const mintPrice = m.getParameter("mintPrice", parseEther("0.01"));
  const maxPerWallet = m.getParameter("maxPerWallet", 10n);
  const unrevealedURI = m.getParameter("unrevealedURI", "ipfs://<placeholder-cid>/unrevealed.json");
  const royaltyReceiver = m.getParameter("royaltyReceiver", m.getAccount(0));
  const royaltyFeeBps = m.getParameter("royaltyFeeBps", 500n);
  const owner = m.getParameter("owner", m.getAccount(0));

  const collection = m.contract("RashitoCollection", [
    name,
    symbol,
    maxSupply,
    mintPrice,
    maxPerWallet,
    unrevealedURI,
    royaltyReceiver,
    royaltyFeeBps,
    owner,
  ]);

  return { collection };
});
