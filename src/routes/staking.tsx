import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Gem, Loader2, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { ConnectWallet, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHAINS } from "@/lib/types";
import { OFFICIAL_COLLECTION, OFFICIAL_COLLECTION_IS_LIVE } from "@/lib/official-collection";
import { OFFICIAL_STAKING, OFFICIAL_STAKING_IS_LIVE } from "@/lib/official-staking";
import { resolveChain } from "@/lib/web3/contract";
import { RASHITO_COLLECTION_ABI } from "@/lib/web3/contract-artifact";
import { RASHITO_STAKING_ABI } from "@/lib/web3/staking-artifact";

export const Route = createFileRoute("/staking")({
  head: () => ({
    meta: [
      { title: "Staking — Rashito" },
      {
        name: "description",
        content:
          "Stake your Rashito NFTs to earn RASH token rewards, straight from your own wallet.",
      },
    ],
  }),
  component: StakingPage,
});

function ComingSoon() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Staking opens once the official collection is live
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Staking pays out RASH rewards for holders of Rashito's official NFT collection. That
          collection and its staking contract haven't been deployed yet.
        </p>
        <p>
          Project owner: deploy the official collection and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">RashitoStaking.sol</code>{" "}
          (see{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            contracts/README.md
          </code>
          ), then fill in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            src/lib/official-collection.ts
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            src/lib/official-staking.ts
          </code>
          .
        </p>
        <Button asChild variant="secondary" size="sm">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StakingLive() {
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const targetChain = resolveChain(OFFICIAL_STAKING.chain);
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync } = useWriteContract();
  const chainInfo = CHAINS.find((c) => c.id === OFFICIAL_STAKING.chain)!;

  const stakingAddress = OFFICIAL_STAKING.address as `0x${string}`;
  const nftAddress = OFFICIAL_COLLECTION.address as `0x${string}`;

  const [tokenIdInput, setTokenIdInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: totalStaked } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "totalStaked",
    chainId: targetChain.id,
    query: { refetchInterval: 15_000 },
  });
  const { data: rewardRate } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "rewardRatePerSecond",
    chainId: targetChain.id,
  });
  const { data: poolBalance } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "rewardPoolBalance",
    chainId: targetChain.id,
    query: { refetchInterval: 20_000 },
  });
  const { data: stakingPaused } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "stakingPaused",
    chainId: targetChain.id,
  });
  const { data: myStakedTokens, refetch: refetchMyTokens } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "stakedTokensOf",
    args: address ? [address] : undefined,
    chainId: targetChain.id,
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
  const { data: myPendingTotal, refetch: refetchPending } = useReadContract({
    address: stakingAddress,
    abi: RASHITO_STAKING_ABI,
    functionName: "pendingRewardOf",
    args: address ? [address] : undefined,
    chainId: targetChain.id,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const dailyRatePerNft = rewardRate !== undefined ? rewardRate * 86400n : 0n;

  const ensureRightNetwork = async () => {
    const currentChainId = await publicClient!.getChainId();
    if (currentChainId !== targetChain.id) {
      setBusy("Switching network…");
      await switchChainAsync({ chainId: targetChain.id });
    }
  };

  const stakeToken = async () => {
    const tokenId = BigInt(tokenIdInput || "0");
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!tokenIdInput || tokenId <= 0n) {
      toast.error("Enter a valid token ID");
      return;
    }
    try {
      await ensureRightNetwork();

      setBusy("Checking ownership…");
      const owner = await publicClient!.readContract({
        address: nftAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "ownerOf",
        args: [tokenId],
      });
      if (owner.toLowerCase() !== address.toLowerCase()) {
        toast.error("That token isn't owned by your connected wallet");
        setBusy(null);
        return;
      }

      const approved = await publicClient!.readContract({
        address: nftAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "getApproved",
        args: [tokenId],
      });
      if (approved.toLowerCase() !== stakingAddress.toLowerCase()) {
        setBusy("Approving the staking contract in your wallet…");
        const approveHash = await writeContractAsync({
          address: nftAddress,
          abi: RASHITO_COLLECTION_ABI,
          functionName: "approve",
          args: [stakingAddress, tokenId],
          chainId: targetChain.id,
        });
        await publicClient!.waitForTransactionReceipt({ hash: approveHash });
      }

      setBusy("Confirm the stake transaction in your wallet…");
      const stakeHash = await writeContractAsync({
        address: stakingAddress,
        abi: RASHITO_STAKING_ABI,
        functionName: "stake",
        args: [tokenId],
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash: stakeHash });
      await refetchMyTokens();
      toast.success(`Staked #${tokenId}`);
      setTokenIdInput("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Stake failed");
    } finally {
      setBusy(null);
    }
  };

  const claimOne = async (tokenId: bigint) => {
    try {
      await ensureRightNetwork();
      setBusy(`Confirm claim for #${tokenId}…`);
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: RASHITO_STAKING_ABI,
        functionName: "claim",
        args: [tokenId],
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchPending();
      toast.success(`Claimed rewards for #${tokenId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setBusy(null);
    }
  };

  const claimAll = async () => {
    if (!myStakedTokens || myStakedTokens.length === 0) return;
    try {
      await ensureRightNetwork();
      setBusy("Confirm claim-all in your wallet…");
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: RASHITO_STAKING_ABI,
        functionName: "claimBatch",
        args: [myStakedTokens as readonly bigint[]],
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchPending();
      toast.success("Claimed all pending rewards");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setBusy(null);
    }
  };

  const unstakeOne = async (tokenId: bigint) => {
    try {
      await ensureRightNetwork();
      setBusy(`Confirm unstake for #${tokenId}…`);
      const hash = await writeContractAsync({
        address: stakingAddress,
        abi: RASHITO_STAKING_ABI,
        functionName: "unstake",
        args: [tokenId],
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchMyTokens();
      toast.success(`Unstaked #${tokenId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unstake failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gem className="size-4" /> Total staked
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalStaked?.toString() ?? "–"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-4" /> Reward rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatEther(dailyRatePerNft)}{" "}
            <span className="text-sm text-muted-foreground">RASH/day/NFT</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reward pool</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {poolBalance !== undefined ? formatEther(poolBalance) : "–"}{" "}
            <span className="text-sm text-muted-foreground">RASH</span>
          </CardContent>
        </Card>
      </div>

      {stakingPaused ? (
        <p className="mt-4 text-sm text-muted-foreground">
          New staking is currently paused. Existing stakers can still claim and unstake.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4" /> Stake an NFT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter the token ID of a Rashito collection NFT you own on {chainInfo.name}.
            </p>
            {!isConnected ? (
              <ConnectWallet full />
            ) : busy ? (
              <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> {busy}
              </p>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder="Token ID"
                  value={tokenIdInput}
                  onChange={(e) => setTokenIdInput(e.target.value)}
                />
                <Button onClick={stakeToken} disabled={!!stakingPaused}>
                  <Lock /> Approve &amp; Stake
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Staking is two transactions the first time: approve, then stake. Each is signed by
              your wallet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Unlock className="size-4" /> Your staked NFTs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isConnected ? (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to see your staked NFTs.
              </p>
            ) : !myStakedTokens || myStakedTokens.length === 0 ? (
              <p className="text-sm text-muted-foreground">You don't have any NFTs staked yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>
                    Pending:{" "}
                    <span className="font-mono">
                      {myPendingTotal !== undefined ? formatEther(myPendingTotal) : "0"} RASH
                    </span>
                  </span>
                  <Button size="sm" onClick={claimAll} disabled={!!busy}>
                    Claim all
                  </Button>
                </div>
                <div className="space-y-2">
                  {(myStakedTokens as readonly bigint[]).map((tokenId) => (
                    <div
                      key={tokenId.toString()}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="font-mono">#{tokenId.toString()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => claimOne(tokenId)}
                          disabled={!!busy}
                        >
                          Claim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unstakeOne(tokenId)}
                          disabled={!!busy}
                        >
                          Unstake
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StakingPage() {
  const live = OFFICIAL_COLLECTION_IS_LIVE && OFFICIAL_STAKING_IS_LIVE;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <Badge variant="outline" className="mb-4">
          Staking
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Stake NFTs, earn RASH</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Stake your Rashito collection NFTs directly from your wallet to earn RASH token rewards
          over time. Nothing is custodial - your NFT sits in the staking contract's escrow, and you
          can unstake it back to your wallet whenever you want.
        </p>
        <div className="mt-8">{live ? <StakingLive /> : <ComingSoon />}</div>
      </section>
      <SiteFooter />
    </div>
  );
}
