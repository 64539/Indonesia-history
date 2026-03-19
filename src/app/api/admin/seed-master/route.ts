import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, chapters } from "@/db/schema"
import { eq, ne } from "drizzle-orm"

export const dynamic = "force-dynamic"

const ADMIN_ID = "admin"
const ADMIN_EMAIL = "admin@museum.id"
const ADMIN_NAME = "Master Admin"
const ADMIN_PASSWORD = "Admin24434!"

// WARNING: This endpoint performs destructive operations (clears users).
// Only allow it automatically in non-production environments.
function isSeedAllowed() {
  if (process.env.NODE_ENV !== "production") return true
  return process.env.ALLOW_MASTER_ADMIN_SEED === "true"
}

export async function POST() {
  if (!isSeedAllowed()) {
    return NextResponse.json({ error: "Seeding not allowed in production." }, { status: 403 })
  }

  try {
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
    console.error("Seed master admin error:", error)
    return NextResponse.json({ error: "Failed to seed master admin" }, { status: 500 })
  }
}

