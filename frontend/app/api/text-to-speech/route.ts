import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { getSession } from "@/lib/auth"; // Import session helper

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text, src_lang, dest_lang } = body;

    if (!text || !src_lang || !dest_lang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const formData = new FormData();
    formData.append("user_id", session.user.id); // Send user ID
    formData.append("text", text);
    formData.append("src_lang", src_lang);
    formData.append("dest_lang", dest_lang);

    const BACKEND_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/text-to-speech`;
    const response = await axios.post(BACKEND_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status !== 200) {
      return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
    }

    return NextResponse.json({ audioUrl: response.data.audioUrl }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
