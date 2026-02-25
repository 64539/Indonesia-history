import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password diperlukan" }, { status: 400 })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    // Set cookies for simple auth
    const response = NextResponse.json({ success: true, role: user.role, name: user.name })
    
    // In production, sign a JWT here
    response.cookies.set("auth-token", "valid-session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    response.cookies.set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    response.cookies.set("user-role", user.role, {
      httpOnly: false, // Accessible by client for UI logic
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 })
  }
}
