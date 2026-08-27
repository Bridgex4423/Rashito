import type { Nft, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  traits: Nft["traits"];
  className?: string;
  showLabels?: boolean;
}

export function NftCanvas({ project, traits, className, showLabels }: Props) {
  const ordered = project.layers
    .map((l) => {
      const sel = traits.find((t) => t.layerId === l.id);
      const trait = sel ? l.traits.find((t) => t.id === sel.traitId) : undefined;
      return trait ? { layer: l, trait } : null;
    })
    .filter(Boolean) as {
    layer: Project["layers"][number];
    trait: Project["layers"][number]["traits"][number];
  }[];

  return (
    <div
      className={cn("relative aspect-square w-full overflow-hidden rounded-xl checker", className)}
    >
      {project.base ? (
        <img
          src={project.base}
          alt="Base character"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {ordered.map(({ layer, trait }, i) =>
        trait.image ? (
          <img
            key={layer.id}
            src={trait.image}
            alt={`${layer.name}: ${trait.name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            key={layer.id}
            className="absolute inset-0"
            style={{
              background:
                i === 0
                  ? trait.color
                  : `radial-gradient(circle at ${20 + i * 12}% ${25 + i * 11}%, ${trait.color} 0 ${
                      7 + (i % 3) * 4
                    }%, transparent ${12 + (i % 3) * 5}%)`,
              opacity: i === 0 ? 1 : 0.92,
            }}
          />
        ),
      )}
      {ordered.length === 0 && !project.base ? (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          No layers yet
        </div>
      ) : null}
      {showLabels ? (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-background/70 p-2 text-[10px]">
          {ordered.map(({ layer, trait }) => (
            <span
              key={layer.id}
              className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground"
            >
              {layer.name}: {trait.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
