import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Layer, Project, Trait } from "./types";

const KEY = "rashito.state.v2";

// Real wallet connection state (address, chain, balance) is owned by wagmi -
// see src/lib/web3/config.ts - and persisted separately in its own storage
// key. This store only ever holds project/collection data now.
export interface AppState {
  projects: Project[];
}

const empty: AppState = { projects: [] };

let state: AppState = empty;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...(JSON.parse(raw) as AppState) };
  } catch {
    /* ignore */
  }
  emit();
}

function setState(next: AppState) {
  state = next;
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAppState(): AppState {
  useEffect(() => hydrate(), []);
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => empty,
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function randomAddress() {
  const hex = "0123456789abcdef";
  let a = "0x";
  for (let i = 0; i < 40; i++) a += hex[Math.floor(Math.random() * 16)];
  return a;
}

export function shortAddress(a?: string | null) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export const actions = {
  createProject(p: Partial<Project>): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: uid(),
      name: p.name || "Untitled Collection",
      symbol: p.symbol || "RASH",
      description: p.description || "",
      chain: p.chain || "base",
      standard: p.standard || "ERC-721",
      size: p.size || 1000,
      royalty: p.royalty ?? 5,
      wallet: p.wallet || "",
      website: "",
      twitter: "",
      discord: "",
      layers: [],
      rules: [],
      nfts: [],
      minted: 0,
      holders: 0,
      step: 0,
      createdAt: now,
      updatedAt: now,
      ...p,
    } as Project;
    setState({ ...state, projects: [project, ...state.projects] });
    return project;
  },
  update(id: string, patch: Partial<Project> | ((p: Project) => Partial<Project>)) {
    setState({
      ...state,
      projects: state.projects.map((p) =>
        p.id === id
          ? {
              ...p,
              ...(typeof patch === "function" ? patch(p) : patch),
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    });
  },
  remove(id: string) {
    setState({ ...state, projects: state.projects.filter((p) => p.id !== id) });
  },
};

export function useProject(id: string) {
  const { projects } = useAppState();
  const project = projects.find((p) => p.id === id);
  const update = useCallback(
    (patch: Partial<Project> | ((p: Project) => Partial<Project>)) => actions.update(id, patch),
    [id],
  );
  return { project, update };
}

export const PALETTE = [
  "oklch(0.72 0.17 195)",
  "oklch(0.78 0.16 85)",
  "oklch(0.65 0.2 20)",
  "oklch(0.7 0.15 150)",
  "oklch(0.6 0.18 260)",
  "oklch(0.75 0.13 330)",
  "oklch(0.55 0.12 240)",
  "oklch(0.82 0.12 110)",
];

export function newTrait(index: number, name = `Trait ${index + 1}`): Trait {
  return { id: uid(), name, color: PALETTE[index % PALETTE.length]!, weight: 20 };
}

export function newLayer(name: string): Layer {
  return { id: uid(), name, enabled: true, traits: [] };
}
