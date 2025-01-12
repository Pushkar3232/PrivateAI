from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json  # Import json to parse the chunks if they are JSON strings
from backend.LLM import get_response_from_llm

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/", methods=["GET"])
def hello_world():
    return "Hello from Flask"  # Just a placeholder, React will handle frontend

@app.route("/api/data", methods=["POST"])
def qa():
    if request.method == "POST":
        question = request.json.get("query")
        print(f"Received question: {question}")
        
        # This function should return an iterable that yields chunks of response
        def generate_response():
            response = get_response_from_llm(question)
            for chunk in response:
                # Parse the chunk assuming it's a JSON string
                try:
                    # If chunk is a bytes object, decode it first
                    if isinstance(chunk, bytes):
                        chunk = chunk.decode("utf-8")
                    
                    # Convert the chunk to a dictionary if it is a JSON string
                    chunk_dict = json.loads(chunk)
                    
                    # Yield only the 'response' part of the chunk
                    yield chunk_dict.get("response", "")  # Default to empty string if 'response' key is missing
                except Exception as e:
                    print(f"Error parsing chunk: {e}")
                    yield ""  # Yield empty string in case of error

        # Return a streamed response
        return Response(generate_response(), content_type='text/plain;charset=utf-8')

if __name__ == "__main__":
    app.run(debug=True, port=5000)

