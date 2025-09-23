

import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

interface Scene {
  storyScene: string | null;
  imagePrompt: string | null;
  videoPrompt: string | null;
}

async function getVoices() {
  const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ELEVEN_LABS_API_KEY is not set');
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: {
      'xi-api-key': ELEVEN_LABS_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch voices: ${error}`);
  }

  const data = await response.json() as { voices: Array<{ voice_id: string; name: string }> };
  return data.voices.map((v) => ({
    voice_id: v.voice_id,
    name: v.name,
  }));
}

async function generateVoiceover(text: string) {
  const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ELEVEN_LABS_API_KEY is not set');
  }

  // Using the first available voice (you can modify this as needed)
  const voices = await getVoices();
  const voiceId = voices[0]?.voice_id;
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate voiceover: ${error}`);
  }

  return await response.arrayBuffer();
}

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }

  const storyPrompt = `
    Generate a meaningful and engaging children's story with a clear moral or lesson. The story should consist of 5 scenes, each 20-30 words long, vividly describing the characters, environment, and actions. The story should have a meaningful and satisfying ending.
Character Consistency:

Create a unique main character based on the theme provided. Define their name, age, appearance (hair color, hairstyle, eye color, skin tone), clothing (style and color), and optional accessories (e.g., hat, necklace) at the start of the story.
If additional characters appear in the story, introduce them with the same level of detail when they first appear.
Once defined, these exact details (name, age, appearance, clothing, accessories) must remain consistent across all 5 scenes in the image prompts and video prompts for ALL characters.
Only include full character physical details in the story text when a character first appears (main character in Scene 1, other characters in their first scene). For subsequent scenes, refer to characters by name without repeating all physical attributes.

For each scene, generate:

A highly detailed text-to-image prompt that is directly tied to the story. Structure it as follows:

Start with: "Character: [Insert the exact character details defined at the start, e.g., 'Milo, 9 years old, short black hair, brown eyes, fair skin, wearing a green jacket, blue jeans']."
For scenes with multiple characters, include full details for each character in the image prompt.
Then add scene-specific details including:

Facial expressions and poses relevant to the scene
Background elements (nature, city, fantasy setting, lighting, time of day)
Camera angle (close-up, wide-angle, over-the-shoulder, top-down)
Ensure the image prompt reflects the specific moment in the story.
Do not mention the art style of the image.




A highly detailed video generation prompt that describes:

Character movements (e.g., walking, running, gesturing) and facial expressions (e.g., smiling, frowning, surprise) matching the consistent character details for ALL characters in the scene
Interactions with objects or other characters (e.g., picking up an object, hugging, pointing)
Camera movement (panning, zoom-in, cinematic tracking, slow-motion)
Scene transitions and effects (e.g., fade-in, fade-out, crossfade)
Ensure the video prompt aligns with the story's progression and emotional tone.



Example Output:
Main Character: Milo, 9 years old, short black hair, brown eyes, fair skin, wearing a green jacket, blue jeans, and a red cap.
Scene 1:
Story Scene: Milo, a 9-year-old boy with short black hair and brown eyes, wandered through the bustling market, clutching his red cap with wonder.
Image Prompt: Character: Milo, 9 years old, short black hair, brown eyes, fair skin, wearing a green jacket, blue jeans, and a red cap. He stands with a wide-eyed expression, clutching his cap, surrounded by colorful market stalls, bright daylight, wide-angle shot.
Video Prompt: Milo, 9 years old, with short black hair and brown eyes, wearing a green jacket, blue jeans, and a red cap, walks slowly through a market, eyes widening in awe. Camera tracks alongside, zooming in on his face, fading to the next scene.
Scene 2:
Story Scene: A girl named Lily, with curly red hair and freckles, approached Milo. She wore a yellow sundress and carried a small basket.
Image Prompt: Character 1: Milo, 9 years old, short black hair, brown eyes, fair skin, wearing a green jacket, blue jeans, and a red cap. Character 2: Lily, 8 years old, curly red hair, green eyes, freckles across her nose, wearing a yellow sundress and carrying a small wicker basket. They stand facing each other in the market, mid-range shot.
Video Prompt: Milo, 9 years old, with short black hair and brown eyes, wearing a green jacket, blue jeans, and a red cap, turns as Lily, 8 years old, with curly red hair, green eyes, freckles, wearing a yellow sundress, approaches him. She smiles and holds out her basket. Camera pans between their faces, capturing their expressions.
Scene 3:
Story Scene: Milo smiled at Lily as they examined the colorful fruits in her basket. The market buzzed around them.
Image Prompt: Character 1: Milo, 9 years old, short black hair, brown eyes, fair skin, wearing a green jacket, blue jeans, and a red cap. Character 2: Lily, 8 years old, curly red hair, green eyes, freckles across her nose, wearing a yellow sundress and carrying a small wicker basket. Both are looking down at the basket of fruits between them, close-up shot focusing on the basket and their hands.
Video Prompt: Milo, 9 years old, with short black hair and brown eyes, wearing a green jacket, blue jeans, and a red cap, and Lily, 8 years old, with curly red hair, green eyes, freckles, wearing a yellow sundress, examine the basket together. Camera slowly circles around them, with the market visible but slightly blurred in the background.
Generate the story based on this theme:   ${prompt}
  `;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: storyPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Failed to generate story: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;
    const storyOutput = data.candidates[0].content.parts[0].text.replace(/\*\*/g, '');

    // Improved parsing logic for scenes
    const sceneBlocks = storyOutput.split(/(?=Scene \d+:)/).filter(block => block.trim().startsWith('Scene'));
    const scenes: Scene[] = sceneBlocks.map((block) => {
      // Updated regex to better extract just the story scene text
      const storySceneMatch = block.match(/Story Scene:([\s\S]+?)(?=Image Prompt:|$)/i);
      const imagePromptMatch = block.match(/Image Prompt:([\s\S]+?)(?=Video Prompt:|$)/i);
      const videoPromptMatch = block.match(/Video Prompt:([\s\S]+?)(?=Scene \d+:|$)/i);

      return {
        storyScene: storySceneMatch ? storySceneMatch[1].trim() : null,
        imagePrompt: imagePromptMatch ? imagePromptMatch[1].trim() : null,
        videoPrompt: videoPromptMatch ? videoPromptMatch[1].trim() : null,
      };
    });

    // Extract only the narrative story text for voiceover (no labels, no prompts)
    const storyText = scenes
      .map(scene => scene.storyScene)
      .filter(Boolean)
      .join(' ');
      
    // Remove any remaining labels or formatting that might be in the story text
    const cleanStoryText = storyText
      .replace(/Scene \d+:/g, '')
      .replace(/Story Scene:/g, '')
      .replace(/Image Prompt:/g, '')
      .replace(/Video Prompt:/g, '')
      .trim();

    // Generate voiceover for the pure story text
    const voiceover = await generateVoiceover(cleanStoryText);

    // Convert ArrayBuffer to Base64 for easier transmission
    const voiceoverBase64 = Buffer.from(voiceover).toString('base64');

    // Fetch available voices from Eleven Labs (keeping original functionality)
    const voices = await getVoices();

    return NextResponse.json({ 
      scenes, 
      storyOutput, 
      storyText: cleanStoryText, // Using the cleaned story text here
      voices,
      voiceover: voiceoverBase64,
      mimeType: 'audio/mpeg' 
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}