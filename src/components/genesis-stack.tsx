import { GENESIS, LAYER_ORDER, traitSrc, type Combo } from "@/lib/genesis-art";

/**
 * Renders a layered Genesis character. With `all`, every option of every layer
 * stays mounted and only the selected one is visible, which gives smooth
 * cross-fades (and preloads the art) for the animated hero.
 */
export function GenesisStack({
  combo,
  all = false,
  label,
  className = "",
}: {
  combo: Combo;
  all?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <div role="img" aria-label={label} className={`relative aspect-square ${className}`}>
      {LAYER_ORDER.map((layer) => {
        const chosen = combo[layer] ?? null;
        const opts = all ? GENESIS[layer] : GENESIS[layer].filter((t) => t.id === chosen);
        return opts.map((t) => (
          <img
            key={`${layer}-${t.id}`}
            src={traitSrc(layer, t.id)}
            alt=""
            draggable={false}
            decoding="async"
            loading={all ? "eager" : "lazy"}
            width={768}
            height={768}
            className="absolute inset-0 size-full select-none object-cover transition-opacity duration-700 ease-out"
            style={{ opacity: chosen === t.id ? 1 : 0 }}
          />
        ));
      })}
    </div>
  );
}
