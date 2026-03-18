"use client"

import * as React from "react"
import { AlertTriangle, Upload, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface InvalidUrlAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  urlType: 'google-drive' | 'social-media' | 'invalid' | null
}

export function InvalidUrlAlert({ open, onOpenChange, urlType }: InvalidUrlAlertProps) {
  const getAlertContent = () => {
    if (!urlType) {
      return {
        title: "Tautan Gambar Tidak Valid",
        message: "Tautan yang Anda masukkan tidak merujuk ke file gambar yang valid. Silakan periksa kembali tautan atau gunakan fitur unggah gambar.",
        icon: <AlertTriangle className="h-5 w-5" />
      }
    }
    
    switch (urlType) {
      case 'google-drive':
        return {
          title: "Tautan Google Drive Terdeteksi",
          message: "Mohon maaf Bapak/Ibu Guru, tautan yang Anda masukkan merujuk pada halaman web, bukan file gambar langsung. Agar gambar dapat tampil dengan sempurna, silakan gunakan fitur 'Unggah Gambar' dari perangkat Anda, atau klik kanan pada gambar di sumber asli dan pilih 'Salin Alamat Gambar' (Copy Image Address).",
          icon: <Link className="h-5 w-5" />
        }
      case 'social-media':
        return {
          title: "Tautan Media Sosial Tidak Didukung",
          message: "Tautan dari platform media sosial tidak dapat menampilkan gambar langsung. Silakan unggah gambar secara langsung atau gunakan tautan gambar dari sumber lain.",
          icon: <AlertTriangle className="h-5 w-5" />
        }
      default:
        return {
          title: "Tautan Gambar Tidak Valid",
          message: "Tautan yang Anda masukkan tidak merujuk ke file gambar yang valid. Silakan periksa kembali tautan atau gunakan fitur unggah gambar.",
          icon: <AlertTriangle className="h-5 w-5" />
        }
    }
  }

  const { title, message, icon } = getAlertContent()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              {icon}
            </div>
            <AlertDialogTitle className="text-amber-600">
              {title}
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left">
          {message}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Perbaiki Tautan
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
              <Upload className="mr-2 h-4 w-4" />
              Unggah Gambar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
