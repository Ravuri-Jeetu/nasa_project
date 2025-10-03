# NASA Bioscience Chatbot - Hugging Face Deployment Guide

## 🚀 Deploying to Hugging Face Hub

### Step 1: Prepare Your Repository

1. **Create a new repository on Hugging Face Hub**:
   - Go to https://huggingface.co/new
   - Choose "Model" as the repository type
   - Name it: `nasa-bioscience-chatbot`
   - Make it public

2. **Install Hugging Face Hub**:
   ```bash
   pip install huggingface_hub
   ```

### Step 2: Upload Your Model

```python
from huggingface_hub import HfApi, Repository

# Initialize the API
api = HfApi()

# Create repository (if not already created)
api.create_repo(
    repo_id="your-username/nasa-bioscience-chatbot",
    repo_type="model",
    exist_ok=True
)

# Upload files
api.upload_file(
    path_or_fileobj="dynamic_chatbot.py",
    path_in_repo="dynamic_chatbot.py",
    repo_id="your-username/nasa-bioscience-chatbot",
    repo_type="model"
)

# Upload other important files
files_to_upload = [
    "requirements.txt",
    "MODEL_CARD.md",
    "LICENSE",
    "README.md",
    "NASA-Chatbot-UI.jsx",
    "package.json"
]

for file in files_to_upload:
    api.upload_file(
        path_or_fileobj=file,
        path_in_repo=file,
        repo_id="your-username/nasa-bioscience-chatbot",
        repo_type="model"
    )
```

### Step 3: Create a Hugging Face Space (Optional)

For a live demo, create a Hugging Face Space:

1. **Go to**: https://huggingface.co/new-space
2. **Choose**: Gradio or Streamlit
3. **Upload your files**

### Step 4: Create a Gradio Demo

```python
import gradio as gr
import requests
import json

def chat_with_nasa_bot(message, history):
    """Interface with your NASA chatbot API"""
    try:
        # This would connect to your deployed API
        response = requests.post("http://localhost:8002/chat", json={
            "message": message,
            "session_id": "gradio_user"
        })
        
        if response.status_code == 200:
            data = response.json()
            return data["response"], data["sources"]
        else:
            return "Sorry, I encountered an error.", []
    except Exception as e:
        return f"Error: {str(e)}", []

# Create Gradio interface
with gr.Blocks(title="NASA Bioscience Chatbot", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🚀 NASA Bioscience Research Assistant")
    gr.Markdown("Ask questions about NASA's bioscience research publications!")
    
    with gr.Row():
        with gr.Column():
            chatbot = gr.Chatbot(height=400)
            msg = gr.Textbox(label="Ask a question", placeholder="What are the effects of microgravity on plants?")
            msg.submit(chat_with_nasa_bot, [msg, chatbot], [chatbot, gr.Textbox(visible=False)])
        
        with gr.Column():
            sources = gr.JSON(label="Research Sources")

if __name__ == "__main__":
    demo.launch()
```

### Step 5: Upload to Hugging Face

```bash
# Clone your repository
git clone https://huggingface.co/your-username/nasa-bioscience-chatbot

# Copy your files
cp dynamic_chatbot.py nasa-bioscience-chatbot/
cp requirements.txt nasa-bioscience-chatbot/
cp MODEL_CARD.md nasa-bioscience-chatbot/
cp LICENSE nasa-bioscience-chatbot/

# Commit and push
cd nasa-bioscience-chatbot
git add .
git commit -m "Add NASA Bioscience Chatbot"
git push
```

## 📋 Files to Include

### Required Files:
- `dynamic_chatbot.py` - Main chatbot application
- `requirements.txt` - Python dependencies
- `MODEL_CARD.md` - Model documentation
- `LICENSE` - License file
- `README.md` - Usage instructions

### Optional Files:
- `NASA-Chatbot-UI.jsx` - React frontend
- `package.json` - Node.js dependencies
- `app.py` - Gradio demo
- `embeddings.pkl` - Pre-computed embeddings (if small enough)
- `faiss_index.bin` - FAISS index (if small enough)

## 🌟 Benefits of Hugging Face Deployment

1. **Community Access**: Share your work with researchers worldwide
2. **Easy Installation**: Users can install with `pip install`
3. **Live Demo**: Create a Gradio/Streamlit space for testing
4. **Version Control**: Track model updates and improvements
5. **Documentation**: Centralized place for model information
6. **Citations**: Easy to cite in research papers

## 🔧 Alternative: Hugging Face Spaces

For a simpler deployment, create a **Hugging Face Space**:

1. **Go to**: https://huggingface.co/new-space
2. **Choose**: Gradio
3. **Upload**: Your chatbot files
4. **Deploy**: Automatic deployment with live URL

## 📊 Model Card Template

Your model card should include:
- Model description and architecture
- Training data information
- Usage examples
- Performance metrics
- Limitations and biases
- Citation information

## 🚀 Next Steps

1. **Create Hugging Face account** (if you don't have one)
2. **Upload your model** using the scripts above
3. **Create a Gradio demo** for live testing
4. **Share with the community** and get feedback
5. **Iterate and improve** based on user feedback

This will make your NASA Bioscience Chatbot accessible to researchers, students, and space enthusiasts worldwide! 🌌
