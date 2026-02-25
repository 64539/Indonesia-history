
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsPage() {
  const { userName, role } = useAuth()
  const [name, setName] = useState(userName || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Mock update - in real app would call API
    // Since we don't have the user email easily accessible in context (only role/name), 
    // we'll just simulate the success for UI purposes or implement a proper user fetch.
    
    setTimeout(() => {
        localStorage.setItem("user-name", name)
        toast.success("Profil berhasil diperbarui. Silakan refresh halaman.")
        setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold font-serif text-amber-500 mb-6">Pengaturan Akun</h1>
      
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div>
            <h3 className="text-lg font-medium mb-4">Profil Pengguna</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Input type="text" id="role" value={role} disabled className="bg-muted capitalize" />
                </div>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input 
                        type="text" 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </form>
        </div>
      </div>
    </div>
  )
}
