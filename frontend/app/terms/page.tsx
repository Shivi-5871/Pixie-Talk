"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {Navbar} from "@/components/navbar";
import {Footer} from "@/components/footer";
import { useState, useEffect } from "react"

import { ReactNode } from "react";
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header";


type Section = {
  title: string;
  content: string[] | ReactNode;
};

export default function TermsOfServicePage() {
   const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize as false
    const [authChecked, setAuthChecked] = useState(false); // 

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
     

      <main className="flex-grow max-w-4xl mx-auto px-4 py-20">
        {/* Page Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 "
        >
          Terms of Service
        </motion.h1>

        {/* Card Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-3xl shadow-lg border-none backdrop-blur-md bg-white dark:bg-white/5">

            <CardContent className="p-10 space-y-10 text-gray-800 dark:text-gray-200 text-[1.05rem] leading-relaxed tracking-wide">
              {sections.map((section, index) => (
                <section key={index}>
                  <h2 className="text-2xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">
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
      </main>

      <Footer />
    </div>
  );
}

const sections: Section[] = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using Pixie Talk, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
  },
  {
    title: "2. User Responsibilities",
    content: [
      "Provide accurate information during registration.",
      "Keep your login credentials secure.",
      "Do not misuse the platform for illegal or harmful purposes.",
    ],
  },
  {
    title: "3. Content Ownership",
    content:
      "You retain rights to the content generated using Pixie Talk, but we reserve the right to use anonymized data to improve our services.",
  },
  {
    title: "4. Prohibited Activities",
    content: [
      "Reverse-engineering or tampering with Pixie Talk services.",
      "Uploading malicious or harmful content.",
      "Violating intellectual property rights or any laws.",
    ],
  },
  {
    title: "5. Termination",
    content:
      "We may suspend or terminate accounts that violate these terms or show suspicious activity. You may delete your account at any time.",
  },
  {
    title: "6. Third-Party Integrations",
    content:
      "Pixie Talk uses external APIs (Gemini, Monster, Minimax, Eleven Labs). Usage of these services is subject to their respective terms.",
  },
  {
    title: "7. Disclaimers",
    content: [
      "Pixie Talk is provided on an 'as-is' basis.",
      "No warranties for uninterrupted or error-free service.",
      "We are not liable for any user-generated content.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    content:
      "Pixie Talk is not responsible for indirect or consequential damages from the use of our services.",
  },
  {
    title: "9. Governing Law",
    content:
      "These terms are governed by Indian law. Disputes shall be resolved under the jurisdiction of Indian courts.",
  },
  {
    title: "10. Contact Us",
    content: (
      <>
        Questions? Email us at{" "}
        <a
          href="mailto:pixieTalkAnimation@gmail.com"
          className="text-purple-400 underline"
        >
          pixieTalkAnimation@gmail.com
        </a>
        .
      </>
    ),
  },
];
