'use client'

import * as React from "react"
import { Header } from "@/components/layout/header"
import { useSidebar } from "@/components/layout/sidebar-provider"
import { SidebarItem } from "@/components/layout/sidebar"

export function HeaderWrapper({ items }: { items: SidebarItem[] }) {
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  
  return <Header items={items} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
}
