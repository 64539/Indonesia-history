import { and, eq, isNull, type SQL } from "drizzle-orm";
import { chapters } from "@/db/schema";

/** Rows visible on public site and usable as AI context. */
export function publicChapterVisibility(): SQL {
  return and(eq(chapters.status, "Published"), isNull(chapters.deletedAt)) as SQL;
}
