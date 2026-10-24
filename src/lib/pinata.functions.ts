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

/**
 * Creates a short-lived Pinata signed upload URL. The browser uploads one file
 * straight to Pinata with it, so the JWT never leaves the server and Vercel's
 * request-size limit does not apply to the image itself.
 */
export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { filename: string; mime: string }) => {
    if (!input?.filename) throw new Error("filename is required");
    return input;
  })
  .handler(async ({ data }) => {
    const jwt = process.env["PINATA_JWT"];
    if (!jwt) throw new Error("PINATA_JWT is not configured for this project.");
    const res = await fetch("https://uploads.pinata.cloud/v3/files/sign", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        date: Math.floor(Date.now() / 1000),
        expires: 300,
        filename: data.filename.slice(0, 120),
        allow_mime_types: ["image/*"],
        max_file_size: 50_000_000,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("Pinata sign failed", res.status, text);
      throw new Error(`Could not start upload (Pinata ${res.status}): ${text.slice(0, 200)}`);
    }
    const json = JSON.parse(text) as { data?: string };
    if (!json.data) throw new Error("Pinata did not return an upload URL");
    return { url: json.data };
  });
