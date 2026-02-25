"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Settings, User } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { SidebarItem } from "@/components/layout/sidebar"
import { navigation } from "@/lib/navigation"
import { BookOpen } from "lucide-react"

interface CommandMenuProps {
  items?: SidebarItem[]
}

export function CommandMenu({ items }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const [isPending, startTransition] = React.useTransition()
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    startTransition(() => {
        command()
    })
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">{isPending ? "Navigating..." : "Search content..."}</span>
        <span className="inline-flex lg:hidden">{isPending ? "..." : "Search..."}</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {items && items.length > 0 && (
            <CommandGroup heading="Materi">
              {items.map((item) => (
                <CommandItem
                  key={item.slug}
                  value={item.title}
                  keywords={[item.category]}
                  onSelect={() => {
                    runCommand(() => router.push(`/materi/${item.slug}`))
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({item.category})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {navigation.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => router.push(item.href))
                  }}
                >
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
