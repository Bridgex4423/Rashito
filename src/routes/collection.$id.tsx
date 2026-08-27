import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Pause, Play, Wallet2 } from "lucide-react";
import { toast } from "sonner";
import { type Address } from "viem";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { SiteHeader } from "@/components/site-header";
import { NftCanvas } from "@/components/nft-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shortAddress, useAppState, useMounted } from "@/lib/store";
import { CHAINS } from "@/lib/types";
import { RASHITO_COLLECTION_ABI } from "@/lib/web3/contract-artifact";
import { resolveChain } from "@/lib/web3/contract";

export const Route = createFileRoute("/collection/$id")({
  head: () => ({
    meta: [
      { title: "Collection — Rashito" },
      {
        name: "description",
        content: "Public collection page with supply, mint status and on-chain details.",
      },
      { property: "og:title", content: "Collection — Rashito" },
      { property: "og:description", content: "Supply, holders, mint status and contract details." },
    ],
  }),
  component: CollectionPage,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">Collection not found</h1>
        <Button asChild className="mt-4">
          <Link to="/explore">Back to explorer</Link>
        </Button>
      </div>
    </div>
  ),
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-xs">{value}</span>
    </div>
  );
}

function CollectionPage() {
  const { id } = Route.useParams();
  const { projects } = useAppState();
  const mounted = useMounted();
  const p = projects.find((x) => x.id === id);
  const { address } = useAccount();
  const targetChain = resolveChain(p?.chain ?? "base");
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync, isPending } = useWriteContract();
  const contractAddress = p?.deployment?.address as Address | undefined;

  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "totalSupply",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress, refetchInterval: 15_000 },
  });
  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "paused",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress },
  });

  if (!mounted)
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  if (!p) throw notFound();

  const chain = CHAINS.find((c) => c.id === p.chain)!;
  const d = p.deployment;
  const isOwner = !!address && !!p.wallet && address.toLowerCase() === p.wallet.toLowerCase();

  const togglePause = async () => {
    if (!contractAddress) return;
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: isPaused ? "unpause" : "pause",
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchPaused();
      toast.success(isPaused ? "Mint resumed on-chain" : "Mint paused on-chain");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  const withdraw = async () => {
    if (!contractAddress) return;
    try {
      const hash = await writeContractAsync({
        address: contractAddress,

        abi: RASHITO_COLLECTION_ABI,
        functionName: "withdraw",
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      toast.success("Funds withdrawn to the owner wallet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdraw failed");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            {p.nfts[0] ? (
              <NftCanvas project={p} traits={p.nfts[0].traits} />
            ) : (
              <div className="aspect-square rounded-xl checker" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{p.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.description || "No description provided."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{chain.name}</Badge>
              <Badge variant="secondary">{p.standard}</Badge>
              <Badge variant={d ? "default" : "outline"}>
                {d ? (isPaused ? "Mint paused" : "Mint live") : "Not deployed"}
              </Badge>
            </div>
            <Button asChild className="w-full">
              <Link to="/studio/$id" params={{ id: p.id }}>
                Manage in studio
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">On-chain details</CardTitle>
              </CardHeader>
              <CardContent>
                <Row label="Contract" value={d ? shortAddress(d.address) : "—"} />
                <Row label="Transaction" value={d ? shortAddress(d.txHash) : "—"} />
                <Row label="Network" value={chain.name} />
                <Row label="Total supply" value={p.size} />
                <Row
                  label="Minted"
                  value={totalSupply !== undefined ? Number(totalSupply) : p.minted}
                />
                <Row label="Royalty" value={`${p.royalty}%`} />
                <Row label="Mint price" value={d ? `${d.mintPrice} ${chain.symbol}` : "—"} />
                <Row label="IPFS base URI" value={p.upload?.baseUri ?? "—"} />
                <Row label="Creator" value={shortAddress(p.wallet)} />
              </CardContent>
            </Card>

            {d ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <a
                    href={`${chain.explorer}/address/${d.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink /> Block explorer
                  </a>
                </Button>
                {isOwner ? (
                  <>
                    <Button variant="outline" onClick={togglePause} disabled={isPending}>
                      {isPaused ? <Play /> : <Pause />} {isPaused ? "Resume mint" : "Pause mint"}
                    </Button>
                    <Button variant="outline" onClick={withdraw} disabled={isPending}>
                      <Wallet2 /> Withdraw funds
                    </Button>
                  </>
                ) : null}
                <Button asChild>
                  <Link to="/studio/$id" params={{ id: p.id }}>
                    Mint more NFTs
                  </Link>
                </Button>
              </div>
            ) : null}

            <div>
              <h2 className="mb-3 text-lg font-semibold">Items</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.nfts.slice(0, 12).map((n) => (
                  <div key={n.tokenId} className="space-y-1">
                    <NftCanvas project={p} traits={n.traits} />
                    <div className="text-xs text-muted-foreground">#{n.tokenId}</div>
                  </div>
                ))}
              </div>
              {p.nfts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing generated yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
