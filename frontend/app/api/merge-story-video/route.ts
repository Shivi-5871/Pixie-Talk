
import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const sceneCount = parseInt(formData.get("sceneCount") as string);
    const audioFile = formData.get("audio") as File;

    // Validate inputs
    if (isNaN(sceneCount) || sceneCount <= 0) {
      throw new Error("Invalid scene count");
    }

    if (!audioFile || !audioFile.type.startsWith("audio/")) {
      throw new Error("No valid audio file provided");
    }

    // Collect videos in order
    const videos: { index: number; file: File }[] = [];
    
    // First try to get videos with ordered keys (video-0, video-1, etc.)
    for (let i = 0; i < sceneCount; i++) {
      const video = formData.get(`video-${i}`) as File;
      if (video && video.type.startsWith("video/")) {
        videos.push({ index: i, file: video });
      }
    }

    // If not found with ordered keys, fall back to collecting all videos
    if (videos.length < sceneCount) {
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.type.startsWith("video/") && !videos.some(v => v.file === value)) {
          const index = videos.length;
          videos.push({ index, file: value });
          if (videos.length >= sceneCount) break;
        }
      }
    }

    // Final validation
    if (videos.length !== sceneCount) {
      throw new Error(`Expected ${sceneCount} videos, but received ${videos.length}`);
    }

    // Sort videos by index to ensure correct order
    videos.sort((a, b) => a.index - b.index);
    const orderedVideos = videos.map(v => v.file);

    // Log the processing order for debugging
    console.log("Processing videos in order:", orderedVideos.map(v => v.name));

    // Create temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "story-merger-"));
    console.log("Created temp directory:", tempDir);

    // Save files temporarily
    const audioPath = path.join(tempDir, `audio-${uuidv4()}${path.extname(audioFile.name)}`);
    await fs.writeFile(audioPath, Buffer.from(await audioFile.arrayBuffer()));

    const videoPaths: string[] = [];
    for (const [index, video] of orderedVideos.entries()) {
      const videoPath = path.join(tempDir, `video-${index}-${uuidv4()}${path.extname(video.name)}`);
      await fs.writeFile(videoPath, Buffer.from(await video.arrayBuffer()));
      videoPaths.push(videoPath);
    }

    // Get durations with error handling
    const getDuration = (filePath: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) {
            reject(new Error(`FFprobe failed for ${filePath}: ${err.message}`));
          } else if (!metadata.format.duration) {
            reject(new Error(`Could not determine duration for ${filePath}`));
          } else {
            resolve(metadata.format.duration);
          }
        });
      });
    };

    const [audioDuration, ...videoDurations] = await Promise.all([
      getDuration(audioPath),
      ...videoPaths.map(getDuration)
    ]);
    const totalVideoDuration = videoDurations.reduce((sum, dur) => sum + dur, 0);

    console.log("Audio duration:", audioDuration);
    console.log("Video durations:", videoDurations);
    console.log("Total video duration:", totalVideoDuration);

    // Prepare output
    const outputPath = path.join(tempDir, `output-${uuidv4()}.mp4`);

    // Create FFmpeg command
    const ffmpegCommand = ffmpeg();

    // Add video inputs in order
    videoPaths.forEach((videoPath) => {
      ffmpegCommand.input(videoPath);
    });

    // Add audio input
    ffmpegCommand.input(audioPath);

    // Complex filter configuration
    const targetResolution = "1280:768";
    const targetFrameRate = 24;
    let filterComplex = videoPaths
      .map((_, i) => `[${i}:v]scale=${targetResolution}:force_original_aspect_ratio=decrease,pad=${targetResolution}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${targetFrameRate}[v${i}]`)
      .join(";") +
      `;${videoPaths.map((_, i) => `[v${i}]`).join("")}concat=n=${videoPaths.length}:v=1:a=0[v];[${videoPaths.length}:a]anull[a]`;

    // Set duration to the shorter of audio or total video duration
    const outputDuration = Math.min(audioDuration, totalVideoDuration);
    console.log("Output duration:", outputDuration);

    // Log FFmpeg command for debugging
    ffmpegCommand.on("start", (commandLine) => {
      console.log("FFmpeg command:", commandLine);
    });

    // Execute FFmpeg with timeout
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("FFmpeg processing timed out after 60 seconds"));
      }, 60000);

      ffmpegCommand
        .complexFilter(filterComplex)
        .outputOptions([
          "-map [v]",
          "-map [a]",
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-c:a aac",
          "-b:a 128k",
          `-t ${outputDuration}`,
        ])
        .output(outputPath)
        .on("end", () => {
          clearTimeout(timeout);
          resolve(true);
        })
        .on("error", (err, stdout, stderr) => {
          clearTimeout(timeout);
          console.error("FFmpeg error:", err.message);
          console.error("FFmpeg stderr:", stderr);
          reject(new Error(`FFmpeg failed: ${err.message}\n${stderr}`));
        })
        .run();
    });

    // Read output file
    const outputBuffer = await fs.readFile(outputPath);
    const outputBase64 = outputBuffer.toString("base64");

    // Generate video metadata
    const outputName = `story-video-${uuidv4()}.mp4`;
    const videoUrl = `data:video/mp4;base64,${outputBase64}`;
    const timestamp = new Date().toISOString();

    // Save to user's database
    await UserModel.findByIdAndUpdate(
      session.user.id,
      {
        $push: {
          videos: {
            videoUrl: videoUrl,
            name: outputName,
            createdAt: timestamp,
            scenes: videoPaths.map((_, i) => ({
              sceneNumber: i,
              duration: videoDurations[i],
            })),
          },
        },
      },
      { new: true }
    );

    // Clean up
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Failed to clean up temp directory:", cleanupError);
    }

    // Return base64-encoded video
    return NextResponse.json({
      video: {
        url: `data:video/mp4;base64,${outputBase64}`,
        name: outputName,
      },
    });
  } catch (error: any) {
    console.error("Error merging story video:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to merge story video",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}