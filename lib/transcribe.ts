// lib/transcribe.ts
export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      throw new Error('Web Speech API not supported in this environment');
    }
  
    return new Promise((resolve) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
  
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
  
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        resolve(null);
      };
  
      // Remove audio playback logic
      // const audioUrl = URL.createObjectURL(audioBlob);
      // const audio = new Audio(audioUrl);
      // audio.onended = () => {
      //   recognition.stop();
      //   URL.revokeObjectURL(audioUrl);
      // };
  
      recognition.start();
      // No audio.play() call
    });
  }