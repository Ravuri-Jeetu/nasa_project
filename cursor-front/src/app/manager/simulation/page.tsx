'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import ManagerNavigation from '@/components/manager-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  RefreshCw, 
  Target, 
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  type BudgetSimulation,
  type DomainAnalytics,
  fetchBudgetSimulation,
  fetchDomainAnalytics,
  refreshManagerData
} from '@/api/api';

export default function SimulationPage() {
  const [selectedDomain, setSelectedDomain] = useState('Plants');
  const [budgetAdjustment, setBudgetAdjustment] = useState(0);
  const [simulation, setSimulation] = useState<BudgetSimulation | null>(null);
  const [domainAnalytics, setDomainAnalytics] = useState<DomainAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const analytics = await fetchDomainAnalytics();
      setDomainAnalytics(analytics);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSimulation = async () => {
    try {
      setSimulating(true);
      const result = await fetchBudgetSimulation(selectedDomain, budgetAdjustment);
      setSimulation(result);
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setSimulating(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshManagerData();
      await loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDomain && budgetAdjustment !== 0) {
      handleBudgetSimulation();
    }
  }, [selectedDomain, budgetAdjustment]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  // Prepare simulation chart data
  const simulationData = simulation ? [
    { 
      metric: 'Original ROI', 
      value: simulation.original_roi,
      type: 'baseline'
    },
    { 
      metric: 'Adjusted ROI', 
      value: simulation.adjusted_roi,
      type: 'adjusted'
    }
  ] : [];

  const fundingData = simulation ? [
    { 
      period: 'Current', 
      original: simulation.original_funding,
      adjusted: simulation.original_funding
    },
    { 
      period: 'Projected', 
      original: simulation.original_funding,
      adjusted: simulation.adjusted_funding
    }
  ] : [];

  return (
    <MainLayout>
      <ManagerNavigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              Budget Simulation
            </h1>
            <p className="text-gray-600 mt-2">
              Test different funding scenarios and see their impact on research outcomes
            </p>
          </div>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Simulation Controls */}
        <Card className="bg-transparent border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Simulation Parameters
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adjust parameters to simulate different funding scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Domain Selection */}
              <div className="space-y-3">
                <label htmlFor="domain-select" className="text-gray-300 font-medium">
                  Select Research Domain:
                </label>
                <select
                  id="domain-select"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {domainAnalytics?.domains.names.map((domainName, index) => (
                    <option key={index} value={domainName}>{domainName}</option>
                  ))}
                </select>
              </div>

              {/* Budget Adjustment Slider */}
              <div className="space-y-3">
                <label htmlFor="budget-adjustment" className="text-gray-300 font-medium">
                  Budget Adjustment: {budgetAdjustment}%
                </label>
                <Slider
                  id="budget-adjustment"
                  min={-100}
                  max={200}
                  step={10}
                  value={[budgetAdjustment]}
                  onValueChange={([value]) => setBudgetAdjustment(value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -100% (Cut)
                  </span>
                  <span>0% (No Change)</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +200% (Increase)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBudgetAdjustment(-50)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                -50% Cut
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBudgetAdjustment(0)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBudgetAdjustment(50)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                +50% Boost
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBudgetAdjustment(100)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                +100% Double
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simulation && (
          <Card className="bg-transparent border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Simulation Results for {selectedDomain}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Impact analysis of the proposed budget changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-300">Original Funding</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${simulation.original_funding.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-300">Adjusted Funding</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${simulation.adjusted_funding.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {budgetAdjustment > 0 ? '+' : ''}{budgetAdjustment}% change
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-300">Original ROI</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {simulation.original_roi.toFixed(2)}%
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-300">Adjusted ROI</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {simulation.adjusted_roi.toFixed(2)}%
                  </div>
                  <div className={`text-xs ${simulation.adjusted_roi >= simulation.original_roi ? 'text-green-500' : 'text-red-500'}`}>
                    {simulation.adjusted_roi >= simulation.original_roi ? '+' : ''}
                    {(simulation.adjusted_roi - simulation.original_roi).toFixed(2)}% change
                  </div>
                </div>
              </div>

              {/* ROI Comparison Chart */}
              <div className="bg-gray-900 p-4 rounded-lg border border-blue-600">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">ROI Impact Analysis</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis 
                      dataKey="metric" 
                      stroke="#D1D5DB"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#D1D5DB"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#E5E7EB'
                      }}
                      labelStyle={{ color: '#E5E7EB' }}
                      itemStyle={{ color: '#9CA3AF' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Funding Timeline Chart */}
              <div className="bg-gray-900 p-4 rounded-lg border border-green-600">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Funding Timeline</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={fundingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#D1D5DB"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#D1D5DB"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#E5E7EB'
                      }}
                      labelStyle={{ color: '#E5E7EB' }}
                      itemStyle={{ color: '#9CA3AF' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="original" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="adjusted" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Impact Summary */}
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-lg border border-purple-600">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Impact Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      <strong>Impact on Projects:</strong> {simulation.impact_on_projects}
                    </p>
                    <p className="text-sm text-gray-300">
                      <strong>Risk Change:</strong> {simulation.risk_change}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      <strong>Recommendation:</strong> {simulation.recommendation}
                    </p>
                    <p className="text-sm text-gray-300">
                      <strong>Time to Impact:</strong> {simulation.time_to_impact}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={handleBudgetSimulation}
            disabled={simulating || budgetAdjustment === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {simulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Simulating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Target className="h-4 w-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
