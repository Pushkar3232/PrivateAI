from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from backend.LLM import get_response_from_llm

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def hello_world():
    return PlainTextResponse("Hello from FastAPI")

@app.post("/api/data")
async def qa(request: Request):
    body = await request.json()
    question = body.get("prompt")
    print(f"Received question: {question}")

    # Generator to yield chunks of response
    def generate_response():
        response = get_response_from_llm(question)
        for chunk in response:
            try:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8")
                chunk_dict = json.loads(chunk)
                yield chunk_dict.get("response", "") + " "  # Yield the response part
            except Exception as e:
                print(f"Error parsing chunk: {e}")
                yield ""

    # Use a low-level response to prevent buffering
    return StreamingResponse(generate_response(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
