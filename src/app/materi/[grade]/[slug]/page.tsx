import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { VideoPlayer } from "@/components/video-player"
import { Timeline, TimelineItem } from "@/components/timeline"
import { Separator } from "@/components/ui/separator"
import { CompletionSection } from "./client-components"
import { MDXRemote } from "next-mdx-remote/rsc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArtifactCard, type Artifact } from "@/components/artifact-card"
import { BookOpen, Box } from "lucide-react"

interface PageProps {
  params: Promise<{
    grade: string
    slug: string
  }>
}

export default async function MateriPage({ params }: PageProps) {
  const { grade, slug } = await params
  let chapter = null
  let timelineItems: TimelineItem[] = []
  try {
    const found = await db.select().from(chapters).where(and(eq(chapters.slug, slug), eq(chapters.status, "Published"))).limit(1)
    chapter = found.length > 0 ? found[0] : null
    if (chapter) {
      timelineItems = await db.select().from(timelines).where(eq(timelines.chapterId, chapter.id))
    }
  } catch (e) {
    console.error("Failed to fetch materi from DB", e)
  }

  if (!chapter) {
    return (
      <div className="container max-w-4xl py-20 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-amber-500 mb-4">
          Konten Sedang Dikurasi
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Artefak digital ini sedang dalam proses pemugaran oleh tim RuangWaktu 12 kami.
          Silakan kembali lagi nanti.
        </p>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </div>
    )
  }

  let theory = chapter.content || ""
  let artifacts: Artifact[] = []
  
  // Robust JSON parsing with fallback
  if (chapter.content) {
    try {
      const parsed = JSON.parse(chapter.content)
      if (parsed && typeof parsed === "object") {
        theory = parsed.theory || chapter.content // Fallback to raw content
        artifacts = Array.isArray(parsed.artifacts) ? parsed.artifacts : []
      } else {
        // If parsed is not an object, treat raw content as theory
        theory = chapter.content
        artifacts = []
      }
    } catch (error) {
      console.error("Failed to parse chapter content JSON:", error, "Chapter slug:", slug)
      // If JSON.parse fails, treat raw content as theory
      theory = chapter.content
      artifacts = []
    }
  }

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-block rounded-lg bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500">
            Kelas {chapter.grade}
          </div>
          <div className="text-sm text-muted-foreground">
            Estimasi: {chapter.estimatedTime || 10} Menit
          </div>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight lg:text-5xl">
          {chapter.title}
        </h1>
        <Separator className="my-4" />
      </div>

      <Tabs defaultValue="literasi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="literasi" className="text-base">
            <BookOpen className="w-4 h-4 mr-2" />
            Literasi Sejarah
          </TabsTrigger>
          <TabsTrigger value="artefak" className="text-base">
            <Box className="w-4 h-4 mr-2" />
            Galeri Artefak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="literasi" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <VideoPlayer url={chapter.videoUrl || "https://www.youtube.com/watch?v=33v0GgVlQ5Y"} />
          </div>

          <article className="prose prose-stone dark:prose-invert max-w-none font-sans">
            <MDXRemote source={theory || `# ${chapter.title}\n\nKonten sedang dikurasi.`} />
          </article>

          <Separator className="my-10" />
          
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold tracking-tight">Timeline Era</h3>
            <p className="text-muted-foreground">Peristiwa penting dalam periode ini.</p>
          </div>
          
          {timelineItems.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <p className="text-muted-foreground italic">Belum ada data timeline untuk materi ini.</p>
          )}

          <CompletionSection slug={slug} />
        </TabsContent>

        <TabsContent value="artefak" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {artifacts && artifacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifacts.map((artifact, index) => (
                <ArtifactCard key={index} artifact={artifact} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
              <Box className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground">Belum ada artefak</h3>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Koleksi artefak untuk materi ini sedang dikumpulkan.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
