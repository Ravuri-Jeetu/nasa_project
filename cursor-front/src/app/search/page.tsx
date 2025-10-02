'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { usePapers } from '@/api/hooks';
import { 
  Search, 
  Calendar, 
  Users, 
  BookOpen,
  TrendingUp,
  Eye,
  Download,
  Brain,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const { role, selectedPaperIds, addSelectedPaperId, removeSelectedPaperId } = useAppStore();
  const { data: papersData, isLoading } = usePapers(role);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const papers = papersData?.papers || [];
  const filteredPapers = papers?.filter(paper => {
    const matchesSearch = !searchTerm || 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      paper.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      paper.journal.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
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
  }) || [];

  const handlePaperSelect = (paperId: string) => {
    if (selectedPaperIds.includes(paperId)) {
      removeSelectedPaperId(paperId);
    } else {
      addSelectedPaperId(paperId);
    }
  };

  const getSummaryByRole = (paper: { id: string; title: string; abstract?: string; methodology?: string; citations?: number; funding?: number; return?: number }) => {
    if (role === 'Scientist') {
      return {
        title: 'Technical Summary',
        content: `This research employs ${paper.methodology || 'advanced analytical methods'} to address critical challenges in the field. The methodology demonstrates ${(paper.citations || 0) > 50 ? 'high impact' : 'promising potential'} with ${paper.citations || 0} citations, indicating strong academic recognition. Key technical contributions include novel approaches to data analysis and innovative experimental design.`,
        metrics: [
          { label: 'Methodology Impact', value: (paper.citations || 0) > 50 ? 'High' : 'Medium' },
          { label: 'Technical Innovation', value: 'Significant' },
          { label: 'Research Quality', value: (paper.citations || 0) > 30 ? 'Excellent' : 'Good' }
        ]
      };
    } else {
      return {
        title: 'Business Summary',
        content: `This project represents a ${paper.funding && paper.return ? ((paper.return - paper.funding) / paper.funding * 100).toFixed(0) : 'promising'}% ROI opportunity with ${paper.citations || 0} industry citations. The research aligns with market trends and shows strong commercial potential. Investment of $${paper.funding?.toLocaleString() || 'TBD'} could yield returns of $${paper.return?.toLocaleString() || 'TBD'} based on current market analysis.`,
        metrics: [
          { label: 'ROI Potential', value: paper.funding && paper.return ? `${((paper.return - paper.funding) / paper.funding * 100).toFixed(0)}%` : 'TBD' },
          { label: 'Market Impact', value: (paper.citations || 0) > 30 ? 'High' : 'Medium' },
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
            <h1 className="text-3xl font-bold text-white">Search Research Papers</h1>
            <p className="text-gray-600 mt-1">
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

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Papers
            </CardTitle>
            <CardDescription>
              Search across all research papers by title, abstract, authors, keywords, or journal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search papers by title, abstract, authors, keywords, or journal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-lg py-3"
                />
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                  >
                    Publication Date
                  </Button>
                  <Button
                    variant={sortBy === 'citations' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('citations')}
                  >
                    Citations
                  </Button>
                  <Button
                    variant={sortBy === 'title' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('title')}
                  >
                    Title
                  </Button>
                </div>
              </div>

              {/* Search Results Count */}
              {searchTerm && (
                <div className="text-sm text-gray-600">
                  Found {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Papers List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading papers...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'No papers found' : 'No papers available'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No papers match your search for "${searchTerm}". Try different keywords.`
                    : 'There are no papers available at the moment.'
                  }
                </p>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{paper.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 text-sm">
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
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {paper.citations} citations
                        </Badge>
                        {paper.methodology && (
                          <Badge variant="outline">{paper.methodology}</Badge>
                        )}
                        {paper.funding && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            ${paper.funding.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">{paper.abstract}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {paper.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      {/* Role-specific Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {role === 'Scientist' ? (
                            <Brain className="h-4 w-4 mr-2 text-blue-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          )}
                          <h4 className="font-semibold text-gray-900">{summary.title}</h4>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{summary.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.metrics.map((metric, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {metric.label}: {metric.value}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>DOI: {paper.doi}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/papers/${paper.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
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
        {filteredPapers.length > 0 && (
          <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Showing {filteredPapers.length} of {papers?.length || 0} papers
            </span>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
