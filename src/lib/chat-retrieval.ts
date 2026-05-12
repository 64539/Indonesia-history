import { and, desc, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { chapters } from "@/db/schema";
import { publicChapterVisibility } from "@/lib/chapter-visibility";

/** Rows for RAG context: raw `content` JSON is parsed in the API route, not sent verbatim to the model. */
export type RetrievedChapterRow = {
  id: number;
  title: string;
  grade: string;
  content: string;
};

const STOP_WORDS = new Set([
  "apa",
  "itu",
  "ini",
  "di",
  "ke",
  "dari",
  "yang",
  "membahas",
  "tentang",
  "jelaskan",
  "sebutkan",
  "bagaimana",
  "adalah",
  "atau",
  "dan",
  "dengan",
  "untuk",
  "pada",
  "oleh",
  "akan",
  "tidak",
  "sudah",
  "juga",
  "bisa",
  "saja",
  "the",
  "a",
  "an",
  "is",
  "are",
  "what",
  "when",
  "where",
  "who",
  "why",
  "how",
]);

const PRIMARY_MATCH_LIMIT = 5;
const FALLBACK_LIMIT = 2;

/** Lowercase, strip punctuation, split; drop stop words and very short tokens. */
export function extractSearchKeywords(query: string): string[] {
  const lower = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();
  const parts = lower.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return [...new Set(parts)];
}

/** Strip ILIKE wildcards so user input cannot broaden the pattern. */
function safeIlikeToken(keyword: string): string {
  return keyword.replace(/[%_\\]/g, "").trim();
}

export async function retrieveChaptersForChat(
  sanitizedQuery: string
): Promise<RetrievedChapterRow[]> {
  const q = sanitizedQuery.trim().slice(0, 500);
  const vis = publicChapterVisibility();

  const keywords = extractSearchKeywords(q);
  const keywordConditions: ReturnType<typeof or>[] = [];

  for (const kw of keywords) {
    const safe = safeIlikeToken(kw);
    if (!safe) continue;
    const pattern = `%${safe}%`;
    keywordConditions.push(
      or(ilike(chapters.title, pattern), ilike(chapters.content, pattern))!
    );
  }

  let rows: RetrievedChapterRow[] = [];

  if (keywordConditions.length > 0) {
    const keywordOr = or(...keywordConditions);
    rows = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        grade: chapters.grade,
        content: chapters.content,
      })
      .from(chapters)
      .where(and(vis, keywordOr))
      .orderBy(desc(chapters.updatedAt))
      .limit(PRIMARY_MATCH_LIMIT);
  }

  if (rows.length === 0) {
    rows = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        grade: chapters.grade,
        content: chapters.content,
      })
      .from(chapters)
      .where(vis)
      .orderBy(desc(chapters.updatedAt))
      .limit(FALLBACK_LIMIT);
  }

  return rows;
}
