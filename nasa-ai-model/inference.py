#!/usr/bin/env python3
"""
Inference module for NASA AI model
"""

import torch
import yaml
from transformers import AutoTokenizer, AutoModelForCausalLM
from rag_system import NASARAGSystem
from typing import List, Dict, Any, Optional
import os

class NASAInference:
    def __init__(self, config_path: str = "config.yaml", model_path: Optional[str] = None):
        """Initialize inference system"""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.tokenizer = None
        self.model = None
        self.rag_system = None
        
        # Model settings
        self.model_config = self.config['model']
        self.model_path = model_path or self.model_config.get('trained_model_path', os.path.join(self.model_config['output_dir'], "final_model"))
        
        # Generation settings
        self.temperature = self.model_config['temperature']
        self.top_k = self.model_config['top_k']
        self.top_p = self.model_config['top_p']
        self.repetition_penalty = self.model_config['repetition_penalty']
        self.max_length = self.model_config['max_length']
    
    def load_model(self):
        """Load trained model and tokenizer"""
        print("Loading NASA AI model...")
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load model
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
        )
        
        # Set to evaluation mode
        self.model.eval()
        
        print(f"Model loaded from {self.model_path}")
        print(f"Model parameters: {self.model.num_parameters():,}")
    
    def load_rag_system(self, rag_path: str = "./rag_system"):
        """Load RAG system"""
        print("Loading RAG system...")
        
        self.rag_system = NASARAGSystem()
        
        if os.path.exists(rag_path):
            self.rag_system.load_system(rag_path)
        else:
            print("RAG system not found, setting up new one...")
            self.rag_system.setup()
            self.rag_system.save_system(rag_path)
        
        print("RAG system loaded successfully!")
    
    def generate_response(self, query: str, use_rag: bool = True, max_new_tokens: int = 200) -> str:
        """Generate response to a query"""
        if not self.model or not self.tokenizer:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Get context from RAG if enabled
            context = ""
            if use_rag and self.rag_system:
                context = self.rag_system.get_context(query, max_length=1500)
            
            # Create prompt
            if context:
                prompt = f"Context: {context}\n\nQuestion: {query}\nAnswer:"
            else:
                prompt = f"Question: {query}\nAnswer:"
            
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=self.temperature,
                    top_k=self.top_k,
                    top_p=self.top_p,
                    repetition_penalty=self.repetition_penalty,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    do_sample=True,
                    no_repeat_ngram_size=3
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean response
            if "Answer:" in response:
                response = response.split("Answer:")[-1].strip()
            
            # Remove the original prompt
            if prompt in response:
                response = response.replace(prompt, "").strip()
            
            return response
            
        except Exception as e:
            return f"Error generating response: {e}"
    
    def chat(self, message: str, history: List[List[str]] = None, use_rag: bool = True) -> str:
        """Chat interface"""
        if history is None:
            history = []
        
        # Generate response
        response = self.generate_response(message, use_rag=use_rag)
        
        return response
    
    def batch_inference(self, queries: List[str], use_rag: bool = True) -> List[str]:
        """Generate responses for multiple queries"""
        responses = []
        
        for query in queries:
            response = self.generate_response(query, use_rag=use_rag)
            responses.append(response)
        
        return responses
    
    def get_rag_sources(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Get RAG sources for a query"""
        if not self.rag_system:
            return []
        
        return self.rag_system.search(query, top_k=top_k)
    
    def setup(self):
        """Setup the complete inference system"""
        print("Setting up NASA AI inference system...")
        
        # Load model
        self.load_model()
        
        # Load RAG system
        self.load_rag_system()
        
        print("Inference system setup completed!")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        info = {
            'model_path': self.model_path,
            'model_parameters': self.model.num_parameters() if self.model else 0,
            'tokenizer_vocab_size': len(self.tokenizer) if self.tokenizer else 0,
            'rag_enabled': self.rag_system is not None,
            'generation_settings': {
                'temperature': self.temperature,
                'top_k': self.top_k,
                'top_p': self.top_p,
                'repetition_penalty': self.repetition_penalty,
                'max_length': self.max_length
            }
        }
        
        if self.rag_system:
            info['rag_stats'] = self.rag_system.get_statistics()
        
        return info

def main():
    """Test inference system"""
    print("=== NASA AI Inference Test ===")
    
    # Initialize inference
    inference = NASAInference()
    
    # Setup system
    inference.setup()
    
    # Get model info
    info = inference.get_model_info()
    print(f"\nModel Info: {info}")
    
    # Test queries
    test_queries = [
        "What is microgravity?",
        "How does space affect bone density?",
        "What are the effects of radiation on astronauts?",
        "Explain muscle atrophy in space",
        "What countermeasures exist for space health issues?"
    ]
    
    print("\n=== Testing Inference ===")
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. User: {query}")
        
        # Generate response
        response = inference.generate_response(query, use_rag=True)
        print(f"   Assistant: {response}")
        
        # Get RAG sources
        sources = inference.get_rag_sources(query, top_k=2)
        if sources:
            print(f"   Sources: {len(sources)} relevant chunks found")
            for j, source in enumerate(sources):
                print(f"     {j+1}. {source['source']} - {source['section']} (score: {source['score']:.3f})")
    
    print("\n🎉 Inference test completed!")

if __name__ == "__main__":
    main()
