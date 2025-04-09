import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import uuid

class VectorDB:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(allow_reset=True, anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection("chat_embeddings")
    
    def add_message(self, chat_id: str, message: dict, message_index: int):
        text = f"Query: {message['query']}\nResponse: {message['response']}"
        embedding = self.model.encode(text).tolist()
        
        self.collection.add(
            ids=str(uuid.uuid4()),
            embeddings=[embedding],
            metadatas=[{
                "chat_id": str(chat_id),  # Store as string
                "message_index": int(message_index),
                "type": "user_message"
            }]
        )
    
    def query_messages(self, text: str, chat_id: str, top_k: int = 3):
        embedding = self.model.encode(text).tolist()
        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            where={"chat_id": {"$eq": str(chat_id)}},  # Filter by current chat
            include=["metadatas", "distances"]
        )
        return results["metadatas"][0]

    def reset_db(self):
        self.client.reset()

vector_db = VectorDB()