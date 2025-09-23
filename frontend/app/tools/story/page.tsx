"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";


interface Scene {
  storyScene: string | null;
  imagePrompt: string | null;
  videoPrompt: string | null;
}

interface Voice {
  voice_id: string;
  name: string;
}

interface GeneratedImage {
  url: string;
  name: string;
  timestamp: string;
}

interface GeneratedVideo {
  url: string;
  name: string;
  timestamp: string;
}

interface FinalVideo {
  url: string;
  name: string;
}

export default function StoryGenerator() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>("");
  const [storyOutput, setStoryOutput] = useState<string>("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [storyText, setStoryText] = useState<string>("");
  const [voiceName, setVoiceName] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [audio, setAudio] = useState<string | undefined>(undefined); // Generated voiceover
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null); // Uploaded audio
  const [userId, setUserId] = useState<string | null>(null);
  const [style, setStyle] = useState<string>("anime");
  const [voiceChoice, setVoiceChoice] = useState<number>(1);
  const [images, setImages] = useState<Record<number, GeneratedImage[] | null[]>>({});
  const [selectedImages, setSelectedImages] = useState<Record<number, File | GeneratedImage | null>>({});
  const [videos, setVideos] = useState<Record<number, GeneratedVideo | null>>({});
  const [numImagesPerScene, setNumImagesPerScene] = useState<number[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<Record<number, File | null>>({}); // Uploaded videos
  const [finalVideo, setFinalVideo] = useState<FinalVideo | null>(null); // Final merged video
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState<number | null>(null);
  const [sampleVideos, setSampleVideos] = useState<string[]>([]);



  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        setUserId(data.user?.id || null);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);


  useEffect(() => {
    async function fetchSampleVideos() {
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();
        setSampleVideos(data);
      } catch (error) {
        console.error("Error fetching sample videos:", error);
      }
    }
    fetchSampleVideos();
  }, []);

  if (!authChecked) return null

  const styleOptions = ["anime", "comic-book", "fantasy-art"];

  const generateStory = async () => {
    if(!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a valid theme.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate story");
      }

      const { scenes, storyOutput, storyText, voices } = await response.json();
      setScenes(scenes || []);
      setStoryOutput(storyOutput || "");
      setStoryText(storyText || "");
      setVoices(voices || []);
      setNumImagesPerScene(new Array((scenes || []).length).fill(1));

      if (!storyText) {
        setError("Story text was not generated. Please try again.");
        return;
      }
      if (!voices || voices.length === 0) {
        setError("No voices available. Voiceover generation will be skipped.");
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateVoiceover = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!storyText) {
        throw new Error("No story text available to generate voiceover.");
      }

      const selectedVoice = voices[voiceChoice - 1] || voices[0];
      if (!selectedVoice) {
        throw new Error("No valid voice selected or available.");
      }

      const generateResponse = await fetch("/api/generate-voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-voiceover",
          story: storyText,
          voiceId: selectedVoice.voice_id,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate voiceover");
      }

      const { audio, voiceName } = await generateResponse.json();
      setAudio(audio);
      setVoiceName(voiceName);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateImagesForScene = async (sceneIndex: number) => {
    setLoading(true);
    setError(null);
    setCurrentScene(sceneIndex);

    try {
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes, style, sceneIndex, numImages: numImagesPerScene[sceneIndex - 1] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate images for scene ${sceneIndex}`);
      }

      const { images: newImages } = await response.json();
      setImages(prev => ({
        ...prev,
        [sceneIndex]: newImages.length > 0 ? newImages : [null],
      }));

      newImages.forEach((image: GeneratedImage | null) => {
        if (image && image.url && image.name) {
          const link = document.createElement('a');
          link.href = image.url;
          link.download = image.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setCurrentScene(null);
    }
  };

  const handleImageUpload = (sceneIndex: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImages(prev => ({
        ...prev,
        [sceneIndex]: file,
      }));
    }
  };

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const videoFiles = Array.from(files).slice(0, scenes.length);
      const updatedVideos: Record<number, File | null> = {};
      videoFiles.forEach((file, index) => {
        updatedVideos[index + 1] = file;
      });
      setUploadedVideos(updatedVideos);
    }
  };

  const handleAudioUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAudio(file);
    }
  };

  const generateVideoForScene = async (sceneIndex: number) => {
    setLoading(true);
    setError(null);
    setCurrentScene(sceneIndex);

    try {
      const scene = scenes[sceneIndex - 1];
      const selectedImage = selectedImages[sceneIndex];
      if (!scene?.videoPrompt || !selectedImage) {
        throw new Error(`Missing video prompt or selected image for scene ${sceneIndex}`);
      }

      const formData = new FormData();
      if (selectedImage instanceof File) {
        formData.append("image", selectedImage);
      } else {
        formData.append("imageUrl", selectedImage.url);
      }
      formData.append("videoPrompt", scene.videoPrompt);
      formData.append("sceneIndex", sceneIndex.toString());

      const response = await fetch("/api/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate video for scene ${sceneIndex}`);
      }

      const { video } = await response.json();
      setVideos(prev => ({
        ...prev,
        [sceneIndex]: video,
      }));
    } catch (err: any) {
      setError(err.message.includes("content moderation")
        ? `${err.message}. Please select a different image that complies with content guidelines.`
        : err.message);
    } finally {
      setLoading(false);
      setCurrentScene(null);
    }
  };

  const validateAudioFile = (file: File): boolean => {
    const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"];
    return validAudioTypes.includes(file.type);
  };

  const validateVideoFile = (file: File): boolean => {
    const validVideoTypes = ["video/mp4", "video/webm"];
    return validVideoTypes.includes(file.type);
  };

  const generateFullStoryVideo = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add scene count
      formData.append("sceneCount", scenes.length.toString());

      // Add videos
      scenes.forEach((_, i) => {
        const sceneIndex = i + 1;
        const uploadedVideo = uploadedVideos[sceneIndex];
        const generatedVideo = videos[sceneIndex];

        if (uploadedVideo) {
          if (!validateVideoFile(uploadedVideo)) {
            throw new Error("Please upload valid video files (MP4 or WebM)");
          }
          formData.append(`videos[${sceneIndex}]`, uploadedVideo);
        } else if (generatedVideo && generatedVideo.url) {
          formData.append(`videoUrls[${sceneIndex}]`, generatedVideo.url);
        } else {
          throw new Error(`No video available for scene ${sceneIndex}`);
        }
      });

      // Add audio
      if (uploadedAudio) {
        if (!validateAudioFile(uploadedAudio)) {
          throw new Error("Please upload a valid audio file (MP3 or WAV)");
        }
        formData.append("audio", uploadedAudio);
      } else if (audio) {
        formData.append("audioUrl", audio);
      } else {
        throw new Error("No audio uploaded");
      }

      // Validate video count
      const videoCount = Object.keys(uploadedVideos).length > 0 ? Object.keys(uploadedVideos).length : Object.keys(videos).length;
      if (videoCount !== scenes.length) {
        throw new Error(`Please upload exactly ${scenes.length} videos`);
      }

      const response = await fetch("/api/merge-story-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate full story video");
      }

      const { video } = await response.json();
      setFinalVideo(video);

      if (userId) {
        const saveResponse = await fetch("/api/save-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            videoUrl: video.url,
            name: video.name,
            scenes: scenes.map(scene => scene.videoPrompt)
          }),
        });
  
        if (!saveResponse.ok) {
          console.error("Failed to save video to database");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
      {isLoggedIn ? (
        <div className="sticky top-0 z-50 w-full">
          <DashboardHeader />
        </div>
      ) : (
        <Navbar />
      )}
      <main className="flex flex-col items-center px-10 py-10 gap-10">
        <Card className="w-full max-w-2xl p-8 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg">
          <CardContent className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Create an Animated Story Video</h2>

            {step === 1 && (
              <>
                <textarea
                  placeholder="Friendship story of Harry and Ron..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                />
                <Button
                  onClick={generateStory}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                  ) : isLoggedIn ? (
                    "Generate Story"
                  ) : (
                    "Sign In to Continue"
                  )}
                </Button>
              </>
            )}

