
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getGradeSlug } from "@/lib/utils"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const body = await req.json()
    const { title, category, videoUrl, content, timeline, status } = body

    // Update chapter
    await db.update(chapters)
      .set({
        title,
        grade: category,
        content,
        videoUrl,
        status,
      })
      .where(eq(chapters.id, parsedId))

    // Delete existing timelines
    await db.delete(timelines).where(eq(timelines.chapterId, parsedId))

    // Insert new timelines
    if (timeline && timeline.length > 0) {
      await db.insert(timelines).values(
        timeline.map((t: { year: string; title: string; description: string }) => ({
          chapterId: parsedId,
          year: t.year,
          title: t.title,
          description: t.description,
        }))
      )
    }

    // Kill ghost data across public + dashboard surfaces
    revalidatePath("/")
    revalidatePath("/materi")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/materi")

    // Revalidate the public materi detail route (grade/slug)
    const chapter = await db
      .select({ slug: chapters.slug, grade: chapters.grade })
      .from(chapters)
      .where(eq(chapters.id, parsedId))
      .limit(1)

    if (chapter.length > 0) {
      const gradeSlug = getGradeSlug(chapter[0].grade)
      revalidatePath(`/materi/${gradeSlug}/${chapter[0].slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update Materi Error:", error)
    return NextResponse.json({ error: "Gagal memperbarui materi" }, { status: 500 })
  }
}
