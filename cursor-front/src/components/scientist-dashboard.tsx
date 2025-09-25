'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { usePapers, useAnalytics, useKnowledgeGraph } from '@/api/hooks';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  Brain, 
  Search, 
  Filter,
  Download,
  Eye,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import KnowledgeGraph from './knowledge-graph';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ScientistDashboard() {
  const { role, selectedPaperIds, addSelectedPaperId, removeSelectedPaperId } = useAppStore();
  const { data: papers, isLoading: papersLoading } = usePapers(role);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(role);
  const { data: knowledgeGraph, isLoading: kgLoading } = useKnowledgeGraph(role);
  
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterMethodology, setFilterMethodology] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const filteredPapers = papers?.filter(paper => {
    const matchesKeyword = !filterKeyword || 
      paper.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      paper.keywords.some(keyword => keyword.toLowerCase().includes(filterKeyword.toLowerCase()));
    
    const matchesTopic = !filterMethodology || 
      paper.keywords.some(keyword => keyword.toLowerCase().includes(filterMethodology.toLowerCase())) ||
      paper.title.toLowerCase().includes(filterMethodology.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(filterMethodology.toLowerCase());
    
    return matchesKeyword && matchesTopic;
  }) || [];

  const handlePaperSelect = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      removeSelectedPaperId(paperId);
    } else {
      addSelectedPaperId(paperId);
    }
  };

  const handleGenerateSummary = async (paper: any) => {
    setGeneratingSummary(paper.id);
    try {
      // Call the backend API to generate summary
      const response = await fetch(`http://localhost:8000/api/paper-summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_title: paper.title,
          role: role
        })
      });
      
      const data = await response.json();
      
      if (data.summary) {
        // Open the AI chat panel and show the summary
        const event = new CustomEvent('showSummary', {
          detail: {
            title: paper.title,
            summary: data.summary,
            role: role
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to a simple summary
      const event = new CustomEvent('showSummary', {
        detail: {
          title: paper.title,
          summary: `This research paper "${paper.title}" focuses on ${paper.methodology || 'space biology research'}. The study contributes to our understanding of biological responses to space environment conditions and provides valuable insights for future space missions.`,
          role: role
        }
      });
      window.dispatchEvent(event);
    } finally {
      setGeneratingSummary(null);
    }
  };

  // Mock data for charts - will be replaced with real data from backend
  const methodologyData = [
    { name: 'Space Biology', count: 45, impact: 8.2 },
    { name: 'Molecular Biology', count: 32, impact: 9.1 },
    { name: 'Cell Biology', count: 28, impact: 7.8 },
    { name: 'Biomechanics', count: 22, impact: 8.5 },
    { name: 'Radiation Biology', count: 18, impact: 8.9 },
  ];

  const citationTrends = [
    { month: 'Jan', citations: 120, publications: 8 },
    { month: 'Feb', citations: 135, publications: 12 },
    { month: 'Mar', citations: 148, publications: 15 },
    { month: 'Apr', citations: 162, publications: 18 },
    { month: 'May', citations: 175, publications: 22 },
    { month: 'Jun', citations: 189, publications: 25 },
  ];

  const researchGaps = [
    { area: 'Long-term Microgravity Effects', gap: 'Limited data on multi-year space mission impacts', priority: 'High' },
    { area: 'Space Radiation Protection', gap: 'Need for advanced shielding materials', priority: 'High' },
    { area: 'Regenerative Medicine', gap: 'Stem cell therapy protocols for space', priority: 'Medium' },
    { area: 'Bone Loss Prevention', gap: 'More effective exercise interventions', priority: 'High' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scientist Dashboard</h1>
          <p className="text-gray-600 mt-1">Deep technical insights and research analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {selectedPaperIds.length} papers selected
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <Tabs defaultValue="publications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="knowledge-graph">Knowledge Graph</TabsTrigger>
          <TabsTrigger value="methodology">Methodology Comparison</TabsTrigger>
          <TabsTrigger value="gaps">Gap Finder</TabsTrigger>
        </TabsList>

        {/* Publications Tab */}
        <TabsContent value="publications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <input
                    type="text"
                    placeholder="Search by title, abstract, or keywords..."
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Topics</label>
                  <select
                    value={filterMethodology}
                    onChange={(e) => setFilterMethodology(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Topics</option>
                    <option value="microgravity">Microgravity Research</option>
                    <option value="stem cells">Stem Cell Biology</option>
                    <option value="bone">Bone & Skeletal Research</option>
                    <option value="oxidative stress">Oxidative Stress & Radiation</option>
                    <option value="heart">Cardiac Research</option>
                    <option value="spaceflight">Spaceflight Biology</option>
                    <option value="gene expression">Gene Expression</option>
                    <option value="biomedical">Biomedical Research</option>
                    <option value="molecular biology">Molecular Biology</option>
                    <option value="cell biology">Cell Biology</option>
                    <option value="biomechanics">Biomechanics</option>
                    <option value="radiation biology">Radiation Biology</option>
                    <option value="space biology">Space Biology</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publications List */}
          <div className="grid gap-4">
            {papersLoading ? (
              <div className="text-center py-8">Loading publications...</div>
            ) : (
              filteredPapers.map((paper) => (
                <Card 
                  key={paper.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPaperIds.includes(paper.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handlePaperSelect(paper.id)}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                          <a 
                            href={paper.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {paper.title}
                          </a>
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm">
                          {paper.authors.join(', ')} • {paper.journal} • {paper.publicationDate}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {paper.citations} citations
                        </Badge>
                        {paper.methodology && (
                          <Badge variant="outline" className="text-xs">
                            {paper.methodology}
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateSummary(paper);
                          }}
                          disabled={generatingSummary === paper.id}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {generatingSummary === paper.id ? 'Generating...' : 'Summary'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{paper.abstract}</p>
                    <div className="flex flex-wrap gap-1">
                      {paper.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Knowledge Graph Tab */}
        <TabsContent value="knowledge-graph" className="space-y-4">
          <KnowledgeGraph papers={papers || []} role={role} />
        </TabsContent>

        {/* Methodology Comparison Tab */}
        <TabsContent value="methodology" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Methodology Impact Analysis</CardTitle>
                <CardDescription>
                  Comparison of research methodologies by impact and frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={methodologyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impact" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citation Trends</CardTitle>
                <CardDescription>
                  Monthly citation and publication trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={citationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="citations" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="publications" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gap Finder Tab */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Research Gap Analysis
              </CardTitle>
              <CardDescription>
                Identified gaps in current research and opportunities for innovation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {researchGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{gap.area}</h3>
                        <p className="text-gray-600 mt-1">{gap.gap}</p>
                      </div>
                      <Badge 
                        variant={gap.priority === 'High' ? 'destructive' : 'secondary'}
                        className="ml-4"
                      >
                        {gap.priority} Priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
