"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { contentData } from "@/lib/contentData"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard } from "lucide-react"

export type SidebarItem = {
  slug: string
  title: string
  category: string
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  items?: SidebarItem[]
}

export function Sidebar({ className, items = contentData }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useAuth()

  // Group content by category (Grade)
  const groupedContent = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, SidebarItem[]>)

  // Sort categories to ensure correct order (Kelas 10, 11, 12)
  const sortedCategories = Object.keys(groupedContent).sort()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-serif font-semibold tracking-tight text-amber-500">
            Koleksi Museum
          </h2>
          <div className="space-y-1">
            <Link href="/">
              <div
                className={cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === "/" 
                    ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500" 
                    : "transparent border-l-2 border-transparent"
                )}
              >
                Lobi Utama
              </div>
            </Link>

            {(role === "admin" || role === "guru") && (
              <Link href="/dashboard">
                <div
                  className={cn(
                    "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname.startsWith("/dashboard")
                      ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500" 
                      : "transparent border-l-2 border-transparent"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard Guru
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="px-3">
          <Accordion type="multiple" defaultValue={sortedCategories} className="w-full">
            {sortedCategories.map((category) => (
              <AccordionItem key={category} value={category} className="border-b-0">
                <AccordionTrigger className="px-4 py-2 text-sm font-semibold hover:no-underline hover:text-amber-500">
                  {category}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {groupedContent[category].map((item) => (
                      <Link key={item.slug} href={`/materi/${item.slug}`}>
                        <div
                          className={cn(
                            "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ml-2",
                            pathname === `/materi/${item.slug}`
                              ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                              : "transparent border-l-2 border-transparent text-muted-foreground"
                          )}
                        >
                          {item.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
