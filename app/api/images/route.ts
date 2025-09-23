// import { promises as fs } from 'fs';
// import path from 'path';
// import { NextResponse } from 'next/server';
// import sharp from 'sharp';

// export interface ImageData {
//   src: string;
//   width: number;
//   height: number;
//   blurDataURL?: string;
// }

// export async function GET() {
//   try {
//     const imagesDir = path.join(process.cwd(), 'public', 'images');
//     const files = await fs.readdir(imagesDir);

//     // Only allow supported image formats
//     const supportedExtensions = /\.(jpe?g|png|webp|avif|gif)$/i;
//     const imageFiles = files.filter(file => supportedExtensions.test(file));

//     const images: ImageData[] = await Promise.all(
//       imageFiles.map(async (file) => {
//         const filePath = path.join(imagesDir, file);
        
//         const { width, height } = await sharp(filePath).metadata();

//         let base64 = '';
//         try {
//           const resizedBuffer = await sharp(filePath)
//             .resize(20)
//             .toFormat('webp')
//             .toBuffer();
          
//           base64 = resizedBuffer.toString('base64');
//         } catch (e) {
//           console.warn(`Could not generate blur for ${file}`, e);
//         }

//         return {
//           src: `/images/${file}`,
//           width: width || 600,
//           height: height || 800,
//           blurDataURL: base64 ? `data:image/webp;base64,${base64}` : undefined,
//         };
//       })
//     );

//     const validImages = images.filter(img => img.width && img.height);
//     return NextResponse.json(validImages);
    
//   } catch (error) {
//     console.error('Error processing images:', error);
//     return NextResponse.json(
//       { error: 'Failed to load gallery images' },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("resource_type:image AND folder:gallery") // all images in my "gallery" folder
      .sort_by("created_at", "desc")
      .max_results(100) // fetch up to 100 images
      .execute();

    const images = result.resources.map((file: any) => ({
      src: file.secure_url,
      width: file.width,
      height: file.height,
      blurDataURL: cloudinary.url(file.public_id, {
        transformation: [{ width: 20, quality: "auto", fetch_format: "auto" }],
        resource_type: "image",
      }),
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}