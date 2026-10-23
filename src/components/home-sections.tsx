import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Flame, KeyRound, Lock, Percent, Vote } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Counter, Reveal } from "@/components/motion";
import { GenesisStack } from "@/components/genesis-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GALLERY,
  GENESIS,
  rarityLabel,
  traitName,
  type Combo,
  type LayerKey,
} from "@/lib/genesis-art";
import { TOKEN_ALLOCATION } from "@/lib/tokenomics";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

/** Muted looping video that only plays while it is on screen and `active`. */
export function LoopVideo({
  src,
  poster,
  active = true,
  className = "",
  style,
}: {
  src: string;
  poster: string;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active && visible && !reduced()) void el.play().catch(() => undefined);
    else el.pause();
  }, [active, visible]);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}

/** Headline whose words rise in one after another (pure CSS, works before hydration). */
export function Kinetic({
  parts,
  className = "",
}: {
  parts: { t: string; g?: boolean }[];
  className?: string;
}) {
  let i = 0;
  return (
    <h1 className={className}>
      {parts.map((p) =>
        p.t.split(" ").map((w) => (
          <Fragment key={`${p.t}-${w}-${i}`}>
            <span className="word-wrap">
              <span
                className={`word ${p.g ? "text-gradient" : ""}`}
                style={{ animationDelay: `${150 + i++ * 90}ms` }}
              >
                {w}
              </span>
            </span>{" "}
          </Fragment>
        )),
      )}
    </h1>
  );
}

