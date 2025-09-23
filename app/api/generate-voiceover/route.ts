import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { action, story, voiceId } = await req.json();
  const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

  if (!ELEVEN_LABS_API_KEY) {
    return NextResponse.json({ error: 'ELEVEN_LABS_API_KEY is not set' }, { status: 500 });
  }

  if (action === 'get-voices') {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const voices = data.voices.map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
    }));

    return NextResponse.json({ voices });
  }

  if (action === 'generate-voiceover') {
    if (!story || !voiceId) {
      return NextResponse.json({ error: 'Missing story or voiceId' }, { status: 400 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: story,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audio = `data:audio/mpeg;base64,${base64Audio}`;

    return NextResponse.json({ audio, voiceName: voiceId });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}