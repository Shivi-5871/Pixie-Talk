"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

// Example image list
const bgImages = [
  "/images/bg1.png", "/images/bg2.png", "/images/bg3.png", "/images/bg4.png",
  "/images/bg5.png", "/images/bg6.png", "/images/bg17.png", "/images/bg8.png",
  "/images/bg9.png", "/images/bg10.png", "/images/bg11.png", "/images/bg12.png",
]

export default function ContactUs() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false) // New state for success message
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false) // Reset success state on new submission

    try {
      setIsLoading(true)

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          name: formData.name,
          email: formData.email,
          reason: formData.reason,
          message: formData.message,
        }),
      })

      // Debug: Log the status first
      console.log("Response status:", response.status)

      // Try to parse as JSON, fallback to text if it fails
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.log("Raw response text (non-JSON):", text);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Message failed to send")
      }

      setSuccess(true) // Set success state on successful submission
      // Clear form data after success
      setFormData({ name: "", email: "", reason: "", message: "" })
      // Uncomment the next line if you want to redirect after success
      // router.push("/")

    } catch (err: any) {
      // Handle non-JSON response (e.g., 404 HTML page)
      if (err.message.includes("Invalid response format")) {
        setError("Server error: The response was not in the expected format. Please try again later or contact support.")
      } else {
        setError(err.message)
      }
      console.error("Submission error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Grid of Images */}
      <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-80 z-0">
        {bgImages.map((src, idx) => (
          <Image
            key={idx}
            src={src}
            alt={`bg-${idx}`}
            width={300}
            height={300}
            className="object-cover w-full h-full rounded-md"
          />
        ))}
      </div>

      {/* Contact Form */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 bg-black/40">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center flex-1 py-12">
          <Card className="w-full max-w-md backdrop-blur-md bg-white/90 shadow-2xl rounded-2xl border-none">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-purple-700">Contact Us</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get in touch with us for support or inquiries
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-purple-700">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-purple-700">Reason</Label>
                  <select
                    id="reason"
                    name="reason"
                    required
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full p-2 bg-purple border border-gray-300 rounded-md"
                  >
                    <option value="">Select a reason</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-purple-700">Message</Label>
                  <Input
                    id="message"
                    name="message"
                    placeholder="Enter your message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                {error && <div className="text-sm font-medium text-destructive">{error}</div>}
                {success && <div className="text-sm font-medium text-green-500">Message submitted successfully!</div>}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  Need more info?{" "}
                  <Link href="/about" className="text-purple-600 hover:underline">
                    Visit our About page
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  )
}