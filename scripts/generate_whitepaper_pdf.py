"""Generates public/whitepaper.pdf for the Rashito project. Run with:
    python3 scripts/generate_whitepaper_pdf.py
The same content (kept in sync by hand) is rendered in-app at /whitepaper.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    ListFlowable,
    ListItem,
)
from reportlab.lib import colors

OUT = "public/whitepaper.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="RTitle", fontSize=28, leading=34, alignment=TA_CENTER, spaceAfter=6, textColor=colors.HexColor("#1a1a2e")))
styles.add(ParagraphStyle(name="RSubtitle", fontSize=13, alignment=TA_CENTER, textColor=colors.HexColor("#555577"), spaceAfter=24))
styles.add(ParagraphStyle(name="RH1", fontSize=18, leading=22, spaceBefore=18, spaceAfter=8, textColor=colors.HexColor("#1a1a2e")))
styles.add(ParagraphStyle(name="RH2", fontSize=13, leading=16, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor("#3a3a5e")))
styles.add(ParagraphStyle(name="RBody", fontSize=10.3, leading=15, spaceAfter=8, textColor=colors.HexColor("#222233")))
styles.add(ParagraphStyle(name="RSmall", fontSize=8.5, leading=12, textColor=colors.HexColor("#666677")))

story = []

story.append(Spacer(1, 1.4 * inch))
story.append(Paragraph("Rashito", styles["RTitle"]))
story.append(Paragraph("A no-code studio for real, wallet-signed NFT collections — and RASH, its fixed-supply utility token", styles["RSubtitle"]))
story.append(Paragraph("Whitepaper — Draft v1.0", styles["RSmall"]))
story.append(PageBreak())


def h1(text):
    story.append(Paragraph(text, styles["RH1"]))


def h2(text):
    story.append(Paragraph(text, styles["RH2"]))


def body(text):
    story.append(Paragraph(text, styles["RBody"]))


def bullets(items):
    story.append(
        ListFlowable(
            [ListItem(Paragraph(i, styles["RBody"]), bulletColor=colors.HexColor("#666677")) for i in items],
            bulletType="bullet",
            leftIndent=16,
        )
    )
    story.append(Spacer(1, 6))


# 1. Abstract
h1("1. Abstract")
body(
    "Rashito is a full-stack platform for creating, deploying, and minting generative NFT collections directly "
    "from a connected wallet, without writing code or hiring a smart-contract engineer. Every deployment and "
    "mint is a real, wallet-signed on-chain transaction; Rashito never holds a private key or custodial funds. "
    "Alongside the Studio, Rashito maintains RASH, a fixed-supply utility token (1,000,000,000 total "
    "supply) that anchors the ecosystem's tokenomics."
)

# 2. Problem & Solution
h1("2. Problem &amp; Solution")
h2("2.1 The problem")
body(
    "Launching an NFT collection today typically means stitching together separate tools: design software for "
    "trait layers, a spreadsheet for rarity weighting, a manual or scripted process for pinning files to IPFS, a "
    "smart contract written or copy-pasted from a template, a deploy script requiring command-line comfort, and "
    "a separate mint site. Each step is a point of failure, and most of the tooling assumes the creator already "
    "has engineering support."
)
h2("2.2 The Rashito approach")
body(
    "Rashito unifies the entire pipeline into one guided workflow: build layers and traits, set weighted rarity, "
    "generate the full collection with live rarity scoring, pin art and metadata to real IPFS storage, deploy an "
    "audited-pattern ERC-721 contract straight from your own wallet, and open minting - all from a single "
    "browser tab."
)

# 3. Product architecture
h1("3. Product Architecture")
h2("3.1 The Studio")
bullets(
    [
        "Layer &amp; trait editor with per-trait rarity weighting and live probability feedback",
        "Rule engine for trait exclusions/requirements (e.g. certain hats can't appear with certain eyes)",
        "Deterministic collection generator with duplicate detection",
        "Real IPFS pinning for images and metadata",
        "Guided deploy wizard: name, symbol, supply, price, royalty, per-wallet limits",
    ]
)
h2("3.2 Real Web3, not a simulation")
body(
    "Wallet connection (MetaMask, Coinbase Wallet, WalletConnect), contract deployment, and minting all run "
    "through wagmi and viem against live chains - Ethereum, Base, Polygon, BNB Chain, and their public testnets. "
    "Every transaction is signed by the creator's own wallet; Rashito's servers never see a private key."
)
h2("3.3 Smart contracts")
body(
    "<b>RashitoCollection.sol</b> - an ERC-721 contract (OpenZeppelin 5.x) with capped supply, public and "
    "allowlist minting (Merkle-proof gated), per-wallet mint limits, ERC-2981 on-chain royalties, a pausable "
    "mint switch, a pre-reveal placeholder URI with owner-triggered reveal, and a secure owner withdraw function."
)
body(
    "<b>RashitoToken.sol</b> - a fixed-supply ERC-20 (OpenZeppelin 5.x) that mints its entire 1,000,000,000 RASH "
    "supply once, at deployment, to a treasury address. There is no further mint function of any kind - RASH "
    "holders never face dilution from this contract. The token is burnable and supports gasless approvals "
    "(EIP-2612 permit)."
)


# 4. RASH token
h1("4. The RASH Token")
h2("4.1 Fixed supply")
body(
    "RASH has a hard-capped total supply of 1,000,000,000 tokens, minted once at contract deployment. This "
    "figure can never increase - the contract has no mint function beyond the constructor."
)
h2("4.2 Utility")
bullets(
    [
        "Fee discounts on Studio usage (deployment and pinning services)",
        "Governance over protocol parameters and roadmap prioritization",
        "Staking for ecosystem rewards and priority access to future drops",
        "Marketplace credit and allowlist access across Rashito-affiliated collections",
    ]
)
body(
    "Utility mechanisms above describe the intended design and will be activated in phases per the roadmap "
    "(Section 6); none are live at initial token deployment."
)

# 6. Tokenomics summary
h1("5. Tokenomics Summary")
body("Full breakdowns, allocation charts, and vesting notes live on the in-app Tokenomics page. Summary:")

t1 = Table(
    [
        ["RASH Token — 1,000,000,000 supply", ""],
        ["Public / Liquidity", "30%"],
        ["Team & Advisors (vested)", "20%"],
        ["Ecosystem & Staking Rewards", "20%"],
        ["Treasury", "15%"],
        ["Marketing & Partnerships", "10%"],
        ["Community Airdrops", "5%"],
    ],
    colWidths=[3.6 * inch, 1.4 * inch],
)
t1.setStyle(
    TableStyle(
        [
            ("SPAN", (0, 0), (1, 0)),
            ("BACKGROUND", (0, 0), (1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddde5")),
            ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ]
    )
)
story.append(t1)

# 6. Roadmap
h1("6. Roadmap")
bullets(
    [
        "<b>Phase 1 — Foundation (current):</b> Studio v1, real wallet/deploy/mint stack, RashitoCollection and "
        "RashitoToken contracts shipped",
        "<b>Phase 2 — Launch:</b> First creator collections live, RASH token generation event and initial "
        "liquidity, social channels live",
        "<b>Phase 3 — Utility:</b> RASH fee discounts, staking, on-chain governance portal",
        "<b>Phase 4 — Expansion:</b> additional chains, marketplace integrations, creator revenue-sharing programs",
    ]
)

# 7. Team
h1("7. Team &amp; Community")
body(
    "Rashito is built and maintained by its founding team, with roadmap input from its creator community. "
    "Team bios and public profiles will be published alongside the Phase 2 launch."
)

# 8. Legal
h1("8. Legal Disclaimer")
body(
    "This document is provided for informational purposes only and does not constitute financial, legal, tax, "
    "or investment advice, nor an offer or solicitation to buy or sell any security or financial instrument. "
    "RASH is a utility asset intended for use within the Rashito ecosystem and is not designed to be, and "
    "should not be treated as, a security. Figures, timelines, and features described here "
    "are subject to change. Participation in any token or NFT mint carries risk, including total loss of funds; "
    "do your own research and consult a qualified professional before participating."
)

doc = SimpleDocTemplate(OUT, pagesize=letter, topMargin=0.9 * inch, bottomMargin=0.9 * inch)
doc.build(story)
print("Wrote", OUT)
