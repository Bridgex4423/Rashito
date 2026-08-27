import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/whitepaper")({
  head: () => ({
    meta: [
      { title: "Whitepaper — Rashito" },
      {
        name: "description",
        content:
          "The Rashito whitepaper: product architecture, the RASH token, tokenomics, and roadmap.",
      },
      { property: "og:title", content: "Whitepaper — Rashito" },
    ],
  }),
  component: WhitepaperPage,
});

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-24" id={`section-${n}`}>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_b]:text-foreground [&_li]:my-1">
        {children}
      </div>
      <Separator className="my-10" />
    </section>
  );
}

function WhitepaperPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="size-4" /> Whitepaper — Draft v1.0
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Rashito</h1>
        <p className="mt-3 text-muted-foreground">
          A no-code studio for real, wallet-signed NFT collections — and RASH, its fixed-supply
          utility token.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <a href="/whitepaper.pdf" download>
              <Download /> Download PDF
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/tokenomics">View full tokenomics</Link>
          </Button>
        </div>

        <Separator className="my-10" />

        <Section n="1" title="Abstract">
          <p>
            Rashito is a full-stack platform for creating, deploying, and minting generative NFT
            collections directly from a connected wallet, without writing code or hiring a
            smart-contract engineer. Every deployment and mint is a real, wallet-signed on-chain
            transaction; Rashito never holds a private key or custodial funds. Alongside the Studio,
            Rashito maintains RASH, a fixed-supply utility token (1,000,000,000 total supply) that
            anchors the ecosystem's tokenomics.
          </p>
        </Section>

        <Section n="2" title="Problem & Solution">
          <p>
            <b>The problem.</b> Launching an NFT collection today typically means stitching together
            separate tools: design software for trait layers, a spreadsheet for rarity weighting, a
            manual or scripted process for pinning files to IPFS, a smart contract written or
            copy-pasted from a template, a deploy script requiring command-line comfort, and a
            separate mint site. Each step is a point of failure.
          </p>
          <p>
            <b>The Rashito approach.</b> Rashito unifies the entire pipeline into one guided
            workflow: build layers and traits, set weighted rarity, generate the full collection
            with live rarity scoring, pin art and metadata to real IPFS storage, deploy an
            audited-pattern ERC-721 contract straight from your own wallet, and open minting - all
            from a single browser tab.
          </p>
        </Section>

        <Section n="3" title="Product Architecture">
          <p>
            <b>The Studio</b> — a layer &amp; trait editor with per-trait rarity weighting and live
            probability feedback, a rule engine for trait exclusions/requirements, a deterministic
            collection generator with duplicate detection, real IPFS pinning, and a guided deploy
            wizard.
          </p>
          <p>
            <b>Real Web3, not a simulation</b> — wallet connection (MetaMask, Coinbase Wallet,
            WalletConnect), contract deployment, and minting all run through wagmi and viem against
            live chains: Ethereum, Base, Polygon, BNB Chain, and their public testnets.
          </p>
          <p>
            <b>RashitoCollection.sol</b> — the ERC-721 contract (OpenZeppelin 5.x) every creator's
            collection deploys from, with capped supply, public and allowlist minting (Merkle-proof
            gated), per-wallet mint limits, ERC-2981 on-chain royalties, a pausable mint switch, a
            pre-reveal placeholder URI with owner-triggered reveal, and a secure owner withdraw
            function.
          </p>
          <p>
            <b>RashitoToken.sol</b> — a fixed-supply ERC-20 (OpenZeppelin 5.x) that mints its entire
            1,000,000,000 RASH supply once, at deployment, to a treasury address. There is no
            further mint function of any kind. The token is burnable and supports gasless approvals
            (EIP-2612 permit).
          </p>
        </Section>

        <Section n="4" title="The RASH Token">
          <p>
            RASH has a hard-capped total supply of 1,000,000,000 tokens, minted once at contract
            deployment. This figure can never increase - the contract has no mint function beyond
            the constructor.
          </p>
          <p>
            <b>Intended utility (activated in phases per the roadmap):</b>
          </p>
          <ul className="list-disc pl-5">
            <li>Fee discounts on Studio usage (deployment and pinning services)</li>
            <li>Governance over protocol parameters and roadmap prioritization</li>
            <li>Staking for ecosystem rewards and priority access to future drops</li>
            <li>Marketplace credit and allowlist access across Rashito-affiliated collections</li>
          </ul>
        </Section>

        <Section n="5" title="Tokenomics Summary">
          <p>
            Full breakdown, allocation chart, and vesting notes live on the{" "}
            <Link to="/tokenomics" className="text-foreground underline">
              Tokenomics page
            </Link>
            .
          </p>
        </Section>

        <Section n="6" title="Roadmap">
          <ul className="list-disc pl-5">
            <li>
              <b>Phase 1 — Foundation (current):</b> Studio v1, real wallet/deploy/mint stack,
              RashitoCollection and RashitoToken contracts shipped
            </li>
            <li>
              <b>Phase 2 — Launch:</b> First creator collections live, RASH token generation event
              and initial liquidity, social channels live
            </li>
            <li>
              <b>Phase 3 — Utility:</b> RASH fee discounts, staking, on-chain governance portal
            </li>
            <li>
              <b>Phase 4 — Expansion:</b> additional chains, marketplace integrations, creator
              revenue-sharing programs
            </li>
          </ul>
        </Section>

        <Section n="7" title="Team & Community">
          <p>
            Rashito is built and maintained by its founding team, with roadmap input from its
            creator community. Team bios and public profiles will be published alongside the Phase 2
            launch.
          </p>
        </Section>

        <Section n="8" title="Legal Disclaimer">
          <p>
            This document is provided for informational purposes only and does not constitute
            financial, legal, tax, or investment advice, nor an offer or solicitation to buy or sell
            any security or financial instrument. RASH is a utility asset intended for use within
            the Rashito ecosystem and is not designed to be, and should not be treated as, a
            security. Figures, timelines, and features described here are subject to change.
            Participation in any token or NFT mint carries risk, including total loss of funds; do
            your own research and consult a qualified professional before participating.
          </p>
        </Section>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <p className="text-sm text-muted-foreground">Want the full breakdown with charts?</p>
            <Button asChild>
              <Link to="/tokenomics">Open Tokenomics</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
