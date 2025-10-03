import gradio as gr
import requests
import json
from typing import List, Dict, Any

def chat_with_nasa_bot(message: str, history: List[List[str]]) -> tuple:
    """Interface with NASA Bioscience Chatbot API"""
    try:
        # Connect to your deployed NASA chatbot API
        response = requests.post("http://localhost:8002/chat", json={
            "message": message,
            "session_id": "gradio_user"
        }, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return data["response"], data["sources"]
        else:
            return f"Sorry, I encountered an error (Status: {response.status_code})", []
    except requests.exceptions.ConnectionError:
        return "🚀 NASA Chatbot is not running. Please start the server with: python dynamic_chatbot.py", []
    except Exception as e:
        return f"Error: {str(e)}", []

def format_sources(sources: List[Dict[str, Any]]) -> str:
    """Format sources for display"""
    if not sources:
        return "No sources available."
    
    formatted = "📚 **Research Sources:**\n\n"
    for i, source in enumerate(sources, 1):
        formatted += f"**{i}. {source['metadata']['title']}**\n"
        formatted += f"   - Relevance Score: {source['score']:.3f}\n"
        formatted += f"   - Snippet: {source['chunk'][:200]}...\n\n"
    
    return formatted

# Create Gradio interface
with gr.Blocks(
    title="NASA Bioscience Chatbot", 
    theme=gr.themes.Soft(),
    css="""
    .gradio-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .chatbot {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
    }
    """
) as demo:
    
    # Header
    gr.Markdown("""
    # 🚀 NASA Bioscience Research Assistant
    
    **Exploring Space Biology with AI**
    
    Ask questions about NASA's bioscience research publications. I have access to 13,150 research chunks covering plant biology, animal studies, human health, and space environment research.
    
    **Example questions:**
    - What are the effects of microgravity on plants?
    - How do astronauts adapt to space conditions?
    - What research has been done on bone loss in space?
    """)
    
    with gr.Row():
        with gr.Column(scale=2):
            # Chat interface
            chatbot = gr.Chatbot(
                height=500,
                label="💬 Chat with NASA Assistant",
                show_label=True
            )
            
            with gr.Row():
                msg = gr.Textbox(
                    label="Ask a question",
                    placeholder="What are the effects of microgravity on plants?",
                    scale=4
                )
                send_btn = gr.Button("🚀 Send", scale=1, variant="primary")
            
            # Quick action buttons
            with gr.Row():
                clear_btn = gr.Button("🗑️ Clear Chat", variant="secondary")
                example_btn = gr.Button("💡 Example Question", variant="secondary")
        
        with gr.Column(scale=1):
            # Sources panel
            sources_display = gr.Markdown(
                value="**Research sources will appear here after you ask a question.**",
                label="📚 Sources",
                show_label=True
            )
            
            # Stats panel
            with gr.Accordion("📊 Research Database Stats", open=False):
                gr.Markdown("""
                - **Total Papers**: 13,150 chunks
                - **Topics Covered**: 
                  - 🌱 Plant Biology
                  - 🐭 Animal Studies  
                  - 👩‍🚀 Human Health
                  - 🌌 Space Environment
                - **Search Engine**: FAISS + SentenceTransformers
                - **Model**: all-MiniLM-L6-v2
                """)
    
    # Event handlers
    def respond(message, history):
        if not message.strip():
            return history, "Please enter a question."
        
        # Add user message to history
        history.append([message, None])
        
        # Get bot response
        response, sources = chat_with_nasa_bot(message, history)
        
        # Update history with bot response
        history[-1][1] = response
        
        # Format sources
        sources_text = format_sources(sources)
        
        return history, sources_text
    
    def clear_chat():
        return [], "**Chat cleared. Ask me anything about NASA bioscience research!**"
    
    def example_question():
        examples = [
            "What are the effects of microgravity on plant growth?",
            "How do astronauts' bones change in space?",
            "What research has been done on mice in space?",
            "How does space radiation affect human health?",
            "What are the psychological effects of long-duration spaceflight?"
        ]
        import random
        return random.choice(examples)
    
    # Connect events
    msg.submit(respond, [msg, chatbot], [chatbot, sources_display])
    send_btn.click(respond, [msg, chatbot], [chatbot, sources_display])
    clear_btn.click(clear_chat, outputs=[chatbot, sources_display])
    example_btn.click(example_question, outputs=[msg])
    
    # Footer
    gr.Markdown("""
    ---
    **Built with ❤️ for NASA Bioscience Research**
    
    This chatbot uses semantic search across NASA's bioscience publications to provide accurate, source-backed answers about space biology research.
    """)

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,  # Creates a public link
        show_error=True
    )
