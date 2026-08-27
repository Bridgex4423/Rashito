import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys the fixed-supply RASH token, minting the full 1,000,000,000 RASH to
 * the treasury address of your choice.
 *
 *   npx hardhat ignition deploy ignition/modules/RashitoToken.ts \
 *     --network sepolia \
 *     --parameters '{"RashitoToken":{"treasury":"0xYourTreasuryAddress"}}'
 *
 * Like the NFT collection, the app can also deploy this directly from your
 * connected wallet in-browser - see src/lib/web3/token-artifact.ts. This
 * module is for scripted/CI deploys and Etherscan verification.
 */
export default buildModule("RashitoToken", (m) => {
  const treasury = m.getParameter("treasury", m.getAccount(0));
  const owner = m.getParameter("owner", m.getAccount(0));

  const token = m.contract("RashitoToken", [treasury, owner]);

  return { token };
});
