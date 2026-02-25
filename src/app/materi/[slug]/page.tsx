import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { eq } from "drizzle-orm"
import { VideoPlayer } from "@/components/video-player"
import { Timeline, TimelineItem } from "@/components/timeline"
import { Separator } from "@/components/ui/separator"
import { CompletionSection } from "./client-components"
import { contentData } from "@/lib/contentData"
import { MDXRemote } from "next-mdx-remote/rsc"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  // Use local content data for static generation fallback during build
  // In a real dynamic app, this might be fetched from DB or removed for pure dynamic rendering
  return contentData.map((materi) => ({
    slug: materi.slug,
  }))
}

export default async function MateriPage({ params }: PageProps) {
  const { slug } = await params
  
  // Try fetching from DB first
  // The error 'Cannot read properties of undefined (reading findFirst)' suggests db.query.chapters is undefined.
  // This happens if the schema is not properly passed to the drizzle constructor or using the wrong import.
  // We can use the query builder syntax 'db.select().from()...' which is safer if relational queries aren't setup.
  
  const dbChapters = await db.select().from(chapters).where(eq(chapters.slug, slug)).limit(1);
  const dbChapter = dbChapters.length > 0 ? dbChapters[0] : null;

  // Define a union type for the material data to handle both DB and local sources
  type MateriData = {
    title: string;
    category?: string; // from local
    grade?: string; // from DB
    content?: string; // from DB
    fullContent?: string; // from local
    videoUrl?: string | null;
    estimatedTime?: number | string | null;
    timeline?: TimelineItem[]; // Keep flexible or define strict timeline type
  } | null;

  let materi: MateriData = dbChapter;
  let timelineItems: TimelineItem[] = [];

  if (dbChapter) {
     // Fetch timelines for this chapter
     timelineItems = await db.select().from(timelines).where(eq(timelines.chapterId, dbChapter.id));
  } else {
    // Fallback to local contentData if not in DB
    const localMateri = contentData.find((item) => item.slug === slug);
    if (localMateri) {
      materi = localMateri;
      timelineItems = localMateri.timeline || [];
    }
  }

  if (!materi) {
    // Custom 404 / Under Curation UI
    return (
      <div className="container max-w-4xl py-20 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-amber-500 mb-4">
          Konten Sedang Dikurasi
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Artefak digital ini sedang dalam proses pemugaran oleh tim museum kami.
          Silakan kembali lagi nanti.
        </p>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </div>
    )
  }

  // Fallback content if fullContent is missing
  const content = (materi.content as string) || (materi.fullContent as string) || `
# ${materi.title}

Maaf, konten lengkap untuk materi ini sedang dalam tahap kurasi oleh tim museum kami. 

Silakan kembali lagi nanti untuk melihat koleksi lengkapnya.

> "Sejarah adalah guru kehidupan."
  `

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-block rounded-lg bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500">
            {materi.grade || materi.category}
          </div>
          <div className="text-sm text-muted-foreground">
            Estimasi: {materi.estimatedTime || 10} Menit
          </div>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight lg:text-5xl">
          {materi.title}
        </h1>
        <Separator className="my-4" />
      </div>

      <div className="mb-10">
        {/* Placeholder video URL if not present in data, or use a default one */}
        <VideoPlayer url={materi.videoUrl || "https://www.youtube.com/watch?v=33v0GgVlQ5Y"} />
      </div>

      <article className="prose prose-stone dark:prose-invert max-w-none font-sans">
        <MDXRemote source={content} />
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
    </div>
  )
}
