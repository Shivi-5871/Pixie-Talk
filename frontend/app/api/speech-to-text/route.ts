// //frontend/app/api/speech-to-text/route.ts
// import { NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";
// import FormData from "form-data";
// import fetch from "node-fetch";
// import { getSession } from "@/lib/auth"; // Import session handling

// const STATIC_FOLDER = path.join(process.cwd(), "record-static");

// interface SpeechToTextResponse {
//   text: string;
//   audioUrl: string;
// }

// export async function POST(request: Request) {
//   try {
//     console.log("Request received at /api/speech-to-text");

//     const session = await getSession();
//     if (!session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const form = await request.formData();
//     const audioFile = form.get("audio") as File;

//     if (!audioFile || !(audioFile instanceof File)) {
//       console.error("Invalid or missing audio file.");
//       return NextResponse.json({ error: "No valid audio file provided." }, { status: 400 });
//     }

//     // Save audio file temporarily
//     const tempFilePath = path.join(STATIC_FOLDER, audioFile.name);
//     await fs.promises.mkdir(STATIC_FOLDER, { recursive: true });

//     const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
//     await fs.promises.writeFile(tempFilePath, fileBuffer);

//     // Send audio file and session user ID to Flask backend
//     const formData = new FormData();
//     formData.append("audio", fs.createReadStream(tempFilePath));
//     formData.append("user_id", session.user.id); // 🔥 Send user ID for authentication

//     const pythonBackendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/speech-to-text`;
//     const response = await fetch(pythonBackendUrl, {
//       method: "POST",
//       body: formData,
//       headers: formData.getHeaders(),
//     });

//     // Delete temporary file
//     await fs.promises.unlink(tempFilePath);

//     if (!response.ok) {
//       const errorResponse = await response.text();
//       console.error("Python backend error:", errorResponse);
//       return NextResponse.json({ error: errorResponse || "Unknown error" }, { status: response.status });
//     }

//     const result = (await response.json()) as SpeechToTextResponse;
//     console.log("Transcription result:", result);

//     return NextResponse.json({ text: result.text });
//   } catch (error) {
//     console.error("Internal server error:", error);
//     return NextResponse.json({ error: "Internal server error." }, { status: 500 });
//   }
// }




// frontend/app/api/speech-to-text/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/auth"; // Import session handling

const STATIC_FOLDER = path.join(process.cwd(), "record-static");

interface SpeechToTextResponse {
  text: string;
  audioUrl?: string;
}

export async function POST(request: Request) {
  try {
    console.log("Request received at /api/speech-to-text");

    // Auth check
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Grab audio file from request
    const form = await request.formData();
    const audioFile = form.get("audio") as File;

    if (!audioFile || !(audioFile instanceof File)) {
      console.error("Invalid or missing audio file.");
      return NextResponse.json(
        { error: "No valid audio file provided." },
        { status: 400 }
      );
    }

    // Save temporary file
    const tempFilePath = path.join(STATIC_FOLDER, audioFile.name || "recording.webm");
    await fs.promises.mkdir(STATIC_FOLDER, { recursive: true });
    const fileBuffer = Buffer.from(await audioFile.arrayBuffer());
    await fs.promises.writeFile(tempFilePath, fileBuffer);

    // Prepare FormData for backend
    const formData = new FormData();
    formData.append("audio", new Blob([fileBuffer]), audioFile.name || "recording.webm");
    formData.append("user_id", session.user.id);

    // Send to Flask backend (Render)
    const pythonBackendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/speech-to-text`;
    const response = await fetch(pythonBackendUrl, {
      method: "POST",
      body: formData,
    });

    // Cleanup local temp file
    await fs.promises.unlink(tempFilePath);

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Python backend error:", errorResponse);
      return NextResponse.json(
        { error: errorResponse || "Unknown error" },
        { status: response.status }
      );
    }

    const result = (await response.json()) as SpeechToTextResponse;
    console.log("Transcription result:", result);

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}