# Pixie Talk - AI-Powered Content Creation #

Pixie Talk is an AI-powered interactive storytelling platform that transforms your ideas into animated stories. It integrates story generation, voice narration, image creation, and video animation into one seamless pipeline.

🚀 Features

✨ AI Story Generation – Create engaging stories using Gemini API

🗣️ Voice Narration – Convert story text into realistic voices with ElevenLabs API

🎨 Scene Illustrations – Generate images for each scene using Monster API

🎬 Video Animation – Animate images into videos with AI Video API

🎙️ Speech-to-Text & Text-to-Speech – Voice interactivity powered by Google Speech Recognition

🔑 Authentication – Secure user login and signup

💾 Data Handling – Store stories, audio, images, and videos persistently

<h1>Tech Stack</h1>

<b>Frontend (React + Next.js):</b>

* Next.js

* React

<b>Backend (Flask + Python):</b>

* Flask (REST API)

* FFmpeg (video merging)

* MongoDB (database)

<b>APIs & Integrations:</b>

* Gemini API – Story generation

* ElevenLabs API – Voice generation

* Monster API – Image generation

* AI Video API – Video creation

* Google Speech Recognition

<h2>📂 Project Structure</h2>

Pixie-Talk/
│── backend/
│   ├── app.py                  # Flask backend server
│   ├── Animated Story Video.py # AI pipeline for story → video
│   ├── render-build.sh         # Deployment build script
│   ├── requirements.txt        # Python dependencies
│   └── static/                 # Static assets (images, audio, video)
│
│── frontend/
│   ├── app/                    # Next.js app directory
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Auth, DB, utils
│   ├── models/                 # User & data models
│   ├── public/                 # Public assets
│   ├── record-static/          # Stored media files
│   ├── styles/                 # Global styles
│   ├── types/                  # TypeScript types
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind config
│   └── tsconfig.json           # TypeScript config
│
│── scripts/                    # Utility scripts
│── .env                        # Environment variables
│── README.md                   # Project documentation
