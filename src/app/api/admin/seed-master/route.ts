import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, chapters } from "@/db/schema"
import { eq, ne } from "drizzle-orm"
import { requireAdminSession, StaffAuthError } from "@/lib/session"

export const dynamic = "force-dynamic"

const ADMIN_ID = "admin"
const ADMIN_EMAIL = "admin@ruangwaktu12.id"
const ADMIN_NAME = "Master Admin"
const ADMIN_PASSWORD = "Admin-ruang-waktu-2311"

// WARNING: This endpoint performs destructive operations (clears users).
// Only allow it automatically in non-production environments.
function isSeedAllowed() {
  if (process.env.NODE_ENV !== "production") return true
  return process.env.ALLOW_MASTER_ADMIN_SEED === "true"
}

export async function POST() {
  try {
    await requireAdminSession()

    if (!isSeedAllowed()) {
      return NextResponse.json({ error: "Seeding not allowed in production." }, { status: 403 })
    }
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    await db.transaction(async (tx) => {
      // Re-link all existing materi to the new master admin first.
      await tx.update(chapters).set({ authorId: ADMIN_ID })

      // Remove all other users to avoid orphaned auth/progress/quiz rows.
      await tx.delete(users).where(ne(users.id, ADMIN_ID))

      // Ensure the master admin exists with the expected credentials.
      await tx
        .insert(users)
        .values({
          id: ADMIN_ID,
          name: ADMIN_NAME,
          email: ADMIN_EMAIL.toLowerCase(),
          password: hashedPassword,
          role: "admin",
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            id: ADMIN_ID,
            name: ADMIN_NAME,
            password: hashedPassword,
            role: "admin",
          },
        })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Seed master admin error:", error)
    return NextResponse.json({ error: "Failed to seed master admin" }, { status: 500 })
  }
}

