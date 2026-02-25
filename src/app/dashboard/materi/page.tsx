import { AdminSidebar } from "@/components/admin/sidebar"
import { Separator } from "@/components/ui/separator"
import { MateriTable } from "@/components/admin/materi-table"
import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { desc } from "drizzle-orm"

export default async function MateriDashboardPage() {
  const materiList = await db.select().from(chapters).orderBy(desc(chapters.updatedAt))

  return (
    <div className="flex min-h-screen">
      <AdminSidebar className="hidden md:block" />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-amber-500">Kelola Materi</h2>
            <p className="text-muted-foreground">
              Daftar semua materi sejarah yang telah dibuat.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <MateriTable data={materiList} />
      </div>
    </div>
  )
}
