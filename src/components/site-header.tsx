import { Link } from "@tanstack/react-router";
import { Wallet, Sparkles, LogOut, Copy, ExternalLink, AlertTriangle, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { chains as SUPPORTED_CHAINS } from "@/lib/web3/config";
import { shortAddress, useMounted } from "@/lib/store";

export const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/tokenomics", label: "Tokenomics" },
  { to: "/whitepaper", label: "Whitepaper" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Rashito</span>
    </Link>
  );
}

/** Real wallet connector: MetaMask / any injected extension, Coinbase Wallet, and
 *  WalletConnect (if VITE_WALLETCONNECT_PROJECT_ID is set). No mock addresses -
 *  everything here comes from the actual browser wallet via wagmi/viem. */
export function ConnectWallet({ full }: { full?: boolean }) {
  const mounted = useMounted();
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });

  if (!mounted) {
    return (
      <Button variant="secondary" className={full ? "w-full" : ""}>
        Connect Wallet
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={full ? "w-full" : ""} disabled={isPending}>
            <Wallet /> {isPending ? "Connecting…" : "Connect Wallet"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Choose a wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {connectors.length === 0 && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No wallet extension detected
            </DropdownMenuItem>
          )}
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.uid}
              onClick={async () => {
                try {
                  await connect({ connector });
                  toast.success(`${connector.name} connected`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not connect wallet");
                }
              }}
            >
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const chainName = chain?.name ?? "Unsupported network";
  const wrongNetwork = !chain;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={wrongNetwork ? "destructive" : "secondary"}
          className={full ? "w-full font-mono" : "font-mono"}
        >
          {wrongNetwork ? <AlertTriangle /> : <Wallet />} {shortAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <div className="font-mono text-xs">{shortAddress(address)}</div>
          <div className="text-xs text-muted-foreground">
            {chainName}
            {balance
              ? ` · ${Number(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}`
              : ""}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void navigator.clipboard?.writeText(address);
            toast.success("Address copied");
          }}
        >
          <Copy /> Copy address
        </DropdownMenuItem>
        {chain?.blockExplorers?.default.url && (
          <DropdownMenuItem asChild>
            <a
              href={`${chain.blockExplorers.default.url}/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink /> View on explorer
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Switch network</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {SUPPORTED_CHAINS.map((c) => (
              <DropdownMenuItem
                key={c.id}
                disabled={c.id === chainId}
                onClick={() => switchChain({ chainId: c.id })}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()}>
          <LogOut /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/dashboard">Creator Studio</Link>
          </Button>
          <ConnectWallet />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "text-foreground bg-secondary" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
