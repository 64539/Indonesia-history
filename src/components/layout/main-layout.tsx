import { SidebarItem } from "@/components/layout/sidebar"
import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { desc } from "drizzle-orm"
import { publicChapterVisibility } from "@/lib/chapter-visibility"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { HeaderWrapper } from "@/components/layout/header-wrapper"

export async function MainLayout({ children }: { children: React.ReactNode }) {
  let items: SidebarItem[] = [];
  try {
     items = await db.select({
       slug: chapters.slug,
       title: chapters.title,
       category: chapters.grade,
     })
     .from(chapters)
     .where(publicChapterVisibility())
     .orderBy(desc(chapters.updatedAt));
  } catch (e) {
     console.error("Failed to fetch chapters for sidebar", e);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <HeaderWrapper items={items} />
        <DashboardLayout items={items}>
          {children}
        </DashboardLayout>
      </div>
    </SidebarProvider>
  )
}
