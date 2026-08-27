import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

describe("RashitoToken", async () => {
  const { viem } = await network.connect();

  async function deployFixture() {
    const [owner, treasury, other] = await viem.getWalletClients();
    const token = await viem.deployContract("RashitoToken", [
      treasury.account.address,
      owner.account.address,
    ]);
    return { token, owner, treasury, other };
  }

  it("mints the full fixed supply to the treasury at deployment", async () => {
    const { token, treasury } = await deployFixture();
    const supply = await token.read.totalSupply();
    assert.equal(supply, parseEther("1000000000"));
    assert.equal(await token.read.balanceOf([treasury.account.address]), supply);
  });

  it("has no further mint function - supply is fixed forever", async () => {
    const { token } = await deployFixture();
    assert.equal(
      (token.abi as { name?: string }[]).some((f) => f.name === "mint"),
      false,
    );
  });

  it("lets holders transfer and burn their own tokens", async () => {
    const { token, treasury, other } = await deployFixture();
    const treasuryToken = await viem.getContractAt("RashitoToken", token.address, {
      client: { wallet: treasury },
    });

    await treasuryToken.write.transfer([other.account.address, parseEther("1000")]);
    assert.equal(await token.read.balanceOf([other.account.address]), parseEther("1000"));

    const otherToken = await viem.getContractAt("RashitoToken", token.address, {
      client: { wallet: other },
    });
    await otherToken.write.burn([parseEther("400")]);
    assert.equal(await token.read.balanceOf([other.account.address]), parseEther("600"));
    assert.equal(await token.read.totalSupply(), parseEther("1000000000") - parseEther("400"));
  });

  it("rejects deployment with a zero-address treasury", async () => {
    const [owner] = await viem.getWalletClients();
    await assert.rejects(
      viem.deployContract("RashitoToken", [
        "0x0000000000000000000000000000000000000000",
        owner.account.address,
      ]),
    );
  });

  it("lets the owner rescue foreign ERC-20 tokens sent to the contract by mistake", async () => {
    const { token, owner, treasury, other } = await deployFixture();
    const treasuryToken = await viem.getContractAt("RashitoToken", token.address, {
      client: { wallet: treasury },
    });

    // Deploy a second token to simulate a foreign ERC-20 landing in the contract.
    const stray = await viem.deployContract("RashitoToken", [
      treasury.account.address,
      owner.account.address,
    ]);
    const strayFromTreasury = await viem.getContractAt("RashitoToken", stray.address, {
      client: { wallet: treasury },
    });
    await strayFromTreasury.write.transfer([token.address, parseEther("50")]);

    await token.write.rescueERC20([stray.address, other.account.address, parseEther("50")]);
    assert.equal(getAddress(other.account.address), getAddress(other.account.address));
  });
});
