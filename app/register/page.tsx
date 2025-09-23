
//signup

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

// Example image list (replace with actual images or use a pattern)
const bgImages = [
  "/images/bg1.png", "/images/bg2.png", "/images/bg3.png", "/images/bg4.png",
  "/images/bg5.png", "/images/bg6.png", "/images/bg17.png", "/images/bg8.png",
  "/images/bg9.png", "/images/bg10.png", "/images/bg11.png", "/images/bg12.png",
];

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = formData.username.trim();

    if (!trimmedUsername) {
      setError("Username cannot be empty or just spaces");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // toast.success(data.message);
      // router.push("/");
      toast.success("Registration successful! You're now logged in.")
      window.location.href = "/";

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Register Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 bg-black/40">
{/* <div className="relative z-10 flex items-center justify-center min-h-screen px-4 bg-black/20 backdrop-blur-sm">
 */}
        <Card className="w-full max-w-md backdrop-blur-md bg-white/90 shadow-2xl rounded-2xl border-none">
          <CardHeader className="text-center space-y-1">
           
            <CardTitle className="text-2xl font-bold text-purple-700">Create an account</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-purple-700">Username</Label>
                <Input name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password" className="text-purple-700">Password</Label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-purple-700">Confirm Password</Label>
                <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Register"}
              </Button>

              {/* Optional Google Auth Button
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Image src="/google.svg" width={20} height={20} alt="Google" />
                Continue with Google
              </Button> */}
            </form>
          </CardContent>

          <CardFooter className="text-sm text-center flex justify-center">
            <p  className="text-black">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:underline ml-1">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
