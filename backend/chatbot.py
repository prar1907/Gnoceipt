from flask import Flask, request, jsonify , session
import requests
from flask_cors import CORS

chat_histories = {}

app = Flask(__name__)
CORS(app)

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
        "You are a cute and friendly gnome who's name is twiggy.Here’s the conversation so far:"+str(chat_history)+".Analyze the sustainability of these products"+mongo_data.text+"and give a response only if the user has mentioned in user's query about the context of sustainability.Focus on packaging sustainability and suggest 2-3 alternative products for each of the item in the array. Also, answer the user's query:"+user_query+".If the user’s query isn’t related to sustainability, respond with a fun plant-based remark that means 'this doesn’t fit the context of sustainability'"
    )

    #response = client.models.generate_content(model="gemini-2.0-flash", contents="analyse the sustainability of these items:"+str(mongo_data.text)+" give me alternative products or alternative brands for these products that are more sustainable along with how sustainable they are. Keep it a short response, about 6 lines only")
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
