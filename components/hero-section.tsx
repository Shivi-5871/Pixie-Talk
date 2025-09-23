
// ****************************************************video***************************************
"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2 } from "lucide-react"

export function HeroSection() {
  const [currentText, setCurrentText] = useState(0)
  const textOptions = ["Text to Speech", "Speech to Text", "Text to Image", "Image to Video", "Complete Animations"]

  const videoSources = [
  "https://res.cloudinary.com/ddxwgqd7m/video/upload/v1758633487/video4_fuuatz.mp4",
  "https://res.cloudinary.com/ddxwgqd7m/video/upload/v1758633334/video3_oss3zh.mp4",
  "https://res.cloudinary.com/ddxwgqd7m/video/upload/v1758633285/video2_lp6ssq.mp4",
  "https://res.cloudinary.com/ddxwgqd7m/video/upload/v1758633253/video1_vlls6m.mp4"
]
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [nextVideoIndex, setNextVideoIndex] = useState(1)
  const [activeLayer, setActiveLayer] = useState<"video1" | "video2">("video1")
  const [isFading, setIsFading] = useState(false)

  const videoRef1 = useRef<HTMLVideoElement>(null)
  const videoRef2 = useRef<HTMLVideoElement>(null)

  // Rotate texts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % textOptions.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-start video1 after load
  useEffect(() => {
    const vid = videoRef1.current
    if (!vid) return

    vid.src = videoSources[0]
    vid.load()
    vid.oncanplay = () => {
      vid.play().catch((e) => console.warn("Autoplay error", e))
    }
  }, [])

  // Handle smooth switching every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentRef = activeLayer === "video1" ? videoRef1 : videoRef2
      const nextRef = activeLayer === "video1" ? videoRef2 : videoRef1
      const nextIndex = (currentVideoIndex + 1) % videoSources.length

      if (!nextRef?.current || !currentRef?.current) return

      nextRef.current.src = videoSources[nextIndex]
      nextRef.current.load()

      nextRef.current.oncanplay = () => {
        setIsFading(true)

        setTimeout(() => {
          nextRef.current?.play().catch((e) => console.warn("Play error", e))
          currentRef.current?.pause()

          setCurrentVideoIndex(nextIndex)
          setActiveLayer(activeLayer === "video1" ? "video2" : "video1")
          setIsFading(false)
        }, 1000) // match fade duration
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [activeLayer, currentVideoIndex])

  return (
    <section className="relative py-20 md:py-32 container min-h-screen overflow-hidden">

      {/* Video 1 */}
      <video
        ref={videoRef1}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 
        ${activeLayer === "video1" && !isFading ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        muted
        playsInline
        autoPlay={false}
      />

      {/* Video 2 */}
      <video
        ref={videoRef2}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 
        ${activeLayer === "video2" && !isFading ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        muted
        playsInline
        autoPlay={false}
      />

      {/* Overlay Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI-Powered Content Creation</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Transform Your Ideas Into{" "}
          <span className="relative">
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 blur-xl opacity-30"></span>
            <span className="relative bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {textOptions[currentText]}
            </span>
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          Pixie Talk combines cutting-edge AI technologies to help you create stunning content, from simple text
          conversions to complete animated videos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <Link href="/register">
            <Button size="lg" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Get Started
            </Button>
          </Link> */}
          <Link href="/tools">
            <Button size="lg" variant="outline">
              Explore Tools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
