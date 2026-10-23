import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  Dice5,
  Layers,
  Rocket,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
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
import { Counter, Reveal, ScrollProgress } from "@/components/motion";
import {
  Bento,
  CtaBand,
  GenesisBand,
  HeroShowcase,
  Kinetic,
  LoopVideo,
  Roadmap,
  ScrollStory,
  SectionTag,
  Ticker,
  TokenSection,
} from "@/components/home-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rashito — Forge Legends On-Chain" },
      {
        name: "description",
        content:
          "Rashito is an NFT collection creator studio: build layers and traits, generate art, pin to IPFS, deploy contracts and mint — no coding required.",
      },
      { property: "og:title", content: "Rashito — Forge Legends On-Chain" },
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
    body: "Drag layers into order, toggle them and watch the stack render live. Import a whole layer pack in one click.",
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
    title: "Built-in IPFS pinning",
    body: "Upload inside Rashito. Images and metadata are pinned for you, with a ready-to-use base URI.",
  },
  {
    icon: Rocket,
    title: "One-click deploy and mint",
    body: "ERC-721, on-chain royalties, mint price, allowlists and batch minting.",
  },
];

const TICKER = [
  "ERC-721",
  "IPFS",
  "ERC-2981 royalties",
  "Base",
  "Ethereum",
  "Polygon",
  "BNB Chain",
  "Merkle allowlists",
  "Layer packs",
  "Rarity engine",
  "Reveal mechanic",
];

const FAQ: [string, string][] = [
  [
    "Do I need coding skills?",
    "No. Rashito handles layering, metadata, storage and contract configuration for you.",
  ],
  [
    "What is Rashito Genesis?",
    "Rashito Genesis is our flagship collection of armored ape samurai, an 800+ piece set built with the same Studio creators use. It is coming soon; mint details will be announced on our channels.",
  ],
  [
    "What is RASH for?",
    "RASH is the platform's utility token with a fixed supply of 3,000,000. Planned utility includes fee discounts, staking, governance and allowlist access, activated in phases per the roadmap.",
  ],
  [
    "What art do I need?",
    "Bring transparent PNG or WebP trait images per layer. You can also import a ready-made layer pack folder in one click.",
  ],
  [
    "How is rarity calculated?",
    "Each trait carries a weight. Rashito converts weights into percentages and scores each NFT.",
  ],
  [
    "Where are files stored?",
    "Images and metadata are pinned to IPFS from inside Rashito, and the base URI is written into your contract.",
  ],
  [
    "Can I edit an NFT after generating?",
    "Yes. Open any token in the review gallery, swap traits, lock layers or regenerate it.",
  ],
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <ScrollProgress />
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <LoopVideo
          src="/media/layers.mp4"
          poster="/media/layers.webp"
          className="absolute inset-0 -z-20 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="grid-bg absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="orb pointer-events-none absolute -left-24 top-10 -z-10 size-80 rounded-full bg-primary/15 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1.5">
                <Sparkles className="size-3 text-accent" /> Rashito Genesis · Coming soon
              </Badge>
            </Reveal>
            <Kinetic
              className="text-5xl font-bold leading-[1.02] sm:text-7xl"
              parts={[{ t: "Forge" }, { t: "legends.", g: true }, { t: "Launch them on-chain." }]}
            />
            <p className="hero-sub mt-6 max-w-xl text-lg text-muted-foreground">
              Rashito is the no-code studio for NFT creators, and the home of{" "}
              <span className="text-foreground">Rashito Genesis</span>, an 800+ piece ape samurai
              collection powered by the RASH token.
            </p>
            <div className="hero-sub mt-8 flex flex-wrap gap-3" style={{ animationDelay: "1.5s" }}>
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Launch Creator Studio <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#how">
                  See how it works <ChevronDown />
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/tokenomics">RASH tokenomics</Link>
              </Button>
            </div>
          </div>
          <Reveal direction="zoom" delay={200}>
            <HeroShowcase />
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            { v: <Counter to={10} />, l: "guided steps, idea to mint" },
            { v: <Counter to={6} />, l: "networks supported" },
            { v: <Counter to={3000000} duration={1800} />, l: "RASH fixed supply" },
            { v: <>0</>, l: "lines of Solidity to write" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 80}>
              <div className="font-display text-3xl font-bold sm:text-4xl">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </Reveal>
          ))}
        </div>
        <div className="border-t border-border/60 py-4">
          <Ticker
            className="text-sm text-muted-foreground"
            items={TICKER.map((t) => (
              <span
                key={t}
                className="flex items-center gap-10 font-mono uppercase tracking-widest"
              >
                {t} <span className="text-primary">✦</span>
              </span>
            ))}
          />
        </div>
      </section>

      <ScrollStory />
      <GenesisBand />

      {/* TOOLKIT */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <Reveal>
          <SectionTag n="·">Studio toolkit</SectionTag>
          <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">
            Everything a studio needs, nothing it doesn&apos;t.
          </h2>
        </Reveal>
        <div className="mt-10">
          <Bento items={FEATURES} />
        </div>
      </section>

      <TokenSection />
      <Roadmap />

      <section className="mx-auto max-w-3xl px-4 pb-24">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">FAQ</h2>
        </Reveal>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <Reveal>
          <p className="mb-6 text-center text-sm text-muted-foreground">Our Partners</p>
          <PartnerMarquee />
        </Reveal>
      </section>

      <CtaBand />
      <SiteFooter />
    </div>
  );
}
