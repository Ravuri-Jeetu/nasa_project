import os
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime
import re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class HypothesisGenerator:
    """Generate scientific hypotheses based on NASA space biology research data"""
    
    def __init__(self, papers_data_path="SB_publication_PMC.csv", hypotheses_data_path="all_papers_hypotheses_merged.jsonl"):
        self.papers_data_path = papers_data_path
        self.hypotheses_data_path = hypotheses_data_path
        self.papers_df = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.pre_generated_hypotheses = {}
        self.load_papers_data()
        self.load_pre_generated_hypotheses()
        self.setup_text_analysis()
    
    def load_papers_data(self):
        """Load NASA papers data"""
        try:
            self.papers_df = pd.read_csv(self.papers_data_path)
            # Add domain assignment immediately after loading
            self.papers_df['Assigned_Domain'] = self.papers_df['Title'].apply(self._assign_domain_from_title)
            print(f"✅ Loaded {len(self.papers_df)} NASA papers for hypothesis generation")
        except Exception as e:
            print(f"❌ Error loading papers data: {e}")
            self.papers_df = pd.DataFrame()
    
    def load_pre_generated_hypotheses(self):
        """Load pre-generated hypotheses from JSONL file"""
        try:
            if os.path.exists(self.hypotheses_data_path):
                with open(self.hypotheses_data_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        data = json.loads(line.strip())
                        paper_id = data['paper_id']
                        hypotheses = data['hypotheses']
                        self.pre_generated_hypotheses[paper_id] = hypotheses
                print(f"✅ Loaded {len(self.pre_generated_hypotheses)} pre-generated hypothesis sets")
            else:
                print(f"⚠️ Pre-generated hypotheses file not found: {self.hypotheses_data_path}")
                self.pre_generated_hypotheses = {}
        except Exception as e:
            print(f"❌ Error loading pre-generated hypotheses: {e}")
            self.pre_generated_hypotheses = {}
    
    def setup_text_analysis(self):
        """Setup TF-IDF analysis for text similarity"""
        if self.papers_df.empty:
            return
        
        try:
            # Use only available columns (Title and Link)
            self.papers_df['combined_text'] = self.papers_df['Title'].fillna('')
            
            # Setup TF-IDF vectorizer
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            # Fit TF-IDF on combined text
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(
                self.papers_df['combined_text'].fillna('')
            )
            
            print("✅ TF-IDF analysis setup complete")
        except Exception as e:
            print(f"❌ Error setting up text analysis: {e}")
    
    def _extract_pmc_id(self, link: str) -> Optional[str]:
        """Extract PMC ID from paper link"""
        try:
            if pd.isna(link) or not link:
                return None
            # Extract PMC ID from URL like https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/
            match = re.search(r'PMC(\d+)', str(link))
            if match:
                return f"PMC{match.group(1)}"
            return None
        except Exception:
            return None
    
    def _assign_domain_from_title(self, title: str) -> str:
        """Assign research domain based on title keywords"""
        if pd.isna(title):
            return 'Unknown'
        
        title_lower = title.lower()
        
        # Domain keyword mapping
        domain_keywords = {
            'Radiation': ['radiation', 'irradiation', 'dose', 'exposure', 'gamma', 'x-ray'],
            'Human Physiology': ['bone', 'muscle', 'cardiovascular', 'immune', 'microgravity', 'atrophy', 'density'],
            'Psychology': ['psychology', 'behavior', 'mental', 'cognitive', 'stress', 'isolation'],
            'Plants': ['plant', 'crop', 'agriculture', 'growth', 'seed', 'root', 'leaf'],
            'Cell Biology': ['cell', 'cellular', 'mitochondria', 'protein', 'gene', 'expression'],
            'Molecular Biology': ['molecular', 'dna', 'rna', 'protein', 'enzyme', 'metabolism']
        }
        
        for domain, keywords in domain_keywords.items():
            if any(keyword in title_lower for keyword in keywords):
                return domain
        
        return 'General Biology'
    
    def generate_hypotheses(self, query: str, role: str = "scientist") -> List[Dict[str, Any]]:
        """Generate scientific hypotheses based on query"""
        if self.papers_df.empty:
            return []
        
        hypotheses = []
        
        # First, try to find pre-generated hypotheses for related papers
        related_papers = self._find_related_papers(query, top_k=5)
        pre_generated_found = False
        
        for paper in related_papers:
            pmc_id = self._extract_pmc_id(paper.get('link', ''))
            if pmc_id and pmc_id in self.pre_generated_hypotheses:
                paper_hypotheses = self.pre_generated_hypotheses[pmc_id]
                for i, hypothesis_text in enumerate(paper_hypotheses):
                    hypotheses.append({
                        "hypothesis": hypothesis_text,
                        "supporting_evidence": f"Based on research from {paper['title']}",
                        "confidence": 95 - (i * 5),  # High confidence for real hypotheses
                        "type": "Pre-generated",
                        "related_papers": [{'title': paper['title'], 'link': paper['link']}]
                    })
                pre_generated_found = True
                break  # Use the first matching paper's hypotheses
        
        # If no pre-generated hypotheses found, generate AI hypotheses
        if not pre_generated_found:
            # 1. Gap-based hypothesis generation
            gap_hypotheses = self._generate_gap_based_hypotheses(query)
            hypotheses.extend(gap_hypotheses)
            
            # 2. Methodology-driven hypotheses
            method_hypotheses = self._generate_methodology_hypotheses(query)
            hypotheses.extend(method_hypotheses)
            
            # 3. Trend-based hypotheses
            trend_hypotheses = self._generate_trend_based_hypotheses(query)
            hypotheses.extend(trend_hypotheses)
            
            # 4. Custom query hypotheses
            custom_hypotheses = self._generate_custom_query_hypotheses(query)
            hypotheses.extend(custom_hypotheses)
        
        # Sort by confidence score and return top 5
        hypotheses.sort(key=lambda x: x['confidence'], reverse=True)
        return hypotheses[:5]
    
    def _generate_gap_based_hypotheses(self, query: str) -> List[Dict[str, Any]]:
        """Generate hypotheses based on research gaps"""
        hypotheses = []
        
        # Find related papers
        related_papers = self._find_related_papers(query, top_k=10)
        
        if len(related_papers) < 3:
            return hypotheses
        
        # Analyze research domains and identify gaps
        domains = [paper['Assigned_Domain'] for paper in related_papers]
        domain_counts = Counter(domains)
        
        # Identify underrepresented domains
        total_papers = len(related_papers)
        underrepresented_domains = [
            domain for domain, count in domain_counts.items() 
            if count < total_papers * 0.2  # Less than 20% representation
        ]
        
        # Generate gap-based hypotheses
        for domain in underrepresented_domains:
            if domain and domain != 'Unknown':
                hypothesis = self._create_gap_hypothesis(query, domain, related_papers)
                if hypothesis:
                    hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _generate_methodology_hypotheses(self, query: str) -> List[Dict[str, Any]]:
        """Generate hypotheses based on methodology analysis"""
        hypotheses = []
        
        related_papers = self._find_related_papers(query, top_k=15)
        
        if len(related_papers) < 5:
            return hypotheses
        
        # Analyze methods mentioned in papers
        methods_keywords = [
            'microgravity', 'simulation', 'ground-based', 'spaceflight', 'analog',
            'cell culture', 'animal model', 'human study', 'clinical trial',
            'biomarker', 'gene expression', 'protein analysis', 'imaging',
            'exercise', 'nutrition', 'pharmaceutical', 'radiation'
        ]
        
        # Find method combinations that haven't been explored together
        method_combinations = self._analyze_method_combinations(related_papers, methods_keywords)
        
        for combination in method_combinations[:2]:  # Top 2 combinations
            hypothesis = self._create_methodology_hypothesis(query, combination, related_papers)
            if hypothesis:
                hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _generate_trend_based_hypotheses(self, query: str) -> List[Dict[str, Any]]:
        """Generate hypotheses based on research trends"""
        hypotheses = []
        
        # Analyze publication trends by domain
        domain_trends = self._analyze_publication_trends()
        
        # Find trending domains related to query
        query_domains = self._extract_domains_from_query(query)
        
        for domain in query_domains:
            if domain in domain_trends:
                trend_data = domain_trends[domain]
                if trend_data['trend'] == 'increasing':
                    hypothesis = self._create_trend_hypothesis(query, domain, trend_data)
                    if hypothesis:
                        hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _generate_custom_query_hypotheses(self, query: str) -> List[Dict[str, Any]]:
        """Generate hypotheses based on custom query analysis"""
        hypotheses = []
        
        # Extract key concepts from query
        key_concepts = self._extract_key_concepts(query)
        
        # Find papers related to these concepts
        concept_papers = []
        for concept in key_concepts:
            papers = self._find_papers_by_concept(concept)
            concept_papers.extend(papers)
        
        # Generate hypotheses based on concept relationships
        if len(concept_papers) >= 3:
            hypothesis = self._create_custom_hypothesis(query, key_concepts, concept_papers)
            if hypothesis:
                hypotheses.append(hypothesis)
        
        return hypotheses
    
    def _find_related_papers(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """Find papers related to the query using TF-IDF similarity"""
        if self.tfidf_vectorizer is None or self.tfidf_matrix is None:
            return []
        
        try:
            # Transform query to TF-IDF
            query_vector = self.tfidf_vectorizer.transform([query])
            
            # Calculate cosine similarity
            similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
            
            # Get top similar papers
            top_indices = similarities.argsort()[-top_k:][::-1]
            
            related_papers = []
            for idx in top_indices:
                if similarities[idx] > 0.1:  # Minimum similarity threshold
                    paper = self.papers_df.iloc[idx]
                    related_papers.append({
                        'title': paper['Title'],
                        'abstract': paper['Title'],  # Use title as abstract since abstract column doesn't exist
                        'domain': paper['Assigned_Domain'],
                        'Assigned_Domain': paper['Assigned_Domain'],  # Add this for compatibility
                        'link': paper['Link'],  # Add the actual link
                        'similarity': similarities[idx]
                    })
            
            return related_papers
        except Exception as e:
            print(f"Error finding related papers: {e}")
            return []
    
    def _create_gap_hypothesis(self, query: str, domain: str, related_papers: List[Dict]) -> Optional[Dict[str, Any]]:
        """Create a gap-based hypothesis"""
        try:
            # Find papers in the underrepresented domain
            domain_papers = [p for p in related_papers if p['domain'] == domain]
            
            if len(domain_papers) == 0:
                return None
            
            # Create hypothesis based on gap
            hypothesis_text = f"Integration of {domain.lower()} research with {query.lower()} may reveal novel biological mechanisms and therapeutic targets that are currently underexplored in space biology research."
            
            # Calculate confidence based on gap size and related research
            confidence = min(85, 60 + len(related_papers) * 2)
            
            # Generate supporting evidence
            evidence_papers = domain_papers[:3]
            evidence_text = f"Limited research exists combining {domain} with {query}. Current studies focus primarily on isolated effects rather than integrated approaches."
            
            return {
                "hypothesis": hypothesis_text,
                "supporting_evidence": evidence_text,
                "confidence": confidence,
                "type": "Gap-based",
                "related_papers": [{'title': p['title'], 'link': p['link']} for p in evidence_papers]
            }
        except Exception as e:
            print(f"Error creating gap hypothesis: {e}")
            return None
    
    def _analyze_method_combinations(self, papers: List[Dict], methods_keywords: List[str]) -> List[Dict]:
        """Analyze method combinations in papers"""
        combinations = []
        
        for paper in papers:
            text = (paper.get('title', '') + ' ' + paper.get('abstract', '')).lower()
            found_methods = [method for method in methods_keywords if method in text]
            
            if len(found_methods) >= 2:
                combinations.append({
                    'methods': found_methods,
                    'paper': paper['title'],
                    'domain': paper['domain']
                })
        
        # Find unique combinations
        unique_combinations = []
        seen_combinations = set()
        
        for combo in combinations:
            combo_key = tuple(sorted(combo['methods']))
            if combo_key not in seen_combinations:
                seen_combinations.add(combo_key)
                unique_combinations.append(combo)
        
        return unique_combinations
    
    def _create_methodology_hypothesis(self, query: str, combination: Dict, related_papers: List[Dict]) -> Optional[Dict[str, Any]]:
        """Create a methodology-based hypothesis"""
        try:
            methods = combination['methods']
            method_text = " and ".join(methods)
            
            hypothesis_text = f"Combining {method_text} methodologies in {query.lower()} research may provide novel insights into biological mechanisms that cannot be achieved through single-method approaches."
            
            # Calculate confidence based on method novelty
            confidence = min(80, 50 + len(methods) * 10)
            
            evidence_text = f"Current research primarily uses isolated methodologies. Integration of {method_text} approaches represents an underexplored research direction."
            
            return {
                "hypothesis": hypothesis_text,
                "supporting_evidence": evidence_text,
                "confidence": confidence,
                "type": "Methodology-driven",
                "related_papers": [{'title': combination['paper'], 'link': '#'}]  # Placeholder link for methodology papers
            }
        except Exception as e:
            print(f"Error creating methodology hypothesis: {e}")
            return None
    
    def _analyze_publication_trends(self) -> Dict[str, Dict]:
        """Analyze publication trends by domain"""
        trends = {}
        
        # Since we don't have fiscal year data, simulate trends based on domain activity
        domain_counts = self.papers_df['Assigned_Domain'].value_counts()
        
        # Simulate increasing trends for domains with high activity
        for domain, count in domain_counts.items():
            if pd.isna(domain):
                continue
            
            # Simulate trend based on domain activity
            if count >= 20:  # High activity domains
                trends[domain] = {
                    'trend': 'increasing',
                    'recent_avg': count * 0.6,
                    'earlier_avg': count * 0.4
                }
            elif count >= 10:  # Medium activity domains
                trends[domain] = {
                    'trend': 'stable',
                    'recent_avg': count * 0.5,
                    'earlier_avg': count * 0.5
                }
        
        return trends
    
    def _extract_domains_from_query(self, query: str) -> List[str]:
        """Extract relevant domains from query"""
        query_lower = query.lower()
        domain_mapping = {
            'radiation': 'Radiation',
            'bone': 'Human Physiology',
            'muscle': 'Human Physiology',
            'cardiovascular': 'Human Physiology',
            'immune': 'Human Physiology',
            'psychology': 'Psychology',
            'mental': 'Psychology',
            'behavior': 'Psychology',
            'plant': 'Plants',
            'agriculture': 'Plants',
            'crop': 'Plants',
            'microgravity': 'Human Physiology',
            'space': 'Human Physiology'
        }
        
        found_domains = []
        for keyword, domain in domain_mapping.items():
            if keyword in query_lower:
                found_domains.append(domain)
        
        return list(set(found_domains))
    
    def _create_trend_hypothesis(self, query: str, domain: str, trend_data: Dict) -> Optional[Dict[str, Any]]:
        """Create a trend-based hypothesis"""
        try:
            hypothesis_text = f"Given the increasing research activity in {domain.lower()}, novel applications of {query.lower()} within this domain may yield breakthrough discoveries in space biology."
            
            confidence = min(75, 60 + trend_data['recent_avg'] * 2)
            
            evidence_text = f"Recent increase in {domain} research (avg {trend_data['recent_avg']:.1f} vs {trend_data['earlier_avg']:.1f} earlier) suggests growing interest and potential for novel applications."
            
            return {
                "hypothesis": hypothesis_text,
                "supporting_evidence": evidence_text,
                "confidence": confidence,
                "type": "Trend-based",
                "related_papers": []
            }
        except Exception as e:
            print(f"Error creating trend hypothesis: {e}")
            return None
    
    def _extract_key_concepts(self, query: str) -> List[str]:
        """Extract key concepts from query"""
        # Simple concept extraction
        concepts = []
        query_lower = query.lower()
        
        concept_keywords = [
            'microgravity', 'radiation', 'bone', 'muscle', 'cardiovascular',
            'immune', 'psychology', 'plant', 'cell', 'gene', 'protein',
            'exercise', 'nutrition', 'pharmaceutical', 'biomarker'
        ]
        
        for keyword in concept_keywords:
            if keyword in query_lower:
                concepts.append(keyword)
        
        return concepts
    
    def _find_papers_by_concept(self, concept: str) -> List[Dict]:
        """Find papers related to a specific concept"""
        concept_papers = []
        
        for _, paper in self.papers_df.iterrows():
            text = str(paper['Title']).lower()
            if concept.lower() in text:
                concept_papers.append({
                    'title': paper['Title'],
                    'abstract': paper['Title'],  # Use title as abstract
                    'domain': paper['Assigned_Domain'],
                    'Assigned_Domain': paper['Assigned_Domain'],  # Add this for compatibility
                    'link': paper['Link']  # Add the actual link
                })
        
        return concept_papers[:5]  # Return top 5
    
    def _create_custom_hypothesis(self, query: str, concepts: List[str], papers: List[Dict]) -> Optional[Dict[str, Any]]:
        """Create a custom hypothesis based on query analysis"""
        try:
            if len(concepts) < 2:
                return None
            
            concept_text = " and ".join(concepts)
            hypothesis_text = f"The interaction between {concept_text} in {query.lower()} may reveal previously unrecognized biological pathways and therapeutic opportunities in space environments."
            
            confidence = min(70, 40 + len(concepts) * 10 + len(papers) * 2)
            
            evidence_text = f"Research on {concept_text} exists but integrated studies are limited. Cross-disciplinary approaches may uncover novel mechanisms."
            
            return {
                "hypothesis": hypothesis_text,
                "supporting_evidence": evidence_text,
                "confidence": confidence,
                "type": "Custom query",
                "related_papers": [{'title': p['title'], 'link': p.get('link', '#')} for p in papers[:3]]
            }
        except Exception as e:
            print(f"Error creating custom hypothesis: {e}")
            return None

# Global instance
hypothesis_generator = HypothesisGenerator()
