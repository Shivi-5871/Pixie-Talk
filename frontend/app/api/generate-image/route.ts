// frontend/app/api/generate-image/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const API_KEY = process.env.NEXT_PUBLIC_MONSTER_API_KEY;

  if (!API_KEY) {
    console.error('API Key is missing');
    return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
  }

  const url = 'https://api.monsterapi.ai/v1/generate/txt2img';
  
  const payload = {
    beam_size: 1,
    max_length: 256,
    prompt,
    repetition_penalty: 1.2,
    temp: 0.98,
    top_k: 40,
    top_p: 1
  };

  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'authorization': `Bearer ${API_KEY}`
  };

  try {
    // Step 1: Initial request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();  // Log the error text from the API
      console.error('Error in image generation request:', errorText);
      return NextResponse.json({ error: 'Failed to start image generation' }, { status: 500 });
    }

    const responseData = await response.json();
    const statusUrl = responseData.status_url;

    if (!statusUrl) {
      console.error('Missing status URL in the response');
      return NextResponse.json({ error: 'Failed to get status URL' }, { status: 500 });
    }

    console.log('Status URL:', statusUrl);  // Log status URL for tracking polling

    // Step 2: Polling for completion
    let imageUrl = '';
    let status = '';
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      const statusResponse = await fetch(statusUrl, { headers });

      if (!statusResponse.ok) {
        const statusError = await statusResponse.text();  // Log error response from status check
        console.error('Error in status check:', statusError);
        return NextResponse.json({ error: 'Failed to get image status' }, { status: 500 });
      }

      const statusData = await statusResponse.json();
      status = statusData.status;

      console.log('Polling status:', status);  // Log the polling status

      if (status === 'COMPLETED') {
        imageUrl = statusData.result.output[0];
        break;
      } else if (status === 'IN_PROGRESS') {
        await new Promise((resolve) => setTimeout(resolve, 3000));  // Poll every 3 seconds
      }

      retries++;
    }

    if (!imageUrl) {
      console.error('Image generation failed or timed out');
      return NextResponse.json({ error: 'Image generation failed or timed out' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
