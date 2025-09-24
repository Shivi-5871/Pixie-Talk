# backend/app.py
from unittest import result
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
from pydub import AudioSegment
import uuid
import subprocess
from dotenv import load_dotenv
from bson.objectid import ObjectId
from deep_translator import GoogleTranslator
from gtts import gTTS
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS
bcrypt = Bcrypt(app)

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["pixie-talk"]
users_collection = db["users"]

# Flask session configuration
app.secret_key = os.getenv("SESSION_SECRET")  # Required for sessions

# Define static and scripts folders
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, "static")
SCRIPTS_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "scripts"))

if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)


# -------------------------
# User Authentication Routes
# -------------------------

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        existing_user = users_collection.find_one({"username": username})
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = {
            "username": username,
            "password": hashed_password,
            "images": []  # Initialize with an empty images array
        }
        user_id = users_collection.insert_one(new_user).inserted_id

        session["user_id"] = str(user_id)  # Store user ID in session

        return jsonify({"message": "User registered successfully", "userId": str(user_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid username or password"}), 401

        session["user_id"] = str(user["_id"])  # Store user ID in session

        return jsonify({"message": "Login successful", "userId": str(user["_id"])}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop("user_id", None)  # Remove user ID from session
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    user_id = session.get("user_id")
    if user_id:
        return jsonify({"isAuthenticated": True, "user": {"id": user_id}})
    return jsonify({"isAuthenticated": False})


# -------------------------
# Text-to-Speech API
# -------------------------


# BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5000")
# @app.route('/api/text-to-speech', methods=['POST'])
# def text_to_speech():
#     data = request.form
#     print("DEBUG - form data:", dict(data))
#     user_id = data.get("user_id")  # Get user ID from request
#     text = data.get("text")
#     src_lang = data.get("src_lang", "en")
#     dest_lang = data.get("dest_lang", "en")

#     if not text or not user_id:
#         return jsonify({"error": "Missing required fields"}), 400

#     try:
#         if src_lang != dest_lang:
#             text = GoogleTranslator(source=src_lang, target=dest_lang).translate(text)

#         audio_filename = f"{uuid.uuid4().hex}.mp3"
#         audio_path = os.path.join(STATIC_FOLDER, audio_filename)
#         tts = gTTS(text, lang=dest_lang)
#         tts.save(audio_path)

#         audio_url = f"{BASE_URL}/static/{audio_filename}"

#         # Save to user's history in MongoDB
#         user = users_collection.find_one({"_id": ObjectId(user_id)})
#         if user:
#             users_collection.update_one(
#                 {"_id": ObjectId(user_id)},
#                 {"$push": {
#                     "ttsHistory": {
#                         "text": text,
#                         "srcLang": src_lang,
#                         "destLang": dest_lang,
#                         "audioUrl": audio_url,
#                         "createdAt": datetime.utcnow()
#                     }
#                 }}
#             )

#         return jsonify({"audioUrl": audio_url})
#     except Exception as e:
#         import traceback; traceback.print_exc() 
#         return jsonify({"error": str(e)}), 500




BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5000")

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.form
    print("DEBUG - form data:", dict(data))
    user_id = data.get("user_id")  # Get user ID from request
    text = data.get("text")
    src_lang = data.get("src_lang", "en")
    dest_lang = data.get("dest_lang", "en")

    if not text or not user_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # ✅ only keep supported gTTS/GoogleTranslator codes
        SUPPORTED_LANGS = ["en", "es", "fr", "de", "hi", "ur", "zh", "ja", "ko", "it", "pt", "ru", "ar"]

        if dest_lang not in SUPPORTED_LANGS:
            return jsonify({"error": f"Language {dest_lang} not supported"}), 400

        if src_lang != dest_lang:
            text = GoogleTranslator(source=src_lang, target=dest_lang).translate(text)

        audio_filename = f"{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(STATIC_FOLDER, audio_filename)
        tts = gTTS(text, lang=dest_lang)
        tts.save(audio_path)

        # ✅ use correct backend URL (not localhost in production)
        audio_url = f"{BASE_URL}/static/{audio_filename}"

        # Save to user's history in MongoDB
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$push": {
                    "ttsHistory": {
                        "text": text,
                        "srcLang": src_lang,
                        "destLang": dest_lang,
                        "audioUrl": audio_url,
                        "createdAt": datetime.utcnow()
                    }
                }}
            )

        return jsonify({"audioUrl": audio_url})
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500




# -------------------------
# Speech-to-Text API
# -------------------------

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        if 'audio' not in request.files or 'user_id' not in request.form:
            return jsonify({"error": "No audio file or user ID provided"}), 400
        
        user_id = request.form['user_id']
        audio_file = request.files['audio']

        # Secure filename and save audio file
        filename = secure_filename(audio_file.filename)
        file_ext = filename.rsplit(".", 1)[-1].lower()
        new_filename = f"{uuid.uuid4()}.{file_ext}"  # Generate a unique filename
        audio_path = os.path.join(STATIC_FOLDER, new_filename)
        audio_file.save(audio_path)

        # Convert audio to WAV format
        try:
            audio = AudioSegment.from_file(audio_path)
            wav_path = os.path.join(STATIC_FOLDER, f"{uuid.uuid4()}.wav")
            audio.export(wav_path, format="wav")
            os.remove(audio_path)  # Delete original file
            audio_path = wav_path
        except Exception as e:
            return jsonify({"error": "Audio conversion failed."}), 500

        # Process speech-to-text
        output_file = os.path.join(STATIC_FOLDER, f"{uuid.uuid4()}.txt")
        script_path = os.path.join(SCRIPTS_FOLDER, "Speech-To-Text.py")

        # result = subprocess.run(
        #     ["python", script_path, output_file, audio_path],
        #     check=True,
        #     capture_output=True,
        #     text=True,
        # )


        result = subprocess.run(
            ["python", script_path, output_file, audio_path],
            capture_output=True,
            text=True
            )
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        print("RETURN CODE:", result.returncode)

        if result.returncode != 0:
            return jsonify({"error": result.stderr.strip()}), 500

        with open(output_file, "r") as file:
            transcription = file.read()

        # Cleanup
        os.remove(audio_path)
        if os.path.exists(output_file):
            os.remove(output_file)

        # Store transcription in MongoDB
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {
                "audioTranscriptions": {
                    "audioUrl": audio_path,  # Store the correct WAV file path
                    "text": transcription,
                    "createdAt": datetime.utcnow()
                }
            }}
        )

        return jsonify({"text": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 500








# -------------------------
# Image Storage Route
# -------------------------

@app.route('/api/save-image', methods=['POST'])
def save_image():
    try:
        data = request.json
        image_url = data.get("imageUrl")
        prompt = data.get("prompt")
        style = data.get("style")
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Append the new image data to the user's images array
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"images": {"url": image_url, "prompt": prompt, "style": style, "createdAt": request.json.get("createdAt")}}}
        )

        return jsonify({"message": "Image saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# -------------------------
# Voice Image Storage Route
# -------------------------
@app.route('/api/save_voice_images', methods=['POST'])
def save_voice_image():
    try:
        data = request.json
        image_url = data.get("imageUrl")
        prompt = data.get("prompt")
        style = data.get("style")
        user_id = data.get("userId")

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Append the new image data to the user's images array
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"voice_images": {"url": image_url, "prompt": prompt, "style": style, "createdAt": request.json.get("createdAt")}}}
        )

        return jsonify({"message": "Image saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -------------------------
# Fetch User Images
# -------------------------

@app.route('/api/get-images', methods=['GET'])
def get_images():
    try:
        user_id = request.args.get("userId")

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"images": 1, "_id": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"images": user.get("images", [])}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    



# -------------------------
# Video Storage Route
# -------------------------
@app.route('/api/save-video', methods=['POST'])
def save_video():
    try:
        data = request.json
        user_id = data.get("user_id")
        video_url = data.get("video_url")
        name = data.get("name")
        scenes = data.get("scenes", [])

        if not user_id or not video_url:
            return jsonify({"error": "Missing required fields"}), 400

        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {
                "videos": {
                    "url": video_url,
                    "name": name,
                    "scenes": scenes,
                    "createdAt": datetime.utcnow()
                }
            }}
        )

        return jsonify({"message": "Video saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# Serve Static Files
# -------------------------

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory(STATIC_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


# -------------------------
# Run the Server
# -------------------------

if __name__ == '__main__':
    app.run(debug=True, port=5000)