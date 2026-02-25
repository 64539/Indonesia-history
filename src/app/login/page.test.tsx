import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import LoginPage from "./page"

// Mock useRouter
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock useAuth
const mockSetRole = vi.fn()
const mockSetUserName = vi.fn()

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    setRole: mockSetRole,
    setUserName: mockSetUserName,
    role: "guest",
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders login form", () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
    expect(screen.getByLabelText(/password/i)).toBeTruthy()
    expect(screen.getByRole("button", { name: /masuk/i })).toBeTruthy()
  })

  it("handles successful login", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ role: "admin", name: "Admin User" }),
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } })
    fireEvent.click(screen.getByRole("button", { name: /masuk/i }))

    await waitFor(() => {
      expect(mockSetRole).toHaveBeenCalledWith("admin")
      expect(mockSetUserName).toHaveBeenCalledWith("Admin User")
      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("handles login failure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "Invalid credentials" }),
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } })
    fireEvent.click(screen.getByRole("button", { name: /masuk/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeTruthy()
    })
  })
  
  it("handles network error", async () => {
    (global.fetch as any).mockRejectedValueOnce(new TypeError("Failed to fetch"))

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } })
    fireEvent.click(screen.getByRole("button", { name: /masuk/i }))

    await waitFor(() => {
      expect(screen.getByText("Gagal menghubungi server. Periksa koneksi internet Anda.")).toBeTruthy()
    })
  })
})
