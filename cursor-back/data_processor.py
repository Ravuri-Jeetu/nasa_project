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
            print(f"✅ Loaded {len(self.df)} research projects")
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
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

# Global instance
data_processor = DynamicDataProcessor()
