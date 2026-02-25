"use client"

import * as React from "react"

type UserRole = "guest" | "guru" | "admin" | "teacher" | "student"

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
    // Check for cookie on mount
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
    }

    const savedRole = getCookie("user-role") as UserRole
    if (savedRole && ["admin", "guru", "teacher", "student"].includes(savedRole)) {
      setRole(savedRole)
      // Fetch user data from API if logged in
      fetch("/api/auth/me")
        .then(res => {
          if (res.status === 401) {
            // Token expired or invalid, clear session
            setRole("guest")
            setUserName(null)
            if (isClient) {
               localStorage.removeItem("user-name")
               document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            }
            throw new Error("Unauthorized")
          }
          if (!res.ok) throw new Error("Failed to fetch")
          return res.json()
        })
        .then(data => {
          if (data.name) {
            setUserName(data.name)
            if (isClient) localStorage.setItem("user-name", data.name)
          }
        })
        .catch(err => {
          if (err.message !== "Unauthorized") {
             console.error("Failed to fetch user data", err)
             if (!localStorage.getItem("user-name")) {
                setUserName("User")
             }
          }
        })
    } else {
       // If no role cookie, ensure we don't show stale data
       setUserName(null)
    }
    
    // Fallback to localStorage for immediate display
    const savedName = localStorage.getItem("user-name")
    if (savedName) setUserName(savedName)

  }, [isClient])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setRole("guest")
      setUserName(null)
      if (isClient) {
        localStorage.removeItem("user-name")
        // Clear cookies client-side if possible, or let the server handle it
        document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
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
    setUserName
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
