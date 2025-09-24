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

```Pixie-Talk/
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
```

<h1><b>⚙️ Installation & Setup</b></h1>

<b>1. Clone the repository</b>
```
git clone https://github.com/Shivi-5871/Pixie-Talk.git
cd pixie-talk
```

<b>2. Backend Setup</b>
```
cd backend
pip install -r requirements.txt
python app.py
```

<b>3. Frontend Setup</b>
```
cd ../frontend
npm install
npm run dev
```

<b>4. Environment Variables</b>

Create a .env file in both backend and frontend with the following:

<b>Backend .env:</b>
```
MONGO_URI=your_mongo_uri
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
MONSTER_API_KEY=your_key_here
AI_VIDEO_API_KEY=your_key_here
```

<b>Frontend .env.local:</b>
```
NEXT_PUBLIC_API_URL=http://localhost:5000
and other API keys
```

<h1>📖 Usage</h1>
<ol type="1">
  <li>Sign up / Log in</li>
  
  <li>Enter a theme → generate a story</li>

  <li>Generate scene images</li>

  <li>Add voice narration</li>

  <li>Compile into video</li>

  <li>Download or share</li>
</ol>


<h1><b>🤝 Contributing</b></h1>

Contributions are welcome 🎉

<ol type="1">
  <li>Fork the repo</li>

  <li>Create a new branch (feature-xyz)</li>

  <li>Commit changes</li>

  <li>Submit a Pull Request</li>
</ol>

<h1><b>📜 License</b></h1>

Licensed under the MIT License – free to use, modify, and distribute.
