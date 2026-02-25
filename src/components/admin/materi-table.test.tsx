import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { MateriTable } from "./materi-table"

// Mock dependencies
const mockRefresh = vi.fn()
const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
    push: mockPush,
  }),
}))

const mockSeedDatabase = vi.fn()
const mockDeleteMateri = vi.fn()

vi.mock("@/app/dashboard/materi/actions", () => ({
  seedDatabase: () => mockSeedDatabase(),
  deleteMateri: (id: number) => mockDeleteMateri(id),
}))

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock UI components that might cause issues in test environment
vi.mock("@/components/ui/confirm-modal", () => ({
  ConfirmModal: ({ onConfirm, trigger }: any) => (
    <div data-testid="confirm-modal">
      {trigger}
      <button onClick={onConfirm}>Confirm Delete</button>
    </div>
  ),
}))

// Mock table components
vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}))

const mockData = [
  {
    id: 1,
    title: "Materi 1",
    grade: "Kelas 10",
    status: "Published",
    updatedAt: new Date("2024-01-01"),
    slug: "materi-1",
  },
  {
    id: 2,
    title: "Materi 2",
    grade: "Kelas 11",
    status: "Draft",
    updatedAt: new Date("2024-01-02"),
    slug: "materi-2",
  },
]

describe("MateriTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders table with data", () => {
    render(<MateriTable data={mockData} />)
    expect(screen.getByText("Materi 1")).toBeTruthy()
    expect(screen.getByText("Materi 2")).toBeTruthy()
    expect(screen.getByText("Kelas 10")).toBeTruthy()
    expect(screen.getByText("Published")).toBeTruthy()
  })

  it("renders empty state when data is empty", () => {
    render(<MateriTable data={[]} />)
    expect(screen.getByText("Belum ada materi")).toBeTruthy()
    expect(screen.getByText("Isi dengan Data Contoh")).toBeTruthy()
  })

  it("calls seedDatabase when seed button is clicked", async () => {
    mockSeedDatabase.mockResolvedValue({ success: true, message: "Success" })
    render(<MateriTable data={[]} />)
    
    fireEvent.click(screen.getByText("Isi dengan Data Contoh"))
    
    await waitFor(() => {
      expect(mockSeedDatabase).toHaveBeenCalled()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it("calls deleteMateri when delete is confirmed", async () => {
    mockDeleteMateri.mockResolvedValue({ success: true })
    render(<MateriTable data={mockData} />)
    
    const deleteButtons = screen.getAllByText("Confirm Delete")
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockDeleteMateri).toHaveBeenCalledWith(1)
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
