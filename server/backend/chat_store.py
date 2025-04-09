import uuid
from datetime import datetime
from pymongo import MongoClient
from .vector_db import vector_db

# Connect to MongoDB (adjust the connection string as needed)
client = MongoClient("mongodb://localhost:27017/")
db = client.chatbot  # Database name
chats_collection = db.chats  # Collection name

def create_chat():
    chat_id = str(uuid.uuid4())
    chat_data = {
        "id": chat_id,
        "created_at": datetime.now().isoformat(),
        "messages": []
    }
    chats_collection.insert_one(chat_data)
    return chat_id

def get_chat(chat_id):
    chat_data = chats_collection.find_one({"id": chat_id})
    if chat_data and "_id" in chat_data:
        chat_data["_id"] = str(chat_data["_id"])
    return chat_data

def get_all_chats():
    chats = []
    for chat in chats_collection.find({"messages.0": {"$exists": True}}):
        # Convert MongoDB _id to string
        chat["_id"] = str(chat["_id"])
        preview = chat["messages"][0].get("query", "")
        if not preview.strip():
            preview = "Empty query"
        if len(preview) > 50:
            preview = preview[:50] + "..."
        chats.append({
            "id": chat["id"],
            "created_at": chat["created_at"],
            "preview": preview
        })
    return sorted(chats, key=lambda x: x["created_at"], reverse=True)


def add_message_to_chat(chat_id, query, response):
    message = {
        "query": query,
        "response": response,
        "timestamp": datetime.now().isoformat()
    }
    
    # Get current messages count first
    chat_data = get_chat(chat_id)
    message_index = len(chat_data.get("messages", []))
    
    result = chats_collection.update_one(
        {"id": chat_id},
        {"$push": {"messages": message}}
    )
    
    if result.matched_count == 0:
        raise ValueError(f"Chat {chat_id} not found")
    
    # Add to vector DB after MongoDB insertion
    vector_db.add_message(chat_id, message, message_index)
