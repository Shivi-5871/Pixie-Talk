from gtts import gTTS
from playsound import playsound
from deep_translator import GoogleTranslator
import sys

# Dictionary mapping language names to language codes
language_codes = {
    "english": "en",
    "french": "fr",
    "spanish": "es",
    "german": "de",
    "hindi": "hi",
    "italian": "it",
    "japanese": "ja",
    "korean": "ko",
    "russian": "ru",
    "portuguese": "pt",
    "arabic": "ar",
    "urdu": "ur",
    "turkish": "tr"
}

def translate_text(input_text, src_lang, dest_lang):
    """Translate the text using deep_translator."""
    translated = GoogleTranslator(source=src_lang, target=dest_lang).translate(input_text)
    return translated

def text_to_speech(input_text, language, output_file):
    """Convert text to speech and save as an MP3 file."""
    tts = gTTS(text=input_text, lang=language, slow=False)
    tts.save(output_file)

if __name__ == "__main__":
    try:
        # Command-line arguments
        input_text = sys.argv[1]  # The text to translate
        src_lang = sys.argv[2]    # Source language code
        dest_lang = sys.argv[3]   # Destination language code
        output_file = "output.mp3"

        # Validate language codes
        if src_lang not in language_codes.values() or dest_lang not in language_codes.values():
            print("Invalid language codes.")
            sys.exit(1)

        # Translate text
        translated_text = translate_text(input_text, src_lang, dest_lang)

        # Convert translated text to speech
        text_to_speech(translated_text, dest_lang, output_file)

        # Print success message
        print(f"Translated text: {translated_text}")
        print(f"Speech saved as {output_file}")

    except IndexError:
        print("Usage: python text_to_speech.py <text> <src_lang> <dest_lang>")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
