

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardHeader } from "@/components/dashboard/header";


// Sample images for the boxes
const exampleImages = [
  {
    id: 1,
    title: "Anime Art",
    description: "Create stunning anime-style characters and scenes",
    imageUrl: "/images/anime-example.png",
    style: "Anime"
  },
  {
    id: 2,
    title: "Cyberpunk Worlds",
    description: "Generate futuristic cyberpunk cityscapes",
    imageUrl: "/images/cyberpunk-example.png",
    style: "Cyberpunk"
  },
  {
    id: 3,
    title: "Fantasy Landscapes",
    description: "Bring your fantasy worlds to life",
    imageUrl: "/images/fantasyart-example.png",
    style: "Fantasy-Art"
  },
  {
    id: 4,
    title: "Comic Book Style",
    description: "Create images with bold comic book aesthetics",
    imageUrl: "/images/comic-example.png",
    style: "Comic-Book"
  }
];

export default function ImageGenerator() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("Anime");
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth status on component mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        setUserId(data.user?.id || null);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);
  if (!authChecked) return null

  const generateImage = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      setPrompt("");

      await fetch("/api/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.imageUrl, prompt, style }),
      })
        .then((res) => res.json())
        .then((savedData) => console.log("Saved Image in DB:", savedData));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExampleClick = (examplePrompt: string, exampleStyle: string) => {
    setPrompt(examplePrompt);
    setStyle(exampleStyle);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col transition-colors duration-300">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4  text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">AI Image Generator</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with our powerful AI image generation
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Generation Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold">Describe your image</h2>
                <textarea
  placeholder="A futuristic city at night..."
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 text-black dark:text-white border border-gray-700 w-full h-32 resize-none"
/>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Style:</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Anime", "Comic-Book", "Fantasy-Art", "Cyberpunk", "Retro", "Futuristic", "Minimalist"].map((styleOption) => (
                      <Button
                        key={styleOption}
                        onClick={() => setStyle(styleOption)}
                        variant={style === styleOption ? "default" : "outline"}
                        className={`rounded-lg ${style === styleOption ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                      >
                        {styleOption}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateImage}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                  ) : isLoggedIn ? (
                    "Generate Image"
                  ) : (
                    "Sign In to Continue"
                  )}
                </Button>
                {error && <p className="text-red-500 text-center">{error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Generated Image */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              {imageUrl ? (
                <>
                  <div className="relative w-full h-full min-h-[400px] mb-4">
                    <Image 
                      src={imageUrl} 
                      alt="Generated Image" 
                      fill
                      className="rounded-lg shadow-lg object-contain"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Image
                  </Button>
                </>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  <p className="text-lg">Your generated image will appear here</p>
                  <p className="text-sm mt-2">Enter a detailed description and click Generate to create AI-powered images.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Example Prompts */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Inspiration Gallery</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                "A cyberpunk city with neon lights and flying cars",
                "A majestic dragon soaring over a medieval castle",
                "A futuristic robot in a minimalist white room",
                "An anime-style warrior with glowing sword"
              ].map((example, index) => (
                <Card 
                  key={index} 
                  className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => setPrompt(example)}
                >
                  <CardContent className="p-4">
                    <p className="text-sm">"{example}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Image Examples Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">Example Creations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleImages.map((example) => (
              <div 
                key={example.id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-64 cursor-pointer"
                onClick={() => handleExampleClick(example.title, example.style)}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${example.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">{example.title}</h3>
                  <p className="text-gray-200 mt-1">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

