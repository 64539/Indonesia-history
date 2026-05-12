/**
 * Extract human-readable theory text from stored chapter `content`
 * (JSON `{ theory, artifacts }` or plain string fallback).
 */
export function extractTheoryForContext(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "theory" in parsed) {
      const t = (parsed as { theory?: unknown }).theory;
      return typeof t === "string" ? t : "";
    }
  } catch {
    // not JSON
  }
  return raw;
}

export function summarizeArtifactsForContext(raw: string | null | undefined, maxItems = 5): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || !("artifacts" in parsed)) return "";
    const arts = (parsed as { artifacts?: unknown }).artifacts;
    if (!Array.isArray(arts)) return "";
    const lines: string[] = [];
    for (const a of arts.slice(0, maxItems)) {
      if (a && typeof a === "object" && "name" in a) {
        const name = String((a as { name?: unknown }).name ?? "");
        const desc = String((a as { description?: unknown }).description ?? "");
        if (name) lines.push(`- ${name}${desc ? `: ${desc.slice(0, 200)}` : ""}`);
      }
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}
