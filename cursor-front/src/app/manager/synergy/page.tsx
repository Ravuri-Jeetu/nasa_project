'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, RefreshCw, TrendingUp, Users, Target } from 'lucide-react';
import { 
  type CrossDomainSynergy,
  fetchCrossDomainSynergy,
  refreshManagerData
} from '@/api/api';

export default function SynergyPage() {
  const [synergy, setSynergy] = useState<CrossDomainSynergy | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSynergyData = async () => {
    try {
      setLoading(true);
      const synergyData = await fetchCrossDomainSynergy();
      setSynergy(synergyData);
    } catch (error) {
      console.error('Error loading synergy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshManagerData();
      await loadSynergyData();
    } catch (error) {
      console.error('Error refreshing data:', error);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Network className="h-8 w-8 text-cyan-600" />
              Cross-Domain Synergy Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Identify collaboration opportunities between research domains
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>

        {/* Synergy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-cyan-900/20 border-cyan-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Network className="h-8 w-8 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {synergy?.total_synergies || 0}
                  </div>
                  <div className="text-sm text-cyan-300">Total Synergies</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-900/20 border-green-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {synergy?.high_potential_synergies || 0}
                  </div>
                  <div className="text-sm text-green-300">High Potential</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {synergy?.collaboration_opportunities || 0}
                  </div>
                  <div className="text-sm text-blue-300">Collaborations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-900/20 border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {synergy?.avg_synergy_score || 0}%
                  </div>
                  <div className="text-sm text-purple-300">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Synergies */}
        <Card className="bg-transparent border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-cyan-500" />
              Top Synergy Opportunities
            </CardTitle>
            <CardDescription className="text-gray-400">
              Highest potential collaboration opportunities between research domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            {synergy && synergy.top_synergies && synergy.top_synergies.length > 0 ? (
              <div className="space-y-4">
                {synergy.top_synergies.map((synergyItem, index) => (
                  <div key={index} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-cyan-100 text-cyan-800">
                          #{index + 1}
                        </Badge>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {synergyItem.domain1} × {synergyItem.domain2}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Cross-domain collaboration opportunity
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-500">
                          {synergyItem.synergy_score}%
                        </div>
                        <div className="text-xs text-gray-400">Synergy Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Shared Resources:</h4>
                        <div className="flex flex-wrap gap-1">
                          {synergyItem.shared_resources?.map((resource, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Potential Benefits:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {synergyItem.benefits?.map((benefit, idx) => (
                            <li key={idx}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        <span className="font-medium">Recommended Investment:</span> ${synergyItem.recommended_investment?.toLocaleString() || 'N/A'}
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Network className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Synergy Data</h3>
                <p className="text-gray-500">
                  Cross-domain synergy analysis is currently being processed. Please check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Recommendations */}
        {synergy && synergy.investment_recommendations && (
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Investment Recommendations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Strategic investment opportunities for cross-domain collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {synergy.investment_recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">{rec.title}</h4>
                        <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            <span className="font-medium">Investment:</span> ${rec.investment_amount?.toLocaleString() || 'N/A'}
                          </span>
                          <span className="text-gray-400">
                            <span className="font-medium">Expected ROI:</span> {rec.expected_roi}%
                          </span>
                          <span className="text-gray-400">
                            <span className="font-medium">Timeline:</span> {rec.timeline}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'secondary' : 'outline'}
                        className="ml-4"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
