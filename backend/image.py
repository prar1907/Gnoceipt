from PIL import Image
from google import genai
import requests
client = genai.Client(api_key="AIzaSyCUTZd5LPEQ5pco1zJcS3avrjWlQSTISXw")

image = Image.open("image.webp")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[image, "Fetch all the items from this, and return the array and only the array to me no other text"])
import json
import re

def extract_items():
    # Extract the JSON part using regex
    match = re.search(r'```json\n(.*?)\n```', response.text, re.DOTALL)
    if match:
        json_str = match.group(1).strip()  # Extract and clean JSON string
        return json.loads(json_str)  # Convert to Python list
    return []
resp=requests.post("http://localhost:5001/addReceipt",json={"items":extract_items()})
print(resp.text)