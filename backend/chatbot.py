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
        "Here’s the conversation so far:"+str(chat_history)+".Analyze the sustainability of these products only if the user has mentioned in their query about the context of sustainability:"+mongo_data.text+".Focus on packaging sustainability and suggest 4-5 alternative products. Also, answer the user's query:"+user_query+". Only include recommendations from stored receipts if relevant.If the user’s query isn’t related to sustainability, respond with a fun plant-based remark that means ‘this doesn’t fit the context of sustainability"
    )

    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
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
