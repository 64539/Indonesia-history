"use client"

import * as React from "react"
import type { UserRole } from "@/lib/rbac"

interface AuthContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAuthenticated: boolean
  logout: () => void
  userName: string | null
  setUserName: (name: string | null) => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<UserRole>("guest")
  const [userName, setUserName] = React.useState<string | null>(null)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    let cancelled = false

    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          if (!cancelled) {
            setRole("guest")
            setUserName(null)
            localStorage.removeItem("user-name")
          }
          throw new Error("Unauthorized")
        }
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const r = data.role as UserRole
        if (r && ["admin", "guru", "teacher", "student"].includes(r)) {
          setRole(r)
        } else {
          setRole("guest")
        }
        if (data.name) {
          setUserName(data.name)
          localStorage.setItem("user-name", data.name)
        } else {
          setUserName(null)
        }
      })
      .catch((err) => {
        if (err.message === "Unauthorized") return
        if (!cancelled) {
          console.error("Failed to fetch user data", err)
          const savedName = localStorage.getItem("user-name")
          if (savedName) setUserName(savedName)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setRole("guest")
      setUserName(null)
      if (isClient) {
        localStorage.removeItem("user-name")
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  const value = {
    role,
    setRole,
    isAuthenticated: role !== "guest",
    logout,
    userName,
    setUserName,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    return {
      role: "guest",
      setRole: (_role: UserRole) => {},
      isAuthenticated: false,
      logout: () => {},
      userName: null,
      setUserName: (_name: string | null) => {},
    }
  }
  return context
}
