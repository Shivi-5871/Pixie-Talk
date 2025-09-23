
import { Image as ImageIcon, Video, MessageSquare, Share2, Save, Layers, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function FeatureSection() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
      title: "Text to Speech",
      description: "Convert your text into natural-sounding speech with multiple voice options.",
      image: "/images/11.png",
      url: "/tools/text-to-speech"
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
      title: "Speech to Text",
      description: "Transcribe audio into text with high accuracy and multiple language support.",
      image: "/images/12.png",
      url: "/tools/speech-to-text"
    },
    {
      icon: <ImageIcon className="h-10 w-10 text-pink-500" />,
      title: "Text to Image",
      description: "Transform your descriptions into stunning visuals using advanced AI.",
      image: "/images/13.png",
      url: "/tools/text-to-image"
    },
    {
      icon: <Video className="h-10 w-10 text-amber-500" />,
      title: "Image to Video",
      description: "Bring your static images to life with smooth animations and transitions.",
      image: "/images/14.png",
      url: "/tools/image-to-video"
    },
    {
      icon: <Layers className="h-10 w-10 text-emerald-500" />,
      title: "Animated Story Video",
      description: "Generate scene-based stories with voiceovers and compile into full videos.",
      image: "/images/15.png",
      url: "/tools/story"
    },
    {
      icon: <ImageIcon className="h-10 w-10 text-indigo-500" />,
      title: "Voice to Image",
      description: "Create images directly from voice commands and descriptions.",
      image: "/images/16.png",
      url: "/tools/voice-to-image"
    },
  ]

  return (
    <section className="py-20 container">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Powerful AI Tools</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Everything You Need to Create Amazing Content
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Pixie Talk combines multiple AI technologies into one seamless platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <a 
            key={index} 
            href={feature.url}
            className="group relative overflow-hidden rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-purple-500/80 hover:shadow-lg hover:shadow-purple-500/10"
          >
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover opacity-90 group-hover:opacity-80 transition-opacity duration-300"
                priority={index < 3} // Prioritize loading first 3 images
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full bg-gradient-to-b from-black/10 via-black/20 to-black/30">
              <Card className="border-none bg-transparent h-full">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            
            {/* Border hover effect */}
            <div className="absolute inset-0 -z-10 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500" />
          </a>
        ))}
      </div>
    </section>
  )
}

// auth************************************************************************************8
// "use client"

// import { useEffect, useState } from "react"
// import { Image as ImageIcon, Video, MessageSquare, Share2, Save, Layers, Sparkles } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import Image from "next/image"
// import { useRouter } from "next/navigation"

// export function FeatureSection() {
//   const router = useRouter()
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   // Check if the user is logged in when the page loads
//   useEffect(() => {
//     const loginStatus = localStorage.getItem("isLoggedIn") // Check login status from localStorage
//     if (loginStatus !== "true") {
//       // Redirect to the login page if not logged in
//       router.push("/login")
//     } else {
//       setIsLoggedIn(true)
//     }
//   }, [router])

//   const features = [
//     {
//       icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
//       title: "Text to Speech",
//       description: "Convert your text into natural-sounding speech with multiple voice options.",
//       image: "/images/11.png",
//       url: "/tools/text-to-speech"
//     },
//     {
//       icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
//       title: "Speech to Text",
//       description: "Transcribe audio into text with high accuracy and multiple language support.",
//       image: "/images/12.png",
//       url: "/tools/speech-to-text"
//     },
//     {
//       icon: <ImageIcon className="h-10 w-10 text-pink-500" />,
//       title: "Text to Image",
//       description: "Transform your descriptions into stunning visuals using advanced AI.",
//       image: "/images/13.png",
//       url: "/tools/text-to-image"
//     },
//     {
//       icon: <Video className="h-10 w-10 text-amber-500" />,
//       title: "Image to Video",
//       description: "Bring your static images to life with smooth animations and transitions.",
//       image: "/images/14.png",
//       url: "/tools/image-to-video"
//     },
//     {
//       icon: <Layers className="h-10 w-10 text-emerald-500" />,
//       title: "Animated Story Video",
//       description: "Generate scene-based stories with voiceovers and compile into full videos.",
//       image: "/images/15.png",
//       url: "/tools/story"
//     },
//     {
//       icon: <ImageIcon className="h-10 w-10 text-indigo-500" />,
//       title: "Voice to Image",
//       description: "Create images directly from voice commands and descriptions.",
//       image: "/images/16.png",
//       url: "/tools/voice-to-image"
//     },
//   ]

//   if (!isLoggedIn) {
//     // Optionally, show a loading state while the login check is in progress
//     return <div>Loading...</div>
//   }

//   return (
//     <section className="py-20 container">
//       <div className="text-center mb-16">
//         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
//           <Sparkles className="h-4 w-4" />
//           <span className="text-sm font-medium">Powerful AI Tools</span>
//         </div>
//         <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
//           Everything You Need to Create Amazing Content
//         </h2>
//         <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//           Pixie-Talk combines multiple AI technologies into one seamless platform
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//         {features.map((feature, index) => (
//           <a 
//             key={index} 
//             href={feature.url}
//             className="group relative overflow-hidden rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-purple-500/80 hover:shadow-lg hover:shadow-purple-500/10"
//           >
//             {/* Background image */}
//             <div className="absolute inset-0 z-0">
//               <Image 
//                 src={feature.image}
//                 alt={feature.title}
//                 fill
//                 className="object-cover opacity-90 group-hover:opacity-80 transition-opacity duration-300"
//                 priority={index < 3} // Prioritize loading first 3 images
//               />
//             </div>
            
//             {/* Content */}
//             <div className="relative z-10 h-full bg-gradient-to-b from-black/10 via-black/20 to-black/30">
//               <Card className="border-none bg-transparent h-full">
//                 <CardHeader>
//                   <div className="mb-4">{feature.icon}</div>
//                   <CardTitle className="text-xl">{feature.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <CardDescription className="text-base text-muted-foreground">
//                     {feature.description}
//                   </CardDescription>
//                 </CardContent>
//               </Card>
//             </div>
            
//             {/* Border hover effect */}
//             <div className="absolute inset-0 -z-10 rounded-xl border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-500" />
//           </a>
//         ))}
//       </div>
//     </section>
//   )
// }
