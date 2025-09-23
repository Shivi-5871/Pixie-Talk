
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, Image, Video, Layers, ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage for instant UI
        const cachedAuth = localStorage.getItem("isLoggedIn");
        if (cachedAuth) {
          setAuthState('authenticated');
        }

        // Then verify with server
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Auth check failed');
        
        const data = await response.json();
        if (data.isAuthenticated) {
          localStorage.setItem("isLoggedIn", "true");
          setAuthState('authenticated');
        } else {
          localStorage.removeItem("isLoggedIn");
          setAuthState('unauthenticated');
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        localStorage.removeItem("isLoggedIn");
        setAuthState('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setAuthState('unauthenticated');
  };

  const tools = [
    {
      title: "Text to Speech",
      description: "Convert your text into natural-sounding speech with customizable voices and styles.",
      icon: <MessageSquare className="h-12 w-12 text-purple-500" />,
      href: "/tools/text-to-speech",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-purple-500/10 hover:to-purple-500/5",
      bgImage: "/images/11.png"
    },
    {
      title: "Speech to Text",
      description: "Transcribe audio recordings and voice inputs into accurate text transcripts.",
      icon: <Mic className="h-12 w-12 text-blue-500" />,
      href: "/tools/speech-to-text",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-blue-500/10 hover:to-purple-500/5",
      bgImage: "/images/12.png"
    },
    {
      title: "Text to Image",
      description: "Generate stunning images from text descriptions using advanced AI models.",
      icon: <Image className="h-12 w-12 text-pink-500" />,
      href: "/tools/text-to-image",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-pink-500/10 hover:to-purple-500/5",
      bgImage: "/images/13.png"
    },
    {
      title: "Image to Video",
      description: "Transform static images into dynamic videos with smooth animations.",
      icon: <Video className="h-12 w-12 text-amber-500" />,
      href: "/tools/image-to-video",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-amber-500/10 hover:to-purple-500/5",
      bgImage: "/images/14.png"
    },
    {
      title: "Animation Story Video",
      description: "Create complete animated videos with story generation, voiceovers, and scene compilation.",
      icon: <Layers className="h-12 w-12 text-emerald-500" />,
      href: "/tools/story",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-emerald-500/10 hover:to-purple-500/5",
      bgImage: "/images/15.png"
    },
    {
      title: "Voice To Image",
      description: "Create complete animated videos with story generation, voiceovers, and scene compilation.",
      icon: <Layers className="h-12 w-12 text-emerald-500" />,
      href: "/tools/voice-to-image",
      borderColor: "hover:border-purple-500",
      gradient: "hover:from-emerald-500/10 hover:to-purple-500/5",
      bgImage: "/images/15.png"
    },
  ];

  if (authState === 'loading') {
    return (
      <>
        <div className="sticky top-0 z-50 w-full">
          <Skeleton className="h-16 w-full" />
        </div>
        <main className="container py-12 md:py-20">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-32 mx-auto mb-6" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div key={authState}>
        {authState === 'authenticated' ? (
          <div className="sticky top-0 z-50 w-full">
            <DashboardHeader setIsLoggedIn={handleLogout} />
          </div>
        ) : (
          <Navbar />
        )}
      </div>
      
      <main className="container py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Tools</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Powerful AI Tools for Content Creation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our suite of AI-powered tools to transform your ideas into stunning content
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <Card
              key={index}
              className={`
                group relative overflow-hidden 
                border border-border/50 
                transition-all duration-300 
                hover:shadow-lg hover:-translate-y-1 
                ${tool.borderColor} ${tool.gradient}
              `}
              style={{
                backgroundImage: `url(${tool.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300 z-0"></div>

              <CardHeader className="pb-2 relative z-10">
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                  {tool.icon}
                </div>
                <CardTitle className="text-xl text-white">{tool.title}</CardTitle>
                <CardDescription className="text-base text-white/80">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button
                  onClick={() => router.push(tool.href)}
                  className="w-full gap-2 bg-white text-black hover:bg-purple-500 hover:text-white transition-colors"
                >
                  {authState === 'authenticated' ? "Open" : "Try Now"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}