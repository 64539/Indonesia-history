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

    const userResult = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    
    if (!userResult.length || !userResult[0].password) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const user = userResult[0]
    const isPasswordValid = await bcrypt.compare(password, user.password || "")

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

    response.cookies.set("auth-token", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    // Add user-role cookie for middleware and client components
    response.cookies.set("user-role", user.role, {
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
