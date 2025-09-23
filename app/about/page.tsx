
"use client"
import React, { useEffect, useState } from "react";
import { Navbar } from '@/components/navbar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Footer } from '@/components/footer'; // Import Footer

const AboutPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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
    <div className="bg-white text-black dark:bg-black dark:text-white min-h-screen transition-colors duration-300">
      {/* Top Navigation */}
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Page Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          About Pixie Talk
        </h1>

        {/* Enhanced Introduction Section */}
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto mb-12 leading-relaxed">
          Pixie Talk is an innovative AI-powered platform designed to bring your imagination to life. 
          Whether you're transforming text into captivating images, converting speech into expressive visuals, 
          or generating full animation videos from stories—Pixie Talk makes it all possible. 
          Our platform supports seamless text-to-speech and speech-to-text interactions, generates lifelike voiceovers, 
          and combines all creative elements into one powerful final video. Plus, creators can save, manage, and share their projects with ease—making Pixie Talk the complete creative suite powered by artificial intelligence.
        </p>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Mission</h2>
            <p className="text-gray-400 dark:text-gray-200">
              Our mission is to bridge creativity and technology, enabling users to express their
              ideas seamlessly using AI tools.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Vision</h2>
            <p className="text-gray-400 dark:text-gray-200">
              To be the go-to platform for content creators, providing intuitive tools to bring
              ideas to life with ease.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Values</h2>
            <p className="text-gray-400 dark:text-gray-200">
              Creativity, simplicity, and innovation are at the core of everything we do at
              Pixie Talk.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
