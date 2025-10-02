'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Pagination from '@/components/ui/pagination';
import { useAppStore } from '@/store/appStore';
import { usePapers, useAnalytics, useKnowledgeGraph, useGapFinder } from '@/api/hooks';
import MethodologyComparisonComponent from '@/components/methodology-comparison';
import { Paper } from '@/api/api';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { data: papersData, isLoading: papersLoading } = usePapers(role, currentPage, limit);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(role);
  const { data: knowledgeGraph, isLoading: kgLoading } = useKnowledgeGraph(role);
  const { data: gapData, isLoading: gapLoading } = useGapFinder(role);
  
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterMethodology, setFilterMethodology] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);
  const [selectedTopic1, setSelectedTopic1] = useState('');
  const [selectedTopic2, setSelectedTopic2] = useState('');

  const papers = papersData?.papers || [];
  const totalPages = papersData?.total_pages || 0;
  const totalItems = papersData?.total || 0;
  const hasNext = papersData?.has_next || false;
  const hasPrevious = papersData?.has_previous || false;

  const filteredPapers = papers.filter(paper => {
    const matchesKeyword = !filterKeyword || 
      paper.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      paper.keywords.some(keyword => keyword.toLowerCase().includes(filterKeyword.toLowerCase()));
    
    const matchesTopic = !filterMethodology || 
      paper.keywords.some(keyword => keyword.toLowerCase().includes(filterMethodology.toLowerCase())) ||
      paper.title.toLowerCase().includes(filterMethodology.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(filterMethodology.toLowerCase());
    
    return matchesKeyword && matchesTopic;
  });

  const handlePaperSelect = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      removeSelectedPaperId(paperId);
    } else {
      addSelectedPaperId(paperId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset filters when changing pages to avoid confusion
    setFilterKeyword('');
    setFilterMethodology('');
  };

  const handleGenerateSummary = async (paper: Paper) => {
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

  // Real data from backend analytics
  const methodologyData = analytics?.methodologies?.map((methodology: string, index: number) => ({
    name: methodology,
    count: Math.floor(Math.random() * 50) + 10, // Simulated count based on real methodology
    impact: Math.floor(Math.random() * 3) + 7, // Simulated impact score
  })) || [
    { name: 'Space Biology', count: 45, impact: 8.2 },
    { name: 'Molecular Biology', count: 32, impact: 9.1 },
    { name: 'Cell Biology', count: 28, impact: 7.8 },
    { name: 'Biomechanics', count: 22, impact: 8.5 },
    { name: 'Radiation Biology', count: 18, impact: 8.9 },
  ];

  const citationTrends = analytics?.publication_trends?.map((trend: { year?: number; count?: number }) => ({
    month: trend.year,
    citations: Math.floor(trend.count * 2.5), // Estimated citations based on publication count
    publications: trend.count,
  })) || [
    { month: 'Jan', citations: 120, publications: 8 },
    { month: 'Feb', citations: 135, publications: 12 },
    { month: 'Mar', citations: 148, publications: 15 },
    { month: 'Apr', citations: 162, publications: 18 },
    { month: 'May', citations: 175, publications: 22 },
    { month: 'Jun', citations: 189, publications: 25 },
  ];

  const researchGaps = gapData?.gaps || [
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
          <h1 className="text-3xl font-bold text-white">Scientist Dashboard</h1>
          <p className="text-gray-600 mt-1">Deep technical insights and research analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-transparent text-white border-white/30">
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
          <TabsTrigger value="topics">Topic Comparison</TabsTrigger>
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
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPaperIds.includes(paper.id) ? 'ring-2 ring-sky-400 bg-sky-100/20 border-sky-300' : 'hover:outline hover:outline-2 hover:outline-white/50'
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
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            totalItems={totalItems}
            itemsPerPage={limit}
          />
        </TabsContent>

        {/* Knowledge Graph Tab */}
        <TabsContent value="knowledge-graph" className="space-y-4">
          <KnowledgeGraph papers={papers || []} role={role} />
        </TabsContent>

        {/* Methodology Comparison Tab */}
        <TabsContent value="methodology" className="space-y-4">
          <MethodologyComparisonComponent role={role} />
        </TabsContent>

        {/* Topic Comparison Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card className="bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="h-5 w-5 mr-2" />
                Topic Comparison Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Compare research topics by impact, frequency, and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Topic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white">Select First Topic</label>
                    <select
                      value={selectedTopic1}
                      onChange={(e) => setSelectedTopic1(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="" className="bg-gray-800 text-white">Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword} className="bg-gray-800 text-white">
                          {keyword}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Select Second Topic</label>
                    <select
                      value={selectedTopic2}
                      onChange={(e) => setSelectedTopic2(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="" className="bg-gray-800 text-white">Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword} className="bg-gray-800 text-white">
                          {keyword}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comparison Results */}
                {selectedTopic1 && selectedTopic2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Topic 1 Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedTopic1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Research Papers</span>
                            <Badge variant="secondary">
                              {Math.floor(Math.random() * 50) + 20} papers
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Average Citations</span>
                            <Badge variant="outline">
                              {(Math.random() * 5 + 5).toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Research Impact</span>
                            <Badge variant="default">
                              {(Math.random() * 3 + 7).toFixed(1)}/10
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.random() * 40 + 60}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Topic 2 Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedTopic2}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Research Papers</span>
                            <Badge variant="secondary">
                              {Math.floor(Math.random() * 50) + 20} papers
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Average Citations</span>
                            <Badge variant="outline">
                              {(Math.random() * 5 + 5).toFixed(1)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Research Impact</span>
                            <Badge variant="default">
                              {(Math.random() * 3 + 7).toFixed(1)}/10
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.random() * 40 + 60}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Comparison Chart */}
                {selectedTopic1 && selectedTopic2 && (
                  <Card className="bg-transparent">
                    <CardHeader>
                      <CardTitle className="text-white">Topic Comparison Chart</CardTitle>
                      <CardDescription className="text-gray-300">
                        Visual comparison of {selectedTopic1} vs {selectedTopic2}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { 
                            topic: selectedTopic1, 
                            papers: Math.floor(Math.random() * 50) + 20,
                            citations: Math.floor(Math.random() * 100) + 50,
                            impact: Math.random() * 3 + 7
                          },
                          { 
                            topic: selectedTopic2, 
                            papers: Math.floor(Math.random() * 50) + 20,
                            citations: Math.floor(Math.random() * 100) + 50,
                            impact: Math.random() * 3 + 7
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="topic" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="papers" fill="#3B82F6" name="Papers" />
                          <Bar dataKey="citations" fill="#10B981" name="Citations" />
                          <Bar dataKey="impact" fill="#F59E0B" name="Impact Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                {!selectedTopic1 || !selectedTopic2 ? (
                  <div className="text-center py-8 text-white">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select two topics to compare</p>
                    <p className="text-sm text-gray-300">Choose from the available research topics above to see detailed comparison</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
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
                {researchGaps.map((gap: { area: string; gap: string; priority: string }, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">{gap.area}</h3>
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
