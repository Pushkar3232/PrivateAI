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
        "stream" : True,
        "prompt": prompt,
    }

    response = requests.post(url, headers=headers, data=json.dumps(data),stream = True)

    # if response.status_code == 200:
    #     response_text = response.text
    #     data = json.loads(response_text)
    #     actual_response = data["response"]
    #     conversation_history.append(actual_response)
    #     return actual_response

    if response.status_code == 200:
        try:
            # for chunk in response.iter_lines():
            #     if chunk:
            #         try:
            #             response_data = json.loads(chunk.decode('utf-8'))
            #             actual_response = response_data.get("response", "")
            #             conversation_history.append(actual_response)
            #             print(actual_response)
            #             return actual_response
                    
            #         except json.JSONDecodeError as e:
            #             print(f"Error decoding JSON: {e}")
            return response

        except Exception as e:
            print(e)
        
    else:
        print("Error:", response.status_code, response.text)
        return None

# Example usage:
if __name__ == "__main__":
    prompt = input("Enter The Question: ")
    response = get_response_from_llm(prompt)
    if response:
        print("Response:", response)
