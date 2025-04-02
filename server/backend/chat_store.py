import json
import os
import uuid
from datetime import datetime
from pathlib import Path
CHATS_DIR = Path("./chats")

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
        json.dump(chat_data, f)
    return chat_id

def get_chat(chat_id):
    chat_path = os.path.join(CHATS_DIR, f"{chat_id}.json")
    if not os.path.exists(chat_path):
        return None
    with open(chat_path, 'r') as f:
        return json.load(f)





def get_all_chats():
    CHATS_DIR.mkdir(exist_ok=True)
    chats = []
    
    for chat_file in CHATS_DIR.glob("*.json"):
        try:
            # Skip empty files
            if os.path.getsize(chat_file) == 0:
                os.remove(chat_file)
                continue

            with open(chat_file, "r") as f:
                chat_data = json.load(f)
                
                # Only include chats with at least one message
                if len(chat_data.get("messages", [])) > 0:
                    preview = chat_data["messages"][0]["query"]
                    if not preview.strip():
                        preview = "Empty query"
                        
                    chats.append({
                        "id": chat_data["id"],
                        "created_at": chat_data["created_at"],
                        "preview": preview[:50] + "..." if len(preview) > 50 else preview
                    })

        except json.JSONDecodeError:
            os.remove(chat_file)
            continue
            
        except Exception as e:
            print(f"Error processing {chat_file}: {e}")
            continue
    
    return sorted(chats, key=lambda x: x["created_at"], reverse=True)
    
    

def add_message_to_chat(chat_id, query, response):
    chat_path = os.path.join(CHATS_DIR, f"{chat_id}.json")
    if not os.path.exists(chat_path):
        raise FileNotFoundError(f"Chat {chat_id} not found")
    with open(chat_path, 'r+') as f:
        chat_data = json.load(f)
        chat_data["messages"].append({
            "query": query,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })
        f.seek(0)
        json.dump(chat_data, f, indent=2)
        f.truncate()