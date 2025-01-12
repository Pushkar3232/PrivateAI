from pymongo import MongoClient

# Connect to local MongoDB server
client = MongoClient('mongodb://localhost:27017/')
db = client['chatbot']  # Create/use the 'chatbot' database
collection = db['chats']  # Create/use the 'chats' collection

# Function to store chat data locally
def store_chat(question, response):
    data = {
        'question': question,
        'response': response
    }
    collection.insert_one(data)  
    print("Chat stored locally.")

def get_all_chats():
    chats = list(collection.find({}, {'_id': 0}))  # Exclude MongoDB `_id` field
    return chats

# store_chat(data['question'], data['response'])
# print("This is the From Database")
# print(get_all_chats())