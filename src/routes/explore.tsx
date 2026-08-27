import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { NftCanvas } from "@/components/nft-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppState, useMounted, shortAddress } from "@/lib/store";
import { CHAINS } from "@/lib/types";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Collections — Rashito" },
      {
        name: "description",
        content: "Discover generative NFT collections created and deployed with Rashito.",
      },
      { property: "og:title", content: "Explore Collections — Rashito" },
      {
        property: "og:description",
        content: "Discover generative NFT collections launched on Rashito.",
      },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { projects } = useAppState();
  const mounted = useMounted();
  const published = projects.filter((p) => p.deployment);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Collection Explorer</h1>
        <p className="mt-2 text-muted-foreground">Public collections deployed through Rashito.</p>

        {!mounted ? null : published.length === 0 ? (
          <Card className="mt-8 flex flex-col items-center gap-4 p-12 text-center">
            <Compass className="size-8 text-primary" />
            <div>
              <p className="font-semibold">No public collections yet</p>
              <p className="text-sm text-muted-foreground">
                Deploy a collection and it will appear here.
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard">Launch Creator Studio</Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((p) => (
              <Link key={p.id} to="/collection/$id" params={{ id: p.id }}>
                <Card className="overflow-hidden p-0 transition-transform hover:-translate-y-1">
                  {p.nfts[0] ? (
                    <NftCanvas project={p} traits={p.nfts[0].traits} className="rounded-none" />
                  ) : (
                    <div className="aspect-square checker" />
                  )}
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{p.name}</h2>
                      <Badge variant="secondary">
                        {CHAINS.find((c) => c.id === p.chain)?.name}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      by {shortAddress(p.wallet)}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Supply {p.size}</span>
                      <span>{p.minted} minted</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
