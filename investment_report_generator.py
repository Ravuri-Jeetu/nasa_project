#!/usr/bin/env python3
"""
NASA Cross-Domain Synergy Investment Report Generator
Generates professional PDF reports with proper formatting and missing value handling.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional


class InvestmentReportGenerator:
    """Generates professional PDF investment reports for NASA Cross-Domain Synergy Analysis."""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the report."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue,
            borderWidth=1,
            borderColor=colors.lightgrey,
            borderPadding=8
        ))
        
        # Subsection style
        self.styles.add(ParagraphStyle(
            name='Subsection',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=12,
            textColor=colors.darkgreen
        ))
        
        # Body text style
        self.styles.add(ParagraphStyle(
            name='CustomBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))
        
        # Bullet point style
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            leftIndent=20,
            bulletIndent=10
        ))

    def format_value(self, value: Any, suffix: str = '') -> Optional[str]:
        """Format values, skipping undefined/null/empty/zero values."""
        if value is None or value == '' or value == 0 or (isinstance(value, float) and (value != value or value == 0)):
            return None
        return f"{value}{suffix}"

    def format_percentage(self, value: float) -> Optional[str]:
        """Format percentage values."""
        if value is None or (isinstance(value, float) and value != value):
            return None
        return f"{round(value * 100)}%"

    def get_synergy_summary(self, synergy: Dict[str, Any]) -> str:
        """Get natural language summary for synergy."""
        summaries = {
            'Human Research-Space Biology': 'Studies on cerebral arteries and reproductive health suggest overlapping physiological adaptations that require joint research for comprehensive astronaut health solutions.',
            'Space Biology-Technology Development': 'Plant gravisensing research bridges fundamental biology with technological applications, creating opportunities for innovative lab-on-a-chip solutions.',
            'Planetary Science-Space Biology': 'Mars mission plant biology research connects planetary exploration with space agriculture, essential for sustainable life support systems.',
            'Earth Science-Space Biology': 'Atmospheric pressure research links Earth-based plant studies with space biology, crucial for understanding plant responses in extreme environments.'
        }
        
        key = f"{synergy.get('Domain_A', '')}-{synergy.get('Domain_B', '')}"
        return summaries.get(key, f"Research in {synergy.get('Domain_A', 'Unknown')} and {synergy.get('Domain_B', 'Unknown')} shows significant thematic overlap with strong potential for cross-domain collaboration and knowledge transfer.")

    def create_title_page(self, story: List, report_data: Dict[str, Any]):
        """Create a professional title page."""
        # Title
        story.append(Paragraph("NASA Cross-Domain Synergy", self.styles['CustomTitle']))
        story.append(Paragraph("Investment Report", self.styles['CustomTitle']))
        story.append(Spacer(1, 0.5*inch))
        
        # Subtitle
        story.append(Paragraph("Strategic Analysis & Recommendations", self.styles['Heading2']))
        story.append(Spacer(1, 0.3*inch))
        
        # Report details
        details_data = [
            ['Report Date:', datetime.now().strftime('%B %d, %Y')],
            ['Generated By:', 'NASA Cross-Domain Synergy Analysis System'],
            ['Analysis Period:', 'Current Dataset'],
        ]
        
        if report_data.get('budget'):
            details_data.append(['Investment Budget:', f"${report_data['budget']}M"])
        if report_data.get('timeline'):
            details_data.append(['Timeline:', f"{report_data['timeline']} months"])
        if report_data.get('riskTolerance'):
            details_data.append(['Risk Tolerance:', report_data['riskTolerance']])
        
        details_table = Table(details_data, colWidths=[2*inch, 3*inch])
        details_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(details_table)
        story.append(PageBreak())

    def create_financial_summary(self, story: List, report_data: Dict[str, Any]):
        """Create financial summary section."""
        story.append(Paragraph("Financial Summary", self.styles['SectionHeader']))
        
        financial_items = []
        
        if self.format_value(report_data.get('totalFundingRequired')):
            financial_items.append(f"• Total Funding Required: ${report_data['totalFundingRequired']:.1f}M")
        
        if self.format_percentage(report_data.get('budgetUtilization')):
            financial_items.append(f"• Budget Utilization: {self.format_percentage(report_data['budgetUtilization'])}")
        
        if self.format_value(report_data.get('estimatedROI')):
            financial_items.append(f"• Estimated ROI: {report_data['estimatedROI']}%")
        
        if self.format_value(report_data.get('avgROI')):
            financial_items.append(f"• Average ROI: {report_data['avgROI']:.1f}%")
        
        if not financial_items:
            story.append(Paragraph("No financial data available.", self.styles['CustomBodyText']))
        else:
            for item in financial_items:
                story.append(Paragraph(item, self.styles['BulletPoint']))
        
        story.append(Spacer(1, 0.2*inch))

    def create_synergies_section(self, story: List, report_data: Dict[str, Any]):
        """Create top synergies section."""
        story.append(Paragraph("Top Recommended Synergies", self.styles['SectionHeader']))
        
        synergies = report_data.get('recommendedSynergies', [])
        if not synergies:
            story.append(Paragraph("No synergy data available.", self.styles['CustomBodyText']))
            return
        
        for i, synergy in enumerate(synergies[:5], 1):  # Limit to top 5
            # Synergy header
            domain_pair = f"{synergy.get('Domain_A', 'Unknown')} ↔ {synergy.get('Domain_B', 'Unknown')}"
            story.append(Paragraph(f"{i}. {domain_pair}", self.styles['Subsection']))
            
            # Summary
            summary = self.get_synergy_summary(synergy)
            story.append(Paragraph(f"<b>Summary:</b> {summary}", self.styles['CustomBodyText']))
            
            # Metrics
            metrics = []
            
            if self.format_percentage(synergy.get('Similarity_Score')):
                metrics.append(f"• Similarity Score: {self.format_percentage(synergy['Similarity_Score'])}")
            
            if self.format_value(synergy.get('totalFunding')):
                metrics.append(f"• Total Funding: ${synergy['totalFunding']:.1f}M")
            
            if self.format_value(synergy.get('totalCitations')):
                metrics.append(f"• Total Citations: {synergy['totalCitations']}")
            
            if self.format_value(synergy.get('Expected_ROI')):
                metrics.append(f"• Expected ROI: {synergy['Expected_ROI']}%")
            
            if synergy.get('Risk_Level'):
                metrics.append(f"• Risk Level: {synergy['Risk_Level']}")
            
            for metric in metrics:
                story.append(Paragraph(metric, self.styles['BulletPoint']))
            
            # Project details
            funding_breakdown = synergy.get('fundingBreakdown', {})
            
            if funding_breakdown.get('projectA'):
                pA = funding_breakdown['projectA']
                story.append(Paragraph(f"<b>Project A:</b> {pA.get('title', 'Unknown')}", self.styles['CustomBodyText']))
                
                project_a_details = []
                if self.format_value(pA.get('funding')):
                    project_a_details.append(f"Funding: ${pA['funding']:.1f}M")
                if self.format_value(pA.get('citations')):
                    project_a_details.append(f"Citations: {pA['citations']}")
                if pA.get('status'):
                    project_a_details.append(f"Status: {pA['status']}")
                
                if project_a_details:
                    story.append(Paragraph(" - " + " | ".join(project_a_details), self.styles['CustomBodyText']))
            
            if funding_breakdown.get('projectB'):
                pB = funding_breakdown['projectB']
                story.append(Paragraph(f"<b>Project B:</b> {pB.get('title', 'Unknown')}", self.styles['CustomBodyText']))
                
                project_b_details = []
                if self.format_value(pB.get('funding')):
                    project_b_details.append(f"Funding: ${pB['funding']:.1f}M")
                if self.format_value(pB.get('citations')):
                    project_b_details.append(f"Citations: {pB['citations']}")
                if pB.get('status'):
                    project_b_details.append(f"Status: {pB['status']}")
                
                if project_b_details:
                    story.append(Paragraph(" - " + " | ".join(project_b_details), self.styles['CustomBodyText']))
            
            story.append(Spacer(1, 0.15*inch))

    def create_risk_mitigation_section(self, story: List, report_data: Dict[str, Any]):
        """Create risk mitigation strategies section."""
        story.append(Paragraph("Risk Mitigation Strategies", self.styles['SectionHeader']))
        
        strategies = report_data.get('riskMitigationStrategies', [])
        if not strategies:
            story.append(Paragraph("No risk mitigation strategies available.", self.styles['CustomBodyText']))
        else:
            for strategy in strategies:
                story.append(Paragraph(f"• {strategy}", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 0.2*inch))

    def create_timeline_section(self, story: List, report_data: Dict[str, Any]):
        """Create timeline recommendations section."""
        story.append(Paragraph("Timeline Recommendations", self.styles['SectionHeader']))
        
        timeline = report_data.get('timelineRecommendations', {})
        timeline_items = []
        
        if timeline.get('phase1'):
            timeline_items.append(f"• {timeline['phase1']}")
        if timeline.get('phase2'):
            timeline_items.append(f"• {timeline['phase2']}")
        if timeline.get('phase3'):
            timeline_items.append(f"• {timeline['phase3']}")
        
        if not timeline_items:
            story.append(Paragraph("No timeline recommendations available.", self.styles['CustomBodyText']))
        else:
            for item in timeline_items:
                story.append(Paragraph(item, self.styles['BulletPoint']))
        
        story.append(Spacer(1, 0.2*inch))

    def create_success_metrics_section(self, story: List, report_data: Dict[str, Any]):
        """Create success metrics section."""
        story.append(Paragraph("Success Metrics", self.styles['SectionHeader']))
        
        metrics = report_data.get('successMetrics', {})
        
        # Short-term metrics
        story.append(Paragraph("Short-term (3 months):", self.styles['Subsection']))
        short_term = metrics.get('shortTerm', [])
        if short_term:
            for metric in short_term:
                story.append(Paragraph(f"• {metric}", self.styles['BulletPoint']))
        else:
            story.append(Paragraph("No short-term metrics available.", self.styles['CustomBodyText']))
        
        story.append(Spacer(1, 0.1*inch))
        
        # Medium-term metrics
        story.append(Paragraph("Medium-term (6-12 months):", self.styles['Subsection']))
        medium_term = metrics.get('mediumTerm', [])
        if medium_term:
            for metric in medium_term:
                story.append(Paragraph(f"• {metric}", self.styles['BulletPoint']))
        else:
            story.append(Paragraph("No medium-term metrics available.", self.styles['CustomBodyText']))
        
        story.append(Spacer(1, 0.1*inch))
        
        # Long-term metrics
        story.append(Paragraph("Long-term (12+ months):", self.styles['Subsection']))
        long_term = metrics.get('longTerm', [])
        if long_term:
            for metric in long_term:
                story.append(Paragraph(f"• {metric}", self.styles['BulletPoint']))
        else:
            story.append(Paragraph("No long-term metrics available.", self.styles['CustomBodyText']))

    def generate_investment_report(self, data: Dict[str, Any], output_path: str = "investment_report.pdf") -> str:
        """
        Generate a professional PDF investment report.
        
        Args:
            data: Investment report data dictionary
            output_path: Output file path for the PDF
            
        Returns:
            Path to the generated PDF file
        """
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build story (content)
        story = []
        
        # Title page
        self.create_title_page(story, data)
        
        # Financial Summary
        self.create_financial_summary(story, data)
        
        # Top Synergies
        self.create_synergies_section(story, data)
        
        # Risk Mitigation
        self.create_risk_mitigation_section(story, data)
        
        # Timeline Recommendations
        self.create_timeline_section(story, data)
        
        # Success Metrics
        self.create_success_metrics_section(story, data)
        
        # Build PDF
        doc.build(story)
        
        return output_path


def generate_investment_report(data: Dict[str, Any], output_path: str = "investment_report.pdf") -> str:
    """
    Main function to generate investment report PDF.
    
    Args:
        data: Investment report data dictionary
        output_path: Output file path for the PDF
        
    Returns:
        Path to the generated PDF file
    """
    generator = InvestmentReportGenerator()
    return generator.generate_investment_report(data, output_path)


if __name__ == "__main__":
    # Example usage
    sample_data = {
        "budget": "5",
        "timeline": "24",
        "riskTolerance": "Medium",
        "focusAreas": "Human Research, Space Biology",
        "objectives": "Develop comprehensive astronaut health solutions",
        "totalFundingRequired": 8.5,
        "budgetUtilization": 0.59,
        "estimatedROI": 280,
        "avgROI": 250.5,
        "recommendedSynergies": [
            {
                "Domain_A": "Human Research",
                "Domain_B": "Space Biology",
                "Similarity_Score": 0.908,
                "totalFunding": 4.3,
                "totalCitations": 77,
                "Expected_ROI": 340,
                "Risk_Level": "Low",
                "fundingBreakdown": {
                    "projectA": {
                        "title": "Adaptations of cerebral arteries to simulated microgravity",
                        "funding": 2.5,
                        "citations": 45,
                        "status": "Active"
                    },
                    "projectB": {
                        "title": "Plant gravisensing and response mechanisms in microgravity",
                        "funding": 1.8,
                        "citations": 32,
                        "status": "Active"
                    }
                }
            }
        ],
        "riskMitigationStrategies": [
            "Focus on Active projects with proven track records",
            "Prioritize synergies with high citation counts",
            "Implement phased funding approach",
            "Establish regular progress monitoring"
        ],
        "timelineRecommendations": {
            "phase1": "Months 1-8: Foundation and initial collaborations",
            "phase2": "Months 9-16: Core synergy development",
            "phase3": "Months 17-24: Scaling and optimization"
        },
        "successMetrics": {
            "shortTerm": [
                "Project initiation within 3 months",
                "Cross-domain collaboration agreements signed",
                "Initial funding disbursed to priority projects"
            ],
            "mediumTerm": [
                "50% of synergies showing measurable progress",
                "Publication output increase by 25%",
                "Technology transfer agreements established"
            ],
            "longTerm": [
                "ROI target of 280% achieved",
                "Breakthrough discoveries in priority areas",
                "Sustainable collaboration framework established"
            ]
        }
    }
    
    # Generate report
    output_file = generate_investment_report(sample_data, "nasa_investment_report.pdf")
    print(f"Investment report generated: {output_file}")
