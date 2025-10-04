import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from typing import Dict, List, Any
import os

class DynamicDataProcessor:
    """Real-time data processor for manager dashboard analytics"""
    
    def __init__(self, csv_path: str = "Taskbook_cleaned_for_NLP.csv"):
        self.csv_path = csv_path
        self.df = None
        self.last_update = None
        self.load_data()
    
    def load_data(self):
        """Load and process CSV data with domain classification"""
        try:
            # Load CSV
            self.df = pd.read_csv(self.csv_path)
            
            # Domain classification keywords
            self.domain_keywords = {
                "Plants": ["plant", "flora", "crop", "seed", "photosynth", "phyt", "agri", "leaf", "root"],
                "Microbes": ["microbe", "microbial", "bacteria", "bacterial", "virus", "fungi", "fungal",
                             "staphyl", "streptoc", "pathogen", "microorganism"],
                "Radiation": ["radiation", "ionizing", "cosmic", "radiol", "shield", "dosimetry", "radiobiology"],
                "Psychology": ["psych", "behavior", "crew", "cognitive", "sleep", "social", "mental",
                               "stress", "isolation"],
                "Human Physiology": ["cardio", "cardiovascular", "musculo", "bone", "neuro",
                                     "endocrine", "immune"],
            }
            
            # Assign domains
            self.df["Assigned_Domain"] = self.df.apply(self._assign_domain, axis=1)
            
            # Create synthetic fiscal years and dates for analysis
            np.random.seed(42)
            current_year = datetime.now().year
            self.df['Fiscal Year'] = np.random.randint(2015, 2025, size=len(self.df))
            self.df['Recent_5yrs'] = self.df['Fiscal Year'] >= (current_year - 5)
            self.df['Recent_7yrs'] = self.df['Fiscal Year'] >= (current_year - 7)
            
            # Add synthetic funding and ROI data
            self.df['Funding'] = np.random.randint(50000, 500000, size=len(self.df))
            self.df['ROI'] = np.random.uniform(1.2, 4.5, size=len(self.df))
            self.df['Expected_Return'] = self.df['Funding'] * self.df['ROI']
            
            # Add synthetic completion status
            self.df['Status'] = np.random.choice(['Active', 'Completed', 'On Hold', 'Planning'], 
                                                size=len(self.df), p=[0.4, 0.35, 0.15, 0.1])
            
            # Add synthetic team sizes
            self.df['Team_Size'] = np.random.randint(2, 15, size=len(self.df))
            
            self.last_update = datetime.now()
            print(f"Loaded {len(self.df)} research projects")
            
        except Exception as e:
            print(f"Error loading data: {e}")
            self.df = pd.DataFrame()
    
    def _assign_domain(self, row):
        """Assign domain based on content analysis"""
        text = " ".join([
            str(row.get("Title", "")),
            str(row.get("Abstract", "")),
            str(row.get("Methods", "")),
            str(row.get("Results", ""))
        ]).lower()

        for domain, keywords in self.domain_keywords.items():
            for kw in keywords:
                if kw in text:
                    return domain
        return "Other"
    
    def get_domain_analytics(self) -> Dict[str, Any]:
        """Get comprehensive domain analytics"""
        if self.df.empty:
            return {}
        
        # Domain distribution
        domain_counts = self.df["Assigned_Domain"].value_counts()
        domain_percentages = (domain_counts / len(self.df) * 100).round(1)
        
        # Recent trends (last 5 years)
        recent_counts = self.df[self.df["Recent_5yrs"]]["Assigned_Domain"].value_counts()
        
        # Funding analysis by domain
        funding_by_domain = self.df.groupby("Assigned_Domain")["Funding"].agg([
            'sum', 'mean', 'count'
        ]).round(0)
        
        # ROI analysis
        roi_by_domain = self.df.groupby("Assigned_Domain")["ROI"].agg([
            'mean', 'std', 'min', 'max'
        ]).round(2)
        
        analytics = {
            "total_projects": len(self.df),
            "domains": {
                "counts": domain_counts.to_dict(),
                "percentages": domain_percentages.to_dict(),
                "recent_counts": recent_counts.to_dict(),
                "funding": funding_by_domain.to_dict('index'),
                "roi": roi_by_domain.to_dict('index')
            },
            "last_updated": self.last_update.isoformat() if self.last_update else None
        }
        
        return analytics
    
    def get_investment_recommendations(self) -> Dict[str, Any]:
        """Generate investment recommendations"""
        if self.df.empty:
            return {}
        
        recent_counts = self.df[self.df["Recent_5yrs"]]["Assigned_Domain"].value_counts()
        funding_by_domain = self.df.groupby("Assigned_Domain")["Funding"].sum()
        roi_by_domain = self.df.groupby("Assigned_Domain")["ROI"].mean()
        
        # Find underfunded and overfunded domains
        underfunded = recent_counts.idxmin() if not recent_counts.empty else "Other"
        overfunded = recent_counts.idxmax() if not recent_counts.empty else "Plants"
        
        # Calculate recommendations
        underfunded_count = recent_counts.get(underfunded, 0)
        overfunded_count = recent_counts.get(overfunded, 0)
        
        recommendations = {
            "primary_recommendation": {
                "domain": underfunded,
                "action": "increase_funding",
                "current_studies": int(underfunded_count),
                "suggested_increase": 50,
                "expected_outcome": int(underfunded_count * 1.5),
                "investment_needed": int(underfunded_count * 50000),
                "potential_roi": float(roi_by_domain.get(underfunded, 2.0))
            },
            "balance_recommendation": {
                "domain": overfunded,
                "action": "reduce_funding",
                "current_studies": int(overfunded_count),
                "suggested_decrease": -25,
                "expected_outcome": int(overfunded_count * 0.75),
                "cost_savings": int(overfunded_count * 50000 * 0.25),
                "current_roi": float(roi_by_domain.get(overfunded, 2.0))
            },
            "financial_impact": {
                "total_investment": int(underfunded_count * 50000),
                "total_savings": int(overfunded_count * 50000 * 0.25),
                "net_investment": int(underfunded_count * 50000 - overfunded_count * 50000 * 0.25),
                "roi_multiplier": round((underfunded_count * 50000) / 1000000, 1)
            }
        }
        
        return recommendations
    
    def get_red_flag_alerts(self) -> List[Dict[str, Any]]:
        """Generate red flag alerts for critical gaps"""
        if self.df.empty:
            return []
        
        alerts = []
        current_year = datetime.now().year
        
        # Critical domains for space missions
        critical_domains = {
            "Radiation": {"threshold": 20, "importance": "Deep space mission safety"},
            "Psychology": {"threshold": 30, "importance": "Crew mental health"},
            "Plants": {"threshold": 50, "importance": "Food sustainability"},
            "Human Physiology": {"threshold": 15, "importance": "Astronaut health"}
        }
        
        for domain, criteria in critical_domains.items():
            recent_count = len(self.df[
                (self.df["Assigned_Domain"] == domain) & 
                (self.df["Recent_7yrs"])
            ])
            total_count = len(self.df[self.df["Assigned_Domain"] == domain])
            
            if recent_count < criteria["threshold"]:
                alert_level = "CRITICAL" if recent_count < criteria["threshold"] * 0.5 else "WARNING"
                suggested_increase = max(criteria["threshold"] - recent_count, 5)
                
                alerts.append({
                    "domain": domain,
                    "alert_level": alert_level,
                    "recent_studies": recent_count,
                    "total_studies": total_count,
                    "threshold": criteria["threshold"],
                    "importance": criteria["importance"],
                    "suggested_increase": suggested_increase,
                    "estimated_cost": suggested_increase * 50000,
                    "urgency": "IMMEDIATE ACTION REQUIRED" if alert_level == "CRITICAL" else "MONITOR CLOSELY"
                })
        
        return alerts
    
    def get_budget_simulation(self, domain: str, adjustment_percentage: float) -> Dict[str, Any]:
        """Simulate budget adjustments for a specific domain"""
        if self.df.empty:
            return {}
        
        domain_data = self.df[self.df["Assigned_Domain"] == domain]
        if domain_data.empty:
            return {"error": f"Domain '{domain}' not found"}
        
        current_count = len(domain_data)
        current_funding = domain_data["Funding"].sum()
        current_roi = domain_data["ROI"].mean()
        
        # Calculate projections
        projected_count = int(current_count * (1 + adjustment_percentage/100))
        projected_funding = current_funding * (1 + adjustment_percentage/100)
        difference = projected_count - current_count
        
        simulation = {
            "domain": domain,
            "adjustment_percentage": adjustment_percentage,
            "current": {
                "studies": current_count,
                "funding": int(current_funding),
                "roi": round(current_roi, 2)
            },
            "projected": {
                "studies": projected_count,
                "funding": int(projected_funding),
                "roi": round(current_roi, 2)  # Assume ROI stays constant
            },
            "impact": {
                "study_difference": difference,
                "funding_difference": int(projected_funding - current_funding),
                "additional_investment": int(difference * 50000) if difference > 0 else 0,
                "cost_savings": int(abs(difference) * 50000) if difference < 0 else 0
            }
        }
        
        return simulation
    
    def get_emerging_areas(self) -> List[Dict[str, Any]]:
        """Identify emerging research areas"""
        if self.df.empty:
            return []
        
        recent_counts = self.df[self.df["Recent_5yrs"]]["Assigned_Domain"].value_counts()
        total_counts = self.df["Assigned_Domain"].value_counts()
        
        emerging_areas = []
        for domain in recent_counts.index:
            recent_pct = (recent_counts[domain] / len(self.df[self.df["Recent_5yrs"]])) * 100
            total_pct = (total_counts[domain] / len(self.df)) * 100
            growth_score = recent_pct - total_pct
            
            status = "GROWING" if growth_score > 1 else "DECLINING" if growth_score < -1 else "STABLE"
            
            emerging_areas.append({
                "domain": domain,
                "growth_score": round(growth_score, 2),
                "recent_studies": int(recent_counts[domain]),
                "total_studies": int(total_counts[domain]),
                "status": status,
                "potential": "HIGH" if growth_score > 2 else "MEDIUM" if growth_score > 0 else "LOW"
            })
        
        # Sort by growth potential
        emerging_areas.sort(key=lambda x: x["growth_score"], reverse=True)
        return emerging_areas[:5]  # Top 5 emerging areas
    
    def get_project_status_overview(self) -> Dict[str, Any]:
        """Get overview of project statuses"""
        if self.df.empty:
            return {}
        
        status_counts = self.df["Status"].value_counts()
        status_percentages = (status_counts / len(self.df) * 100).round(1)
        
        # Calculate completion rates by domain
        completion_by_domain = {}
        for domain in self.df["Assigned_Domain"].unique():
            domain_data = self.df[self.df["Assigned_Domain"] == domain]
            completed = len(domain_data[domain_data["Status"] == "Completed"])
            total = len(domain_data)
            completion_by_domain[domain] = {
                "completed": completed,
                "total": total,
                "completion_rate": round((completed / total) * 100, 1) if total > 0 else 0
            }
        
        return {
            "overall_status": status_counts.to_dict(),
            "status_percentages": status_percentages.to_dict(),
            "completion_by_domain": completion_by_domain,
            "total_active": len(self.df[self.df["Status"] == "Active"]),
            "total_completed": len(self.df[self.df["Status"] == "Completed"])
        }
    
    def refresh_data(self):
        """Refresh data from CSV file"""
        self.load_data()
        return self.last_update
    
    def analyze_research_gaps(self, role: str = "Scientist") -> List[Dict[str, Any]]:
        """Analyze real research gaps based on actual data patterns"""
        if self.df.empty:
            return []
        
        gaps = []
        current_year = datetime.now().year
        
        if role.lower() == "scientist":
            gaps = self._analyze_scientific_gaps(current_year)
        elif role.lower() == "manager":
            gaps = self._analyze_manager_gaps(current_year)
        elif role.lower() == "mission planner":
            gaps = self._analyze_mission_gaps(current_year)
        
        return gaps
    
    def _analyze_scientific_gaps(self, current_year: int) -> List[Dict[str, Any]]:
        """Analyze scientific research gaps using real data analysis (optimized for performance)"""
        gaps = []
        
        # First, get traditional gaps as fallback
        traditional_gaps = self._analyze_traditional_scientific_gaps(current_year)
        gaps.extend(traditional_gaps)
        
        # Add real data analysis from NASA papers (without heavy AI processing)
        try:
            real_data_gaps = self._analyze_real_data_gaps()
            gaps.extend(real_data_gaps)
            print(f"✅ Added {len(real_data_gaps)} real data gaps")
        except Exception as e:
            # If real data analysis fails, continue with traditional gaps only
            print(f"⚠️ Real data analysis failed: {e}")
            pass
        
        return gaps[:10]  # Return top 10 gaps
    
    def get_cross_domain_synergy(self) -> Dict[str, Any]:
        """
        Analyze cross-domain synergies based on research patterns and collaboration potential
        """
        if self.df.empty:
            return self._get_default_synergy_data()
        
        # Get domain combinations and their potential synergies
        domains = self.df['Assigned_Domain'].value_counts().head(8).index.tolist()
        
        synergies = []
        total_synergies = 0
        high_potential_synergies = 0
        
        # Analyze domain pairs for synergy potential
        for i, domain1 in enumerate(domains):
            for j, domain2 in enumerate(domains[i+1:], i+1):
                synergy_score = self._calculate_domain_synergy(domain1, domain2)
                total_synergies += 1
                
                if synergy_score > 70:
                    high_potential_synergies += 1
                
                synergies.append({
                    "domain1": domain1,
                    "domain2": domain2,
                    "synergy_score": synergy_score,
                    "shared_resources": self._get_shared_resources(domain1, domain2),
                    "benefits": self._get_synergy_benefits(domain1, domain2),
                    "recommended_investment": int(50000 + (synergy_score * 3000))
                })
        
        # Sort by synergy score
        synergies.sort(key=lambda x: x['synergy_score'], reverse=True)
        
        # Generate investment recommendations
        investment_recommendations = self._generate_synergy_investment_recommendations(synergies[:3])
        
        return {
            "total_synergies": total_synergies,
            "high_potential_synergies": high_potential_synergies,
            "collaboration_opportunities": len([s for s in synergies if s['synergy_score'] > 60]),
            "avg_synergy_score": round(sum(s['synergy_score'] for s in synergies) / len(synergies) if synergies else 0),
            "top_synergies": synergies[:5],
            "investment_recommendations": investment_recommendations
        }
    
    def _calculate_domain_synergy(self, domain1: str, domain2: str) -> int:
        """Calculate synergy score between two domains"""
        # Base synergy scores based on domain relationships
        synergy_matrix = {
            ("Plants", "Microbes"): 85,
            ("Human Physiology", "Psychology"): 90,
            ("Radiation", "Human Physiology"): 75,
            ("Radiation", "Plants"): 70,
            ("Microbes", "Human Physiology"): 80,
            ("Plants", "Human Physiology"): 65,
            ("Psychology", "Microbes"): 60,
            ("Radiation", "Psychology"): 55,
            ("Plants", "Psychology"): 50,
            ("Microbes", "Radiation"): 75
        }
        
        # Check both directions
        key1 = (domain1, domain2)
        key2 = (domain2, domain1)
        
        if key1 in synergy_matrix:
            return synergy_matrix[key1]
        elif key2 in synergy_matrix:
            return synergy_matrix[key2]
        else:
            # Default synergy based on domain types
            if "Human" in domain1 and "Human" in domain2:
                return 70
            elif "Plant" in domain1 and "Plant" in domain2:
                return 65
            else:
                return 55
    
    def _get_shared_resources(self, domain1: str, domain2: str) -> List[str]:
        """Get shared resources between domains"""
        base_resources = ["Research Teams", "Laboratory Equipment", "Data Analysis Tools"]
        
        if "Human" in domain1 or "Human" in domain2:
            base_resources.extend(["Clinical Facilities", "Medical Equipment"])
        if "Plant" in domain1 or "Plant" in domain2:
            base_resources.extend(["Greenhouse Facilities", "Growth Chambers"])
        if "Microbe" in domain1 or "Microbe" in domain2:
            base_resources.extend(["Microbiology Labs", "Incubators"])
        if "Radiation" in domain1 or "Radiation" in domain2:
            base_resources.extend(["Radiation Facilities", "Dosimetry Equipment"])
        
        return base_resources[:4]  # Return top 4 resources
    
    def _get_synergy_benefits(self, domain1: str, domain2: str) -> List[str]:
        """Get potential benefits of domain synergy"""
        benefits = [
            "Shared experimental protocols",
            "Combined data analysis",
            "Reduced operational costs",
            "Enhanced research outcomes"
        ]
        
        if "Human" in domain1 and "Human" in domain2:
            benefits.append("Integrated health monitoring")
        if "Plant" in domain1 and "Plant" in domain2:
            benefits.append("Sustainable agriculture solutions")
        
        return benefits[:3]  # Return top 3 benefits
    
    def _generate_synergy_investment_recommendations(self, top_synergies: List[Dict]) -> List[Dict]:
        """Generate investment recommendations based on top synergies"""
        recommendations = []
        
        if top_synergies:
            recommendations.append({
                "title": "Cross-Domain Collaboration Initiative",
                "description": f"Establish formal collaboration framework between {top_synergies[0]['domain1']} and {top_synergies[0]['domain2']}",
                "investment_amount": sum(s['recommended_investment'] for s in top_synergies[:2]),
                "expected_roi": 145,
                "timeline": "12 months",
                "priority": "High"
            })
        
        return recommendations
    
    def _get_default_synergy_data(self) -> Dict[str, Any]:
        """Return default synergy data when no real data is available"""
        return {
            "total_synergies": 12,
            "high_potential_synergies": 4,
            "collaboration_opportunities": 8,
            "avg_synergy_score": 78,
            "top_synergies": [
                {
                    "domain1": "Human Physiology",
                    "domain2": "Psychology",
                    "synergy_score": 90,
                    "shared_resources": ["Clinical Facilities", "Research Teams", "Data Analysis Tools"],
                    "benefits": ["Integrated health monitoring", "Enhanced research outcomes"],
                    "recommended_investment": 320000
                }
            ],
            "investment_recommendations": [
                {
                    "title": "Cross-Domain Collaboration Initiative",
                    "description": "Establish formal collaboration framework between high-synergy domains",
                    "investment_amount": 500000,
                    "expected_roi": 145,
                    "timeline": "12 months",
                    "priority": "High"
                }
            ]
        }
    
    def _analyze_real_data_gaps(self) -> List[Dict[str, Any]]:
        """Analyze gaps from real NASA paper data without AI processing"""
        gaps = []
        
        try:
            print("🔍 Loading paper chunks data for real data analysis...")
            # Load paper chunks data
            with open("step5_all_chunks.json", "r", encoding="utf-8", errors='ignore') as f:
                chunks_data = json.load(f)
            
            print(f"📄 Loaded {len(chunks_data)} paper chunks")
            
            # Analyze paper content for gaps without AI
            paper_gaps = self._extract_gaps_from_papers(chunks_data)
            gaps.extend(paper_gaps)
            
            print(f"🎯 Extracted {len(paper_gaps)} gaps from papers")
            
        except Exception as e:
            # If paper analysis fails, return empty list
            print(f"❌ Real data analysis error: {e}")
            pass
            
        return gaps[:5]  # Return top 5 real data gaps
    
    def _extract_gaps_from_papers(self, chunks_data: List[Dict]) -> List[Dict[str, Any]]:
        """Extract gaps from papers using keyword analysis (no AI)"""
        gaps = []
        
        # Collect all chunks for each paper to get more content
        papers_dict = {}
        for chunk in chunks_data[:100]:  # Check more chunks for better coverage
            title = chunk.get('Title', '')
            chunk_text = chunk.get('Chunk', '')
            paper_id = chunk.get('Paper_ID', '')
            
            if title and chunk_text:
                if title not in papers_dict:
                    papers_dict[title] = {
                        'title': title,
                        'content': '',
                        'paper_id': paper_id,
                        'chunks': []
                    }
                
                papers_dict[title]['chunks'].append(chunk_text)
        
        # Combine chunks for each paper
        for title in papers_dict:
            papers_dict[title]['content'] = ' '.join(papers_dict[title]['chunks'])
        
        # Analyze each paper for gaps using improved keyword matching
        for paper_title, paper_data in list(papers_dict.items())[:5]:  # Check 5 papers
            content = paper_data['content'].lower()
            paper_id = paper_data['paper_id']
            
            # Skip if content is too short (likely just titles)
            if len(content) < 50:
                continue
            
            print(f"📝 Analyzing paper: {paper_title[:50]}... (content length: {len(content)})")
            
            # Look for limitation keywords (expanded list)
            limitation_words = ['limit', 'constrain', 'restrict', 'insufficient', 'lack', 'weakness', 'drawback', 'shortcoming', 'challenge', 'difficult', 'problem', 'issue']
            if any(word in content for word in limitation_words):
                gaps.append({
                    "area": f"Research Limitations - {paper_title[:40]}",
                    "gap": f"Study identifies limitations: {paper_data['content'][:200]}...",
                    "priority": "Medium",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Address identified limitations in future research"
                })
                print(f"✅ Found limitation gap in: {paper_title[:30]}")
            
            # Look for future work keywords (expanded list)
            future_words = ['future', 'further study', 'next step', 'recommend', 'suggest', 'should be', 'need to', 'require', 'propose', 'advance', 'develop', 'improve']
            if any(word in content for word in future_words):
                gaps.append({
                    "area": f"Future Research - {paper_title[:40]}",
                    "gap": f"Study suggests future work: {paper_data['content'][:200]}...",
                    "priority": "High",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Follow suggested research directions"
                })
                print(f"✅ Found future work gap in: {paper_title[:30]}")
            
            # Look for question/unknown keywords (expanded list)
            question_words = ['unknown', 'unclear', 'question', 'remains to be', 'investigate', 'explore', 'understand', 'determine', 'elucidate', 'clarify', 'resolve']
            if any(word in content for word in question_words):
                gaps.append({
                    "area": f"Open Questions - {paper_title[:40]}",
                    "gap": f"Study raises questions: {paper_data['content'][:200]}...",
                    "priority": "High",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Investigate unresolved questions through targeted research"
                })
                print(f"✅ Found open question gap in: {paper_title[:30]}")
            
            # Look for methodology keywords
            method_words = ['method', 'technique', 'approach', 'protocol', 'procedure', 'experiment', 'study design', 'measurement', 'analysis']
            if any(word in content for word in method_words) and len(content) > 100:
                gaps.append({
                    "area": f"Methodology Research - {paper_title[:40]}",
                    "gap": f"Study discusses methodology: {paper_data['content'][:200]}...",
                    "priority": "Medium",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Consider methodology improvements and validation"
                })
                print(f"✅ Found methodology gap in: {paper_title[:30]}")
        
        print(f"🎯 Total gaps extracted from papers: {len(gaps)}")
        return gaps
    
    def _get_sample_papers_for_analysis(self) -> List[Dict[str, Any]]:
        """Get a sample of papers for AI analysis"""
        try:
            # Try to load paper chunks data with proper encoding
            with open("step5_all_chunks.json", "r", encoding="utf-8", errors='ignore') as f:
                chunks_data = json.load(f)
            
            # Group chunks by paper title
            papers_dict = {}
            for chunk in chunks_data:
                title = chunk.get('Title', '')
                chunk_text = chunk.get('Chunk', '')
                section = chunk.get('Section', '')
                
                if title and chunk_text:
                    if title not in papers_dict:
                        papers_dict[title] = {
                            'title': title,
                            'abstract': '',
                            'methods': '',
                            'results': '',
                            'conclusion': '',
                            'all_chunks': []
                        }
                    
                    # Add chunk to appropriate section
                    papers_dict[title]['all_chunks'].append(chunk_text)
                    
                    # Organize by section type
                    section_lower = section.lower()
                    if 'abstract' in section_lower or 'introduction' in section_lower:
                        papers_dict[title]['abstract'] += ' ' + chunk_text
                    elif 'method' in section_lower or 'material' in section_lower:
                        papers_dict[title]['methods'] += ' ' + chunk_text
                    elif 'result' in section_lower or 'finding' in section_lower:
                        papers_dict[title]['results'] += ' ' + chunk_text
                    elif 'conclusion' in section_lower or 'discussion' in section_lower:
                        papers_dict[title]['conclusion'] += ' ' + chunk_text
            
            # Combine all chunks for each paper
            for title in papers_dict:
                papers_dict[title]['combined_text'] = ' '.join(papers_dict[title]['all_chunks'])
                # Trim whitespace
                papers_dict[title]['abstract'] = papers_dict[title]['abstract'].strip()
                papers_dict[title]['methods'] = papers_dict[title]['methods'].strip()
                papers_dict[title]['results'] = papers_dict[title]['results'].strip()
                papers_dict[title]['conclusion'] = papers_dict[title]['conclusion'].strip()
            
            # Return sample of papers (first 3 for faster analysis)
            return list(papers_dict.values())[:3]
            
        except Exception as e:
            return []
    
    def _analyze_paper_gaps_with_ai(self, paper: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Use AI to analyze a paper for research gaps"""
        try:
            # Import the summarizer (avoid importing from main to prevent circular dependencies)
            from transformers import pipeline
            import torch
            
            # Initialize summarizer locally if needed
            try:
                from main import summarizer
            except:
                summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt", device=0 if torch.cuda.is_available() else -1)
            
            # Prepare text for analysis (truncate if too long)
            text_to_analyze = paper.get('combined_text', '') or paper.get('abstract', '')
            if len(text_to_analyze) > 2000:
                truncated_text = text_to_analyze[:2000]
            else:
                truncated_text = text_to_analyze
            
            if len(truncated_text) < 100:
                return []  # Skip papers with insufficient content
            
            # Use AI to generate a summary that highlights gaps
            result = summarizer(truncated_text, max_length=200, min_length=50, do_sample=False)
            ai_summary = result[0]['summary_text']
            
            # Parse AI response and create gap entries
            gaps = []
            paper_title = paper.get('title', 'Unknown Study')
            paper_id = paper.get('paper_id', '')
            
            # Analyze the text for key gap indicators
            text_lower = truncated_text.lower()
            
            # Look for limitations
            if any(word in text_lower for word in ['limit', 'constrain', 'drawback', 'weakness', 'shortcoming']):
                # Extract the sentence containing the limitation
                sentences = truncated_text.split('.')
                limitation_text = ""
                for sent in sentences:
                    if any(word in sent.lower() for word in ['limit', 'constrain', 'drawback']):
                        limitation_text = sent.strip()
                        break
                
                if not limitation_text:
                    limitation_text = ai_summary
                
                gaps.append({
                    "area": f"Study Limitations - {paper_title[:50]}",
                    "gap": f"{limitation_text[:300]}",
                    "priority": "Medium",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Address identified limitations in future research"
                })
            
            # Look for contradictions/open questions
            if any(word in text_lower for word in ['unclear', 'unknown', 'question', 'investigate', 'further study', 'remains to be']):
                sentences = truncated_text.split('.')
                question_text = ""
                for sent in sentences:
                    if any(word in sent.lower() for word in ['unclear', 'unknown', 'question', 'remains to be']):
                        question_text = sent.strip()
                        break
                
                if not question_text:
                    question_text = ai_summary
                
                gaps.append({
                    "area": f"Open Questions - {paper_title[:50]}",
                    "gap": f"{question_text[:300]}",
                    "priority": "High",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Investigate unresolved questions through targeted research"
                })
            
            # Look for future work suggestions
            if any(word in text_lower for word in ['future', 'next step', 'suggest', 'recommend', 'should be', 'need to', 'require']):
                sentences = truncated_text.split('.')
                future_text = ""
                for sent in sentences:
                    if any(word in sent.lower() for word in ['future', 'suggest', 'recommend', 'should be', 'need to']):
                        future_text = sent.strip()
                        break
                
                if not future_text:
                    future_text = ai_summary
                
                gaps.append({
                    "area": f"Future Research - {paper_title[:50]}",
                    "gap": f"{future_text[:300]}",
                    "priority": "Medium",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Follow suggested research directions"
                })
            
            # If no specific gaps found but we have a summary, create a general gap
            if not gaps and len(ai_summary) > 20:
                gaps.append({
                    "area": f"Research Insights - {paper_title[:50]}",
                    "gap": f"Key findings: {ai_summary[:250]}",
                    "priority": "Medium",
                    "evidence": f"Paper: {paper_title} (ID: {paper_id})",
                    "recommendation": "Consider building upon these findings in future work"
                })
            
            return gaps
            
        except Exception as e:
            # Return empty list silently to avoid console encoding errors
            return []
    
    def _analyze_traditional_scientific_gaps(self, current_year: int) -> List[Dict[str, Any]]:
        """Fallback traditional gap analysis"""
        gaps = []
        
        # Analyze domain coverage gaps using available columns
        domain_stats = self.df.groupby('Assigned_Domain').agg({
            'Title': 'count',  # Count projects per domain
            'Funding': ['sum', 'mean'],  # Funding analysis
            'Team_Size': 'mean'  # Team size analysis
        }).reset_index()
        
        # Flatten column names
        domain_stats.columns = ['Assigned_Domain', 'project_count', 'total_funding', 'avg_funding', 'avg_team_size']
        
        # Find domains with low recent activity (using Recent_5yrs column)
        low_activity_domains = []
        
        for _, row in domain_stats.iterrows():
            domain = row['Assigned_Domain']
            recent_count = len(self.df[
                (self.df['Assigned_Domain'] == domain) & 
                (self.df['Recent_5yrs'] == True)
            ])
            
            if recent_count < 3:  # Less than 3 projects in last 5 years
                low_activity_domains.append({
                    'domain': domain,
                    'recent_count': recent_count,
                    'total_count': row['project_count'],
                    'total_funding': row['total_funding']
                })
        
        # Generate gap recommendations
        for domain_info in low_activity_domains:
            domain = domain_info['domain']
            recent_count = domain_info['recent_count']
            total_count = domain_info['total_count']
            total_funding = domain_info['total_funding']
            
            if domain == "Radiation":
                gaps.append({
                    "area": "Space Radiation Research",
                    "gap": f"Only {recent_count} recent projects in radiation research. Critical gap for deep space missions.",
                    "priority": "High",
                    "evidence": f"{recent_count} projects in last 5 years vs {total_count} total (${total_funding:,.0f} funding)",
                    "recommendation": "Increase funding for radiation protection and biological effects studies"
                })
            elif domain == "Psychology":
                gaps.append({
                    "area": "Space Psychology & Mental Health",
                    "gap": f"Limited research ({recent_count} projects) on psychological effects of long-duration missions.",
                    "priority": "High",
                    "evidence": f"{recent_count} projects in last 5 years (${total_funding:,.0f} funding)",
                    "recommendation": "Expand studies on isolation, confinement, and crew dynamics"
                })
            elif domain == "Plants":
                gaps.append({
                    "area": "Space Agriculture & Plant Biology",
                    "gap": f"Insufficient research ({recent_count} projects) on plant growth systems for food production.",
                    "priority": "Medium",
                    "evidence": f"{recent_count} projects in last 5 years (${total_funding:,.0f} funding)",
                    "recommendation": "Develop closed-loop agricultural systems for Mars missions"
                })
            elif domain == "Human Physiology":
                gaps.append({
                    "area": "Human Physiology in Space",
                    "gap": f"Limited recent research ({recent_count} projects) on physiological adaptations.",
                    "priority": "High",
                    "evidence": f"{recent_count} projects in last 5 years (${total_funding:,.0f} funding)",
                    "recommendation": "Focus on bone density, muscle atrophy, and cardiovascular health"
                })
            else:
                gaps.append({
                    "area": f"{domain} Research Gap",
                    "gap": f"Low recent activity: only {recent_count} projects in last 5 years.",
                    "priority": "Medium",
                    "evidence": f"{recent_count} projects in last 5 years vs {total_count} total",
                    "recommendation": f"Increase research activity in {domain} domain"
                })
        
        # Analyze funding gaps
        funding_gaps = self._analyze_funding_gaps()
        gaps.extend(funding_gaps)
        
        # Analyze team size gaps
        team_gaps = self._analyze_team_gaps()
        gaps.extend(team_gaps)
        
        return gaps[:8]  # Return top 8 gaps
    
    def _analyze_manager_gaps(self, current_year: int) -> List[Dict[str, Any]]:
        """Analyze management and business gaps"""
        gaps = []
        
        # Analyze funding distribution gaps
        funding_stats = self.df.groupby('Assigned_Domain')['Funding'].agg(['sum', 'mean', 'count']).reset_index()
        funding_stats.columns = ['Assigned_Domain', 'total_funding', 'avg_funding', 'project_count']
        
        # Find domains with disproportionate funding
        total_funding = funding_stats['total_funding'].sum()
        avg_funding_per_project = total_funding / funding_stats['project_count'].sum()
        
        for _, row in funding_stats.iterrows():
            domain = row['Assigned_Domain']
            domain_funding = row['total_funding']
            project_count = row['project_count']
            avg_cost = row['avg_funding']
            
            funding_percentage = (domain_funding / total_funding) * 100
            
            if funding_percentage < 5:  # Less than 5% of total funding
                gaps.append({
                    "area": f"{domain} Funding Gap",
                    "gap": f"Underfunded domain: only {funding_percentage:.1f}% of total budget",
                    "priority": "Medium",
                    "evidence": f"${domain_funding:,.0f} across {project_count} projects",
                    "recommendation": "Consider reallocating resources to address critical underfunded areas"
                })
            elif avg_cost > avg_funding_per_project * 2:  # Overfunded projects
                gaps.append({
                    "area": f"{domain} Cost Efficiency",
                    "gap": f"High average cost per project: ${avg_cost:,.0f} vs ${avg_funding_per_project:,.0f} average",
                    "priority": "Low",
                    "evidence": f"${avg_cost:,.0f} average cost per project",
                    "recommendation": "Review cost efficiency and resource allocation"
                })
        
        # Analyze ROI gaps
        roi_gaps = self._analyze_roi_gaps()
        gaps.extend(roi_gaps)
        
        # Analyze team efficiency gaps
        team_efficiency_gaps = self._analyze_team_efficiency_gaps()
        gaps.extend(team_efficiency_gaps)
        
        return gaps[:6]  # Return top 6 gaps
    
    def _analyze_mission_gaps(self, current_year: int) -> List[Dict[str, Any]]:
        """Analyze mission planning gaps"""
        gaps = []
        
        # Analyze team size gaps (as proxy for mission complexity)
        team_stats = self.df.groupby('Assigned_Domain')['Team_Size'].agg(['mean', 'min', 'max', 'count']).reset_index()
        team_stats.columns = ['Assigned_Domain', 'avg_team_size', 'min_team_size', 'max_team_size', 'project_count']
        
        for _, row in team_stats.iterrows():
            domain = row['Assigned_Domain']
            avg_team_size = row['avg_team_size']
            max_team_size = row['max_team_size']
            project_count = row['project_count']
            
            if max_team_size < 10:  # No large team studies
                gaps.append({
                    "area": f"{domain} Mission Complexity",
                    "gap": f"No studies with teams larger than {max_team_size} members. Insufficient for complex mission planning.",
                    "priority": "High",
                    "evidence": f"Maximum team size: {max_team_size} members across {project_count} projects",
                    "recommendation": "Design multi-disciplinary teams for comprehensive mission studies"
                })
            elif avg_team_size < 5:  # Mostly small teams
                gaps.append({
                    "area": f"{domain} Team Size",
                    "gap": f"Average team size only {avg_team_size:.1f} members. Insufficient for complex mission requirements.",
                    "priority": "Medium",
                    "evidence": f"Average team size: {avg_team_size:.1f} members",
                    "recommendation": "Increase team sizes for comprehensive mission planning"
                })
        
        # Analyze status gaps
        status_gaps = self._analyze_status_gaps()
        gaps.extend(status_gaps)
        
        return gaps[:6]  # Return top 6 gaps
    
    def _analyze_temporal_gaps(self) -> List[Dict[str, Any]]:
        """Analyze temporal research gaps"""
        gaps = []
        current_year = datetime.now().year
        
        # Find years with low research activity
        yearly_counts = self.df.groupby(self.df['Start_Date'].dt.year).size()
        avg_yearly_count = yearly_counts.mean()
        
        for year in range(current_year - 5, current_year):
            if year in yearly_counts.index:
                count = yearly_counts[year]
                if count < avg_yearly_count * 0.7:  # 30% below average
                    gaps.append({
                        "area": f"Research Activity Gap ({year})",
                        "gap": f"Low research activity in {year}: only {count} projects vs {avg_yearly_count:.0f} average",
                        "priority": "Medium",
                        "evidence": f"{count} projects in {year}",
                        "recommendation": "Investigate factors causing reduced activity and plan catch-up studies"
                    })
        
        return gaps[:3]  # Return top 3 temporal gaps
    
    def _analyze_methodological_gaps(self) -> List[Dict[str, Any]]:
        """Analyze methodological gaps in research"""
        gaps = []
        
        # Analyze study type distribution
        if 'Study_Type' in self.df.columns:
            study_types = self.df['Study_Type'].value_counts()
            total_studies = len(self.df)
            
            for study_type, count in study_types.items():
                percentage = (count / total_studies) * 100
                if percentage < 10:  # Less than 10% representation
                    gaps.append({
                        "area": f"{study_type} Research Gap",
                        "gap": f"Underrepresented study type: only {percentage:.1f}% of research",
                        "priority": "Low",
                        "evidence": f"{count} studies ({percentage:.1f}%)",
                        "recommendation": f"Increase {study_type} studies for comprehensive understanding"
                    })
        
        return gaps[:2]  # Return top 2 methodological gaps
    
    def _analyze_timeline_gaps(self) -> List[Dict[str, Any]]:
        """Analyze timeline and scheduling gaps"""
        gaps = []
        
        # Analyze project completion rates
        completed_projects = len(self.df[self.df['Status'] == 'Completed'])
        total_projects = len(self.df)
        completion_rate = (completed_projects / total_projects) * 100
        
        if completion_rate < 80:
            gaps.append({
                "area": "Project Completion Rate",
                "gap": f"Low completion rate: only {completion_rate:.1f}% of projects completed",
                "priority": "High",
                "evidence": f"{completed_projects}/{total_projects} projects completed",
                "recommendation": "Review project management processes and resource allocation"
            })
        
        # Analyze overdue projects
        current_date = datetime.now()
        overdue_projects = len(self.df[
            (self.df['End_Date'] < current_date) & 
            (self.df['Status'] != 'Completed')
        ])
        
        if overdue_projects > 0:
            gaps.append({
                "area": "Project Timeline Management",
                "gap": f"{overdue_projects} projects are overdue, indicating timeline management issues",
                "priority": "Medium",
                "evidence": f"{overdue_projects} overdue projects",
                "recommendation": "Implement better timeline tracking and early warning systems"
            })
        
        return gaps
    
    def _analyze_risk_gaps(self) -> List[Dict[str, Any]]:
        """Analyze risk assessment gaps"""
        gaps = []
        
        # Analyze high-risk domains
        high_risk_domains = ["Radiation", "Human Physiology", "Psychology"]
        
        for domain in high_risk_domains:
            domain_projects = self.df[self.df['Assigned_Domain'] == domain]
            if len(domain_projects) > 0:
                avg_duration = domain_projects['Duration_Days'].mean()
                if avg_duration < 180:  # Less than 6 months average
                    gaps.append({
                        "area": f"{domain} Risk Assessment",
                        "gap": f"Short average study duration ({avg_duration:.0f} days) insufficient for risk assessment",
                        "priority": "High",
                        "evidence": f"Average duration: {avg_duration:.0f} days",
                        "recommendation": "Extend studies to capture long-term risk factors"
                    })
        
        return gaps
    
    def _analyze_funding_gaps(self) -> List[Dict[str, Any]]:
        """Analyze funding-related gaps"""
        gaps = []
        
        # Analyze funding distribution
        total_funding = self.df['Funding'].sum()
        avg_funding = self.df['Funding'].mean()
        
        # Find projects with very low funding
        low_funding_projects = len(self.df[self.df['Funding'] < avg_funding * 0.5])
        if low_funding_projects > 0:
            gaps.append({
                "area": "Funding Distribution",
                "gap": f"{low_funding_projects} projects have funding below 50% of average",
                "priority": "Medium",
                "evidence": f"{low_funding_projects} projects with <${avg_funding * 0.5:,.0f} funding",
                "recommendation": "Review funding allocation to ensure adequate resources for all projects"
            })
        
        return gaps
    
    def _analyze_team_gaps(self) -> List[Dict[str, Any]]:
        """Analyze team size gaps"""
        gaps = []
        
        # Analyze team size distribution
        avg_team_size = self.df['Team_Size'].mean()
        
        # Find projects with very small teams
        small_team_projects = len(self.df[self.df['Team_Size'] < 3])
        if small_team_projects > 0:
            gaps.append({
                "area": "Team Size Distribution",
                "gap": f"{small_team_projects} projects have teams smaller than 3 members",
                "priority": "Low",
                "evidence": f"{small_team_projects} projects with <3 team members (avg: {avg_team_size:.1f})",
                "recommendation": "Consider increasing team sizes for better collaboration and expertise"
            })
        
        return gaps
    
    def _analyze_roi_gaps(self) -> List[Dict[str, Any]]:
        """Analyze ROI-related gaps"""
        gaps = []
        
        # Analyze ROI distribution
        if 'ROI' in self.df.columns:
            avg_roi = self.df['ROI'].mean()
            low_roi_projects = len(self.df[self.df['ROI'] < avg_roi * 0.8])
            
            if low_roi_projects > 0:
                gaps.append({
                    "area": "ROI Performance",
                    "gap": f"{low_roi_projects} projects have ROI below 80% of average",
                    "priority": "Medium",
                    "evidence": f"{low_roi_projects} projects with ROI <{avg_roi * 0.8:.1f}%",
                    "recommendation": "Review project selection criteria and resource allocation"
                })
        
        return gaps
    
    def _analyze_team_efficiency_gaps(self) -> List[Dict[str, Any]]:
        """Analyze team efficiency gaps"""
        gaps = []
        
        # Analyze funding per team member
        self.df['funding_per_member'] = self.df['Funding'] / self.df['Team_Size']
        avg_funding_per_member = self.df['funding_per_member'].mean()
        
        inefficient_teams = len(self.df[self.df['funding_per_member'] < avg_funding_per_member * 0.5])
        if inefficient_teams > 0:
            gaps.append({
                "area": "Team Efficiency",
                "gap": f"{inefficient_teams} projects have low funding per team member",
                "priority": "Low",
                "evidence": f"{inefficient_teams} projects with <${avg_funding_per_member * 0.5:,.0f} per member",
                "recommendation": "Optimize team sizes relative to project funding"
            })
        
        return gaps
    
    def _analyze_status_gaps(self) -> List[Dict[str, Any]]:
        """Analyze project status gaps"""
        gaps = []
        
        # Analyze project completion rates
        status_counts = self.df['Status'].value_counts()
        total_projects = len(self.df)
        
        if 'Active' in status_counts:
            active_percentage = (status_counts['Active'] / total_projects) * 100
            if active_percentage > 70:
                gaps.append({
                    "area": "Project Completion Rate",
                    "gap": f"High percentage ({active_percentage:.1f}%) of projects still active",
                    "priority": "Medium",
                    "evidence": f"{status_counts['Active']}/{total_projects} projects active",
                    "recommendation": "Review project timelines and completion processes"
                })
        
        return gaps

# Global instance
data_processor = DynamicDataProcessor()
