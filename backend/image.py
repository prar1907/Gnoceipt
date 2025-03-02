from PIL import Image
from google import genai

client = genai.Client(api_key="AIzaSyCUTZd5LPEQ5pco1zJcS3avrjWlQSTISXw")

image = Image.open("image.webp")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[image, "Fetch all the items from this, and return the array and only the array to me no other text"])
print(response.text)