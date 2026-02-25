'use server'

import { db } from "@/lib/db"
import { chapters, timelines } from "@/db/schema"
import { contentData } from "@/lib/contentData"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function seedDatabase() {
  try {
    // Check if data already exists to avoid duplicates
    const existingCount = await db.select().from(chapters).limit(1)
    if (existingCount.length > 0) {
      return { success: false, message: "Database already contains data." }
    }

    for (const item of contentData) {
      // Insert chapter
      const [newChapter] = await db.insert(chapters).values({
        slug: item.slug,
        title: item.title,
        grade: item.category,
        content: item.fullContent || item.description, // Fallback content
        videoUrl: "", // Add default if needed
        estimatedTime: 10,
        status: item.status,
      }).returning({ id: chapters.id })

      // Insert timeline items if any
      if (item.timeline && item.timeline.length > 0) {
        await db.insert(timelines).values(
          item.timeline.map(t => ({
            chapterId: newChapter.id,
            year: t.year,
            title: t.title,
            description: t.description,
          }))
        )
      }
    }

    revalidatePath("/dashboard/materi")
    return { success: true, message: "Database seeded successfully!" }
  } catch (error) {
    console.error("Failed to seed database:", error)
    return { success: false, message: "Failed to seed database." }
  }
}

export async function deleteMateri(id: number) {
  try {
    await db.delete(chapters).where(eq(chapters.id, id))
    revalidatePath("/dashboard/materi")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete materi:", error)
    return { success: false, message: "Failed to delete materi." }
  }
}
