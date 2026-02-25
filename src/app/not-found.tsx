import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-2xl font-serif font-bold tracking-tight">
        Halaman Tidak Ditemukan
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Maaf, artefak digital yang Anda cari mungkin telah dipindahkan atau belum ditemukan dalam arsip kami.
      </p>
      <Link href="/">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          Kembali ke Lobi Museum
        </Button>
      </Link>
    </div>
  )
}
