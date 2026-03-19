"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getGradeSlug } from "@/lib/utils"

type SearchResult = {
  slug: string
  title: string
  grade: string
  videoUrl: string | null
}

export function MaterialSearchBar() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (!containerRef.current?.contains(target)) setIsOpen(false)
    }
    window.addEventListener("mousedown", onMouseDown)
    return () => window.removeEventListener("mousedown", onMouseDown)
  }, [])

  React.useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setIsOpen(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Search failed: ${res.status}`)
        const data = (await res.json()) as { results: SearchResult[] }
        setResults(data.results)
        setIsOpen(true)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setResults([])
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [query])

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/materi/${getGradeSlug(item.grade)}/${item.slug}`)
  }

  const showEmpty = isOpen && !isLoading && query.trim().length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari materi sejarah..."
          className={cn("pl-9")}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-lg border bg-background shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Mencari...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-72 overflow-auto">
              {results.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                    onMouseDown={(e) => {
                      // Prevent input blur before navigation.
                      e.preventDefault()
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.grade}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : showEmpty ? (
            <div className="p-3 text-sm text-muted-foreground">Tidak ada materi ditemukan.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}