/** Infinite horizontal ticker. Children are rendered twice for a seamless loop. */
export function Ticker({
  items,
  reverse = false,
  className = "",
}: {
  items: ReactNode[];
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
    >
      <div
        className="flex w-max items-center gap-10 hover:[animation-play-state:paused]"
        style={{ animation: `marquee 40s linear infinite ${reverse ? "reverse" : ""}` }}
      >
        {[...items, ...items].map((it, i) => (
          <div key={i} className="shrink-0">
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionTag({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
      <span>{n}</span>
      <span className="h-px w-10 bg-primary/50" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: live trait-swapping Genesis showcase                          */
/* ------------------------------------------------------------------ */

const CYCLE: LayerKey[] = ["armor", "helmet", "visor", "background", "cape", "effects"];
const CHIP_LAYERS: LayerKey[] = ["background", "armor", "helmet", "visor"];

export function HeroShowcase() {
  const [combo, setCombo] = useState<Combo>({
    background: "moonlit-torii-falls",
    cape: "torn-crimson",
    weapon: "twin-katanas-crossed",
    armor: "black-antique-gold",
    helmet: "gold-crescent-horns",
    visor: "cyan",
    effects: null,
  });
  const [last, setLast] = useState<LayerKey>("armor");
  const tick = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced() || !inView) return;
    const id = window.setInterval(() => {
      const layer = CYCLE[tick.current % CYCLE.length]!;
      tick.current += 1;
      setCombo((c) => {
        const opts = GENESIS[layer].map((t) => t.id);
        const optional = layer === "cape" || layer === "effects";
        const pool: (string | null)[] = optional ? [...opts, null] : opts;
        const cur = pool.indexOf(c[layer] ?? null);
        return { ...c, [layer]: pool[(cur + 1) % pool.length] };
      });
      setLast(layer);
    }, 2300);
    return () => window.clearInterval(id);
  }, [inView]);

  const onMove = (e: React.PointerEvent) => {
    const el = tilt.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  };

  return (
    <div
      ref={box}
      className="relative mx-auto w-full max-w-[520px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl orb" />
      <div
        ref={tilt}
        className="relative transition-transform duration-300 ease-out will-change-transform"
      >
        <div className="hud-frame relative overflow-hidden rounded-3xl border border-primary/30 bg-black glow">
          <GenesisStack
            all
            combo={combo}
            label="Rashito Genesis ape samurai preview that changes traits automatically"
            className="w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-9 pb-6 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/90">
            <span className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Live preview
            </span>
            <span className="hidden sm:inline">Genesis / Preview art</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHIP_LAYERS.map((l) => {
            const id = combo[l] ?? null;
            const w = GENESIS[l].find((t) => t.id === id)?.w ?? 0;
            return (
              <div
                key={l}
                className={`rounded-xl border px-3 py-2 transition-colors duration-500 ${
                  last === l ? "border-primary/70 bg-primary/10" : "border-border bg-card/60"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {l}
                </div>
                <div className="truncate text-xs font-medium">{traitName(l, id)}</div>
                <div className="text-[10px] text-accent">{w ? rarityLabel(w) : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pinned scroll story with the three videos                           */
/* ------------------------------------------------------------------ */

const STORY = [
  {
    key: "layers",
    n: "01",
    tag: "Layers",
    title: "Stack traits. Watch a legend assemble.",
    body: "Drop in your layers, set the order and see every NFT render live. Thousands of unique combinations from a handful of drawings, with no code.",
    chips: ["Drag-and-drop layers", "Live stack preview", "Import a ready layer pack"],
    video: "/media/layers.mp4",
    poster: "/media/layers.webp",
  },
  {
    key: "rarity",
    n: "02",
    tag: "Rarity",
    title: "Rarity you control, down to the trait.",
    body: "Weight every trait from Common to Mythic, add rules so impossible combinations never ship, and generate a collection with no duplicates.",
    chips: ["Weighted rarity engine", "Trait rules", "Deduplicated generation"],
    video: "/media/rarity.mp4",
    poster: "/media/rarity.webp",
  },
  {
    key: "ownership",
    n: "03",
    tag: "Ownership",
    title: "Deploy it. Mint it. Own it.",
    body: "Pin art and metadata to IPFS, deploy your own ERC-721 contract with on-chain royalties, and mint. The contract lives in your wallet, not on our servers.",
    chips: ["IPFS pinning", "ERC-2981 royalties", "Allowlist and public mint"],
    video: "/media/ownership.mp4",
    poster: "/media/ownership.webp",
  },
] as const;

export function ScrollStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset["i"]));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className="relative border-y border-border/60 bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Reveal>
          <SectionTag n="01">How Rashito works</SectionTag>
          <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">
            From a few drawings to a live collection.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* sticky video stage (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="hud-frame relative aspect-video overflow-hidden rounded-3xl border border-primary/30 bg-black glow">
                {STORY.map((s, i) => (
                  <LoopVideo
                    key={s.key}
                    src={s.video}
                    poster={s.poster}
                    active={active === i}
                    className="absolute inset-0 size-full object-cover transition-opacity duration-700"
                    style={{ opacity: active === i ? 1 : 0 }}
                  />
                ))}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-5 font-mono text-xs uppercase tracking-[0.25em] text-white/80">
                  <span>
                    {STORY[active]!.n} / 03 — {STORY[active]!.tag}
                  </span>
                  <span className="flex gap-1.5">
                    {STORY.map((s, i) => (
                      <span
                        key={s.key}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === active ? "w-8 bg-primary" : "w-3 bg-white/30"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* scrolling steps */}
          <div>
            {STORY.map((s, i) => (
              <div
                key={s.key}
                data-i={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`flex flex-col justify-center gap-5 py-10 transition-opacity duration-500 lg:min-h-[78vh] ${
                  active === i ? "lg:opacity-100" : "lg:opacity-35"
                }`}
              >
                <div className="aspect-video overflow-hidden rounded-2xl border border-border lg:hidden">
                  <LoopVideo src={s.video} poster={s.poster} className="size-full object-cover" />
                </div>
                <div className="font-display text-6xl font-bold text-primary/30 sm:text-7xl">
                  {s.n}
                </div>
                <h3 className="text-2xl font-bold sm:text-4xl">{s.title}</h3>
                <p className="max-w-md text-muted-foreground">{s.body}</p>
                <div className="flex flex-wrap gap-2">
                  {s.chips.map((c) => (
                    <Badge key={c} variant="outline" className="px-3 py-1">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button asChild size="lg" className="mt-4">
              <Link to="/dashboard">
                Start building <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Genesis gallery band                                                */
/* ------------------------------------------------------------------ */

function GalleryCard({ combo, i }: { combo: Combo; i: number }) {
  return (
    <div className="group w-52 sm:w-64">
      <div className="overflow-hidden rounded-2xl border border-border bg-black transition duration-300 group-hover:-translate-y-2 group-hover:border-primary/60 group-hover:shadow-[0_20px_60px_-20px_var(--color-primary)]">
        <GenesisStack
          combo={combo}
          label={`Genesis preview ${i + 1}`}
          className="w-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Genesis #{String(i + 1).padStart(3, "0")}</span>
        <span>{traitName("helmet", combo.helmet)}</span>
      </div>
    </div>
  );
}

export function GenesisBand() {
  const row1 = GALLERY.map((c, i) => <GalleryCard key={i} combo={c} i={i} />);
  const row2 = [...GALLERY].reverse().map((c, i) => <GalleryCard key={i} combo={c} i={i + 8} />);
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionTag n="02">The collection</SectionTag>
            <h2 className="text-3xl font-bold sm:text-5xl">
              Rashito <span className="text-gradient">Genesis</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              An 800+ piece collection of armored ape samurai, built with the same Studio every
              creator uses. Every piece is a unique, rarity-weighted stack of traits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="gap-2 px-3 py-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
              Coming soon
            </Badge>
            <Button asChild variant="secondary">
              <Link to="/explore">
                Explore collections <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
      <div className="mt-12 space-y-6">
        <Ticker items={row1} />
        <Ticker items={row2} reverse />
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-4 text-xs text-muted-foreground">
        Preview art from the Genesis trait pack. Final traits, supply and mint details may change
        and will be announced on our channels.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Studio toolkit bento                                                */
/* ------------------------------------------------------------------ */

export function Bento({
  items,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[];
}) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f, i) => (
        <Reveal
          key={f.title}
          delay={(i % 3) * 90}
          className={i === 0 || i === 3 || i === 4 ? "lg:col-span-2" : ""}
        >
          <div onPointerMove={onMove} className="spot lift glass h-full rounded-2xl p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RASH token (investors)                                              */
/* ------------------------------------------------------------------ */

const BAR_COLORS = ["#22d3ee", "#f59e0b", "#34d399", "#f472b6", "#a78bfa", "#60a5fa"];

function AllocationBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") {
      setGo(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setGo(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="space-y-4">
      {TOKEN_ALLOCATION.map((a, i) => (
        <div key={a.name}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{a.name}</span>
            <span className="font-mono text-muted-foreground">{a.value}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full origin-left rounded-full transition-transform duration-[1400ms] ease-out"
              style={{
                width: `${a.value * 3}%`,
                maxWidth: "100%",
                background: BAR_COLORS[i % BAR_COLORS.length],
                transform: go ? "scaleX(1)" : "scaleX(0)",
                transitionDelay: `${i * 120}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const UTILITY = [
  { icon: Percent, t: "Fee discounts", d: "Lower costs on Studio deployment and pinning." },
  { icon: Vote, t: "Governance", d: "Vote on protocol parameters and roadmap priorities." },
  { icon: Lock, t: "Staking", d: "Stake RASH for ecosystem rewards and early access to drops." },
  {
    icon: KeyRound,
    t: "Allowlist access",
    d: "Marketplace credit and allowlists across partner collections.",
  },
];

export function TokenSection() {
  return (
    <section className="relative border-y border-border/60 bg-black/30 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <SectionTag n="03">The RASH token</SectionTag>
          <h2 className="max-w-3xl text-3xl font-bold sm:text-5xl">
            A scarce supply that can <span className="text-gradient">never grow</span>.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal direction="left">
            <div className="glass h-full rounded-3xl p-8">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Fixed total supply
              </div>
              <div className="mt-2 font-display text-5xl font-bold sm:text-7xl text-gradient">
                <Counter to={3000000} duration={1800} />
              </div>
              <div className="mt-1 text-muted-foreground">RASH · ERC-20</div>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3">
                  <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
                  Minted once at deployment. The contract has no mint function afterwards.
                </li>
                <li className="flex gap-3">
                  <Flame className="mt-0.5 size-4 shrink-0 text-primary" />
                  Burnable, so supply can only go down.
                </li>
                <li className="flex gap-3">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
                  Gasless approvals with EIP-2612 permit.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/tokenomics">
                    Full tokenomics <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/whitepaper">Read the whitepaper</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/staking">Staking</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={120}>
            <div className="glass h-full rounded-3xl p-8">
              <div className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Allocation
              </div>
              <AllocationBars />
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UTILITY.map((u, i) => (
            <Reveal key={u.t} delay={i * 90}>
              <div className="lift glass h-full rounded-2xl p-5">
                <u.icon className="size-5 text-accent" />
                <div className="mt-3 font-semibold">{u.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{u.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Utility is planned and activates in phases per the roadmap. This is not financial advice.
          RASH is a utility token for the Rashito ecosystem. Digital assets carry risk, including
          total loss. Do your own research.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap with scroll-drawn line                                      */
/* ------------------------------------------------------------------ */

const PHASES = [
  {
    p: "Phase 1",
    t: "Foundation",
    d: "Studio v1, real wallet, deploy and mint stack, collection and token contracts.",
    s: "Current",
  },
  {
    p: "Phase 2",
    t: "Launch",
    d: "First creator collections live, RASH token generation event and initial liquidity.",
    s: "Next",
  },
  {
    p: "Phase 3",
    t: "Utility",
    d: "RASH fee discounts, staking and an on-chain governance portal.",
    s: "Planned",
  },
  {
    p: "Phase 4",
    t: "Expansion",
    d: "More chains, marketplace integrations and creator revenue-sharing programs.",
    s: "Planned",
  },
];

export function Roadmap() {
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const ln = line.current;
    if (!el || !ln) return;
    if (reduced()) {
      ln.style.transform = "scaleY(1)";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.65 - r.top) / r.height;
      ln.style.transform = `scaleY(${Math.max(0, Math.min(1, p))})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <Reveal>
        <SectionTag n="04">Roadmap</SectionTag>
        <h2 className="text-3xl font-bold sm:text-5xl">Where Rashito is going.</h2>
      </Reveal>
      <div ref={wrap} className="relative mt-12 pl-10">
        <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />
        <div
          ref={line}
          className="absolute bottom-0 left-[11px] top-0 w-px origin-top scale-y-0 bg-gradient-to-b from-primary to-accent"
        />
        {PHASES.map((ph, i) => (
          <Reveal key={ph.p} delay={i * 60} className="relative pb-12 last:pb-0">
            <span
              className={`absolute -left-10 top-1 grid size-6 place-items-center rounded-full border-2 bg-background ${
                ph.s === "Current" ? "border-primary" : "border-border"
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  ph.s === "Current" ? "animate-pulse bg-primary" : "bg-muted-foreground/50"
                }`}
              />
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {ph.p}
              </span>
              <Badge variant={ph.s === "Current" ? "default" : "outline"}>{ph.s}</Badge>
            </div>
            <h3 className="mt-1 text-2xl font-bold">{ph.t}</h3>
            <p className="mt-1 max-w-xl text-muted-foreground">{ph.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA over the ownership video                                */
/* ------------------------------------------------------------------ */

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border/60">
      <LoopVideo
        src="/media/ownership.mp4"
        poster="/media/ownership.webp"
        className="absolute inset-0 -z-10 size-full object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/40" />
      <div className="mx-auto max-w-4xl px-4 py-28 text-center">
        <Reveal>
          <h2 className="text-4xl font-bold sm:text-6xl">
            Bring the art. <span className="text-gradient">Leave with a legend.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start your first collection in under a minute, or hold the token behind the platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                Launch Creator Studio <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/tokenomics">View RASH tokenomics</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
