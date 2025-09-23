import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
import { getSession } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { connectToDB } from "@/lib/db";

dotenv.config();

const API_KEY = process.env.AIVIDEO_API_KEY;
const GENERATE_URL = "https://api.aivideoapi.com/runway/generate/image";
const STATUS_URL = "https://api.aivideoapi.com/status?uuid=";

if (!API_KEY) {
  throw new Error(" API Key is missing. Please set AIVIDEO_API_KEY in .env");
}

function isBase64(str: string) {
  try {
    return Buffer.from(str, "base64").toString("base64") === str;
  } catch (err) {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, textPrompt } = await req.json();

    if (!image || !textPrompt) {
      return NextResponse.json({ error: "Missing image or textPrompt" }, { status: 400 });
    }

    const imageBase64 = isBase64(image)
      ? image
      : Buffer.from(image).toString("base64");

    const payload = {
      img_prompt: `data:image/jpeg;base64,${imageBase64}`,
      text_prompt: textPrompt,
      model: "gen3",
      image_as_end_frame: false,
      flip: false,
      motion: 5,
      seed: 0,
      callback_url: "",
      time: 5,
    };

    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    console.log("Sending request to AI Video API...");
    const response = await axios.post(GENERATE_URL, payload, { headers });

    if (response.status !== 200 || !response.data?.uuid) {
      console.error("API Error:", response.data);
      return NextResponse.json(
        { error: "Failed to generate video", details: response.data },
        { status: 500 }
      );
    }

    const uuid = response.data.uuid;
    console.log("Video UUID:", uuid);
    return NextResponse.json({ uuid, textPrompt });

  } catch (error: any) {
    console.error("Internal Server Error:", error.message, error.response?.data);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //Correct way to get query params from GET request
    const url = new URL(req.url);
    const uuid = url.searchParams.get("uuid");
    const textPrompt = url.searchParams.get("textPrompt") || "No prompt provided";

    if (!uuid) {
      return NextResponse.json({ error: "Missing UUID" }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    };

    console.log(`Checking video status for UUID: ${uuid}`);
    const statusResponse = await axios.get(`${STATUS_URL}${uuid}`, { headers });

    if (statusResponse.status !== 200 || !statusResponse.data) {
      console.error("Status API Error:", statusResponse.data);
      return NextResponse.json(
        { error: "Failed to fetch video status" },
        { status: 500 }
      );
    }

    const statusData = statusResponse.data;

    if (statusData.status === "success") {
      console.log("Video generated successfully:", statusData.url);

      await connectToDB();
      await UserModel.findByIdAndUpdate(session.user.id, {
        $push: {
          videos: {
            videoUrl: statusData.url,
            textPrompt: textPrompt,
            createdAt: new Date(),
          },
        },
      });

      return NextResponse.json({ url: statusData.url });
    } else if (statusData.status === "failed" || statusData.status === "error") {
      console.error(" Video generation failed:", statusData);
      return NextResponse.json(
        { error: "Video generation failed", details: statusData },
        { status: 500 }
      );
    } else {
      console.log(" Video generation in progress...");
      return NextResponse.json({ status: statusData.status });
    }

  } catch (error: any) {
    console.error(" Internal Server Error:", error.message, error.response?.data);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
