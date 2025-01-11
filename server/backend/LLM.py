import requests
import json

def get_response_from_llm(prompt):
    url = "http://localhost:11434/api/generate"

    headers = {
        'Content-Type': 'application/json',
    }

    conversation_history = []

    data = {
        "model": "llama3",
        "stream": False,
        "prompt": prompt,
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_text = response.text
        data = json.loads(response_text)
        actual_response = data["response"]
        conversation_history.append(actual_response)
        return actual_response
    else:
        print("Error:", response.status_code, response.text)
        return None

# Example usage:
if __name__ == "__main__":
    prompt = input("Enter The Question: ")
    response = get_response_from_llm(prompt)
    if response:
        print("Response:", response)