{step === 2 && (
  <>
    <h3 className="text-xl">Generated Story with Scene Prompts:</h3>
    <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap break-words">
      {storyOutput}
    </pre>
    <div className="flex flex-col gap-2">
      <label>Available Voices:</label>
      {voices.length > 0 ? (
        <ul className="list-decimal pl-5">
          {voices.map((v, i) => (
            <li key={v.voice_id}>
              {v.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No voices available.</p>
      )}
      <Input
        type="number"
        min="1"
        max={voices.length || 20}
        value={voiceChoice}
        onChange={(e) => setVoiceChoice(parseInt(e.target.value) || 1)}
        disabled={voices.length === 0}
        className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
      />
      <p>You selected: {voices[voiceChoice - 1]?.name || "N/A"}</p>
    </div>
    <Button
      onClick={generateVoiceover}
      disabled={loading || !voices.length || !storyText}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
    >
      {loading ? (
        <div className="flex items-center">
          <Loader2 className="animate-spin mr-2" />
          Generating Voiceover...
        </div>
      ) : (
        "Generate Voiceover"
      )}
    </Button>
  </>
)}

            {step === 3 && (
              <>
                <h3 className="text-xl">Voiceover Generated: {voiceName}</h3>
                <audio controls src={audio} className="w-full mb-4" />
                <div className="flex flex-wrap gap-4">
                  {styleOptions.map((styleOption) => (
                    <Button
                      key={styleOption}
                      onClick={() => setStyle(styleOption)}
                      className={`px-6 py-2 rounded-lg ${
                        style === styleOption
                          ? "bg-purple-600 text-white"
                          : "bg-gray-300 dark:bg-gray-800 text-black dark:text-white"
                      }`}
                    >
                      {styleOption.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Button>
                  ))}
                </div>
                <h3 className="text-xl mt-4">Select Number of Images per Scene:</h3>
                {scenes.map((scene, i) => (
                  <div key={i + 1} className="flex flex-col gap-2 mt-2">
                    <p>
                      <strong>Scene {i + 1} Image Prompt:</strong> {scene.imagePrompt || "No prompt available"}
                    </p>
                    <Input
                      type="number"
                      min="1"
                      max="4"
                      value={numImagesPerScene[i] || 1}
                      onChange={(e) => {
                        const newNum = [...numImagesPerScene];
                        newNum[i] = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 4);
                        setNumImagesPerScene(newNum);
                      }}
                      className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                    />
                    <Button
                      onClick={() => generateImagesForScene(i + 1)}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg mt-2"
                    >
                      {loading && currentScene === i + 1 ? (
                        <div className="flex items-center">
                          <Loader2 className="animate-spin mr-2" />
                          Generating Images...
                        </div>
                      ) : (
                        "Generate Images"
                      )}
                    </Button>
                    {images[i + 1] && (
                      <div className="mt-4">
                        {images[i + 1].map((image, j) =>
                          image && image.url ? (
                            <div key={j} className="mt-2">
                              <p><strong>{image.name}</strong></p>
                              <Image
                                src={image.url}
                                alt={image.name}
                                width={512}
                                height={512}
                                className="rounded-lg shadow-lg"
                                onError={() => {
                                  const currentImages = images[i + 1];
                                  if (Array.isArray(currentImages)) {
                                    const updatedImages = currentImages.map((img, idx) =>
                                      idx === j ? null : img
                                    ) as GeneratedImage[] | null[];
                                    setImages(prev => ({
                                      ...prev,
                                      [i + 1]: updatedImages,
                                    }));
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <p key={j} className="text-red-500 mt-2">Image failed to load</p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  onClick={() => setStep(4)}
                  disabled={loading || Object.keys(images).length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4"
                >
                  Proceed to Video Generation
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <h3 className="text-xl">Generate Videos for Each Scene</h3>
                {scenes.map((scene, i) => {
                  const selectedImage = selectedImages[i + 1];
                  const video = videos[i + 1];
                  let imageName: string | null = "None";
                  if (selectedImage) {
                    if (selectedImage instanceof File) {
                      imageName = selectedImage.name;
                    } else if ("name" in selectedImage) {
                      imageName = selectedImage.name;
                    }
                  }

                  return (
                    <div key={i + 1} className="flex flex-col gap-2 mt-2">
                      <p>
                        <strong>Scene {i + 1} Video Prompt:</strong> {scene.videoPrompt || "No prompt available"}
                      </p>
                      <p>Selected Image: {imageName}</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(i + 1, e)}
                        className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                      />
                      <Button
                        onClick={() => generateVideoForScene(i + 1)}
                        disabled={loading || !selectedImages[i + 1]}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg mt-2"
                      >
                        {loading && currentScene === i + 1 ? (
                          <div className="flex items-center">
                            <Loader2 className="animate-spin mr-2" />
                            Generating Video...
                          </div>
                        ) : (
                          "Generate Video"
                        )}
                      </Button>
                      {video && video.url && video.name ? (
                        <div className="mt-4">
                          <p><strong>{video.name}</strong></p>
                          <video controls src={video.url} className="w-full rounded-lg shadow-lg" />
                          <Button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = video.url;
                              link.download = video.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg"
                          >
                            Download Video
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <Button
                  onClick={() => setStep(5)}
                  disabled={loading || Object.keys(videos).length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4"
                >
                  Create Full Story Video
                </Button>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="text-2xl font-bold">Merge Audio and Videos</h2>

                {/* Scene Count Input */}
                <div className="flex flex-col gap-2">
                  <label>Number of Scenes:</label>
                  <Input
                    type="number"
                    min="1"
                    value={scenes.length}
                    disabled
                    className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                  />
                </div>

                {/* Audio Upload */}
                <div className="flex flex-col gap-2">
                  <p>
                    <strong>Audio:</strong> {uploadedAudio ? uploadedAudio.name : audio ? `Generated Voiceover (${voiceName})` : "None"}
                  </p>
                  <Input
                    type="file"
                    accept="audio/mpeg,audio/wav"
                    onChange={handleAudioUpload}
                    className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                  />
                </div>

                {/* Video Upload */}
                <div className="flex flex-col gap-2">
                  <p>
                    <strong>Videos:</strong>{" "}
                    {Object.values(uploadedVideos).length > 0
                      ? Object.values(uploadedVideos).map((v) => v?.name).filter(Boolean).join(", ")
                      : Object.values(videos).length > 0
                      ? Object.values(videos).map((v) => v?.name).filter(Boolean).join(", ")
                      : "None"}
                  </p>
                  <Input
                    type="file"
                    accept="video/mp4,video/webm"
                    multiple
                    onChange={handleVideoUpload}
                    className="p-3 rounded-md bg-gray-200 dark:bg-gray-800 border border-gray-700"
                  />
                  <p className="text-sm text-gray-500">
                    Select up to {scenes.length} videos at once (MP4 or WebM)
                  </p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateFullStoryVideo}
                  disabled={loading || (!uploadedAudio && !audio) || (Object.keys(uploadedVideos).length === 0 && Object.keys(videos).length !== scenes.length)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin mr-2" />
                      Generating Full Story Video...
                    </div>
                  ) : (
                    "Generate Full Story Video"
                  )}
                </Button>

                {/* Final Video Output */}
                {finalVideo && (
                  <div className="mt-4">
                    <h3 className="text-xl font-bold mb-2">Final Story Video</h3>
                    <p>
                      <strong>{finalVideo.name}</strong>
                    </p>
                    <video controls src={finalVideo.url} className="w-full rounded-lg shadow-lg" />
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = finalVideo.url;
                        link.download = finalVideo.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg"
                    >
                      Download Final Video
                    </Button>
                  </div>
                )}

                {error && <p className="text-red-500">{error}</p>}
              </>
            )}
          </CardContent>
        </Card>
   
   {/* 🔁 Video Grid Section */}
        <section className="mt-12 w-full max-w-6xl">
          <h3 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Sample Generated Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
            {sampleVideos.slice(0, 4).map((url, index) => (
              <Card key={index} className="overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 object-cover rounded-md"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}