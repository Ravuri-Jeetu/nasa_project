'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, PiggyBank, TrendingUp, DollarSign } from 'lucide-react';
import { 
  type InvestmentRecommendation,
  fetchInvestmentRecommendations,
  refreshManagerData
} from '@/api/api';

export default function InvestmentPage() {
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      const recs = await fetchInvestmentRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshManagerData();
      await loadInvestmentData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvestmentData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
              <PiggyBank className="h-8 w-8 text-green-600" />
              Investment Recommendations
            </h1>
            <p className="text-gray-600 mt-2">
              Strategic recommendations for funding allocation based on ROI and impact
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Investment Recommendations */}
        <Card className="bg-transparent border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Strategic Investment Opportunities
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI-powered recommendations for maximizing research impact and ROI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations ? (
              <div className="space-y-6">
                {/* Primary Recommendation */}
                <div className="bg-gray-900 p-6 rounded-lg border border-green-600">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Primary Recommendation
                    </Badge>
                    <span className="text-sm text-gray-400">High Impact</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-green-400 mb-3">
                    {recommendations.primary_recommendation.domain}
                  </h3>
                  
                  <p className="text-gray-300 mb-4">
                    {recommendations.primary_recommendation.action}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Studies:</span>
                        <span className="font-medium text-white">
                          {recommendations.primary_recommendation.current_studies}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Suggested Increase:</span>
                        <span className="font-medium text-yellow-500">
                          +{recommendations.primary_recommendation.suggested_increase}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investment Needed:</span>
                        <span className="font-medium text-blue-500 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {recommendations.primary_recommendation.investment_needed?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential ROI:</span>
                        <span className="font-medium text-green-500">
                          {recommendations.primary_recommendation.potential_roi}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <PiggyBank className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Investment Recommendations</h3>
                <p className="text-gray-500">
                  Investment recommendations are currently being analyzed. Please check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
