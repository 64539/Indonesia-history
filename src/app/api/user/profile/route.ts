import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromCookies, StaffAuthError } from "@/lib/session"

const BodySchema = z
  .object({
    name: z.string().min(1).max(200),
  })
  .strict()

/** Updates only the authenticated user's row; `session.id` is never taken from the request body (IDOR-safe). */
export async function PUT(req: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      throw new StaffAuthError("Unauthorized", 401)
    }

    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 })
    }

    await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, session.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Gagal mengupdate profil" }, { status: 500 })
  }
}
