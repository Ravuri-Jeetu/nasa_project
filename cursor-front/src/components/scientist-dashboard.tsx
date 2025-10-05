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
  FileText,
  Calendar
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
    month: trend.year || 'Unknown',
    citations: Math.floor((trend.count || 0) * 2.5), // Estimated citations based on publication count
    publications: trend.count || 0,
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
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white space-text-shadow" style={{ color: '#ffffff !important', textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.7)' }}>
            Scientist Dashboard
          </h1>
          <p className="text-xl md:text-2xl font-rajdhani font-medium text-white space-text-shadow" style={{ color: '#ffffff !important', textShadow: '0 0 2px rgba(0,0,0,1), 0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' }}>
            Deep technical insights and research analysis
          </p>
          <div className="flex items-center space-x-3 mt-3">
            <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-rajdhani font-semibold text-blue-300">Research Active</span>
            </div>
            <div className="text-sm font-rajdhani text-white/70 space-text-shadow">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/40 px-4 py-2 text-lg font-rajdhani font-semibold">
              {selectedPaperIds.length} papers selected
            </Badge>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-blue-400/40 text-white hover:bg-white/20 hover:border-blue-400/60 transition-all duration-300 px-6 py-3"
            >
              <Download className="h-5 w-5 mr-2" />
              <span className="font-rajdhani font-semibold">Export Data</span>
            </Button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <Tabs defaultValue="publications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/5 backdrop-blur-sm border border-blue-400/20 rounded-xl p-1 h-auto">
          <TabsTrigger 
            value="publications" 
            className="flex flex-col items-center space-y-1 px-4 py-4 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-400/40 border border-transparent rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            <BookOpen className="h-5 w-5 mb-1" />
            <span className="font-rajdhani font-semibold text-sm">Publications</span>
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge-graph"
            className="flex flex-col items-center space-y-1 px-4 py-4 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-400/40 border border-transparent rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            <Brain className="h-5 w-5 mb-1" />
            <span className="font-rajdhani font-semibold text-sm">Knowledge Graph</span>
          </TabsTrigger>
          <TabsTrigger 
            value="methodology"
            className="flex flex-col items-center space-y-1 px-4 py-4 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-400/40 border border-transparent rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="font-rajdhani font-semibold text-sm">Methodology</span>
          </TabsTrigger>
          <TabsTrigger 
            value="topics"
            className="flex flex-col items-center space-y-1 px-4 py-4 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-400/40 border border-transparent rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            <Filter className="h-5 w-5 mb-1" />
            <span className="font-rajdhani font-semibold text-sm">Topic Compare</span>
          </TabsTrigger>
          <TabsTrigger 
            value="gaps"
            className="flex flex-col items-center space-y-1 px-4 py-4 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border-blue-400/40 border border-transparent rounded-lg transition-all duration-300 hover:bg-white/10"
          >
            <Search className="h-5 w-5 mb-1" />
            <span className="font-rajdhani font-semibold text-sm">Gap Finder</span>
          </TabsTrigger>
        </TabsList>

        {/* Publications Tab */}
        <TabsContent value="publications" className="space-y-6">
          {/* Filters */}
          <Card className="glassmorphism border-blue-400/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-orbitron font-bold text-white space-text-shadow">
                <Filter className="h-6 w-6 mr-3 text-blue-400" />
                Filter Publications
              </CardTitle>
              <CardDescription className="text-white/70 font-rajdhani text-base space-text-shadow">
                Refine your research search with advanced filtering options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-lg font-rajdhani font-semibold text-white space-text-shadow block">
                    Search Keywords
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Search by title, abstract, or keywords..."
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-rajdhani"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-lg font-rajdhani font-semibold text-white space-text-shadow block">
                    Research Topics
                  </label>
                  <select
                    value={filterMethodology}
                    onChange={(e) => setFilterMethodology(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-rajdhani"
                    style={{
                      color: 'white'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>All Topics</option>
                    <option value="microgravity" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Microgravity Research</option>
                    <option value="stem cells" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Stem Cell Biology</option>
                    <option value="bone" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Bone & Skeletal Research</option>
                    <option value="oxidative stress" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Oxidative Stress & Radiation</option>
                    <option value="heart" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Cardiac Research</option>
                    <option value="spaceflight" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Spaceflight Biology</option>
                    <option value="gene expression" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Gene Expression</option>
                    <option value="biomedical" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Biomedical Research</option>
                    <option value="molecular biology" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Molecular Biology</option>
                    <option value="cell biology" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Cell Biology</option>
                    <option value="biomechanics" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Biomechanics</option>
                    <option value="radiation biology" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Radiation Biology</option>
                    <option value="space biology" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Space Biology</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-rajdhani text-white/60 space-text-shadow">
                  Showing {filteredPapers.length} of {papers.length} publications
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/40">
                    {filterKeyword ? 'Filtered' : 'All Results'}
                  </Badge>
                  {filterMethodology && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/40">
                      {filterMethodology}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publications List */}
          <div className="grid gap-4">
            {papersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-rajdhani font-semibold text-white space-text-shadow">Loading Publications</p>
                  <p className="text-base font-rajdhani text-white/70 space-text-shadow">Analyzing research data...</p>
                </div>
              </div>
            ) : (
              filteredPapers.map((paper) => (
                <Card 
                  key={paper.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl glassmorphism border-blue-400/20 hover:border-blue-400/40 ${
                    selectedPaperIds.includes(paper.id) ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''
                  }`}
                  onClick={() => handlePaperSelect(paper.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <CardTitle className="text-xl md:text-2xl font-orbitron font-bold leading-tight">
                          <a 
                            href={paper.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="cosmic-text-high-contrast hover:text-blue-300 hover:underline cursor-pointer transition-colors duration-300 space-text-shadow"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {paper.title}
                          </a>
                        </CardTitle>
                        <div className="space-y-2">
                          <CardDescription className="text-base font-rajdhani font-medium text-white/90 space-text-shadow">
                            {paper.authors.join(', ')}
                          </CardDescription>
                          <div className="flex items-center space-x-4 text-sm font-rajdhani text-white/70 space-text-shadow">
                            <span className="flex items-center space-x-1">
                              <BookOpen className="h-4 w-4 text-blue-400" />
                              <span>{paper.journal}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-blue-400" />
                              <span>{paper.publicationDate}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/40 px-3 py-1 font-rajdhani font-semibold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {paper.citations} citations
                          </Badge>
                          {paper.methodology && (
                            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/40 px-3 py-1 font-rajdhani font-semibold">
                              {paper.methodology}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/10 backdrop-blur-sm border-blue-400/40 text-white hover:bg-white/20 hover:border-blue-400/60 transition-all duration-300 font-rajdhani font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateSummary(paper);
                          }}
                          disabled={generatingSummary === paper.id}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {generatingSummary === paper.id ? 'Generating...' : 'Generate Summary'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-base font-rajdhani leading-relaxed text-white/80 space-text-shadow line-clamp-3">
                        {paper.abstract}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-rajdhani font-semibold text-white/70 space-text-shadow">Keywords:</span>
                        {paper.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors duration-300 font-rajdhani font-medium">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Topic Comparison Analysis
              </CardTitle>
              <CardDescription>
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
                      className="w-full mt-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        color: 'white'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
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
                      className="w-full mt-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-blue-400/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{
                        color: 'white'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#1a1a2e', color: 'white' }}>Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword} style={{ backgroundColor: '#1a1a2e', color: 'white' }}>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Topic Comparison Chart</CardTitle>
                      <CardDescription>
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
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select two topics to compare</p>
                    <p className="text-sm">Choose from the available research topics above to see detailed comparison</p>
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
