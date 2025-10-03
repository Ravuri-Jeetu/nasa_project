#!/usr/bin/env python3
"""
Final NASA AI Gradio App - Production Ready
"""

import gradio as gr
import os
from hybrid_nasa_ai import HybridNASAAI
import time

class FinalNASAApp:
    """Final production-ready NASA AI Application"""
    
    def __init__(self):
        self.ai = None
        self.setup_ai()
    
    def setup_ai(self):
        """Initialize the NASA AI"""
        try:
            print("🚀 Initializing NASA Bioscience AI...")
            self.ai = HybridNASAAI()
            print("✅ NASA AI ready!")
        except Exception as e:
            print(f"❌ Failed to initialize: {e}")
            self.ai = None
    
    def chat_interface(self, message, history):
        """Enhanced chat interface"""
        if not self.ai:
            return "❌ NASA AI is not available. Please check the setup."
        
        if not message.strip():
            return "Please enter a question about NASA space biology research."
        
        try:
            # Get response from hybrid AI
            response = self.ai.chat(message)
            return response
        except Exception as e:
            return f"❌ Error processing your question: {str(e)}"
    
    def create_interface(self):
        """Create the final Gradio interface"""
        
        # Custom CSS
        css = """
        .nasa-container {
            background: linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #000051 100%);
            color: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .nasa-title {
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-align: center;
            margin-bottom: 10px;
        }
        .nasa-subtitle {
            font-size: 1.2em;
            color: #B0BEC5;
            text-align: center;
            margin-bottom: 20px;
        }
        .example-box {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .example-query {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .example-query:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        .stats-box {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin-top: 20px;
        }
        """
        
        with gr.Blocks(css=css, title="NASA Bioscience AI", theme=gr.themes.Soft()) as interface:
            
            # Header
            gr.HTML("""
            <div class="nasa-container">
                <div class="nasa-title">🚀 NASA Bioscience AI Assistant</div>
                <div class="nasa-subtitle">Advanced Query Solver for Space Biology Research</div>
            </div>
            """)
            
            # Main chat interface
            with gr.Row():
                with gr.Column(scale=4):
                    chatbot = gr.Chatbot(
                        height=500,
                        label="NASA Research Assistant",
                        show_label=True,
                        container=True,
                        bubble_full_width=False,
                        avatar_images=("🤖", "👨‍🚀")
                    )
                    
                    with gr.Row():
                        msg = gr.Textbox(
                            placeholder="Ask about microgravity effects, space radiation, astronaut health, plant biology in space...",
                            label="Your Question",
                            lines=2,
                            scale=4
                        )
                        send_btn = gr.Button("🚀 Ask NASA AI", scale=1, variant="primary")
            
            # Example queries
            with gr.Row():
                with gr.Column():
                    gr.HTML("""
                    <div class="example-box">
                        <h3>💡 Example Queries</h3>
                        <div class="example-query" onclick="document.querySelector('#ex1').click()">
                            <strong>What is microgravity?</strong><br>
                            <small>Get comprehensive definitions and explanations</small>
                        </div>
                        <div class="example-query" onclick="document.querySelector('#ex2').click()">
                            <strong>How does space affect bone density?</strong><br>
                            <small>Learn about biological effects and mechanisms</small>
                        </div>
                        <div class="example-query" onclick="document.querySelector('#ex3').click()">
                            <strong>What are space radiation countermeasures?</strong><br>
                            <small>Explore solutions and protection strategies</small>
                        </div>
                        <div class="example-query" onclick="document.querySelector('#ex4').click()">
                            <strong>How do plants grow in microgravity?</strong><br>
                            <small>Discover plant biology in space environments</small>
                        </div>
                        <div class="example-query" onclick="document.querySelector('#ex5').click()">
                            <strong>Compare muscle atrophy vs bone loss in space</strong><br>
                            <small>Analyze differences and similarities</small>
                        </div>
                    </div>
                    """)
            
            # Hidden example buttons
            ex1 = gr.Button("What is microgravity?", visible=False, elem_id="ex1")
            ex2 = gr.Button("How does space affect bone density?", visible=False, elem_id="ex2")
            ex3 = gr.Button("What are space radiation countermeasures?", visible=False, elem_id="ex3")
            ex4 = gr.Button("How do plants grow in microgravity?", visible=False, elem_id="ex4")
            ex5 = gr.Button("Compare muscle atrophy vs bone loss in space", visible=False, elem_id="ex5")
            
            # Statistics
            gr.HTML("""
            <div class="stats-box">
                <h3>📊 Knowledge Base Statistics</h3>
                <p><strong>📚 Research Papers:</strong> 5,148 NASA research chunks</p>
                <p><strong>🧠 AI Model:</strong> Fine-tuned DialoGPT with RAG enhancement</p>
                <p><strong>🔬 Domains:</strong> Space Biology, Microgravity, Radiation, Astronaut Health</p>
                <p><strong>🎯 Capabilities:</strong> Query classification, semantic search, source citation</p>
            </div>
            """)
            
            # Event handlers
            def user(user_message, history):
                return "", history + [[user_message, None]]
            
            def bot(history):
                user_message = history[-1][0]
                response = self.chat_interface(user_message, history)
                history[-1][1] = response
                return history
            
            # Connect events
            msg.submit(user, [msg, chatbot], [msg, chatbot], queue=False).then(
                bot, chatbot, chatbot
            )
            send_btn.click(user, [msg, chatbot], [msg, chatbot], queue=False).then(
                bot, chatbot, chatbot
            )
            
            # Example query handlers
            ex1.click(lambda: "What is microgravity?", None, msg)
            ex2.click(lambda: "How does space affect bone density?", None, msg)
            ex3.click(lambda: "What are space radiation countermeasures?", None, msg)
            ex4.click(lambda: "How do plants grow in microgravity?", None, msg)
            ex5.click(lambda: "Compare muscle atrophy vs bone loss in space", None, msg)
        
        return interface
    
    def launch(self, host="127.0.0.1", port=7860, share=False):
        """Launch the final NASA AI app"""
        print(f"🚀 Launching Final NASA Bioscience AI Assistant...")
        print(f"📍 Local URL: http://{host}:{port}")
        if share:
            print("🌐 Public URL will be provided after launch")
        
        interface = self.create_interface()
        interface.launch(
            server_name=host,
            server_port=port,
            share=share,
            show_error=True,
            quiet=False
        )

def main():
    """Main function to run the final NASA AI app"""
    app = FinalNASAApp()
    app.launch(share=False)  # Set to True for public sharing

if __name__ == "__main__":
    main()
