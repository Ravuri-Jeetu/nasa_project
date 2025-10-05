'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';
import { useAppStore } from '@/store/appStore';
import { usePapers } from '@/api/hooks';
import { Paper } from '@/api/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  BookOpen,
  TrendingUp,
  Eye,
  Download,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function PapersPage() {
  const { role, selectedPaperIds, addSelectedPaperId, removeSelectedPaperId } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { data: papersData, isLoading } = usePapers(role, currentPage, limit);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterMethodology, setFilterMethodology] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const papers = papersData?.papers || [];
  const totalPages = papersData?.total_pages || 0;
  const totalItems = papersData?.total || 0;
  const hasNext = papersData?.has_next || false;
  const hasPrevious = papersData?.has_previous || false;

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = !searchTerm || 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      paper.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMethodology = filterMethodology === 'all' || 
      paper.methodology?.toLowerCase().includes(filterMethodology.toLowerCase());
    
    const matchesYear = filterYear === 'all' || 
      paper.publicationDate.includes(filterYear);
    
    return matchesSearch && matchesMethodology && matchesYear;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'citations':
        return b.citations - a.citations;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
      default:
        return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset search and filters when changing pages
    setSearchTerm('');
    setFilterMethodology('all');
    setFilterYear('all');
  };

  const handlePaperSelect = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      removeSelectedPaperId(paperId);
    } else {
      addSelectedPaperId(paperId);
    }
  };

  const handleGenerateSummary = async (paper: Paper) => {
    setGeneratingSummary(paper.id);
    try {
      // Extract PMC ID from paper link if available
      let paperIdentifier = paper.title;
      if (paper.link && paper.link.includes('pmc/articles/PMC')) {
        const pmcMatch = paper.link.match(/PMC(\d+)/);
        if (pmcMatch) {
          paperIdentifier = `PMC${pmcMatch[1]}`;
        }
      }
      
      // Call the backend API to generate summary
      const response = await fetch(`http://localhost:8000/api/paper-summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_title: paperIdentifier,
          role: role
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        // Handle backend errors
        console.error('Backend error:', data.error);
        throw new Error(data.error);
      }
      
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
      } else {
        throw new Error('No summary generated');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Show error message to user
      alert(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
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

  const getUniqueMethodologies = () => {
    const methodologies = papers?.map(p => p.methodology).filter(Boolean) || [];
    return [...new Set(methodologies)];
  };

  const getUniqueYears = () => {
    const years = papers?.map(p => p.publicationDate.split('-')[0]).filter(Boolean) || [];
    return [...new Set(years)].sort((a, b) => b.localeCompare(a));
  };

  const getSummaryByRole = (paper: Paper) => {
    if (role === 'Scientist') {
      return {
        title: 'Technical Summary',
        content: `This research employs ${paper.methodology || 'advanced analytical methods'} to address critical challenges in the field. The methodology demonstrates ${paper.citations > 50 ? 'high impact' : 'promising potential'} with ${paper.citations} citations, indicating strong academic recognition. Key technical contributions include novel approaches to data analysis and innovative experimental design.`,
        metrics: [
          { label: 'Methodology Impact', value: paper.citations > 50 ? 'High' : 'Medium' },
          { label: 'Technical Innovation', value: 'Significant' },
          { label: 'Research Quality', value: paper.citations > 30 ? 'Excellent' : 'Good' }
        ]
      };
    } else {
      return {
        title: 'Business Summary',
        content: `This project represents a ${paper.funding && paper.return ? ((paper.return - paper.funding) / paper.funding * 100).toFixed(0) : 'promising'}% ROI opportunity with ${paper.citations} industry citations. The research aligns with market trends and shows strong commercial potential. Investment of $${paper.funding?.toLocaleString() || 'TBD'} could yield returns of $${paper.return?.toLocaleString() || 'TBD'} based on current market analysis.`,
        metrics: [
          { label: 'ROI Potential', value: paper.funding && paper.return ? `${((paper.return - paper.funding) / paper.funding * 100).toFixed(0)}%` : 'TBD' },
          { label: 'Market Impact', value: paper.citations > 30 ? 'High' : 'Medium' },
          { label: 'Investment Risk', value: 'Low-Medium' }
        ]
      };
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Research Papers</h1>
            <p className="text-cyan-300 mt-1">
              {role === 'Scientist' ? 'Technical analysis and research insights' : 'Business intelligence and investment opportunities'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {selectedPaperIds.length} selected
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search papers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Publication Date</SelectItem>
                    <SelectItem value="citations">Citations</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Methodology</label>
                <Select value={filterMethodology} onValueChange={setFilterMethodology}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methodologies</SelectItem>
                    {getUniqueMethodologies().map(methodology => (
                      <SelectItem key={methodology} value={methodology?.toLowerCase() || ''}>
                        {methodology}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {getUniqueYears().map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Papers List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-cyan-300">Loading papers...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No papers found</h3>
                <p className="text-cyan-300">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPapers.map((paper) => {
              const summary = getSummaryByRole(paper);
              return (
                <Card 
                  key={paper.id} 
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedPaperIds.includes(paper.id) ? 'ring-2 ring-sky-400 bg-sky-100/20 border-sky-300' : 'hover:outline hover:outline-2 hover:outline-white/50'
                  }`}
                  onClick={() => handlePaperSelect(paper.id)}
                >
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 leading-tight">
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
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {paper.authors.join(', ')}
                          </span>
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {paper.journal}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {paper.publicationDate}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {paper.citations} citations
                        </Badge>
                        {paper.methodology && (
                          <Badge variant="outline" className="text-xs">{paper.methodology}</Badge>
                        )}
                        {paper.funding && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            ${paper.funding.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-white/80">{paper.abstract}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {paper.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      {/* Role-specific Summary */}
                      <div className="bg-transparent rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-white mb-2">{summary.title}</h4>
                        <p className="text-sm text-white/70 mb-3">{summary.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.metrics.map((metric, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {metric.label}: {metric.value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4 text-sm text-cyan-400">
                          {paper.doi && <span>DOI: {paper.doi}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/papers/${paper.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSummary(paper);
                            }}
                            disabled={generatingSummary === paper.id}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {generatingSummary === paper.id ? 'Generating...' : 'Summary'}
                          </Button>
                          <Button 
                            variant={selectedPaperIds.includes(paper.id) ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePaperSelect(paper.id);
                            }}
                          >
                            {selectedPaperIds.includes(paper.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
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
      </div>
    </MainLayout>
  );
}
