import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getGradeSlug } from "@/lib/utils"
import { requireMateriEditorSession, StaffAuthError } from "@/lib/session"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMateriEditorSession()
    const { id } = await params
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const body = await req.json()
    const { title, category, videoUrl, content, timeline, status } = body

    await db
      .update(chapters)
      .set({
        title,
        grade: category,
        content,
        videoUrl,
        status,
      })
      .where(eq(chapters.id, parsedId))

    await db.delete(timelines).where(eq(timelines.chapterId, parsedId))

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

    revalidatePath("/")
    revalidatePath("/materi")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/materi")

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
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Update Materi Error:", error)
    return NextResponse.json({ error: "Gagal memperbarui materi" }, { status: 500 })
  }
}
