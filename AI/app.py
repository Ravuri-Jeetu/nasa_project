import gradio as gr
import requests
import json
from typing import List, Dict, Any
import os

# NASA Chatbot API Integration
class NASAChatbotClient:
    def __init__(self, api_url=None):
        # Use environment variable or default to localhost
        self.api_url = api_url or os.getenv("NASA_API_URL", "http://localhost:8002")
    
    def chat(self, message: str, session_id: str = "gradio_user") -> Dict[str, Any]:
        """Send message to NASA chatbot API"""
        try:
            response = requests.post(f"{self.api_url}/chat", json={
                "message": message,
                "session_id": session_id
            }, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "response": f"Error: HTTP {response.status_code}",
                    "sources": [],
                    "timestamp": None
                }
        except requests.exceptions.ConnectionError:
            return {
                "response": "🚀 NASA Chatbot API is not running. This is a demo version - the full backend would need to be deployed separately.",
                "sources": [],
                "timestamp": None
            }
        except Exception as e:
            return {
                "response": f"Error: {str(e)}",
                "sources": [],
                "timestamp": None
            }

# Initialize NASA chatbot client
nasa_client = NASAChatbotClient()

def chat_with_nasa(message: str, history: List[List[str]]) -> tuple:
    """Main chat function for Gradio interface"""
    if not message.strip():
        return history, "Please enter a question."
    
    # Add user message to history
    history.append([message, None])
    
    # Get NASA chatbot response
    nasa_response = nasa_client.chat(message)
    
    # Update history with bot response
    history[-1][1] = nasa_response["response"]
    
    # Format sources for display
    sources_text = format_sources(nasa_response.get("sources", []))
    
    return history, sources_text

def format_sources(sources: List[Dict[str, Any]]) -> str:
    """Format sources for display"""
    if not sources:
        return "No sources available."
    
    formatted = "📚 **Research Sources:**\n\n"
    for i, source in enumerate(sources, 1):
        title = source.get('metadata', {}).get('title', 'Unknown Title')
        score = source.get('score', 0)
        snippet = source.get('chunk', '')[:200] + "..." if source.get('chunk') else "No snippet available"
        
        formatted += f"**{i}. {title}**\n"
        formatted += f"   - Relevance Score: {score:.3f}\n"
        formatted += f"   - Snippet: {snippet}\n\n"
    
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
    
    Ask questions about NASA's bioscience research publications. This chatbot has access to 13,150 research chunks covering plant biology, animal studies, human health, and space environment research.
    
    **Example questions:**
    - What are the effects of microgravity on plants?
    - How do astronauts adapt to space conditions?
    - What research has been done on bone loss in space?
    - How does space radiation affect human health?
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
        return chat_with_nasa(message, history)
    
    def clear_chat():
        return [], "**Chat cleared. Ask me anything about NASA bioscience research!**"
    
    def example_question():
        examples = [
            "What are the effects of microgravity on plant growth?",
            "How do astronauts' bones change in space?",
            "What research has been done on mice in space?",
            "How does space radiation affect human health?",
            "What are the psychological effects of long-duration spaceflight?",
            "How do plants grow in space stations?",
            "What happens to muscle mass in microgravity?",
            "How do astronauts sleep in space?"
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
    
    **Note**: This is a demo interface. The full backend with 13,150 research chunks would need to be deployed separately for complete functionality.
    """)

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,
        show_error=True
    )