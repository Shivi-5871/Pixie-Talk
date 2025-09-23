import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongocontact"; // Import the MongoDB client promise

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, reason, message } = body;

    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const database = client.db("pixie-talk"); // Replace with your database name
    const collection = database.collection("contacts");

    const result = await collection.insertOne({
      name,
      email,
      reason,
      message,
      createdAt: new Date(),
    });

    console.log("Contact saved with ID:", result.insertedId);

    return NextResponse.json(
      { message: "Message sent successfully!", id: result.insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}