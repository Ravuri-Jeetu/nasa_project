'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { useSynergyAnalysis, useRefreshSynergyAnalysis, useSynergyInvestmentRecommendations } from '@/api/hooks';
import { SynergyPair, DomainStats } from '@/api/api';

export default function SynergyAnalysis() {
  const [selectedSynergy, setSelectedSynergy] = useState<SynergyPair | null>(null);
  const [investmentBudget, setInvestmentBudget] = useState<string>('5');
  const [riskTolerance, setRiskTolerance] = useState<string>('Medium');
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);

  const { data: synergyData, isLoading, error, refetch } = useSynergyAnalysis();
  const refreshMutation = useRefreshSynergyAnalysis();
  const { data: investmentData } = useSynergyInvestmentRecommendations(
    parseFloat(investmentBudget) || 0, 
    riskTolerance
  );

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

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Progress value={66} className="w-64 mb-4" />
          <p className="text-lg text-white">Analyzing cross-domain synergies...</p>
        </div>
      </div>
    );
  }

  if (error || !synergyData?.success) {
    return (
      <Card className="bg-transparent border-gray-700 text-white">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Error</h3>
          <p className="text-gray-400 mb-4">
            {synergyData?.error || 'Failed to load synergy analysis'}
          </p>
          <Button onClick={handleRefresh} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const synergies = synergyData.synergies || [];
  const domainStats = synergyData.domain_stats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cross-Domain Synergy Analysis</h2>
          <p className="text-gray-400">
            Discover collaboration opportunities between NASA research domains
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshMutation.isPending}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showInvestmentDialog} onOpenChange={setShowInvestmentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Investment Analysis
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Investment Recommendations</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Generate investment recommendations based on synergy analysis
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-gray-300">Investment Budget ($M)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 5"
                      value={investmentBudget}
                      onChange={(e) => setInvestmentBudget(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk" className="text-gray-300">Risk Tolerance</Label>
                    <select
                      id="risk"
                      value={riskTolerance}
                      onChange={(e) => setRiskTolerance(e.target.value)}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="Low">Low Risk - Conservative</option>
                      <option value="Medium">Medium Risk - Balanced</option>
                      <option value="High">High Risk - Aggressive</option>
                    </select>
                  </div>
                </div>
                
                {investmentData?.success && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                      <h4 className="font-semibold text-green-400 mb-2">Investment Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Total Estimated Cost:</span>
                          <span className="text-white ml-2">${investmentData.total_estimated_cost}M</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Budget Utilization:</span>
                          <span className="text-white ml-2">{investmentData.budget_utilization}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-cyan-400">Top Recommendations</h4>
                      {investmentData.recommendations.slice(0, 3).map((rec: any, index: number) => (
                        <div key={index} className="bg-gray-900 p-3 rounded border border-gray-600">
                          <div className="flex justify-between items-center mb-2">
                            <Badge className={getDomainColor(rec.Domain_A)}>{rec.Domain_A}</Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <Badge className={getDomainColor(rec.Domain_B)}>{rec.Domain_B}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                            <div>Similarity: {rec.Similarity_Score.toFixed(3)}</div>
                            <div>Cost: ${rec.estimated_cost}M</div>
                            <div>ROI: {rec.expected_roi}%</div>
                            <div>Priority: {rec.priority}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{synergies.length}</div>
            <div className="text-sm text-gray-300">Synergies Found</div>
            <div className="text-xs text-gray-400 mt-1">High collaboration potential</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{domainStats.length}</div>
            <div className="text-sm text-gray-300">Domains Analyzed</div>
            <div className="text-xs text-gray-400 mt-1">Cross-domain opportunities</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{synergyData.total_projects}</div>
            <div className="text-sm text-gray-300">Projects Processed</div>
            <div className="text-xs text-gray-400 mt-1">Comprehensive analysis</div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {synergies.length > 0 ? synergies[0].Similarity_Score.toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-300">Max Similarity</div>
            <div className="text-xs text-gray-400 mt-1">Highest synergy score</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="synergies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="synergies">Top Synergies</TabsTrigger>
          <TabsTrigger value="domains">Domain Statistics</TabsTrigger>
          <TabsTrigger value="opportunities">Strategic Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="synergies" className="space-y-4">
          <div className="space-y-4">
            {synergies.slice(0, 10).map((synergy, index) => (
              <Card 
                key={index} 
                className="bg-transparent border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setSelectedSynergy(synergy)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                        #{index + 1}
                      </Badge>
                      <span className={`font-bold text-lg ${getSimilarityColor(synergy.Similarity_Score)}`}>
                        {synergy.Similarity_Score.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getDomainColor(synergy.Domain_A)}>
                        {synergy.Domain_A}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <Badge className={getDomainColor(synergy.Domain_B)}>
                        {synergy.Domain_B}
                      </Badge>
                    </div>
                  </div>
                  
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card className="bg-transparent border-gray-700 text-white">
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

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {synergies.slice(0, 4).map((synergy, index) => (
              <Card key={index} className="bg-transparent border-gray-700 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-cyan-400">
                      {synergy.Domain_A} + {synergy.Domain_B}
                    </h4>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getSimilarityColor(synergy.Similarity_Score)}`}>
                        {synergy.Similarity_Score.toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-400">Similarity Score</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    <strong>Strategic Impact:</strong> High collaboration potential between these domains. 
                    Critical for developing effective cross-domain research initiatives.
                  </p>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>• <strong>Action:</strong> Joint research initiative</div>
                    <div>• <strong>Timeline:</strong> Start Q2 2024</div>
                    <div>• <strong>Budget:</strong> $2.5M allocated</div>
                    <div>• <strong>ROI:</strong> 40% faster development</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <Badge className={getDomainColor(selectedSynergy.Domain_B)}>
                  {selectedSynergy.Domain_B}
                </Badge>
              </div>
              
              <div className="text-center">
                <span className={`text-3xl font-bold ${getSimilarityColor(selectedSynergy.Similarity_Score)}`}>
                  {selectedSynergy.Similarity_Score.toFixed(3)}
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
                  Research in {selectedSynergy.Domain_A} and {selectedSynergy.Domain_B} shows significant 
                  thematic overlap with a similarity score of {selectedSynergy.Similarity_Score.toFixed(3)}. 
                  This suggests strong potential for cross-domain collaboration and knowledge transfer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
