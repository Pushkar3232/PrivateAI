from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from backend.LLM import get_response_from_llm

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/", methods=["GET"])
def hello_world():
    return "Hello from Flask"  # Just a placeholder, React will handle frontend

@app.route("/api/data", methods=["POST"])  # Make sure the route matches your React code
def qa():
    if request.method == "POST":
        # Get the query sent from React
        question = request.json.get("query")


        print(question)
        
        # Get the response from the LLM function 
        answer = get_response_from_llm(question)
        
        # Prepare the data to send back to React
        data = {
            "response": answer
        }

        print(data)
        
        # Send the response back to React in JSON format
        return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)  
