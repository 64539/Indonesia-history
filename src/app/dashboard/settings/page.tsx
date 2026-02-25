"use client"

import { AdminSidebar } from "@/components/admin/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
           toast.error("Gagal memuat profil")
        } else {
           setName(data.name || "")
           setEmail(data.email || "")
        }
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success("Profil berhasil diperbarui")
        // Update local storage if needed to reflect changes immediately in other components
        if (typeof window !== "undefined") {
            localStorage.setItem("user-name", name)
        }
      } else {
        toast.error(data.error || "Gagal memperbarui profil")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar className="hidden md:block" />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight text-amber-500">Pengaturan Akun</h2>
            <p className="text-muted-foreground">
              Kelola preferensi akun dan keamanan.
            </p>
          </div>
        </div>
        <Separator className="my-6" />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>
                Informasi dasar tentang akun Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  value={isLoading ? "Loading..." : name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={isLoading ? "Loading..." : email} 
                  disabled 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading || isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>
                Ubah password akun Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input id="new-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Ubah Password</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
