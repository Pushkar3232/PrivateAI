from diffusers import StableDiffusionPipeline

model_path = "C:/Users/Pushkar/Projects/genimage/model"  # Local model path
 # Attempt to load the model
pipe = StableDiffusionPipeline.from_pretrained(model_path)

def createImg(prompt):
    
    try:
        # Generate image
        image = pipe(prompt).images[0]
        # Save the image
        image.show()
        image.save("generated_image.png")
        
        return "Done"
    except Exception as e:
        print(f"Error generating image: {e}")
        # Handle the error accordingly, e.g., return a placeholder image or error message.

if __name__ == "__main__":
    prompt = input("Enter The Prompt for Image Creation : \n")
    createImg(prompt)
