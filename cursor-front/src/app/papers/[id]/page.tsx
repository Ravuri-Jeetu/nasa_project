'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/appStore';
import { usePaper } from '@/api/hooks';
import { 
  ArrowLeft,
  Calendar, 
  Users, 
  BookOpen,
  TrendingUp,
  Download,
  ExternalLink,
  Brain,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PaperDetailPageProps {
  params: {
    id: string;
  };
}

export default function PaperDetailPage({ params }: PaperDetailPageProps) {
  const { role, selectedPaperIds, addSelectedPaperId, removeSelectedPaperId } = useAppStore();
  const { data: paper, isLoading, error } = usePaper(params.id, role);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !paper) {
    notFound();
  }

  const isSelected = selectedPaperIds.includes(paper.id);

  const handleSelect = () => {
    if (isSelected) {
      removeSelectedPaperId(paper.id);
    } else {
      addSelectedPaperId(paper.id);
    }
  };

  const getTechnicalAnalysis = () => ({
    methodology: paper.methodology || 'Advanced Analytical Methods',
    impact: paper.citations > 50 ? 'High Impact' : paper.citations > 20 ? 'Medium Impact' : 'Emerging',
    innovation: 'Significant technical contributions with novel approaches',
    applications: [
      'Data analysis and pattern recognition',
      'Predictive modeling and forecasting',
      'Automated decision support systems',
      'Real-time processing and optimization'
    ],
    limitations: [
      'Computational complexity constraints',
      'Data quality dependencies',
      'Scalability challenges in distributed environments'
    ]
  });

  const getBusinessAnalysis = () => ({
    roi: paper.funding && paper.return ? ((paper.return - paper.funding) / paper.funding * 100).toFixed(0) : 'TBD',
    marketSize: '$2.4B',
    competitiveAdvantage: 'Strong IP portfolio and technical expertise',
    risks: [
      'Market adoption timeline uncertainty',
      'Regulatory compliance requirements',
      'Technology obsolescence risk'
    ],
    opportunities: [
      'Enterprise software integration',
      'Cloud-based service offerings',
      'International market expansion',
      'Strategic partnerships'
    ]
  });

  const analysis = role === 'Scientist' ? getTechnicalAnalysis() : getBusinessAnalysis();
  
  // Type assertion to help TypeScript understand the analysis type
  const technicalAnalysis = analysis as ReturnType<typeof getTechnicalAnalysis>;
  const businessAnalysis = analysis as ReturnType<typeof getBusinessAnalysis>;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/papers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Papers
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{paper.title}</h1>
              <p className="text-gray-600 mt-1">
                {role === 'Scientist' ? 'Technical Analysis' : 'Business Intelligence'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={isSelected ? "default" : "outline"}
              onClick={handleSelect}
            >
              {isSelected ? 'Selected' : 'Select Paper'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Paper Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{paper.title}</CardTitle>
                <CardDescription className="flex items-center space-x-6 text-sm">
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
              <div>
                <h3 className="font-semibold text-lg mb-2">Abstract</h3>
                <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>DOI: {paper.doi}</span>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {role === 'Scientist' ? (
            <>
              {/* Technical Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Technical Analysis
                  </CardTitle>
                  <CardDescription>
                    Deep technical insights and methodology evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Methodology</h4>
                    <p className="text-sm text-gray-700">{role === 'Scientist' ? technicalAnalysis.methodology : 'Business Analysis'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Research Impact</h4>
                    <Badge variant="outline" className="mb-2">
                      {role === 'Scientist' ? technicalAnalysis.impact : 'Market Impact'}
                    </Badge>
                    <p className="text-sm text-gray-700">{role === 'Scientist' ? technicalAnalysis.innovation : businessAnalysis.competitiveAdvantage}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Technical Applications</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {role === 'Scientist' ? technicalAnalysis.applications.map((app, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{app}</span>
                        </li>
                      )) : businessAnalysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Technical Limitations</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {role === 'Scientist' ? technicalAnalysis.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{limitation}</span>
                        </li>
                      )) : businessAnalysis.risks.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Research Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Research Metrics
                  </CardTitle>
                  <CardDescription>
                    Quantitative analysis of research performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{paper.citations}</div>
                        <div className="text-sm text-blue-700">Citations</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {paper.citations > 50 ? '9.2' : paper.citations > 20 ? '8.1' : '7.3'}
                        </div>
                        <div className="text-sm text-green-700">Impact Score</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Methodology Innovation</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Technical Rigor</span>
                        <span className="font-medium">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Reproducibility</span>
                        <span className="font-medium">Good</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Business Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Business Analysis
                  </CardTitle>
                  <CardDescription>
                    Investment potential and market opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">ROI Analysis</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {businessAnalysis.roi}% ROI
                    </div>
                    <p className="text-sm text-gray-700">
                      Based on historical data and market trends
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Market Size</h4>
                    <p className="text-sm text-gray-700">{businessAnalysis.marketSize} addressable market</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Competitive Advantage</h4>
                    <p className="text-sm text-gray-700">{businessAnalysis.competitiveAdvantage}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Investment Opportunities</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {businessAnalysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Risk Factors</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {businessAnalysis.risks.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Financial Metrics
                  </CardTitle>
                  <CardDescription>
                    Investment performance and projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${paper.funding?.toLocaleString() || 'TBD'}
                        </div>
                        <div className="text-sm text-green-700">Investment</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${paper.return?.toLocaleString() || 'TBD'}
                        </div>
                        <div className="text-sm text-blue-700">Projected Return</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Market Penetration</span>
                        <span className="font-medium">Medium</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Revenue Potential</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Risk Level</span>
                        <span className="font-medium">Low-Medium</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Related Papers */}
        <Card>
          <CardHeader>
            <CardTitle>Related Research</CardTitle>
            <CardDescription>
              Papers with similar methodologies or topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Related papers will be displayed here</p>
              <p className="text-sm">Based on methodology and keyword similarity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
