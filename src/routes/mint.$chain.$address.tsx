import { createFileRoute, notFound } from "@tanstack/react-router";
import { Loader2, Rocket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatEther, isAddress, type Address } from "viem";
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
import { Progress } from "@/components/ui/progress";
import { CHAINS, type ChainId } from "@/lib/types";
import { resolveChain } from "@/lib/web3/contract";
import { RASHITO_COLLECTION_ABI } from "@/lib/web3/contract-artifact";

const CHAIN_IDS = CHAINS.map((c) => c.id);

export const Route = createFileRoute("/mint/$chain/$address")({
  head: () => ({
    meta: [
      { title: "Mint — Rashito" },
      {
        name: "description",
        content:
          "Mint directly from this collection's real on-chain contract - no account needed, just a wallet.",
      },
    ],
  }),
  loader: ({ params }) => {
    if (!CHAIN_IDS.includes(params.chain as ChainId) || !isAddress(params.address)) {
      throw notFound();
    }
    return { chain: params.chain as ChainId, address: params.address as Address };
  },
  component: PublicMintPage,
});

function PublicMintPage() {
  const { chain, address: contractAddress } = Route.useLoaderData();
  const chainInfo = CHAINS.find((c) => c.id === chain)!;
  const targetChain = resolveChain(chain);

  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync } = useWriteContract();

  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);

  const { data: name } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "name",
    chainId: targetChain.id,
  });
  const { data: symbol } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "symbol",
    chainId: targetChain.id,
  });
  const { data: maxSupply } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "maxSupply",
    chainId: targetChain.id,
  });
  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "totalSupply",
    chainId: targetChain.id,
    query: { refetchInterval: 15_000 },
  });
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "mintPrice",
    chainId: targetChain.id,
  });
  const { data: publicMintOn } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "publicMintEnabled",
    chainId: targetChain.id,
  });
  const { data: maxPerWallet } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "maxPerWallet",
    chainId: targetChain.id,
  });

  const loaded = name !== undefined && maxSupply !== undefined;
  const total = maxSupply !== undefined ? Number(maxSupply) : 0;
  const minted = totalSupply !== undefined ? Number(totalSupply) : 0;
  const remaining = Math.max(0, total - minted);
  const priceWei = mintPrice ?? 0n;

  const mint = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet to mint");
      return;
    }
    if (!publicMintOn) {
      toast.error("Public mint isn't open on this collection yet");
      return;
    }
    if (qty < 1) return;
    try {
      const currentChainId = await publicClient!.getChainId();
      if (currentChainId !== targetChain.id) {
        setBusy("Switching network…");
        await switchChainAsync({ chainId: targetChain.id });
      }
      setBusy("Confirm the mint transaction in your wallet…");
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "mint",
        args: [BigInt(qty)],
        value: priceWei * BigInt(qty),
        chainId: targetChain.id,
      });
      setBusy("Waiting for confirmation…");
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchSupply();
      toast.success(`Minted ${qty} NFT${qty > 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        {!loaded ? (
          <Card>
            <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading collection from {chainInfo.name}…
            </CardContent>
          </Card>
        ) : (
          <>
            <Badge variant="outline" className="mb-4">
              {chainInfo.name}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {symbol} · <span className="break-all">{contractAddress}</span>
            </p>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">Mint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minted</span>
                  <span className="font-mono">
                    {minted} / {total}
                  </span>
                </div>
                <Progress value={(minted / Math.max(1, total)) * 100} />
                <p className="text-sm text-muted-foreground">
                  {formatEther(priceWei)} {chainInfo.symbol} per token
                  {maxPerWallet !== undefined ? ` · max ${maxPerWallet} per wallet` : ""}.
                </p>

                {!isConnected ? (
                  <ConnectWallet full />
                ) : busy ? (
                  <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> {busy}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={remaining}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                      />
                      <Button onClick={mint} disabled={!publicMintOn || remaining <= 0}>
                        <Rocket /> Mint {qty}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatEther(priceWei * BigInt(qty))} {chainInfo.symbol} + gas.
                    </p>
                  </div>
                )}
                {!publicMintOn ? (
                  <p className="text-xs text-muted-foreground">
                    Public mint is not open on this collection right now.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Built with{" "}
              <a href="/" className="underline">
                Rashito
              </a>
              . This page reads and writes directly from the collection's smart contract - no
              account or backend involved.
            </p>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
