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

    # Generator to yield complete words
    def generate_response():
        response = get_response_from_llm(question)
        buffer = ""  # Buffer to handle word continuity

        for chunk in response:
            try:
                # Decode chunk if it's in bytes
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8")

                # Parse JSON string into a dictionary
                chunk_dict = json.loads(chunk)
                chunk_text = chunk_dict.get("response", "")

                # Combine the buffer with the current chunk
                combined_text = buffer + chunk_text

                # Ensure words are yielded completely
                words = combined_text.split(" ")
                for word in words[:-1]:  # Yield all except the last word
                    yield word + " "
                
                # Keep the last word (it might be incomplete)
                buffer = words[-1]
            except Exception as e:
                print(f"Error processing chunk: {e}")
                yield ""

        # Yield any remaining text in the buffer
        if buffer:
            yield buffer

    # Return the streamed response
    return StreamingResponse(generate_response(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
