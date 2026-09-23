import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Coins,
  Dice5,
  Gauge,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PartnerMarquee } from "@/components/partner-marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rashito — Create NFT Collections Without Code" },
      {
        name: "description",
        content:
          "Rashito is an NFT collection creator studio: build layers and traits, generate art, pin to IPFS, deploy contracts and mint — no coding required.",
      },
      { property: "og:title", content: "Rashito — Create NFT Collections Without Code" },
      {
        property: "og:description",
        content:
          "From artwork to on-chain collection in one creative workflow. Layers, rarity, IPFS, deploy, mint.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Layers,
    title: "Visual layer builder",
    body: "Drag layers into order, toggle them and watch the stack render live.",
  },
  {
    icon: Dice5,
    title: "Weighted rarity engine",
    body: "Common to Mythic tiers, manual weights and validation before you generate.",
  },
  {
    icon: Wand2,
    title: "Trait rules",
    body: "Exclusions and required pairs so impossible combinations never ship.",
  },
  {
    icon: Boxes,
    title: "Deduplicated generation",
    body: "Thousands of unique NFTs with metadata built as they are created.",
  },
  {
    icon: UploadCloud,
    title: "IPFS pinning",
    body: "Images and metadata pinned, with CIDs and a ready-to-use base URI.",
  },
  {
    icon: Rocket,
    title: "One-click deploy & mint",
    body: "ERC-721 or ERC-1155, royalties, mint price and batch minting.",
  },
];

const STEPS_HOW = [
  "Create your project and set collection details",
  "Upload base artwork and build layers",
  "Add traits, weights and generation rules",
  "Generate, review and edit every NFT",
  "Pin to IPFS, deploy the contract and mint",
];

const CHAINS_SHOWN = ["Ethereum", "Base", "Polygon", "BNB Chain", "Sepolia", "Base Sepolia"];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden grid-bg">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1">
              <Sparkles className="size-3" /> NFT Collection Creator Studio
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">
              Create NFT collections <span className="text-gradient">without code</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Rashito takes you from artwork to an on-chain collection in one workflow: layers,
              traits, rarity, generation, metadata, IPFS, smart contract deployment and minting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Launch Creator Studio <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/explore">Explore Collections</Link>
              </Button>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
              <div>
                <div className="font-display text-2xl text-foreground">10</div>guided steps
              </div>
              <div>
                <div className="font-display text-2xl text-foreground">6</div>networks
              </div>
              <div>
                <div className="font-display text-2xl text-foreground">0</div>lines of Solidity
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
            <img
              src={heroImg}
              alt="Layered cyber-samurai NFT character rendered as stacked trait layers"
              width={1200}
              height={1200}
              className="relative w-full rounded-2xl border border-border glow"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold">Everything a studio needs</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Simple enough for a first collection, powerful enough for a professional generative drop.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="glass">
              <CardContent className="space-y-3 py-6">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-3xl font-bold">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-5">
            {STEPS_HOW.map((s, i) => (
              <li key={s} className="space-y-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Supported blockchains</h2>
            <p className="mt-2 text-muted-foreground">
              Launch on mainnet or rehearse the whole flow on a testnet first.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHAINS_SHOWN.map((c) => (
                <Badge key={c} variant="outline" className="px-3 py-1.5 text-sm">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Creator benefits</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {[
                {
                  icon: ShieldCheck,
                  t: "Own your contract",
                  d: "Deployed to your wallet with your royalty settings.",
                },
                {
                  icon: Gauge,
                  t: "Never lose work",
                  d: "Every layer, trait and generated NFT autosaves as you build.",
                },
                {
                  icon: Coins,
                  t: "Marketplace-ready metadata",
                  d: "Standard attributes that OpenSea-style marketplaces read.",
                },
              ].map((b) => (
                <li key={b.t} className="flex gap-3">
                  <b.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>
                    <span className="font-medium text-foreground">{b.t}.</span> {b.d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <Accordion type="single" collapsible className="mt-6">
          {[
            [
              "Do I need coding skills?",
              "No. Rashito handles layering, metadata, storage and contract configuration for you.",
            ],
            [
              "What art do I need?",
              "A base character is optional. Bring transparent PNG or WebP trait images per layer.",
            ],
            [
              "How is rarity calculated?",
              "Each trait carries a weight; Rashito converts weights into percentages and scores each NFT.",
            ],
            [
              "Where are files stored?",
              "Images and metadata are pinned to IPFS, and the resulting base URI is written into your contract.",
            ],
            [
              "Can I edit an NFT after generating?",
              "Yes. Open any token in the review gallery, swap traits, lock layers or regenerate it.",
            ],
          ].map(([q, a]) => (
            <AccordionItem key={q} value={q!}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <p className="mb-6 text-center text-sm text-muted-foreground">Our Partners</p>
        <PartnerMarquee />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <Card className="glass overflow-hidden">
          <CardContent className="flex flex-wrap items-center justify-between gap-6 py-12">
            <div>
              <h2 className="text-2xl font-bold">Bring artwork. Leave with a collection.</h2>
              <p className="mt-2 text-muted-foreground">
                Start your first project in under a minute.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/dashboard">
                Launch Creator Studio <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
