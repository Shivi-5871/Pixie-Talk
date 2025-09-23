import { NextResponse } from "next/server";
import fetch from "node-fetch";

interface AIVideoGenerateResponse {
  uuid?: string;
  error?: string;
}

interface AIVideoStatusResponse {
  status: "pending" | "success" | "failed" | "error";
  url?: string;
  error?: string; // Added for clarity, as the API returns it
}

export async function POST(req: Request) {
  const AIVIDEO_API_KEY = process.env.AIVIDEO_API_KEY;
  if (!AIVIDEO_API_KEY) {
    return NextResponse.json({ error: "AIVIDEO_API_KEY is not set" }, { status: 500 });
  }

  const formData = await req.formData();
  const image = formData.get("image") as File | null;
  const imageUrl = formData.get("imageUrl") as string | null;
  const videoPrompt = formData.get("videoPrompt") as string;
  const sceneIndex = parseInt(formData.get("sceneIndex") as string);

  if (!videoPrompt || (!image && !imageUrl)) {
    return NextResponse.json(
      { error: "Missing video prompt or image" },
      { status: 400 }
    );
  }

  try {
    // Convert image to base64 if uploaded as a File
    let base64Image: string | undefined;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      base64Image = buffer.toString("base64");
    }

    const payload = {
      img_prompt: image
        ? `data:image/jpeg;base64,${base64Image}`
        : `data:image/jpeg;url,${imageUrl}`, // Adjust based on API requirements
      text_prompt: videoPrompt,
      model: "gen3",
      image_as_end_frame: false,
      flip: false,
      motion: 5,
      seed: 0,
      callback_url: "",
      time: 10,
    };

    // Step 1: Generate Video
    const generateResponse = await fetch("https://api.aivideoapi.com/runway/generate/image", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIVIDEO_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(`Video generation error for scene ${sceneIndex}: ${errorText}`);
      throw new Error(`Failed to initiate video generation: ${errorText}`);
    }

    const generateData = (await generateResponse.json()) as AIVideoGenerateResponse;
    const uuid = generateData.uuid;
    if (!uuid) {
      throw new Error("No UUID returned from video generation API");
    }

    // Step 2: Poll Status
    let videoUrl: string | undefined;
    let attempts = 0;
    const maxAttempts = 20;
    const delayMs = 20000; // 20 seconds, matching your Python script

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const statusResponse = await fetch(`https://api.aivideoapi.com/status?uuid=${uuid}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${AIVIDEO_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Status check error: ${errorText}`);
      }

      const statusData = (await statusResponse.json()) as AIVideoStatusResponse;
      console.log(`Status for scene ${sceneIndex}, attempt ${attempts + 1}:`, statusData);

      if (statusData.status === "success" && statusData.url) {
        videoUrl = statusData.url;
        break;
      } else if (statusData.status === "failed" || statusData.status === "error") {
        throw new Error(statusData.error || "Video generation failed");
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("Video generation timed out or failed to complete");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const video = {
      url: videoUrl,
      name: `Scene${sceneIndex}_Video_${timestamp}.mp4`,
      timestamp,
    };

    return NextResponse.json({ video });
  } catch (error: unknown) {
    console.error("Error generating video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}