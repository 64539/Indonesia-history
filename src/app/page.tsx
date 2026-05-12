import Link from "next/link";
import { db } from "@/lib/db";
import { chapters } from "@/db/schema";
import { desc, isNull } from "drizzle-orm";
import { publicChapterVisibility } from "@/lib/chapter-visibility";
import { getSessionFromCookies } from "@/lib/session";
import { ArrowRight, Lock } from "lucide-react";
import { getGradeSlug, getYouTubeThumbnail } from "@/lib/utils";

interface ChapterItem {
  slug: string;
  title: string;
  grade: string;
  description?: string;
  videoUrl?: string | null;
  status: string;
}

export default async function Home() {
  // ── Server-side role from session (DB-backed), not forgeable user-role cookie
  const session = await getSessionFromCookies();
  const userRole = session?.role ?? "guest";
  const isAdmin = userRole === "admin";
  const canSeeAll = isAdmin || userRole === "guru" || userRole === "teacher";

  let chaptersData: ChapterItem[] = [];
  try {
    if (canSeeAll) {
      // Admin / Guru: see all non-deleted chapters (Draft / Published / Archived)
      chaptersData = await db
        .select({
          slug: chapters.slug,
          title: chapters.title,
          grade: chapters.grade,
          videoUrl: chapters.videoUrl,
          status: chapters.status,
        })
        .from(chapters)
        .where(isNull(chapters.deletedAt))
        .orderBy(desc(chapters.updatedAt));
    } else {
      // Guest / Student: Published, not soft-deleted
      chaptersData = await db
        .select({
          slug: chapters.slug,
          title: chapters.title,
          grade: chapters.grade,
          videoUrl: chapters.videoUrl,
          status: chapters.status,
        })
        .from(chapters)
        .where(publicChapterVisibility())
        .orderBy(desc(chapters.updatedAt));
    }
  } catch (e) {
    console.error("Failed to fetch chapters for homepage", e);
  }

  // ── Group by grade ────────────────────────────────────────────────────────
  const groupedContent = chaptersData.reduce((acc, item) => {
    if (!acc[item.grade]) acc[item.grade] = [];
    acc[item.grade].push(item);
    return acc;
  }, {} as Record<string, ChapterItem[]>);

  const sortedCategories = Object.keys(groupedContent).sort();

  return (
    <div className="container py-10 space-y-20">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 py-8">
        <div className="inline-block mb-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium tracking-widest uppercase">
          Platform Edukasi Sejarah Indonesia
        </div>
        <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200 drop-shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          RUANG WAKTU 12
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif italic leading-relaxed">
          &quot;Menelusuri jejak waktu, merawat ingatan bangsa.&quot;
        </p>
        {canSeeAll && (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-amber-400 text-xs font-medium">
            <Lock className="h-3 w-3" />
            Mode Admin — Menampilkan semua materi termasuk Draft
          </div>
        )}
      </section>

      {/* ── Chapter Grid ──────────────────────────────────────────────── */}
      {sortedCategories.length === 0 ? (
        <section className="text-center py-20">
          <p className="text-muted-foreground font-serif italic">
            Belum ada materi yang tersedia.
          </p>
        </section>
      ) : (
        sortedCategories.map((category) => (
          <section key={category} className="space-y-8">
            {/* Category header */}
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-amber-500 border-b-2 border-amber-500/20 pb-2">
                {category}
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
            </div>

            {/* Cards — Golden Ratio grid (left sidebar 38.2% / main 61.8%) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groupedContent[category].map((item) => {
                const thumb = item.videoUrl
                  ? getYouTubeThumbnail(item.videoUrl)
                  : null;
                const isDraft = item.status === "Draft";

                return (
                  <Link
                    key={item.slug}
                    href={`/materi/${getGradeSlug(item.grade)}/${item.slug}`}
                    className="group block h-full"
                  >
                    <div
                      className={`relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                        isDraft
                          ? "border-amber-500/30 hover:border-amber-500/60 opacity-80"
                          : "hover:border-amber-500/50"
                      }`}
                    >
                      {/* Thumbnail / gradient */}
                      <div className="aspect-[16/9] w-full overflow-hidden relative">
                        {thumb ? (
                          <>
                            <div
                              className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                              style={{ backgroundImage: `url(${thumb})` }}
                            />
                            <div className="absolute inset-0 bg-black/60" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-stone-900/80" />
                            <div className="absolute inset-0 bg-black/40" />
                          </>
                        )}

                        {/* Draft badge (only visible to admins) */}
                        {isDraft && canSeeAll && (
                          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-stone-900/80 border border-amber-500/40 px-2.5 py-1 text-[10px] font-semibold text-amber-400 tracking-wider backdrop-blur">
                            <Lock className="h-2.5 w-2.5" />
                            DRAFT
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <h3 className="font-serif text-xl font-bold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          Jelajahi materi sejarah ini untuk mengetahui lebih
                          lanjut tentang peristiwa penting dalam sejarah
                          Indonesia.
                        </p>
                        <div className="flex items-center text-sm font-medium text-amber-500 group-hover:translate-x-1 transition-transform">
                          Jelajahi Artefak{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
