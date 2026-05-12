import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/auth-token"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenStr = cookieStore.get("auth-token")?.value
    const claims = await verifyAuthToken(tokenStr)

    if (!claims?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userResult = await db.select().from(users).where(eq(users.id, claims.id)).limit(1)
    
    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    console.error("Auth Me Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
