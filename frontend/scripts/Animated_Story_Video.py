import os
import re
import sys
import json
import time
import requests
import google.generativeai as genai
from pydub import AudioSegment
from datetime import datetime

# Suppress warnings by redirecting stderr
sys.stderr = open(os.devnull, 'w')

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyBiyOIataGyWDqTepF0VHhwJzRsxbaBMIs"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Eleven Labs API Configuration
ELEVEN_LABS_API_KEY = "sk_7475972452bb2033718008646c05159bbbf10bdd343c64b7"
ELEVEN_LABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Monster API Configuration
MONSTER_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjFmNGYxMTJhZWRlMTBkNDY2ZmNmNjk1YTQzMzEzMjE0IiwiY3JlYXRlZF9hdCI6IjIwMjUtMDItMjdUMTQ6NTA6MDkuMzMwNTU1In0.tZO296zzzlyDUdbQdum-8sATlshprF-AXVzn8MDEMm0"
MONSTER_API_URL = "https://api.monsterapi.ai/v1/generate/txt2img"

# Step 1: Story Generation using Gemini API
def generate_story_and_prompts(prompt):
    full_prompt = f"""
    Generate a meaningful and engaging children's story with a clear moral or lesson. The story should consist of 5 scenes, each 20-30 words long, vividly describing the characters, environment, and actions. The story should have a meaningful and satisfying ending.

    **Character Consistency:**  
    - The main characters' appearance, facial features, age, and clothing must remain consistent across all scenes.  
    - For example, if a character is described as a 10-year-old girl with curly brown hair, a red dress, and green eyes, this description must be the same in every scene.  

    For each scene, also generate:  
    1. **A highly detailed text-to-image prompt** that is directly tied to the story. Include:  
       - Character details (age, clothing, facial expressions, pose, hairstyle, eye color)  
       - Background elements (nature, city, fantasy setting, lighting, time of day)  
       - Camera angle (close-up, wide-angle, over-the-shoulder, top-down)  
       - Ensure the image prompt reflects the specific moment in the story.  
       - **Do not mention the art style of the image.**

    2. **A highly detailed video generation prompt** that describes:  
       - Character movements (e.g., walking, running, gesturing, facial expressions like smiling, frowning, or surprise)  
       - Interactions with objects or other characters (e.g., picking up an object, hugging, pointing)  
       - Camera movement (panning, zoom-in, cinematic tracking, slow-motion)  
       - Scene transitions and effects (e.g., fade-in, fade-out, crossfade)  
       - Ensure the video prompt aligns with the story's progression and emotional tone.

    **Example Output:**  
    ---
    **Scene 1:**  
    **Story Scene:** [Story]  

    **Image Prompt:** [Highly detailed text-to-image prompt tied to the story]  

    **Video Prompt:** [Detailed video animation prompt with character movements and camera effects]  

    ---
    **Scene 2:**  
    **Story Scene:** [Story]  

    **Image Prompt:** [Highly detailed text-to-image prompt tied to the story]  

    **Video Prompt:** [Detailed video animation prompt with character movements and camera effects]  
    ---

    Generate the story based on this theme: {prompt}
    """

    try:
        response = model.generate_content(full_prompt, stream=True)
        full_text = ""
        for chunk in response:
            full_text += chunk.text
        clean_output = re.sub(r'\*\*', '', full_text)
        return clean_output
    except Exception as e:
        print(f" An error occurred: {str(e)}")
        return None
# Step 2: Voiceover Generation using Eleven Labs API
def get_available_voices():
    url = f"{ELEVEN_LABS_BASE_URL}/voices"
    headers = {"xi-api-key": ELEVEN_LABS_API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        voices = response.json().get("voices", [])
        return {voice["name"]: voice["voice_id"] for voice in voices}
    else:
        print("Error fetching voices:", response.status_code, response.text)
        return {}

def extract_story_text(full_story):
    filtered_lines = []
    recording = False
    moral_found = False

    for line in full_story.split("\n"):
        line = line.strip()
        if re.match(r"Scene \d+:", line):
            recording = True
            continue
        if "Image Prompt:" in line or "Video Prompt:" in line:
            continue
        if recording and "Story Scene:" in line:
            story_line = line.replace("Story Scene:", "").strip()
            filtered_lines.append(story_line)
        if "Moral of the Story:" in line:
            moral_found = True
            filtered_lines.append("Moral of the Story")
            continue
        if moral_found and line:
            filtered_lines.append(line)

    return " ".join(filtered_lines)

def text_to_speech(text, voice_id, voice_name):
    url = f"{ELEVEN_LABS_BASE_URL}/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY,
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "rate": 0.8
        }
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        output_file = f"{voice_name.replace(' ', '_')}_{timestamp}.mp3"
        with open(output_file, "wb") as f:
            f.write(response.content)
        print(f"Audio saved to {output_file}")
        return output_file
    else:
        print("Error generating speech:", response.status_code, response.text)
        return None

