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
def build_mcp_context(prompt: str, vector_context: list, current_context: str) -> str:
    """Builds MCP-formatted context"""
    separator = '\n\n'  # Define separator outside the f-string
    examples = separator.join(vector_context) if vector_context else 'No relevant examples found'
    conversation_context = current_context if current_context else 'No recent conversation'
    
    return f"""# Model Context Protocol

## Persona
You are a helpful, knowledgeable AI assistant. Maintain a professional yet friendly tone.

## Task
Address this query: "{prompt}"
Consider both recent conversation history and relevant past examples.

## Examples from Knowledge Base
{examples}

## Current Conversation Context
{conversation_context}

## Response Guidelines
1. Be concise but comprehensive
2. Use Markdown formatting where appropriate
3. Acknowledge uncertainty when needed
4. Maintain logical flow with previous messages

# Query to Process
{prompt}"""

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
    similar_messages = vector_db.query_messages(prompt, chat_id)
    vector_context = []
    for meta in similar_messages:
        chat_data = get_chat(meta["chat_id"])
        if chat_data and len(chat_data["messages"]) > meta["message_index"]:
            msg = chat_data["messages"][meta["message_index"]]
            vector_context.append(
                f"User: {msg['query']}\nAssistant: {msg['response']}"
            )

    # Get current chat context
    chat_data = get_chat(chat_id) if chat_id else None
    messages = chat_data.get("messages", []) if chat_data else []
    current_context = "\n".join(
        [f"User: {msg['query']}\nAI: {msg['response']}" 
        for msg in messages[-2:]]
    )

    if not chat_id or not chat_data:
        chat_id = create_chat()

    # Build MCP-formatted prompt
    mcp_prompt = build_mcp_context(
        prompt=prompt,
        vector_context=vector_context,
        current_context=current_context
    )

    # Remove any residual formatting artifacts
    mcp_prompt = re.sub(r"<think>.*?</think>", "", mcp_prompt, flags=re.DOTALL|re.IGNORECASE)
    print("Final MCP Prompt:\n", mcp_prompt)

    def generate():
        full_response = ""
        for chunk in get_response_from_llm(mcp_prompt, model):
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
