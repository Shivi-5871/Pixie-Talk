//frontend/app/tools/speech-to-text/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DashboardHeader } from "@/components/dashboard/header";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SpeechToText = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize as false
  const [authChecked, setAuthChecked] = useState(false); // Track if auth check completed
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

  // Image grid data - one image per category but in grid layout
  const imageGrid = [
    {
      id: 1,
      src: '/images/microphone.png',
      category: 'Recording',
      prompt: 'Professional microphone setup'
    },
    {
      id: 2,
      src: '/images/soundwave.png',
      category: 'Visualization',
      prompt: 'Audio waveform visualization'
    },
    {
      id: 3,
      src: '/images/transcript.png',
      category: 'Results',
      prompt: 'Text transcription output'
    },
  ];

  const startRecording = async () => {

    if (!isLoggedIn) {
      router.push('/login'); // Redirect to login page
      return;
    }

    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio.');
          }

          const result = await response.json();
          setTranscription(result.text || 'No transcription available.');
        } catch (err) {
          console.error(err);
          setError('An error occurred while transcribing.');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}

      <main className="flex flex-col items-center justify-center flex-grow p-4">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 ">Speech to Text</h1>

        <div className="mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded ${
              isRecording ? 'bg-red-600 text-white' : 'bg-purple-600 text-white'
            } hover:opacity-80 transition`}
          >
            {/* {isRecording ? 'Stop Recording' : 'Start Recording'} */}
            {isRecording 
              ? 'Stop Recording' 
              : isLoggedIn 
                ? 'Convert to Speech' 
                : 'Sign in to Continue'}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="w-full max-w-2xl p-4 border rounded bg-gray-100 dark:bg-gray-800 mb-8">
          <p className="text-center">{transcription || 'Your transcription will appear here.'}</p>
        </div>

        {/* Image Grid Section - similar to text-to-image component */}
        <div className="w-full max-w-6xl">
          {/* <h2 className="text-2xl font-semibold mb-6 text-center">Related Examples</h2> */}
          
          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl max-h-full">
                <img 
                  src={selectedImage} 
                  alt="Enlarged preview" 
                  className="max-w-full max-h-screen"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {imageGrid.map((item) => (
              <div 
                key={item.id} 
                className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedImage(item.src)}
              >
                <img
                  src={item.src}
                  alt={item.prompt}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm opacity-90">{item.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpeechToText;