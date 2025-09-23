import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [{ 
    url: { type: String, required: true },
    prompt: { type: String, required: true },
    style: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  voice_images: [{ 
    url: { type: String, required: true },
    prompt: { type: String, required: true },
    style: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  ttsHistory: [{  
    text: { type: String, required: true },
    srcLang: { type: String, required: true },
    destLang: { type: String, required: true },
    audioUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  audioTranscriptions: [{  
    audioUrl: { type: String, required: true }, 
    text: { type: String, required: true },     
    createdAt: { type: Date, default: Date.now } 
  }],
  videos: [{  
    videoUrl: { type: String, required: true },
    textPrompt: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  finalVideo: [{  
    videoUrl: { type: String, required: true },
    textPrompt: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);