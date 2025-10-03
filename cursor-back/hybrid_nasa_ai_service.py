import os
import sys
import json
import pickle
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
import faiss
import re
from typing import List, Dict, Any, Optional

class HybridNASA_AI:
    """Hybrid NASA AI service combining Ollama model with RAG system"""
    
    def __init__(self, rag_system_path="../nasa-ai-model/rag_system", ollama_model="Ravurijeetendra12/ollama-nasa-model"):
        self.embedding_model = None
        self.faiss_index = None
        self.chunks = None
        self.rag_system_path = os.path.abspath(rag_system_path)
        self.ollama_model = ollama_model
        self.ollama_available = False
        self.ollama_base_url = "http://localhost:11434"
        
        print(f"RAG system path: {self.rag_system_path}")
        self.load_components()
        self.check_ollama_availability()
    
    def load_components(self):
        """Load the RAG system components"""
        try:
            print("Loading Hybrid NASA AI components...")
            
            # Load embedding model
            self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            
            # Load RAG components
            faiss_path = os.path.join(self.rag_system_path, "faiss_index.bin")
            chunks_path = os.path.join(self.rag_system_path, "chunks.pkl")
            
            if os.path.exists(faiss_path) and os.path.exists(chunks_path):
                self.faiss_index = faiss.read_index(faiss_path)
                with open(chunks_path, "rb") as f:
                    self.chunks = pickle.load(f)
                print(f"✅ RAG system loaded with {len(self.chunks)} research chunks")
            else:
                print("❌ RAG system files not found")
                
        except Exception as e:
            print(f"❌ Error loading RAG components: {e}")
    
    def check_ollama_availability(self):
        """Check if Ollama is running and the model is available"""
        try:
            # Check if Ollama is running
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [model.get("name", "") for model in models]
                
                # Check if our NASA model is available
                if any("nasa" in name.lower() or "ollama-nasa-model" in name.lower() for name in model_names):
                    self.ollama_available = True
                    print(f"✅ Ollama NASA model found: {[name for name in model_names if 'nasa' in name.lower()]}")
                else:
                    print(f"⚠️ Ollama running but NASA model not found. Available models: {model_names}")
                    # Try to use any available model as fallback
                    if model_names:
                        self.ollama_available = True
                        self.ollama_model = model_names[0]  # Use first available model
                        print(f"🔄 Using fallback model: {self.ollama_model}")
            else:
                print("❌ Ollama not responding")
        except Exception as e:
            print(f"❌ Ollama not available: {e}")
    
    def search_context(self, query: str, top_k: int = 8) -> List[Dict[str, Any]]:
        """Search for relevant context using RAG"""
        if not self.embedding_model or not self.faiss_index or not self.chunks:
            return []
        
        try:
            query_embedding = self.embedding_model.encode([query])
            D, I = self.faiss_index.search(query_embedding, top_k)
            
            results = []
            for i, score in zip(I[0], D[0]):
                if i != -1:
                    chunk = self.chunks[i]
                    results.append({
                        'text': chunk['text'],
                        'source': chunk.get('source', 'unknown'),
                        'paper_id': chunk.get('paper_id', 'N/A'),
                        'section': chunk.get('section', 'N/A'),
                        'score': float(score)
                    })
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    def get_ollama_response(self, query: str, context: str = "") -> str:
        """Get response from Ollama model"""
        if not self.ollama_available:
            return ""
        
        try:
            # Prepare the prompt with context
            if context:
                prompt = f"""You are a NASA Research Assistant specialized in space science. Based on the following NASA research context, provide a detailed and accurate answer to the user's question.

NASA Research Context:
{context}

User Question: {query}

Please provide a comprehensive answer based on the NASA research context above. Include specific details, scientific accuracy, and cite relevant findings when possible."""
            else:
                prompt = f"""You are a NASA Research Assistant specialized in space science. Answer the following question with detailed, scientifically accurate information about NASA research and space science.

Question: {query}

Provide a comprehensive answer with specific details about NASA research findings, space missions, and scientific discoveries."""
            
            # Call Ollama API
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 50,
                    "repeat_penalty": 1.1
                }
            }
            
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                print(f"Ollama API error: {response.status_code}")
                return ""
                
        except Exception as e:
            print(f"Ollama request error: {e}")
            return ""
    
    def generate_rag_response(self, query: str) -> str:
        """Generate response using RAG system only"""
        context_results = self.search_context(query, top_k=8)
        
        if not context_results:
            return "I don't have enough relevant information in the NASA research database to answer that question accurately."
        
        query_lower = query.lower()
        
        # Extract and combine relevant context
        context_texts = []
        for result in context_results[:5]:
            text = result['text']
            text = re.sub(r'\\s+', ' ', text).strip()
            if len(text) > 300:
                text = text[:300] + "..."
            context_texts.append(text)
        
        combined_context = " ".join(context_texts)
        
        # Generate response based on query type
        if any(word in query_lower for word in ['what is', 'define', 'definition']):
            if 'microgravity' in query_lower:
                response = f"""Microgravity is the condition of weightlessness experienced in space where gravitational forces are greatly reduced, typically defined as less than 1% of Earth's gravitational force (9.8 m/s²). 

This unique environment creates significant challenges and opportunities for biological research. According to NASA research findings: {combined_context[:200]}...

Key characteristics of microgravity include:
• Absence of gravitational loading on biological structures
• Altered fluid dynamics and distribution
• Changes in cellular behavior and gene expression
• Modified mechanical stress patterns in tissues

These effects have profound implications for astronaut health during space missions and provide valuable insights into fundamental biological processes on Earth."""
            else:
                response = f"""Based on comprehensive NASA research findings, this topic involves complex interactions between space environmental factors and biological systems. The research demonstrates: {combined_context[:200]}...

This area of study is critical for:
• Ensuring astronaut health and safety during space missions
• Understanding fundamental biological processes
• Developing effective countermeasures for space travel
• Advancing our knowledge of life in extreme environments"""
        
        elif any(word in query_lower for word in ['how does', 'effects', 'affects', 'impact']):
            if 'bone' in query_lower or 'density' in query_lower:
                response = f"""Bone density loss in microgravity represents one of the most significant health challenges for astronauts during long-duration space missions. This phenomenon occurs through multiple interconnected mechanisms:

Primary Causes:
• Reduced mechanical loading and weight-bearing stress
• Altered bone remodeling processes (increased bone resorption, decreased formation)
• Changes in calcium metabolism and vitamin D synthesis
• Modified hormonal regulation of bone homeostasis

NASA research provides extensive evidence indicating: {combined_context[:200]}...

Clinical Implications:
• Astronauts can lose 1-2% of bone mass per month in microgravity
• Trabecular bone is more affected than cortical bone
• Recovery on Earth can take months to years
• Risk of fractures increases significantly during and after missions

This research is crucial for developing effective countermeasures and understanding osteoporosis on Earth."""
            else:
                response = f"""Based on comprehensive NASA research findings, space environmental factors create complex interactions with biological systems that have profound implications for human health and mission success. The research demonstrates: {combined_context[:200]}...

These effects are influenced by multiple factors:
• Duration of exposure to space conditions
• Individual genetic and physiological variations
• Interactions between different space stressors
• Effectiveness of countermeasures and protective measures

Understanding these mechanisms is essential for:
• Ensuring astronaut safety during missions
• Developing effective prevention strategies
• Optimizing mission duration and objectives
• Advancing our knowledge of human physiology"""
        
        else:
            response = f"""Based on comprehensive NASA research findings, this topic represents a complex area of space biology that involves multiple interconnected systems and processes. The research demonstrates: {combined_context[:200]}...

Key Research Areas Include:
• Fundamental biological mechanisms affected by space conditions
• Long-term health implications for space travelers
• Development of effective prevention and treatment strategies
• Understanding of life processes in extreme environments

This research contributes to:
• Ensuring mission success and astronaut safety
• Advancing our understanding of human physiology
• Developing technologies for space exploration
• Improving health outcomes on Earth through space-based research

The findings represent decades of scientific investigation and continue to inform current and future space missions."""
        
        return response
    
    def generate_hybrid_response(self, query: str) -> Dict[str, Any]:
        """Generate hybrid response combining Ollama and RAG"""
        # Get context from RAG system
        context_results = self.search_context(query, top_k=8)
        
        # Prepare context string for Ollama
        context_text = ""
        if context_results:
            context_texts = []
            for result in context_results[:5]:
                text = result['text']
                text = re.sub(r'\\s+', ' ', text).strip()
                if len(text) > 200:
                    text = text[:200] + "..."
                context_texts.append(f"Paper {result['paper_id']}: {text}")
            context_text = "\\n\\n".join(context_texts)
        
        # Try to get Ollama response first
        ollama_response = ""
        if self.ollama_available:
            ollama_response = self.get_ollama_response(query, context_text)
        
        # Fallback to RAG if Ollama fails
        if not ollama_response:
            ollama_response = self.generate_rag_response(query)
        
        # Format sources
        sources_info = f"Based on {len(context_results)} NASA research papers"
        if context_results:
            paper_ids = [r['paper_id'] for r in context_results[:5]]
            sources_info += f" (including papers: {', '.join(paper_ids[:5])})"
        
        # Determine response type
        response_type = "Hybrid (Ollama + RAG)" if self.ollama_available else "RAG System"
        
        return {
            "response": ollama_response,
            "sources": context_results,
            "sources_info": sources_info,
            "confidence": "High" if context_results else "Low",
            "paper_count": len(context_results),
            "response_type": response_type,
            "ollama_available": self.ollama_available
        }
    
    def chat(self, message: str) -> Dict[str, Any]:
        """Main chat function for website integration"""
        try:
            if not message.strip():
                return {
                    "response": "Please enter a question about NASA space biology research.",
                    "sources": [],
                    "confidence": "Low"
                }
            
            # Generate hybrid response
            result = self.generate_hybrid_response(message)
            
            return result
            
        except Exception as e:
            return {
                "response": f"❌ Error: {str(e)}",
                "sources": [],
                "confidence": "Low"
            }

# Initialize the Hybrid NASA AI service
hybrid_nasa_ai = HybridNASA_AI()
