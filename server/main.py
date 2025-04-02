from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, PlainTextResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import uuid
from datetime import datetime
from backend.LLM import get_response_from_llm
from backend.chat_store import get_all_chats

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHATS_DIR = "./chats"

# Database functions
def ensure_chats_dir():
    os.makedirs(CHATS_DIR, exist_ok=True)

def create_chat():
    ensure_chats_dir()
    chat_id = str(uuid.uuid4())
    chat_path = os.path.join(CHATS_DIR, f"{chat_id}.json")
    chat_data = {
        "id": chat_id,
        "created_at": datetime.now().isoformat(),
        "messages": []
    }
    with open(chat_path, 'w') as f:
        json.dump(chat_data, f, indent=2)
    return chat_id

def get_chat(chat_id: str):
    chat_path = os.path.join(CHATS_DIR, f"{chat_id}.json")
    if not os.path.exists(chat_path):
        return None
    with open(chat_path, 'r') as f:
        return json.load(f)

def add_message(chat_id: str, query: str, response: str):
    chat_path = os.path.join(CHATS_DIR, f"{chat_id}.json")
    if not os.path.exists(chat_path):
        return None
    with open(chat_path, 'r+') as f:
        chat_data = json.load(f)
        chat_data['messages'].append({
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })
        f.seek(0)
        json.dump(chat_data, f, indent=2)
        f.truncate()
    return True

# API endpoints
@app.get("/")
async def root():
    return PlainTextResponse("PrivateAI API")

@app.get("/api/chats")
async def list_chats():
    return get_all_chats()

@app.get("/api/chats/{chat_id}")
async def get_chat_endpoint(chat_id: str):
    chat_data = get_chat(chat_id)
    if not chat_data:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat_data

@app.post("/api/data")
async def handle_query(request: Request):
    body = await request.json()
    prompt = body.get("prompt")
    chat_id = body.get("chat_id")
    
    # Validate prompt
    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="Empty prompt")

    # Create chat only when first message is sent
    if not chat_id or not get_chat(chat_id):
        chat_id = create_chat()
    
    # Handle image generation
    if "@image" in prompt:
        from backend.genimage.image import createImg
        createImg(prompt)
        image_path = "generated_image.png"
        add_message(chat_id, prompt, image_path)
        return FileResponse(image_path, media_type="image/png")
    
    # Text response handling
    def generate():
        full_response = ""
        for chunk in get_response_from_llm(prompt):
            try:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8")
                chunk_dict = json.loads(chunk)
                text = chunk_dict.get("response", "")
                full_response += text
                yield text
            except Exception as e:
                print(f"Error processing chunk: {e}")
        
        # Save complete response to DB
        add_message(chat_id, prompt, full_response)

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)