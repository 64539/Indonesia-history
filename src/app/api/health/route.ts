import { NextResponse } from "next/server"
import { testDbConnection } from "@/lib/db"

export async function GET() {
  let aiRes: { status: "fulfilled" | "rejected"; value?: boolean; reason?: any } = { 
    status: "fulfilled", 
    value: false 
  }
  
  // Only test AI if API key is available
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const { testGemini } = await import("@/lib/gemini")
      aiRes = await testGemini().then(
        result => ({ status: "fulfilled" as const, value: result }),
        error => ({ status: "rejected" as const, reason: error })
      )
    } catch (error) {
      aiRes = { status: "rejected" as const, reason: error }
    }
  }

  const dbRes = await testDbConnection().then(
    result => ({ status: "fulfilled" as const, value: result }),
    error => ({ status: "rejected" as const, reason: error })
  )
  
  const okDb = dbRes.status === "fulfilled" && dbRes.value === true
  const okAi = aiRes.status === "fulfilled" && aiRes.value === true
  const status = okDb && (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || okAi) ? 200 : 500
  
  return NextResponse.json(
    {
      db: okDb ? "ok" : "fail",
      ai: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? (okAi ? "ok" : "fail") : "skipped",
      dbError: dbRes.status === "rejected" ? String(dbRes.reason) : undefined,
      aiError: aiRes.status === "rejected" ? String(aiRes.reason) : undefined,
    },
    { status }
  )
}
