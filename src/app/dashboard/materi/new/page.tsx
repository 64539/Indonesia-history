import { AdminSidebar } from "@/components/admin/sidebar"
import { Separator } from "@/components/ui/separator"
import { MateriForm } from "@/components/admin/materi-form"

export default function NewMateriPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar className="hidden md:block" />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-amber-500">Tambah Materi Baru</h2>
            <p className="text-muted-foreground">
              Buat konten sejarah baru untuk museum digital.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        <MateriForm />
      </div>
    </div>
  )
}
