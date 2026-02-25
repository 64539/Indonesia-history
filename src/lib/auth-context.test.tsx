import { render, screen, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import React from "react"
import { AuthProvider, useAuth } from "./auth-context"

// Helper component to test hook
const TestComponent = () => {
  const { role, userName } = useAuth()
  return (
    <div>
      <span data-testid="role">{role}</span>
      <span data-testid="username">{userName || "null"}</span>
    </div>
  )
}

describe.skip("AuthProvider", () => {
    let cookieStore: { value: string } = { value: "" }
  
    beforeEach(() => {
      vi.clearAllMocks()
      cookieStore.value = ""
      
      // Stub localStorage
      const store: Record<string, string> = {}
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value },
        removeItem: (key: string) => { delete store[key] },
      })
  
      // Mock global fetch
      global.fetch = vi.fn()
      
      // Mock document.cookie
      Object.defineProperty(document, "cookie", {
        get: () => cookieStore.value,
        set: (val) => { cookieStore.value = val },
        configurable: true
      })
    })
  
    it("handles 401 response by clearing session", async () => {
      // Simulate logged in state via cookie
      cookieStore.value = "user-role=admin"
      
      // Mock fetch returning 401
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      })
  
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
  
      await waitFor(() => {
        expect(screen.getByTestId("role")).toHaveTextContent("guest")
        expect(screen.getByTestId("username")).toHaveTextContent("null")
      })
    })
  
    it("handles successful user fetch", async () => {
      cookieStore.value = "user-role=admin"
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ name: "Test User" }),
      })
  
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
  
      await waitFor(() => {
        expect(screen.getByTestId("role")).toHaveTextContent("admin")
        expect(screen.getByTestId("username")).toHaveTextContent("Test User")
      })
    })
  })




