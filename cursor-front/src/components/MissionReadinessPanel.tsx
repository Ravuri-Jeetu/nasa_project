'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Shield, 
  Leaf, 
  Bug, 
  Settings, 
  Download, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  score: 'Green' | 'Yellow' | 'Red';
  numeric: number;
  counts: {
    totalPubs: number;
    positiveEvidence: number;
    countermeasurePubs: number;
  };
  topFindings: Array<{
    pubId: string;
    short: string;
  }>;
  designImplications: string[];
  gapConfidence: 'low' | 'medium' | 'high';
}

interface MissionReadinessData {
  categories: Category[];
  overallIndex: {
    numeric: number;
    level: 'Green' | 'Yellow' | 'Red';
  };
  metadata?: {
    totalPublications: number;
    environment: string;
    minYear: number;
    analysisDate: string;
  };
  warning?: string;
}

const categoryIcons = {
  'crew-health': Heart,
  'radiation': Shield,
  'food-life-support': Leaf,
  'microbial-risks': Bug,
  'system-integration': Settings,
};

const scoreColors = {
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Red: 'bg-red-500',
};

const scoreTextColors = {
  Green: 'text-green-700',
  Yellow: 'text-yellow-700',
  Red: 'text-red-700',
};

const gapConfidenceColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function MissionReadinessPanel() {
  const [data, setData] = useState<MissionReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    fetchMissionReadinessData();
  }, []);

  const fetchMissionReadinessData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mission-readiness?env=transit&minYear=2020');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const exportBrief = () => {
    if (!data) return;
    
    const brief = {
      overallScore: data.overallIndex,
      categories: data.categories.map(cat => ({
        name: cat.name,
        score: cat.score,
        numeric: cat.numeric,
        keyImplications: cat.designImplications.slice(0, 2)
      })),
      metadata: data.metadata,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mission-readiness-brief.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading mission readiness data: {error}</p>
            <Button onClick={fetchMissionReadinessData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {data.warning && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-yellow-800">
              <Info className="h-5 w-5 mr-2" />
              <p>{data.warning}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Mission Readiness Index */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Mission Readiness Index</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Overall assessment of mission readiness across all categories
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-3xl font-bold ${scoreTextColors[data.overallIndex.level]}`}>
                {data.overallIndex.numeric}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${scoreColors[data.overallIndex.level]}`}></div>
              <span className={`font-semibold ${scoreTextColors[data.overallIndex.level]}`}>
                {data.overallIndex.level}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Progress value={data.overallIndex.numeric} className="flex-1 mr-4" />
            <Button onClick={exportBrief} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Brief
            </Button>
          </div>
          
          {/* How to Read Tooltip */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-xs text-gray-500"
            >
              <Info className="h-3 w-3 mr-1" />
              How to read this
            </Button>
            {showTooltip && (
              <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-3 z-10 w-80">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span><strong>Green:</strong> Well-studied + tested countermeasures</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span><strong>Yellow:</strong> Partial evidence, some solutions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span><strong>Red:</strong> Insufficient evidence / urgent research gap</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.categories.map((category) => {
          const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons];
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={gapConfidenceColors[category.gapConfidence]}
                  >
                    {category.gapConfidence} confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${scoreColors[category.score]}`}></div>
                    <span className={`font-semibold ${scoreTextColors[category.score]}`}>
                      {category.score}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {category.numeric}
                  </div>
                </div>
                
                <Progress value={category.numeric} className="h-2" />
                
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold">{category.counts.totalPubs}</div>
                    <div>Publications</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{category.counts.positiveEvidence}</div>
                    <div>Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{category.counts.countermeasurePubs}</div>
                    <div>Solutions</div>
                  </div>
                </div>

                {/* Top Findings */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Findings:</h4>
                  <div className="space-y-1">
                    {category.topFindings.slice(0, 2).map((finding, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {finding.short}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Implications */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Design Implications:</h4>
                  <div className="space-y-1">
                    {category.designImplications.slice(0, 2).map((implication, index) => (
                      <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                        {implication}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expand Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5" />
                        <span>{category.name} - Detailed Analysis</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Score Summary */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{category.numeric}</div>
                          <div className="text-sm text-gray-600">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{category.counts.totalPubs}</div>
                          <div className="text-sm text-gray-600">Total Publications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{category.counts.countermeasurePubs}</div>
                          <div className="text-sm text-gray-600">With Solutions</div>
                        </div>
                      </div>

                      {/* All Design Implications */}
                      <div>
                        <h3 className="font-semibold mb-3">Design Implications</h3>
                        <div className="space-y-2">
                          {category.designImplications.map((implication, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{implication}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* All Findings */}
                      <div>
                        <h3 className="font-semibold mb-3">Research Findings</h3>
                        <div className="space-y-3">
                          {category.topFindings.map((finding, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium mb-1">Publication {finding.pubId}</div>
                              <div className="text-sm text-gray-600">{finding.short}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metadata */}
      {data.metadata && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-1">
              <p>Analysis based on {data.metadata.totalPublications} publications</p>
              <p>Environment: {data.metadata.environment} | Min Year: {data.metadata.minYear}</p>
              <p>Last updated: {new Date(data.metadata.analysisDate).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
