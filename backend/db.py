from flask import Flask, request, jsonify
from datetime import datetime
import json
import re
import os
from PIL import Image
from google import genai
import requests
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["","*","null"]}})
# Configure upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Gemini API Client
client = genai.Client(api_key="AIzaSyCUTZd5LPEQ5pco1zJcS3avrjWlQSTISXw")

# MongoDB Connection
uri = "mongodb+srv://rajapuro:dbpass123@receipts.dbcam.mongodb.net/?retryWrites=true&w=majority&appName=receipts"
mongo = MongoClient(uri)
db = mongo.gnoceipt

# Endpoint to handle image upload and extract items
@app.route("/add", methods=["POST"])
def add_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
        
        # Save the uploaded file temporarily
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(file_path)
        print(file)
        # Open the image using PIL
        image = Image.open(file_path)

        # Send image to Gemini API for extraction
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[image, "Fetch all the items from this, and return the array and only the array to me no other text"]
        )
        print(response)
        # Extract JSON data using regex
        def extract_items():
            match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
            if match:
                json_str = match.group(1).strip()
                return json.loads(json_str)
            return []

        items = extract_items()
        
        if not items:
            return jsonify({"error": "Failed to extract items from image"}), 500
        response2 = client.models.generate_content(model="gemini-2.0-flash", contents="analyse the sustainability of these items:"+str(items)+" and give me a score out of 25 on how sustainable they are on an average. Only return the number(score) nothing else.")
        print(int(response2.text))
        item=int(response2.text)
        # Send extracted items to MongoDB
        resp = requests.post("http://localhost:5001/addReceipt", json={"items": items,"score":item})
        print(resp.text)
        #resp.headers.add("Access-Control-Allow-Origin", "*")
        #resp.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        #resp.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return resp.json(), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to Add User
@app.route("/addUser", methods=["POST"])
def add_user():
    try:
        data = request.json
        user = {
            "userId": data["userId"],
            "userScore": data["userScore"],
            "date": datetime.now()
        }
        print(data)
        db.users.insert_one(user)
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to Fetch Users
@app.route("/getUsers", methods=["GET"])
def get_users():
    try:
        users = list(db.users.find({}, {"_id": 0}))
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to Add Receipt
@app.route("/addReceipt", methods=["POST"])
def add_receipt():
    print("inhere")
    try:
        data = request.json
        receipt = {
            "items": data["items"],
            "score": data["score"],
            "date": datetime.now()
        }
        print(data)
        db.receipts.insert_one(receipt)
        return jsonify({"message": "Receipt added successfully"}), 201
    except Exception as e:
        print("error only")
        return jsonify({"error": str(e)}), 500

# API Endpoint to Fetch Receipts
@app.route("/getReceipts", methods=["GET"])
def get_receipts():
    try:
        receipt= db.receipts.find_one(sort=[("date", -1)])
        #receipt = db.receipts.find_one({}, {"_id": 0, "items": 1})
        if receipt:
            return jsonify(receipt["items"]), 200
        return jsonify({"message": "No receipts found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/getScore", methods=["GET"])
def get_score():
    try:
        # Fetch the most recent receipt sorted by the "date" field (in descending order)
        receipt = db.receipts.find_one({}, {"_id": 0, "items": 1, "score": 1, "date": 1}, sort=[("date", -1)])
        
        # Debugging: Print the receipt to check the data structure
        print(receipt)
        
        if receipt:
            # Extract the score
            score = receipt.get("score", 0)
            return jsonify({"score": score}), 200
        return jsonify({"message": "No receipts found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Start Server
if __name__ == "__main__":
    app.run(debug=True, port=5001)
