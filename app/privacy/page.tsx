"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { DashboardHeader } from '@/components/dashboard/header';
import {Navbar} from "@/components/navbar";
import {Footer} from "@/components/footer";
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"



type Section = {
  title: string;
  content: string[] | ReactNode;
};

export default function PrivacyPolicyPage() {

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize as false
    const [authChecked, setAuthChecked] = useState(false); // Track if auth check completed
     const router = useRouter()


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
  
    if (!authChecked) return null

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">

      {isLoggedIn ? (
              <div className="sticky top-0 z-50 w-full">
                <DashboardHeader />
              </div>
            ) : (
              <Navbar />
            )}

      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 "
        >
          Privacy Policy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-3xl shadow-lg border-none backdrop-blur-md bg-white dark:bg-white/5">

            <CardContent className="space-y-8 p-10 text-gray-800 dark:text-gray-200 text-[1.05rem] leading-relaxed tracking-wide">
              {sections.map((section, idx) => (
                <section key={idx}>
                  <h2 className="text-2xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    {section.title}
                  </h2>
                  <div>
                    {Array.isArray(section.content) ? (
                      <ul className="list-disc list-inside pl-4 space-y-1">
                        {section.content.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{section.content}</p>
                    )}
                  </div>
                </section>
              ))}
              <div className="text-sm text-right text-gray-500 dark:text-gray-400 pt-6">
                Last Updated: April 21, 2025
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

const sections: Section[] = [
  {
    title: "1. Introduction",
    content:
      "Welcome to Pixie Talk. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.",
  },
  {
    title: "2. Information We Collect",
    content: [
      "Personal Information (e.g., username, profile data)",
      "Generated Content (stories, images, videos, etc.)",
      "Usage Data (how you interact with our platform)",
      "Technical Data (IP address, browser type, device type)",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: [
      "Deliver personalized AI content experiences",
      "Improve our platform and develop new features",
      "Communicate important updates or changes",
      "Ensure security and prevent abuse",
    ],
  },
  {
    title: "4. Data Storage & Security",
    content:
      "All user-generated content is stored securely in our database (MongoDB Atlas). We take industry-standard measures to protect your data from unauthorized access.",
  },
  {
    title: "5. Third-Party Services",
    content:
      "Pixie Talk integrates with third-party APIs such as Gemini, Monster, Minimax, and Eleven Labs. These services may collect limited data based on their own privacy policies.",
  },
  {
    title: "6. Your Rights",
    content: [
      "Access and download your data",
      "Request deletion of your account and content",
      "Withdraw consent for data processing",
    ],
  },
  {
    title: "7. Children’s Privacy",
    content:
      "Pixie Talk is designed for a general audience. We do not knowingly collect personal data from children under the age of 13 without parental consent.",
  },
  {
    title: "8. Updates to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be posted here with a revised 'Last Updated' date.",
  },
  {
    title: "9. Contact Us",
    content: (
      <>
        For any questions or concerns about this policy, you can reach us at:{" "}
        <a
          href="mailto:pixieTalkAnimation@gmail.com"
          className="text-purple-400 underline"
        >
          pixieTalkAnimation@gmail.com
        </a>
      </>
    ),
  },
];
