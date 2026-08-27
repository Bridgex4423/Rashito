# Rashito smart contracts

Two real contracts live here (OpenZeppelin 5.x), both compiled and embedded
directly in the frontend so the app can deploy and interact with them from
your connected wallet - no backend, no private key held by Rashito.

## RashitoCollection.sol

The generic ERC-721 contract deployed by every Studio project, including the
flagship Rashito Genesis collection.

- Capped supply, public mint, allowlist mint (Merkle proof), owner reserve mint
- Per-wallet mint limits, exact-payment enforcement
- Pausable, `Ownable`, `ReentrancyGuard`
- ERC-2981 on-chain royalties
- Pre-reveal placeholder metadata + owner-triggered `reveal()`
- Owner `withdraw()`

## RashitoToken.sol (RASH)

The platform's fixed-supply ERC-20 utility token.

- 1,000,000,000 RASH minted once, at deployment, to a treasury address you choose
- No mint function exists beyond the constructor - supply can never increase
- Burnable (`ERC20Burnable`) and supports gasless approvals (`ERC20Permit` / EIP-2612)
- Owner-only rescue function for foreign ERC-20s accidentally sent to the contract

## Compiling, testing, deploying (from your machine)

This sandbox can't reach Solidity's compiler-binary CDN or any RPC endpoint,
so these commands are meant to be run **locally, from VS Code's terminal**,
where you have normal internet access.

```bash
# 1. Compile both contracts
npx hardhat compile

# 2. Run the full test suite (in-memory chain, no network needed)
npx hardhat test

# 3a. Deploy the NFT collection to a testnet
npx hardhat ignition deploy ignition/modules/RashitoCollection.ts --network sepolia

# 3b. Deploy the RASH token to a testnet
npx hardhat ignition deploy ignition/modules/RashitoToken.ts --network sepolia \
  --parameters '{"RashitoToken":{"treasury":"0xYourTreasuryAddress"}}'

# 4. Verify source on the block explorer (optional but recommended)
npx hardhat verify --network sepolia <deployed-address> <constructor-args...>
```

Steps 3-4 need RPC URLs and a private key - see `.env.example` at the project
root. **Never commit a real private key.** For anything beyond throwaway
testnet funds, prefer `npx hardhat keystore set <VAR_NAME>` over a plaintext
`.env` file.

## Normal usage: you don't need any of this

Day to day you just use the app:

- **NFT collections** — Studio -> Deploy step -> "Deploy Contract" -> confirm
  in MetaMask. Or for the flagship collection specifically: Dashboard ->
  "Set up Rashito Genesis" (loads the pre-generated 450-piece collection into
  the Studio), then walk it through Upload and Deploy as normal.
- **RASH token** — Dashboard -> "Deploy RASH Token" -> confirm in MetaMask.
  That single transaction mints the entire 1,000,000,000 supply straight to
  your wallet as treasury.

The Hardhat project above exists for testing contract logic and for
scripted/CI deploys and Etherscan verification - not because the app depends
on it.

## Regenerating the frontend artifacts

If you edit either `.sol` file, recompile and regenerate the ABI/bytecode
the frontend uses:

```bash
node -e "
const solc = require('solc');
const fs = require('fs');
function findImports(p){ try { return {contents: fs.readFileSync('node_modules/'+p,'utf8')} } catch(e){ return {error:'not found'} } }
const source = fs.readFileSync('contracts/RashitoCollection.sol','utf8'); // or RashitoToken.sol
const input = { language:'Solidity', sources:{ 'X.sol':{content:source} }, settings:{ optimizer:{enabled:true,runs:200}, outputSelection:{'*':{'*':['abi','evm.bytecode.object']}} } };
const out = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));
console.log(out.errors?.filter(e=>e.severity==='error'));
"
```

then update the matching `src/lib/web3/contract-artifact.ts` or
`src/lib/web3/token-artifact.ts` with the new ABI/bytecode.
