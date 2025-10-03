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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    sources: list
    query: str

# Initialize the chatbot components
logger.info("Loading NASA chatbot...")

# Load data
with open("step5_all_chunks[1].json", 'r', encoding='utf-8') as f:
    data = json.load(f)

chunks = []
for item in data:
    if 'Chunk' in item and 'Title' in item:
        chunks.append({
            'chunk': item['Chunk'],
            'metadata': {
                'title': item['Title'],
                'url': item.get('URL', 'N/A')
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
    """Simple search function"""
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

# Create FastAPI app
app = FastAPI(title="NASA Chatbot Simple")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    """Simple ask endpoint"""
    try:
        logger.info(f"Received query: {request.query}")
        
        # Search for relevant chunks
        search_results = search_chunks(request.query, request.top_k)
        
        # Create simple answer
        if search_results:
            top_result = search_results[0]
            answer = f"Based on NASA research from '{top_result['metadata']['title']}':\n\n"
            answer += top_result['chunk'][:500] + "..."
            
            if len(search_results) > 1:
                answer += f"\n\nFound {len(search_results)} relevant sources."
        else:
            answer = "I couldn't find relevant information for your question."
        
        logger.info(f"Returning answer with {len(search_results)} sources")
        
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
    """Simple frontend"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>NASA Chatbot</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .search-box { margin: 20px 0; }
            input[type="text"] { width: 70%; padding: 10px; font-size: 16px; }
            button { padding: 10px 20px; font-size: 16px; background: #007bff; color: white; border: none; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
            .source { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #007bff; }
            .loading { color: #666; }
            .error { color: red; background: #ffe6e6; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🚀 NASA Bioscience Chatbot</h1>
        <p>Ask questions about NASA's bioscience research publications</p>
        
        <div class="search-box">
            <input type="text" id="queryInput" placeholder="Ask a question..." />
            <button onclick="search()">Search</button>
        </div>
        
        <div id="result"></div>
        
        <script>
            async function search() {
                const query = document.getElementById('queryInput').value.trim();
                if (!query) {
                    showResult('Please enter a question', 'error');
                    return;
                }
                
                showResult('Searching...', 'loading');
                
                try {
                    const response = await fetch('/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: query, top_k: 5 })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    
                    const data = await response.json();
                    displayResults(data);
                    
                } catch (error) {
                    console.error('Error:', error);
                    showResult('Error: ' + error.message, 'error');
                }
            }
            
            function displayResults(data) {
                let html = '<div class="result">';
                html += '<h3>Answer:</h3>';
                html += '<p>' + data.answer.replace(/\\n/g, '<br>') + '</p>';
                
                if (data.sources && data.sources.length > 0) {
                    html += '<h3>Sources:</h3>';
                    data.sources.forEach(source => {
                        html += '<div class="source">';
                        html += '<strong>' + source.metadata.title + '</strong><br>';
                        html += source.chunk.substring(0, 200) + '...<br>';
                        html += '<small>Score: ' + source.score.toFixed(3) + '</small>';
                        html += '</div>';
                    });
                }
                
                html += '</div>';
                showResult(html);
            }
            
            function showResult(content, className = '') {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = content;
                resultDiv.className = className;
            }
            
            // Allow Enter key to search
            document.getElementById('queryInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    search();
                }
            });
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    return {"status": "healthy", "chunks": len(chunks)}

if __name__ == "__main__":
    logger.info("Starting NASA Chatbot on http://127.0.0.1:8002")
    uvicorn.run(app, host="127.0.0.1", port=8002)
