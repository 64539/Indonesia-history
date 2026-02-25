"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, PlusCircle, Settings, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { role } = useAuth()
  
  const menuItems = [
    { href: "/dashboard", label: "Statistik", icon: LayoutDashboard },
    { href: "/dashboard/materi", label: "Kelola Materi", icon: BookOpen },
    { href: "/dashboard/materi/new", label: "Tambah Materi Baru", icon: PlusCircle },
  ]

  if (role === "admin") {
     menuItems.push({ href: "/dashboard/users", label: "Manajemen User", icon: Users })
  }
  
  menuItems.push({ href: "/dashboard/settings", label: "Pengaturan Akun", icon: Settings })

  return (
    <div className={cn("pb-12 w-64 border-r bg-background/95 backdrop-blur", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-serif font-bold tracking-tight text-amber-500">
            Museum CMS
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                      : "transparent border-l-2 border-transparent"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
