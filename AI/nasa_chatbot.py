import os
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    use_openai: bool = True

class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    query: str

class NASAChatbot:
    def __init__(self, data_file: str = "step5_all_chunks[1].json", 
                 embeddings_file: str = "embeddings.pkl",
                 index_file: str = "faiss_index.bin"):
        self.data_file = data_file
        self.embeddings_file = embeddings_file
        self.index_file = index_file
        self.model = None
        self.index = None
        self.chunks = []
        self.embeddings = None
        
        # Initialize OpenAI client
        self.openai_client = None
        if os.getenv("OPENAI_API_KEY"):
            self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        self._load_data()
        self._load_or_create_embeddings()
        self._load_or_create_index()
    
    def _load_data(self):
        """Load the NASA publications data"""
        logger.info(f"Loading data from {self.data_file}")
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Convert to the expected format
            self.chunks = []
            for item in data:
                if 'Chunk' in item and 'Title' in item:
                    self.chunks.append({
                        'chunk': item['Chunk'],
                        'metadata': {
                            'title': item['Title'],
                            'url': item.get('URL', 'N/A')
                        }
                    })
            
            logger.info(f"Loaded {len(self.chunks)} chunks")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def _load_or_create_embeddings(self):
        """Load existing embeddings or create new ones"""
        if os.path.exists(self.embeddings_file):
            logger.info(f"Loading existing embeddings from {self.embeddings_file}")
            with open(self.embeddings_file, 'rb') as f:
                self.embeddings = pickle.load(f)
        else:
            logger.info("Creating new embeddings...")
            self._create_embeddings()
    
    def _create_embeddings(self):
        """Create embeddings using SentenceTransformers"""
        logger.info("Initializing SentenceTransformer model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        logger.info("Generating embeddings...")
        texts = [chunk['chunk'] for chunk in self.chunks]
        self.embeddings = self.model.encode(texts, show_progress_bar=True)
        
        # Save embeddings
        with open(self.embeddings_file, 'wb') as f:
            pickle.dump(self.embeddings, f)
        logger.info(f"Embeddings saved to {self.embeddings_file}")
    
    def _load_or_create_index(self):
        """Load existing FAISS index or create new one"""
        if os.path.exists(self.index_file):
            logger.info(f"Loading existing FAISS index from {self.index_file}")
            self.index = faiss.read_index(self.index_file)
        else:
            logger.info("Creating new FAISS index...")
            self._create_index()
    
    def _create_index(self):
        """Create FAISS index for fast similarity search"""
        if self.embeddings is None:
            raise ValueError("Embeddings not loaded")
        
        # Create FAISS index
        dimension = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(self.embeddings)
        
        # Add embeddings to index
        self.index.add(self.embeddings.astype('float32'))
        
        # Save index
        faiss.write_index(self.index, self.index_file)
        logger.info(f"FAISS index saved to {self.index_file}")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Perform semantic search"""
        if self.model is None or self.index is None:
            raise ValueError("Model or index not initialized")
        
        # Encode query
        query_embedding = self.model.encode([query])
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        # Prepare results
        results = []
        for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
            if idx < len(self.chunks):
                results.append({
                    'chunk': self.chunks[idx]['chunk'],
                    'metadata': self.chunks[idx]['metadata'],
                    'score': float(score),
                    'rank': i + 1
                })
        
        return results
    
    def generate_answer(self, query: str, search_results: List[Dict[str, Any]], 
                      use_openai: bool = True) -> str:
        """Generate answer using retrieved chunks"""
        if use_openai and self.openai_client:
            return self._generate_openai_answer(query, search_results)
        else:
            return self._generate_simple_answer(query, search_results)
    
    def _generate_openai_answer(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        """Generate answer using OpenAI GPT"""
        try:
            # Prepare context
            context = "\n\n".join([
                f"Source {i+1} ({result['metadata']['title']}):\n{result['chunk']}"
                for i, result in enumerate(search_results)
            ])
            
            prompt = f"""You are an expert AI assistant specializing in NASA bioscience research. 
            Answer the user's question based on the provided research context. 
            Be accurate, informative, and cite the sources when relevant.

            Question: {query}

            Context from NASA research papers:
            {context}

            Answer:"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating OpenAI answer: {e}")
            return self._generate_simple_answer(query, search_results)
    
    def _generate_simple_answer(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        """Generate a simple answer without external API"""
        if not search_results:
            return "I couldn't find relevant information to answer your question."
        
        # Simple answer based on top result
        top_result = search_results[0]
        answer = f"Based on NASA research, here's what I found:\n\n"
        answer += f"From '{top_result['metadata']['title']}':\n"
        answer += f"{top_result['chunk'][:500]}..."
        
        if len(search_results) > 1:
            answer += f"\n\nI found {len(search_results)} relevant sources. "
            answer += "Would you like me to provide more details from other sources?"
        
        return answer

# Initialize the chatbot
chatbot = NASAChatbot()

# Create FastAPI app
app = FastAPI(title="NASA Bioscience Chatbot", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    """Main endpoint for asking questions"""
    try:
        # Perform semantic search
        search_results = chatbot.search(request.query, request.top_k)
        
        # Generate answer
        answer = chatbot.generate_answer(request.query, search_results, request.use_openai)
        
        return QueryResponse(
            answer=answer,
            sources=search_results,
            query=request.query
        )
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", response_class=HTMLResponse)
async def get_frontend():
    """Serve the frontend interface"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NASA Bioscience Chatbot</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .main-content {
                padding: 40px;
            }
            
            .search-section {
                margin-bottom: 40px;
            }
            
            .search-box {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .search-input {
                flex: 1;
                padding: 15px 20px;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 16px;
                transition: border-color 0.3s;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .search-btn {
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .search-btn:hover {
                transform: translateY(-2px);
            }
            
            .search-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .options {
                display: flex;
                gap: 20px;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .option-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .option-group label {
                font-weight: 500;
                color: #555;
            }
            
            .option-group input, .option-group select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            
            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
            
            .spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .answer-section {
                background: #f8f9fa;
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
            }
            
            .answer-text {
                font-size: 1.1em;
                line-height: 1.6;
                color: #333;
                margin-bottom: 20px;
            }
            
            .sources-section {
                background: white;
                border-radius: 15px;
                padding: 30px;
                border: 1px solid #e1e5e9;
            }
            
            .sources-title {
                font-size: 1.3em;
                font-weight: 600;
                color: #333;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .source-item {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                border-left: 4px solid #667eea;
            }
            
            .source-title {
                font-weight: 600;
                color: #1e3c72;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .source-content {
                color: #666;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            
            .source-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.9em;
                color: #888;
            }
            
            .source-score {
                background: #667eea;
                color: white;
                padding: 4px 8px;
                border-radius: 15px;
                font-size: 0.8em;
            }
            
            .error {
                background: #fee;
                color: #c33;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #fcc;
                margin-bottom: 20px;
            }
            
            .stats {
                display: flex;
                gap: 20px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e1e5e9;
                color: #666;
                font-size: 0.9em;
            }
            
            @media (max-width: 768px) {
                .container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .header {
                    padding: 20px;
                }
                
                .header h1 {
                    font-size: 2em;
                }
                
                .main-content {
                    padding: 20px;
                }
                
                .search-box {
                    flex-direction: column;
                }
                
                .options {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 NASA Bioscience Chatbot</h1>
                <p>Ask questions about NASA's bioscience research publications</p>
            </div>
            
            <div class="main-content">
                <div class="search-section">
                    <div class="search-box">
                        <input type="text" id="queryInput" class="search-input" 
                               placeholder="Ask a question about NASA bioscience research..." 
                               onkeypress="handleKeyPress(event)">
                        <button id="searchBtn" class="search-btn" onclick="search()">
                            Search
                        </button>
                    </div>
                    
                    <div class="options">
                        <div class="option-group">
                            <label for="topK">Results:</label>
                            <select id="topK">
                                <option value="3">3</option>
                                <option value="5" selected>5</option>
                                <option value="10">10</option>
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <label for="useOpenAI">Use AI:</label>
                            <input type="checkbox" id="useOpenAI" checked>
                        </div>
                    </div>
                </div>
                
                <div id="loading" class="loading" style="display: none;">
                    <div class="spinner"></div>
                    <p>Searching NASA research database...</p>
                </div>
                
                <div id="error" class="error" style="display: none;"></div>
                
                <div id="answerSection" class="answer-section" style="display: none;">
                    <div id="answerText" class="answer-text"></div>
                </div>
                
                <div id="sourcesSection" class="sources-section" style="display: none;">
                    <div class="sources-title">
                        📚 Sources
                    </div>
                    <div id="sourcesList"></div>
                    <div id="stats" class="stats"></div>
                </div>
            </div>
        </div>
        
        <script>
            function handleKeyPress(event) {
                if (event.key === 'Enter') {
                    search();
                }
            }
            
            async function search() {
                const query = document.getElementById('queryInput').value.trim();
                if (!query) {
                    showError('Please enter a question');
                    return;
                }
                
                const topK = parseInt(document.getElementById('topK').value);
                const useOpenAI = document.getElementById('useOpenAI').checked;
                
                // Show loading
                showLoading(true);
                hideError();
                hideResults();
                
                try {
                    const response = await fetch('/ask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            query: query,
                            top_k: topK,
                            use_openai: useOpenAI
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    displayResults(data);
                    
                } catch (error) {
                    console.error('Error:', error);
                    showError('Failed to get answer. Please try again.');
                } finally {
                    showLoading(false);
                }
            }
            
            function displayResults(data) {
                // Display answer
                document.getElementById('answerText').innerHTML = formatText(data.answer);
                document.getElementById('answerSection').style.display = 'block';
                
                // Display sources
                const sourcesList = document.getElementById('sourcesList');
                sourcesList.innerHTML = '';
                
                data.sources.forEach((source, index) => {
                    const sourceDiv = document.createElement('div');
                    sourceDiv.className = 'source-item';
                    sourceDiv.innerHTML = `
                        <div class="source-title">${source.metadata.title}</div>
                        <div class="source-content">${truncateText(source.chunk, 300)}</div>
                        <div class="source-meta">
                            <span>Rank: ${source.rank}</span>
                            <span class="source-score">Score: ${source.score.toFixed(3)}</span>
                        </div>
                    `;
                    sourcesList.appendChild(sourceDiv);
                });
                
                document.getElementById('sourcesSection').style.display = 'block';
                
                // Display stats
                const stats = document.getElementById('stats');
                stats.innerHTML = `
                    <span>Query: "${data.query}"</span>
                    <span>Sources found: ${data.sources.length}</span>
                    <span>AI enhanced: ${document.getElementById('useOpenAI').checked ? 'Yes' : 'No'}</span>
                `;
            }
            
            function formatText(text) {
                return text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
            }
            
            function truncateText(text, maxLength) {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
            }
            
            function showLoading(show) {
                document.getElementById('loading').style.display = show ? 'block' : 'none';
                document.getElementById('searchBtn').disabled = show;
            }
            
            function showError(message) {
                const errorDiv = document.getElementById('error');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
            
            function hideError() {
                document.getElementById('error').style.display = 'none';
            }
            
            function hideResults() {
                document.getElementById('answerSection').style.display = 'none';
                document.getElementById('sourcesSection').style.display = 'none';
            }
            
            // Focus on input when page loads
            window.onload = function() {
                document.getElementById('queryInput').focus();
            };
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "chunks_loaded": len(chatbot.chunks)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
