"use client";

import { useState, useEffect } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";


const imageBoxes = [
  {
    id: 1,
    title: "Multilingual Support",
    description: "Convert text across multiple languages",
    imageUrl: "/images/tts1.png",
  },
  {
    id: 2,
    title: "Natural Voices",
    description: "High-quality, lifelike speech generation",
    imageUrl: "/images/tts2.png",
  },
  {
    id: 3,
    title: "Easy Integration",
    description: "Simple API for developers",
    imageUrl: "/images/tts3.png",
  },
  {
    id: 4,
    title: "Creative Possibilities",
    description: "Unlock new ways to communicate",
    imageUrl: "/images/tts4.png",
  },
];

const TextToSpeechPage = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [text, setText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = useState<string>("en-US");
  const [loading, setLoading] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

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

  if (!authChecked) return null;

  const handleConvert = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (!text) return;

    setLoading(true);

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        body: JSON.stringify({
          text,
          src_lang: sourceLanguage,
          dest_lang: targetLanguage,
        }),
        headers: { "Content-Type": "application/json" },
      });

      // if (!response.ok) throw new Error("Failed to generate speech");
      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          router.push("/login");
          return;
        }
        throw new Error("Failed to generate speech");
      }
      
      const data = await response.json();
      if (data.audioUrl) {
        setAudioSrc(data.audioUrl);
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-50 dark:bg-black-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Text-to-Speech Section First */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
    >Text-to-Speech</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Convert text from one language to another and generate lifelike speech.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Image Box */}
          <div className="hidden lg:block relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-110"
              style={{ backgroundImage: "url('/images/tts-side1.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold">Bring your ideas to life</h3>
              <p className="text-gray-200 mt-1">Give platform, private possibilities</p>
            </div>
          </div>

          {/* Main TTS Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:col-span-2">
            <label className="block font-medium text-lg">Enter Text:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
              rows={5}
              className="mt-2 w-full dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Source Language Selection */}
              <div>
                <label className="block font-medium">Source Language:</label>
                <Select onValueChange={setSourceLanguage} defaultValue={sourceLanguage}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white mt-2">
                    <SelectValue placeholder="Select Source Language" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg">
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Language Selection */}
              <div>
                <label className="block font-medium">Target Language:</label>
                <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-white mt-2">
                    <SelectValue placeholder="Select Target Language" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg">
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="mt-8">
              <Button 
                onClick={handleConvert} 
                disabled={loading} 
                className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : isLoggedIn ? (
                  "Convert to Speech"
                ) : (
                  "Sign In to Continue"
                )}
              </Button>
            </div>
            {audioSrc && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Generated Speech:</h3>
                <audio controls src={audioSrc} className="w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Image Grid Section Below */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold  text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 "
        > Features</h2>
          <p className="text-lg mt-2 text-gray-600 dark:text-gray-300">
            Discover what else you can do with our AI tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {imageBoxes.map((box) => (
            <div 
              key={box.id}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-64"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${box.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-bold">{box.title}</h3>
                <p className="text-gray-200 mt-1">{box.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TextToSpeechPage;