import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { getGradeSlug } from "@/lib/utils"
import { requireMateriEditorSession, StaffAuthError } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const session = await requireMateriEditorSession()
    const body = await req.json()
    const { title, category, videoUrl, content, timeline, status } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 })
    }

    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

    const [newChapter] = await db
      .insert(chapters)
      .values({
        slug,
        title,
        grade: category,
        content,
        videoUrl,
        status: status || "Draft",
        authorId: session.id,
      })
      .returning({ id: chapters.id })

    if (timeline && timeline.length > 0) {
      await db.insert(timelines).values(
        timeline.map((t: { year: string; title: string; description: string }) => ({
          chapterId: newChapter.id,
          year: t.year,
          title: t.title,
          description: t.description,
        }))
      )
    }

    const gradeSlug = getGradeSlug(category)
    revalidatePath("/")
    revalidatePath("/materi")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/materi")
    revalidatePath(`/materi/${gradeSlug}/${slug}`)

    return NextResponse.json({ success: true, id: newChapter.id })
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Create Materi Error:", error)
    return NextResponse.json({ error: "Gagal membuat materi" }, { status: 500 })
  }
}
