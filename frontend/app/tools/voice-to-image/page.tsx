"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Mic, Square } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
const examplePrompts = [
  "A cyberpunk city with neon lights and flying cars",
  "A majestic dragon soaring over a medieval castle",
  "A futuristic robot in a minimalist white room",
  "An anime-style warrior with glowing sword",
];



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
export default function VoiceToImage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [style, setStyle] = useState("Anime");
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null); // Ref for webkitSpeechRecognition instance

    
    
    // Check auth status
    useEffect(() => {
      async function checkAuth() {
        try {
          const response = await fetch("/api/auth/check");
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
    // Clean up recorder and recognition

    useEffect(() => {
      return () => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }, []);
    const startRecording = async () => {

        if (!isLoggedIn) {
            router.push('/login'); // Redirect to login page
            return;
          }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        // Initialize webkitSpeechRecognition

        if (!('webkitSpeechRecognition' in window)) {
          throw new Error('Web Speech API not supported in this browser');
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en';
        recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;

          setPrompt(transcript); // Update prompt with transcribed text
        };
        recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

          setError(`Speech recognition error: ${event.error}`);
        };
        recognition.onend = () => {

          if (isRecording) {
            recognition.start(); // Restart if still recording
          }
        };
        // Start recognition
        recognition.start();

        mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);

        };
        mediaRecorder.onstop = async () => {
        recognitionRef.current.stop(); // Stop recognition when recording ends

          stream.getTracks().forEach((track) => track.stop());
          // No need to send audio blob for transcription; prompt is already set
          if (prompt.trim()) {
            await sendToServer();
          }
        };
        mediaRecorder.start();
        setIsRecording(true);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };
    const stopRecording = () => {

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };
    const sendToServer = async () => {
    setLoading(true);

      try {
        const response = await fetch("/api/generate-image/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, style }),
        });
        if (!response.ok) {
        throw new Error("Failed to generate image from voice");

        }
        const data = await response.json();
        setImageUrl(data.imageUrl);

        // Save to database

        await fetch("/api/save_voice_images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: data.imageUrl,
            prompt,
            style,
            source: "voice",
          }),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    const handleDownload = () => {
    if (!imageUrl) return;

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `voice-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleExampleClick = (examplePrompt: string, exampleStyle: string) => {
      setPrompt(examplePrompt);
      setStyle(exampleStyle);
    };
    const generateImage = async () => {

      if (!prompt.trim()) {
        setError("Please enter or record a prompt first");
        return;
      }
      setLoading(true);
      setError(null);

      setImageUrl(null);
      try {

        const response = await fetch("/api/generate-image/voice", {
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

        // Save to database

        await fetch("/api/save_voice_images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: data.imageUrl,
            prompt,
            style,
            source: "voice",
          }),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authChecked) {
        return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }

    return (

      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
              {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">Voice-to-Image Generator</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Describe your image with voice and watch AI bring it to life
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Controls */}

            <div className="lg:col-span-1">
              <Card className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold">Describe Your Image</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      className="gap-2"
                    >
                      {/* {isRecording ? (
                        <>
                          <Square className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Start Recording
                        </>
                      )} */}
                      {isRecording 
                        ? 'Stop Recording' 
                        : isLoggedIn 
                          ? 'Convert to Speech' 
                          : 'Sign in to Continue'}
                    </Button>
                    {isRecording && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm">Recording...</span>
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder="Or type your prompt here..."

                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-gray-200 dark:bg-gray-800"
                  />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Select Style:</h3>

                    <div className="flex flex-wrap gap-2">
                      {["Anime", "Realistic", "Fantasy", "Cyberpunk"].map((styleOption) => (
                        <Button
                          key={styleOption}
                          onClick={() => setStyle(styleOption)}
                          variant={style === styleOption ? "default" : "outline"}
                          size="sm"
                        >
                          {styleOption}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => prompt && generateImage()}

                    disabled={loading || !prompt}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Generate Image
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
                        alt="Generated from voice"
                        fill
                        className="rounded-lg object-contain"
                      />
                    </div>
                    <Button onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-gray-400 p-8">
                    <p className="text-lg">Your generated image will appear here</p>
                    <p className="text-sm mt-2">
                      {isRecording
                        ? "Speak now to describe your image..."
                        : "Record your voice or type a description"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column - Examples */}
            <div className="lg:col-span-1">

              <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">Example Prompts</h2>
              <div className="grid grid-cols-1 gap-4">
                {examplePrompts.map((example, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
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
  <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Example Creations</h2>
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
