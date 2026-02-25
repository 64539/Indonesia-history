"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { CommandMenu } from "@/components/command-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LogOut, Menu, UserCircle } from "lucide-react"
import { Sidebar, SidebarItem } from "@/components/layout/sidebar"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface HeaderProps {
  items?: SidebarItem[]
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

export function Header({ items, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const pathname = usePathname()
  const paths = pathname.split("/").filter((path) => path)
  const { role, isAuthenticated, logout, userName } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Mobile Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 flex flex-col">
             <Sidebar items={items} />
             {isAuthenticated && (
               <div className="border-t p-4 flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-sm font-medium">{userName || "Loading..."}</span>
                   <span className="text-xs text-muted-foreground capitalize">
                     {role === "admin" || role === "guru" || role === "teacher" ? `${role.charAt(0).toUpperCase() + role.slice(1)} Mode` : "Student"}
                   </span>
                 </div>
                 <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => logout()}>
                   <LogOut className="h-4 w-4" />
                 </Button>
               </div>
             )}
          </SheetContent>
        </Sheet>

        {/* Desktop Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 hidden md:flex"
          onClick={() => setSidebarOpen?.(!sidebarOpen)}
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block font-serif text-lg">
              Indonesian History
            </span>
          </Link>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`
                const isLast = index === paths.length - 1
                return (
                  <React.Fragment key={path}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="capitalize">{path.replace(/-/g, " ")}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="capitalize">
                          {path.replace(/-/g, " ")}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu items={items} />
          </div>
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            <div className="hidden md:flex items-center gap-2 border-l pl-2 ml-2">
              {isAuthenticated ? (
                <>
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-medium">{userName || "Loading..."}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {role === "admin" || role === "guru" || role === "teacher" ? `${role.charAt(0).toUpperCase() + role.slice(1)} Mode` : "Student"}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">Guest Mode</span>
                  <Button size="sm" variant="outline" className="gap-2" asChild>
                    <Link href="/login">
                      <UserCircle className="h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
