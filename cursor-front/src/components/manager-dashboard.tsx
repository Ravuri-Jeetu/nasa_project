'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { usePapers, useAnalytics } from '@/api/hooks';
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
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import DynamicManagerDashboard from './dynamic-manager-dashboard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ManagerDashboard() {
  const { role, selectedPaperIds, addSelectedPaperId, removeSelectedPaperId } = useAppStore();
  const { data: papers, isLoading: papersLoading } = usePapers(role);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(role);
  
  const [investmentAmount, setInvestmentAmount] = useState(1000000);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12m');
  const [useDynamicView, setUseDynamicView] = useState(false);

  // Mock data for charts
  const fundingVsReturn = [
    { funding: 50000, return: 120000, project: 'AI Research' },
    { funding: 75000, return: 180000, project: 'ML Platform' },
    { funding: 100000, return: 250000, project: 'Data Analytics' },
    { funding: 125000, return: 300000, project: 'Quantum Computing' },
    { funding: 150000, return: 400000, project: 'Biotech AI' },
    { funding: 200000, return: 600000, project: 'Robotics' },
  ];

  const revenueTrends = [
    { month: 'Jan', revenue: 120000, profit: 45000 },
    { month: 'Feb', revenue: 135000, profit: 52000 },
    { month: 'Mar', revenue: 148000, profit: 58000 },
    { month: 'Apr', revenue: 162000, profit: 65000 },
    { month: 'May', revenue: 175000, profit: 72000 },
    { month: 'Jun', revenue: 189000, profit: 78000 },
  ];

  const projectAllocation = [
    { name: 'AI Research', value: 35, funding: 350000 },
    { name: 'ML Platform', value: 25, funding: 250000 },
    { name: 'Data Analytics', value: 20, funding: 200000 },
    { name: 'Quantum Computing', value: 15, funding: 150000 },
    { name: 'Biotech AI', value: 5, funding: 50000 },
  ];

  const marketTrends = [
    { category: 'AI/ML', growth: 15.2, marketSize: 1200000000 },
    { category: 'Quantum Computing', growth: 8.7, marketSize: 450000000 },
    { category: 'Biotech AI', growth: 12.4, marketSize: 800000000 },
    { category: 'Robotics', growth: 6.8, marketSize: 600000000 },
    { category: 'Edge Computing', growth: 18.9, marketSize: 300000000 },
  ];

  const topPerformers = papers?.slice(0, 5).map(paper => ({
    title: paper.title,
    roi: paper.funding && paper.return ? ((paper.return - paper.funding) / paper.funding) * 100 : 0,
    funding: paper.funding || 0,
    return: paper.return || 0,
    link: paper.link,
  })) || [];

  const calculateROI = (funding: number, returnValue: number) => {
    return ((returnValue - funding) / funding) * 100;
  };

  const getROIColor = (roi: number) => {
    if (roi > 200) return 'text-green-600';
    if (roi > 100) return 'text-blue-600';
    if (roi > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // If dynamic view is enabled, render the dynamic dashboard
  if (useDynamicView) {
    return <DynamicManagerDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Business intelligence and investment analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={useDynamicView ? "default" : "outline"}
            onClick={() => setUseDynamicView(!useDynamicView)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {useDynamicView ? "Switch to Static View" : "Switch to Dynamic View"}
          </Button>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {selectedPaperIds.length} projects selected
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">
              +18% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">187%</div>
            <p className="text-xs text-muted-foreground">
              +12% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              5 new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +3 new hires
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
          <TabsTrigger value="investment">Investment Tools</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue and profit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                    <Area type="monotone" dataKey="profit" stackId="2" stroke="#10B981" fill="#10B981" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>
                  Top performing projects by ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((project, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {project.title}
                          </a>
                        </p>
                        <p className="text-xs text-gray-500">
                          ${project.funding.toLocaleString()} → ${project.return.toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getROIColor(project.roi)} self-start sm:self-center`}
                      >
                        {project.roi.toFixed(1)}% ROI
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Correlation Analysis Tab */}
        <TabsContent value="correlation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Funding vs Return Correlation</CardTitle>
                <CardDescription>
                  Scatter plot showing relationship between investment and returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={fundingVsReturn}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="funding" name="Funding ($)" />
                    <YAxis dataKey="return" name="Return ($)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="return" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Growth Analysis</CardTitle>
                <CardDescription>
                  Growth rates across different technology categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="growth" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Tools Tab */}
        <TabsContent value="investment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Allocation</CardTitle>
                <CardDescription>
                  Current distribution of research investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Calculator</CardTitle>
                <CardDescription>
                  Project ROI based on historical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Investment Amount</label>
                    <input
                      type="range"
                      min="100000"
                      max="5000000"
                      step="100000"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$100K</span>
                      <span className="font-medium">${investmentAmount.toLocaleString()}</span>
                      <span>$5M</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Timeframe</label>
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="6m">6 Months</option>
                      <option value="12m">12 Months</option>
                      <option value="24m">24 Months</option>
                      <option value="36m">36 Months</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Projected Returns</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Conservative:</span>
                        <span className="font-medium">${(investmentAmount * 1.5).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Moderate:</span>
                        <span className="font-medium">${(investmentAmount * 2.2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Optimistic:</span>
                        <span className="font-medium">${(investmentAmount * 3.1).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Allocation Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation Heatmap</CardTitle>
              <CardDescription>
                Visual representation of resource distribution across projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {projectAllocation.map((project, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ 
                        backgroundColor: COLORS[index % COLORS.length],
                        opacity: project.value / 100 + 0.3
                      }}
                    >
                      {project.value}%
                    </div>
                    <p className="text-xs mt-2 font-medium">{project.name}</p>
                    <p className="text-xs text-gray-500">${project.funding.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Size vs Growth</CardTitle>
                <CardDescription>
                  Bubble chart showing market opportunity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="marketSize" name="Market Size ($)" />
                    <YAxis dataKey="growth" name="Growth (%)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="growth" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>
                  Market positioning and competitive landscape
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.map((trend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{trend.category}</h3>
                          <p className="text-sm text-gray-600">
                            Market Size: ${(trend.marketSize / 1000000).toFixed(0)}M
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={trend.growth > 15 ? 'default' : trend.growth > 10 ? 'secondary' : 'outline'}
                            className="mb-2"
                          >
                            {trend.growth}% Growth
                          </Badge>
                          <p className="text-xs text-gray-500">High Opportunity</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
