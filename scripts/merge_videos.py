import subprocess
import json
import uuid
import os
import sys
from datetime import datetime

def generate_unique_id():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"{timestamp}_{unique_id}"

def run_ffmpeg_command(command):
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"FFmpeg output: {result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e.stderr}", file=sys.stderr)
        return False

def merge_videos_and_audio(video_files, audio_file, output_directory):
    try:
        unique_id = generate_unique_id()
        output_video_path = os.path.join(output_directory, f"merged_video_{unique_id}.mp4")
        normalized_audio_path = os.path.join(output_directory, f"normalized_audio_{unique_id}.wav")
        video_list_path = os.path.join(output_directory, f"video_list_{unique_id}.txt")
        final_output_path = os.path.join(output_directory, f"final_output_{unique_id}.mp4")

        with open(video_list_path, "w") as f:
            for video in video_files:
                f.write(f"file '{os.path.abspath(video)}'\n")

        concat_command = [
            'ffmpeg', '-f', 'concat', '-safe', '0', '-i', video_list_path,
            '-c', 'copy', '-y', output_video_path
        ]
        if not run_ffmpeg_command(concat_command):
            raise Exception("Failed to merge videos")
        print("Videos merged successfully")

        audio_command = [
            'ffmpeg', '-i', audio_file, '-af', 'volume=10.0,loudnorm=I=-16:TP=-1.5:LRA=11',
            '-ar', '44100', '-ac', '2', '-y', normalized_audio_path
        ]
        if not run_ffmpeg_command(audio_command):
            raise Exception("Failed to normalize audio")
        print("Audio normalized successfully")

        merge_command = [
            'ffmpeg', '-i', output_video_path, '-i', normalized_audio_path,
            '-c:v', 'copy', '-c:a', 'aac', '-b:a', '384k',
            '-map', '0:v:0', '-map', '1:a:0', '-shortest', '-y', final_output_path
        ]
        if not run_ffmpeg_command(merge_command):
            raise Exception("Failed to merge video and audio")
        print("Video and audio merged successfully")

        for file in [video_list_path, output_video_path, normalized_audio_path]:
            if os.path.exists(file):
                os.remove(file)

        print(f"Final video saved to: {final_output_path}")
        return final_output_path
    except Exception as e:
        print(f"An error occurred: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python merge_videos.py <video_files_json> <audio_file> <output_directory>", file=sys.stderr)
        sys.exit(1)

    video_files = json.loads(sys.argv[1])
    audio_file = sys.argv[2]
    output_directory = sys.argv[3]

    result = merge_videos_and_audio(video_files, audio_file, output_directory)
    if result:
        print(result)
    else:
        sys.exit(1)