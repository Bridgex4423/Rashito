import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { mainnet, base, polygon, bsc, sepolia, baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors";

// WalletConnect needs a free project id from https://cloud.reown.com (formerly
// WalletConnect Cloud). Without one, MetaMask / Coinbase Wallet / any browser
// extension wallet still work fine via the injected connector - WalletConnect
// (QR-code / mobile wallets) is simply skipped.
const walletConnectProjectId = import.meta.env["VITE_WALLETCONNECT_PROJECT_ID"] as
  string | undefined;

export const chains = [mainnet, base, polygon, bsc, sepolia, baseSepolia] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "Rashito" }),
    ...(walletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId, showQrModal: true })]
      : []),
  ],
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

/** Maps Rashito's internal ChainId strings to wagmi/viem chain objects. */
export const CHAIN_ID_MAP = {
  ethereum: mainnet,
  base,
  polygon,
  bnb: bsc,
  sepolia,
  "base-sepolia": baseSepolia,
} as const;

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
