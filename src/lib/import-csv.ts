/** Minimal CSV parser (quotes, commas, CRLF) for the AI-variations attribute sheet. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

export interface CsvRow {
  tokenId: number;
  name?: string;
  attributes: { trait_type: string; value: string }[];
}

/**
 * Header: token_id (or id), optional name, every other column becomes an attribute.
 * Empty cells are skipped.
 */
export function parseAttributeSheet(text: string): CsvRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row");
  const header = rows[0]!.map((h) => h.trim());
  const idCol = header.findIndex((h) => ["token_id", "tokenid", "id"].includes(h.toLowerCase()));
  if (idCol < 0) throw new Error('CSV needs a "token_id" column');
  const nameCol = header.findIndex((h) => h.toLowerCase() === "name");
  return rows.slice(1).map((r, n) => {
    const tokenId = Number(r[idCol]);
    if (!Number.isInteger(tokenId) || tokenId < 1)
      throw new Error(`Row ${n + 2}: token_id must be a whole number ≥ 1`);
    const attributes: CsvRow["attributes"] = [];
    header.forEach((h, i) => {
      if (i === idCol || i === nameCol || !h) return;
      const v = (r[i] ?? "").trim();
      if (v) attributes.push({ trait_type: h, value: v });
    });
    const name = nameCol >= 0 ? (r[nameCol] ?? "").trim() : "";
    return name ? { tokenId, name, attributes } : { tokenId, attributes };
  });
}
