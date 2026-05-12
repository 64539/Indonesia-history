import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set("user-role", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  })

  return response
}
