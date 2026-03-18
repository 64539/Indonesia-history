
import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { MateriForm } from "@/components/admin/materi-form"
import { Separator } from "@/components/ui/separator"

interface EditMateriPageProps {
  params: Promise<{
    id: string
  }>
}

interface Chapter {
  id: number;
  title: string;
  grade: string;
  content: string;
  videoUrl: string | null;
  status: string;
}

export default async function EditMateriPage({ params }: EditMateriPageProps) {
  const { id } = await params
  const parsedId = parseInt(id)

  if (isNaN(parsedId)) {
    notFound()
  }

  // Fetch chapter data
  const chapterData = await db.select().from(chapters).where(eq(chapters.id, parsedId)).limit(1)
  
  if (chapterData.length === 0) {
    notFound()
  }

  const chapter = chapterData[0]

  // Fetch timeline data
  const timelineData = await db.select().from(timelines).where(eq(timelines.chapterId, parsedId))

  // Format data for the form
  let theory = chapter.content || ""
  let artifacts: { year: string; title: string; description: string }[] | undefined = undefined
  try {
    const parsed = JSON.parse(chapter.content || "{}")
    if (parsed && typeof parsed === "object") {
      theory = parsed.theory || ""
      artifacts = Array.isArray(parsed.artifacts) ? parsed.artifacts : []
    }
  } catch (error) {
    console.error("Failed to parse chapter content JSON:", error, "Chapter ID:", id)
    // Fallback to raw content if JSON parsing fails
    theory = chapter.content || ""
    artifacts = []
  }

  const initialData = {
    id: chapter.id,
    title: chapter.title,
    category: chapter.grade,
    videoUrl: chapter.videoUrl || "",
    content: theory,
    status: chapter.status || "Draft",
    artifacts: artifacts || [],
    timeline: timelineData.map(t => ({
      year: t.year,
      title: t.title,
      description: t.description
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Materi</h3>
        <p className="text-sm text-muted-foreground">
          Perbarui konten materi dan timeline sejarah.
        </p>
      </div>
      <Separator />
      <MateriForm initialData={initialData} />
    </div>
  )
}
