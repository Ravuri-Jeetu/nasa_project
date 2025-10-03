import os
import json
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    sources: list
    timestamp: str
    session_id: str

# Initialize the chatbot components
logger.info("Loading NASA chatbot...")

# Load data from JSONL format
chunks = []
with open("all_papers_chunked.jsonl", 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        chunks.append({
            'chunk': data['chunk_text_clean'],
            'metadata': {
                'title': f"Paper {data.get('paper_id', 'N/A')}",
                'url': 'N/A',
                'paper_id': data.get('paper_id', 'N/A'),
                'section': data.get('section', 'N/A'),
                'chunk_index': data.get('chunk_index', 'N/A')
            }
        })

logger.info(f"Loaded {len(chunks)} chunks")

# Load embeddings
if os.path.exists("embeddings.pkl"):
    with open("embeddings.pkl", 'rb') as f:
        embeddings = pickle.load(f)
    logger.info("Loaded existing embeddings")
else:
    logger.info("Creating embeddings...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    texts = [chunk['chunk'] for chunk in chunks]
    embeddings = model.encode(texts, show_progress_bar=True)
    with open("embeddings.pkl", 'wb') as f:
        pickle.dump(embeddings, f)
    logger.info("Embeddings saved")

# Load FAISS index
if os.path.exists("faiss_index.bin"):
    index = faiss.read_index("faiss_index.bin")
    logger.info("Loaded existing FAISS index")
else:
    logger.info("Creating FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    faiss.normalize_L2(embeddings)
    index.add(embeddings.astype('float32'))
    faiss.write_index(index, "faiss_index.bin")
    logger.info("FAISS index saved")

# Load model for search
model = SentenceTransformer('all-MiniLM-L6-v2')

def search_chunks(query: str, top_k: int = 5):
    """Enhanced search function"""
    query_embedding = model.encode([query])
    faiss.normalize_L2(query_embedding)
    scores, indices = index.search(query_embedding.astype('float32'), top_k)
    
    results = []
    for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
        if idx < len(chunks):
            results.append({
                'chunk': chunks[idx]['chunk'],
                'metadata': chunks[idx]['metadata'],
                'score': float(score),
                'rank': i + 1
            })
    return results

def generate_dynamic_response(query: str, search_results: list):
    """Generate more dynamic and conversational responses"""
    if not search_results:
        return "I'm sorry, I couldn't find relevant information about that in NASA's bioscience research. Could you try rephrasing your question?"
    
    # Analyze the query to provide more contextual responses
    query_lower = query.lower()
    
    if any(word in query_lower for word in ['hello', 'hi', 'hey', 'how are you']):
        return f"Hello! I'm your NASA Bioscience Research Assistant. I have access to {len(chunks)} research chunks from 572 unique publications and I'm here to help you explore the fascinating world of space biology. What would you like to know about?"
    
    if any(word in query_lower for word in ['thank', 'thanks']):
        return "You're welcome! I'm always here to help you explore NASA's bioscience research. Feel free to ask me anything about space biology, astronaut health, or related topics!"
    
    if any(word in query_lower for word in ['bye', 'goodbye', 'see you']):
        return "Goodbye! It was great helping you explore NASA's bioscience research. Feel free to come back anytime you have questions about space biology!"
    
    # Generate contextual response based on search results
    top_result = search_results[0]
    title = top_result['metadata']['title']
    chunk_text = top_result['chunk']
    
    # Extract key information
    response = f"Great question! Based on NASA research, I found some fascinating information:\n\n"
    
    # Add contextual introduction based on query type
    if any(word in query_lower for word in ['effect', 'impact', 'change']):
        response += f"Research shows that {query.lower()} has significant effects. "
    elif any(word in query_lower for word in ['what', 'how', 'why']):
        response += f"Let me explain what NASA research reveals about this: "
    else:
        response += f"Here's what I discovered: "
    
    # Add the main content
    response += f"According to '{title}', "
    
    # Extract the most relevant part of the chunk
    sentences = chunk_text.split('. ')
    relevant_sentences = sentences[:3]  # First 3 sentences
    response += '. '.join(relevant_sentences) + '.'
    
    # Add additional context if multiple sources
    if len(search_results) > 1:
        response += f"\n\nI also found {len(search_results)-1} additional relevant studies that support these findings."
    
    # Add conversational ending
    response += f"\n\nWould you like me to dive deeper into any specific aspect of this research?"
    
    return response

# Create FastAPI app
app = FastAPI(title="NASA Dynamic Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatMessage):
    """Dynamic chat endpoint"""
    try:
        logger.info(f"Received message: {request.message}")
        
        # Search for relevant chunks
        search_results = search_chunks(request.message, top_k=5)
        
        # Generate dynamic response
        response = generate_dynamic_response(request.message, search_results)
        
        logger.info(f"Returning dynamic response with {len(search_results)} sources")
        
        return ChatResponse(
            response=response,
            sources=search_results,
            timestamp=datetime.now().isoformat(),
            session_id=request.session_id
        )
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_class=HTMLResponse)
async def get_frontend():
    """Dynamic chat frontend"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>NASA Dynamic Chatbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .chat-container {
                width: 90%;
                max-width: 800px;
                height: 90vh;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chat-header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                padding: 20px;
                text-align: center;
                position: relative;
            }
            
            .chat-header h1 {
                font-size: 1.8em;
                margin-bottom: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .chat-header p {
                font-size: 0.9em;
                opacity: 0.9;
            }
            
            .status-indicator {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 12px;
                height: 12px;
                background: #4CAF50;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .message {
                margin-bottom: 15px;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .user-message {
                text-align: right;
            }
            
            .user-message .message-bubble {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: inline-block;
                padding: 12px 18px;
                border-radius: 18px 18px 5px 18px;
                max-width: 70%;
                word-wrap: break-word;
            }
            
            .bot-message {
                text-align: left;
            }
            
            .bot-message .message-bubble {
                background: white;
                color: #333;
                display: inline-block;
                padding: 15px 20px;
                border-radius: 18px 18px 18px 5px;
                max-width: 80%;
                word-wrap: break-word;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border: 1px solid #e1e5e9;
            }
            
            .message-time {
                font-size: 0.7em;
                color: #666;
                margin-top: 5px;
            }
            
            .typing-indicator {
                display: none;
                align-items: center;
                gap: 5px;
                color: #666;
                font-style: italic;
            }
            
            .typing-dots {
                display: flex;
                gap: 3px;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                background: #666;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            
            .chat-input-container {
                padding: 20px;
                background: white;
                border-top: 1px solid #e1e5e9;
            }
            
            .chat-input-wrapper {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .chat-input {
                flex: 1;
                padding: 15px 20px;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s;
            }
            
            .chat-input:focus {
                border-color: #667eea;
            }
            
            .send-button {
                padding: 15px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                transition: transform 0.2s;
                min-width: 80px;
            }
            
            .send-button:hover {
                transform: translateY(-2px);
            }
            
            .send-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .sources-toggle {
                margin-top: 10px;
                text-align: center;
            }
            
            .sources-toggle button {
                background: none;
                border: 1px solid #667eea;
                color: #667eea;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }
            
            .sources-toggle button:hover {
                background: #667eea;
                color: white;
            }
            
            .sources-panel {
                display: none;
                margin-top: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                border: 1px solid #e1e5e9;
            }
            
            .source-item {
                background: white;
                padding: 12px;
                margin-bottom: 10px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .source-title {
                font-weight: 600;
                color: #1e3c72;
                margin-bottom: 5px;
                font-size: 0.9em;
            }
            
            .source-content {
                color: #666;
                font-size: 0.8em;
                line-height: 1.4;
            }
            
            .source-score {
                background: #667eea;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.7em;
                float: right;
            }
            
            @media (max-width: 768px) {
                .chat-container {
                    width: 95%;
                    height: 95vh;
                }
                
                .chat-header h1 {
                    font-size: 1.5em;
                }
                
                .user-message .message-bubble,
                .bot-message .message-bubble {
                    max-width: 85%;
                }
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div class="chat-header">
                <div class="status-indicator"></div>
                <h1>🚀 NASA Bioscience Assistant</h1>
                <p>Your AI companion for exploring NASA's bioscience research</p>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                <div class="message bot-message">
                    <div class="message-bubble">
                        Hello! I'm your NASA Bioscience Research Assistant. I have access to 27,352 research chunks from 572 unique publications and I'm here to help you explore the fascinating world of space biology. What would you like to know about?
                    </div>
                    <div class="message-time">Just now</div>
                </div>
            </div>
            
            <div class="typing-indicator" id="typingIndicator">
                <span>NASA Assistant is typing</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Ask me anything about NASA bioscience research..." />
                    <button id="sendButton" class="send-button" onclick="sendMessage()">Send</button>
                </div>
                <div class="sources-toggle">
                    <button id="sourcesToggle" onclick="toggleSources()">Show Sources</button>
                </div>
                <div class="sources-panel" id="sourcesPanel"></div>
            </div>
        </div>
        
        <script>
            let currentSources = [];
            let sourcesVisible = false;
            
            function addMessage(content, isUser = false, sources = []) {
                const messagesContainer = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
                
                const bubbleDiv = document.createElement('div');
                bubbleDiv.className = 'message-bubble';
                bubbleDiv.textContent = content;
                
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                timeDiv.textContent = new Date().toLocaleTimeString();
                
                messageDiv.appendChild(bubbleDiv);
                messageDiv.appendChild(timeDiv);
                messagesContainer.appendChild(messageDiv);
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Store sources for current response
                if (sources.length > 0) {
                    currentSources = sources;
                }
            }
            
            function showTyping() {
                document.getElementById('typingIndicator').style.display = 'flex';
                document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
            }
            
            function hideTyping() {
                document.getElementById('typingIndicator').style.display = 'none';
            }
            
            async function sendMessage() {
                const input = document.getElementById('chatInput');
                const message = input.value.trim();
                
                if (!message) return;
                
                // Add user message
                addMessage(message, true);
                input.value = '';
                
                // Show typing indicator
                showTyping();
                
                // Disable send button
                const sendButton = document.getElementById('sendButton');
                sendButton.disabled = true;
                sendButton.textContent = 'Sending...';
                
                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            session_id: 'default'
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    // Hide typing indicator
                    hideTyping();
                    
                    // Add bot response
                    addMessage(data.response, false, data.sources);
                    
                } catch (error) {
                    console.error('Error:', error);
                    hideTyping();
                    addMessage('Sorry, I encountered an error. Please try again.', false);
                } finally {
                    // Re-enable send button
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send';
                }
            }
            
            function toggleSources() {
                const panel = document.getElementById('sourcesPanel');
                const button = document.getElementById('sourcesToggle');
                
                if (sourcesVisible) {
                    panel.style.display = 'none';
                    button.textContent = 'Show Sources';
                    sourcesVisible = false;
                } else {
                    panel.style.display = 'block';
                    button.textContent = 'Hide Sources';
                    sourcesVisible = true;
                    
                    // Populate sources
                    if (currentSources.length > 0) {
                        let sourcesHTML = '<h4>Research Sources:</h4>';
                        currentSources.forEach((source, index) => {
                            sourcesHTML += `
                                <div class="source-item">
                                    <div class="source-title">
                                        ${source.metadata.title}
                                        <span class="source-score">${source.score.toFixed(3)}</span>
                                    </div>
                                    <div class="source-content">
                                        ${source.chunk.substring(0, 150)}...
                                    </div>
                                </div>
                            `;
                        });
                        panel.innerHTML = sourcesHTML;
                    } else {
                        panel.innerHTML = '<p>No sources available for this response.</p>';
                    }
                }
            }
            
            // Allow Enter key to send
            document.getElementById('chatInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Focus on input when page loads
            window.onload = function() {
                document.getElementById('chatInput').focus();
            };
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    return {"status": "healthy", "chunks": len(chunks)}

if __name__ == "__main__":
    logger.info("Starting NASA Dynamic Chatbot on http://127.0.0.1:8002")
    uvicorn.run(app, host="127.0.0.1", port=8002)
