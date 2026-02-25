"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Video, Eye } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Judul harus memiliki minimal 2 karakter.",
  }),
  category: z.enum(["Kelas 10", "Kelas 11", "Kelas 12"]),
  videoUrl: z.string().url({ message: "Masukkan URL YouTube yang valid." }),
  content: z.string().min(10, {
    message: "Konten materi minimal 10 karakter.",
  }),
  timeline: z.array(
    z.object({
      year: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
})

import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MateriFormProps {
  initialData?: {
    id?: number
    title: string
    category: string
    videoUrl: string
    content: string
    timeline: {
      year: string
      title: string
      description: string
    }[]
  }
}

export function MateriForm({ initialData }: MateriFormProps) {
  const router = useRouter()
  const [timelineItems, setTimelineItems] = useState(initialData?.timeline || [{ year: "", title: "", description: "" }])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: (initialData?.category as "Kelas 10" | "Kelas 11" | "Kelas 12") || "Kelas 10",
      videoUrl: initialData?.videoUrl || "",
      content: initialData?.content || "",
      timeline: initialData?.timeline || [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const payload = { ...values, timeline: timelineItems }
      const url = initialData?.id ? `/api/materi/${initialData.id}` : "/api/materi"
      const method = initialData?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Gagal menyimpan materi")

      toast.success(initialData?.id ? "Materi berhasil diperbarui" : "Materi berhasil dibuat")
      router.refresh()
      router.push("/dashboard/materi")
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTimelineItem = () => {
    setTimelineItems([...timelineItems, { year: "", title: "", description: "" }])
  }

  const removeTimelineItem = (index: number) => {
    const newItems = [...timelineItems]
    newItems.splice(index, 1)
    setTimelineItems(newItems)
  }

  const updateTimelineItem = (index: number, field: keyof typeof timelineItems[0], value: string) => {
    const newItems = [...timelineItems]
    newItems[index][field] = value
    setTimelineItems(newItems)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {/* ... (Previous Form Fields remain the same) ... */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-medium text-amber-500 border-b border-amber-500/20 pb-2">
            1. Informasi Dasar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Materi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Perang Diponegoro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Kelas</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kelas 10">Kelas 10</SelectItem>
                      <SelectItem value="Kelas 11">Kelas 11</SelectItem>
                      <SelectItem value="Kelas 12">Kelas 12</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-medium text-amber-500 border-b border-amber-500/20 pb-2">
            2. Media Pembelajaran
          </h3>
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Video YouTube</FormLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Video className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="https://youtube.com/watch?v=..." {...field} />
                  </div>
                </div>
                <FormDescription>
                  Masukkan link video pembelajaran yang relevan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-medium text-amber-500 border-b border-amber-500/20 pb-2">
            3. Konten Materi (Markdown)
          </h3>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Isi Materi</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="# Judul Utama\n\nTulis materi sejarah di sini..." 
                    className="min-h-[300px] font-mono text-sm"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Gunakan format Markdown untuk penulisan (Heading dengan #, Bold dengan **, dll).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h3 className="text-lg font-serif font-medium text-amber-500">
              4. Timeline Era Builder
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addTimelineItem} className="text-amber-500 border-amber-500/50 hover:bg-amber-500/10">
              <Plus className="mr-2 h-4 w-4" /> Tambah Event
            </Button>
          </div>
          
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start rounded-lg border p-4 bg-muted/50">
                <div className="grid gap-4 flex-1 md:grid-cols-3">
                  <div>
                    <FormLabel className="text-xs">Tahun</FormLabel>
                    <Input 
                      value={item.year} 
                      onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                      placeholder="1945" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormLabel className="text-xs">Nama Peristiwa</FormLabel>
                    <Input 
                      value={item.title}
                      onChange={(e) => updateTimelineItem(index, 'title', e.target.value)} 
                      placeholder="Proklamasi Kemerdekaan" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <FormLabel className="text-xs">Deskripsi Singkat</FormLabel>
                    <Input 
                      value={item.description}
                      onChange={(e) => updateTimelineItem(index, 'description', e.target.value)} 
                      placeholder="Deskripsi singkat peristiwa..." 
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeTimelineItem(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {/* Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview Materi</DialogTitle>
                <DialogDescription>
                  Tampilan sementara materi sebelum dipublikasikan.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                 <h1 className="text-3xl font-bold font-serif">{form.getValues().title || "Judul Materi"}</h1>
                 <div className="prose prose-stone dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{form.getValues().content || "Konten materi..."}</pre>
                 </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button type="button" variant="secondary">Simpan Draft</Button>
          
          <ConfirmModal
            trigger={
              <Button type="button" className="bg-amber-600 hover:bg-amber-700 text-white min-w-[150px]" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : (initialData?.id ? "Perbarui Materi" : "Publikasikan Materi")}
              </Button>
            }
            title={initialData?.id ? "Perbarui Materi?" : "Publikasikan Materi?"}
            description="Perubahan akan langsung terlihat oleh siswa."
            onConfirm={form.handleSubmit(onSubmit)}
            confirmText={initialData?.id ? "Ya, Perbarui" : "Ya, Publikasikan"}
          />
        </div>
      </form>
    </Form>
  )
}
