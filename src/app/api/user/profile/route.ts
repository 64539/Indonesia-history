
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { email, name } = body
    
    // In a real app, we would get the user ID from the session/token
    // For this demo, we'll assume the email is passed to identify the user (NOT SECURE for production)
    // OR we should have a middleware that attaches user context.
    
    // Let's assume we pass the current email to verify
    if (!email || !name) {
       return NextResponse.json({ error: "Email dan nama wajib diisi" }, { status: 400 })
    }

    await db.update(users)
        .set({ name })
        .where(eq(users.email, email))
    
    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: "Gagal mengupdate profil" }, { status: 500 })
  }
}
