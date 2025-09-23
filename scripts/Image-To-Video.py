import requests
import time
import json
import os
import base64
import tkinter as tk
from tkinter import filedialog, simpledialog
from dotenv import load_dotenv

# API Endpoints
GENERATE_URL = "https://api.aivideoapi.com/runway/generate/image"
STATUS_URL = "https://api.aivideoapi.com/runway/status/"
DOWNLOAD_URL = "https://api.aivideoapi.com/runway/download/"

#Load environment variables
load_dotenv()

#Read API key from env
API_KEY = os.getenv("AIVIDEO_API_KEY")

# Function to select an image
def select_image():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    file_path = filedialog.askopenfilename(title="Select an image", filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.webp")])
    return file_path

# Function to encode image as base64
def encode_image(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")

# Function to get text prompt from user
def get_text_prompt():
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    return simpledialog.askstring("Input", "Enter a text prompt for the video:")

# Step 1: Let the user select an image
image_path = select_image()
if not image_path:
    print(" No image selected. Exiting.")
    exit()

# Step 2: Get text prompt from user
text_prompt = get_text_prompt()
if not text_prompt:
    print(" No text prompt entered. Exiting.")
    exit()

# Convert image to Base64
base64_image = encode_image(image_path)

# Step 3: Send Request to Generate Video
payload = {
    "img_prompt": f"data:image/jpeg;base64,{base64_image}",
    "text_prompt": text_prompt,
    "model": "gen3",
    "image_as_end_frame": False,
    "flip": False,
    "motion": 5,   # Default motion intensity
    "seed": 0,      # Default seed
    "callback_url": "",
    "time": 10      # Default video time (10 seconds)
}

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

print(" Generating video... Please wait.")
response = requests.post(GENERATE_URL, headers=headers, json=payload)

if response.status_code != 200:
    print(f" Error: {response.text}")
    exit()

response_data = response.json()
uuid = response_data.get("uuid")

if not uuid:
    print(" Failed to get UUID from response. Exiting.")
    exit()

print(f" Task submitted successfully. UUID: {uuid}")

# Step 4: Check Status and Wait for Video
max_retries = 10  # Number of times to check
video_url = None

for attempt in range(max_retries):
    try:
        status_response = requests.get(f"{STATUS_URL}{uuid}", headers=headers)
        
        if status_response.status_code != 200 or not status_response.text.strip():
            print(f" No valid response, retrying in 10s... (Attempt {attempt+1}/{max_retries})")
            time.sleep(10)
            continue
        
        status_data = status_response.json()
        status = status_data.get("status")
        
        if status == "completed":
            print("Video is ready for download!")
            video_url = status_data.get("video_url")
            break
        elif status == "failed":
            print("Video generation failed.")
            exit()
        else:
            print(f"Processing... (Attempt {attempt+1}/{max_retries})")
    except json.JSONDecodeError:
        print("Error decoding JSON response, retrying in 10s...")
    
    time.sleep(10)

if not video_url:
    print("Video not processed in time. Try again later.")
    exit()

# Step 5: Download the Video
output_path = os.path.join(os.path.expanduser("~"), "Downloads", f"generated_video_{uuid}.mp4")

print(f"⬇Downloading video to {output_path}...")
video_response = requests.get(video_url, stream=True)

if video_response.status_code == 200:
    with open(output_path, "wb") as file:
        for chunk in video_response.iter_content(1024):
            file.write(chunk)
    print("Video downloaded successfully!")
else:
    print(f"Error downloading video: {video_response.text}")
