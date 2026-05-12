import { NextResponse } from "next/server"
import { z } from "zod"
import { and, desc, ilike, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { publicChapterVisibility } from "@/lib/chapter-visibility"

export const dynamic = "force-dynamic"

const SearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawQ = searchParams.get("q") ?? ""
    const parsed = SearchQuerySchema.safeParse({ q: rawQ })

    if (!parsed.success) {
      return NextResponse.json({ results: [] })
    }

    const q = parsed.data.q
    const term = `%${q}%`
    const vis = publicChapterVisibility()

    const ftsMatch = sql`
      to_tsvector('simple', coalesce(${chapters.title}, '') || ' ' || coalesce(${chapters.content}, ''))
      @@ plainto_tsquery('simple', ${q})
    `

    let results = await db
      .select({
        slug: chapters.slug,
        title: chapters.title,
        grade: chapters.grade,
        videoUrl: chapters.videoUrl,
      })
      .from(chapters)
      .where(and(vis, ftsMatch))
      .orderBy(
        desc(
          sql`ts_rank_cd(
            to_tsvector('simple', coalesce(${chapters.title}, '') || ' ' || coalesce(${chapters.content}, '')),
            plainto_tsquery('simple', ${q})
          )`
        )
      )
      .limit(8)

    if (results.length === 0) {
      results = await db
        .select({
          slug: chapters.slug,
          title: chapters.title,
          grade: chapters.grade,
          videoUrl: chapters.videoUrl,
        })
        .from(chapters)
        .where(
          and(
            vis,
            or(
              ilike(chapters.title, term),
              ilike(chapters.slug, term),
              ilike(chapters.grade, term),
              ilike(chapters.content, term)
            )
          )
        )
        .limit(8)
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search API Error:", error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
