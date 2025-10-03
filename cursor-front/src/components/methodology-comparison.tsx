'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileText, Users, Clock, FlaskConical, Target, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useMethodologyComparison } from '@/api/hooks';
import { MethodologyExtraction, MethodologyComparison, MethodologyCompareRequest } from '@/api/api';

interface MethodologyComparisonProps {
  role: string;
}

export default function MethodologyComparisonComponent({ role }: MethodologyComparisonProps) {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPapers, setMaxPapers] = useState(5);

  const request: MethodologyCompareRequest = {
    query: searchQuery,
    max_papers: maxPapers
  };

  const { data: comparisonData, isLoading, error } = useMethodologyComparison(request, searchQuery.length > 0);

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderMethodologyTable = (papers: MethodologyExtraction[]) => {
    if (!papers || papers.length === 0) return null;

    return (
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <FileText className="h-5 w-5 mr-2" />
            Methodology Comparison Table
          </CardTitle>
          <CardDescription className="text-gray-300">
            Side-by-side comparison of research methodologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Study</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Subjects</th>
                  <th className="text-left p-3 font-semibold">Duration</th>
                  <th className="text-left p-3 font-semibold">Conditions</th>
                  <th className="text-left p-3 font-semibold">Techniques</th>
                  <th className="text-left p-3 font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper, index) => (
                  <tr key={index} className="border-b transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
                    <td className="p-3">
                      <div className="max-w-xs">
                        <div className="font-medium text-sm">{paper.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {paper.location} • {paper.sample_size}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{paper.study_type}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        {paper.subjects}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {paper.duration}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm max-w-xs">
                        {paper.conditions}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm max-w-xs">
                        {paper.techniques}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm max-w-xs">
                        {paper.outcome}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInsights = (comparison: MethodologyComparison) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Similarities */}
        <Card className="border-green-200 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Similarities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.similarities.length > 0 ? (
                comparison.similarities.map((similarity, index) => (
                  <div key={index} className="text-xs text-white bg-transparent p-2 rounded">
                    {similarity}
                  </div>
                ))
              ) : (
                <div className="text-xs text-white">No similarities found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Differences */}
        <Card className="border-blue-200 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <Target className="h-4 w-4 mr-2" />
              Differences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.differences.length > 0 ? (
                comparison.differences.map((difference, index) => (
                  <div key={index} className="text-xs text-white bg-transparent p-2 rounded">
                    {difference}
                  </div>
                ))
              ) : (
                <div className="text-xs text-white">No differences found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Research Gaps */}
        <Card className="border-yellow-200 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Research Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.gaps.length > 0 ? (
                comparison.gaps.map((gap, index) => (
                  <div key={index} className="text-xs text-white bg-transparent p-2 rounded">
                    {gap}
                  </div>
                ))
              ) : (
                <div className="text-xs text-white">No gaps identified</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contradictions */}
        <Card className="border-red-200 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Contradictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparison.contradictions.length > 0 ? (
                comparison.contradictions.map((contradiction, index) => (
                  <div key={index} className="text-xs text-white bg-transparent p-2 rounded">
                    {contradiction}
                  </div>
                ))
              ) : (
                <div className="text-xs text-white">No contradictions found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Search className="h-5 w-5 mr-2" />
            Methodology Comparison Search
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter a research query to compare methodologies across relevant papers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., bone loss in microgravity, muscle atrophy in space..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!query.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Max Papers:</label>
              <select
                value={maxPapers}
                onChange={(e) => setMaxPapers(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-transparent">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-white">Analyzing methodologies...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-transparent">
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <XCircle className="h-8 w-8 mx-auto mb-4" />
              <p>Error loading methodology comparison: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-blue-200 bg-transparent">
            <CardHeader>
              <CardTitle className="text-white">
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {comparisonData.total_papers_found}
                  </div>
                  <div className="text-sm text-blue-700">Papers Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {comparisonData.papers.length}
                  </div>
                  <div className="text-sm text-blue-700">Methodologies Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {comparisonData.comparison.gaps.length}
                  </div>
                  <div className="text-sm text-blue-700">Research Gaps</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Methodology Table */}
          {renderMethodologyTable(comparisonData.papers)}

          {/* Insights */}
          {renderInsights(comparisonData.comparison)}
        </div>
      )}

      {/* Empty State */}
      {!comparisonData && !isLoading && !error && (
        <Card className="bg-transparent">
          <CardContent className="py-12">
            <div className="text-center text-white">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Search for Methodology Comparison</p>
              <p className="text-sm text-gray-300">Enter a research query to compare methodologies across relevant papers</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
