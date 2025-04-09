from langchain.llms import Ollama
import json

def get_response_from_llm(prompt, model="deepseek-r1:1.5b"):
    try:
        llm = Ollama(model=model)
        response_stream = llm.stream(prompt)
        
        # Create generator that mimics original streaming format
        def generate():
            for chunk in response_stream:
                yield json.dumps({
                    "response": chunk,
                    "done": False
                }) + "\n"
            yield json.dumps({"done": True}) + "\n"
        
        return generate()
        
    except Exception as e:
        print(f"Error: {e}")
        return iter([json.dumps({"error": str(e)})])

# Example usage:
if __name__ == "__main__":
    prompt = input("Enter The Question: ")
    response = get_response_from_llm(prompt)
    
    if response:
        print("Streaming Response:")
        for chunk in response:
            data = json.loads(chunk)
            if "response" in data:
                print(data["response"], end="", flush=True)