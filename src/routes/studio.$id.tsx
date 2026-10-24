import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Dice5,
  Download,
  Eye,
  Gift,
  ImagePlus,
  Layers as LayersIcon,
  Loader2,
  Lock,
  Plus,
  Rocket,
  Shuffle,
  Sparkles,
  Trash2,
  Unlock,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  useAccount,
  useChainId,
  useDeployContract,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { parseEther, formatEther, type Address } from "viem";
import { getPinataStatus, getUploadUrl, pinDirectory } from "@/lib/pinata.functions";
import { renderNft } from "@/lib/render-nft";
import { parseAttributeSheet, type CsvRow } from "@/lib/import-csv";
import { SiteHeader, ConnectWallet } from "@/components/site-header";
import { NftCanvas } from "@/components/nft-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  actions,
  newLayer,
  newTrait,
  shortAddress,
  useAppState,
  useMounted,
  useStoreReady,
  uid,
} from "@/lib/store";
import {
  CHAINS,
  RARITY_TIERS,
  stepsFor,
  type ChainId,
  type Layer,
  type Nft,
  type Project,
  type Trait,
} from "@/lib/types";
import { RASHITO_COLLECTION_ABI, RASHITO_COLLECTION_BYTECODE } from "@/lib/web3/contract-artifact";
import { resolveChain, unrevealedUriFor } from "@/lib/web3/contract";
import {
  activeLayers,
  buildMetadata,
  fakeCid,
  generateCollection,
  randomCombination,
  rarityScore,
  rarityTier,
  totalCombinations,
  traitProbability,
} from "@/lib/generator";

export const Route = createFileRoute("/studio/$id")({
  head: () => ({
    meta: [
      { title: "Creator Studio — Rashito" },
      {
        name: "description",
        content: "Build layers, set rarity, generate art, upload to IPFS, deploy and mint.",
      },
      { property: "og:title", content: "Creator Studio — Rashito" },
      {
        property: "og:description",
        content: "The ten-step Rashito workflow from artwork to on-chain mint.",
      },
    ],
  }),
  component: StudioPage,
});

const LAYER_PRESETS = [
  "Background",
  "Body",
  "Clothes",
  "Eyes",
  "Mouth",
  "Head",
  "Hat",
  "Accessories",
];

function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function ImageDrop({
  value,
  onChange,
  label,
}: {
  value?: string | undefined;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onChange(await readFile(f));
        }}
        className="grid h-32 w-full place-items-center rounded-xl border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground transition-colors hover:border-primary"
      >
        {value ? (
          <img src={value} alt={label} className="h-28 object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <ImagePlus className="size-5" /> Drop or click to upload PNG / WebP
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await readFile(f));
        }}
      />
    </div>
  );
}

function StepNav({
  project,
  step,
  go,
}: {
  project: Project;
  step: number;
  go: (n: number) => void;
}) {
  const STEPS = stepsFor(project);
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const done = i < project.step;
        const active = i === step;
        return (
          <button
            key={s}
            onClick={() => go(i)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : done
                  ? "border-primary/40 bg-secondary text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {done ? <Check className="size-3" /> : <span className="font-mono">{i + 1}</span>}
            {s}
          </button>
        );
      })}
    </div>
  );
}

