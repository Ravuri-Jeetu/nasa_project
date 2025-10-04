"""
Paper Similarity Service for Manager Dashboard
Identifies similar research papers and clusters them to help reduce redundant efforts and save costs.
Based on the Paper Similarity folder implementation.
"""
import pandas as pd
import numpy as np
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import networkx as nx

class PaperSimilarityService:
    """Service for detecting similar research papers and clustering them."""
    
    def __init__(self):
        self.df = None
        self.vectorizer = None
        self.similarity_matrix = None
        self.sentence_model = None
        self.embeddings = None
        
    def load_papers_data(self) -> bool:
        """Load papers data from JSONL file."""
        try:
            # Try to load from the paper similarity folder first
            jsonl_path = "../paper Similarity/duplication_waste_detector/all_papers_chunked.jsonl"
            if os.path.exists(jsonl_path):
                print(f"📄 Loading from JSONL: {jsonl_path}")
                return self._load_projects_jsonl(jsonl_path)
            else:
                print("⚠️ JSONL not found, falling back to taskbook data")
                # Fallback to taskbook data
                return self._load_taskbook_data()
        except Exception as e:
            print(f"❌ Error loading papers data: {e}")
            return False
    
    def _load_projects_jsonl(self, jsonl_path: str) -> bool:
        """Load projects from JSONL file using the Paper Similarity implementation."""
        try:
            print(f"📖 Reading JSONL file: {jsonl_path}")
            fields = ('abstract', 'results', 'conclusion', 'methods', 'title')
            projects = {}
            line_count = 0
            
            with open(jsonl_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line_count += 1
                    if line_count % 1000 == 0:
                        print(f"📄 Processed {line_count} lines...")
                    
                    try:
                        obj = json.loads(line)
                        pid = obj.get('paper_id')
                        section = obj.get('section', '').lower()
                        chunk_text = obj.get('chunk_text_clean', '')
                        
                        if pid not in projects:
                            projects[pid] = {
                                'paper_id': pid, 
                                'title': '', 
                                'abstract': '', 
                                'results': '', 
                                'conclusion': '', 
                                'methods': ''
                            }
                        
                        if section in fields:
                            projects[pid][section] += (' ' + chunk_text)
                        if section == 'title':
                            projects[pid]['title'] = chunk_text
                    except json.JSONDecodeError as e:
                        print(f"⚠️ JSON decode error on line {line_count}: {e}")
                        continue
            
            print(f"✅ Processed {line_count} lines, found {len(projects)} unique papers")
            
            # Merge fields into one text string
            merged = []
            for p in projects.values():
                text = ' '.join([p[f] for f in fields if p.get(f)])
                merged.append({
                    'paper_id': p['paper_id'], 
                    'title': p['title'], 
                    'text': text,
                    'abstract': p.get('abstract', ''),
                    'methods': p.get('methods', ''),
                    'results': p.get('results', ''),
                    'conclusion': p.get('conclusion', '')
                })
            
            self.df = pd.DataFrame(merged)
            print(f"📊 Created DataFrame with {len(self.df)} papers")
            
            # Filter out papers with no meaningful text
            self.df = self.df[self.df['text'].str.strip().str.len() > 50]
            print(f"📊 Filtered to {len(self.df)} papers with meaningful content")
            
            return len(self.df) > 0
            
        except Exception as e:
            print(f"❌ Error loading JSONL data: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _load_taskbook_data(self) -> bool:
        """Fallback to load taskbook data."""
        try:
            taskbook_path = "Taskbook_cleaned_for_NLP.csv"
            if not os.path.exists(taskbook_path):
                return False
            
            self.df = pd.read_csv(taskbook_path)
            
            # Standardize column names
            self.df = self.df.rename(columns={
                'Title': 'title',
                'Abstract': 'abstract',
                'Methods': 'methods',
                'Results': 'results',
                'Conclusion': 'conclusion',
                'Funding': 'funding_amount',
                'Team_Size': 'team_size',
                'Status': 'status',
                'ROI': 'roi'
            })
            
            # Fill missing values and create combined text
            text_columns = ['title', 'abstract', 'methods', 'results', 'conclusion']
            for col in text_columns:
                if col in self.df.columns:
                    self.df[col] = self.df[col].fillna('')
            
            # Create combined text for similarity analysis
            self.df['text'] = (
                self.df.get('title', '').fillna('') + ' ' +
                self.df.get('abstract', '').fillna('') + ' ' +
                self.df.get('methods', '').fillna('') + ' ' +
                self.df.get('results', '').fillna('') + ' ' +
                self.df.get('conclusion', '').fillna('')
            )
            
            # Remove empty texts
            self.df = self.df[self.df['text'].str.strip() != '']
            
            return len(self.df) > 0
            
        except Exception as e:
            print(f"Error loading taskbook data: {e}")
            return False
    
    def prepare_similarity_analysis(self, use_embeddings: bool = True) -> bool:
        """Prepare similarity analysis using TF-IDF or embeddings."""
        try:
            if self.df is None or len(self.df) == 0:
                return False
            
            texts = self.df['text'].tolist()
            
            if use_embeddings:
                # Use sentence transformers for better semantic similarity
                try:
                    self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
                    self.embeddings = self.sentence_model.encode(texts, show_progress_bar=True)
                    self.similarity_matrix = cosine_similarity(self.embeddings)
                    print(f"✅ Generated embeddings for {len(texts)} papers")
                    return True
                except Exception as e:
                    print(f"⚠️ Embeddings failed, falling back to TF-IDF: {e}")
                    use_embeddings = False
            
            if not use_embeddings:
                # Use TF-IDF for similarity
                self.vectorizer = TfidfVectorizer(
                    stop_words='english',
                    max_features=1000,
                    ngram_range=(1, 2)
                )
                tfidf_matrix = self.vectorizer.fit_transform(texts)
                self.similarity_matrix = cosine_similarity(tfidf_matrix)
                print(f"✅ Generated TF-IDF similarity matrix for {len(texts)} papers")
            
            return True
            
        except Exception as e:
            print(f"Error preparing similarity analysis: {e}")
            return False
    
    def cluster_papers(self, similarity_threshold: float = 0.8) -> Dict[str, Any]:
        """Cluster papers based on similarity using connected components (NetworkX approach)."""
        if self.similarity_matrix is None:
            return {'clusters': []}
        
        try:
            n = len(self.df)
            
            # Build graph of papers above threshold
            G = nx.Graph()
            for i in range(n):
                G.add_node(i)
                for j in range(i + 1, n):
                    if self.similarity_matrix[i, j] >= similarity_threshold:
                        G.add_edge(i, j, weight=self.similarity_matrix[i, j])
            
            # Find connected components (clusters)
            clusters = []
            cluster_id = 1
            
            for component in nx.connected_components(G):
                if len(component) > 1:  # Only clusters with more than one paper
                    member_list = list(component)
                    
                    # Calculate average similarity within cluster
                    sim_scores = []
                    for idx1 in member_list:
                        for idx2 in member_list:
                            if idx1 < idx2:
                                sim_scores.append(self.similarity_matrix[idx1, idx2])
                    
                    avg_sim = float(np.mean(sim_scores)) if sim_scores else 0.0
                    
                    # Get paper information for cluster members
                    cluster_papers = []
                    for idx in member_list:
                        paper = self.df.iloc[idx]
                        cluster_papers.append({
                            'paper_id': paper.get('paper_id', f'paper_{idx}'),
                            'title': paper.get('title', 'Unknown Title'),
                            'abstract': paper.get('abstract', '')[:200] + '...' if len(str(paper.get('abstract', ''))) > 200 else paper.get('abstract', ''),
                            'funding_amount': paper.get('funding_amount', 0),
                            'team_size': paper.get('team_size', 'Unknown'),
                            'status': paper.get('status', 'Unknown'),
                            'index': int(idx)
                        })
                    
                    clusters.append({
                        'cluster_id': cluster_id,
                        'papers': cluster_papers,
                        'average_similarity': round(avg_sim, 3),
                        'size': len(member_list),
                        'potential_savings': sum(p.get('funding_amount', 0) for p in cluster_papers[1:])  # Exclude first paper
                    })
                    cluster_id += 1
            
            return {'clusters': clusters}
            
        except Exception as e:
            print(f"Error clustering papers: {e}")
            return {'clusters': []}
    
    def find_similar_papers(self, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Find pairs of similar papers above the threshold."""
        if self.similarity_matrix is None:
            return []
        
        similar_pairs = []
        n = len(self.df)
        
        for i in range(n):
            for j in range(i + 1, n):
                similarity_score = self.similarity_matrix[i, j]
                
                if similarity_score >= threshold:
                    paper_1 = self.df.iloc[i]
                    paper_2 = self.df.iloc[j]
                    
                    # Calculate potential cost savings
                    funding_1 = paper_1.get('funding_amount', 0)
                    funding_2 = paper_2.get('funding_amount', 0)
                    
                    try:
                        if isinstance(funding_1, str):
                            funding_1 = float(funding_1.replace('$', '').replace(',', '')) if funding_1 else 0
                        if isinstance(funding_2, str):
                            funding_2 = float(funding_2.replace('$', '').replace(',', '')) if funding_2 else 0
                    except:
                        funding_1 = funding_2 = 0
                    
                    potential_savings = min(funding_1, funding_2)
                    
                    similar_pairs.append({
                        'paper_1': {
                            'paper_id': paper_1.get('paper_id', f'paper_{i}'),
                            'title': paper_1.get('title', 'Unknown Title'),
                            'abstract': paper_1.get('abstract', '')[:200] + '...' if len(str(paper_1.get('abstract', ''))) > 200 else paper_1.get('abstract', ''),
                            'funding_amount': funding_1,
                            'team_size': paper_1.get('team_size', 'Unknown'),
                            'status': paper_1.get('status', 'Unknown'),
                            'index': i
                        },
                        'paper_2': {
                            'paper_id': paper_2.get('paper_id', f'paper_{j}'),
                            'title': paper_2.get('title', 'Unknown Title'),
                            'abstract': paper_2.get('abstract', '')[:200] + '...' if len(str(paper_2.get('abstract', ''))) > 200 else paper_2.get('abstract', ''),
                            'funding_amount': funding_2,
                            'team_size': paper_2.get('team_size', 'Unknown'),
                            'status': paper_2.get('status', 'Unknown'),
                            'index': j
                        },
                        'similarity_score': round(similarity_score, 3),
                        'potential_savings': potential_savings,
                        'severity': self._calculate_severity(similarity_score, potential_savings)
                    })
        
        # Sort by similarity score (highest first)
        similar_pairs.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similar_pairs
    
    def _calculate_severity(self, similarity_score: float, potential_savings: float) -> str:
        """Calculate severity level based on similarity and potential savings."""
        if similarity_score >= 0.9 and potential_savings >= 100000:
            return "Critical"
        elif similarity_score >= 0.8 and potential_savings >= 50000:
            return "High"
        elif similarity_score >= 0.7 and potential_savings >= 10000:
            return "Medium"
        else:
            return "Low"
    
    def get_paper_similarity_analysis(self, threshold: float = 0.7, use_clustering: bool = True) -> Dict[str, Any]:
        """Get comprehensive paper similarity analysis."""
        try:
            # Get similar pairs
            similar_pairs = self.find_similar_papers(threshold)
            
            # Get clusters if requested
            clusters = []
            if use_clustering:
                cluster_result = self.cluster_papers(threshold)
                clusters = cluster_result.get('clusters', [])
            
            # Calculate summary statistics
            total_similar_pairs = len(similar_pairs)
            total_potential_savings = sum(pair['potential_savings'] for pair in similar_pairs)
            
            severity_breakdown = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
            for pair in similar_pairs:
                severity_breakdown[pair['severity']] += 1
            
            average_similarity = np.mean([pair['similarity_score'] for pair in similar_pairs]) if similar_pairs else 0
            
            return {
                'success': True,
                'data': {
                    'total_similar_pairs': total_similar_pairs,
                    'total_clusters': len(clusters),
                    'total_potential_savings': total_potential_savings,
                    'severity_breakdown': severity_breakdown,
                    'average_similarity': round(average_similarity, 3),
                    'top_similar_pairs': similar_pairs[:10],  # Top 10 most similar pairs
                    'clusters': clusters,
                    'threshold_used': threshold
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': None
            }

# Global instance
paper_similarity_service = PaperSimilarityService()

def initialize_paper_similarity_service() -> bool:
    """Initialize the paper similarity service."""
    try:
        print("🚀 Initializing Paper Similarity Service...")
        
        # Step 1: Load papers data
        print("📚 Step 1: Loading papers data...")
        if not paper_similarity_service.load_papers_data():
            print("❌ Failed to load papers data")
            return False
        
        # Step 2: Prepare similarity analysis
        print("🔍 Step 2: Preparing similarity analysis...")
        if not paper_similarity_service.prepare_similarity_analysis():
            print("❌ Failed to prepare similarity analysis")
            return False
        
        print("✅ Paper Similarity Service initialized successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing paper similarity service: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_paper_similarity_analysis(threshold: float = 0.7, use_clustering: bool = True) -> Dict[str, Any]:
    """Get paper similarity analysis for the Manager dashboard."""
    try:
        return paper_similarity_service.get_paper_similarity_analysis(threshold, use_clustering)
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': None
        }
