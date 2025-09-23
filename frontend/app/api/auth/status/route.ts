import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")

  if (token) {
    return NextResponse.json({ isLoggedIn: true })
  } else {
    return NextResponse.json({ isLoggedIn: false })
  }
}
