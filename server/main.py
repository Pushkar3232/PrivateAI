from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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

    if "@image" in question:
        from backend.genimage.image import createImg

        # Call createImg() and serve the generated image
        createImg(question)  # Generate the image
        image_path = "C:/Users/Pushkar/Projects/PrivateAI/server/generated_image.png"
        return FileResponse(image_path, media_type="image/png")

    # Existing logic for text response
    def generate_response():
        response = get_response_from_llm(question)
        buffer = ""
        for chunk in response:
            try:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8")
                chunk_dict = json.loads(chunk)
                chunk_text = chunk_dict.get("response", "")
                combined_text = buffer + chunk_text
                words = combined_text.split(" ")
                for word in words[:-1]:
                    yield word + " "
                buffer = words[-1]
                
            except Exception as e:
                print(f"Error processing chunk: {e}")
                yield ""

        if buffer:
            yield buffer

    return StreamingResponse(generate_response(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
