"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";

interface ImageData {
  src: string;
  width: number;
  height: number;
}

export default function GalleryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const excludedVideos = ["video1.mp4", "video2.mp4", "video3.mp4", "video4.mp4"];
  const excludedImages = ["transcript.png", "microphone.png", "soundwave.png", "tts1.png","tts2.png","tts3.png","tts4.png","tts-side1.png","11.png","12.png"];

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [imgRes, vidRes] = await Promise.all([
          fetch("/api/images"),
          fetch("/api/videos"),
        ]);
        const imgData = await imgRes.json();
        const vidData = await vidRes.json();

        const filteredVideos = vidData.filter((video: string) =>
          excludedVideos.every((excluded) => !video.includes(excluded))
        );
        const filteredImages = imgData.filter((image: ImageData) =>
          excludedImages.every((excluded) => !image.src.includes(excluded))
        );

        setImages(filteredImages);
        setVideos(filteredVideos);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  //Don't return before all hooks are defined
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      <motion.h1
        className="text-4xl font-extrabold text-center mb-12 text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Pixie Talk AI Gallery
      </motion.h1>

      {/* Image Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative group overflow-hidden rounded-xl shadow-lg bg-white hover:shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedImage(image.src)}
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt=""
              loading="lazy"
              className="w-full h-auto object-cover max-h-[300px] rounded-xl"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="mt-16">
          <motion.h2
            className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Generated Videos
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {videos.map((videoSrc, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden shadow-lg bg-black hover:shadow-2xl transform transition-transform hover:scale-105"
              >
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full rounded-xl"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <motion.div
              className="max-w-4xl max-h-[90vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={selectedImage}
                width={1200}
                height={900}
                className="w-full h-full object-contain rounded-lg"
                alt=""
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
