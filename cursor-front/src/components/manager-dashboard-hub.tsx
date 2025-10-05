'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PiggyBank, 
  AlertTriangle, 
  Calculator, 
  Network,
  TrendingUp,
  Users,
  Target,
  Activity,
  Download
} from 'lucide-react';
import { useAnalytics, useInvestmentRecommendations, useRedFlagAlerts, useBudgetSimulation, useCrossDomainSynergy } from '@/api/hooks';
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

export default function ManagerDashboardHub() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [totalBudget, setTotalBudget] = useState(2500000); // $2.5M default
  const [spaceBiologyAllocation, setSpaceBiologyAllocation] = useState(35); // 35% default
  const [molecularBiologyAllocation, setMolecularBiologyAllocation] = useState(25); // 25% default
  const [radiationBiologyAllocation, setRadiationBiologyAllocation] = useState(20); // 20% default
  const [biomechanicsAllocation, setBiomechanicsAllocation] = useState(20); // 20% default
  const [selectedDomain1, setSelectedDomain1] = useState('');
  const [selectedDomain2, setSelectedDomain2] = useState('');
  
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics('Manager');
  const { data: investmentData, isLoading: investmentLoading } = useInvestmentRecommendations();
  const { data: alertsData, isLoading: alertsLoading } = useRedFlagAlerts();
  const { data: simulationData, isLoading: simulationLoading } = useBudgetSimulation('all');
  const { data: synergyData, isLoading: synergyLoading } = useCrossDomainSynergy();

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'investment', label: 'Investment', icon: PiggyBank },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'simulation', label: 'Simulation', icon: Calculator },
    { id: 'synergy', label: 'Synergy', icon: Network },
  ];

  // Budget calculation helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAllocationAmount = (percentage: number) => {
    return (totalBudget * percentage) / 100;
  };

  const calculateTotalAllocation = () => {
    return spaceBiologyAllocation + molecularBiologyAllocation + radiationBiologyAllocation + biomechanicsAllocation;
  };

  const calculateExpectedROI = () => {
    // Simple ROI calculation based on allocations
    const spaceBioROI = spaceBiologyAllocation * 2.5; // 250% ROI
    const molecularROI = molecularBiologyAllocation * 2.0; // 200% ROI
    const radiationROI = radiationBiologyAllocation * 3.0; // 300% ROI
    const biomechanicsROI = biomechanicsAllocation * 2.2; // 220% ROI
    
    return (spaceBioROI + molecularROI + radiationROI + biomechanicsROI) / 100;
  };

  // Synergy visualization data
  const synergyPairsData = [
    { pair: 'Space Bio + Molecular', synergy: 95, projects: 12, impact: 8.5 },
    { pair: 'Radiation + Cell Bio', synergy: 87, projects: 8, impact: 7.8 },
    { pair: 'Biomechanics + Tissue Eng', synergy: 82, projects: 6, impact: 7.2 },
    { pair: 'Molecular + Genetics', synergy: 78, projects: 10, impact: 7.9 },
    { pair: 'Space Bio + Radiation', synergy: 75, projects: 9, impact: 8.1 },
    { pair: 'Cell Bio + Immunology', synergy: 73, projects: 7, impact: 6.8 }
  ];

  const collaborationTrendsData = [
    { month: 'Jan', active: 18, potential: 12, success: 75 },
    { month: 'Feb', active: 20, potential: 15, success: 78 },
    { month: 'Mar', active: 22, potential: 16, success: 82 },
    { month: 'Apr', active: 24, potential: 18, success: 79 },
    { month: 'May', active: 26, potential: 20, success: 85 },
    { month: 'Jun', active: 24, potential: 18, success: 78 }
  ];

  const domainNetworkData = [
    { x: 100, y: 80, size: 35, name: 'Space Biology', connections: 12 },
    { x: 200, y: 120, size: 28, name: 'Molecular Biology', connections: 15 },
    { x: 300, y: 60, size: 22, name: 'Radiation Biology', connections: 8 },
    { x: 150, y: 200, size: 25, name: 'Cell Biology', connections: 11 },
    { x: 250, y: 180, size: 20, name: 'Biomechanics', connections: 9 },
    { x: 180, y: 140, size: 18, name: 'Tissue Engineering', connections: 7 }
  ];

  const synergyDistributionData = [
    { name: 'High Synergy (80%+)', value: 35, color: '#10B981' },
    { name: 'Medium Synergy (60-79%)', value: 45, color: '#3B82F6' },
    { name: 'Low Synergy (<60%)', value: 20, color: '#EF4444' }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Research domains for dropdown selection
  const researchDomains = [
    'Space Biology',
    'Molecular Biology', 
    'Radiation Biology',
    'Cell Biology',
    'Biomechanics',
    'Tissue Engineering',
    'Genetics',
    'Immunology',
    'Neuroscience',
    'Biochemistry'
  ];

  // Success rate calculation between two domains
  const calculateSuccessRate = (domain1: string, domain2: string) => {
    if (!domain1 || !domain2 || domain1 === domain2) return null;
    
    // Mock success rate calculation based on domain combinations
    const combinations: { [key: string]: number } = {
      'Space Biology-Molecular Biology': 95,
      'Radiation Biology-Cell Biology': 87,
      'Biomechanics-Tissue Engineering': 82,
      'Molecular Biology-Genetics': 78,
      'Space Biology-Radiation Biology': 75,
      'Cell Biology-Immunology': 73,
      'Molecular Biology-Cell Biology': 88,
      'Space Biology-Biomechanics': 69,
      'Radiation Biology-Molecular Biology': 84,
      'Biomechanics-Cell Biology': 76,
      'Tissue Engineering-Molecular Biology': 81,
      'Genetics-Cell Biology': 89,
      'Immunology-Molecular Biology': 77,
      'Neuroscience-Cell Biology': 71,
      'Biochemistry-Molecular Biology': 93
    };

    const key1 = `${domain1}-${domain2}`;
    const key2 = `${domain2}-${domain1}`;
    
    return combinations[key1] || combinations[key2] || Math.floor(Math.random() * 30) + 60; // Random between 60-90% if not found
  };

  const currentSuccessRate = calculateSuccessRate(selectedDomain1, selectedDomain2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Strategic research management and portfolio optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Custom Tab Selector with Bubble Effect */}
        <motion.div 
          className="bg-muted/20 rounded-xl p-2 border border-border/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-3 px-4 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102'
                  }`}
                  whileHover={{ scale: isActive ? 1.08 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: isActive 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: isActive ? 360 : 0,
                        scale: isActive ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'analytics' && (
        <div className="space-y-4">
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <BarChart3 className="h-5 w-5 mr-2" />
                Research Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-gray-300">
                Real-time insights into project performance and domain distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Target className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="text-2xl font-bold text-white">150+</div>
                          <div className="text-sm text-gray-400">Active Projects</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold text-white">$2.5M</div>
                          <div className="text-sm text-gray-400">Total Funding</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8 text-yellow-500" />
                        <div>
                          <div className="text-2xl font-bold text-white">187%</div>
                          <div className="text-sm text-gray-400">Average ROI</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="text-2xl font-bold text-white">8</div>
                          <div className="text-sm text-gray-400">Research Domains</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics Content */}
                {analyticsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading analytics...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Project Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Active Projects</span>
                            <Badge variant="secondary" className="text-white bg-green-900">45</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Completed Projects</span>
                            <Badge variant="secondary" className="text-white bg-blue-900">32</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">On Hold</span>
                            <Badge variant="secondary" className="text-white bg-yellow-900">8</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Cancelled</span>
                            <Badge variant="secondary" className="text-white bg-red-900">3</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Domain Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics?.domains?.slice(0, 5).map((domain: string, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-300">{domain}</span>
                              <Badge variant="outline" className="text-white border-gray-600">
                                {Math.floor(Math.random() * 20) + 10}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Investment Tab */}
        {activeTab === 'investment' && (
        <div className="space-y-4">
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <PiggyBank className="h-5 w-5 mr-2" />
                Investment Recommendations
              </CardTitle>
              <CardDescription className="text-gray-300">
                Strategic funding allocation based on ROI and impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {investmentLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading investment data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Primary Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Space Biology Research</span>
                            <Badge className="bg-green-600">High ROI</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Molecular Studies</span>
                            <Badge className="bg-blue-600">Medium ROI</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Radiation Research</span>
                            <Badge className="bg-purple-600">High Impact</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Investment Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Total Recommended</span>
                            <span className="text-lg font-bold text-white">$2.8M</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Expected ROI</span>
                            <span className="text-lg font-bold text-green-400">245%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Risk Level</span>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">Medium</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
        <div className="space-y-4">
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Red Flag Alerts
              </CardTitle>
              <CardDescription className="text-gray-300">
                Critical alerts for project risks and performance issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading alerts...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Alert Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-transparent border-red-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                          <div>
                            <div className="text-2xl font-bold text-white">
                              {alertsData?.filter(alert => alert.alert_level === 'CRITICAL').length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Critical Alerts</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border-yellow-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-yellow-500" />
                          <div>
                            <div className="text-2xl font-bold text-white">
                              {alertsData?.filter(alert => alert.alert_level === 'WARNING').length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Warning Alerts</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border-green-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Target className="h-8 w-8 text-green-500" />
                          <div>
                            <div className="text-2xl font-bold text-white">
                              ${alertsData?.reduce((total, alert) => total + alert.estimated_cost, 0).toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-400">Total Investment Needed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alert Details */}
                  {alertsData && alertsData.length > 0 ? (
                    <div className="space-y-3">
                      {alertsData.map((alert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-white text-lg">
                                  {alert.domain} Research Gap
                                </h4>
                                <Badge 
                                  variant={alert.alert_level === 'CRITICAL' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {alert.alert_level}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-300 mb-3">
                                {alert.importance}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Recent Studies:</span>
                                  <span className="text-white font-medium ml-1">
                                    {alert.recent_studies}/{alert.threshold}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Total Studies:</span>
                                  <span className="text-white font-medium ml-1">
                                    {alert.total_studies}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Suggested Increase:</span>
                                  <span className="text-white font-medium ml-1">
                                    +{alert.suggested_increase} studies
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Estimated Cost:</span>
                                  <span className="text-white font-medium ml-1">
                                    ${alert.estimated_cost.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-600">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                                  <span className="text-orange-400 font-medium text-sm">
                                    {alert.urgency}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                        <Target className="h-12 w-12 mx-auto mb-4 text-green-400" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Critical Alerts</h3>
                        <p className="text-gray-400">
                          All research domains are meeting their minimum study thresholds. Great job!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && (
        <div className="space-y-4">
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Calculator className="h-5 w-5 mr-2" />
                Budget Simulation
              </CardTitle>
              <CardDescription className="text-gray-300">
                Test funding scenarios and analyze their impact on research outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Total Budget Slider */}
                <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-medium text-white">Total Budget</label>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalBudget)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1000000"
                      max="10000000"
                      step="250000"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer border-2 border-gray-600"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((totalBudget - 1000000) / (10000000 - 1000000)) * 100}%, #374151 ${((totalBudget - 1000000) / (10000000 - 1000000)) * 100}%, #374151 100%)`,
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        height: '16px',
                        borderRadius: '8px',
                        outline: 'none',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span className="font-medium">$1M</span>
                    <span className="font-medium">$10M</span>
                  </div>
                </div>

                {/* Research Domain Allocations */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Research Domain Allocations</h3>
                  
                  {/* Space Biology */}
                  <div className="space-y-3 p-3 bg-gray-800/20 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                        <span className="text-white font-medium">Space Biology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-semibold text-lg">{spaceBiologyAllocation}%</span>
                        <span className="text-gray-300 font-medium">{formatCurrency(calculateAllocationAmount(spaceBiologyAllocation))}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={spaceBiologyAllocation}
                        onChange={(e) => setSpaceBiologyAllocation(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer border border-gray-600"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${spaceBiologyAllocation * 2}%, #374151 ${spaceBiologyAllocation * 2}%, #374151 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          height: '12px',
                          borderRadius: '6px',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Molecular Biology */}
                  <div className="space-y-3 p-3 bg-gray-800/20 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                        <span className="text-white font-medium">Molecular Biology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-semibold text-lg">{molecularBiologyAllocation}%</span>
                        <span className="text-gray-300 font-medium">{formatCurrency(calculateAllocationAmount(molecularBiologyAllocation))}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={molecularBiologyAllocation}
                        onChange={(e) => setMolecularBiologyAllocation(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer border border-gray-600"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${molecularBiologyAllocation * 2}%, #374151 ${molecularBiologyAllocation * 2}%, #374151 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          height: '12px',
                          borderRadius: '6px',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Radiation Biology */}
                  <div className="space-y-3 p-3 bg-gray-800/20 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                        <span className="text-white font-medium">Radiation Biology</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold text-lg">{radiationBiologyAllocation}%</span>
                        <span className="text-gray-300 font-medium">{formatCurrency(calculateAllocationAmount(radiationBiologyAllocation))}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={radiationBiologyAllocation}
                        onChange={(e) => setRadiationBiologyAllocation(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer border border-gray-600"
                        style={{
                          background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${radiationBiologyAllocation * 2}%, #374151 ${radiationBiologyAllocation * 2}%, #374151 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          height: '12px',
                          borderRadius: '6px',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Biomechanics */}
                  <div className="space-y-3 p-3 bg-gray-800/20 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                        <span className="text-white font-medium">Biomechanics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-semibold text-lg">{biomechanicsAllocation}%</span>
                        <span className="text-gray-300 font-medium">{formatCurrency(calculateAllocationAmount(biomechanicsAllocation))}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={biomechanicsAllocation}
                        onChange={(e) => setBiomechanicsAllocation(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer border border-gray-600"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${biomechanicsAllocation * 2}%, #374151 ${biomechanicsAllocation * 2}%, #374151 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          height: '12px',
                          borderRadius: '6px',
                          outline: 'none',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary & Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                  <Card className="bg-transparent border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Allocation Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Total Allocated</span>
                          <span className="text-lg font-bold text-white">{calculateTotalAllocation()}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Remaining Budget</span>
                          <span className="text-lg font-bold text-white">{formatCurrency(totalBudget - calculateAllocationAmount(calculateTotalAllocation()))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Allocated Amount</span>
                          <span className="text-lg font-bold text-primary">{formatCurrency(calculateAllocationAmount(calculateTotalAllocation()))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-transparent border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Expected Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Expected ROI</span>
                          <span className="text-lg font-bold text-green-400">{calculateExpectedROI().toFixed(1)}x</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Risk Level</span>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {calculateTotalAllocation() > 100 ? 'High' : calculateTotalAllocation() > 80 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Success Probability</span>
                          <span className="text-lg font-bold text-blue-400">
                            {Math.max(60, 100 - Math.abs(calculateTotalAllocation() - 100) * 2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Synergy Tab */}
        {activeTab === 'synergy' && (
        <div className="space-y-4">
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Network className="h-5 w-5 mr-2" />
                Synergy Analysis
              </CardTitle>
              <CardDescription className="text-gray-300">
                Identify collaboration opportunities between research domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Synergy Pairs Bar Chart */}
                <Card className="bg-transparent border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Top Synergy Pairs Analysis</CardTitle>
                    <CardDescription className="text-gray-300">
                      Domain pairs ranked by collaboration synergy score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={synergyPairsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="pair" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Bar 
                          dataKey="synergy" 
                          fill="#06B6D4"
                          radius={[4, 4, 0, 0]}
                          name="Synergy Score (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Collaboration Trends Line Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-transparent border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Collaboration Trends</CardTitle>
                      <CardDescription className="text-gray-300">
                        Monthly collaboration metrics over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={collaborationTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="active" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            name="Active Collaborations"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="potential" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            name="Potential Partnerships"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="success" 
                            stroke="#F59E0B" 
                            strokeWidth={3}
                            dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                            name="Success Rate (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Synergy Distribution Pie Chart */}
                  <Card className="bg-transparent border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Synergy Distribution</CardTitle>
                      <CardDescription className="text-gray-300">
                        Breakdown of collaboration synergy levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <Pie
                            data={synergyDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {synergyDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Domain Network Scatter Plot */}
                <Card className="bg-transparent border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Research Domain Network</CardTitle>
                    <CardDescription className="text-gray-300">
                      Domain collaboration strength and connection patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={domainNetworkData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          label={{ value: 'Collaboration Strength', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          stroke="#9CA3AF"
                          fontSize={12}
                          label={{ value: 'Research Impact', position: 'insideLeft', angle: -90, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value, name, props) => [
                            `${props.payload.name} (${props.payload.connections} connections)`,
                            'Domain'
                          ]}
                        />
                        <Scatter 
                          dataKey="y" 
                          fill="#06B6D4"
                          r={8}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Domain Comparison Tool */}
                <Card className="bg-transparent border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Domain Collaboration Success Rate</CardTitle>
                    <CardDescription className="text-gray-300">
                      Select two research domains to analyze their collaboration potential and success rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Domain Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white">First Research Domain</label>
                          <select
                            value={selectedDomain1}
                            onChange={(e) => setSelectedDomain1(e.target.value)}
                            className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                          >
                            <option value="" className="bg-gray-800 text-white">Select a domain...</option>
                            {researchDomains.map((domain) => (
                              <option key={domain} value={domain} className="bg-gray-800 text-white">
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-white">Second Research Domain</label>
                          <select
                            value={selectedDomain2}
                            onChange={(e) => setSelectedDomain2(e.target.value)}
                            className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                          >
                            <option value="" className="bg-gray-800 text-white">Select a domain...</option>
                            {researchDomains.map((domain) => (
                              <option key={domain} value={domain} className="bg-gray-800 text-white">
                                {domain}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Success Rate Display */}
                      {selectedDomain1 && selectedDomain2 && selectedDomain1 !== selectedDomain2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-4"
                        >
                          {/* Success Rate Card */}
                          <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-600">
                            <CardContent className="p-6">
                              <div className="text-center space-y-4">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <Network className="h-6 w-6 text-cyan-400" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-white">
                                    Collaboration Analysis
                                  </h3>
                                </div>
                                
                                <div className="text-center">
                                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                                    {currentSuccessRate}%
                                  </div>
                                  <div className="text-lg text-gray-300 mb-4">
                                    Success Rate
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {selectedDomain1} × {selectedDomain2}
                                  </div>
                                </div>

                                {/* Success Rate Bar */}
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                  <motion.div
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentSuccessRate}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>

                                {/* Analysis Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                      {currentSuccessRate >= 80 ? 'High' : currentSuccessRate >= 60 ? 'Medium' : 'Low'}
                                    </div>
                                    <div className="text-sm text-gray-400">Synergy Level</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                      {Math.floor(Math.random() * 15) + 5}
                                    </div>
                                    <div className="text-sm text-gray-400">Active Projects</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                      {Math.floor(Math.random() * 10) + 2}
                                    </div>
                                    <div className="text-sm text-gray-400">Years of Collaboration</div>
                                  </div>
                                </div>

                                {/* Recommendations */}
                                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                                  <h4 className="text-lg font-semibold text-white mb-2">Recommendations</h4>
                                  <div className="text-sm text-gray-300 space-y-1">
                                    {currentSuccessRate >= 80 ? (
                                      <>
                                        <div>• Strong synergy - prioritize funding for joint projects</div>
                                        <div>• Consider expanding collaboration scope</div>
                                        <div>• Share best practices with other domain pairs</div>
                                      </>
                                    ) : currentSuccessRate >= 60 ? (
                                      <>
                                        <div>• Moderate synergy - focus on targeted collaborations</div>
                                        <div>• Identify specific research areas for joint work</div>
                                        <div>• Monitor progress and adjust strategies</div>
                                      </>
                                    ) : (
                                      <>
                                        <div>• Lower synergy - explore alternative approaches</div>
                                        <div>• Consider indirect collaboration through shared resources</div>
                                        <div>• Focus on individual domain strengths</div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Instructions */}
                      {(!selectedDomain1 || !selectedDomain2 || selectedDomain1 === selectedDomain2) && (
                        <div className="text-center py-8">
                          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                            <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-white mb-2">Select Two Domains</h3>
                            <p className="text-gray-400">
                              Choose two different research domains from the dropdowns above to analyze their collaboration success rate and synergy potential.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Network className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">24</div>
                          <div className="text-sm text-gray-400">Active Collaborations</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Target className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">78%</div>
                          <div className="text-sm text-gray-400">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">18</div>
                          <div className="text-sm text-gray-400">Potential Partnerships</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-transparent border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Activity className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">85%</div>
                          <div className="text-sm text-gray-400">Avg. Synergy Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
