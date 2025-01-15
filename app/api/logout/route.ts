import { logout } from "@/server/services/authentication-service"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await logout()
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[LOGOUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 