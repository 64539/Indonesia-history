import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new student
    await db.insert(users).values({
      id: randomUUID(),
      email,
      name,
      password: hashedPassword,
      role: "student", // Default role
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 })
  }
}
