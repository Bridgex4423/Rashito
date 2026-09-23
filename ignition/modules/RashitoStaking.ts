import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys the staking contract for a given NFT collection + reward token
 * pair.
 *
 *   npx hardhat ignition deploy ignition/modules/RashitoStaking.ts \
 *     --network sepolia \
 *     --parameters '{"RashitoStaking":{"nft":"0xYourCollection","rewardToken":"0xYourRashToken","rewardRatePerSecond":"11574074074074"}}'
 *
 * rewardRatePerSecond is in the reward token's smallest unit (wei). The
 * example above is roughly 1 RASH/day per staked NFT (1e18 / 86400).
 *
 * The app can also deploy this directly from the connected wallet in-browser
 * - see src/lib/web3/staking-artifact.ts. This module is for scripted
 * deploys and Etherscan verification.
 */
export default buildModule("RashitoStaking", (m) => {
  const nft = m.getParameter("nft");
  const rewardToken = m.getParameter("rewardToken");
  const rewardRatePerSecond = m.getParameter("rewardRatePerSecond", 0n);
  const owner = m.getParameter("owner", m.getAccount(0));

  const staking = m.contract("RashitoStaking", [nft, rewardToken, rewardRatePerSecond, owner]);

  return { staking };
});
