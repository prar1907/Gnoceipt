import streamlit as st
import requests

# Set backend API URL
API_URL = "http://127.0.0.1:5000/ask-chatbot"

# Initialize chat history in Streamlit's session state
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

st.title("♻️ Sustainable Shopping Chatbot")

# Sidebar for user settings
#st.sidebar.header("User Settings")
#user_id = st.sidebar.text_input("Enter User ID:", value="user_123")

for message in st.session_state.chat_history:
    st.write(f"**You:** {message['user']}")
    st.write(f"**Chatbot:** {message['chatbot']}\n")

# User input field
user_query = st.text_input("Ask a question:")


# Send query on button press
if st.button("Send"):
    if user_query:
        # Call Flask API
        response = requests.post(API_URL, json={"query": user_query})
        
        if response.status_code == 200:
            chatbot_response = response.json().get("response", "No response received.")
            # Append to session state chat history
            st.session_state.chat_history.append({"user": user_query, "chatbot": chatbot_response})
            st.rerun()  # Refresh UI to show new message
        else:
            st.error("Error communicating with chatbot.")

# Button to clear chat
#"""if st.button("Clear Chat"):
    #st.session_state.chat_history = []
    #st.rerun()"""
