// // app/api/videos/route.ts
// import { promises as fs } from 'fs';
// import path from 'path';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     const videosDir = path.join(process.cwd(), 'public', 'videos');
//     const files = await fs.readdir(videosDir);

//     const videoUrls = files
//       .filter(file => file.endsWith('.mp4'))
//       .map(file => `/videos/${file}`);

//     return NextResponse.json(videoUrls);
//   } catch (error) {
//     console.error('Error fetching videos:', error);
//     return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 });
//   }
// }




// app/api/videos/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Get all videos from Cloudinary "gallery" folder
    const result = await cloudinary.search
      .expression("resource_type:video AND folder:gallery") // 👈 folder in Cloudinary
      .sort_by("created_at", "desc") // newest first
      .max_results(30) // limit results
      .execute();

    // Extract the secure Cloudinary URLs
    const videos = result.resources.map((file: any) =>
      cloudinary.url(file.public_id, {
        resource_type: "video",
        quality: "auto",
        fetch_format: "auto", // optimizes (mp4/webm etc)
      })
    );

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching Cloudinary videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}