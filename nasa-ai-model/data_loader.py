#!/usr/bin/env python3
"""
Data loading and preprocessing for NASA AI model
"""

import json
import pandas as pd
import yaml
from typing import List, Dict, Any
from pathlib import Path

class NASADataLoader:
    def __init__(self, config_path: str = "config.yaml"):
        """Initialize data loader with configuration"""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.papers_data = []
        self.taskbook_data = []
        self.combined_chunks = []
    
    def load_papers_data(self) -> List[Dict[str, Any]]:
        """Load papers data from JSONL file"""
        print("Loading papers data...")
        
        papers_file = self.config['data']['papers_file']
        max_length = self.config['data']['max_chunk_length']
        min_length = self.config['data']['min_chunk_length']
        
        try:
            with open(papers_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        data = json.loads(line.strip())
                        # Handle both field names
                        chunk_text = data.get('chunk_text_clean', data.get('chunk_text', ''))
                        
                        # Filter by length
                        if chunk_text and min_length <= len(str(chunk_text)) <= max_length:
                            self.papers_data.append({
                                'text': chunk_text,
                                'paper_id': data.get('paper_id', data.get('Paper_ID', f'Paper_{line_num}')),
                                'section': data.get('section', 'Unknown'),
                                'source': 'papers',
                                'metadata': {
                                    'title': data.get('title', ''),
                                    'authors': data.get('authors', ''),
                                    'year': data.get('year', ''),
                                    'chunk_index': data.get('chunk_index', 1)
                                }
                            })
                    except json.JSONDecodeError:
                        print(f"Error parsing line {line_num}")
                        continue
            
            print(f"Loaded {len(self.papers_data)} paper chunks")
            return self.papers_data
            
        except FileNotFoundError:
            print(f"Papers file not found: {papers_file}")
            return []
    
    def load_taskbook_data(self) -> List[Dict[str, Any]]:
        """Load Taskbook data from CSV file"""
        print("Loading Taskbook data...")
        
        taskbook_file = self.config['data']['taskbook_file']
        
        try:
            df = pd.read_csv(taskbook_file)
            
            for i, row in df.iterrows():
                title = row['Title']
                abstract = row['Abstract'] if pd.notna(row['Abstract']) else ""
                methods = row['Methods'] if pd.notna(row['Methods']) else ""
                results = row['Results'] if pd.notna(row['Results']) else ""
                conclusion = row['Conclusion'] if pd.notna(row['Conclusion']) else ""
                
                # Create chunks for each section
                sections = [
                    ('Abstract', abstract),
                    ('Methods', methods),
                    ('Results', results),
                    ('Conclusion', conclusion)
                ]
                
                for section_name, content in sections:
                    if content and len(str(content).strip()) > 50:
                        self.taskbook_data.append({
                            'text': f"Title: {title}\n{section_name}: {content}",
                            'paper_id': f"Taskbook_{i+1}",
                            'section': section_name,
                            'source': 'taskbook',
                            'metadata': {
                                'title': title,
                                'section': section_name,
                                'record_id': i + 1
                            }
                        })
            
            print(f"Loaded {len(self.taskbook_data)} Taskbook chunks")
            return self.taskbook_data
            
        except FileNotFoundError:
            print(f"Taskbook file not found: {taskbook_file}")
            return []
    
    def combine_datasets(self) -> List[Dict[str, Any]]:
        """Combine papers and Taskbook data"""
        print("Combining datasets...")
        
        self.combined_chunks = self.papers_data + self.taskbook_data
        
        print(f"Combined dataset: {len(self.combined_chunks)} total chunks")
        print(f"  - Papers: {len(self.papers_data)} chunks")
        print(f"  - Taskbook: {len(self.taskbook_data)} chunks")
        
        return self.combined_chunks
    
    def get_training_prompts(self) -> List[str]:
        """Generate training prompts from combined data"""
        print("Generating training prompts...")
        
        prompts = []
        
        for chunk in self.combined_chunks:
            text = chunk['text']
            paper_id = chunk['paper_id']
            section = chunk['section']
            source = chunk['source']
            
            # Create different prompt formats
            prompt_formats = [
                f"NASA Research Question: What does this research show?\nNASA Answer: {text}",
                f"Question: Explain this NASA research finding.\nAnswer: {text}",
                f"User: What is the significance of this research?\nAssistant: {text}",
                f"Human: Tell me about this space biology research.\nAI: {text}",
                f"Q: Summarize this NASA study.\nA: {text}",
            ]
            
            for prompt in prompt_formats:
                if len(prompt) > 100:  # Only include substantial prompts
                    prompts.append(prompt)
        
        print(f"Generated {len(prompts)} training prompts")
        return prompts
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get dataset statistics"""
        stats = {
            'total_chunks': len(self.combined_chunks),
            'papers_chunks': len(self.papers_data),
            'taskbook_chunks': len(self.taskbook_data),
            'sources': {
                'papers': len(self.papers_data),
                'taskbook': len(self.taskbook_data)
            },
            'sections': {},
            'avg_text_length': 0
        }
        
        # Section distribution
        for chunk in self.combined_chunks:
            section = chunk['section']
            stats['sections'][section] = stats['sections'].get(section, 0) + 1
        
        # Average text length
        if self.combined_chunks:
            total_length = sum(len(chunk['text']) for chunk in self.combined_chunks)
            stats['avg_text_length'] = total_length / len(self.combined_chunks)
        
        return stats

if __name__ == "__main__":
    # Test data loading
    loader = NASADataLoader()
    
    # Load data
    papers = loader.load_papers_data()
    taskbook = loader.load_taskbook_data()
    combined = loader.combine_datasets()
    
    # Get statistics
    stats = loader.get_statistics()
    print("\n=== Dataset Statistics ===")
    for key, value in stats.items():
        print(f"{key}: {value}")
    
    # Generate training prompts
    prompts = loader.get_training_prompts()
    print(f"\nGenerated {len(prompts)} training prompts")
    
    # Save sample prompts
    with open('sample_prompts.txt', 'w', encoding='utf-8') as f:
        for i, prompt in enumerate(prompts[:10]):
            f.write(f"=== Prompt {i+1} ===\n{prompt}\n\n")
    
    print("Sample prompts saved to 'sample_prompts.txt'")