def adjust_speed(input_file, output_file, speed_factor):
    audio = AudioSegment.from_mp3(input_file)
    modified_audio = audio.speedup(playback_speed=speed_factor)
    modified_audio.export(output_file, format="mp3")
    print(f"Adjusted audio saved to {output_file}")

def generate_voiceover(story_text):
    voices = get_available_voices()
    if not voices:
        print("No voices available. Exiting.")
        return

    print("\nAvailable Voices:")
    for idx, voice_name in enumerate(voices.keys(), start=1):
        print(f"{idx}. {voice_name}")

    while True:
        try:
            choice = int(input("\nSelect a voice by entering the corresponding number: "))
            if 1 <= choice <= len(voices):
                selected_voice = list(voices.keys())[choice - 1]
                voice_id = voices[selected_voice]
                print(f"You selected: {selected_voice}")
                break
            else:
                print("Invalid choice. Please select a valid number.")
        except ValueError:
            print("Invalid input. Please enter a number.")

    print("\nGenerating speech...")
    audio_file = text_to_speech(story_text, voice_id, selected_voice)
    if audio_file:
        adjusted_audio_file = f"adjusted_{audio_file}"
        adjust_speed(audio_file, adjusted_audio_file, speed_factor=0.8)

# Step 3: Image Generation using Monster API
def extract_image_prompts(story_output, num_scenes):
    """
    Extracts image prompts for the specified number of scenes from the Gemini API output.
    """
    image_prompts = []
    scenes = story_output.split("---")
    for i, scene in enumerate(scenes):
        if i >= num_scenes:
            break  # Stop after extracting the required number of scenes
        if "Image Prompt:" in scene:
            # Extract the image prompt for the scene
            image_prompt = scene.split("Image Prompt:")[1].split("Video Prompt:")[0].strip()
            image_prompts.append(image_prompt)
    return image_prompts

