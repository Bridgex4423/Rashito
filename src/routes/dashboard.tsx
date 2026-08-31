import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Layers, Images, Rocket, FileClock, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { SiteHeader, ConnectWallet } from "@/components/site-header";
import { NftCanvas } from "@/components/nft-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { actions, useAppState, useMounted } from "@/lib/store";
import { CHAINS, STEPS, type ChainId } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — Rashito" },
      {
        name: "description",
        content: "Manage your NFT projects, generated collections and deployments.",
      },
      { property: "og:title", content: "Creator Dashboard — Rashito" },
      {
        property: "og:description",
        content: "Manage NFT projects, generation runs and on-chain deployments.",
      },
    ],
  }),
  component: Dashboard,
});

function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [chain, setChain] = useState<ChainId>("base");
  const [size, setSize] = useState(1000);
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New NFT project</DialogTitle>
          <DialogDescription>
            Start a collection. You can change everything later in the studio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="np-name">Collection name</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rashito Ronin"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="np-symbol">Symbol</Label>
              <Input
                id="np-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="RONIN"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="np-size">Collection size</Label>
              <Input
                id="np-size"
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Blockchain</Label>
            <Select value={chain} onValueChange={(v) => setChain(v as ChainId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.testnet ? " (testnet)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="np-desc">Description</Label>
            <Textarea
              id="np-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!name.trim()) {
                toast.error("Give your collection a name");
                return;
              }
              const p = actions.createProject({
                name: name.trim(),
                symbol: symbol || "RASH",
                description,
                chain,
                size,
              });
              setOpen(false);
              toast.success("Project created — opening Creator Studio");
              navigate({ to: "/studio/$id", params: { id: p.id } });
            }}
          >
            Create & open studio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { projects } = useAppState();
  const { address, isConnected } = useAccount();
  const mounted = useMounted();

  const generated = projects.reduce((s, p) => s + p.nfts.length, 0);
  const deployed = projects.filter((p) => p.deployment).length;
  const drafts = projects.filter((p) => !p.deployment).length;

  if (!mounted)
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Wallet />
          </span>
          <h1 className="text-2xl font-bold">Connect your wallet</h1>
          <p className="text-sm text-muted-foreground">
            Your wallet is your Rashito identity. Connect to open your dashboard and creator studio.
          </p>
          <ConnectWallet full />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My NFT Projects</h1>
            <p className="mt-1 text-muted-foreground">
              Everything you build autosaves to this browser.
            </p>
          </div>
          <NewProjectDialog />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Layers} label="Collections created" value={projects.length} />
          <Stat icon={Images} label="NFTs generated" value={generated} />
          <Stat icon={Rocket} label="Collections deployed" value={deployed} />
          <Stat icon={FileClock} label="Draft projects" value={drafts} />
        </div>

        <h2 className="mt-12 text-xl font-semibold">Recently created</h2>
        {projects.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <p className="font-medium">No projects yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first collection to open the studio wizard.
              </p>
              <NewProjectDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} className="overflow-hidden p-0">
                <div className="relative">
                  {p.nfts[0] ? (
                    <NftCanvas project={p} traits={p.nfts[0].traits} className="rounded-none" />
                  ) : p.logo ? (
                    <img src={p.logo} alt={p.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="grid aspect-square place-items-center checker text-sm text-muted-foreground">
                      No preview yet
                    </div>
                  )}
                  <Badge
                    className="absolute right-3 top-3"
                    variant={p.deployment ? "default" : "secondary"}
                  >
                    {p.deployment
                      ? p.minted > 0
                        ? "Minting"
                        : "Deployed"
                      : `Step ${p.step + 1}: ${STEPS[p.step]}`}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    {p.name}
                    <span className="text-xs font-normal text-muted-foreground">
                      {CHAINS.find((c) => c.id === p.chain)?.name}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-5">
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <div className="text-foreground">{p.size}</div>size
                    </div>
                    <div>
                      <div className="text-foreground">{p.nfts.length}</div>generated
                    </div>
                    <div>
                      <div className="text-foreground">{p.minted}</div>minted
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/studio/$id" params={{ id: p.id }}>
                        Open studio
                      </Link>
                    </Button>
                    {p.deployment ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link to="/collection/$id" params={{ id: p.id }}>
                          Collection
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
