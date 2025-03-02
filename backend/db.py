from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)


from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://rajapuro:dbpass123@receipts.dbcam.mongodb.net/?retryWrites=true&w=majority&appName=receipts"

# Create a new client and connect to the server
mongo = MongoClient(uri)
db = mongo.gnoceipt
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
        mongo.db.users.insert_one(user)
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to Fetch Users
@app.route("/getUsers", methods=["GET"])
def get_users():
    try:
        users = list(mongo.db.users.find({}, {"_id": 0}))  # Exclude MongoDB's default _id
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to Add Receipt
@app.route("/addReceipt", methods=["POST"])
def add_receipt():
    try:
        data = request.json
        receipt = {
            "items": data["items"],
            "store_name": data["store_name"],
            "date": datetime.utcnow()
        }
        mongo.db.receipts.insert_one(receipt)
        return jsonify({"message": "Receipt added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# use a database named "myDatabase"


# use a collection named "recipes"
my_collection = db["receipts"]
# API Endpoint to Fetch Receipts
@app.route("/getReceipts", methods=["GET"])
def get_receipts():
    try:
        my_doc = my_collection.find_one()
        print(my_doc)
        return jsonify(my_doc['items']), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Start Server
if __name__ == "__main__":
    app.run(debug=True, port=5001)
