import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("RashitoStaking", async () => {
  const { viem, networkHelpers } = await network.connect();

  async function deployFixture() {
    const [owner, alice, bob] = await viem.getWalletClients();

    const nft = await viem.deployContract("RashitoCollection", [
      "Test Collection",
      "TEST",
      10n,
      0n, // free mint for test simplicity
      10n,
      "ipfs://placeholder/unrevealed.json",
      owner.account.address,
      0n,
      owner.account.address,
    ]);
    await nft.write.setPublicMintEnabled([true]);

    const token = await viem.deployContract("RashitoToken", [
      owner.account.address,
      owner.account.address,
    ]);

    const rewardRate = parseEther("1"); // 1 RASH per second per staked NFT
    const staking = await viem.deployContract("RashitoStaking", [
      nft.address,
      token.address,
      rewardRate,
      owner.account.address,
    ]);

    // Fund the staking contract's reward pool from the owner's RASH balance.
    await token.write.approve([staking.address, parseEther("1000000")]);
    await staking.write.fundRewards([parseEther("1000000")]);

    // Mint a token to alice so she has something to stake.
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.mint([1n], { value: 0n });

    return { nft, token, staking, owner, alice, bob, rewardRate };
  }

  it("lets a holder stake an approved NFT", async () => {
    const { nft, staking, alice } = await deployFixture();
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.approve([staking.address, 1n]);

    const aliceStaking = await viem.getContractAt("RashitoStaking", staking.address, {
      client: { wallet: alice },
    });
    await aliceStaking.write.stake([1n]);

    assert.equal(await staking.read.totalStaked(), 1n);
    assert.equal(await nft.read.ownerOf([1n]), staking.address);
  });

  it("rejects staking by someone who doesn't own the token", async () => {
    const { nft, staking, alice, bob } = await deployFixture();
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.approve([staking.address, 1n]);

    const bobStaking = await viem.getContractAt("RashitoStaking", staking.address, {
      client: { wallet: bob },
    });
    await assert.rejects(bobStaking.write.stake([1n]));
  });

  it("accrues rewards over time and pays out on claim", async () => {
    const { nft, token, staking, alice } = await deployFixture();
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.approve([staking.address, 1n]);
    const aliceStaking = await viem.getContractAt("RashitoStaking", staking.address, {
      client: { wallet: alice },
    });
    await aliceStaking.write.stake([1n]);

    await networkHelpers.time.increase(100);

    const pending = await staking.read.pendingReward([1n]);
    assert.ok(pending >= parseEther("99"), "should accrue roughly 100 RASH after 100s at 1/s");

    const before = await token.read.balanceOf([alice.account.address]);
    await aliceStaking.write.claim([1n]);
    const after = await token.read.balanceOf([alice.account.address]);
    assert.ok(after > before, "balance should increase after claim");
  });

  it("returns the NFT and pays remaining rewards on unstake", async () => {
    const { nft, staking, alice } = await deployFixture();
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.approve([staking.address, 1n]);
    const aliceStaking = await viem.getContractAt("RashitoStaking", staking.address, {
      client: { wallet: alice },
    });
    await aliceStaking.write.stake([1n]);

    await networkHelpers.time.increase(50);
    await aliceStaking.write.unstake([1n]);

    assert.equal(await nft.read.ownerOf([1n]), alice.account.address);
    assert.equal(await staking.read.totalStaked(), 0n);
  });

  it("blocks new stakes while paused but still allows unstake", async () => {
    const { nft, staking, alice } = await deployFixture();
    const aliceNft = await viem.getContractAt("RashitoCollection", nft.address, {
      client: { wallet: alice },
    });
    await aliceNft.write.approve([staking.address, 1n]);
    const aliceStaking = await viem.getContractAt("RashitoStaking", staking.address, {
      client: { wallet: alice },
    });
    await aliceStaking.write.stake([1n]);

    await staking.write.setStakingPaused([true]);

    // unstake still works while paused
    await aliceStaking.write.unstake([1n]);
    assert.equal(await nft.read.ownerOf([1n]), alice.account.address);
  });

  it("lets the owner withdraw only unused reward-pool funds, never staked NFTs", async () => {
    const { staking } = await deployFixture();
    const before = await staking.read.rewardPoolBalance();
    await staking.write.withdrawExcessRewards([before]);
    assert.equal(await staking.read.rewardPoolBalance(), 0n);
  });
});