function StudioPage() {
  const { id } = Route.useParams();
  const { projects } = useAppState();
  const mounted = useMounted();
  const storeReady = useStoreReady();
  const project = projects.find((p) => p.id === id);
  const [step, setStep] = useState(0);

  if (!mounted || !storeReady)
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  if (!project) throw notFound();

  const update = (patch: Partial<Project> | ((p: Project) => Partial<Project>)) =>
    actions.update(id, patch);
  const advance = (to: number) => {
    update((p) => ({ step: Math.max(p.step, to) }));
    setStep(to);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" /> Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{project.symbol}</Badge>
            <Badge variant="secondary">{CHAINS.find((c) => c.id === project.chain)?.name}</Badge>
            <span>Autosaved {new Date(project.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="mt-5">
          <StepNav project={project} step={step} go={setStep} />
        </div>

        <div className="mt-6">
          {(() => {
            const name = stepsFor(project)[step];
            const props = { project, update, next: () => advance(step + 1) };
            switch (name) {
              case "Details":
                return <DetailsStep {...props} />;
              case "Base":
                return <BaseStep {...props} />;
              case "Layers":
                return <LayersStep {...props} />;
              case "Traits":
                return <TraitsStep {...props} />;
              case "Rarity":
                return <RarityStep {...props} />;
              case "Generate":
                return <GenerateStep {...props} />;
              case "Review":
                return <ReviewStep {...props} />;
              case "Import":
                return <ImportStep {...props} />;
              case "Upload":
                return <UploadStep {...props} />;
              case "Deploy":
                return <DeployStep {...props} />;
              case "Mint":
                return <MintStep project={project} update={update} />;
              default:
                return null;
            }
          })()}
        </div>
      </main>
    </div>
  );
}

type StepProps = {
  project: Project;
  update: (patch: Partial<Project> | ((p: Project) => Partial<Project>)) => void;
  next: () => void;
};

function NextBar({
  label,
  onClick,
  disabled,
  hint,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-xl glass p-3">
      <span className="text-xs text-muted-foreground">{hint}</span>
      <Button onClick={onClick} disabled={disabled}>
        {label} <ArrowRight />
      </Button>
    </div>
  );
}

/* ---------------- Step 1: Details ---------------- */
function DetailsStep({ project, update, next }: StepProps) {
  const p = project;
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collection information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection name</Label>
              <Input id="name" value={p.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={p.symbol}
                  onChange={(e) => update({ symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Collection size</Label>
                <Input
                  id="size"
                  type="number"
                  value={p.size}
                  onChange={(e) => update({ size: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={4}
                value={p.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Blockchain</Label>
                <Select value={p.chain} onValueChange={(v) => update({ chain: v as ChainId })}>
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
                <Label>NFT standard</Label>
                <Select
                  value={p.standard}
                  onValueChange={(v) => update({ standard: v as Project["standard"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ERC-721">ERC-721</SelectItem>
                    <SelectItem value="ERC-1155">ERC-1155</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="royalty">Royalty %</Label>
                <Input
                  id="royalty"
                  type="number"
                  value={p.royalty}
                  onChange={(e) => update({ royalty: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wallet">Creator wallet</Label>
                <Input
                  id="wallet"
                  className="font-mono text-xs"
                  value={p.wallet}
                  onChange={(e) => update({ wallet: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branding & links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ImageDrop
                label="Collection logo"
                value={p.logo}
                onChange={(v) => update({ logo: v })}
              />
              <ImageDrop label="Banner" value={p.banner} onChange={(v) => update({ banner: v })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site">External website</Label>
              <Input
                id="site"
                placeholder="https://"
                value={p.website}
                onChange={(e) => update({ website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="tw">X / Twitter</Label>
                <Input
                  id="tw"
                  placeholder="@handle"
                  value={p.twitter}
                  onChange={(e) => update({ twitter: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dc">Discord</Label>
                <Input
                  id="dc"
                  placeholder="invite link"
                  value={p.discord}
                  onChange={(e) => update({ discord: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <NextBar
        label="Continue to base artwork"
        hint="Everything autosaves as you type."
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 2: Base ---------------- */
function BaseStep({ project, update, next }: StepProps) {
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Base character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload the main artwork every NFT is built on — an ape, lion, human, robot, anime
              character or fantasy creature. Traits stack on top of it.
            </p>
            <ImageDrop
              label="Base artwork"
              value={project.base}
              onChange={(v) => update({ base: v })}
            />
            {project.base ? (
              <Button variant="outline" size="sm" onClick={() => update({ base: undefined })}>
                <Trash2 /> Remove base
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <NftCanvas project={project} traits={[]} />
          </CardContent>
        </Card>
      </div>
      <NextBar
        label="Continue to layers"
        hint="A base is optional — layers alone also work."
        onClick={next}
      />
    </div>
  );
}

/** Resizes to max 1000px and re-encodes as WebP (keeps transparency, keeps storage small). */
async function compressImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/webp", 0.88);
}

/**
 * Builds layers + traits from a folder:  01_Background/Bamboo Dusk__14.png
 * Folder = layer (numeric prefix sets stack order, bottom first).
 * File = trait; optional "__N" suffix = rarity weight.
 */
async function layersFromFolder(files: File[]): Promise<Layer[]> {
  const groups = new Map<string, File[]>();
  for (const f of files) {
    if (!/\.(png|webp|jpe?g)$/i.test(f.name)) continue;
    const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
    const parts = rel.split("/");
    if (parts.length < 2) continue;
    const folder = parts[parts.length - 2]!;
    groups.set(folder, [...(groups.get(folder) ?? []), f]);
  }
  // Ignore stray folders (previews, notes) when real numbered layer folders exist.
  if ([...groups.keys()].some((k) => /^\d+[_\-\s]/.test(k))) {
    for (const k of [...groups.keys()]) if (!/^\d+[_\-\s]/.test(k)) groups.delete(k);
  }
  const folders = [...groups.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  const out: Layer[] = [];
  for (const folder of folders) {
    const layer = newLayer(
      folder
        .replace(/^\d+[_\-\s]*/, "")
        .replace(/_/g, " ")
        .trim() || folder,
    );
    const list = groups
      .get(folder)!
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    for (let i = 0; i < list.length; i++) {
      const file = list[i]!;
      const base = file.name.replace(/\.[^.]+$/, "");
      const m = /^(.*?)__(\d+)$/.exec(base);
      const trait = newTrait(i, (m ? m[1]! : base).trim());
      trait.image = await compressImage(file);
      if (m) trait.weight = Math.max(1, Number(m[2]));
      layer.traits.push(trait);
    }
    out.push(layer);
  }
  return out;
}

/* ---------------- Step 3: Layers ---------------- */
function LayersStep({ project, update, next }: StepProps) {
  const [name, setName] = useState("");
  const [importing, setImporting] = useState(false);
  const packRef = useRef<HTMLInputElement>(null);
  const layers = project.layers;

  const importPack = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    if (
      layers.length > 0 &&
      !window.confirm("This replaces your current layers and traits. Continue?")
    )
      return;
    setImporting(true);
    try {
      const built = await layersFromFolder(Array.from(list));
      if (built.length === 0) {
        toast.error("No layer folders found. Expected folders like 01_Background/Trait.png");
        return;
      }
      update({ layers: built, nfts: [] });
      toast.success(
        `Imported ${built.length} layers · ${built.reduce((n, l) => n + l.traits.length, 0)} traits`,
      );
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const setLayers = (next: Layer[]) => update({ layers: next });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= layers.length) return;
    const copy = [...layers];
    const a = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = a;
    setLayers(copy);
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Layer stack (top renders last)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">
                Have a ready-made pack? Choose the folder that contains one sub-folder per layer
                (like <code className="font-mono">01_Background</code>,{" "}
                <code className="font-mono">02_Armor</code> …). Layers, traits and rarity weights
                are created automatically.
              </p>
              <Button
                className="mt-2"
                variant="secondary"
                size="sm"
                disabled={importing}
                onClick={() => packRef.current?.click()}
              >
                {importing ? <Loader2 className="animate-spin" /> : <UploadCloud />} Import layer
                pack
              </Button>
              <input
                ref={packRef}
                type="file"
                multiple
                className="hidden"
                {...({ webkitdirectory: "" } as Record<string, string>)}
                onChange={(e) => {
                  void importPack(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New layer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!name.trim()) return;
                  setLayers([...layers, newLayer(name.trim())]);
                  setName("");
                }}
              >
                <Plus /> Add layer
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LAYER_PRESETS.filter((l) => !layers.some((x) => x.name === l)).map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant="secondary"
                  onClick={() => setLayers([...layers, newLayer(l)])}
                >
                  + {l}
                </Button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              {layers.map((l, i) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = Number(e.dataTransfer.getData("text/plain"));
                    if (Number.isNaN(from) || from === i) return;
                    const copy = [...layers];
                    const [moved] = copy.splice(from, 1);
                    copy.splice(i, 0, moved!);
                    setLayers(copy);
                  }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"
                >
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <Input
                    value={l.name}
                    onChange={(e) =>
                      setLayers(
                        layers.map((x) => (x.id === l.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    className="h-8 max-w-56"
                  />
                  <Badge variant="outline">{l.traits.length} traits</Badge>
                  <div className="ml-auto flex items-center gap-1">
                    <Switch
                      checked={l.enabled}
                      onCheckedChange={(v) =>
                        setLayers(layers.map((x) => (x.id === l.id ? { ...x, enabled: v } : x)))
                      }
                    />
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)}>
                      <ChevronUp />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)}>
                      <ChevronDown />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setLayers(layers.filter((x) => x.id !== l.id))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
              {layers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No layers yet. Add one above or use a preset.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stacking order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {layers.map((l, i) => (
              <div key={l.id} className="flex items-center gap-2 text-muted-foreground">
                <LayersIcon className="size-3" />
                <span className={l.enabled ? "text-foreground" : "line-through"}>{l.name}</span>
                {i < layers.length - 1 ? <span className="ml-auto text-xs">↓</span> : null}
              </div>
            ))}
            {layers.length === 0 ? <p className="text-muted-foreground">Empty stack.</p> : null}
          </CardContent>
        </Card>
      </div>
      <NextBar
        label="Continue to traits"
        hint={`${project.layers.length} layers configured`}
        disabled={layers.length === 0}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 4: Traits ---------------- */
function TraitsStep({ project, update, next }: StepProps) {
  const [activeLayerId, setActive] = useState(project.layers[0]?.id ?? "");
  const [preview, setPreview] = useState<Nft["traits"]>(() => randomCombination(project));
  const layer = project.layers.find((l) => l.id === activeLayerId) ?? project.layers[0];

  const setTraits = (layerId: string, traits: Trait[]) =>
    update({ layers: project.layers.map((l) => (l.id === layerId ? { ...l, traits } : l)) });

  const selectTrait = (layerId: string, traitId: string) =>
    setPreview((prev) => {
      const rest = prev.filter((t) => t.layerId !== layerId);
      return [...rest, { layerId, traitId }];
    });

  const traitCount = project.layers.reduce((s, l) => s + l.traits.length, 0);

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_340px]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {project.layers.map((l) => (
              <button
                key={l.id}
                onClick={() => setActive(l.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  l.id === layer?.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {l.name}
                <span className="font-mono text-xs">{l.traits.length}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{layer?.name} traits</CardTitle>
            {layer ? (
              <Button
                size="sm"
                onClick={() =>
                  setTraits(layer.id, [...layer.traits, newTrait(layer.traits.length)])
                }
              >
                <Plus /> Add trait
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            {layer?.traits.map((t) => (
              <div
                key={t.id}
                className="grid gap-3 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-[80px_1fr]"
              >
                <button
                  className="grid size-20 place-items-center overflow-hidden rounded-lg checker"
                  onClick={() => selectTrait(layer.id, t.id)}
                  title="Preview this trait"
                >
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full" style={{ background: t.color }} />
                  )}
                </button>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Input
                      value={t.name}
                      className="h-8 max-w-48"
                      onChange={(e) =>
                        setTraits(
                          layer.id,
                          layer.traits.map((x) =>
                            x.id === t.id ? { ...x, name: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground">
                      <ImagePlus className="size-3" /> Image
                      <input
                        type="file"
                        accept="image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const img = await readFile(f);
                          setTraits(
                            layer.id,
                            layer.traits.map((x) => (x.id === t.id ? { ...x, image: img } : x)),
                          );
                        }}
                      />
                    </label>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() =>
                        setTraits(
                          layer.id,
                          layer.traits.filter((x) => x.id !== t.id),
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="grid gap-1">
                      <Label className="text-[10px] text-muted-foreground">Weight</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={t.weight}
                        onChange={(e) =>
                          setTraits(
                            layer.id,
                            layer.traits.map((x) =>
                              x.id === t.id ? { ...x, weight: Number(e.target.value) } : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-[10px] text-muted-foreground">Max supply</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={t.maxSupply ?? ""}
                        onChange={(e) =>
                          setTraits(
                            layer.id,
                            layer.traits.map((x) =>
                              x.id === t.id
                                ? {
                                    ...x,
                                    maxSupply: e.target.value ? Number(e.target.value) : undefined,
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-[10px] text-muted-foreground">Rarity</Label>
                      <div className="flex h-8 items-center rounded-md border border-border px-2 font-mono text-xs">
                        {traitProbability(layer, t).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Input
                    placeholder="Optional description"
                    className="h-8"
                    value={t.description ?? ""}
                    onChange={(e) =>
                      setTraits(
                        layer.id,
                        layer.traits.map((x) =>
                          x.id === t.id ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
            {layer && layer.traits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No traits in this layer yet. Add a trait and upload a transparent PNG or WebP.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NftCanvas project={project} traits={preview} showLabels />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setPreview(randomCombination(project))}
                >
                  <Shuffle /> Randomize
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <NextBar
        label="Continue to rarity"
        hint={`${traitCount} traits across ${project.layers.length} layers`}
        disabled={traitCount === 0}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 5: Rarity + rules ---------------- */
function RarityStep({ project, update, next }: StepProps) {
  const combos = totalCombinations(project);
  const problemLayers = activeLayers(project).filter(
    (l) => l.traits.reduce((s, t) => s + Math.max(0, t.weight), 0) <= 0,
  );
  const [ruleType, setRuleType] = useState<"exclude" | "require">("exclude");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const allTraits = project.layers.flatMap((l) =>
    l.traits.map((t) => ({ ...t, layerName: l.name })),
  );
  const traitName = (id: string) => {
    const t = allTraits.find((x) => x.id === id);
    return t ? `${t.layerName}: ${t.name}` : "Unknown";
  };

  const setWeight = (layerId: string, traitId: string, weight: number) =>
    update({
      layers: project.layers.map((l) =>
        l.id === layerId
          ? { ...l, traits: l.traits.map((t) => (t.id === traitId ? { ...t, weight } : t)) }
          : l,
      ),
    });

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weighted rarity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeLayers(project).map((l) => (
              <div key={l.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{l.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {l.traits.reduce((s, t) => s + traitProbability(l, t), 0).toFixed(0)}% allocated
                  </span>
                </div>
                {l.traits.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="w-36 truncate text-sm">{t.name}</span>
                    <Input
                      type="number"
                      className="h-8 w-24"
                      value={t.weight}
                      onChange={(e) => setWeight(l.id, t.id, Number(e.target.value))}
                    />
                    <Select onValueChange={(v) => setWeight(l.id, t.id, Number(v))}>
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {RARITY_TIERS.map((r) => (
                          <SelectItem key={r.name} value={String(r.weight)}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1">
                      <Progress value={traitProbability(l, t)} />
                    </div>
                    <span className="w-14 text-right font-mono text-xs">
                      {traitProbability(l, t).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Possible combinations</span>
                <span className="font-mono">{combos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested size</span>
                <span className="font-mono">{project.size.toLocaleString()}</span>
              </div>
              {combos < project.size ? (
                <p className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
                  Not enough unique combinations for {project.size} NFTs. Add traits or reduce the
                  size.
                </p>
              ) : (
                <p
                  className="rounded-md bg-success/15 p-2 text-xs"
                  style={{ color: "var(--success)" }}
                >
                  Rarity configuration is valid.
                </p>
              )}
              {problemLayers.map((l) => (
                <p key={l.id} className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
                  Layer “{l.name}” has zero total weight.
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trait rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={ruleType}
                onValueChange={(v) => setRuleType(v as "exclude" | "require")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclude">Cannot appear with</SelectItem>
                  <SelectItem value="require">Requires</SelectItem>
                </SelectContent>
              </Select>
              <Select value={a} onValueChange={setA}>
                <SelectTrigger>
                  <SelectValue placeholder="Trait A" />
                </SelectTrigger>
                <SelectContent>
                  {allTraits.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.layerName}: {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={b} onValueChange={setB}>
                <SelectTrigger>
                  <SelectValue placeholder="Trait B" />
                </SelectTrigger>
                <SelectContent>
                  {allTraits.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.layerName}: {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  if (!a || !b || a === b) {
                    toast.error("Pick two different traits");
                    return;
                  }
                  update({ rules: [...project.rules, { id: uid(), type: ruleType, a, b }] });
                  setA("");
                  setB("");
                  toast.success("Rule added");
                }}
              >
                <Plus /> Add rule
              </Button>
              <div className="space-y-2">
                {project.rules.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 rounded-md border border-border p-2 text-xs"
                  >
                    <span className="flex-1">
                      {traitName(r.a)}{" "}
                      {r.type === "exclude" ? "✕ cannot appear with" : "→ requires"}{" "}
                      {traitName(r.b)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() => update({ rules: project.rules.filter((x) => x.id !== r.id) })}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <NextBar
        label="Continue to generation"
        hint="Rules are enforced during generation."
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 6: Generate ---------------- */
function GenerateStep({ project, update, next }: StepProps) {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const combos = totalCombinations(project);
  const traits = project.layers.reduce((s, l) => s + l.traits.length, 0);
  const canGenerate = combos >= project.size && traits > 0;

  const run = () => {
    setRunning(true);
    setProgress(0);
    const size = Math.min(project.size, combos);
    const result = generateCollection(project, size);
    let done = 0;
    const tick = window.setInterval(() => {
      done += Math.max(1, Math.round(size / 25));
      setProgress(Math.min(size, done));
      if (done >= size) {
        window.clearInterval(tick);
        update({ nfts: result.nfts, step: Math.max(project.step, 6) });
        setRunning(false);
        toast.success(`${result.nfts.length} NFTs generated`);
        next();
      }
    }, 60);
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generation summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Requested collection size", project.size.toLocaleString()],
              ["Total possible combinations", combos.toLocaleString()],
              ["Estimated unique output", Math.min(project.size, combos).toLocaleString()],
              ["Layers", String(activeLayers(project).length)],
              ["Traits", String(traits)],
              ["Rules", String(project.rules.length)],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-b border-border/50 py-1.5 last:border-0"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono">{v}</span>
              </div>
            ))}
            {!canGenerate ? (
              <p className="rounded-md bg-destructive/15 p-2 text-xs text-destructive">
                Not enough combinations for the requested size — go back to rarity or add traits.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NftCanvas project={project} traits={randomCombination(project)} />
            {running ? (
              <div className="space-y-2">
                <Progress value={(progress / Math.max(1, Math.min(project.size, combos))) * 100} />
                <p className="text-center font-mono text-xs text-muted-foreground">
                  {progress.toLocaleString()} / {Math.min(project.size, combos).toLocaleString()}{" "}
                  NFTs generated
                </p>
              </div>
            ) : (
              <Button className="w-full" size="lg" disabled={!canGenerate} onClick={run}>
                <Dice5 /> Generate Collection
              </Button>
            )}
            {project.nfts.length > 0 && !running ? (
              <Button variant="secondary" className="w-full" onClick={next}>
                View generated gallery <ArrowRight />
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Step 7: Review gallery ---------------- */
function ReviewStep({ project, update, next }: StepProps) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("token");
  const [tier, setTier] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);

  const maxScore = useMemo(
    () => (project.nfts.length ? Math.max(...project.nfts.map((n) => n.rarityScore)) : 1),
    [project.nfts],
  );
  const minScore = useMemo(
    () => (project.nfts.length ? Math.min(...project.nfts.map((n) => n.rarityScore)) : 0),
    [project.nfts],
  );

  const list = useMemo(() => {
    let out = project.nfts.filter((n) => {
      const names = n.traits
        .map(
          (t) =>
            project.layers.find((l) => l.id === t.layerId)?.traits.find((x) => x.id === t.traitId)
              ?.name ?? "",
        )
        .join(" ")
        .toLowerCase();
      const matches =
        !q || n.name.toLowerCase().includes(q.toLowerCase()) || names.includes(q.toLowerCase());
      const tierOk = tier === "all" || rarityTier(n.rarityScore, maxScore, minScore) === tier;
      return matches && tierOk;
    });
    out = [...out].sort((a, b) =>
      sort === "rarity" ? b.rarityScore - a.rarityScore : a.tokenId - b.tokenId,
    );
    return out;
  }, [project.nfts, project.layers, q, sort, tier, maxScore, minScore]);

  const nft = project.nfts.find((n) => n.tokenId === selected) ?? null;

  const saveNft = (updated: Nft) =>
    update({ nfts: project.nfts.map((n) => (n.tokenId === updated.tokenId ? updated : n)) });

  return (
    <div>
      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-base">
            Generated collection · {project.nfts.length} NFTs
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search name or trait"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-64"
            />
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rarities</SelectItem>
                {["Mythic", "Legendary", "Epic", "Rare", "Uncommon", "Common"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="token">Sort by token ID</SelectItem>
                <SelectItem value="rarity">Sort by rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {project.nfts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing generated yet — go back to step 6.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {list.slice(0, 200).map((n) => (
                <button
                  key={n.tokenId}
                  onClick={() => setSelected(n.tokenId)}
                  className="text-left"
                >
                  <NftCanvas project={project} traits={n.traits} />
                  <div className="mt-2 space-y-0.5">
                    <div className="truncate text-sm font-medium">{n.name}</div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>#{n.tokenId}</span>
                      <span>{rarityTier(n.rarityScore, maxScore, minScore)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {n.traits.length} traits
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {list.length > 200 ? (
            <p className="pt-4 text-center text-xs text-muted-foreground">
              Showing first 200 of {list.length} matches.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!nft} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{nft?.name}</DialogTitle>
          </DialogHeader>
          {nft ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <NftCanvas project={project} traits={nft.traits} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const kept = nft.traits.filter((t) => nft.locked.includes(t.layerId));
                      const fresh = randomCombination(project).filter(
                        (t) => !nft.locked.includes(t.layerId),
                      );
                      const traits = [...kept, ...fresh];
                      saveNft({ ...nft, traits, rarityScore: rarityScore(project, traits) });
                      toast.success("NFT regenerated");
                    }}
                  >
                    <Shuffle /> Regenerate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(buildMetadata(project, nft), null, 2)],
                        { type: "application/json" },
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${nft.tokenId}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download /> Metadata
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      update({ nfts: project.nfts.filter((n) => n.tokenId !== nft.tokenId) });
                      setSelected(null);
                      toast.success("NFT removed");
                    }}
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {project.layers
                  .filter((l) => l.enabled && l.traits.length)
                  .map((l) => {
                    const current = nft.traits.find((t) => t.layerId === l.id);
                    const locked = nft.locked.includes(l.id);
                    return (
                      <div key={l.id} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">
                          {l.name}
                        </span>
                        <Select
                          value={current?.traitId ?? "none"}
                          onValueChange={(v) => {
                            const rest = nft.traits.filter((t) => t.layerId !== l.id);
                            const traits =
                              v === "none" ? rest : [...rest, { layerId: l.id, traitId: v }];
                            saveNft({ ...nft, traits, rarityScore: rarityScore(project, traits) });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {l.traits.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() =>
                            saveNft({
                              ...nft,
                              locked: locked
                                ? nft.locked.filter((x) => x !== l.id)
                                : [...nft.locked, l.id],
                            })
                          }
                        >
                          {locked ? <Lock /> : <Unlock />}
                        </Button>
                      </div>
                    );
                  })}
                <pre className="max-h-52 overflow-auto rounded-lg bg-secondary/50 p-3 font-mono text-[10px]">
                  {JSON.stringify(buildMetadata(project, nft), null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <NextBar
        label="Approve collection & upload to IPFS"
        hint={`${project.nfts.length} NFTs ready`}
        disabled={project.nfts.length === 0}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Import step (non-layered "AI variations" mode) ---------------- */
const CID_RE = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{50,})$/;
const IMG_RE = /\.(png|jpe?g|webp)$/i;

function extOf(name: string) {
  const m = /\.(png|jpe?g|webp)$/i.exec(name);
  const e = m ? m[1]!.toLowerCase() : "png";
  return e === "jpeg" ? "jpg" : e;
}

function ImportStep({ project, update, next }: StepProps) {
  const imp = project.imported;
  const status = useQuery({
    queryKey: ["pinata-status"],
    queryFn: () => getPinataStatus(),
    staleTime: 60_000,
  });
  const gateway = status.data?.gateway ?? imp?.gateway ?? "gateway.pinata.cloud";
  const pinataReady = status.data?.configured === true;
  const signUrl = useServerFn(getUploadUrl);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pattern, setPattern] = useState(imp?.namePattern ?? `${project.name} #{id}`);
  const [attrs, setAttrs] = useState(imp?.baseAttributes ?? []);
  const [sheet, setSheet] = useState<CsvRow[] | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(0);
  const [advCid, setAdvCid] = useState("");
  const [advCount, setAdvCount] = useState(project.size);
  const [advExt, setAdvExt] = useState("png");
  const filesRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const doneCount = project.nfts.filter((n) => n.imageCid).length;
  const folderMode = !!imp?.imageCid;
  const built =
    project.nfts.length > 0 && !!imp && (folderMode || doneCount === project.nfts.length);
  const canResume =
    !folderMode &&
    doneCount > 0 &&
    doneCount < project.nfts.length &&
    files.length === project.nfts.length;

  const pick = (list: FileList | File[] | null) => {
    if (!list) return;
    const imgs = Array.from(list)
      .filter((f) => IMG_RE.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(imgs);
    setPreviews(imgs.slice(0, 12).map((f) => URL.createObjectURL(f)));
    setFailed(0);
    if (imgs.length === 0) toast.error("No PNG, JPG or WebP images found");
  };

  const onCsv = async (f: File | undefined) => {
    if (!f) return;
    try {
      setSheet(parseAttributeSheet(await f.text()));
      setSheetName(f.name);
      toast.success("Attribute sheet loaded");
    } catch (e) {
      setSheet(null);
      setSheetName("");
      toast.error(e instanceof Error ? e.message : "Could not read CSV");
    }
  };

  const makeNfts = (count: number, cids: (string | undefined)[]): Nft[] => {
    const byId = new Map((sheet ?? []).map((r) => [r.tokenId, r]));
    const base = attrs.filter((a) => a.trait_type.trim() && a.value.trim());
    return Array.from({ length: count }, (_, i) => {
      const id = i + 1;
      const row = byId.get(id);
      return {
        tokenId: id,
        name: row?.name || pattern.replaceAll("{id}", String(id)),
        attributes: [...base, ...(row?.attributes ?? [])],
        imageCid: cids[i],
        traits: [],
        locked: [],
        rarityScore: 0,
      };
    });
  };
  const baseAttrs = () => attrs.filter((a) => a.trait_type.trim() && a.value.trim());

  /** Uploads one image straight to Pinata through a short-lived signed URL. */
  const uploadOne = async (file: File): Promise<string> => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { url } = await signUrl({
          data: { filename: file.name, mime: file.type || "image/png" },
        });
        const form = new FormData();
        form.append("file", file);
        form.append("network", "public");
        const res = await fetch(url, { method: "POST", body: form });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const json = (await res.json()) as { data?: { cid?: string }; cid?: string };
        const cid = json.data?.cid ?? json.cid;
        if (!cid) throw new Error("Pinata returned no CID");
        return cid;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Upload failed");
  };

  const uploadAll = async () => {
    if (!files.length) return;
    if (files.length > 10000) {
      toast.error("Maximum 10,000 images per collection");
      return;
    }
    setBusy(true);
    setFailed(0);
    const cids: (string | undefined)[] = files.map((_, i) =>
      canResume ? project.nfts[i]?.imageCid : undefined,
    );
    let nfts = makeNfts(files.length, cids);
    update({
      mode: "imported",
      imported: {
        imageCid: "",
        ext: extOf(files[0]!.name),
        gateway,
        namePattern: pattern,
        baseAttributes: baseAttrs(),
      },
      nfts,
      size: files.length,
      upload: undefined,
    });
    setProgress(cids.filter(Boolean).length);

    const queue = files.map((_, i) => i).filter((i) => !cids[i]);
    let finished = cids.filter(Boolean).length;
    let bad = 0;
    let sinceSave = 0;
    const worker = async () => {
      for (;;) {
        const i = queue.shift();
        if (i === undefined) return;
        try {
          cids[i] = await uploadOne(files[i]!);
        } catch (e) {
          console.error("upload failed", files[i]?.name, e);
          bad++;
          setFailed(bad);
        }
        finished++;
        setProgress(finished);
        if (++sinceSave >= 20) {
          sinceSave = 0;
          nfts = nfts.map((n, k) => ({ ...n, imageCid: cids[k] }));
          update({ nfts });
        }
      }
    };
    try {
      await Promise.all([worker(), worker(), worker(), worker()]);
      nfts = nfts.map((n, k) => ({ ...n, imageCid: cids[k] }));
      update({ nfts });
      if (bad) toast.error(`${bad} image(s) failed. Click Resume to retry them.`);
      else toast.success(`${files.length} images uploaded to IPFS`);
    } finally {
      setBusy(false);
    }
  };

  /** Advanced: images were already hosted as a folder elsewhere. */
  const buildFromFolder = () => {
    const clean = advCid
      .trim()
      .replace(/^ipfs:\/\//, "")
      .replace(/\/+$/, "");
    if (!CID_RE.test(clean)) {
      toast.error("That doesn't look like a valid folder CID");
      return;
    }
    if (!Number.isInteger(advCount) || advCount < 1 || advCount > 10000) {
      toast.error("Supply must be between 1 and 10,000");
      return;
    }
    update({
      mode: "imported",
      imported: {
        imageCid: clean,
        ext: advExt,
        gateway,
        namePattern: pattern,
        baseAttributes: baseAttrs(),
      },
      nfts: makeNfts(advCount, []),
      size: advCount,
      upload: undefined,
    });
    toast.success(`${advCount} NFTs prepared`);
  };

  const pct = files.length ? Math.round((progress / files.length) * 100) : 0;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1 · Add your images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files);
              }}
              className="grid place-items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 p-8 text-center"
            >
              <ImagePlus className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                Drop all your AI-generated images here. Any file names work — they are numbered in
                alphabetical order (1, 2, 3 …).
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => filesRef.current?.click()}>
                  Choose images
                </Button>
                <Button variant="secondary" onClick={() => folderRef.current?.click()}>
                  Choose a folder
                </Button>
              </div>
              <input
                ref={filesRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => pick(e.target.files)}
              />
              <input
                ref={folderRef}
                type="file"
                multiple
                className="hidden"
                {...({ webkitdirectory: "" } as Record<string, string>)}
                onChange={(e) => pick(e.target.files)}
              />
            </div>
            {files.length > 0 ? (
              <div className="space-y-2 text-xs">
                <p>
                  <b>{files.length}</b> images selected ·{" "}
                  {(files.reduce((n, f) => n + f.size, 0) / 1_000_000).toFixed(0)} MB
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {previews.map((u) => (
                    <img key={u} src={u} alt="" className="aspect-square rounded object-cover" />
                  ))}
                </div>
              </div>
            ) : null}
            {!pinataReady && !status.isLoading ? (
              <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                Image hosting isn't connected yet. Add <code>PINATA_JWT</code> to the project's
                environment settings to enable one-click uploads.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2 · Name your NFTs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="imp-pattern">Name pattern</Label>
              <Input
                id="imp-pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                <code className="font-mono">{"{id}"}</code> becomes the token number.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Attributes on every NFT (optional)</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAttrs([...attrs, { trait_type: "", value: "" }])}
                >
                  <Plus /> Add
                </Button>
              </div>
              {attrs.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Collection"
                    value={a.trait_type}
                    onChange={(e) =>
                      setAttrs(
                        attrs.map((x, j) => (j === i ? { ...x, trait_type: e.target.value } : x)),
                      )
                    }
                  />
                  <Input
                    placeholder="Genesis"
                    value={a.value}
                    onChange={(e) =>
                      setAttrs(attrs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setAttrs(attrs.filter((_, j) => j !== i))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Per-token details (optional CSV)</Label>
              <Button variant="secondary" onClick={() => csvRef.current?.click()}>
                <UploadCloud /> {sheetName ? sheetName : "Upload attributes.csv"}
              </Button>
              <input
                ref={csvRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => void onCsv(e.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground">
                Columns: <code className="font-mono">token_id</code>, optional{" "}
                <code className="font-mono">name</code>, then any attribute columns.
              </p>
            </div>
            {busy ? (
              <div className="space-y-2">
                <Progress value={pct} />
                <p className="font-mono text-xs text-muted-foreground">
                  Uploading to IPFS {progress}/{files.length}
                  {failed ? ` · ${failed} failed` : ""}
                </p>
              </div>
            ) : (
              <Button
                className="w-full"
                disabled={!files.length || !pinataReady}
                onClick={() => void uploadAll()}
              >
                <UploadCloud />{" "}
                {canResume
                  ? `Resume upload (${doneCount}/${files.length} done)`
                  : files.length
                    ? `Upload ${files.length} images & build collection`
                    : "Add images first"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <details className="mt-6 rounded-xl border border-border p-4 text-sm">
        <summary className="cursor-pointer font-medium">
          Advanced: my images are already hosted as an IPFS folder
        </summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2 sm:col-span-3">
            <Label htmlFor="adv-cid">Folder CID (files named 1.png, 2.png …)</Label>
            <Input
              id="adv-cid"
              value={advCid}
              onChange={(e) => setAdvCid(e.target.value)}
              placeholder="bafybei… or Qm…"
              className="font-mono text-xs"
            />
          </div>
          <div className="grid gap-2">
            <Label>Supply</Label>
            <Input
              type="number"
              value={advCount}
              onChange={(e) => setAdvCount(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select value={advExt} onValueChange={setAdvExt}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">.png</SelectItem>
                <SelectItem value="jpg">.jpg</SelectItem>
                <SelectItem value="webp">.webp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={buildFromFolder}>
              Use this folder
            </Button>
          </div>
        </div>
      </details>

      {project.nfts.length > 0 && imp ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Preview · {project.nfts.length} NFTs
              {!folderMode ? ` · ${doneCount} on IPFS` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {project.nfts.slice(0, 12).map((n) => (
                <div key={n.tokenId} className="space-y-1">
                  <NftCanvas project={project} traits={[]} tokenId={n.tokenId} />
                  <div className="truncate text-xs">{n.name}</div>
                </div>
              ))}
            </div>
            <pre className="mt-4 max-h-52 overflow-auto rounded-lg bg-secondary/50 p-3 font-mono text-[10px]">
              {JSON.stringify(buildMetadata(project, project.nfts[0]!), null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      <NextBar
        label="Continue to metadata upload"
        hint={
          built
            ? `${project.nfts.length} NFTs ready`
            : project.nfts.length
              ? "Finish uploading all images"
              : "Add and upload your images"
        }
        disabled={!built || busy}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 8: IPFS upload ---------------- */
function UploadStep({ project, update, next }: StepProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("pinata");
  const done = project.upload;

  const status = useQuery({
    queryKey: ["pinata-status"],
    queryFn: () => getPinataStatus(),
    staleTime: 60_000,
  });
  const pin = useServerFn(pinDirectory);
  const signUrl = useServerFn(getUploadUrl);
  const live = provider === "pinata" && status.data?.configured === true;
  const gateway = status.data?.gateway ?? "gateway.pinata.cloud";

  const runSimulated = () => {
    setBusy(true);
    setProgress(0);
    setStage("Simulating pin…");
    let v = 0;
    const timer = window.setInterval(() => {
      v += 4;
      setProgress(Math.min(100, v));
      if (v >= 100) {
        window.clearInterval(timer);
        const imageCid =
          project.imported?.imageCid || project.nfts[0]?.imageCid || fakeCid(project.id + "images");
        const metadataCid = fakeCid(project.id + "meta");
        update({
          upload: {
            imageCid,
            metadataCid,
            baseUri: `ipfs://${metadataCid}/`,
            uploadedAt: new Date().toISOString(),
          },
          step: Math.max(project.step, imported ? 3 : 8),
        });
        setBusy(false);
        toast.success("Assets pinned (simulated)");
      }
    }, 70);
  };

  const imported = project.mode === "imported" && project.imported;

  /** Imported collections: images are already on IPFS, only metadata is pinned. */
  const runImported = async () => {
    if (!project.imported) return;
    setBusy(true);
    setProgress(0);
    try {
      const imageCid = project.imported.imageCid || project.nfts[0]?.imageCid || "";
      const withImages = {
        ...project,
        upload: { imageCid, metadataCid: "", baseUri: "", uploadedAt: "" },
      };
      const toB64 = (o: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(o, null, 2))));
      const metaFiles = project.nfts.map((nft) => ({
        path: `${nft.tokenId}.json`,
        base64: toB64(buildMetadata(withImages, nft)),
        type: "application/json",
      }));
      metaFiles.push({
        path: "unrevealed.json",
        base64: toB64({
          name: `${project.name} (Unrevealed)`,
          description: "This collection has not been revealed yet. Check back after reveal.",
          image: project.nfts[0]?.imageCid
            ? `ipfs://${project.nfts[0].imageCid}`
            : `ipfs://${imageCid}/1.${project.imported.ext}`,
        }),
        type: "application/json",
      });
      const bytes = metaFiles.reduce((n, f) => n + f.base64.length, 0);
      if (bytes > 4_000_000)
        throw new Error(
          "Metadata is too large for one upload (limit ~4 MB). Split into fewer attributes.",
        );
      setStage("Pinning metadata…");
      setProgress(40);
      const metaRes = await pin({
        data: { name: `${project.symbol || project.name}-metadata`, files: metaFiles },
      });
      setProgress(100);
      update({
        upload: {
          imageCid,
          metadataCid: metaRes.cid,
          baseUri: `ipfs://${metaRes.cid}/`,
          uploadedAt: new Date().toISOString(),
        },
        step: Math.max(project.step, 3),
      });
      toast.success("Metadata pinned to IPFS via Pinata");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const runLive = async () => {
    setBusy(true);
    setProgress(0);
    try {
      // 1) Render each NFT and upload it straight to Pinata (signed URL), a few at
      //    a time. Finished CIDs are saved so a failed run can simply be resumed.
      const total = project.nfts.length;
      const cids: (string | undefined)[] = project.nfts.map((n) => n.imageCid);
      let finished = cids.filter(Boolean).length;
      let sinceSave = 0;
      let failedCount = 0;
      setStage(`Uploading images 0/${total}…`);
      setProgress(Math.round((finished / total) * 80));

      const uploadImage = async (i: number): Promise<string> => {
        const nft = project.nfts[i]!;
        const dataUrl = await renderNft(project, nft);
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${nft.tokenId}.png`, { type: "image/png" });
        let lastErr: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const { url } = await signUrl({ data: { filename: file.name, mime: "image/png" } });
            const form = new FormData();
            form.append("file", file);
            form.append("network", "public");
            const res = await fetch(url, { method: "POST", body: form });
            if (!res.ok) throw new Error(`Upload failed (${res.status})`);
            const json = (await res.json()) as { data?: { cid?: string }; cid?: string };
            const cid = json.data?.cid ?? json.cid;
            if (!cid) throw new Error("Pinata returned no CID");
            return cid;
          } catch (e) {
            lastErr = e;
            await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
          }
        }
        throw lastErr instanceof Error ? lastErr : new Error("Upload failed");
      };

      const queue = cids.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
      const worker = async () => {
        for (;;) {
          const i = queue.shift();
          if (i === undefined) return;
          try {
            cids[i] = await uploadImage(i);
          } catch (e) {
            console.error("image upload failed", i + 1, e);
            failedCount++;
          }
          finished++;
          setStage(`Uploading images ${Math.min(finished, total)}/${total}…`);
          setProgress(Math.round((Math.min(finished, total) / total) * 80));
          if (++sinceSave >= 20) {
            sinceSave = 0;
            update({ nfts: project.nfts.map((n, k) => ({ ...n, imageCid: cids[k] })) });
          }
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      const nftsWithCids = project.nfts.map((n, k) => ({ ...n, imageCid: cids[k] }));
      update({ nfts: nftsWithCids });
      if (failedCount > 0 || cids.some((c) => !c)) {
        throw new Error(
          `${cids.filter((c) => !c).length} image(s) failed to upload. Click the button again to resume - finished images are kept.`,
        );
      }

      // 2) Metadata: one small JSON per token, pinned together as a folder.
      setStage("Pinning metadata…");
      setProgress(88);
      const withImages = {
        ...project,
        nfts: nftsWithCids,
        upload: { imageCid: "", metadataCid: "", baseUri: "", uploadedAt: "" },
      };
      const toB64 = (o: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(o, null, 2))));
      const metaFiles = nftsWithCids.map((nft) => ({
        path: `${nft.tokenId}.json`,
        base64: toB64(buildMetadata(withImages, nft)),
        type: "application/json",
      }));
      // Placeholder shown by tokenURI() before reveal() - uses a real uploaded image.
      metaFiles.push({
        path: "unrevealed.json",
        base64: toB64({
          name: `${project.name} (Unrevealed)`,
          description: "This collection has not been revealed yet. Check back after reveal.",
          image: `ipfs://${cids[0]}`,
        }),
        type: "application/json",
      });
      const bytes = metaFiles.reduce((n, f) => n + f.base64.length, 0);
      if (bytes > 4_000_000) throw new Error("Metadata is too large for one upload (limit ~4 MB).");
      const metaRes = await pin({
        data: { name: `${project.symbol || project.name}-metadata`, files: metaFiles },
      });

      setProgress(100);
      update({
        nfts: nftsWithCids,
        upload: {
          imageCid: cids[0]!,
          metadataCid: metaRes.cid,
          baseUri: `ipfs://${metaRes.cid}/`,
          uploadedAt: new Date().toISOString(),
        },
        step: Math.max(project.step, 8),
      });
      toast.success("Assets pinned to IPFS via Pinata");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const run = () => {
    if (imported && live) void runImported();
    else if (live) void runLive();
    else runSimulated();
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decentralized storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Storage provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pinata">Pinata</SelectItem>
                  <SelectItem value="ipfs">IPFS node</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ·{" "}
                {imported
                  ? `${project.nfts.length} images already on IPFS`
                  : `${project.nfts.length} NFT images`}
              </li>
              <li>· {project.nfts.length} metadata files</li>
              <li>· Collection logo {project.logo ? "✓" : "—"}</li>
              <li>· Collection banner {project.banner ? "✓" : "—"}</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              {live
                ? `Live pinning enabled · gateway ${gateway}`
                : provider === "pinata"
                  ? "Pinata key not configured — uploads run in simulation mode."
                  : "Local IPFS node is simulated."}
            </p>
            {busy ? (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="font-mono text-xs text-muted-foreground">
                  {stage} {progress}%
                </p>
              </div>
            ) : (
              <Button className="w-full" onClick={run}>
                <UploadCloud />{" "}
                {done ? "Re-upload to IPFS" : live ? "Pin to IPFS with Pinata" : "Upload to IPFS"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {done ? (
              <>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Image CID</span>
                  <code className="break-all font-mono text-xs">{done.imageCid}</code>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Metadata CID</span>
                  <code className="break-all font-mono text-xs">{done.metadataCid}</code>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Base URI</span>
                  <code className="break-all font-mono text-xs">{done.baseUri}</code>
                </div>
                <a
                  className="text-xs text-primary underline"
                  href={`https://${gateway}/ipfs/${done.metadataCid}/1.json`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open token #1 metadata on the gateway
                </a>
                <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-secondary/50 p-3 font-mono text-[10px]">
                  {project.nfts[0]
                    ? JSON.stringify(buildMetadata(project, project.nfts[0]), null, 2)
                    : "{}"}
                </pre>
              </>
            ) : (
              <p className="text-muted-foreground">
                Upload to see CIDs and the base URI used by your contract.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <NextBar
        label="Continue to contract deployment"
        hint={done ? "Assets pinned" : "Upload required"}
        disabled={!done}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 9: Deploy ---------------- */
function DeployStep({ project, update, next }: StepProps) {
  const { address, isConnected } = useAccount();
  const activeChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const targetChain = resolveChain(project.chain);
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { deployContractAsync } = useDeployContract();
  const { writeContractAsync } = useWriteContract();

  const [price, setPrice] = useState(project.deployment?.mintPrice ?? "0.01");
  const [maxPerWallet, setMaxPerWallet] = useState(10);
  const [publicMint, setPublicMint] = useState(project.deployment?.publicMint ?? true);
  const [busy, setBusy] = useState<string | null>(null);
  const chain = CHAINS.find((c) => c.id === project.chain)!;
  const d = project.deployment;
  const onRightNetwork = activeChainId === targetChain.id;

  const deploy = async () => {
    if (!isConnected || !address) {
      toast.error("Connect a wallet to sign the deployment");
      return;
    }
    if (!project.upload?.metadataCid) {
      toast.error("Upload your assets to IPFS before deploying");
      return;
    }
    try {
      if (activeChainId !== targetChain.id) {
        setBusy("Switching network…");
        await switchChainAsync({ chainId: targetChain.id });
      }

      setBusy("Confirm the deployment in your wallet…");
      const ownerAddress = (project.wallet || address) as Address;
      const hash = await deployContractAsync({
        abi: RASHITO_COLLECTION_ABI,
        bytecode: RASHITO_COLLECTION_BYTECODE,
        chainId: targetChain.id,
        args: [
          project.name,
          project.symbol,
          BigInt(project.size),
          parseEther(price || "0"),
          BigInt(maxPerWallet),
          unrevealedUriFor(project),
          ownerAddress,
          BigInt(Math.round(project.royalty * 100)),
          ownerAddress,
        ],
      });

      setBusy("Waiting for the transaction to confirm on-chain…");
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      const contractAddress = receipt.contractAddress;
      if (!contractAddress)
        throw new Error("Deployment transaction did not return a contract address");

      if (publicMint) {
        setBusy("Opening public mint (second transaction)…");
        const enableHash = await writeContractAsync({
          address: contractAddress,
          abi: RASHITO_COLLECTION_ABI,
          functionName: "setPublicMintEnabled",
          args: [true],
          chainId: targetChain.id,
        });
        await publicClient!.waitForTransactionReceipt({ hash: enableHash });
      }

      update({
        wallet: ownerAddress,
        deployment: {
          address: contractAddress,
          txHash: hash,
          chain: project.chain,
          deployedAt: new Date().toISOString(),
          mintPrice: price,
          publicMint,
          paused: false,
        },
        step: Math.max(project.step, 9),
      });
      toast.success("Contract deployed on-chain");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label>Name</Label>
                <Input
                  value={project.name}
                  onChange={(e) => update({ name: e.target.value })}
                  disabled={!!d}
                />
              </div>
              <div className="grid gap-1">
                <Label>Symbol</Label>
                <Input
                  value={project.symbol}
                  onChange={(e) => update({ symbol: e.target.value.toUpperCase() })}
                  disabled={!!d}
                />
              </div>
              <div className="grid gap-1">
                <Label>Max supply</Label>
                <Input
                  type="number"
                  value={project.size}
                  onChange={(e) => update({ size: Number(e.target.value) })}
                  disabled={!!d}
                />
              </div>
              <div className="grid gap-1">
                <Label>Mint price ({chain.symbol})</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} disabled={!!d} />
              </div>
              <div className="grid gap-1">
                <Label>Royalty %</Label>
                <Input
                  type="number"
                  value={project.royalty}
                  onChange={(e) => update({ royalty: Number(e.target.value) })}
                  disabled={!!d}
                />
              </div>
              <div className="grid gap-1">
                <Label>Max per wallet</Label>
                <Input
                  type="number"
                  value={maxPerWallet}
                  onChange={(e) => setMaxPerWallet(Number(e.target.value))}
                  disabled={!!d}
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label>Owner wallet</Label>
              <Input
                className="font-mono text-xs"
                value={project.wallet || address || ""}
                onChange={(e) => update({ wallet: e.target.value })}
                disabled={!!d}
              />
            </div>
            <div className="grid gap-1">
              <Label>Base URI (set at reveal, after upload)</Label>
              <Input className="font-mono text-xs" value={project.upload?.baseUri ?? ""} readOnly />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>Public mint enabled at launch</span>
              <Switch checked={publicMint} onCheckedChange={setPublicMint} disabled={!!d} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Deploys the real <code className="font-mono text-xs">RashitoCollection</code> ERC-721
              contract to {chain.name} directly from your connected wallet. You sign and pay gas -
              Rashito never holds a private key.
            </p>
            {!isConnected ? (
              <ConnectWallet full />
            ) : !onRightNetwork && !d ? (
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => switchChainAsync({ chainId: targetChain.id })}
              >
                Switch to {chain.name} to deploy
              </Button>
            ) : busy ? (
              <div className="space-y-2">
                <Progress value={66} />
                <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> {busy}
                </p>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={deploy} disabled={!!d}>
                <Rocket /> {d ? "Contract deployed" : "Deploy Contract"}
              </Button>
            )}
            {d ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Contract address</span>
                  <code className="break-all font-mono text-xs">{d.address}</code>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Transaction hash</span>
                  <code className="break-all font-mono text-xs">{d.txHash}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>{chain.name}</span>
                </div>
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <a
                    href={`${chain.explorer}/address/${d.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye /> View on block explorer
                  </a>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <NextBar
        label="Continue to minting"
        hint={d ? "Contract live" : "Deploy first"}
        disabled={!d}
        onClick={next}
      />
    </div>
  );
}

/* ---------------- Step 10: Mint ---------------- */
function MintStep({ project, update }: { project: Project; update: StepProps["update"] }) {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const activeChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const targetChain = resolveChain(project.chain);
  const publicClient = usePublicClient({ chainId: targetChain.id });
  const { writeContractAsync } = useWriteContract();

  const [qty, setQty] = useState(1);
  const [reserveQty, setReserveQty] = useState(1);
  const [batchSize, setBatchSize] = useState(100);
  const [busy, setBusy] = useState<string | null>(null);
  const d = project.deployment;
  const contractAddress = d?.address as Address | undefined;
  const onRightNetwork = activeChainId === targetChain.id;

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "totalSupply",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress, refetchInterval: 15_000 },
  });
  const { data: onChainPrice } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "mintPrice",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress },
  });
  const { data: publicMintOn, refetch: refetchPublicMint } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "publicMintEnabled",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress },
  });
  const { data: contractOwner } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "owner",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress },
  });
  const { data: isRevealed, refetch: refetchRevealed } = useReadContract({
    address: contractAddress,
    abi: RASHITO_COLLECTION_ABI,
    functionName: "revealed",
    chainId: targetChain.id,
    query: { enabled: !!contractAddress },
  });
  const baseUri = project.upload?.baseUri ?? "";

  const total = project.size;
  const minted = totalSupply !== undefined ? Number(totalSupply) : project.minted;
  const remaining = Math.max(0, total - minted);
  const priceWei = onChainPrice ?? (d ? parseEther(d.mintPrice) : 0n);
  const isOwner =
    !!address && !!contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
  const mintLink =
    contractAddress && typeof window !== "undefined"
      ? `${window.location.origin}/mint/${project.chain}/${contractAddress}`
      : "";

  const ensureRightNetwork = async () => {
    if (activeChainId !== targetChain.id) {
      setBusy("Switching network…");
      await switchChainAsync({ chainId: targetChain.id });
    }
  };

  const mint = async () => {
    if (!d || !contractAddress) {
      toast.error("Deploy the contract first");
      return;
    }
    if (!isConnected || !address) {
      toast.error("Connect your wallet to mint");
      return;
    }
    if (!publicMintOn) {
      toast.error("Public mint isn't open on this contract yet");
      return;
    }
    if (qty < 1) return;
    try {
      await ensureRightNetwork();
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
      const fresh = await refetchSupply();
      update((p) => ({ minted: Number(fresh.data ?? p.minted + qty) }));
      toast.success(`Minted ${qty} NFT${qty > 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setBusy(null);
    }
  };

  const reserveMint = async () => {
    if (!d || !contractAddress) {
      toast.error("Deploy the contract first");
      return;
    }
    if (!isConnected || !address) {
      toast.error("Connect your wallet to mint");
      return;
    }
    if (!isOwner) {
      toast.error("Only the contract owner can use reserve mint");
      return;
    }
    if (reserveQty < 1) return;
    try {
      await ensureRightNetwork();
      setBusy("Confirm the free reserve mint in your wallet…");
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "ownerMint",
        args: [address, BigInt(reserveQty)],
        chainId: targetChain.id,
      });
      setBusy("Waiting for confirmation…");
      await publicClient!.waitForTransactionReceipt({ hash });
      const fresh = await refetchSupply();
      update((p) => ({ minted: Number(fresh.data ?? p.minted + reserveQty) }));
      toast.success(
        `Reserved ${reserveQty} NFT${reserveQty > 1 ? "s" : ""} to your wallet, free of charge`,
      );
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Reserve mint failed");
    } finally {
      setBusy(null);
    }
  };

  const revealNow = async () => {
    if (!contractAddress || !baseUri) {
      toast.error("Upload the collection first so there is metadata to reveal");
      return;
    }
    if (!isConnected || !isOwner) {
      toast.error("Connect the contract owner wallet to reveal");
      return;
    }
    try {
      await ensureRightNetwork();
      setBusy("Confirm the reveal in your wallet…");
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "reveal",
        args: [baseUri],
        chainId: targetChain.id,
      });
      setBusy("Waiting for confirmation…");
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchRevealed();
      toast.success("Revealed: every token now shows its real artwork and traits");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Reveal failed");
    } finally {
      setBusy(null);
    }
  };

  /** Mints every remaining token to the owner wallet in several smaller transactions. */
  const reserveAll = async () => {
    if (!d || !contractAddress || !address) {
      toast.error("Deploy the contract and connect your wallet first");
      return;
    }
    if (!isOwner) {
      toast.error("Only the contract owner can use reserve mint");
      return;
    }
    const size = Math.max(1, Math.min(200, Math.floor(batchSize) || 100));
    let left = remaining;
    if (left < 1) return;
    const batches = Math.ceil(left / size);
    try {
      await ensureRightNetwork();
      let n = 0;
      while (left > 0) {
        const q = Math.min(size, left);
        n += 1;
        setBusy(`Batch ${n} of ${batches} (${q} NFTs): confirm in your wallet…`);
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: RASHITO_COLLECTION_ABI,
          functionName: "ownerMint",
          args: [address, BigInt(q)],
          chainId: targetChain.id,
        });
        setBusy(`Batch ${n} of ${batches}: waiting for confirmation…`);
        await publicClient!.waitForTransactionReceipt({ hash });
        left -= q;
        const fresh = await refetchSupply();
        update((p) => ({ minted: Number(fresh.data ?? p.minted + q) }));
      }
      toast.success("The whole collection is minted to your wallet");
    } catch (err) {
      console.error(err);
      toast.error(
        (err instanceof Error ? err.message : "Reserve mint failed") +
          " - batches already confirmed are kept. Press the button again to continue.",
      );
    } finally {
      setBusy(null);
    }
  };

  const togglePublicMint = async (enabled: boolean) => {
    if (!contractAddress) return;
    try {
      setBusy(enabled ? "Opening public mint…" : "Pausing public mint…");
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: RASHITO_COLLECTION_ABI,
        functionName: "setPublicMintEnabled",
        args: [enabled],
        chainId: targetChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      await refetchPublicMint();
      toast.success(enabled ? "Public mint is live" : "Public mint paused");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mint your collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minted on-chain</span>
              <span className="font-mono">
                {minted} / {total}
              </span>
            </div>
            <Progress value={(minted / Math.max(1, total)) * 100} />

            {contractAddress && isRevealed === false ? (
              <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                <p className="font-medium text-amber-300">Not revealed yet</p>
                <p className="text-muted-foreground">
                  Until you reveal, every token shows the placeholder &quot;(Unrevealed)&quot; on
                  OpenSea and in wallets. Reveal once, before you mint and list, so each NFT shows
                  its real artwork and traits. Owner-only, one transaction.
                </p>
                {isOwner ? (
                  <Button size="sm" onClick={revealNow} disabled={!!busy || !baseUri}>
                    Reveal collection
                  </Button>
                ) : (
                  <p className="text-muted-foreground">
                    Connect the contract owner wallet to reveal.
                  </p>
                )}
              </div>
            ) : null}
            {contractAddress && isRevealed === true ? (
              <p className="text-xs text-success">Revealed: tokens show their real metadata.</p>
            ) : null}

            <Tabs defaultValue="public">
              <TabsList className="w-full">
                <TabsTrigger value="public" className="flex-1">
                  Public Sale
                </TabsTrigger>
                <TabsTrigger value="reserve" className="flex-1">
                  Reserve to My Wallet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>
                    Public mint is {publicMintOn ? "open" : "closed"} ·{" "}
                    {d ? formatEther(priceWei) : "0"}{" "}
                    {CHAINS.find((c) => c.id === project.chain)!.symbol} / token
                  </span>
                  <Switch
                    checked={!!publicMintOn}
                    onCheckedChange={togglePublicMint}
                    disabled={!contractAddress || !!busy}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with a wallet can mint at this price once open - including through your
                  shareable mint link below. You collect the ETH as they mint.
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
                      Total: {d ? formatEther(priceWei * BigInt(qty)) : "0"}{" "}
                      {CHAINS.find((c) => c.id === project.chain)!.symbol} + gas. Each click submits
                      a real transaction, signed by your wallet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reserve" className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Mint straight to your own wallet for free - you only pay gas, no mint price. Use
                  this if you'd rather hold the collection yourself and list individual pieces on
                  OpenSea, Blur, or anywhere else at your own price. Owner-only.
                </p>
                {!isConnected ? (
                  <ConnectWallet full />
                ) : !isOwner ? (
                  <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                    Connected wallet isn't the contract owner, so reserve mint isn't available here.
                  </p>
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
                        value={reserveQty}
                        onChange={(e) => setReserveQty(Math.max(1, Number(e.target.value)))}
                      />
                      <Button onClick={reserveMint} disabled={remaining <= 0} variant="secondary">
                        <Gift /> Reserve {reserveQty} (Free)
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total: 0 {CHAINS.find((c) => c.id === project.chain)!.symbol} + gas only.
                    </p>
                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        Mint everything that is left ({remaining}) to your wallet in batches, so no
                        single transaction is too big. Each batch is one wallet confirmation.
                      </p>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="batch" className="text-xs">
                          Batch size
                        </Label>
                        <Input
                          id="batch"
                          className="w-24"
                          type="number"
                          min={1}
                          max={200}
                          value={batchSize}
                          onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
                        />
                        <Button onClick={reserveAll} disabled={remaining <= 0}>
                          <Gift /> Mint all {remaining} to my wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Share with your community</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Your collection is live on {CHAINS.find((c) => c.id === project.chain)!.name}. Share
              this link so anyone can mint directly - it works for any visitor, on any device, with
              no Rashito account needed.
            </p>
            {mintLink ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-border p-3">
                  <code className="break-all font-mono text-xs text-muted-foreground">
                    {mintLink}
                  </code>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    void navigator.clipboard?.writeText(mintLink);
                    toast.success("Mint link copied");
                  }}
                >
                  <Copy /> Copy public mint link
                </Button>
              </div>
            ) : null}
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => navigate({ to: "/collection/$id", params: { id: project.id } })}
            >
              Open collection dashboard <ArrowRight />
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/dashboard">Back to my projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
