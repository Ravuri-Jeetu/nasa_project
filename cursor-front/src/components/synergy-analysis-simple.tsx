'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useSynergyAnalysis, useRefreshSynergyAnalysis } from '@/api/hooks';

export default function SynergyAnalysisSimple() {
  const { data: synergyData, isLoading, error, refetch } = useSynergyAnalysis();
  const refreshMutation = useRefreshSynergyAnalysis();

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

  if (error) {
    return (
      <Card className="bg-transparent border-gray-700 text-white">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analysis Error</h3>
          <p className="text-gray-400 mb-4">
            Failed to load synergy analysis. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!synergyData || !synergyData.success) {
    return (
      <Card className="bg-transparent border-gray-700 text-white">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400 mb-4">
            No synergy analysis data is currently available.
          </p>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { synergies, domain_stats, summary_stats } = synergyData;

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
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{summary_stats?.total_projects || 0}</p>
                <p className="text-xs text-gray-400">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{summary_stats?.total_domains || 0}</p>
                <p className="text-xs text-gray-400">Research Domains</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">{summary_stats?.total_synergies || 0}</p>
                <p className="text-xs text-gray-400">Synergy Pairs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{((summary_stats?.avg_synergy_score || 0) * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-400">Avg Similarity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Synergies */}
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Top Synergy Opportunities
          </CardTitle>
          <CardDescription className="text-gray-400">
            Highest similarity scores between research domains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {synergies && synergies.length > 0 ? (
            synergies.slice(0, 5).map((synergy: any, index: number) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium text-gray-300">
                      {(synergy.Similarity_Score * 100).toFixed(1)}% Similarity
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    High Potential
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-cyan-400">{synergy.Domain_A}</h4>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {synergy.Project_A_Title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <DollarSign className="h-3 w-3" />
                      <span>${synergy.Project_A_Funding?.toLocaleString() || 'N/A'}</span>
                      <span>•</span>
                      <span>{synergy.Project_A_Status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-400">{synergy.Domain_B}</h4>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {synergy.Project_B_Title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <DollarSign className="h-3 w-3" />
                      <span>${synergy.Project_B_Funding?.toLocaleString() || 'N/A'}</span>
                      <span>•</span>
                      <span>{synergy.Project_B_Status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Collaboration Potential</span>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-400">High</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No synergy pairs found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Statistics */}
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-white">Domain Statistics</CardTitle>
          <CardDescription className="text-gray-400">
            Research activity and synergy potential by domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domain_stats && domain_stats.length > 0 ? (
            <div className="space-y-3">
              {domain_stats.map((domain: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-white">{domain.Domain}</p>
                      <p className="text-xs text-gray-400">{domain.Project_Count} projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">{domain.Synergy_Count} synergies</p>
                    <p className="text-xs text-gray-400">
                      Avg: {((domain.Avg_Similarity || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No domain statistics available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
