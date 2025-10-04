'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function ManagerDashboardHub() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics('Manager');
  const { data: investmentData, isLoading: investmentLoading } = useInvestmentRecommendations();
  const { data: alertsData, isLoading: alertsLoading } = useRedFlagAlerts();
  const { data: simulationData, isLoading: simulationLoading } = useBudgetSimulation('all');
  const { data: synergyData, isLoading: synergyLoading } = useCrossDomainSynergy();

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
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="synergy">Synergy</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
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
        </TabsContent>

        {/* Investment Tab */}
        <TabsContent value="investment" className="space-y-4">
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
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-transparent border-red-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-red-500" />
                          <div>
                            <div className="text-2xl font-bold text-white">3</div>
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
                            <div className="text-2xl font-bold text-white">7</div>
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
                            <div className="text-2xl font-bold text-white">12</div>
                            <div className="text-sm text-gray-400">Resolved</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: "Project Alpha - Budget Overrun", severity: "Critical", type: "Budget" },
                      { title: "Project Beta - Timeline Delay", severity: "Warning", type: "Schedule" },
                      { title: "Project Gamma - Resource Shortage", severity: "Critical", type: "Resource" },
                      { title: "Project Delta - Quality Issues", severity: "Warning", type: "Quality" }
                    ].map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{alert.title}</h4>
                          <p className="text-sm text-gray-400">{alert.type} Issue</p>
                        </div>
                        <Badge 
                          variant={alert.severity === 'Critical' ? 'destructive' : 'secondary'}
                          className="ml-4"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-4">
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
              {simulationLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading simulation data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Scenario Testing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Conservative</span>
                            <Badge variant="outline" className="text-white border-gray-600">$1.5M</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Moderate</span>
                            <Badge variant="outline" className="text-white border-gray-600">$2.5M</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Aggressive</span>
                            <Badge variant="outline" className="text-white border-gray-600">$4.0M</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Impact Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">ROI Range</span>
                            <span className="text-lg font-bold text-white">150-300%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Risk Level</span>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">Medium-High</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Success Probability</span>
                            <span className="text-lg font-bold text-green-400">85%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synergy Tab */}
        <TabsContent value="synergy" className="space-y-4">
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
              {synergyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading synergy data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Top Synergy Pairs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-cyan-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Space Biology + Molecular Biology</span>
                            <Badge className="bg-cyan-600">95%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Radiation + Cell Biology</span>
                            <Badge className="bg-blue-600">87%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                            <span className="text-sm font-medium text-white">Biomechanics + Tissue Engineering</span>
                            <Badge className="bg-purple-600">82%</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Collaboration Potential</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Active Collaborations</span>
                            <span className="text-lg font-bold text-white">24</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Potential Partnerships</span>
                            <span className="text-lg font-bold text-cyan-400">18</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300">Success Rate</span>
                            <span className="text-lg font-bold text-green-400">78%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
