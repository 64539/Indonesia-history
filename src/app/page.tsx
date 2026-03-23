import Link from "next/link";
import { db } from "@/lib/db";
import { chapters } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { getGradeSlug, getYouTubeThumbnail } from "@/lib/utils";

interface ChapterItem {
  slug: string;
  title: string;
  grade: string;
  description?: string;
  videoUrl?: string | null;
}

export default async function Home() {
  let chaptersData: ChapterItem[] = [];
  try {
    chaptersData = await db.select({
      slug: chapters.slug,
      title: chapters.title,
      grade: chapters.grade,
      videoUrl: chapters.videoUrl,
    })
    .from(chapters)
    .where(eq(chapters.status, "Published"))
    .orderBy(desc(chapters.updatedAt));
  } catch (e) {
    console.error("Failed to fetch chapters for homepage", e);
  }

  // Group content by category for display
  const groupedContent = chaptersData.reduce((acc, item) => {
    if (!acc[item.grade]) {
      acc[item.grade] = []
    }
    acc[item.grade].push(item)
    return acc
  }, {} as Record<string, ChapterItem[]>)

  const sortedCategories = Object.keys(groupedContent).sort()

  return (
    <div className="container py-10 space-y-20">
      <section className="text-center space-y-6">
        <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-200">
          RuangWaktu 12
        </h1>
        <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-serif italic">
          &quot;Menelusuri jejak waktu, merawat ingatan bangsa.&quot;
        </p>
      </section>

      {sortedCategories.map((category) => (
        <section key={category} className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-amber-500 border-b-2 border-amber-500/20 pb-2">
              {category}
            </h2>
            <div className="h-[1px] flex-1 bg-amber-500/20" />
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupedContent[category].map((item) => (
              <Link key={item.slug} href={`/materi/${getGradeSlug(item.grade)}/${item.slug}`} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-amber-500/50">
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    {/* Premium YouTube thumbnail background (published-only content) */}
                    {item.videoUrl && getYouTubeThumbnail(item.videoUrl) ? (
                      <>
                        <div
                          className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${getYouTubeThumbnail(item.videoUrl)})` }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-stone-900/80" />
                        <div className="absolute inset-0 bg-black/60 animate-pulse" />
                      </>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <h3 className="font-serif text-xl font-bold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {item.description || "Jelajahi materi sejarah ini untuk mengetahui lebih lanjut tentang peristiwa penting dalam sejarah Indonesia."}
                    </p>
                    <div className="flex items-center text-sm font-medium text-amber-500 group-hover:translate-x-1 transition-transform">
                      Jelajahi Artefak <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
