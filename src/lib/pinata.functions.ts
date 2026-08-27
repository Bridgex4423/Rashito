import { createServerFn } from "@tanstack/react-start";

export interface PinFile {
  path: string;
  base64: string;
  type: string;
}

export const getPinataStatus = createServerFn({ method: "GET" }).handler(async () => {
  const jwt = process.env["PINATA_JWT"];
  const gateway = process.env["PINATA_GATEWAY"] || "gateway.pinata.cloud";
  if (!jwt) return { configured: false, gateway, account: null as string | null };
  try {
    const res = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return { configured: false, gateway, account: null as string | null };
    return { configured: true, gateway, account: "Pinata key authenticated" as string | null };
  } catch {
    return { configured: false, gateway, account: null as string | null };
  }
});

function decode(b64: string) {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Pins a set of files as a single IPFS directory and returns its CID. */
export const pinDirectory = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; files: PinFile[] }) => {
    if (!input?.name || !Array.isArray(input.files) || input.files.length === 0) {
      throw new Error("name and at least one file are required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const jwt = process.env["PINATA_JWT"];
    const gateway = process.env["PINATA_GATEWAY"] || "gateway.pinata.cloud";
    if (!jwt) throw new Error("PINATA_JWT is not configured for this project.");

    const form = new FormData();
    for (const f of data.files) {
      const blob = new Blob([decode(f.base64)], { type: f.type || "application/octet-stream" });
      form.append("file", blob, `${data.name}/${f.path}`);
    }
    form.append("pinataMetadata", JSON.stringify({ name: data.name }));
    form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Pinata upload failed", res.status, text);
      throw new Error(`Pinata upload failed (${res.status})`);
    }
    const json = JSON.parse(text) as { IpfsHash: string; PinSize: number };
    return { cid: json.IpfsHash, size: json.PinSize, gateway };
  });
