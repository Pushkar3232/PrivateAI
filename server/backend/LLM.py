import requests
import json

def get_response_from_llm(prompt):
    url = "http://localhost:11434/api/generate"


    headers = {
        'Content-Type': 'application/json',
    }

    conversation_history = []

    data = {
        "model": "deepseek-r1:1.5b",
        "stream" : True,
        "prompt": prompt,
    }

    response = requests.post(url, headers=headers, data=json.dumps(data),stream = True)


    if response.status_code == 200:
        try:
            return response

        except Exception as e:
            print(e)
        
    else:
        print("Error:", response.status_code, response.text)
        return None
    
    print()

# Example usage:
if __name__ == "__main__":
    prompt = input("Enter The Question: ")
    response = get_response_from_llm(prompt)
    if response:
        print("Response:", response)
