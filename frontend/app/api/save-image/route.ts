
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, prompt, style } = await req.json();
    const userId = session.user.id;

    if (!imageUrl || !prompt || !style) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDB();

    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure images is initialized as an array
    if (!user.images) {
      user.images = [];
    }

    const imageData = { url: imageUrl, prompt, style, createdAt: new Date() };
    console.log("Saving image:", imageData);  // Log image details before saving

    user.images.push(imageData);
    await user.save();

    return NextResponse.json({ message: "Image saved successfully", savedImage: imageData });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
