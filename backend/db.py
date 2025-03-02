import requests
import json

def process_receipt_image(image_path):
    # OCRSpace API url
    OCRSpace_url = "https://api.ocr.space/parse/image"
    # OCRSpace API key
    OCRSpace_key = 'K83631789388957'

    with open(image_path, 'rb') as image_file: 
        # files to send to the API
        files = {'file': image_file}
        
        # data to send in request to the API 
        data = {
            'apikey': OCRSpace_key,
            'language': 'eng'
        }

        response = requests.post(OCRSpace_url, files=files, data=data)

        if response.status_code == 200:
            result = response.json()

            if result['OCRExitCode'] == 1:
                extracted_text = result['ParsedResults'][0]['ParsedText']
                return extracted_text
            else:
                print("Error: OCR processing failed.")
                return None
        else:
            print(f"Error: Received {response.status_code} from OCR API.")
            return None
        
image_path = "../test_images/receipt.jpg"
extracted_text = process_receipt_image(image_path)
if extracted_text:
    print(extracted_text)
else:
    print("No text extracted")