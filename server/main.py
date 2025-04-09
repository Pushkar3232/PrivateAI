from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse, PlainTextResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import re
import os
import uuid
from datetime import datetime
from backend.LLM import get_response_from_llm
from backend.chat_store import get_all_chats, create_chat, get_chat, add_message_to_chat
from backend.vector_db import vector_db
# from backend.genimage.image import createImg

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

# New endpoint for creating chats
@app.post("/api/chats")
async def create_chat_endpoint():
    chat_id = create_chat()
    return {"chat_id": chat_id}

# Modify the handle_query endpoint
@app.post("/api/data")
async def handle_query(request: Request):
    body = await request.json()
    prompt = body.get("prompt")
    chat_id = body.get("chat_id")
    model = body.get("model", "deepseek-r1:1.5b")
    
    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="Empty prompt")

    # Get semantic context from vector DB
    similar_messages = vector_db.query_messages(prompt,chat_id)
    vector_context = []
    for meta in similar_messages:
        chat_data = get_chat(meta["chat_id"])
        if chat_data and len(chat_data["messages"]) > meta["message_index"]:
            msg = chat_data["messages"][meta["message_index"]]
            vector_context.append(f"Previous conversation: {msg['query']}\nResponse: {msg['response']}")

    # Get current chat context
    chat_data = get_chat(chat_id) if chat_id else None
    messages = chat_data.get("messages", []) if chat_data else []
    current_context = "\n".join(
        [f"User: {msg['query']}\nAI: {msg['response']}" 
        for msg in messages[-2:]]
    )
    
    # if "@image" in prompt:


    # # Call createImg() and serve the generated image
    #     createImg(prompt)  # Generate the image
    #     image_path = "C:/Users/Pushkar/Projects/PrivateAI/server/generated_image.png"
    #     return FileResponse(image_path, media_type="image/png")
    
    # Create chat if 2none exists
    if not chat_id or not chat_data:
        chat_id = create_chat()
    
    # Create final prompt with history
    # Join the context parts
    full_context = "\n\n".join([
        "Relevant previous conversations:",
        "\n\n".join(vector_context),
        "Current conversation:",
        current_context,
        f"New query: {prompt}"
    ])
    
    # Remove <Think> tags (case-insensitive) and content between them
    pattern = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
    full_prompt = re.sub(pattern, "", full_context)
    
    # Remove duplicate "New query" entries by splitting and taking last
    full_prompt = full_prompt.rsplit("New query:", 1)[0] + f"New query: {prompt}"
    
    print(full_prompt)

    # Text response handling
    def generate():
        full_response = ""
        # Pass full_prompt to LLM instead of raw prompt
        for chunk in get_response_from_llm(full_prompt, model):
            try:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8")
                chunk_dict = json.loads(chunk)
                text = chunk_dict.get("response", "")
                full_response += text
                yield text
            except Exception as e:
                print(f"Error processing chunk: {e}")
        add_message_to_chat(chat_id, prompt, full_response)

    return StreamingResponse(generate(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
