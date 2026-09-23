# Rashito

Rashito is a no-code NFT collection studio: build layers and traits, set
weighted rarity, generate art, pin it to IPFS, then deploy a real ERC-721
contract and mint - all signed by your own wallet. It also ships the **RASH**
utility token (1,000,000,000 fixed supply) and public Tokenomics and
Whitepaper pages.

- **Frontend**: TanStack Start, React 19, TypeScript, Tailwind CSS
- **Web3**: wagmi + viem, real OpenZeppelin-based `RashitoCollection.sol` and
  `RashitoToken.sol` contracts, compiled and embedded in the app (see `contracts/`)
- **Storage**: IPFS via Pinata (server function, real pinning when configured)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:8080. Connect a browser wallet (MetaMask, Coinbase
Wallet, or any injected wallet) to create a project. See **"Full local setup"**
below for the environment variables that unlock real IPFS pinning and testnet
deploys.

## What's real here

- **Wallet connection** - MetaMask/injected, Coinbase Wallet, WalletConnect
  (if configured), via `wagmi`. No mock addresses.
- **Contract deployment** - deploys the compiled `RashitoCollection`,
  `RashitoToken`, or `RashitoStaking` bytecode directly from your connected
  wallet (`viem`'s `deployContract`). You sign, you pay gas, on whatever
  chain you pick (Sepolia, Base Sepolia, Base, Polygon, BNB Chain, or
  Ethereum mainnet).
- **Minting** - calls the deployed collection contract's real `mint()` function.
- **Staking** - `/staking` lets holders stake NFTs from Rashito's official
  collection for real RASH rewards, paid from a pool the owner funds.
- **IPFS pinning** - real, via Pinata, once you add a `PINATA_JWT` (see
  below). Without a key the Upload step falls back to a clearly-labeled
  simulated CID so you can still click through the flow.

See `contracts/README.md` for all three Solidity contracts, their test
suite, and how to compile/verify them with Hardhat.

## Deploying your own collection, the RASH token, and staking

1. Connect your wallet, go to `/dashboard`, and create a project to design
   your own NFT collection through the Studio wizard (layers, traits, rarity,
   generate, upload, deploy, mint).
2. Deploy the RASH token via the Hardhat CLI (see `contracts/README.md`) -
   there's no in-app button for this by design, since minting the full fixed
   supply is a one-time, high-stakes action best done deliberately.
3. Deploy `RashitoStaking.sol` via the Hardhat CLI, pointed at your NFT
   collection and RASH token addresses, then fund its reward pool.
4. Update `src/lib/official-collection.ts`, `src/lib/official-token.ts`, and
   `src/lib/official-staking.ts` with the deployed addresses so
   `/tokenomics` and `/staking` go live with real on-chain data for every
   visitor.
5. Update `src/lib/social.ts` with your real X/Discord/Telegram/GitHub links.
6. Regenerate `public/whitepaper.pdf` if you edit the whitepaper content
   (`python3 scripts/generate_whitepaper_pdf.py` - requires `reportlab`:
   `pip install reportlab`).

## Full local setup

1. **Node.js 20+** and npm.
2. `npm install`
3. Copy the env template and fill in what you need:
   ```bash
   cp .env.example .env
   ```
   - `PINATA_JWT` - free at https://app.pinata.cloud/developers/api-keys.
     Required for real IPFS pinning (images + metadata).
   - `VITE_WALLETCONNECT_PROJECT_ID` - free at https://cloud.reown.com.
     Optional; MetaMask/Coinbase Wallet work without it.
   - The `SEPOLIA_*` / `BASE_*` / `MAINNET_*` / `ETHERSCAN_API_KEY` vars are
     only used by the optional Hardhat CLI (`npx hardhat ...`), not by the app
     itself - the app deploys straight from your browser wallet.
4. `npm run dev` and open http://localhost:8080.
5. To try a real deploy without spending real ETH: get free Sepolia test ETH
   from a faucet (e.g. https://sepoliafaucet.com), pick "Sepolia Testnet" as
   the chain when creating a project, connect MetaMask on Sepolia, and run
   through the studio wizard to Deploy.

## Project structure

```
src/routes/          Pages (index, dashboard, studio/$id, collection/$id, explore, staking, tokenomics, whitepaper)
src/components/      UI + site-header/site-footer (wallet connect, mobile nav, socials)
src/lib/             Generator, store (localStorage), IPFS server functions
src/lib/web3/        wagmi config, compiled contract artifacts, deploy helpers
src/lib/social.ts             Rashito's own social links
src/lib/official-collection.ts   Deployed official NFT collection address (fill in after deploy)
src/lib/official-token.ts        Deployed RASH token address (fill in after deploy)
src/lib/official-staking.ts      Deployed staking contract address (fill in after deploy)
contracts/           RashitoCollection.sol, RashitoToken.sol, RashitoStaking.sol
scripts/             Whitepaper PDF generator
test/                Hardhat contract tests
ignition/modules/    Hardhat Ignition deploy modules
public/whitepaper.pdf     Generated whitepaper PDF
```

## Scripts

```bash
npm run dev          # start the dev server (localhost:8080)
npm run build         # production build
npm run preview       # preview the production build locally
npm run lint           # eslint
npm run format          # prettier --write
npx hardhat test        # run the contract test suite
npx hardhat compile      # compile both Solidity contracts
python3 scripts/generate_whitepaper_pdf.py    # regenerate whitepaper.pdf (needs `pip install reportlab`)
```
