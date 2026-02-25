import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { CommandMenu } from "./command-menu"

// Mock dependencies
const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock("lucide-react", () => ({
  BookOpen: () => <span>Icon</span>,
  Search: () => <span>SearchIcon</span>,
  User: () => <span>UserIcon</span>,
  CreditCard: () => <span>CreditCardIcon</span>,
  Settings: () => <span>SettingsIcon</span>,
}))

// Mock cmkd components (which are used inside CommandMenu)
// Since cmkd is complex to mock, we rely on the implementation details or mock the UI components
// The CommandMenu uses @/components/ui/command which wraps cmkd.
// We should check if our previous mocks for UI components are sufficient.
// We haven't mocked @/components/ui/command yet.

vi.mock("@/components/ui/command", () => ({
  CommandDialog: ({ children, open, onOpenChange }: any) => (
    open ? <div data-testid="command-dialog">
      <button onClick={() => onOpenChange(false)}>Close</button>
      {children}
    </div> : null
  ),
  CommandInput: ({ placeholder }: any) => <input placeholder={placeholder} data-testid="command-input" />,
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children, heading }: any) => (
    <div>
      <h3>{heading}</h3>
      {children}
    </div>
  ),
  CommandItem: ({ children, onSelect, value }: any) => (
    <div onClick={onSelect} data-value={value} data-testid="command-item">
      {children}
    </div>
  ),
  CommandSeparator: () => <hr />,
  CommandShortcut: ({ children }: any) => <span>{children}</span>,
}))

const mockItems = [
  { slug: "materi-1", title: "Materi Satu", category: "Kelas 10" },
  { slug: "materi-2", title: "Materi Dua", category: "Kelas 11" },
]

describe("CommandMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders trigger button correctly", () => {
    render(<CommandMenu items={mockItems} />)
    expect(screen.getByText("Search content...")).toBeTruthy()
    expect(screen.getByText("⌘")).toBeTruthy()
    expect(screen.getByText("K")).toBeTruthy()
  })

  it("opens dialog when trigger is clicked", () => {
    render(<CommandMenu items={mockItems} />)
    fireEvent.click(screen.getByText("Search content..."))
    expect(screen.getByTestId("command-dialog")).toBeTruthy()
  })

  it("renders items in the list", () => {
    render(<CommandMenu items={mockItems} />)
    fireEvent.click(screen.getByText("Search content..."))
    
    expect(screen.getByText("Materi")).toBeTruthy() // Group heading
    expect(screen.getByText("Materi Satu")).toBeTruthy()
    expect(screen.getByText("Materi Dua")).toBeTruthy()
    expect(screen.getByText("(Kelas 10)")).toBeTruthy()
  })

  it("navigates to materi page on selection", () => {
    render(<CommandMenu items={mockItems} />)
    fireEvent.click(screen.getByText("Search content..."))
    
    fireEvent.click(screen.getByText("Materi Satu"))
    expect(mockPush).toHaveBeenCalledWith("/materi/materi-1")
  })
})
