"""
Cross-Domain Synergy Agent for NASA Task Book Dataset

This module provides functionality to analyze NASA Task Book research projects
and identify synergies between different research domains using TF-IDF vectorization
and cosine similarity analysis.
"""

import pandas as pd
import numpy as np
import re
import string
from typing import List, Tuple, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
import networkx as nx
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

class CrossDomainSynergyAgent:
    """
    Agent for identifying cross-domain synergies in NASA Task Book research projects.
    
    This agent analyzes research projects across different domains and identifies
    potential collaboration opportunities based on textual similarity analysis.
    """
    
    def __init__(self, similarity_threshold: float = 0.3, min_domain_size: int = 5):
        """
        Initialize the Cross-Domain Synergy Agent.
        
        Args:
            similarity_threshold: Minimum cosine similarity score for synergy pairs
            min_domain_size: Minimum number of projects required per domain
        """
        self.similarity_threshold = similarity_threshold
        self.min_domain_size = min_domain_size
        self.df = None
        self.processed_texts = None
        self.tfidf_matrix = None
        self.similarity_matrix = None
        self.domain_mapping = None
        self.synergy_pairs = None
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95
        )
    
    def load_data(self, file_path: str) -> pd.DataFrame:
        """
        Load the NASA Task Book dataset.
        
        Args:
            file_path: Path to the CSV file
            
        Returns:
            Loaded DataFrame
        """
        print(f"Loading data from {file_path}...")
        self.df = pd.read_csv(file_path)
        print(f"Loaded {len(self.df)} projects")
        print(f"Columns: {list(self.df.columns)}")
        return self.df
    
    def extract_domains(self) -> Dict[str, str]:
        """
        Extract research domains from project titles and abstracts.
        
        This method uses keyword-based domain classification to categorize
        projects into different research domains.
        
        Returns:
            Dictionary mapping project indices to domain names
        """
        print("Extracting research domains...")
        
        # Define domain keywords
        domain_keywords = {
            'Space Biology': [
                'biology', 'biological', 'cell', 'cellular', 'tissue', 'muscle', 'bone',
                'immune', 'cardiovascular', 'neural', 'endocrine', 'physiology', 'metabolism',
                'protein', 'gene', 'dna', 'rna', 'stem cell', 'regeneration', 'microgravity',
                'spaceflight', 'radiation', 'oxidative', 'apoptosis', 'differentiation'
            ],
            'Human Research': [
                'human', 'astronaut', 'crew', 'behavior', 'psychology', 'cognitive',
                'performance', 'fatigue', 'sleep', 'circadian', 'stress', 'adaptation',
                'countermeasure', 'exercise', 'nutrition', 'health', 'medical'
            ],
            'Physical Sciences': [
                'physics', 'fluid', 'combustion', 'crystal', 'material', 'thermal',
                'optical', 'laser', 'plasma', 'electromagnetic', 'gravity', 'mechanics',
                'dynamics', 'thermodynamics', 'quantum', 'atomic', 'molecular'
            ],
            'Technology Development': [
                'technology', 'engineering', 'system', 'instrument', 'sensor',
                'robotic', 'automation', 'software', 'algorithm', 'data', 'communication',
                'navigation', 'propulsion', 'power', 'energy', 'structure'
            ],
            'Earth Science': [
                'earth', 'climate', 'atmosphere', 'ocean', 'land', 'ecosystem',
                'environment', 'remote sensing', 'satellite', 'observation', 'monitoring'
            ],
            'Planetary Science': [
                'planet', 'mars', 'moon', 'asteroid', 'comet', 'solar', 'space',
                'exploration', 'mission', 'rover', 'lander', 'orbiter'
            ]
        }
        
        domain_mapping = {}
        
        for idx, row in self.df.iterrows():
            # Combine title and abstract for domain classification
            text = f"{str(row.get('Title', ''))} {str(row.get('Abstract', ''))}".lower()
            
            domain_scores = {}
            for domain, keywords in domain_keywords.items():
                score = sum(1 for keyword in keywords if keyword in text)
                domain_scores[domain] = score
            
            # Assign to domain with highest score, or 'Other' if no clear match
            if domain_scores and max(domain_scores.values()) > 0:
                assigned_domain = max(domain_scores, key=domain_scores.get)
                domain_mapping[idx] = assigned_domain
            else:
                domain_mapping[idx] = 'Other'
        
        self.domain_mapping = domain_mapping
        
        # Print domain distribution
        domain_counts = pd.Series(domain_mapping).value_counts()
        print("\nDomain Distribution:")
        for domain, count in domain_counts.items():
            print(f"  {domain}: {count} projects")
        
        return domain_mapping
    
    def preprocess_text(self) -> List[str]:
        """
        Preprocess text data for analysis.
        
        Returns:
            List of preprocessed text strings
        """
        print("Preprocessing text data...")
        
        def clean_text(text):
            """Clean and preprocess individual text."""
            if pd.isna(text):
                return ""
            
            # Convert to string and lowercase
            text = str(text).lower()
            
            # Remove special characters and extra whitespace
            text = re.sub(r'[^\w\s]', ' ', text)
            text = re.sub(r'\s+', ' ', text)
            
            return text.strip()
        
        # Combine title, abstract, methods, results, and conclusion
        processed_texts = []
        for idx, row in self.df.iterrows():
            combined_text = " ".join([
                clean_text(row.get('Title', '')),
                clean_text(row.get('Abstract', '')),
                clean_text(row.get('Methods', '')),
                clean_text(row.get('Results', '')),
                clean_text(row.get('Conclusion', ''))
            ])
            processed_texts.append(combined_text)
        
        self.processed_texts = processed_texts
        print(f"Preprocessed {len(processed_texts)} text documents")
        return processed_texts
    
    def compute_similarities(self) -> np.ndarray:
        """
        Compute TF-IDF vectors and cosine similarities.
        
        Returns:
            Cosine similarity matrix
        """
        print("Computing TF-IDF vectors and cosine similarities...")
        
        # Fit TF-IDF vectorizer and transform texts
        self.tfidf_matrix = self.vectorizer.fit_transform(self.processed_texts)
        print(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
        
        # Compute cosine similarities
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
        print(f"Similarity matrix shape: {self.similarity_matrix.shape}")
        
        return self.similarity_matrix
    
    def find_cross_domain_synergies(self) -> pd.DataFrame:
        """
        Identify cross-domain synergy pairs.
        
        Returns:
            DataFrame containing synergy pairs with their details
        """
        print("Identifying cross-domain synergies...")
        
        if self.similarity_matrix is None:
            self.compute_similarities()
        
        synergy_pairs = []
        
        # Get domain counts to filter out small domains
        domain_counts = pd.Series(self.domain_mapping).value_counts()
        valid_domains = domain_counts[domain_counts >= self.min_domain_size].index.tolist()
        
        print(f"Analyzing synergies across {len(valid_domains)} domains with >={self.min_domain_size} projects")
        
        # Find cross-domain pairs with high similarity
        for i in range(len(self.df)):
            for j in range(i + 1, len(self.df)):
                similarity = self.similarity_matrix[i][j]
                
                if similarity >= self.similarity_threshold:
                    domain_i = self.domain_mapping[i]
                    domain_j = self.domain_mapping[j]
                    
                    # Only consider cross-domain pairs with valid domains
                    if (domain_i != domain_j and 
                        domain_i in valid_domains and 
                        domain_j in valid_domains):
                        
                        synergy_pairs.append({
                            'Project_A_Index': i,
                            'Project_A_Title': self.df.iloc[i]['Title'],
                            'Domain_A': domain_i,
                            'Project_B_Index': j,
                            'Project_B_Title': self.df.iloc[j]['Title'],
                            'Domain_B': domain_j,
                            'Similarity_Score': similarity
                        })
        
        self.synergy_pairs = pd.DataFrame(synergy_pairs)
        
        if len(self.synergy_pairs) > 0:
            self.synergy_pairs = self.synergy_pairs.sort_values('Similarity_Score', ascending=False)
            print(f"Found {len(self.synergy_pairs)} cross-domain synergy pairs")
        else:
            print("No cross-domain synergy pairs found with current threshold")
        
        return self.synergy_pairs
    
    def get_top_synergies(self, n: int = 10) -> pd.DataFrame:
        """
        Get top N synergy pairs.
        
        Args:
            n: Number of top synergies to return
            
        Returns:
            DataFrame with top synergy pairs
        """
        if self.synergy_pairs is None:
            self.find_cross_domain_synergies()
        
        return self.synergy_pairs.head(n)
    
    def print_top_synergies(self, n: int = 10):
        """Print top synergy pairs in a formatted way."""
        top_synergies = self.get_top_synergies(n)
        
        if len(top_synergies) == 0:
            print("No synergy pairs found.")
            return
        
        print(f"\n=== TOP {len(top_synergies)} CROSS-DOMAIN SYNERGIES ===")
        print("=" * 80)
        
        for idx, row in top_synergies.iterrows():
            print(f"\nSynergy #{idx + 1} (Score: {row['Similarity_Score']:.3f})")
            print(f"Domain A: {row['Domain_A']}")
            print(f"Project A: {row['Project_A_Title']}")
            print(f"Domain B: {row['Domain_B']}")
            print(f"Project B: {row['Project_B_Title']}")
            print("-" * 80)
    
    def create_domain_network(self, top_n: int = 20) -> nx.Graph:
        """
        Create a network graph showing domain connections.
        
        Args:
            top_n: Number of top synergy pairs to include in the network
            
        Returns:
            NetworkX graph object
        """
        print(f"Creating domain network graph with top {top_n} synergies...")
        
        if self.synergy_pairs is None:
            self.find_cross_domain_synergies()
        
        G = nx.Graph()
        
        # Add nodes for each domain
        domain_counts = pd.Series(self.domain_mapping).value_counts()
        for domain, count in domain_counts.items():
            if count >= self.min_domain_size:
                G.add_node(domain, size=count)
        
        # Add edges for top synergy pairs
        top_synergies = self.synergy_pairs.head(top_n)
        
        for _, row in top_synergies.iterrows():
            domain_a = row['Domain_A']
            domain_b = row['Domain_B']
            similarity = row['Similarity_Score']
            
            if G.has_edge(domain_a, domain_b):
                # If edge exists, update weight (average similarity)
                current_weight = G[domain_a][domain_b]['weight']
                G[domain_a][domain_b]['weight'] = (current_weight + similarity) / 2
                G[domain_a][domain_b]['count'] += 1
            else:
                G.add_edge(domain_a, domain_b, weight=similarity, count=1)
        
        return G
    
    def visualize_network(self, top_n: int = 20, figsize: Tuple[int, int] = (12, 8)):
        """
        Visualize the domain network graph.
        
        Args:
            top_n: Number of top synergy pairs to include
            figsize: Figure size for the plot
        """
        G = self.create_domain_network(top_n)
        
        plt.figure(figsize=figsize)
        
        # Calculate layout
        pos = nx.spring_layout(G, k=3, iterations=50)
        
        # Draw nodes
        node_sizes = [G.nodes[node]['size'] * 20 for node in G.nodes()]
        nx.draw_networkx_nodes(G, pos, node_size=node_sizes, 
                              node_color='lightblue', alpha=0.7)
        
        # Draw edges with thickness proportional to similarity
        edges = G.edges()
        weights = [G[u][v]['weight'] for u, v in edges]
        nx.draw_networkx_edges(G, pos, width=[w * 5 for w in weights], 
                              alpha=0.6, edge_color='gray')
        
        # Draw labels
        nx.draw_networkx_labels(G, pos, font_size=10, font_weight='bold')
        
        # Add edge labels for weights
        edge_labels = {(u, v): f"{G[u][v]['weight']:.2f}" for u, v in edges}
        nx.draw_networkx_edge_labels(G, pos, edge_labels, font_size=8)
        
        plt.title(f'Cross-Domain Synergy Network\n(Top {top_n} Synergies, Threshold: {self.similarity_threshold})')
        plt.axis('off')
        plt.tight_layout()
        plt.show()
    
    def create_synergy_heatmap(self, figsize: Tuple[int, int] = (10, 8)):
        """
        Create a heatmap showing domain-to-domain synergy scores.
        
        Args:
            figsize: Figure size for the plot
        """
        if self.synergy_pairs is None:
            self.find_cross_domain_synergies()
        
        # Create domain-to-domain similarity matrix
        domains = list(set(self.domain_mapping.values()))
        domain_similarity_matrix = pd.DataFrame(0.0, index=domains, columns=domains)
        
        for _, row in self.synergy_pairs.iterrows():
            domain_a = row['Domain_A']
            domain_b = row['Domain_B']
            similarity = row['Similarity_Score']
            
            domain_similarity_matrix.loc[domain_a, domain_b] = similarity
            domain_similarity_matrix.loc[domain_b, domain_a] = similarity
        
        # Set diagonal to 0 (same domain)
        np.fill_diagonal(domain_similarity_matrix.values, 0)
        
        plt.figure(figsize=figsize)
        sns.heatmap(domain_similarity_matrix, annot=True, cmap='YlOrRd', 
                   fmt='.3f', cbar_kws={'label': 'Average Similarity Score'})
        plt.title('Cross-Domain Synergy Heatmap')
        plt.xlabel('Domain B')
        plt.ylabel('Domain A')
        plt.tight_layout()
        plt.show()
    
    def get_domain_statistics(self) -> pd.DataFrame:
        """
        Get statistics about domains and their synergies.
        
        Returns:
            DataFrame with domain statistics
        """
        if self.synergy_pairs is None:
            self.find_cross_domain_synergies()
        
        domain_stats = []
        domain_counts = pd.Series(self.domain_mapping).value_counts()
        
        for domain in domain_counts.index:
            if domain_counts[domain] >= self.min_domain_size:
                # Count synergies involving this domain
                domain_synergies = self.synergy_pairs[
                    (self.synergy_pairs['Domain_A'] == domain) | 
                    (self.synergy_pairs['Domain_B'] == domain)
                ]
                
                avg_similarity = domain_synergies['Similarity_Score'].mean() if len(domain_synergies) > 0 else 0
                max_similarity = domain_synergies['Similarity_Score'].max() if len(domain_synergies) > 0 else 0
                
                domain_stats.append({
                    'Domain': domain,
                    'Project_Count': domain_counts[domain],
                    'Synergy_Count': len(domain_synergies),
                    'Avg_Similarity': avg_similarity,
                    'Max_Similarity': max_similarity
                })
        
        return pd.DataFrame(domain_stats).sort_values('Synergy_Count', ascending=False)
    
    def save_results(self, output_dir: str = "synergy_results"):
        """
        Save analysis results to files.
        
        Args:
            output_dir: Directory to save results
        """
        import os
        
        os.makedirs(output_dir, exist_ok=True)
        
        if self.synergy_pairs is not None:
            self.synergy_pairs.to_csv(f"{output_dir}/synergy_pairs.csv", index=False)
            print(f"Synergy pairs saved to {output_dir}/synergy_pairs.csv")
        
        domain_stats = self.get_domain_statistics()
        domain_stats.to_csv(f"{output_dir}/domain_statistics.csv", index=False)
        print(f"Domain statistics saved to {output_dir}/domain_statistics.csv")
        
        # Save network graph
        G = self.create_domain_network()
        nx.write_graphml(G, f"{output_dir}/domain_network.graphml")
        print(f"Network graph saved to {output_dir}/domain_network.graphml")
    
    def run_full_analysis(self, file_path: str, output_dir: str = "synergy_results"):
        """
        Run the complete cross-domain synergy analysis.
        
        Args:
            file_path: Path to the NASA Task Book CSV file
            output_dir: Directory to save results
        """
        print("=" * 80)
        print("CROSS-DOMAIN SYNERGY AGENT - NASA TASK BOOK ANALYSIS")
        print("=" * 80)
        
        # Load and process data
        self.load_data(file_path)
        self.extract_domains()
        self.preprocess_text()
        self.compute_similarities()
        
        # Find synergies
        synergies = self.find_cross_domain_synergies()
        
        # Display results
        self.print_top_synergies(10)
        
        # Create visualizations
        print("\nCreating visualizations...")
        self.visualize_network()
        self.create_synergy_heatmap()
        
        # Show domain statistics
        print("\nDomain Statistics:")
        domain_stats = self.get_domain_statistics()
        print(domain_stats.to_string(index=False))
        
        # Save results
        self.save_results(output_dir)
        
        print(f"\nAnalysis complete! Results saved to {output_dir}/")
        return synergies


if __name__ == "__main__":
    # Example usage
    agent = CrossDomainSynergyAgent(similarity_threshold=0.3, min_domain_size=5)
    synergies = agent.run_full_analysis("Taskbook_cleaned_for_NLP.csv")
