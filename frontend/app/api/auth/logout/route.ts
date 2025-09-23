import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  await session.destroy();
  
  const response = NextResponse.json({ 
    success: true,
    message: "Logged out successfully"
  });
  
  // Clear all auth cookies
  response.cookies.delete("token");
  response.cookies.delete("pixie-talk-session");
  
  return response;
}