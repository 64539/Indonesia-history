import Link from "next/link";
import { contentData } from "@/lib/contentData";
import { ArrowRight } from "lucide-react";

export default function Home() {
  // Group content by category for display
  const groupedContent = contentData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof contentData>)

  const sortedCategories = Object.keys(groupedContent).sort()

  return (
    <div className="container py-10 space-y-20">
      <section className="text-center space-y-6">
        <h1 className="font-serif text-5xl font-bold tracking-tight lg:text-7xl text-amber-500">
          Digital Museum
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
              <Link key={item.id} href={`/materi/${item.slug}`} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-amber-500/50">
                  <div className="aspect-[16/9] w-full overflow-hidden bg-muted relative">
                    {/* Placeholder for Hero Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className="absolute inset-0 bg-stone-800 animate-pulse" /> {/* Replace with actual Image component */}
                    
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                      <h3 className="font-serif text-xl font-bold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {item.description}
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
