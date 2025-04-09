# Create a new file init_vector_db.py
from chat_store import get_all_chats
from vector_db import vector_db

def main():
    vector_db.reset_db()
    chats = get_all_chats()
    for chat in chats:
        for idx, msg in enumerate(chat["messages"]):
            vector_db.add_message(chat["id"], msg, idx)

if __name__ == "__main__":
    main()