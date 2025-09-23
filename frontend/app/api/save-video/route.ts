import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { userId, videoUrl, name, scenes } = await req.json();

    if (!userId || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          videos: {
            videoUrl,
            textPrompt: scenes.join("\n\n"), // Combine all scene prompts
            name,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Video saved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save video" },
      { status: 500 }
    );
  }
}