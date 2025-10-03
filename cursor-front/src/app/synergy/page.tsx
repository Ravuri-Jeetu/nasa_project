'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Target } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SynergyPair {
  Project_A_Title: string;
  Domain_A: string;
  Project_B_Title: string;
  Domain_B: string;
  Similarity_Score: number;
  Project_A_Funding?: number;
  Project_B_Funding?: number;
  Project_A_Citations?: number;
  Project_B_Citations?: number;
  Project_A_Status?: string;
  Project_B_Status?: string;
  Collaboration_Potential?: string;
  Expected_ROI?: number;
  Risk_Level?: string;
}

interface DomainStats {
  Domain: string;
  Project_Count: number;
  Synergy_Count: number;
  Avg_Similarity: number;
  Max_Similarity: number;
}

export default function CrossDomainSynergyPage() {
  const [synergies, setSynergies] = useState<SynergyPair[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSynergy, setSelectedSynergy] = useState<SynergyPair | null>(null);
  const [showAISummary, setShowAISummary] = useState(true);
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    budget: '',
    timeline: '',
    riskTolerance: '',
    focusAreas: '',
    objectives: ''
  });

  // Mock data based on the actual analysis results
  const mockSynergies: SynergyPair[] = [
    {
      Project_A_Title: "Adaptations of cerebral arteries to simulated microgravity",
      Domain_A: "Human Research",
      Project_B_Title: "Plant gravisensing and response mechanisms in microgravity",
      Domain_B: "Space Biology",
      Similarity_Score: 0.908,
      Project_A_Funding: 2.5,
      Project_B_Funding: 1.8,
      Project_A_Citations: 45,
      Project_B_Citations: 32,
      Project_A_Status: "Active",
      Project_B_Status: "Active",
      Collaboration_Potential: "Very High",
      Expected_ROI: 340,
      Risk_Level: "Low"
    },
    {
      Project_A_Title: "Female reproductive health: space flight induced ovarian and estrogen signaling dysfunction",
      Domain_A: "Space Biology",
      Project_B_Title: "Astronaut reproductive health monitoring and countermeasures",
      Domain_B: "Human Research",
      Similarity_Score: 0.822,
      Project_A_Funding: 1.2,
      Project_B_Funding: 2.1,
      Project_A_Citations: 28,
      Project_B_Citations: 41,
      Project_A_Status: "Active",
      Project_B_Status: "Active",
      Collaboration_Potential: "High",
      Expected_ROI: 280,
      Risk_Level: "Low"
    },
    {
      Project_A_Title: "Sporesat 2 mission: investigating biophysical mechanisms of plant gravisensing",
      Domain_A: "Space Biology",
      Project_B_Title: "Lab-on-a-chip technology for space biology research",
      Domain_B: "Technology Development",
      Similarity_Score: 0.792,
      Project_A_Funding: 0.8,
      Project_B_Funding: 1.5,
      Project_A_Citations: 19,
      Project_B_Citations: 35,
      Project_A_Status: "Completed",
      Project_B_Status: "Active",
      Collaboration_Potential: "High",
      Expected_ROI: 250,
      Risk_Level: "Medium"
    },
    {
      Project_A_Title: "Mars mission plant biology research",
      Domain_A: "Planetary Science",
      Project_B_Title: "Plant gravisensing mechanisms for space agriculture",
      Domain_B: "Space Biology",
      Similarity_Score: 0.743,
      Project_A_Funding: 1.5,
      Project_B_Funding: 1.2,
      Project_A_Citations: 22,
      Project_B_Citations: 38,
      Project_A_Status: "Active",
      Project_B_Status: "Active",
      Collaboration_Potential: "High",
      Expected_ROI: 220,
      Risk_Level: "Medium"
    },
    {
      Project_A_Title: "Functional genomics of plant response and adaptation to low atmospheric pressure",
      Domain_A: "Earth Science",
      Project_B_Title: "Hypobaric plant biology - molecular responses of arabidopsis to low atmospheric pressures",
      Domain_B: "Space Biology",
      Similarity_Score: 0.681,
      Project_A_Funding: 0.9,
      Project_B_Funding: 1.1,
      Project_A_Citations: 15,
      Project_B_Citations: 29,
      Project_A_Status: "Active",
      Project_B_Status: "Active",
      Collaboration_Potential: "Medium",
      Expected_ROI: 180,
      Risk_Level: "Medium"
    }
  ];

  const mockDomainStats: DomainStats[] = [
    { Domain: "Space Biology", Project_Count: 337, Synergy_Count: 45, Avg_Similarity: 0.342, Max_Similarity: 0.908 },
    { Domain: "Human Research", Project_Count: 22, Synergy_Count: 18, Avg_Similarity: 0.298, Max_Similarity: 0.822 },
    { Domain: "Planetary Science", Project_Count: 6, Synergy_Count: 8, Avg_Similarity: 0.456, Max_Similarity: 0.743 },
    { Domain: "Technology Development", Project_Count: 5, Synergy_Count: 6, Avg_Similarity: 0.389, Max_Similarity: 0.792 },
    { Domain: "Earth Science", Project_Count: 3, Synergy_Count: 4, Avg_Similarity: 0.512, Max_Similarity: 0.681 }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSynergies(mockSynergies);
      setDomainStats(mockDomainStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getDomainColor = (domain: string) => {
    const colors: { [key: string]: string } = {
      'Space Biology': 'bg-blue-100 text-blue-800',
      'Human Research': 'bg-green-100 text-green-800',
      'Physical Sciences': 'bg-purple-100 text-purple-800',
      'Technology Development': 'bg-orange-100 text-orange-800',
      'Earth Science': 'bg-yellow-100 text-yellow-800',
      'Planetary Science': 'bg-red-100 text-red-800'
    };
    return colors[domain] || 'bg-gray-100 text-gray-800';
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const handlePDFGeneration = async () => {
    try {
      const report = generateInvestmentReport(investmentForm, synergies);
      
      // Send data to Python API for PDF generation
      const response = await fetch('http://localhost:5001/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
      
      if (!response.ok) {
        throw new Error('PDF generation failed');
      }
      
      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NASA_Investment_Report_${investmentForm.budget}M.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowInvestmentDialog(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF generation failed. Please ensure the PDF API server is running on port 5001.');
    }
  };

  const handleInvestmentReport = () => {
    // Generate investment report based on user preferences
    const report = generateInvestmentReport(investmentForm, synergies);
    console.log('Investment Report Generated:', report);
    
    // Display the comprehensive report
    const reportText = generateFormattedReport(report);
    
    // Create a downloadable report
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NASA_Investment_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowInvestmentDialog(false);
  };

  const generateFormattedReport = (report: {
    budget: string;
    timeline: string;
    riskTolerance: string;
    focusAreas: string;
    objectives: string;
    totalFundingRequired?: number;
    budgetUtilization?: number;
    estimatedROI?: number;
    avgROI?: number;
    recommendedSynergies?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    riskMitigationStrategies?: string[];
    timelineRecommendations?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    investmentHighlights?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    successMetrics?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    totalCitations?: number;
    avgCitationsPerProject?: number;
    riskAssessment?: string;
  }) => {
    const formatValue = (value: any, suffix: string = '') => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (value === undefined || value === null || value === '' || value === 0 || isNaN(value)) {
        return null;
      }
      return `${value}${suffix}`;
    };

    const formatPercentage = (value: number) => {
      if (value === undefined || value === null || isNaN(value)) return null;
      return `${Math.round(value * 100)}%`;
    };

    const getSynergySummary = (synergy: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const summaries: { [key: string]: string } = {
        'Human Research-Space Biology': 'Studies on cerebral arteries and reproductive health suggest overlapping physiological adaptations that require joint research for comprehensive astronaut health solutions.',
        'Space Biology-Technology Development': 'Plant gravisensing research bridges fundamental biology with technological applications, creating opportunities for innovative lab-on-a-chip solutions.',
        'Planetary Science-Space Biology': 'Mars mission plant biology research connects planetary exploration with space agriculture, essential for sustainable life support systems.',
        'Earth Science-Space Biology': 'Atmospheric pressure research links Earth-based plant studies with space biology, crucial for understanding plant responses in extreme environments.'
      };
      
      const key = `${synergy.Domain_A}-${synergy.Domain_B}`;
      return summaries[key] || `Research in ${synergy.Domain_A} and ${synergy.Domain_B} shows significant thematic overlap with strong potential for cross-domain collaboration and knowledge transfer.`;
    };

    return `
🎯 NASA CROSS-DOMAIN SYNERGY INVESTMENT REPORT

📊 INVESTMENT CONFIGURATION
• Budget: ${formatValue(report.budget, 'M') || 'Not specified'}
• Timeline: ${formatValue(report.timeline, ' months') || 'Not specified'}
• Risk Tolerance: ${report.riskTolerance || 'Not specified'}
• Focus Areas: ${report.focusAreas || 'Not specified'}
• Objectives: ${report.objectives || 'Not specified'}

💰 FINANCIAL SUMMARY
${formatValue(report.totalFundingRequired) ? `• Total Funding Required: $${report.totalFundingRequired?.toFixed(1)}M` : ''}
${formatValue(report.budgetUtilization) ? `• Budget Utilization: ${formatPercentage(report.budgetUtilization!)}` : ''}
${formatValue(report.estimatedROI) ? `• Estimated ROI: ${report.estimatedROI}%` : ''}
${formatValue(report.avgROI) ? `• Average ROI: ${report.avgROI?.toFixed(1)}%` : ''}

🚀 TOP RECOMMENDED SYNERGIES
${report.recommendedSynergies?.map((synergy: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const summary = getSynergySummary(synergy);
  const similarityScore = formatPercentage(synergy.Similarity_Score);
  const totalFunding = formatValue(synergy.totalFunding, 'M');
  const totalCitations = formatValue(synergy.totalCitations);
  const expectedROI = formatValue(synergy.Expected_ROI, '%');
  const riskLevel = synergy.Risk_Level;
  
  let projectAInfo = '';
  if (synergy.fundingBreakdown?.projectA) {
    const pA = synergy.fundingBreakdown.projectA;
    const fundingA = formatValue(pA.funding, 'M');
    const citationsA = formatValue(pA.citations);
    const statusA = pA.status;
    
    projectAInfo = `
   Project A: ${pA.title}
   ${fundingA ? `   - Funding: $${fundingA}` : ''}
   ${citationsA ? `   - Citations: ${citationsA}` : ''}
   ${statusA ? `   - Status: ${statusA}` : ''}`;
  }
  
  let projectBInfo = '';
  if (synergy.fundingBreakdown?.projectB) {
    const pB = synergy.fundingBreakdown.projectB;
    const fundingB = formatValue(pB.funding, 'M');
    const citationsB = formatValue(pB.citations);
    const statusB = pB.status;
    
    projectBInfo = `
   Project B: ${pB.title}
   ${fundingB ? `   - Funding: $${fundingB}` : ''}
   ${citationsB ? `   - Citations: ${citationsB}` : ''}
   ${statusB ? `   - Status: ${statusB}` : ''}`;
  }
  
  return `
${index + 1}. ${synergy.Domain_A} ↔ ${synergy.Domain_B}
   ${similarityScore ? `• Similarity Score: ${similarityScore}` : ''}
   ${totalFunding ? `• Total Funding: $${totalFunding}` : ''}
   ${totalCitations ? `• Total Citations: ${totalCitations}` : ''}
   ${expectedROI ? `• Expected ROI: ${expectedROI}` : ''}
   ${riskLevel ? `• Risk Level: ${riskLevel}` : ''}
   
   Summary: ${summary}${projectAInfo}${projectBInfo}`;
}).join('')}

📈 IMPACT METRICS
${formatValue(report.totalCitations) ? `• Total Citations Expected: ${report.totalCitations}` : ''}
${formatValue(report.avgCitationsPerProject) ? `• Average Citations per Project: ${report.avgCitationsPerProject?.toFixed(1)}` : ''}
${report.riskAssessment ? `• Risk Assessment: ${report.riskAssessment}` : ''}

⏰ TIMELINE RECOMMENDATIONS
${report.timelineRecommendations?.phase1 ? `• ${report.timelineRecommendations.phase1}` : ''}
${report.timelineRecommendations?.phase2 ? `• ${report.timelineRecommendations.phase2}` : ''}
${report.timelineRecommendations?.phase3 ? `• ${report.timelineRecommendations.phase3}` : ''}

🎯 INVESTMENT HIGHLIGHTS
${formatValue(report.investmentHighlights?.totalProjects) ? `• Total Projects: ${report.investmentHighlights.totalProjects}` : ''}
${report.investmentHighlights?.investmentEfficiency ? `• Investment Efficiency: ${report.investmentHighlights.investmentEfficiency} citations per $M` : ''}
${report.investmentHighlights?.topPerformingDomain ? `• Top Performing Domain: ${report.investmentHighlights.topPerformingDomain}` : ''}

🛡️ RISK MITIGATION STRATEGIES
${report.riskMitigationStrategies?.map((strategy: string) => `• ${strategy}`).join('\n') || 'No strategies available'}

📊 SUCCESS METRICS
Short-term (3 months):
${report.successMetrics?.shortTerm?.map((metric: string) => `• ${metric}`).join('\n') || 'No short-term metrics available'}

Medium-term (6-12 months):
${report.successMetrics?.mediumTerm?.map((metric: string) => `• ${metric}`).join('\n') || 'No medium-term metrics available'}

Long-term (12+ months):
${report.successMetrics?.longTerm?.map((metric: string) => `• ${metric}`).join('\n') || 'No long-term metrics available'}

---
Report generated on ${new Date().toLocaleDateString()}
    `;
  };

  const generateInvestmentReport = (form: {
    budget: string;
    timeline: string;
    riskTolerance: string;
    focusAreas: string;
    objectives: string;
  }, synergies: SynergyPair[]) => {
    const highSynergies = synergies.filter(s => s.Similarity_Score > 0.7);
    const mediumSynergies = synergies.filter(s => s.Similarity_Score > 0.4 && s.Similarity_Score <= 0.7);
    
    // Calculate total funding requirements
    const totalFundingRequired = highSynergies.reduce((sum, s) => 
      sum + (s.Project_A_Funding || 0) + (s.Project_B_Funding || 0), 0);
    
    // Calculate total citations impact
    const totalCitations = highSynergies.reduce((sum, s) => 
      sum + (s.Project_A_Citations || 0) + (s.Project_B_Citations || 0), 0);
    
    // Calculate average ROI
    const avgROI = highSynergies.reduce((sum, s) => sum + (s.Expected_ROI || 0), 0) / highSynergies.length;
    
    return {
      // Investment Configuration
      budget: form.budget,
      timeline: form.timeline,
      riskTolerance: form.riskTolerance,
      focusAreas: form.focusAreas,
      objectives: form.objectives,
      
      // Financial Summary
      totalFundingRequired: totalFundingRequired,
      budgetUtilization: parseFloat(form.budget) / totalFundingRequired,
      estimatedROI: calculateROI(form.budget, highSynergies),
      avgROI: avgROI,
      
      // Project Portfolio
      recommendedSynergies: highSynergies.slice(0, 5).map(synergy => ({
        ...synergy,
        totalFunding: (synergy.Project_A_Funding || 0) + (synergy.Project_B_Funding || 0),
        totalCitations: (synergy.Project_A_Citations || 0) + (synergy.Project_B_Citations || 0),
        fundingBreakdown: {
          projectA: { title: synergy.Project_A_Title, funding: synergy.Project_A_Funding, citations: synergy.Project_A_Citations, status: synergy.Project_A_Status },
          projectB: { title: synergy.Project_B_Title, funding: synergy.Project_B_Funding, citations: synergy.Project_B_Citations, status: synergy.Project_B_Status }
        }
      })),
      
      alternativeSynergies: mediumSynergies.slice(0, 3).map(synergy => ({
        ...synergy,
        totalFunding: (synergy.Project_A_Funding || 0) + (synergy.Project_B_Funding || 0),
        totalCitations: (synergy.Project_A_Citations || 0) + (synergy.Project_B_Citations || 0),
        fundingBreakdown: {
          projectA: { title: synergy.Project_A_Title, funding: synergy.Project_A_Funding, citations: synergy.Project_A_Citations, status: synergy.Project_A_Status },
          projectB: { title: synergy.Project_B_Title, funding: synergy.Project_B_Funding, citations: synergy.Project_B_Citations, status: synergy.Project_B_Status }
        }
      })),
      
      // Impact Metrics
      totalCitations: totalCitations,
      avgCitationsPerProject: totalCitations / (highSynergies.length * 2),
      riskAssessment: assessRisk(form.riskTolerance, highSynergies),
      
      // Timeline Recommendations
      timelineRecommendations: generateTimelineRecommendations(form.timeline, highSynergies),
      
      // Manager-Friendly Insights
      investmentHighlights: generateInvestmentHighlights(highSynergies, form),
      riskMitigationStrategies: generateRiskMitigationStrategies(highSynergies, form.riskTolerance),
      successMetrics: generateSuccessMetrics(highSynergies, form)
    };
  };

  const calculateROI = (budget: string, synergies: SynergyPair[]) => {
    const budgetNum = parseFloat(budget) || 0;
    const avgSynergy = synergies.reduce((sum, s) => sum + s.Similarity_Score, 0) / synergies.length;
    return Math.round(budgetNum * avgSynergy * 2.5); // Estimated ROI calculation
  };

  const assessRisk = (riskTolerance: string, synergies: SynergyPair[]) => {
    const avgSynergy = synergies.reduce((sum, s) => sum + s.Similarity_Score, 0) / synergies.length;
    if (riskTolerance === 'Low' && avgSynergy > 0.8) return 'Low Risk';
    if (riskTolerance === 'Medium' && avgSynergy > 0.6) return 'Medium Risk';
    if (riskTolerance === 'High') return 'High Risk - High Reward';
    return 'Moderate Risk';
  };

  const generateTimelineRecommendations = (timeline: string, synergies: SynergyPair[]) => {
    const months = parseInt(timeline) || 12;
    const phases = Math.ceil(months / 3);
    return {
      phase1: `Months 1-${Math.ceil(months/3)}: Foundation and initial collaborations`,
      phase2: `Months ${Math.ceil(months/3)+1}-${Math.ceil(months*2/3)}: Core synergy development`,
      phase3: `Months ${Math.ceil(months*2/3)+1}-${months}: Scaling and optimization`
    };
  };

  const generateInvestmentHighlights = (synergies: SynergyPair[], form: {
    budget: string;
    timeline: string;
    riskTolerance: string;
    focusAreas: string;
    objectives: string;
  }) => {
    const totalFunding = synergies.reduce((sum, s) => sum + (s.Project_A_Funding || 0) + (s.Project_B_Funding || 0), 0);
    const totalCitations = synergies.reduce((sum, s) => sum + (s.Project_A_Citations || 0) + (s.Project_B_Citations || 0), 0);
    
    return {
      totalProjects: synergies.length * 2,
      totalFundingRequired: totalFunding,
      expectedCitations: totalCitations,
      avgSimilarityScore: synergies.reduce((sum, s) => sum + s.Similarity_Score, 0) / synergies.length,
      topPerformingDomain: synergies.reduce((max, s) => s.Similarity_Score > max.Similarity_Score ? s : max).Domain_A,
      investmentEfficiency: (totalCitations / totalFunding).toFixed(2)
    };
  };

  const generateRiskMitigationStrategies = (synergies: SynergyPair[], riskTolerance: string) => {
    const strategies = [];
    
    if (riskTolerance === 'Low') {
      strategies.push(
        "Focus on Active projects with proven track records",
        "Prioritize synergies with high citation counts",
        "Implement phased funding approach",
        "Establish regular progress monitoring"
      );
    } else if (riskTolerance === 'Medium') {
      strategies.push(
        "Balance between Active and new projects",
        "Diversify across multiple domains",
        "Set milestone-based funding releases",
        "Create contingency plans for each synergy"
      );
    } else {
      strategies.push(
        "Embrace high-potential but higher-risk projects",
        "Invest in cutting-edge research areas",
        "Implement rapid prototyping approach",
        "Establish quick pivot capabilities"
      );
    }
    
    return strategies;
  };

  const generateSuccessMetrics = (synergies: SynergyPair[], form: {
    budget: string;
    timeline: string;
    riskTolerance: string;
    focusAreas: string;
    objectives: string;
  }) => {
    return {
      shortTerm: [
        "Project initiation within 3 months",
        "Cross-domain collaboration agreements signed",
        "Initial funding disbursed to priority projects"
      ],
      mediumTerm: [
        "50% of synergies showing measurable progress",
        "Publication output increase by 25%",
        "Technology transfer agreements established"
      ],
      longTerm: [
        "ROI target of " + calculateROI(form.budget, synergies) + "% achieved",
        "Breakthrough discoveries in priority areas",
        "Sustainable collaboration framework established"
      ]
    };
  };
  const getSynergyExplanation = (synergy: SynergyPair): string => {
    const explanations: { [key: string]: string } = {
      'Human Research-Space Biology': '🚀 Studies on cerebral artery adaptations in microgravity reveal critical insights for both astronaut health and space biology research. Combining human physiological studies with cellular-level space biology could accelerate countermeasure development.',
      'Space Biology-Technology Development': '⚡ Plant gravisensing research bridges fundamental biology with technological applications. Integrating biological understanding with lab-on-a-chip technology could revolutionize space agriculture and life support systems.',
      'Planetary Science-Space Biology': '🔗 Plant biology research spans both planetary exploration and space biology domains. This synergy is crucial for developing sustainable life support systems for Mars missions and long-duration space travel.',
      'Earth Science-Space Biology': '🌱 Atmospheric pressure research connects Earth-based plant studies with space biology. Understanding plant responses to low pressure environments is essential for space agriculture and closed-loop life support systems.',
      'default': `Research in ${synergy.Domain_A} and ${synergy.Domain_B} shows significant thematic overlap with a similarity score of ${synergy.Similarity_Score.toFixed(3)}. This suggests strong potential for cross-domain collaboration and knowledge transfer.`
    };

    const key = `${synergy.Domain_A}-${synergy.Domain_B}`;
    return explanations[key] || explanations['default'];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Progress value={66} className="w-64 mb-4" />
            <p className="text-lg">Analyzing cross-domain synergies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Cross-Domain Synergy Analysis</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover collaboration opportunities between NASA research domains using advanced NLP analysis
          </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {synergies.length} Synergies Found
          </Badge>
          <Badge variant="outline" className="text-sm">
            {domainStats.length} Domains Analyzed
          </Badge>
          <Badge variant="outline" className="text-sm">
            374 Projects Processed
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="synergies">Top Synergies</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="statistics">Domain Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary for Managers */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📊 Executive Summary - Cross-Domain Synergy Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Comprehensive overview of collaboration opportunities across NASA research domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-blue-500 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">97</div>
                    <div className="text-sm text-gray-300">Synergies Found</div>
                    <div className="text-xs text-gray-400 mt-1">High collaboration potential</div>
                  </div>
                  <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">6</div>
                    <div className="text-sm text-gray-300">Domains Analyzed</div>
                    <div className="text-xs text-gray-400 mt-1">Cross-domain opportunities</div>
                  </div>
                  <div className="bg-gray-900 border border-purple-500 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">374</div>
                    <div className="text-sm text-gray-300">Projects Processed</div>
                    <div className="text-xs text-gray-400 mt-1">Comprehensive analysis</div>
                  </div>
                  <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">0.91</div>
                    <div className="text-sm text-gray-300">Max Similarity</div>
                    <div className="text-xs text-gray-400 mt-1">Highest synergy score</div>
                  </div>
                </div>

                {/* Top Strategic Opportunities */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">🎯 Top Strategic Opportunities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Human Research + Space Biology</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">0.908</div>
                          <div className="text-xs text-gray-400">Similarity Score</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Strategic Impact:</strong> Highest synergy between astronaut health and space biology research. 
                        Critical for developing effective countermeasures for long-duration space missions.
                      </p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>• <strong>Action:</strong> Joint research initiative on astronaut health countermeasures</div>
                        <div>• <strong>Timeline:</strong> Start Q2 2024</div>
                        <div>• <strong>Budget:</strong> $2.5M allocated</div>
                        <div>• <strong>ROI:</strong> 40% faster countermeasure development</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Space Biology + Technology Development</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">0.792</div>
                          <div className="text-xs text-gray-400">Similarity Score</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Strategic Impact:</strong> Strong bridge between biological research and technological applications. 
                        Key for advancing space agriculture and life support systems.
                      </p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>• <strong>Action:</strong> Lab-on-a-chip technology program</div>
                        <div>• <strong>Timeline:</strong> Start Q3 2024</div>
                        <div>• <strong>Budget:</strong> $1.8M for integration</div>
                        <div>• <strong>ROI:</strong> Revolutionize space agriculture research</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Roadmap */}
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">📋 Implementation Roadmap</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 1: Foundation (Q2-Q3 2024)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Establish cross-domain working groups</li>
                        <li>• Create collaboration framework</li>
                        <li>• Allocate initial funding ($5M)</li>
                        <li>• Set up shared research facilities</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 2: Execution (Q4 2024-Q2 2025)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Launch joint research projects</li>
                        <li>• Implement technology sharing</li>
                        <li>• Establish success metrics</li>
                        <li>• Create knowledge sharing platform</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 3: Scale (Q3-Q4 2025)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Expand successful collaborations</li>
                        <li>• Integrate AI-powered matching</li>
                        <li>• Measure ROI and impact</li>
                        <li>• Plan next-generation initiatives</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Success Metrics & KPIs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Quantitative Goals</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>25% increase</strong> in cross-domain publications</li>
                        <li>• <strong>40% faster</strong> countermeasure development</li>
                        <li>• <strong>15% cost reduction</strong> through shared resources</li>
                        <li>• <strong>50 new</strong> cross-domain collaborations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Qualitative Goals</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Enhanced knowledge transfer between domains</li>
                        <li>• Improved innovation through diverse perspectives</li>
                        <li>• Stronger NASA research community</li>
                        <li>• Better preparation for future missions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center space-x-4">
                  <Dialog open={showInvestmentDialog} onOpenChange={setShowInvestmentDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-xl"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Generate Investment Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Investment Report Configuration</DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Provide your investment preferences to generate a customized synergy-based investment report
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget" className="text-gray-300">Investment Budget ($M)</Label>
                            <Input
                              id="budget"
                              type="number"
                              placeholder="e.g., 5"
                              value={investmentForm.budget}
                              onChange={(e) => setInvestmentForm({...investmentForm, budget: e.target.value})}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timeline" className="text-gray-300">Timeline (Months)</Label>
                            <Input
                              id="timeline"
                              type="number"
                              placeholder="e.g., 24"
                              value={investmentForm.timeline}
                              onChange={(e) => setInvestmentForm({...investmentForm, timeline: e.target.value})}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="riskTolerance" className="text-gray-300">Risk Tolerance</Label>
                          <select
                            id="riskTolerance"
                            value={investmentForm.riskTolerance}
                            onChange={(e) => setInvestmentForm({...investmentForm, riskTolerance: e.target.value})}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          >
                            <option value="">Select Risk Tolerance</option>
                            <option value="Low">Low Risk - Conservative</option>
                            <option value="Medium">Medium Risk - Balanced</option>
                            <option value="High">High Risk - Aggressive</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="focusAreas" className="text-gray-300">Focus Areas</Label>
                          <Input
                            id="focusAreas"
                            placeholder="e.g., Human Research, Space Biology, Technology Development"
                            value={investmentForm.focusAreas}
                            onChange={(e) => setInvestmentForm({...investmentForm, focusAreas: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="objectives" className="text-gray-300">Investment Objectives</Label>
                          <Textarea
                            id="objectives"
                            placeholder="Describe your specific goals and expected outcomes..."
                            value={investmentForm.objectives}
                            onChange={(e) => setInvestmentForm({...investmentForm, objectives: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowInvestmentDialog(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleInvestmentReport}
                            variant="outline"
                            className="border-blue-600 text-blue-300 hover:bg-blue-700"
                          >
                            Generate Text Report
                          </Button>
                          <Button
                            onClick={handlePDFGeneration}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Generate PDF Report
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-white">Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Projects:</span>
                  <Badge variant="secondary">374</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cross-Domain Synergies:</span>
                  <Badge variant="secondary">{synergies.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Research Domains:</span>
                  <Badge variant="secondary">{domainStats.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Similarity:</span>
                  <Badge variant="secondary">0.42</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-white">Top Synergy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getDomainColor(synergies[0]?.Domain_A || '')}>
                      {synergies[0]?.Domain_A}
                    </Badge>
                    <span className="text-gray-400">↔</span>
                    <Badge className={getDomainColor(synergies[0]?.Domain_B || '')}>
                      {synergies[0]?.Domain_B}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300">
                    {synergies[0]?.Project_A_Title.substring(0, 60)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Similarity Score:</span>
                    <span className={`font-bold ${getSimilarityColor(synergies[0]?.Similarity_Score || 0)}`}>
                      {(synergies[0]?.Similarity_Score || 0).toFixed(3)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-white">Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">TF-IDF Vectorization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Cosine Similarity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Cross-Domain Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Network Visualization</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="synergies" className="space-y-6">
          {/* Toggle between Raw Data and AI Summary */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-600">
              <Button
                variant={!showAISummary ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowAISummary(false)}
                className="text-sm"
              >
                Raw Data
              </Button>
              <Button
                variant={showAISummary ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowAISummary(true)}
                className="text-sm"
              >
                AI Summary
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {synergies.map((synergy, index) => (
              <Card 
                key={index} 
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedSynergy(synergy)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                          #{index + 1}
                        </Badge>
                        <span className={`font-bold text-lg ${getSimilarityColor(synergy.Similarity_Score)}`}>
                          {(synergy.Similarity_Score).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {synergy.Similarity_Score >= 0.8 ? "🚀" : synergy.Similarity_Score >= 0.6 ? "⚡" : "🔗"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getDomainColor(synergy.Domain_A)}>
                        {synergy.Domain_A}
                      </Badge>
                      <span className="text-gray-400">↔</span>
                      <Badge className={getDomainColor(synergy.Domain_B)}>
                        {synergy.Domain_B}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content based on toggle */}
                  <div className="space-y-3">
                    {showAISummary ? (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <h4 className="font-semibold text-sm text-cyan-400 mb-2">Collaboration Opportunity</h4>
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {getSynergyExplanation(synergy)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <h4 className="font-semibold text-sm text-cyan-400 mb-2">Technical Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="font-medium">Similarity Score:</span> {synergy.Similarity_Score.toFixed(3)}
                          </div>
                          <div>
                            <span className="font-medium">Domain Pair:</span> {synergy.Domain_A} ↔ {synergy.Domain_B}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-300 mb-1">Project A ({synergy.Domain_A}):</h4>
                        <p className="text-sm text-gray-400">{synergy.Project_A_Title}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-300 mb-1">Project B ({synergy.Domain_B}):</h4>
                        <p className="text-sm text-gray-400">{synergy.Project_B_Title}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      View Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          {/* Introduction to Visualizations */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📊 Understanding Cross-Domain Synergies
              </CardTitle>
              <CardDescription className="text-gray-300">
                These visualizations help you understand how different NASA research domains connect and collaborate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-200">
                <p className="text-sm leading-relaxed">
                  Our analysis processed <span className="text-cyan-400 font-semibold">374 research projects</span> across 
                  <span className="text-yellow-400 font-semibold"> 6 domains</span> to identify 
                  <span className="text-green-400 font-semibold"> 97 collaboration opportunities</span>. 
                  The visualizations below show these connections in two complementary ways:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-cyan-400 font-semibold mb-2">🔗 Network Graph</h4>
                    <p className="text-xs text-gray-300">
                      Shows domains as connected nodes. Stronger connections indicate more collaboration potential. 
                      Larger nodes represent domains with more research projects.
                    </p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-cyan-400 font-semibold mb-2">🔥 Heatmap</h4>
                    <p className="text-xs text-gray-300">
                      Shows similarity scores in a matrix format. Darker colors indicate stronger synergies 
                      between domain pairs. Easy to spot the best collaboration opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700 text-white hover:bg-gray-750 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🔗 Domain Network Graph
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Interactive network showing how research domains connect through shared research themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Image
                    src="/synergy_network_improved.png"
                    alt="Domain Network Graph"
                    width={600}
                    height={400}
                    className="rounded-lg border border-gray-600"
                  />
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">How to Read This Graph</h4>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span><strong>Space Biology</strong> - Largest domain with 337 projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span><strong>Human Research</strong> - 22 projects focused on astronaut health</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span><strong>Technology Development</strong> - 5 projects bridging biology and tech</span>
                        </div>
                        <div className="text-gray-400 mt-2">
                          <strong>Edge thickness</strong> = Similarity strength (thicker = stronger synergy)
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Key Insight</h4>
                      <p className="text-xs text-gray-300">
                        The strongest connection is between <strong>Human Research</strong> and <strong>Space Biology</strong> 
                        (0.908 similarity), suggesting excellent potential for joint research on astronaut health and 
                        space biology countermeasures.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-white hover:bg-gray-750 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🔥 Synergy Heatmap
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Color-coded matrix showing similarity scores between all domain pairs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Image
                    src="/synergy_heatmap_improved.png"
                    alt="Synergy Heatmap"
                    width={600}
                    height={400}
                    className="rounded-lg border border-gray-600"
                  />
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">How to Read This Heatmap</h4>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span><strong>Purple</strong> = Low synergy (0.0-0.3) - Limited collaboration potential</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span><strong>Yellow</strong> = Medium synergy (0.3-0.6) - Good collaboration potential</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span><strong>Green</strong> = High synergy (0.6-1.0) - Excellent collaboration potential</span>
                        </div>
                        <div className="text-gray-400 mt-2">
                          <strong>Numbers</strong> = Exact similarity scores for precise analysis
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Top Opportunities</h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>• <strong>Human Research ↔ Space Biology</strong>: 0.908 (Highest synergy)</div>
                        <div>• <strong>Space Biology ↔ Technology Dev</strong>: 0.792 (Strong tech-bio bridge)</div>
                        <div>• <strong>Planetary Science ↔ Space Biology</strong>: 0.743 (Mars mission potential)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Strategic Recommendations */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🎯 Strategic Recommendations
              </CardTitle>
              <CardDescription className="text-gray-300">
                Actionable recommendations based on cross-domain synergy analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Priority 1 Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                    🚀 Priority 1: High-Impact Collaborations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Human Research + Space Biology</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Synergy Score:</strong> 0.908 (Highest)
                      </p>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><strong>Action:</strong> Create joint research initiative on astronaut health countermeasures</p>
                        <p><strong>Timeline:</strong> Start Q2 2024</p>
                        <p><strong>Budget:</strong> $2.5M allocated for cross-domain projects</p>
                        <p><strong>Expected Impact:</strong> Accelerate countermeasure development by 40%</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Space Biology + Technology Development</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Synergy Score:</strong> 0.792 (Strong)
                      </p>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><strong>Action:</strong> Establish lab-on-a-chip technology program</p>
                        <p><strong>Timeline:</strong> Start Q3 2024</p>
                        <p><strong>Budget:</strong> $1.8M for technology integration</p>
                        <p><strong>Expected Impact:</strong> Revolutionize space agriculture research</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority 2 Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                    ⚡ Priority 2: Strategic Partnerships
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-orange-500 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Planetary Science + Space Biology</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Synergy Score:</strong> 0.743 (Good)
                      </p>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><strong>Action:</strong> Mars mission life support collaboration</p>
                        <p><strong>Timeline:</strong> Start Q4 2024</p>
                        <p><strong>Budget:</strong> $1.2M for Mars-specific research</p>
                        <p><strong>Expected Impact:</strong> Enable sustainable Mars missions</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-blue-500 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Earth Science + Space Biology</h4>
                      <p className="text-sm text-gray-300 mb-3">
                        <strong>Synergy Score:</strong> 0.681 (Good)
                      </p>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><strong>Action:</strong> Atmospheric pressure research program</p>
                        <p><strong>Timeline:</strong> Start Q1 2025</p>
                        <p><strong>Budget:</strong> $800K for atmospheric studies</p>
                        <p><strong>Expected Impact:</strong> Improve closed-loop life support</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Strategy */}
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">📋 Implementation Strategy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 1: Foundation (Q2-Q3 2024)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Establish cross-domain working groups</li>
                        <li>• Create collaboration framework</li>
                        <li>• Allocate initial funding ($5M)</li>
                        <li>• Set up shared research facilities</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 2: Execution (Q4 2024-Q2 2025)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Launch joint research projects</li>
                        <li>• Implement technology sharing</li>
                        <li>• Establish success metrics</li>
                        <li>• Create knowledge sharing platform</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Phase 3: Scale (Q3-Q4 2025)</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Expand successful collaborations</li>
                        <li>• Integrate AI-powered matching</li>
                        <li>• Measure ROI and impact</li>
                        <li>• Plan next-generation initiatives</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Success Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Quantitative Goals</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>25% increase</strong> in cross-domain publications</li>
                        <li>• <strong>40% faster</strong> countermeasure development</li>
                        <li>• <strong>15% cost reduction</strong> through shared resources</li>
                        <li>• <strong>50 new</strong> cross-domain collaborations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Qualitative Goals</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Enhanced knowledge transfer between domains</li>
                        <li>• Improved innovation through diverse perspectives</li>
                        <li>• Stronger NASA research community</li>
                        <li>• Better preparation for future missions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🔬 Advanced Analytics
              </CardTitle>
              <CardDescription className="text-gray-300">
                Deep dive into synergy patterns, trends, and predictive insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Synergy Distribution Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">📈 Synergy Distribution Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">High Synergy (0.7-1.0)</h4>
                      <div className="text-2xl font-bold text-green-400">23</div>
                      <div className="text-xs text-gray-300">synergies</div>
                      <div className="text-xs text-gray-400 mt-1">Immediate collaboration potential</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Medium Synergy (0.4-0.7)</h4>
                      <div className="text-2xl font-bold text-yellow-400">45</div>
                      <div className="text-xs text-gray-300">synergies</div>
                      <div className="text-xs text-gray-400 mt-1">Strategic partnerships</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Low Synergy (0.2-0.4)</h4>
                      <div className="text-2xl font-bold text-orange-400">29</div>
                      <div className="text-xs text-gray-300">synergies</div>
                      <div className="text-xs text-gray-400 mt-1">Long-term opportunities</div>
                    </div>
                  </div>
                </div>

                {/* Domain Connectivity Matrix */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">🔗 Domain Connectivity Matrix</h3>
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left p-2 text-gray-300">Domain</th>
                            <th className="text-center p-2 text-gray-300">Space Biology</th>
                            <th className="text-center p-2 text-gray-300">Human Research</th>
                            <th className="text-center p-2 text-gray-300">Technology Dev</th>
                            <th className="text-center p-2 text-gray-300">Planetary Science</th>
                            <th className="text-center p-2 text-gray-300">Earth Science</th>
                            <th className="text-center p-2 text-gray-300">Physical Sciences</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-700">
                            <td className="p-2 text-gray-300 font-medium">Space Biology</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                            <td className="p-2 text-center text-green-400 font-bold">0.908</td>
                            <td className="p-2 text-center text-yellow-400 font-bold">0.792</td>
                            <td className="p-2 text-center text-orange-400 font-bold">0.743</td>
                            <td className="p-2 text-center text-blue-400 font-bold">0.681</td>
                            <td className="p-2 text-center text-gray-400">0.234</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="p-2 text-gray-300 font-medium">Human Research</td>
                            <td className="p-2 text-center text-green-400 font-bold">0.908</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                            <td className="p-2 text-center text-gray-400">0.156</td>
                            <td className="p-2 text-center text-gray-400">0.189</td>
                            <td className="p-2 text-center text-gray-400">0.123</td>
                            <td className="p-2 text-center text-gray-400">0.098</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="p-2 text-gray-300 font-medium">Technology Dev</td>
                            <td className="p-2 text-center text-yellow-400 font-bold">0.792</td>
                            <td className="p-2 text-center text-gray-400">0.156</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                            <td className="p-2 text-center text-gray-400">0.267</td>
                            <td className="p-2 text-center text-gray-400">0.145</td>
                            <td className="p-2 text-center text-gray-400">0.178</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="p-2 text-gray-300 font-medium">Planetary Science</td>
                            <td className="p-2 text-center text-orange-400 font-bold">0.743</td>
                            <td className="p-2 text-center text-gray-400">0.189</td>
                            <td className="p-2 text-center text-gray-400">0.267</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                            <td className="p-2 text-center text-gray-400">0.234</td>
                            <td className="p-2 text-center text-gray-400">0.156</td>
                          </tr>
                          <tr className="border-b border-gray-700">
                            <td className="p-2 text-gray-300 font-medium">Earth Science</td>
                            <td className="p-2 text-center text-blue-400 font-bold">0.681</td>
                            <td className="p-2 text-center text-gray-400">0.123</td>
                            <td className="p-2 text-center text-gray-400">0.145</td>
                            <td className="p-2 text-center text-gray-400">0.234</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                            <td className="p-2 text-center text-gray-400">0.189</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-gray-300 font-medium">Physical Sciences</td>
                            <td className="p-2 text-center text-gray-400">0.234</td>
                            <td className="p-2 text-center text-gray-400">0.098</td>
                            <td className="p-2 text-center text-gray-400">0.178</td>
                            <td className="p-2 text-center text-gray-400">0.156</td>
                            <td className="p-2 text-center text-gray-400">0.189</td>
                            <td className="p-2 text-center text-gray-400">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      <strong>Legend:</strong> 
                      <span className="text-green-400"> High (0.7+)</span> | 
                      <span className="text-yellow-400"> Medium (0.4-0.7)</span> | 
                      <span className="text-orange-400"> Low (0.2-0.4)</span> | 
                      <span className="text-gray-400"> Very Low (&lt;0.2)</span>
                    </div>
                  </div>
                </div>

                {/* Predictive Insights */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">🔮 Predictive Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-purple-400 mb-3">Emerging Synergy Trends</h4>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Space Biology ↔ Human Research</span>
                          <span className="text-green-400">↗ +15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Technology Dev ↔ Space Biology</span>
                          <span className="text-green-400">↗ +12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Planetary Science ↔ Space Biology</span>
                          <span className="text-yellow-400">↗ +8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Earth Science ↔ Space Biology</span>
                          <span className="text-yellow-400">↗ +6%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-purple-400 mb-3">Collaboration Potential Score</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Human Research + Space Biology</span>
                            <span className="text-green-400">95%</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Space Biology + Technology Dev</span>
                            <span className="text-yellow-400">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Planetary Science + Space Biology</span>
                            <span className="text-orange-400">78%</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Earth Science + Space Biology</span>
                            <span className="text-blue-400">72%</span>
                          </div>
                          <Progress value={72} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">⚠️ Risk Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">Low Risk</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <div>• Human Research + Space Biology</div>
                        <div>• Space Biology + Technology Dev</div>
                        <div>• Planetary Science + Space Biology</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        <strong>Risk Factors:</strong> High similarity scores, established research areas, clear collaboration pathways
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Medium Risk</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <div>• Earth Science + Space Biology</div>
                        <div>• Technology Dev + Planetary Science</div>
                        <div>• Human Research + Technology Dev</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        <strong>Risk Factors:</strong> Moderate similarity, some domain expertise gaps, coordination challenges
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-red-500 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-red-400 mb-2">High Risk</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        <div>• Physical Sciences + Space Biology</div>
                        <div>• Physical Sciences + Human Research</div>
                        <div>• Earth Science + Physical Sciences</div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        <strong>Risk Factors:</strong> Low similarity scores, limited overlap, significant domain differences
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI Projections */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">💰 ROI Projections</h3>
                  <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-3">Expected Returns (3-Year)</h4>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Human Research + Space Biology</span>
                            <span className="text-green-400 font-bold">340% ROI</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Space Biology + Technology Dev</span>
                            <span className="text-green-400 font-bold">280% ROI</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Planetary Science + Space Biology</span>
                            <span className="text-yellow-400 font-bold">220% ROI</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earth Science + Space Biology</span>
                            <span className="text-yellow-400 font-bold">180% ROI</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-3">Investment Timeline</h4>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Year 1: Foundation</span>
                            <span className="text-blue-400">$5M investment</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Year 2: Execution</span>
                            <span className="text-blue-400">$8M investment</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Year 3: Scale</span>
                            <span className="text-blue-400">$12M investment</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total Investment</span>
                            <span className="text-white">$25M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Domain Statistics</CardTitle>
              <CardDescription className="text-gray-300">
                Comprehensive statistics for each research domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left p-3 font-semibold text-white">Domain</th>
                      <th className="text-left p-3 font-semibold text-white">Projects</th>
                      <th className="text-left p-3 font-semibold text-white">Synergies</th>
                      <th className="text-left p-3 font-semibold text-white">Avg Similarity</th>
                      <th className="text-left p-3 font-semibold text-white">Max Similarity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainStats.map((stat, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-700 transition-colors">
                        <td className="p-3">
                          <Badge className={getDomainColor(stat.Domain)}>
                            {stat.Domain}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-300">{stat.Project_Count}</td>
                        <td className="p-3 text-gray-300">{stat.Synergy_Count}</td>
                        <td className="p-3">
                          <span className={getSimilarityColor(stat.Avg_Similarity)}>
                            {stat.Avg_Similarity.toFixed(3)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={getSimilarityColor(stat.Max_Similarity)}>
                            {stat.Max_Similarity.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Synergy Detail Modal */}
      {selectedSynergy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">Synergy Details</CardTitle>
                  <CardDescription className="text-gray-300">
                    Detailed analysis of cross-domain collaboration potential
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSynergy(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-4">
                <Badge className={getDomainColor(selectedSynergy.Domain_A)}>
                  {selectedSynergy.Domain_A}
                </Badge>
                <span className="text-2xl text-gray-400">↔</span>
                <Badge className={getDomainColor(selectedSynergy.Domain_B)}>
                  {selectedSynergy.Domain_B}
                </Badge>
              </div>
              
              <div className="text-center">
                <span className={`text-3xl font-bold ${getSimilarityColor(selectedSynergy.Similarity_Score)}`}>
                  {(selectedSynergy.Similarity_Score).toFixed(3)}
                </span>
                <p className="text-sm text-gray-400 mt-1">Similarity Score</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-300">Project A ({selectedSynergy.Domain_A}):</h4>
                  <p className="text-sm text-gray-200 bg-gray-900 p-3 rounded border border-gray-600">
                    {selectedSynergy.Project_A_Title}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-300">Project B ({selectedSynergy.Domain_B}):</h4>
                  <p className="text-sm text-gray-200 bg-gray-900 p-3 rounded border border-gray-600">
                    {selectedSynergy.Project_B_Title}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-cyan-400 mb-2">Collaboration Potential</h4>
                <p className="text-sm text-gray-200">
                  {getSynergyExplanation(selectedSynergy)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
