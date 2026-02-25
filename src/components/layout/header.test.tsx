import { render, screen, fireEvent } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { Header } from "./header"
import { SidebarItem } from "./sidebar"

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

vi.mock("@/components/mode-toggle", () => ({
  ModeToggle: () => <div data-testid="mode-toggle">ModeToggle</div>,
}))

vi.mock("@/components/command-menu", () => ({
  CommandMenu: () => <div data-testid="command-menu">CommandMenu</div>,
}))

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

// Mock UI components that might cause issues in test environment
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-trigger">{children}</div>,
}))

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbLink: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  BreadcrumbSeparator: () => <span>/</span>,
}))

// Mock auth context
const mockLogout = vi.fn()
const mockUseAuth = vi.fn()

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}))

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      role: "guest",
      isAuthenticated: false,
      logout: mockLogout,
      userName: null,
    })
  })

  it("renders correctly in guest mode", () => {
    render(<Header />)
    expect(screen.getByText("Indonesian History")).toBeTruthy()
    expect(screen.getByText("Guest Mode")).toBeTruthy()
    expect(screen.getByText("Login")).toBeTruthy()
    expect(screen.getByTestId("mode-toggle")).toBeTruthy()
    expect(screen.getByTestId("command-menu")).toBeTruthy()
  })

  it("renders correctly when authenticated", () => {
    mockUseAuth.mockReturnValue({
      role: "student",
      isAuthenticated: true,
      logout: mockLogout,
      userName: "John Doe",
    })

    render(<Header />)
    expect(screen.getByText("John Doe")).toBeTruthy()
    expect(screen.getByText("Student")).toBeTruthy()
    expect(screen.getByText("Logout")).toBeTruthy()
  })

  it("renders correctly for admin role", () => {
    mockUseAuth.mockReturnValue({
      role: "admin",
      isAuthenticated: true,
      logout: mockLogout,
      userName: "Admin User",
    })

    render(<Header />)
    expect(screen.getByText("admin Mode")).toBeTruthy()
  })

  it("calls logout when logout button is clicked", () => {
    mockUseAuth.mockReturnValue({
      role: "student",
      isAuthenticated: true,
      logout: mockLogout,
      userName: "John Doe",
    })

    render(<Header />)
    fireEvent.click(screen.getByText("Logout"))
    expect(mockLogout).toHaveBeenCalled()
  })
})
