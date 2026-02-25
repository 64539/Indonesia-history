'use client'

import * as React from "react"
import { useSidebar } from "@/components/layout/sidebar-provider"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children, items }: { children: React.ReactNode, items: SidebarItem[] }) {
  const { sidebarOpen } = useSidebar()

  return (
    <div className={cn(
      "container flex-1 items-start md:grid md:gap-6 lg:gap-10 transition-all duration-300",
      sidebarOpen ? "md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]" : "md:grid-cols-[0px_minmax(0,1fr)]"
    )}>
      <aside 
        className={cn(
          "fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r md:sticky md:block transition-all duration-300",
          sidebarOpen ? "w-full opacity-100" : "w-0 opacity-0 overflow-hidden border-none"
        )}
      >
        <Sidebar items={items} className="h-full py-6 pr-6 lg:py-8" />
      </aside>
      <main className="relative py-6 lg:gap-10 lg:py-8 min-w-0">
        <div className="mx-auto w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
