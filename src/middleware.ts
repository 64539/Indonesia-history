
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")
  const role = request.cookies.get("user-role")?.value
  const { pathname } = request.nextUrl

  // Protect Dashboard Routes
  if (pathname.startsWith("/dashboard")) {
    if (!token || !role || (role !== "admin" && role !== "guru" && role !== "teacher")) {
      console.log(`Middleware: Redirecting from ${pathname} to /login (Role: ${role})`)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protect AI Chatbot API
  if (pathname.startsWith("/api/chat")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Redirect Login/Register if already authenticated
  if ((pathname === "/login" || pathname === "/register") && token) {
    if (role === "admin" || role === "guru" || role === "teacher") {
      console.log(`Middleware: Redirecting from ${pathname} to /dashboard (Role: ${role})`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // If student, redirect to home
    if (role === "student") {
      console.log(`Middleware: Redirecting from ${pathname} to / (Role: ${role})`)
      return NextResponse.redirect(new URL("/", request.url))
    }
    // If token exists but role is missing/invalid, allow access to login page
    // so user can re-authenticate to fix their session
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/chat"],
}
