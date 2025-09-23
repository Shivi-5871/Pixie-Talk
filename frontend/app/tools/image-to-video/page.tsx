"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Video, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";

// const sampleVideos = [
//   "/videos/clip1.mp4",
//   "/videos/clip2.mp4",
//   "/videos/clip3.mp4",
//   "/videos/clip4.mp4",
// ];

const ImageToVideo: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uuid, setUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sampleVideos, setSampleVideos] = useState<string[]>([]);

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
    return () => {
      if (uuid) {
        setUuid(null);
      }
    };
  }, [uuid]);

   useEffect(() => {
    async function fetchSampleVideos() {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        setSampleVideos(data);
      } catch (error) {
        console.error("Error fetching sample videos:", error);
      }
    }
    fetchSampleVideos();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {    
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
      setError(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!isLoggedIn) {
      router.push("/login"); 
      return;
    }

    if (!image || !textPrompt) {
      setError("Please select an image and enter a text prompt.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setLoading(true);
        setError(null);

        const base64Image = reader.result?.toString().split(",")[1];

        if (!base64Image) {
          throw new Error("Failed to convert image to Base64.");
        }

        const { data } = await axios.post<{ uuid: string }>("/api/image-to-video", {
          image: base64Image,
          textPrompt,
        });

        if (data.uuid) {
          setUuid(data.uuid);
          pollVideoStatus(data.uuid);
        } else {
          setError("Failed to generate video.");
          setLoading(false);
        }
      } catch (error) {
        console.error(" Error:", error);
        setError("An error occurred while generating the video.");
        setLoading(false);
      }
    };

    reader.readAsDataURL(image);
  };

  const pollVideoStatus = (uuid: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get<{ url?: string; status?: string }>(`/api/image-to-video?uuid=${uuid}`);

        if (response.data.url) {
          setVideoUrl(response.data.url);
          clearInterval(interval);
          setLoading(false);
        } else if (response.data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
          setError("Video generation failed.");
        }
      } catch (error) {
        console.error(" Polling error:", error);
        clearInterval(interval);
        setLoading(false);
        setError("Failed to retrieve video status.");
      }
    }, 5000);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      <main className="flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-3xl shadow-2xl rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-gray-800 dark:to-gray-700 text-white rounded-t-lg">
            <CardTitle className="text-4xl font-bold text-center p-4 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              <Video className="inline-block w-10 h-10 mr-2" />
              Image to Video Generator
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full">
                <label className="text-gray-700 dark:text-gray-300 font-semibold">Upload Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="p-3 border rounded-lg shadow-sm"
                />
              </div>

              <div className="w-full">
                <label className="text-gray-700 dark:text-gray-300 font-semibold">Text Prompt</label>
                <Input
                  type="text"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Enter scene description"
                  className="p-3 border rounded-lg shadow-sm"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateVideo}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition duration-300 shadow-md"
            >
              {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                  ) : isLoggedIn ? (
                    "Generate Video"
                  ) : (
                    "Sign In to Continue"
                  )}
            </Button>

            {error && (
              <div className="bg-red-100 text-red-600 p-4 rounded-lg flex items-center shadow-md">
                <AlertTriangle className="mr-2" />
                {error}
              </div>
            )}

            {videoUrl && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Generated Video:
                </h2>
                <video
                  controls
                  src={videoUrl}
                  className="w-full mt-4 rounded-lg shadow-md"
                />
                <a
                  href={videoUrl}
                  download
                  className="block text-center mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300"
                >
                  Download Video
                </a>
              </div>
            )}
          </CardContent>
        </Card>

    
        <section className="mt-12 w-full max-w-6xl">
          <h3 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Sample Generated Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
            {sampleVideos.slice(0, 4).map((url, index) => (
              <Card key={index} className="overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ImageToVideo;
