import speech_recognition as sr
import sys
import os

def speech_to_text(audio_file, output_file):
    """Convert speech to text and save it to a file."""
    recognizer = sr.Recognizer()

    try:
        # Load the audio file
        with sr.AudioFile(audio_file) as source:
            print("Reading audio file...")
            audio = recognizer.record(source)

        print("Recognizing...")
        text = recognizer.recognize_google(audio)

        # Save the transcribed text to a file
        with open(output_file, "w") as file:
            file.write(text)

        print(f"Transcription saved to {output_file}")
    except sr.UnknownValueError:
        print("Sorry, could not understand the audio.")
        sys.exit(1)
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python Speech-To-Text.py <output_file> <audio_file>")
        sys.exit(1)

    output_file = sys.argv[1]
    audio_file = sys.argv[2]

    if not os.path.exists(audio_file):
        print(f"Error: Audio file '{audio_file}' not found.")
        sys.exit(1)

    speech_to_text(audio_file, output_file)