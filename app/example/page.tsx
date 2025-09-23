'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Mic, Image as ImageIcon, Video, AudioLines } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import Image from "next/image";

export default function ExamplesPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const features = [
    {
      title: "Text to Speech",
      icon: <AudioLines className="h-8 w-8 text-blue-500" />,
      description: "Convert any text into natural human-like voice using Eleven Labs API.",
      href: "/tools/text-to-speech",
      image: "/images/examples/2.png"
    },
    {
      title: "Speech to Text",
      icon: <Mic className="h-8 w-8 text-green-500" />,
      description: "Speak and get the exact text transcription using powerful AI recognition.",
      href: "/tools/speech-to-text",
      image: "/images/examples/1.png"
    },
    {
      title: "Text to Image",
      icon: <ImageIcon className="h-8 w-8 text-pink-500" />,
      description: "Turn your imagination into vivid images using Monster API.",
      href: "/tools/text-to-image",
      image: "/images/examples/3.png"
    },
    {
      title: "Voice to Image",
      icon: <Mic className="h-8 w-8 text-yellow-500" />,
      description: "Describe scenes with your voice and generate matching visuals.",
      href: "/tools/voice-to-image",
      image: "/images/examples/4.png"
    },
    {
      title: "Image to Video",
      icon: <Video className="h-8 w-8 text-purple-500" />,
      description: "Bring your static images to life with smooth animations and transitions..",
      href: "/tools/image-to-video",
      image: "/images/examples/5.png"
    },
    {
      title: "Animated Story Video",
      icon: <Sparkles className="h-8 w-8 text-red-500" />,
      description: "Generate scene-based stories with voiceovers and compile into full videos.",
      href: "/tools/story",
      image: "/images/examples/6.png"
    },
  ];

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

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
        🎨 Explore Pixie Talk's Features
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="transition hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-purple-400"
          >
            <CardContent className="p-6 space-y-4 flex flex-col items-start">
              <div>{feature.icon}</div>
              <h2 className="text-xl font-semibold">{feature.title}</h2>
              <p className="text-muted-foreground">{feature.description}</p>

              <div className="w-full h-40 relative rounded-lg overflow-hidden border">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>

              <Link href={feature.href}>
                <Button variant="default" className="mt-2">
                  Try Now →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Footer />
    </main>
  );
}
