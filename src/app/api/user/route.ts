import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { desc, eq, ilike, or } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { getSessionFromCookies, StaffAuthError } from "@/lib/session"

async function requireAdminFromSession() {
  const session = await getSessionFromCookies()
  if (!session) throw new StaffAuthError("Unauthorized", 401)
  if (session.role !== "admin") throw new StaffAuthError("Forbidden", 403)
  return session
}

export async function GET(req: Request) {
  try {
    await requireAdminFromSession()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    let whereClause = undefined
    if (search) {
      whereClause = or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))

    return NextResponse.json(allUsers)
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Get Users Error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminFromSession()

    const body = await req.json()
    const { name, email, password, role } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUserResult.length) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newId = crypto.randomUUID()

    await db.insert(users).values({
      id: newId,
      name,
      email,
      password: hashedPassword,
      role,
    })

    const { revalidatePath } = await import("next/cache")
    revalidatePath("/dashboard/users")

    return NextResponse.json({ success: true, id: newId })
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Create User Error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
