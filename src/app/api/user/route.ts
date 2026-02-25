import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { desc, eq, ilike, or } from "drizzle-orm"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user-id")?.value
    
    // Check auth (simplified)
    if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if admin (simplified for demo, ideally use middleware or session context)
    // We can assume if they have a valid session and can hit this endpoint, we check role in DB
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
    })
    
    if (!currentUser || currentUser.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    
    let whereClause = undefined
    if (search) {
        whereClause = or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`)
        )
    }

    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error("Get Users Error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get("user-id")?.value
        
        if (!userId) {
           return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId)
        })
        
        if (!currentUser || currentUser.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, email, password, role } = body
        
        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (existingUser) {
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

        return NextResponse.json({ success: true, id: newId })

    } catch (error) {
        console.error("Create User Error:", error)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
}