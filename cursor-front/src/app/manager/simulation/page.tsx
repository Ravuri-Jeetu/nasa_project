'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calculator, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';
import { 
  type BudgetSimulation,
  fetchBudgetSimulation,
  refreshManagerData
} from '@/api/api';

export default function SimulationPage() {
  const [simulation, setSimulation] = useState<BudgetSimulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('Human Physiology');
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(10);

  const loadSimulationData = async (domain: string, adjustment: number) => {
    try {
      setLoading(true);
      const simData = await fetchBudgetSimulation(domain, adjustment);
      
      // Check if we got valid data from the backend
      if (!simData || !simData.domain) {
        console.error('No valid simulation data received');
        setSimulation(null);
        return;
      }
      
      setSimulation(simData);
    } catch (error) {
      console.error('Error loading simulation data:', error);
      setSimulation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshManagerData();
      await loadSimulationData(selectedDomain, adjustmentPercentage);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunSimulation = () => {
    loadSimulationData(selectedDomain, adjustmentPercentage);
  };

  useEffect(() => {
    loadSimulationData(selectedDomain, adjustmentPercentage);
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Calculator className="h-8 w-8 text-purple-600" />
              Budget Simulation
            </h1>
            <p className="text-gray-600 mt-2">
              Test funding scenarios and analyze their impact on research outcomes
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Simulation Controls */}
        <Card className="bg-transparent border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Simulation Parameters</CardTitle>
            <CardDescription className="text-gray-400">
              Configure your budget simulation scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Research Domain
                  </label>
                  <select 
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="Human Physiology">Human Physiology</option>
                    <option value="Plants">Plant Biology</option>
                    <option value="Microbes">Microbial Biology</option>
                    <option value="Radiation">Radiation Biology</option>
                    <option value="Psychology">Psychology & Behavioral</option>
                    <option value="Other">Other Domains</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Budget Adjustment: {adjustmentPercentage}%
                  </label>
                  <Slider
                    value={[adjustmentPercentage]}
                    onValueChange={(value) => setAdjustmentPercentage(value[0])}
                    max={100}
                    min={-50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-50%</span>
                    <span>0%</span>
                    <span>+100%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRunSimulation} 
              className="w-full md:w-auto"
              disabled={loading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simulation && (
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Simulation Results
              </CardTitle>
              <CardDescription className="text-gray-400">
                Impact analysis for {adjustmentPercentage}% budget adjustment in {selectedDomain}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {simulation?.projected?.roi?.toFixed(1) || '0.0'}%
              </div>
              <div className="text-sm text-gray-400">Projected ROI</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {simulation?.projected?.studies || 0}
              </div>
              <div className="text-sm text-gray-400">Projected Studies</div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                ${(simulation?.projected?.funding || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Projected Funding</div>
            </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Impact Analysis:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Study difference: {simulation?.impact?.study_difference || 0} studies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Funding difference: ${(simulation?.impact?.funding_difference || 0).toLocaleString()}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Additional investment: ${(simulation?.impact?.additional_investment || 0).toLocaleString()}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Current vs Projected:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-300 mb-1">Current:</h5>
                      <p className="text-gray-400">Studies: {simulation?.current?.studies || 0}</p>
                      <p className="text-gray-400">Funding: ${(simulation?.current?.funding || 0).toLocaleString()}</p>
                      <p className="text-gray-400">ROI: {simulation?.current?.roi || 0}%</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-300 mb-1">Projected:</h5>
                      <p className="text-gray-400">Studies: {simulation?.projected?.studies || 0}</p>
                      <p className="text-gray-400">Funding: ${(simulation?.projected?.funding || 0).toLocaleString()}</p>
                      <p className="text-gray-400">ROI: {simulation?.projected?.roi || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!simulation && !loading && (
          <Card className="bg-transparent border-gray-700">
            <CardContent className="text-center py-12">
              <Calculator className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Simulation Data Available</h3>
              <p className="text-gray-500 mb-4">
                No data found for the selected domain &quot;{selectedDomain}&quot;. Try selecting a different domain or check if the domain has research projects.
              </p>
              <Button 
                onClick={handleRunSimulation}
                className="mt-4"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
