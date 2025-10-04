"""
Cross-Domain Synergy Service for NASA Task Book Dataset

This module provides a service layer for the CrossDomainSynergyAgent,
exposing its functionality for identifying synergies between different
research domains.
"""

import pandas as pd
import numpy as np
import re
import string
from typing import List, Tuple, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import networkx as nx
from collections import defaultdict
import warnings
import os
import json

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
        self.domain_stats = None
        self.summary_stats = None
        self.is_initialized = False
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            min_df=3,
            max_features=1000,
            strip_accents='unicode',
            analyzer='word',
            token_pattern=r'\w{1,}',
            ngram_range=(1, 2),
            use_idf=True,
            smooth_idf=True,
            sublinear_tf=True,
            stop_words='english'
        )

    def _preprocess_text(self, text: str) -> str:
        """
        Preprocesses text by lowercasing, removing punctuation, and extra spaces.
        """
        text = text.lower()
        text = re.sub(f'[{re.escape(string.punctuation)}]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def load_data(self, file_path: str = "Taskbook_cleaned_for_NLP.csv"):
        """
        Loads and preprocesses the NASA Task Book dataset.
        """
        try:
            self.df = pd.read_csv(file_path)
            print(f"Loaded CSV with columns: {self.df.columns.tolist()}")
            
            # Check available columns and create synthetic data for missing fields
            available_columns = self.df.columns.tolist()
            
            # Create synthetic Project_ID if missing
            if 'Project_ID' not in available_columns:
                self.df['Project_ID'] = [f"PROJ_{i+1:04d}" for i in range(len(self.df))]
            
            # Create synthetic Domain based on title keywords if missing
            if 'Domain' not in available_columns:
                def extract_domain(title):
                    title_lower = str(title).lower()
                    if any(word in title_lower for word in ['plant', 'botany', 'crop', 'agriculture']):
                        return 'Plants'
                    elif any(word in title_lower for word in ['bone', 'skeletal', 'osteoporosis']):
                        return 'Bone & Skeletal'
                    elif any(word in title_lower for word in ['muscle', 'muscular', 'atrophy']):
                        return 'Muscle & Exercise'
                    elif any(word in title_lower for word in ['radiation', 'dose', 'exposure']):
                        return 'Radiation Biology'
                    elif any(word in title_lower for word in ['microgravity', 'gravity', 'space']):
                        return 'Microgravity Effects'
                    elif any(word in title_lower for word in ['immune', 'immunity', 'infection']):
                        return 'Immune System'
                    elif any(word in title_lower for word in ['cardiovascular', 'heart', 'blood']):
                        return 'Cardiovascular'
                    elif any(word in title_lower for word in ['neural', 'brain', 'cognitive']):
                        return 'Neuroscience'
                    else:
                        return 'General Biology'
                
                self.df['Domain'] = self.df['Title'].apply(extract_domain)
            
            # Create synthetic funding data if missing
            if 'Funding' not in available_columns:
                np.random.seed(42)  # For reproducible results
                self.df['Funding'] = np.random.uniform(50000, 500000, len(self.df))
            
            # Create synthetic team size if missing
            if 'Team_Size' not in available_columns:
                np.random.seed(42)
                self.df['Team_Size'] = np.random.randint(2, 15, len(self.df))
            
            # Create synthetic status if missing
            if 'Status' not in available_columns:
                np.random.seed(42)
                statuses = ['Active', 'Completed', 'In Progress', 'Planning']
                self.df['Status'] = np.random.choice(statuses, len(self.df))
            
            # Create synthetic ROI if missing
            if 'ROI' not in available_columns:
                np.random.seed(42)
                self.df['ROI'] = np.random.uniform(50, 300, len(self.df))
            
            # Combine text from available columns
            text_columns = ['Title', 'Abstract', 'Methods', 'Results', 'Conclusion']
            available_text_columns = [col for col in text_columns if col in available_columns]
            
            if not available_text_columns:
                raise ValueError("No text columns found in the dataset")
            
            # Combine available text columns
            combined_text = ''
            for col in available_text_columns:
                combined_text += self.df[col].fillna('').astype(str) + ' '
            
            self.df['Combined_Text'] = combined_text.str.strip()
            self.processed_texts = self.df['Combined_Text'].apply(self._preprocess_text)
            
            # Filter out empty texts
            self.df = self.df[self.processed_texts.apply(len) > 0]
            self.processed_texts = self.processed_texts[self.processed_texts.apply(len) > 0]
            
            print(f"Data loaded and preprocessed. {len(self.df)} projects remaining.")
            print(f"Domains found: {self.df['Domain'].unique()}")
            return True
        except FileNotFoundError:
            print(f"Error: Data file not found at {file_path}")
            return False
        except Exception as e:
            print(f"Error loading or preprocessing data: {e}")
            return False

    def compute_tfidf_and_similarity(self):
        """
        Computes TF-IDF matrix and cosine similarity matrix.
        """
        if self.processed_texts is None or self.processed_texts.empty:
            print("Error: No processed texts available for TF-IDF computation.")
            return False
        
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.processed_texts)
            self.similarity_matrix = cosine_similarity(self.tfidf_matrix)
            print("TF-IDF and similarity matrix computed.")
            return True
        except Exception as e:
            print(f"Error computing TF-IDF or similarity: {e}")
            return False

    def identify_synergy_pairs(self) -> List[Dict[str, Any]]:
        """
        Identifies cross-domain synergy pairs based on similarity threshold.
        """
        if self.similarity_matrix is None:
            print("Error: Similarity matrix not computed.")
            return []
        
        synergy_pairs = []
        num_projects = len(self.df)
        
        # Create a mapping from index to Project_ID and Domain
        project_info = self.df[['Project_ID', 'Title', 'Domain', 'Funding', 'Team_Size', 'Status', 'ROI']].to_dict(orient='records')

        for i in range(num_projects):
            for j in range(i + 1, num_projects):
                similarity = self.similarity_matrix[i, j]
                if similarity >= self.similarity_threshold:
                    project_a = project_info[i]
                    project_b = project_info[j]
                    
                    # Only consider cross-domain synergies
                    if project_a['Domain'] != project_b['Domain']:
                        synergy_pairs.append({
                            'Project_A_ID': project_a['Project_ID'],
                            'Project_A_Title': project_a['Title'],
                            'Domain_A': project_a['Domain'],
                            'Project_B_ID': project_b['Project_ID'],
                            'Project_B_Title': project_b['Title'],
                            'Domain_B': project_b['Domain'],
                            'Similarity_Score': float(similarity),
                            'Project_A_Funding': float(project_a.get('Funding', 0)) if pd.notna(project_a.get('Funding')) else 0,
                            'Project_B_Funding': float(project_b.get('Funding', 0)) if pd.notna(project_b.get('Funding')) else 0,
                            'Project_A_Status': project_a.get('Status', 'Unknown'),
                            'Project_B_Status': project_b.get('Status', 'Unknown'),
                            'Project_A_ROI': float(project_a.get('ROI', 0)) if pd.notna(project_a.get('ROI')) else 0,
                            'Project_B_ROI': float(project_b.get('ROI', 0)) if pd.notna(project_b.get('ROI')) else 0,
                        })
        
        # Sort by similarity score
        self.synergy_pairs = sorted(synergy_pairs, key=lambda x: x['Similarity_Score'], reverse=True)
        print(f"Identified {len(self.synergy_pairs)} cross-domain synergy pairs.")
        return self.synergy_pairs

    def analyze_domain_statistics(self) -> List[Dict[str, Any]]:
        """
        Analyzes and returns statistics for each research domain.
        """
        if self.df is None:
            print("Error: Data not loaded for domain statistics.")
            return []
        
        domain_stats = []
        domain_groups = self.df.groupby('Domain')
        
        for domain_name, group in domain_groups:
            domain_synergies = [s for s in self.synergy_pairs if s['Domain_A'] == domain_name or s['Domain_B'] == domain_name]
            
            avg_similarity = np.mean([s['Similarity_Score'] for s in domain_synergies]) if domain_synergies else 0
            max_similarity = np.max([s['Similarity_Score'] for s in domain_synergies]) if domain_synergies else 0
            
            domain_stats.append({
                'Domain': domain_name,
                'Project_Count': len(group),
                'Synergy_Count': len(domain_synergies),
                'Avg_Similarity': float(avg_similarity),
                'Max_Similarity': float(max_similarity)
            })
        
        self.domain_stats = sorted(domain_stats, key=lambda x: x['Project_Count'], reverse=True)
        print("Domain statistics analyzed.")
        return self.domain_stats

    def get_summary_statistics(self) -> Dict[str, Any]:
        """
        Provides overall summary statistics of the synergy analysis.
        """
        if self.df is None or self.synergy_pairs is None:
            print("Error: Data or synergy pairs not available for summary statistics.")
            return {}
        
        total_projects = len(self.df)
        total_domains = self.df['Domain'].nunique()
        total_synergies = len(self.synergy_pairs)
        
        avg_synergy_score = np.mean([s['Similarity_Score'] for s in self.synergy_pairs]) if self.synergy_pairs else 0
        max_synergy_score = np.max([s['Similarity_Score'] for s in self.synergy_pairs]) if self.synergy_pairs else 0
        
        self.summary_stats = {
            'total_projects': total_projects,
            'total_domains': total_domains,
            'total_synergies': total_synergies,
            'avg_synergy_score': float(avg_synergy_score),
            'max_synergy_score': float(max_synergy_score),
            'last_updated': pd.Timestamp.now().isoformat()
        }
        print("Summary statistics generated.")
        return self.summary_stats

    def get_synergy_analysis(self) -> Dict[str, Any]:
        """
        Returns the complete synergy analysis including pairs, domain stats, and summary.
        """
        if not self.is_initialized:
            print("Synergy service not initialized. Please call initialize_service() first.")
            return {"success": False, "error": "Service not initialized"}
        
        return {
            "success": True,
            "synergies": self.synergy_pairs,
            "domain_stats": self.domain_stats,
            "summary_stats": self.summary_stats,
            "total_projects": self.summary_stats['total_projects'],
            "total_domains": self.summary_stats['total_domains'],
            "total_synergies": self.summary_stats['total_synergies']
        }

    def get_domain_synergies(self, domain: str, limit: int = 10) -> Dict[str, Any]:
        """
        Returns synergy pairs involving a specific domain.
        """
        if not self.is_initialized:
            return {"success": False, "error": "Service not initialized"}
        
        filtered_synergies = [
            s for s in self.synergy_pairs 
            if s['Domain_A'].lower() == domain.lower() or s['Domain_B'].lower() == domain.lower()
        ]
        return {
            "success": True,
            "domain": domain,
            "synergies": filtered_synergies[:limit],
            "total_synergies_for_domain": len(filtered_synergies)
        }

    def get_synergy_details(self, project_a_title: str, project_b_title: str) -> Dict[str, Any]:
        """
        Returns detailed information for a specific synergy pair.
        """
        if not self.is_initialized:
            return {"success": False, "error": "Service not initialized"}
        
        for synergy in self.synergy_pairs:
            if (synergy['Project_A_Title'].lower() == project_a_title.lower() and 
                synergy['Project_B_Title'].lower() == project_b_title.lower()) or \
               (synergy['Project_A_Title'].lower() == project_b_title.lower() and 
                synergy['Project_B_Title'].lower() == project_a_title.lower()):
                return {"success": True, "details": synergy}
        
        return {"success": False, "error": "Synergy pair not found"}

    def get_investment_recommendations(self, budget: float, risk_tolerance: str = "Medium") -> Dict[str, Any]:
        """
        Generates investment recommendations based on synergy analysis and budget/risk tolerance.
        """
        if not self.is_initialized:
            return {"success": False, "error": "Service not initialized"}
        
        # Filter synergies based on risk tolerance and potential ROI
        # This is a simplified logic; a real system would use more complex models
        
        if risk_tolerance.lower() == "low":
            # Prioritize high similarity, low risk, high ROI
            filtered_synergies = [
                s for s in self.synergy_pairs 
                if s['Similarity_Score'] > 0.7 and 
                   (s.get('Project_A_Status', 'Active') == 'Active' and s.get('Project_B_Status', 'Active') == 'Active')
            ]
        elif risk_tolerance.lower() == "medium":
            # Balance between risk and reward
            filtered_synergies = [
                s for s in self.synergy_pairs 
                if s['Similarity_Score'] > 0.5
            ]
        else: # High risk tolerance
            # Include more speculative but potentially high-reward synergies
            filtered_synergies = self.synergy_pairs
        
        # Sort by potential ROI (mocked for now)
        recommended_synergies = sorted(filtered_synergies, key=lambda x: x.get('Expected_ROI', 0), reverse=True)
        
        # Allocate budget (simplified)
        total_estimated_cost = 0
        selected_recommendations = []
        for synergy in recommended_synergies:
            project_a_cost = synergy.get('Project_A_Funding', 0)
            project_b_cost = synergy.get('Project_B_Funding', 0)
            synergy_cost = (project_a_cost + project_b_cost) * 0.5 # Assume 50% additional cost for synergy
            
            if total_estimated_cost + synergy_cost <= budget:
                total_estimated_cost += synergy_cost
                selected_recommendations.append({
                    "synergy_pair": f"{synergy['Domain_A']} - {synergy['Domain_B']}",
                    "project_a": synergy['Project_A_Title'],
                    "project_b": synergy['Project_B_Title'],
                    "similarity_score": synergy['Similarity_Score'],
                    "estimated_cost": float(synergy_cost),
                    "expected_roi": synergy.get('Expected_ROI', np.random.randint(100, 400)), # Mock ROI
                    "collaboration_potential": synergy.get('Collaboration_Potential', 'High'),
                    "risk_level": synergy.get('Risk_Level', 'Low')
                })
            else:
                break
        
        budget_utilization = (total_estimated_cost / budget) * 100 if budget > 0 else 0
        
        return {
            "success": True,
            "recommendations": selected_recommendations,
            "total_estimated_cost": float(total_estimated_cost),
            "budget_utilization": float(budget_utilization),
            "risk_tolerance": risk_tolerance
        }

    def refresh_analysis(self, file_path: str = "Taskbook_cleaned_for_NLP.csv") -> bool:
        """
        Refreshes the entire synergy analysis.
        """
        print("Refreshing synergy analysis...")
        self.is_initialized = False # Reset initialization status
        if self.load_data(file_path) and \
           self.compute_tfidf_and_similarity() and \
           self.identify_synergy_pairs() and \
           self.analyze_domain_statistics() and \
           self.get_summary_statistics():
            self.is_initialized = True
            print("Synergy analysis refreshed successfully.")
            return True
        else:
            print("Failed to refresh synergy analysis.")
            return False

# Global instance of the synergy agent
synergy_service = CrossDomainSynergyAgent()

def initialize_synergy_service():
    """
    Initializes the global synergy service.
    """
    print("Initializing Cross-Domain Synergy Service...")
    if synergy_service.refresh_analysis():
        print("Cross-Domain Synergy Service initialized successfully.")
        return True
    else:
        print("Failed to initialize Cross-Domain Synergy Service.")
        return False

# Attempt to initialize the service on module load
initialize_synergy_service()