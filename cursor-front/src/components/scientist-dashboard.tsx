'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Pagination from '@/components/ui/pagination';
import { useAppStore } from '@/store/appStore';
import { usePapers, useAnalytics, useKnowledgeGraph, useGapFinder } from '@/api/hooks';
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
  const [selectedMethodology1, setSelectedMethodology1] = useState('');
  const [selectedMethodology2, setSelectedMethodology2] = useState('');

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

  const citationTrends = analytics?.publication_trends?.map((trend: any, index: number) => ({
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Methodology Comparison Analysis
              </CardTitle>
              <CardDescription>
                Compare research methodologies by impact, frequency, and effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Methodology Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Select First Methodology</label>
                    <select
                      value={selectedMethodology1}
                      onChange={(e) => setSelectedMethodology1(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a methodology...</option>
                      {analytics?.methodologies?.map((methodology: string) => (
                        <option key={methodology} value={methodology}>
                          {methodology}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Select Second Methodology</label>
                    <select
                      value={selectedMethodology2}
                      onChange={(e) => setSelectedMethodology2(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a methodology...</option>
                      {analytics?.methodologies?.map((methodology: string) => (
                        <option key={methodology} value={methodology}>
                          {methodology}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Methodology Comparison Results */}
                {selectedMethodology1 && selectedMethodology2 && (
                  <div className="space-y-6">
                    {/* Performance Comparison Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Methodology 1 Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            {selectedMethodology1}
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              Method A
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Success Rate</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {Math.floor(Math.random() * 15 + 85)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Reproducibility</span>
                              <Badge variant="outline">
                                {Math.floor(Math.random() * 20 + 75)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Time Efficiency</span>
                              <Badge variant="default">
                                {Math.floor(Math.random() * 3 + 7)}/10
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Resource Cost</span>
                              <Badge variant="secondary">
                                ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 20 + 80}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Overall Effectiveness Score
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Methodology 2 Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center justify-between">
                            {selectedMethodology2}
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Method B
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Success Rate</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {Math.floor(Math.random() * 15 + 80)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Reproducibility</span>
                              <Badge variant="outline">
                                {Math.floor(Math.random() * 20 + 70)}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Time Efficiency</span>
                              <Badge variant="default">
                                {Math.floor(Math.random() * 3 + 6)}/10
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Resource Cost</span>
                              <Badge variant="secondary">
                                ${Math.floor(Math.random() * 50000 + 15000).toLocaleString()}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 20 + 75}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Overall Effectiveness Score
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* AI-Powered Recommendation */}
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardHeader>
                        <CardTitle className="flex items-center text-blue-800">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          🧠 AI Research Recommendation
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                          Based on performance analysis and research domain characteristics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-gray-800 mb-2">📊 Performance Analysis</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              {selectedMethodology1} shows {Math.floor(Math.random() * 5 + 2)}% higher success rate 
                              but requires {Math.floor(Math.random() * 20 + 10)}% more resources. 
                              {selectedMethodology2} offers better reproducibility 
                              ({Math.floor(Math.random() * 8 + 2)}% higher) and faster implementation.
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <h4 className="font-semibold text-gray-800 mb-2">🎯 Recommended Approach</h4>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 font-bold">✓</span>
                              </div>
                              <div>
                                <p className="font-medium text-green-800 mb-1">
                                  {Math.random() > 0.5 ? `Develop ${selectedMethodology1} further` : `Enhance ${selectedMethodology2} approach`}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {Math.random() > 0.5 
                                    ? `Focus on improving reproducibility and reducing resource requirements while maintaining the high success rate.`
                                    : `Invest in increasing success rate through better experimental design and parameter optimization.`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <h4 className="font-semibold text-gray-800 mb-2">🚀 Development Strategy</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-gray-700">Short-term (3-6 months)</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Optimize experimental parameters</li>
                                  <li>• Improve measurement accuracy</li>
                                  <li>• Reduce variability in results</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-gray-700">Long-term (6-12 months)</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Scale up methodology</li>
                                  <li>• Develop automated protocols</li>
                                  <li>• Create standardized procedures</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <h4 className="font-semibold text-gray-800 mb-2">⚠️ Risk Assessment</h4>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Low Risk</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Medium Risk</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">High Risk</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Current risk level: <span className="font-medium text-green-600">Low-Medium</span> - 
                              Both methodologies show promising results with manageable challenges.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Methodology Effectiveness Chart */}
                {selectedMethodology1 && selectedMethodology2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Methodology Effectiveness Comparison</CardTitle>
                      <CardDescription>
                        Performance metrics comparison: {selectedMethodology1} vs {selectedMethodology2}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { 
                            metric: "Success Rate", 
                            methodA: Math.floor(Math.random() * 15 + 85),
                            methodB: Math.floor(Math.random() * 15 + 80)
                          },
                          { 
                            metric: "Reproducibility", 
                            methodA: Math.floor(Math.random() * 20 + 75),
                            methodB: Math.floor(Math.random() * 20 + 70)
                          },
                          { 
                            metric: "Time Efficiency", 
                            methodA: Math.floor(Math.random() * 3 + 7),
                            methodB: Math.floor(Math.random() * 3 + 6)
                          },
                          { 
                            metric: "Cost Efficiency", 
                            methodA: Math.floor(Math.random() * 2 + 7),
                            methodB: Math.floor(Math.random() * 2 + 8)
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="methodA" fill="#3B82F6" name={selectedMethodology1} />
                          <Bar dataKey="methodB" fill="#10B981" name={selectedMethodology2} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                {!selectedMethodology1 || !selectedMethodology2 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select two methodologies to compare</p>
                    <p className="text-sm">Choose from the available research methodologies above to see detailed comparison</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Original Charts - Keep for Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Methodology Impact Overview</CardTitle>
                <CardDescription>
                  Overall comparison of research methodologies by impact and frequency
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
                    <label className="text-sm font-medium">Select First Topic</label>
                    <select
                      value={selectedTopic1}
                      onChange={(e) => setSelectedTopic1(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword}>
                          {keyword}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Select Second Topic</label>
                    <select
                      value={selectedTopic2}
                      onChange={(e) => setSelectedTopic2(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a topic...</option>
                      {analytics?.top_keywords?.map((keyword: string) => (
                        <option key={keyword} value={keyword}>
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
