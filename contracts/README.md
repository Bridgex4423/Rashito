# Rashito smart contracts

Three real contracts live here (OpenZeppelin 5.x), compiled and embedded
directly in the frontend so the app can deploy and interact with them from
your connected wallet - no backend, no private key held by Rashito.

## RashitoCollection.sol

The generic ERC-721 contract deployed by every Studio project, including
whichever collection you designate as Rashito's official one.

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

## RashitoStaking.sol

Stake NFTs from one fixed `RashitoCollection` to earn RASH (or any ERC-20)
over time.

- Flat reward rate per staked NFT per second, owner-configurable
- Staked NFTs are held in escrow by the contract and returned in full on unstake
- Rewards are paid only from a pool the owner explicitly funds with
  `fundRewards` - the contract can never mint tokens, so it can only ever pay
  out what it actually holds
- `claim` pays out accrued rewards without unstaking; `unstake` returns the
  NFT and pays remaining rewards in the same transaction
- Owner can pause new stakes (existing stakers can still claim/unstake) and
  withdraw only unused reward-pool funds - never a staker's NFT or accrued rewards

## Compiling, testing, deploying (from your machine)

This sandbox can't reach Solidity's compiler-binary CDN or any RPC endpoint,
so these commands are meant to be run **locally, from VS Code's terminal**,
where you have normal internet access.

```bash
# 1. Compile all three contracts
npx hardhat compile

# 2. Run the full test suite (in-memory chain, no network needed)
npx hardhat test

# 3a. Deploy an NFT collection to a testnet
npx hardhat ignition deploy ignition/modules/RashitoCollection.ts --network sepolia

# 3b. Deploy the RASH token to a testnet
npx hardhat ignition deploy ignition/modules/RashitoToken.ts --network sepolia \
  --parameters '{"RashitoToken":{"treasury":"0xYourTreasuryAddress"}}'

# 3c. Deploy staking, pointed at your collection + token
npx hardhat ignition deploy ignition/modules/RashitoStaking.ts --network sepolia \
  --parameters '{"RashitoStaking":{"nft":"0xYourCollection","rewardToken":"0xYourRashToken","rewardRatePerSecond":"11574074074074"}}'
# then fund its reward pool: approve the staking address for RASH, then call
# fundRewards(amount) - e.g. via Etherscan's "Write Contract" tab

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
  in MetaMask.
- **RASH token** — deploy via the Hardhat CLI above (there's no in-app
  button for this by design), mint goes straight to your treasury wallet.
- **Staking** — deploy via the Hardhat CLI above, fund its reward pool, then
  fill in `src/lib/official-collection.ts` and `src/lib/official-staking.ts`
  with the deployed addresses so `/staking` goes live for everyone.

The Hardhat project above exists for testing contract logic and for
scripted/CI deploys and Etherscan verification - not because the app depends
on it.

## Regenerating the frontend artifacts

If you edit any `.sol` file, recompile and regenerate the ABI/bytecode the
frontend uses:

```bash
node -e "
const solc = require('solc');
const fs = require('fs');
function findImports(p){ try { return {contents: fs.readFileSync('node_modules/'+p,'utf8')} } catch(e){ return {error:'not found'} } }
const source = fs.readFileSync('contracts/RashitoCollection.sol','utf8'); // or RashitoToken.sol / RashitoStaking.sol
const input = { language:'Solidity', sources:{ 'X.sol':{content:source} }, settings:{ optimizer:{enabled:true,runs:200}, outputSelection:{'*':{'*':['abi','evm.bytecode.object']}} } };
const out = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));
console.log(out.errors?.filter(e=>e.severity==='error'));
"
```

then update the matching `src/lib/web3/contract-artifact.ts`,
`src/lib/web3/token-artifact.ts`, or `src/lib/web3/staking-artifact.ts` with
the new ABI/bytecode.
