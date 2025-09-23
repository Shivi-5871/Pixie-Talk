import requests
import json
import time
import os
from datetime import datetime
import sys
from dotenv import load_dotenv

#Load environment variables
load_dotenv()

#Read from .env/.env.local
API_KEY = os.getenv("MONSTER_API_KEY")
OUTPUT_DIR = "./images"  # Directory to save the images

def generate_image(prompt):
    """Generate an image from a prompt using MonsterAPI and save it to the output directory."""
    
    url = "https://api.monsterapi.ai/v1/generate/txt2img"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": f"Bearer {API_KEY}"
    }

    payload = {
        "beam_size": 1,
        "max_length": 256,
        "prompt": prompt,
        "repetition_penalty": 1.2,
        "temp": 0.98,
        "top_k": 40,
        "top_p": 1
    }

    # Step 1: Make the API request
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        response_data = json.loads(response.text)
        process_id = response_data['process_id']
        status_url = response_data['status_url']

        # Step 2: Poll the status URL until the process completes
        while True:
            status_response = requests.get(status_url, headers=headers)
            if status_response.status_code == 200:
                status_data = json.loads(status_response.text)

                if status_data['status'] == 'IN_PROGRESS':
                    time.sleep(3)  # Wait before checking again

                elif status_data['status'] == 'COMPLETED':  
                    if 'result' in status_data and 'output' in status_data['result']:
                        image_url = status_data['result']['output'][0]

                        # Step 3: Download the image
                        image_response = requests.get(image_url)

                        if image_response.status_code == 200:
                            # Ensure output directory exists
                            os.makedirs(OUTPUT_DIR, exist_ok=True)

                            # Generate unique filename with timestamp
                            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                            image_filename = f'generated_image_{timestamp}.png'
                            image_path = os.path.join(OUTPUT_DIR, image_filename)

                            # Save the image
                            with open(image_path, 'wb') as f:
                                f.write(image_response.content)

                            print(f"Image saved as: {image_path}")
                            return image_path
                        else:
                            print(f" Failed to download image: {image_response.status_code}")
                            sys.exit(1)
                    break
                else:
                    print(f" Unexpected status: {status_data['status']}")
                    sys.exit(1)
            else:
                print(f" Failed to get status. Status code: {status_response.status_code}")
                sys.exit(1)
    else:
        print(f" Error {response.status_code}: {response.text}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        #Accept prompt as a command-line argument
        prompt = sys.argv[1]

        # Generate and save the image
        generate_image(prompt)

    except IndexError:
        print(" Usage: python image_generation.py <PROMPT>")
        sys.exit(1)
    except Exception as e:
        print(f" Error: {str(e)}")
        sys.exit(1)
