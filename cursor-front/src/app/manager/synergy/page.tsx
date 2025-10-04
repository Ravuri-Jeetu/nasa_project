'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import ManagerNavigation from '@/components/manager-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Network, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { 
  fetchSynergyAnalysis,
  refreshSynergyAnalysis,
  type SynergyAnalysisResponse
} from '@/api/api';

export default function SynergyPage() {
  const [synergyData, setSynergyData] = useState<SynergyAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSynergyData = async () => {
    try {
      setLoading(true);
      const data = await fetchSynergyAnalysis();
      setSynergyData(data);
    } catch (error) {
      console.error('Error loading synergy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSynergyAnalysis();
      await loadSynergyData();
    } catch (error) {
      console.error('Error refreshing synergy data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSynergyData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ManagerNavigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Network className="h-8 w-8 text-purple-600" />
              Cross-Domain Synergy Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Identify collaboration opportunities and synergies between different research domains
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>

        {/* Summary Stats */}
        {synergyData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{synergyData.total_projects}</div>
                <p className="text-xs text-gray-500">Research projects analyzed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Research Domains</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{synergyData.total_domains}</div>
                <p className="text-xs text-gray-500">Active domains</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synergy Pairs</CardTitle>
                <Network className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{synergyData.total_synergies}</div>
                <p className="text-xs text-gray-500">Identified synergies</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Synergy Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {synergyData.summary_stats?.avg_synergy_score?.toFixed(2) || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Collaboration potential</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Synergy Pairs */}
        <Card className="bg-transparent border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-purple-500" />
              Top Synergy Opportunities
            </CardTitle>
            <CardDescription className="text-gray-400">
              Highest potential collaboration pairs based on research similarity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {synergyData?.synergies && synergyData.synergies.length > 0 ? (
              synergyData.synergies.slice(0, 10).map((synergy, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg border border-purple-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        #{index + 1}
                      </Badge>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {synergy.Domain_A} ↔ {synergy.Domain_B}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {synergy.Similarity_Score?.toFixed(3) || 'N/A'} Similarity
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Potential ROI: {synergy.Expected_ROI || 'N/A'}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-400">Project A: {synergy.Domain_A}</h4>
                      <p className="text-sm text-gray-300 truncate">
                        {synergy.Project_A_Title}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Status: {synergy.Project_A_Status}</span>
                        <span>ROI: {synergy.Project_A_ROI?.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-400">Project B: {synergy.Domain_B}</h4>
                      <p className="text-sm text-gray-300 truncate">
                        {synergy.Project_B_Title}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Status: {synergy.Project_B_Status}</span>
                        <span>ROI: {synergy.Project_B_ROI?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300">Collaboration Potential:</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {synergy.Collaboration_Potential || 'High'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">Risk Level:</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {synergy.Risk_Level || 'Medium'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-3">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Initiate Collaboration
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Network className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Synergies Found</h3>
                <p className="text-gray-500">
                  Synergy analysis is currently being processed. Please check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Statistics */}
        {synergyData?.domain_stats && synergyData.domain_stats.length > 0 && (
          <Card className="bg-transparent border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Domain Statistics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Collaboration metrics for each research domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {synergyData.domain_stats.map((domain, index) => (
                  <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{domain.Domain}</h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {domain.Project_Count} Projects
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Synergies:</span>
                        <span className="text-white font-medium">{domain.Synergy_Count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Avg Similarity:</span>
                        <span className="text-white font-medium">
                          {domain.Avg_Similarity?.toFixed(3) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Max Similarity:</span>
                        <span className="text-white font-medium">
                          {domain.Max_Similarity?.toFixed(3) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Network className="h-4 w-4 mr-2" />
            Generate Collaboration Plan
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
