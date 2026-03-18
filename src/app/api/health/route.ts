import { NextResponse } from "next/server"
import { testDbConnection } from "@/lib/db"
import { testGemini } from "@/lib/gemini"

export async function GET() {
  const [dbRes, aiRes] = await Promise.allSettled([testDbConnection(), testGemini()])
  const okDb = dbRes.status === "fulfilled" && dbRes.value === true
  const okAi = aiRes.status === "fulfilled" && aiRes.value === true
  const status = okDb && okAi ? 200 : 500
  return NextResponse.json(
    {
      db: okDb ? "ok" : "fail",
      ai: okAi ? "ok" : "fail",
      dbError: dbRes.status === "rejected" ? String(dbRes.reason) : undefined,
      aiError: aiRes.status === "rejected" ? String(aiRes.reason) : undefined,
    },
    { status }
  )
}
