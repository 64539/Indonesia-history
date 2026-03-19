import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { and, eq, ilike, or } from "drizzle-orm"

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

    // Published-only search for students/guests.
    const results = await db
      .select({
        slug: chapters.slug,
        title: chapters.title,
        grade: chapters.grade,
        videoUrl: chapters.videoUrl,
      })
      .from(chapters)
      .where(
        and(
          eq(chapters.status, "Published"),
          or(
            ilike(chapters.title, term),
            ilike(chapters.slug, term),
            ilike(chapters.grade, term),
          ),
        ),
      )
      .limit(8)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search API Error:", error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}

