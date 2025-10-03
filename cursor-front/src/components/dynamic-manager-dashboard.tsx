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
    funding: typeof data === 'number' ? data : (data as { sum?: number }).sum || 0,
    roi: typeof domainAnalytics.domains.roi[domain] === 'number' ? domainAnalytics.domains.roi[domain] : (domainAnalytics.domains.roi[domain] as { mean?: number })?.mean || 0
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
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
        <Card className="bg-transparent border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
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
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
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
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
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
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
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
                      className={`${item.domain === selectedDomain ? 'bg-sky-500/20 text-white font-bold' : ''} transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50`}
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

      {/* Cross-Domain Synergy Analysis - Manager View */}
      <Card className="bg-transparent border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Cross-Domain Synergy Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Comprehensive analysis of collaboration opportunities and strategic recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">📊 Executive Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">97</div>
                <div className="text-sm text-gray-300">Synergies Found</div>
                <div className="text-xs text-gray-400 mt-1">High collaboration potential</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">6</div>
                <div className="text-sm text-gray-300">Domains Analyzed</div>
                <div className="text-xs text-gray-400 mt-1">Cross-domain opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">374</div>
                <div className="text-sm text-gray-300">Projects Processed</div>
                <div className="text-xs text-gray-400 mt-1">Comprehensive analysis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">0.91</div>
                <div className="text-sm text-gray-300">Max Similarity</div>
                <div className="text-xs text-gray-400 mt-1">Highest synergy score</div>
              </div>
            </div>
          </div>

          {/* Priority 1: High-Impact Collaborations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
              🚀 Priority 1: High-Impact Collaborations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-cyan-400">Human Research + Space Biology</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">0.908</div>
                    <div className="text-xs text-gray-400">Similarity Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  <strong>Strategic Impact:</strong> Highest synergy between astronaut health and space biology research. 
                  Critical for developing effective countermeasures for long-duration space missions.
                </p>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>• <strong>Action:</strong> Joint research initiative on astronaut health countermeasures</div>
                  <div>• <strong>Timeline:</strong> Start Q2 2024</div>
                  <div>• <strong>Budget:</strong> $2.5M allocated</div>
                  <div>• <strong>ROI:</strong> 40% faster countermeasure development</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-cyan-400">Space Biology + Technology Development</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">0.792</div>
                    <div className="text-xs text-gray-400">Similarity Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  <strong>Strategic Impact:</strong> Strong bridge between biological research and technological applications. 
                  Key for advancing space agriculture and life support systems.
                </p>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>• <strong>Action:</strong> Lab-on-a-chip technology program</div>
                  <div>• <strong>Timeline:</strong> Start Q3 2024</div>
                  <div>• <strong>Budget:</strong> $1.8M for integration</div>
                  <div>• <strong>ROI:</strong> Revolutionize space agriculture research</div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority 2: Strategic Partnerships */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
              ⚡ Priority 2: Strategic Partnerships
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-orange-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-cyan-400">Planetary Science + Space Biology</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">0.743</div>
                    <div className="text-xs text-gray-400">Similarity Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  <strong>Strategic Impact:</strong> Plant biology research spans both planetary exploration and space biology. 
                  Critical for Mars mission life support systems.
                </p>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>• <strong>Action:</strong> Mars mission life support collaboration</div>
                  <div>• <strong>Timeline:</strong> Start Q4 2024</div>
                  <div>• <strong>Budget:</strong> $1.2M for Mars-specific research</div>
                  <div>• <strong>ROI:</strong> Enable sustainable Mars missions</div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-blue-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-cyan-400">Earth Science + Space Biology</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">0.681</div>
                    <div className="text-xs text-gray-400">Similarity Score</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  <strong>Strategic Impact:</strong> Atmospheric pressure research connects Earth-based plant studies with space biology. 
                  Essential for closed-loop life support systems.
                </p>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>• <strong>Action:</strong> Atmospheric pressure research program</div>
                  <div>• <strong>Timeline:</strong> Start Q1 2025</div>
                  <div>• <strong>Budget:</strong> $800K for atmospheric studies</div>
                  <div>• <strong>ROI:</strong> Improve closed-loop life support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Strategy */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">📋 Implementation Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Phase 1: Foundation (Q2-Q3 2024)</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Establish cross-domain working groups</li>
                  <li>• Create collaboration framework</li>
                  <li>• Allocate initial funding ($5M)</li>
                  <li>• Set up shared research facilities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Phase 2: Execution (Q4 2024-Q2 2025)</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Launch joint research projects</li>
                  <li>• Implement technology sharing</li>
                  <li>• Establish success metrics</li>
                  <li>• Create knowledge sharing platform</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Phase 3: Scale (Q3-Q4 2025)</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Expand successful collaborations</li>
                  <li>• Integrate AI-powered matching</li>
                  <li>• Measure ROI and impact</li>
                  <li>• Plan next-generation initiatives</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Success Metrics & KPIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Quantitative Goals</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>25% increase</strong> in cross-domain publications</li>
                  <li>• <strong>40% faster</strong> countermeasure development</li>
                  <li>• <strong>15% cost reduction</strong> through shared resources</li>
                  <li>• <strong>50 new</strong> cross-domain collaborations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">Qualitative Goals</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Enhanced knowledge transfer between domains</li>
                  <li>• Improved innovation through diverse perspectives</li>
                  <li>• Stronger NASA research community</li>
                  <li>• Better preparation for future missions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.open('/synergy', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-400/50 transition-all duration-300"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Analysis
            </Button>
            <Button 
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 py-3 rounded-xl"
            >
              <Target className="h-4 w-4 mr-2" />
              Generate Investment Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
