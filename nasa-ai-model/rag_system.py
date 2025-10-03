#!/usr/bin/env python3
"""
RAG (Retrieval-Augmented Generation) system for NASA AI
"""

import torch
import yaml
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from data_loader import NASADataLoader
import pickle
import os

class NASARAGSystem:
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize RAG system"""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.embedding_model = None
        self.index = None
        self.chunks = []
        self.embeddings = None
        
        # RAG settings
        self.rag_config = self.config['rag']
        self.top_k = self.rag_config['top_k_results']
        self.threshold = self.rag_config['similarity_threshold']
    
    def load_embedding_model(self):
        """Load sentence transformer model"""
        print("Loading embedding model...")
        
        model_name = self.rag_config['embedding_model']
        self.embedding_model = SentenceTransformer(model_name)
        
        print(f"Loaded embedding model: {model_name}")
        print(f"Embedding dimension: {self.embedding_model.get_sentence_embedding_dimension()}")
    
    def load_data(self):
        """Load and prepare data for RAG"""
        print("Loading data for RAG system...")
        
        # Load data using data loader
        data_loader = NASADataLoader()
        data_loader.load_papers_data()
        data_loader.load_taskbook_data()
        data_loader.combine_datasets()
        
        self.chunks = data_loader.combined_chunks
        
        print(f"Loaded {len(self.chunks)} chunks for RAG")
        
        # Get statistics
        stats = data_loader.get_statistics()
        print(f"Data statistics: {stats}")
    
    def generate_embeddings(self):
        """Generate embeddings for all chunks"""
        print("Generating embeddings...")
        
        if not self.embedding_model:
            self.load_embedding_model()
        
        # Extract texts
        texts = [chunk['text'] for chunk in self.chunks]
        
        # Generate embeddings
        self.embeddings = self.embedding_model.encode(
            texts, 
            show_progress_bar=True,
            batch_size=32
        )
        
        print(f"Generated {len(self.embeddings)} embeddings")
        print(f"Embedding shape: {self.embeddings.shape}")
    
    def create_faiss_index(self):
        """Create FAISS index for similarity search"""
        print("Creating FAISS index...")
        
        if self.embeddings is None:
            self.generate_embeddings()
        
        # Get embedding dimension
        dimension = self.embeddings.shape[1]
        
        # Create index based on configuration
        index_type = self.rag_config['index_type']
        
        if index_type == "IndexFlatIP":
            # Inner product (cosine similarity after normalization)
            self.index = faiss.IndexFlatIP(dimension)
            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(self.embeddings.astype('float32'))
        elif index_type == "IndexFlatL2":
            # L2 distance
            self.index = faiss.IndexFlatL2(dimension)
        else:
            raise ValueError(f"Unknown index type: {index_type}")
        
        # Add embeddings to index
        self.index.add(self.embeddings.astype('float32'))
        
        print(f"Created FAISS index with {self.index.ntotal} vectors")
    
    def search(self, query: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        """Search for relevant chunks"""
        if not self.index or not self.embedding_model:
            raise ValueError("RAG system not initialized. Call setup() first.")
        
        if top_k is None:
            top_k = self.top_k
        
        # Encode query
        query_embedding = self.embedding_model.encode([query])
        
        # Normalize for cosine similarity if using IndexFlatIP
        if self.rag_config['index_type'] == "IndexFlatIP":
            faiss.normalize_L2(query_embedding.astype('float32'))
        
        # Search
        scores, indices = self.index.search(
            query_embedding.astype('float32'), 
            top_k
        )
        
        # Format results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < len(self.chunks):
                chunk = self.chunks[idx]
                results.append({
                    'text': chunk['text'],
                    'score': float(score),
                    'paper_id': chunk['paper_id'],
                    'section': chunk['section'],
                    'source': chunk['source'],
                    'metadata': chunk.get('metadata', {})
                })
        
        # Filter by threshold
        results = [r for r in results if r['score'] >= self.threshold]
        
        return results
    
    def get_context(self, query: str, max_length: int = 2000) -> str:
        """Get context for a query"""
        results = self.search(query)
        
        context_parts = []
        current_length = 0
        
        for i, result in enumerate(results):
            text = result['text']
            source = result['source']
            section = result['section']
            paper_id = result['paper_id']
            
            # Format context part
            context_part = f"[Source {i+1} - {source} - {section}]: {text}"
            
            if current_length + len(context_part) > max_length:
                break
            
            context_parts.append(context_part)
            current_length += len(context_part)
        
        return "\n\n".join(context_parts)
    
    def setup(self):
        """Setup the complete RAG system"""
        print("Setting up RAG system...")
        
        # Load embedding model
        self.load_embedding_model()
        
        # Load data
        self.load_data()
        
        # Generate embeddings
        self.generate_embeddings()
        
        # Create FAISS index
        self.create_faiss_index()
        
        print("RAG system setup completed!")
    
    def save_system(self, save_path: str = "./rag_system"):
        """Save RAG system to disk"""
        print(f"Saving RAG system to {save_path}...")
        
        os.makedirs(save_path, exist_ok=True)
        
        # Save embeddings
        np.save(os.path.join(save_path, "embeddings.npy"), self.embeddings)
        
        # Save FAISS index
        faiss.write_index(self.index, os.path.join(save_path, "faiss_index.bin"))
        
        # Save chunks
        with open(os.path.join(save_path, "chunks.pkl"), 'wb') as f:
            pickle.dump(self.chunks, f)
        
        # Save embedding model
        self.embedding_model.save(os.path.join(save_path, "embedding_model"))
        
        print("RAG system saved successfully!")
    
    def load_system(self, load_path: str = "./rag_system"):
        """Load RAG system from disk"""
        print(f"Loading RAG system from {load_path}...")
        
        # Load embeddings
        self.embeddings = np.load(os.path.join(load_path, "embeddings.npy"))
        
        # Load FAISS index
        self.index = faiss.read_index(os.path.join(load_path, "faiss_index.bin"))
        
        # Load chunks
        with open(os.path.join(load_path, "chunks.pkl"), 'rb') as f:
            self.chunks = pickle.load(f)
        
        # Load embedding model
        self.embedding_model = SentenceTransformer(os.path.join(load_path, "embedding_model"))
        
        print("RAG system loaded successfully!")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get RAG system statistics"""
        stats = {
            'total_chunks': len(self.chunks),
            'embedding_dimension': self.embeddings.shape[1] if self.embeddings is not None else 0,
            'index_size': self.index.ntotal if self.index else 0,
            'sources': {},
            'sections': {}
        }
        
        # Count by source and section
        for chunk in self.chunks:
            source = chunk['source']
            section = chunk['section']
            
            stats['sources'][source] = stats['sources'].get(source, 0) + 1
            stats['sections'][section] = stats['sections'].get(section, 0) + 1
        
        return stats

def main():
    """Test RAG system"""
    print("=== NASA RAG System Setup ===")
    
    # Initialize RAG system
    rag = NASARAGSystem()
    
    # Setup system
    rag.setup()
    
    # Get statistics
    stats = rag.get_statistics()
    print(f"\nRAG System Statistics: {stats}")
    
    # Test search
    test_queries = [
        "What is microgravity?",
        "How does space affect bone density?",
        "What are the effects of radiation on astronauts?"
    ]
    
    print("\n=== Testing RAG Search ===")
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = rag.search(query, top_k=3)
        
        for i, result in enumerate(results):
            print(f"  {i+1}. Score: {result['score']:.3f} | Source: {result['source']} | Section: {result['section']}")
            print(f"     Text: {result['text'][:100]}...")
    
    # Save system
    rag.save_system()
    
    print("\n🎉 RAG system setup completed!")

if __name__ == "__main__":
    main()
