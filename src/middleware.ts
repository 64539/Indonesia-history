import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const payload = await verifyAuthToken(token);
  const role = payload?.role ?? null;
  const { pathname } = request.nextUrl;

  // Dashboard: verified JWT only (never trust a separate role cookie).
  if (pathname.startsWith("/dashboard")) {
    if (!payload || !role || (role !== "admin" && role !== "guru" && role !== "teacher")) {
      console.log(`Middleware: Redirecting from ${pathname} to /login (Role: ${role})`);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/dashboard/teacher") && role !== "teacher" && role !== "guru") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/api/chat")) {
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    if (role === "admin" || role === "guru" || role === "teacher") {
      console.log(`Middleware: Redirecting from ${pathname} to /dashboard (Role: ${role})`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (role === "student") {
      console.log(`Middleware: Redirecting from ${pathname} to / (Role: ${role})`);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/chat"],
};
