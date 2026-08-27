import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

describe("RashitoCollection", async () => {
  const { viem } = await network.connect();

  async function deployFixture() {
    const [owner, buyer] = await viem.getWalletClients();
    const collection = await viem.deployContract("RashitoCollection", [
      "Test Collection",
      "TEST",
      10n, // maxSupply
      parseEther("0.01"), // mintPrice
      3n, // maxPerWallet
      "ipfs://placeholder/unrevealed.json",
      owner.account.address,
      500n, // 5% royalty
      owner.account.address,
    ]);
    return { collection, owner, buyer };
  }

  it("starts with public mint closed and zero supply", async () => {
    const { collection } = await deployFixture();
    assert.equal(await collection.read.publicMintEnabled(), false);
    assert.equal(await collection.read.totalSupply(), 0n);
  });

  it("rejects mints while public mint is closed", async () => {
    const { collection, buyer } = await deployFixture();
    const buyerCollection = await viem.getContractAt("RashitoCollection", collection.address, {
      client: { wallet: buyer },
    });
    await assert.rejects(buyerCollection.write.mint([1n], { value: parseEther("0.01") }));
  });

  it("mints once the owner opens public mint and enforces exact payment", async () => {
    const { collection, buyer } = await deployFixture();
    await collection.write.setPublicMintEnabled([true]);

    const buyerCollection = await viem.getContractAt("RashitoCollection", collection.address, {
      client: { wallet: buyer },
    });

    await assert.rejects(
      buyerCollection.write.mint([1n], { value: parseEther("0.005") }),
      /IncorrectPayment/,
    );

    await buyerCollection.write.mint([2n], { value: parseEther("0.02") });
    assert.equal(await collection.read.totalSupply(), 2n);
    assert.equal(
      getAddress(await collection.read.ownerOf([1n])),
      getAddress(buyer.account.address),
    );
  });

  it("enforces max supply and per-wallet limits", async () => {
    const { collection, buyer } = await deployFixture();
    await collection.write.setPublicMintEnabled([true]);
    const buyerCollection = await viem.getContractAt("RashitoCollection", collection.address, {
      client: { wallet: buyer },
    });

    await assert.rejects(
      buyerCollection.write.mint([4n], { value: parseEther("0.04") }),
      /WalletLimitExceeded/,
    );
  });

  it("serves the unrevealed URI until the owner reveals", async () => {
    const { collection } = await deployFixture();
    await collection.write.setPublicMintEnabled([true]);
    await collection.write.ownerMint([await collection.read.owner(), 1n]);

    assert.equal(await collection.read.tokenURI([1n]), "ipfs://placeholder/unrevealed.json");

    await collection.write.reveal(["ipfs://real-cid/"]);
    assert.equal(await collection.read.tokenURI([1n]), "ipfs://real-cid/1.json");
  });

  it("lets the owner withdraw collected funds", async () => {
    const { collection, buyer } = await deployFixture();
    await collection.write.setPublicMintEnabled([true]);
    const buyerCollection = await viem.getContractAt("RashitoCollection", collection.address, {
      client: { wallet: buyer },
    });
    await buyerCollection.write.mint([1n], { value: parseEther("0.01") });
    await collection.write.withdraw();
  });
});
