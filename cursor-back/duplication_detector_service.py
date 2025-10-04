"""
Duplication & Waste Detector Service for Manager Dashboard
Identifies overlapping or duplicate research projects to help reduce redundant efforts and save costs.
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional
import os
import json

class DuplicationDetector:
    """Service for detecting duplicate or overlapping research projects."""
    
    def __init__(self):
        self.df = None
        self.vectorizer = None
        self.similarity_matrix = None
        
    def load_taskbook_data(self) -> bool:
        """Load the Taskbook data for duplication detection."""
        try:
            # Try to load from the duplication detector folder first
            taskbook_path = "../duplication_waste_detector/Taskbook_cleaned_for_NLP.csv"
            if os.path.exists(taskbook_path):
                self.df = pd.read_csv(taskbook_path)
            else:
                # Fallback to the main taskbook file
                taskbook_path = "Taskbook_cleaned_for_NLP.csv"
                if os.path.exists(taskbook_path):
                    self.df = pd.read_csv(taskbook_path)
                else:
                    return False
            
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
            
            # Fill missing values
            text_columns = ['title', 'abstract', 'methods', 'results', 'conclusion']
            for col in text_columns:
                if col in self.df.columns:
                    self.df[col] = self.df[col].fillna('')
            
            return True
        except Exception as e:
            print(f"Error loading taskbook data: {e}")
            return False
    
    def prepare_text_features(self) -> bool:
        """Prepare text features for similarity calculation."""
        try:
            if self.df is None:
                return False
            
            # Combine relevant text fields
            self.df['combined_text'] = (
                self.df.get('title', '').fillna('') + ' ' +
                self.df.get('abstract', '').fillna('') + ' ' +
                self.df.get('methods', '').fillna('') + ' ' +
                self.df.get('results', '').fillna('') + ' ' +
                self.df.get('conclusion', '').fillna('')
            )
            
            # Remove empty texts
            self.df = self.df[self.df['combined_text'].str.strip() != '']
            
            if len(self.df) == 0:
                return False
            
            # Create TF-IDF vectors
            self.vectorizer = TfidfVectorizer(
                stop_words='english',
                max_features=1000,
                ngram_range=(1, 2)
            )
            
            tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_text'])
            self.similarity_matrix = cosine_similarity(tfidf_matrix)
            
            return True
        except Exception as e:
            print(f"Error preparing text features: {e}")
            return False
    
    def detect_duplicates(self, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Detect duplicate/overlapping projects based on similarity threshold."""
        if self.similarity_matrix is None:
            return []
        
        duplicates = []
        n = len(self.df)
        
        for i in range(n):
            for j in range(i + 1, n):
                similarity_score = self.similarity_matrix[i, j]
                
                if similarity_score >= threshold:
                    project_1 = self.df.iloc[i]
                    project_2 = self.df.iloc[j]
                    
                    # Calculate potential cost savings
                    funding_1 = project_1.get('funding_amount', 0)
                    funding_2 = project_2.get('funding_amount', 0)
                    
                    # Handle different funding formats
                    try:
                        if isinstance(funding_1, str):
                            funding_1 = float(funding_1.replace('$', '').replace(',', '')) if funding_1 else 0
                        if isinstance(funding_2, str):
                            funding_2 = float(funding_2.replace('$', '').replace(',', '')) if funding_2 else 0
                    except:
                        funding_1 = funding_2 = 0
                    
                    potential_savings = min(funding_1, funding_2)
                    
                    duplicate_info = {
                        'project_1': {
                            'title': project_1.get('title', 'N/A'),
                            'abstract': project_1.get('abstract', 'N/A')[:200] + '...' if len(str(project_1.get('abstract', ''))) > 200 else project_1.get('abstract', 'N/A'),
                            'funding_amount': funding_1,
                            'team_size': project_1.get('team_size', 'N/A'),
                            'status': project_1.get('status', 'N/A'),
                            'roi': project_1.get('roi', 'N/A'),
                            'index': i
                        },
                        'project_2': {
                            'title': project_2.get('title', 'N/A'),
                            'abstract': project_2.get('abstract', 'N/A')[:200] + '...' if len(str(project_2.get('abstract', ''))) > 200 else project_2.get('abstract', 'N/A'),
                            'funding_amount': funding_2,
                            'team_size': project_2.get('team_size', 'N/A'),
                            'status': project_2.get('status', 'N/A'),
                            'roi': project_2.get('roi', 'N/A'),
                            'index': j
                        },
                        'similarity_score': round(similarity_score, 3),
                        'potential_savings': potential_savings,
                        'severity': self._calculate_severity(similarity_score, potential_savings)
                    }
                    
                    duplicates.append(duplicate_info)
        
        # Sort by similarity score (highest first)
        duplicates.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return duplicates
    
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
    
    def get_duplication_summary(self, threshold: float = 0.7) -> Dict[str, Any]:
        """Get summary statistics for duplication detection."""
        duplicates = self.detect_duplicates(threshold)
        
        if not duplicates:
            return {
                'total_duplicates': 0,
                'total_potential_savings': 0,
                'severity_breakdown': {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0},
                'average_similarity': 0
            }
        
        total_savings = sum(d['potential_savings'] for d in duplicates)
        severity_breakdown = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
        
        for duplicate in duplicates:
            severity_breakdown[duplicate['severity']] += 1
        
        average_similarity = sum(d['similarity_score'] for d in duplicates) / len(duplicates)
        
        return {
            'total_duplicates': len(duplicates),
            'total_potential_savings': total_savings,
            'severity_breakdown': severity_breakdown,
            'average_similarity': round(average_similarity, 3),
            'top_duplicates': duplicates[:5]  # Top 5 most similar
        }

# Global instance
duplication_detector = DuplicationDetector()

def initialize_duplication_detector() -> bool:
    """Initialize the duplication detector service."""
    try:
        if duplication_detector.load_taskbook_data():
            return duplication_detector.prepare_text_features()
        return False
    except Exception as e:
        print(f"Error initializing duplication detector: {e}")
        return False

def get_duplication_analysis(threshold: float = 0.7) -> Dict[str, Any]:
    """Get duplication analysis for the Manager dashboard."""
    try:
        summary = duplication_detector.get_duplication_summary(threshold)
        return {
            'success': True,
            'data': summary,
            'threshold_used': threshold
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': None
        }
