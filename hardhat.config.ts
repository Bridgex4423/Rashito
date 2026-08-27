import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

// Hardhat 3 project for the Rashito generative NFT contract (contracts/RashitoCollection.sol).
//
// This is used to compile, test, deploy, and verify the contract from your own
// machine (this sandbox has no access to RPC endpoints or the Solidity binary
// downloader, so real deploys must happen from your local VS Code terminal).
//
// Secrets are read from environment variables (see .env.example). Set them with
// `npx hardhat keystore set SEPOLIA_PRIVATE_KEY` or a local .env file loaded via
// the `dotenv` package - see scripts/deploy.ts for the .env loader.
export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    baseSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("BASE_SEPOLIA_RPC_URL"),
      accounts: [configVariable("BASE_SEPOLIA_PRIVATE_KEY")],
    },
    base: {
      type: "http",
      chainType: "op",
      url: configVariable("BASE_RPC_URL"),
      accounts: [configVariable("BASE_PRIVATE_KEY")],
    },
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("MAINNET_RPC_URL"),
      accounts: [configVariable("MAINNET_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },
});
