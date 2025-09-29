'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, 
  RefreshCw, Target, Activity, Users, Briefcase 
} from 'lucide-react';
import { 
  fetchDomainAnalytics, 
  fetchInvestmentRecommendations, 
  fetchRedFlagAlerts,
  fetchBudgetSimulation,
  fetchEmergingAreas,
  fetchProjectStatus,
  refreshManagerData,
  type DomainAnalytics,
  type InvestmentRecommendation,
  type RedFlagAlert,
  type BudgetSimulation,
  type EmergingArea,
  type ProjectStatus
} from '@/api/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DynamicManagerDashboard() {
  const [domainAnalytics, setDomainAnalytics] = useState<DomainAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation | null>(null);
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [emergingAreas, setEmergingAreas] = useState<EmergingArea[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('Plants');
  const [budgetAdjustment, setBudgetAdjustment] = useState(0);
  const [simulation, setSimulation] = useState<BudgetSimulation | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        analytics,
        recs,
        alertData,
        areas,
        status
      ] = await Promise.all([
        fetchDomainAnalytics(),
        fetchInvestmentRecommendations(),
        fetchRedFlagAlerts(),
        fetchEmergingAreas(),
        fetchProjectStatus()
      ]);

      setDomainAnalytics(analytics);
      setRecommendations(recs);
      setAlerts(alertData);
      setEmergingAreas(areas);
      setProjectStatus(status);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshManagerData();
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBudgetSimulation = async () => {
    try {
      const result = await fetchBudgetSimulation(selectedDomain, budgetAdjustment);
      setSimulation(result);
    } catch (error) {
      console.error('Error running simulation:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedDomain && budgetAdjustment !== 0) {
      handleBudgetSimulation();
    }
  }, [selectedDomain, budgetAdjustment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const domainChartData = domainAnalytics ? Object.entries(domainAnalytics.domains.counts).map(([domain, count]) => ({
    domain,
    count,
    percentage: domainAnalytics.domains.percentages[domain] || 0
  })) : [];

  const fundingData = domainAnalytics ? Object.entries(domainAnalytics.domains.funding).map(([domain, data]) => ({
    domain,
    funding: data.sum || 0,
    roi: domainAnalytics.domains.roi[domain]?.mean || 0
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-gray-600">
            Real-time research analytics and investment recommendations
            {domainAnalytics?.last_updated && (
              <span className="ml-2 text-sm">
                Last updated: {new Date(domainAnalytics.last_updated).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainAnalytics?.total_projects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {domainChartData.length} research domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStatus?.total_active || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStatus?.total_completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red Flag Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Critical gaps identified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Distribution and Investment Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Research Domain Distribution</CardTitle>
            <CardDescription>Current funding allocation across research areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={domainChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ domain, percentage }) => `${domain}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {domainChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Recommendations - Dark Style from manager.py */}
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <DollarSign className="h-5 w-5" />
              Investment Recommendations
            </CardTitle>
            <CardDescription className="text-gray-300">AI-powered funding optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations && (
              <>
                {/* Dark Styled Recommendation Card */}
                <div className="border-2 border-gray-600 p-5 rounded-2xl bg-gray-800 shadow-lg">
                  <h3 className="text-cyan-400 text-lg font-semibold mb-3">💡 Recommendation</h3>
                  <p className="text-gray-100 text-base leading-relaxed">
                    Invest more in <span className="text-yellow-400 font-bold">{recommendations.primary_recommendation.domain}</span> studies
                    (<span className="font-bold">{recommendations.primary_recommendation.current_studies}</span> studies in the last 5 years).
                  </p>
                  <Button className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-cyan-400/50 transition-all duration-300">
                    View Supporting Data →
                  </Button>
                </div>

                {/* Supporting Data Table */}
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-semibold mb-3">📊 Supporting Data Preview</h4>
                  <div className="text-sm text-gray-200">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="font-medium">Domain</span>
                      <span className="font-medium">Studies (5yr)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>{recommendations.primary_recommendation.domain}</span>
                      <span className="text-cyan-400">{recommendations.primary_recommendation.current_studies}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>{recommendations.balance_recommendation.domain}</span>
                      <span className="text-orange-400">{recommendations.balance_recommendation.current_studies}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Red Flag Alerts - Dark Style from manager.py */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Red Flag Alerts
          </CardTitle>
          <CardDescription className="text-gray-300">Critical research gaps requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Specific alerts from manager.py */}
          <div className="space-y-4">
            <div className="bg-gray-800 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">⚠</span>
                <div>
                  <p className="text-gray-100 text-sm">
                    Only <span className="text-yellow-400 font-bold">3 studies</span> in the last decade on
                    <span className="text-cyan-400 font-bold"> radiation effect on food supply</span>.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Critical for long-duration space missions</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠</span>
                <div>
                  <p className="text-gray-100 text-sm">
                    <span className="text-red-400 font-bold">Crew psychology</span> under-studied:
                    <span className="text-yellow-400 font-bold"> &lt;5 papers</span> in the last 7 years.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Essential for crew mental health on long missions</p>
                </div>
              </div>
            </div>

            {/* Dynamic alerts from API */}
            {alerts.map((alert, index) => (
              <div key={index} className="bg-gray-800 border-l-4 border-orange-400 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-orange-400 text-xl">⚠</span>
                  <div>
                    <p className="text-gray-100 text-sm">
                      <span className="text-orange-400 font-bold">{alert.domain}</span> research gap:
                      <span className="text-yellow-400 font-bold"> {alert.recent_studies} studies</span> in the last 7 years.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{alert.importance}</p>
                    <div className="mt-2 text-xs text-gray-300">
                      <div>Threshold: {alert.threshold} studies</div>
                      <div>Suggested increase: +{alert.suggested_increase} studies</div>
                      <div>Estimated cost: ${alert.estimated_cost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Emerging Research Areas - Dark Style from manager.py */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <TrendingUp className="h-5 w-5" />
            Top 3 Emerging Research Areas
          </CardTitle>
          <CardDescription className="text-gray-300">High-potential research areas with growth opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
              <span className="text-2xl">🧫</span>
              <div>
                <h4 className="text-yellow-400 font-bold text-lg">Microbes in spacecraft</h4>
                <p className="text-gray-300 text-sm">
                  <span className="text-gray-400">→</span> high growth potential, low current funding
                </p>
                <p className="text-xs text-gray-500 mt-1">Critical for understanding microbial behavior in space environments</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
              <span className="text-2xl">☢</span>
              <div>
                <h4 className="text-red-400 font-bold text-lg">Radiation shielding materials</h4>
                <p className="text-gray-300 text-sm">
                  <span className="text-gray-400">→</span> critical for long missions
                </p>
                <p className="text-xs text-gray-500 mt-1">Essential for protecting astronauts on deep space missions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
              <span className="text-2xl">🌱</span>
              <div>
                <h4 className="text-green-400 font-bold text-lg">Plant growth in zero-G</h4>
                <p className="text-gray-300 text-sm">
                  <span className="text-gray-400">→</span> direct impact on food sustainability
                </p>
                <p className="text-xs text-gray-500 mt-1">Key to establishing sustainable life support systems</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Simulation - Enhanced from manager.py */}
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Target className="h-5 w-5" />
            Budget Simulation
          </CardTitle>
          <CardDescription className="text-gray-300">Test different funding scenarios and see their impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Baseline Publications Table */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-cyan-400 text-lg font-semibold mb-3">📊 Baseline Publications (Current)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-white">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 border border-gray-600">Domain</th>
                    <th className="p-2 border border-gray-600">Publications</th>
                    <th className="p-2 border border-gray-600">Recent (5yr)</th>
                  </tr>
                </thead>
                <tbody>
                  {domainChartData.map((item) => (
                    <tr 
                      key={item.domain} 
                      className={`${item.domain === selectedDomain ? 'bg-blue-900 font-bold' : ''} hover:bg-gray-700`}
                    >
                      <td className="p-2 border border-gray-600">{item.domain}</td>
                      <td className="p-2 border border-gray-600">{item.count}</td>
                      <td className="p-2 border border-gray-600 text-cyan-400">
                        {domainAnalytics?.domains.recent_counts[item.domain] || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-200">Select Domain</label>
                <select 
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                >
                  {domainChartData.map((item) => (
                    <option key={item.domain} value={item.domain}>
                      {item.domain} ({item.count} studies)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-200">
                  Adjust Funding: {budgetAdjustment}%
                </label>
                <Slider
                  value={[budgetAdjustment]}
                  onValueChange={(value) => setBudgetAdjustment(value[0])}
                  min={-50}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>-50%</span>
                  <span>0%</span>
                  <span>+100%</span>
                </div>
              </div>
            </div>

            {simulation && (
              <div className="space-y-4">
                {/* Projection Card - Dark Style from manager.py */}
                <div className="border-2 border-gray-600 p-5 rounded-2xl bg-gray-800 shadow-lg">
                  <h3 className="text-cyan-400 text-lg font-semibold mb-3">📐 Budget Simulation</h3>
                  <p className="text-gray-100 text-base mb-3">
                    If you adjust funding for <span className="text-yellow-400 font-bold">{simulation.domain}</span> by
                    <span className="text-green-400 font-bold"> {simulation.adjustment_percentage}%</span>:
                  </p>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-gray-100 text-sm">
                      📊 Projected publications → 
                      <span className="font-bold"> {simulation.current.studies}</span> → 
                      <span className="text-cyan-400 font-bold"> {simulation.projected.studies}</span>
                      <span className={simulation.impact.study_difference > 0 ? 'text-green-400' : 'text-red-400'}>
                        ({simulation.impact.study_difference > 0 ? '+' : ''}{simulation.impact.study_difference})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Additional Impact Details */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-cyan-400 font-semibold mb-2">Impact Analysis</h4>
                  <div className="space-y-2 text-sm text-gray-200">
                    <div className="flex justify-between">
                      <span>Current Funding:</span>
                      <span>${simulation.current.funding.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Funding:</span>
                      <span className="font-semibold">${simulation.projected.funding.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Funding Difference:</span>
                      <span className={simulation.impact.funding_difference > 0 ? 'text-green-400' : 'text-red-400'}>
                        ${simulation.impact.funding_difference.toLocaleString()}
                      </span>
                    </div>
                    {simulation.impact.additional_investment > 0 && (
                      <div className="flex justify-between">
                        <span>Additional Investment:</span>
                        <span className="text-green-400">${simulation.impact.additional_investment.toLocaleString()}</span>
                      </div>
                    )}
                    {simulation.impact.cost_savings > 0 && (
                      <div className="flex justify-between">
                        <span>Cost Savings:</span>
                        <span className="text-red-400">${simulation.impact.cost_savings.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emerging Areas and Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emerging Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Emerging Research Areas</CardTitle>
            <CardDescription>Fastest growing research domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergingAreas.slice(0, 5).map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">{area.domain}</div>
                    <div className="text-sm text-gray-600">
                      {area.recent_studies} recent studies • {area.total_studies} total
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={area.status === 'GROWING' ? 'default' : 'secondary'}>
                      {area.status}
                    </Badge>
                    <div className="text-sm font-semibold mt-1">
                      {area.growth_score > 0 ? '+' : ''}{area.growth_score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
            <CardDescription>Current project completion status</CardDescription>
          </CardHeader>
          <CardContent>
            {projectStatus && (
              <div className="space-y-4">
                {Object.entries(projectStatus.status_percentages).map(([status, percentage]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{status}</span>
                      <span>{percentage}% ({projectStatus.overall_status[status]} projects)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
