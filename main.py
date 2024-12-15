from flask import Flask , render_template , jsonify , request
from backend.LLM import get_response_from_llm




app = Flask(__name__)

@app.route("/")

def hello_world():
    return render_template("index.html") 

@app.route("/api", methods = ["GET","POST"])

def qa():

    if request.method == "POST":
        print(request.json)
        question = request.json.get("question")
        answer = get_response_from_llm(question)
        data = {
            "result": answer
        }
        print(answer)

        return jsonify(data)
        print(jsonify(data))
    
 
    return render_template("index.html")

app.run(debug=True,port=2006)