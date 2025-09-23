

import { NextResponse } from "next/server";
import fetch from "node-fetch";

// Define the Monster API response interfaces
interface MonsterApiInitialResponse {
  message: string;
  process_id: string;
  status_url: string;
  callback_url: string;
  webhook_url: string;
}

interface MonsterApiStatusResponse {
  process_id: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  result: {
    output?: string[];
    errorMessage?: string;
  };
  credit_used?: number;
  overage?: number;
}

interface Scene {
  storyScene: string | null;
  imagePrompt: string | null;
  videoPrompt: string | null;
}

export async function POST(req: Request) {
  const { scenes, style, sceneIndex, numImages } = await req.json();
  const MONSTER_API_KEY = process.env.MONSTER_API_KEY;

  if (!MONSTER_API_KEY) {
    return NextResponse.json({ error: "MONSTER_API_KEY is not set" }, { status: 500 });
  }

  if (
    !scenes ||
    !Array.isArray(scenes) ||
    !style ||
    sceneIndex === undefined ||
    !numImages ||
    numImages < 1 ||
    numImages > 4
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required parameters: scenes, style, sceneIndex, or numImages" },
      { status: 400 }
    );
  }

  try {
    const scene: Scene = scenes[sceneIndex - 1];
    if (!scene || !scene.imagePrompt) {
      return NextResponse.json({ images: new Array(numImages).fill(null) });
    }
    
    const promptWithStyle = `${scene.imagePrompt}, in ${style} style`;
    console.log(`Generating images for scene ${sceneIndex} with prompt: ${promptWithStyle}`);

    const initialResponse = await fetch("https://api.monsterapi.ai/v1/generate/txt2img", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MONSTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptWithStyle,
        samples: numImages,
        steps: 50,
        aspect_ratio: "square",
        model: "stable-diffusion",
      }),
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error(`Image generation error for scene ${sceneIndex}: ${errorText}`);
      return NextResponse.json({ images: new Array(numImages).fill(null) });
    }

    const initialData = (await initialResponse.json()) as MonsterApiInitialResponse;
    console.log(`Raw API initial response for scene ${sceneIndex}:`, initialData);

    const statusUrl = initialData.status_url;
    let statusData: MonsterApiStatusResponse;
    let attempts = 0;
    const maxAttempts = 30;
    const delayMs = 2000;

    do {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const statusResponse = await fetch(statusUrl, {
        headers: {
          Authorization: `Bearer ${MONSTER_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`Status check error for scene ${sceneIndex}: ${errorText}`);
        return NextResponse.json({ images: new Array(numImages).fill(null) });
      }

      statusData = (await statusResponse.json()) as MonsterApiStatusResponse;
      console.log(`Status response for scene ${sceneIndex}, attempt ${attempts + 1}:`, statusData);
      attempts++;

      if (statusData.status === "COMPLETED" && statusData.result.output) {
        break;
      }
    } while (attempts < maxAttempts);

    if (statusData.status !== "COMPLETED" || !statusData.result.output) {
      console.error(
        `Image generation timed out or failed for scene ${sceneIndex}:`,
        statusData.result?.errorMessage || "Unknown error"
      );
      return NextResponse.json({ images: new Array(numImages).fill(null) });
    }

    const imageUrls = statusData.result.output;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // e.g., 2025-04-09T12-00-00Z -> 2025-04-09T12-00-00Z
    const images = imageUrls.map((url, idx) => ({
      url,
      name: `Scene${sceneIndex}_Image${idx + 1}_${timestamp}.png`,
      timestamp,
    }));

    const formattedImages =
      images.length >= numImages
        ? images.slice(0, numImages)
        : [...images, ...new Array(numImages - images.length).fill(null)];

    return NextResponse.json({ images: formattedImages });
  } catch (error: unknown) {
    console.error("Error generating images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}