import type { Nft, Project } from "@/lib/types";

const imgCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imgCache.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Could not load layer image"));
    img.src = src;
  });
}

/** Renders one NFT to a PNG data URL, mirroring the on-screen preview stack. */
export async function renderNft(project: Project, nft: Nft, size = 1000): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser");

  if (project.base) {
    try {
      ctx.drawImage(await loadImage(project.base), 0, 0, size, size);
    } catch {
      /* ignore missing base */
    }
  }

  const ordered = project.layers
    .map((l) => {
      const sel = nft.traits.find((t) => t.layerId === l.id);
      const trait = sel ? l.traits.find((t) => t.id === sel.traitId) : undefined;
      return trait ? { layer: l, trait } : null;
    })
    .filter(Boolean) as {
    layer: Project["layers"][number];
    trait: Project["layers"][number]["traits"][number];
  }[];

  for (let i = 0; i < ordered.length; i++) {
    const entry = ordered[i];
    if (!entry) continue;
    const { trait } = entry;
    if (trait.image) {
      try {
        ctx.drawImage(await loadImage(trait.image), 0, 0, size, size);
        continue;
      } catch {
        /* fall through to color */
      }
    }
    if (i === 0) {
      ctx.fillStyle = trait.color;
      ctx.fillRect(0, 0, size, size);
    } else {
      const cx = (0.2 + i * 0.12) * size;
      const cy = (0.25 + i * 0.11) * size;
      const inner = (0.07 + (i % 3) * 0.04) * size;
      const outer = (0.12 + (i % 3) * 0.05) * size;
      const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
      grad.addColorStop(0, trait.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1;
    }
  }

  return canvas.toDataURL("image/png");
}
