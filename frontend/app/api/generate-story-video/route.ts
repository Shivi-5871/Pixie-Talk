// app/api/generate-story-video/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Helper function to run the Python script
async function runPythonScript(step: string, args: string[] = []): Promise<string> {
    const scriptPath = path.join(process.cwd(), 'scripts', 'Animated_Story_Video.py');
    const command = `python ${scriptPath} ${step} ${args.join(' ')}`;
    console.log('Running command:', command); // Debugging

    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('Python script error:', stderr);
            throw new Error(stderr);
        }
        console.log('Python script output:', stdout); // Debugging
        return stdout.trim();
    } catch (error) {
        console.error('Error running Python script:', error);
        throw new Error(`Failed to run Python script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Parse the request body
        const { step, data } = await request.json();
        console.log('Received request:', { step, data }); // Debugging

        let result: string;
        switch (step) {
            case 'generateStory':
                if (!data.theme) throw new Error('Theme is required');
                result = await runPythonScript('generateStory', [data.theme]);
                break;

            case 'generateVoiceover':
                if (!data.story || !data.voice) throw new Error('Story and voice are required');
                result = await runPythonScript('generateVoiceover', [data.story, data.voice]);
                break;

            case 'generateImages':
                if (!data.story || !data.numScenes || !data.numImages) throw new Error('Story, numScenes, and numImages are required');
                result = await runPythonScript('generateImages', [data.story, data.numScenes.toString(), data.numImages.toString()]);
                break;

            case 'generateVideos':
                if (!data.imagePaths || !data.videoPrompts) throw new Error('Image paths and video prompts are required');
                result = await runPythonScript('generateVideos', [data.imagePaths.join(' '), data.videoPrompts.join(' ')]);
                break;

            case 'mergeAudioVideo':
                if (!data.audioPath || !data.videoPaths) throw new Error('Audio path and video paths are required');
                result = await runPythonScript('mergeAudioVideo', [data.audioPath, data.videoPaths.join(' ')]);
                break;

            default:
                throw new Error('Invalid step');
        }

        // Return success response
        return NextResponse.json({ success: true, result }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error in API route:', error.message); // Handle the error if it's an Error object
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        } else {
            console.error('Unexpected error in API route:', error); // Handle other cases
            return NextResponse.json(
                { success: false, error: 'An unexpected error occurred' },
                { status: 500 }
            );
        }
    }
}