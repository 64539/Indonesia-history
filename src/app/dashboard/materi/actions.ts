'use server'

import { db } from "@/lib/db"
import { chapters } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// This function is deprecated - use database directly instead
export async function seedDatabase() {
  return { success: false, message: "This function is deprecated. Use database directly." }
}

export async function deleteMateri(id: number) {
  try {
    await db
      .update(chapters)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(chapters.id, id))
    // Kill ghost data across public + dashboard surfaces
    revalidatePath("/")
    revalidatePath("/materi")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/materi")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete materi:", error)
    return { success: false, message: "Failed to delete materi." }
  }
}
