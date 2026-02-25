
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { revalidatePath } from "next/cache"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, category, videoUrl, content, timeline } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 })
    }

    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")

    // Insert chapter
    const [newChapter] = await db.insert(chapters).values({
      slug,
      title,
      grade: category,
      content,
      videoUrl,
      authorId: "admin", // TODO: Get from session
    }).returning({ id: chapters.id })

    // Insert timelines
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

    revalidatePath("/dashboard/materi")
    revalidatePath(`/materi/${slug}`)

    return NextResponse.json({ success: true, id: newChapter.id })
  } catch (error) {
    console.error("Create Materi Error:", error)
    return NextResponse.json({ error: "Gagal membuat materi" }, { status: 500 })
  }
}
