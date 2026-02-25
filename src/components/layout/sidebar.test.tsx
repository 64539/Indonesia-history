import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect } from "vitest"
import React from "react"
import { Sidebar } from "./sidebar"

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

// Mock UI components that might cause issues in test environment
vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock auth context
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    role: "guest",
  }),
}))

describe("Sidebar", () => {
  it("renders correctly", () => {
    render(<Sidebar />)
    expect(screen.getByText("Koleksi Museum")).toBeTruthy()
    expect(screen.getByText("Lobi Utama")).toBeTruthy()
  })

  it("groups items by category", () => {
    const items = [
      { slug: "item-1", title: "Item 1", category: "Cat A" },
      { slug: "item-2", title: "Item 2", category: "Cat A" },
      { slug: "item-3", title: "Item 3", category: "Cat B" },
    ]

    render(<Sidebar items={items} />)
    expect(screen.getByText("Cat A")).toBeTruthy()
    expect(screen.getByText("Cat B")).toBeTruthy()
    expect(screen.getByText("Item 1")).toBeTruthy()
    expect(screen.getByText("Item 2")).toBeTruthy()
    expect(screen.getByText("Item 3")).toBeTruthy()
  })
})