def generate_images(story_output):
    """
    Generates images for the specified number of scenes using the Monster API.
    Automatically extracts image prompts from the Gemini API output.
    """
    style_options = ["anime", "comic-book", "fantasy-art"]
    print("\nChoose a style for image generation:")
    for idx, style in enumerate(style_options, start=1):
        print(f"{idx}. {style.replace('-', ' ').capitalize()}")

    while True:
        style_choice = input("Enter the number corresponding to your chosen style: ").strip()
        if style_choice.isdigit() and 1 <= int(style_choice) <= len(style_options):
            selected_style = style_options[int(style_choice) - 1]
            break
        else:
            print("Invalid choice! Please enter a valid number from the list.")

    # Ask the user for the total number of scenes to generate
    while True:
        try:
            num_scenes = int(input("\nEnter the total number of scenes to generate: ").strip())
            if num_scenes > 0:
                break
            else:
                print("Please enter a valid number greater than 0.")
        except ValueError:
            print("Invalid input! Please enter a valid number.")

    # Extract image prompts for the specified number of scenes
    image_prompts = extract_image_prompts(story_output, num_scenes)
    if not image_prompts:
        print("No image prompts found in the story output.")
        return

    current_directory = os.getcwd()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    for scene_number, image_prompt in enumerate(image_prompts, start=1):
        print(f"\nGenerating images for Scene {scene_number}...")
        print(f"Image Prompt: {image_prompt}")

        while True:
            num_images_input = input(f"Enter the number of images for scene {scene_number} (1-4): ").strip()
            if num_images_input.isdigit() and 1 <= int(num_images_input) <= 4:
                num_images = int(num_images_input)
                break
            else:
                print("Invalid input! Please enter a number between 1 and 4.")

        payload = {
            "prompt": image_prompt,
            "samples": num_images,
            "guidance_scale": 7.5,
            "safe_filter": True,
            "steps": 50,
            "style": selected_style
        }

        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {MONSTER_API_KEY}"
        }

        response = requests.post(MONSTER_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            response_data = json.loads(response.text)
            status_url = response_data.get('status_url')

            while True:
                status_response = requests.get(status_url, headers=headers)
                if status_response.status_code == 200:
                    status_data = json.loads(status_response.text)

                    if status_data['status'] == 'IN_PROGRESS':
                        time.sleep(5)
                    elif status_data['status'] == 'COMPLETED':
                        if 'result' in status_data and 'output' in status_data['result']:
                            image_urls = status_data['result']['output']

                            for i, image_url in enumerate(image_urls[:num_images]):
                                image_response = requests.get(image_url)

                                if image_response.status_code == 200:
                                    image_filename = f'scene_{scene_number}_image_{timestamp}_{i+1}.png'
                                    image_path = os.path.join(current_directory, image_filename)

                                    with open(image_path, 'wb') as f:
                                        f.write(image_response.content)
                                    print(f"Scene {scene_number}, Image {i+1} saved as '{image_path}'")

                                    os.startfile(image_path)  # Open the image (Windows only)
                                else:
                                    print(f"Failed to download image {i+1}. Status code: {image_response.status_code}")
                        break
                    else:
                        print(f"Unexpected status: {status_data['status']}")
                        break
                else:
                    print(f"Failed to get status. Status code: {status_response.status_code}")
                    break
        else:
            print(f"Error {response.status_code}: {response.text}")

# Step 4: Image to Video Animation
import requests
import time
import os
import base64
import tkinter as tk
from tkinter import filedialog, simpledialog
from tqdm import tqdm
from dotenv import load_dotenv

# Load API Key from .env file (Optional, or replace with your actual key)
load_dotenv()
API_KEY = os.getenv("API_KEY") or "14bdf4a1dd0964f1092bf2f24a10aeb9b"

# API Endpoints
GENERATE_URL = "https://api.aivideoapi.com/runway/generate/image"
STATUS_URL = "https://api.aivideoapi.com/status?uuid="  # Updated status endpoint

def select_image(scene_number):
    """Open file dialog to select an image for a specific scene."""
    try:
        root = tk.Tk()
        root.withdraw()

        # Force the file dialog to pop up on top of all windows
        root.lift()  # Bring the root window to the top
        root.attributes('-topmost', True)  # Make the root window stay on top
        root.after_idle(root.attributes, '-topmost', False)  # Allow other windows to regain focus

        print("Opening file dialog...")  # Debug statement
        file_path = filedialog.askopenfilename(
            title=f"Select an image for Scene {scene_number}",
            filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.webp")]
        )
        if not file_path:
            print(f" No file selected for Scene {scene_number}.")
            return None
        print(f"Selected file: {file_path}")  # Debug statement
        return file_path
    except Exception as e:
        print(f" Error opening file dialog: {e}")
        return None

def encode_image(image_path):
    """Convert image to base64."""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

def generate_video(image_path, text_prompt):
    """Send request to generate video and return UUID."""
    base64_image = encode_image(image_path)
    
    payload = {
        "img_prompt": f"data:image/jpeg;base64,{base64_image}",
        "text_prompt": text_prompt,
        "model": "gen3",
        "image_as_end_frame": False,
        "flip": False,
        "motion": 5,
        "seed": 0,
        "callback_url": "",
        "time": 5
    }

    headers = {"accept": "application/json", "content-type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    print(" Generating video... Please wait.")
    try:
        response = requests.post(GENERATE_URL, headers=headers, json=payload, timeout=30)  # 30-second timeout
        response.raise_for_status()  # Raise an exception for HTTP errors
        response_data = response.json()
        uuid = response_data.get("uuid")
        if uuid:
            print(f" Task submitted successfully. UUID: {uuid}")
            return uuid
        else:
            print(" No UUID found in the response.")
            return None
    except requests.exceptions.RequestException as e:
        print(f" Error generating video: {e}")
        return None

def check_video_status(uuid):
    """Check the status of the video until it's ready."""
    headers = {"accept": "application/json", "Authorization": f"Bearer {API_KEY}"}
    
    while True:
        try:
            print(f" Checking status for UUID: {uuid}...")  # Debug statement
            response = requests.get(f"{STATUS_URL}{uuid}", headers=headers, timeout=30)  # 30-second timeout
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Debug: Print the raw response
            print("Raw API Response:", response.text)
            
            status_data = response.json()
            print(" Task Status:", status_data)
            
            if status_data.get("status") == "success":  # Updated status check
                print("Video is ready! Downloading now...")
                return status_data.get("url")  # Return the video URL
            elif status_data.get("status") in ["failed", "error"]:
                print("Task failed. Check API logs for details.")
                return None
            
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None
        
        print("Waiting for 20 seconds before checking again...")
        time.sleep(20)

def download_video(video_url, output_path):
    """Download video from URL and save it to the system."""
    print(f"⬇Downloading video to {output_path}...")

    video_response = requests.get(video_url, stream=True)
    if video_response.status_code == 200:
        total_size = int(video_response.headers.get('content-length', 0))
        with open(output_path, "wb") as file, tqdm(
            desc=" Downloading",
            total=total_size,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for chunk in video_response.iter_content(1024):
                file.write(chunk)
                bar.update(len(chunk))
        print("\nVideo downloaded successfully!")
    else:
        print(f"Error downloading video: {video_response.text}")

def extract_video_prompts(story_output, num_scenes):
    """Extract video prompts from the Gemini story output."""
    video_prompts = []
    scenes = story_output.split("---")
    for i, scene in enumerate(scenes):
        if i >= num_scenes:
            break  # Stop after extracting the required number of scenes
        if "Video Prompt:" in scene:
            # Extract the video prompt for the scene
            video_prompt = scene.split("Video Prompt:")[1].strip()
            video_prompts.append(video_prompt)
    return video_prompts
def process_scene(scene_number, video_prompt):
    """Process a single scene: Select image, generate video, and download it."""
    print(f"\n=== Processing Scene {scene_number} ===")

    # Step 1: Select an image for the scene
    try:
        image_path = select_image(scene_number)
        if not image_path:
            print(f" No image selected for Scene {scene_number}. Skipping.")
            return
    except Exception as e:
        print(f" Error selecting image for Scene {scene_number}: {e}")
        return

    # Step 2: Generate Video & Get UUID
    try:
        print(f" Generating video for Scene {scene_number}...")
        uuid = generate_video(image_path, video_prompt)
        if not uuid:
            print(f" Failed to generate video for Scene {scene_number}. Skipping.")
            return
    except Exception as e:
        print(f" Error generating video for Scene {scene_number}: {e}")
        return

    # Step 3: Check Status & Get Video URL
    try:
        print(f" Checking video status for Scene {scene_number}...")
        video_url = check_video_status(uuid)
        if not video_url:
            print(f" Failed to get video URL for Scene {scene_number}. Skipping.")
            return
    except Exception as e:
        print(f" Error checking video status for Scene {scene_number}: {e}")
        return

    # Step 4: Download Video Automatically
    try:
        output_path = os.path.join(os.path.expanduser("~"), "Downloads", f"scene_{scene_number}_video_{uuid}.mp4")
        print(f"⬇Downloading video for Scene {scene_number} to {output_path}...")
        download_video(video_url, output_path)
    except Exception as e:
        print(f"Error downloading video for Scene {scene_number}: {e}")
        return

    print(f"Scene {scene_number} processed successfully!")

def generate_videos_from_story(story_output):
    """Generate videos for each scene using the story output."""
    # Ask the user for the total number of scenes to generate
    while True:
        try:
            num_scenes = int(input("\nEnter the total number of scenes to generate: ").strip())
            if num_scenes > 0:
                break
            else:
                print("Please enter a valid number greater than 0.")
        except ValueError:
            print("Invalid input! Please enter a valid number.")

    # Extract video prompts for the specified number of scenes
    video_prompts = extract_video_prompts(story_output, num_scenes)
    if not video_prompts:
        print("No video prompts found in the story output.")
        return

    # Process each scene
    for scene_number, video_prompt in enumerate(video_prompts, start=1):
        process_scene(scene_number, video_prompt)

    print("\n All scenes processed successfully!")

# Step 5: Merge Videos and Audio using FFmpeg
import subprocess
import uuid
from datetime import datetime

def generate_unique_id():
    """Generate a unique ID for output files."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"{timestamp}_{unique_id}"

def run_ffmpeg_command(command):
    """Run an FFmpeg command and handle errors."""
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"FFmpeg output: {result.stderr}")  # FFmpeg outputs to stderr even for successful operations
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e.stderr}")
        return False

def merge_videos_and_audio(video_files, audio_file, output_directory):
    """
    Merge multiple videos and overlay audio using FFmpeg.
    :param video_files: List of paths to video files.
    :param audio_file: Path to the audio file.
    :param output_directory: Directory to save the final output.
    :return: Path to the final merged video.
    """
    try:
        unique_id = generate_unique_id()
        output_video_path = os.path.join(output_directory, f"merged_video_{unique_id}.mp4")
        normalized_audio_path = os.path.join(output_directory, f"normalized_audio_{unique_id}.wav")
        video_list_path = os.path.join(output_directory, f"video_list_{unique_id}.txt")
        final_output_path = os.path.join(output_directory, f"final_output_{unique_id}.mp4")

        # Create a text file with the list of video files
        with open(video_list_path, "w") as f:
            for video in video_files:
                f.write(f"file '{os.path.abspath(video)}'\n")

        # Step 1: Concatenate videos
        concat_command = [
            'ffmpeg', '-f', 'concat', '-safe', '0', '-i', video_list_path,
            '-c', 'copy', '-y', output_video_path
        ]
        if not run_ffmpeg_command(concat_command):
            raise Exception("Failed to merge videos")
        print("Videos merged successfully")

        # Step 2: Normalize audio
        audio_command = [
            'ffmpeg', '-i', audio_file, '-af', 'volume=10.0,loudnorm=I=-16:TP=-1.5:LRA=11',
            '-ar', '44100', '-ac', '2', '-y', normalized_audio_path
        ]
        if not run_ffmpeg_command(audio_command):
            raise Exception("Failed to normalize audio")
        print("Audio normalized successfully")

        # Step 3: Merge video and audio
        merge_command = [
            'ffmpeg', '-i', output_video_path, '-i', normalized_audio_path,
            '-c:v', 'copy', '-c:a', 'aac', '-b:a', '384k',
            '-map', '0:v:0', '-map', '1:a:0', '-shortest', '-y', final_output_path
        ]
        if not run_ffmpeg_command(merge_command):
            raise Exception("Failed to merge video and audio")
        print("Video and audio merged successfully")

        # Clean up temporary files
        for file in [video_list_path, output_video_path, normalized_audio_path]:
            if os.path.exists(file):
                os.remove(file)

        print(f"Final video saved to: {final_output_path}")
        return final_output_path
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

import sys
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    # Receive arguments from route.ts
    if len(sys.argv) < 2:
        logging.error("Missing required arguments.")
        return

    step = sys.argv[1]  # The step (e.g., "generate-story", "generate-voiceover")
    args = sys.argv[2:]  # The additional parameters

    logging.debug(f"Received step: {step}")
    logging.debug(f"Arguments: {args}")

    if step == "generate-story":
        if len(args) < 1:
            logging.error("Missing prompt for story generation.")
            return

        prompt = args[0]
        logging.debug(f"Generating story with prompt: {prompt}")
        story_output = generate_story_and_prompts(prompt)
        
        if story_output:
            logging.info("\nStory generated successfully.")
            logging.info(story_output)
        else:
            logging.error("Failed to generate the story.")

    elif step == "generate-voiceover":
        if len(args) < 1:
            logging.error("Missing voice selection.")
            return

        voice = args[0]
        logging.debug(f"Generating voiceover with voice: {voice}")
        story_text = "This is a sample story for testing voiceover."  # Use test text for now
        audio_file = generate_voiceover(story_text)

        if audio_file:
            logging.info(f"Voiceover generated: {audio_file}")
        else:
            logging.error("Failed to generate voiceover.")

    elif step == "generate-images":
        if len(args) < 3:
            logging.error("Missing parameters for image generation.")
            return

        scenes = int(args[0])
        images = int(args[1])
        style = args[2]

        logging.debug(f" Generating {images} images for {scenes} scenes with style {style}")
        generate_images(story_output)

    elif step == "generate-video":
        logging.debug(" Generating video from images...")
        generate_videos_from_story(story_output)

    elif step == "merge":
        if len(args) < 3:
            logging.error(" Missing parameters for merging.")
            return

        audio = args[0]
        video = args[1]
        output_file = args[2]

        logging.debug(f" Merging {audio} and {video} into {output_file}")
        final_output = merge_videos_and_audio([video], audio, output_file)

        if final_output:
            logging.info(f"Merged video saved to {final_output}")
        else:
            logging.error(" Failed to merge videos and audio.")

if __name__ == "__main__":
    main()