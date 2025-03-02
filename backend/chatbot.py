from flask import Flask, request, jsonify , session
import requests
chat_histories = {}

app = Flask(__name__)


API_KEY = "AIzaSyCUTZd5LPEQ5pco1zJcS3avrjWlQSTISXw"
from google import genai


@app.route("/ask-chatbot", methods=["POST"])
def ask_chatbot():
    user_data = request.json
    user_id = user_data.get("user_id", "default_user") 
    user_query = user_data.get("query", "")  # User's question
    
    # Prepare the payload for the Gemini API
    payload = {
        "query": user_query,
        "api_key": API_KEY
    }
    if user_id not in chat_histories:
        chat_histories[user_id] = []

    # Fetch past chat history
    chat_history = chat_histories[user_id]
    # Call the Gemini API
    #response = requests.post(GEMINI_API_URL, json=payload)
    #print(response.text)
    mongo_data=requests.get("http://127.0.0.1:5001/getReceipts")
    print(mongo_data.text)
    client = genai.Client(api_key=API_KEY)
    prompt = (
        "Here is the previous conversation: " + str(chat_history) +
        "\nNow, analyze the sustainability of these products: " + str(mongo_data.text) +
        ". query1: Explain the packaging sustainability, and suggest 4-5 alternative products. Also, answer the user's query: " + user_query +
        ". query2: Also, refer to the stored receipts for better recommendations: " + mongo_data.text
    )

    response = client.models.generate_content(model="gemini-2.0-flash", contents="keep the content short and if user query doesn't have the word sustainability answer only the user query part of it, not query1 and query2. But make sure user query is related to sustainability/sustainable/sustain/planet or anything to make this world a better place else say something funky and funny in a plant based way which means the same as I'm sorry but that doesn't seem right in the context of sustainability in a fun plant related chatbot way.given_prompt:"+prompt)
    print(response.text)
    if response:
        chatbot_response = response.text
        # Store conversation history
        chat_histories[user_id].append({"user": user_query, "chatbot": chatbot_response})
        return jsonify({"response": chatbot_response})
    else:
        return jsonify({"error": "Failed to get response from Gemini API"}), 500

if __name__ == "__main__":
    app.run(debug=True,port=5002)
