"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Database } from "lucide-react"
import Link from "next/link"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteMateri, seedDatabase } from "@/app/dashboard/materi/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Chapter {
  id: number
  title: string
  grade: string
  status: string
  updatedAt: Date
  slug: string
}

interface MateriTableProps {
  data: Chapter[]
}

export function MateriTable({ data }: MateriTableProps) {
  const router = useRouter()

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteMateri(id)
      if (result.success) {
        toast.success("Materi berhasil dihapus")
        router.refresh()
      } else {
        toast.error("Gagal menghapus materi")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus materi")
    }
  }

  const handleSeed = async () => {
    try {
      const result = await seedDatabase()
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Gagal melakukan seeding database")
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center rounded-md border border-dashed p-8">
        <Database className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Belum ada materi</h3>
        <p className="text-muted-foreground max-w-sm">
          Database materi saat ini kosong. Anda dapat menambahkan materi baru atau mengisi database dengan data contoh.
        </p>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleSeed}>
            Isi dengan Data Contoh
            </Button>
            <Button asChild>
            <Link href="/dashboard/materi/new">Buat Materi Baru</Link>
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Judul Materi</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terakhir Diupdate</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.grade}</TableCell>
              <TableCell>
                <Badge variant={item.status === "Published" ? "default" : "secondary"} className={item.status === "Published" ? "bg-green-600" : ""}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(item.updatedAt).toLocaleDateString("id-ID")}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/materi/${item.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/materi/edit/${item.id}`}>
                    <Edit className="h-4 w-4 text-amber-500" />
                  </Link>
                </Button>
                
                <ConfirmModal
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  }
                  title="Hapus Materi?"
                  description="Tindakan ini tidak dapat dibatalkan. Materi akan dihapus secara permanen dari database."
                  onConfirm={() => handleDelete(item.id)}
                  confirmText="Hapus"
                  variant="destructive"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
