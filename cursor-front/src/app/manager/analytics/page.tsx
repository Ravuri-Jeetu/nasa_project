'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import ManagerNavigation from '@/components/manager-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, 
  RefreshCw, Target, Activity, Users, Briefcase, BarChart3
} from 'lucide-react';
import { 
  type DomainAnalytics,
  type EmergingArea,
  type ProjectStatus,
  fetchDomainAnalytics,
  fetchEmergingAreas,
  fetchProjectStatus,
  refreshManagerData
} from '@/api/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [domainAnalytics, setDomainAnalytics] = useState<DomainAnalytics | null>(null);
  const [emergingAreas, setEmergingAreas] = useState<EmergingArea[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analytics, areas, status] = await Promise.all([
        fetchDomainAnalytics(),
        fetchEmergingAreas(),
        fetchProjectStatus()
      ]);

      setDomainAnalytics(analytics);
      setEmergingAreas(areas);
      setProjectStatus(status);
    } catch (error) {
      console.error('Error loading analytics data:', error);
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
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
    <MainLayout>
      <ManagerNavigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Real-time research analytics and domain insights
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
              <div className="text-2xl font-bold text-white">{domainAnalytics?.total_projects || 0}</div>
              <p className="text-xs text-gray-500">
                {domainAnalytics?.total_projects_change > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{domainAnalytics.total_projects_change}% from last month
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {domainAnalytics?.total_projects_change || 0}% from last month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${(domainAnalytics?.total_funding || 0).toLocaleString()}</div>
              <p className="text-xs text-gray-500">
                {domainAnalytics?.funding_change > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{domainAnalytics.funding_change}% from last month
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {domainAnalytics?.funding_change || 0}% from last month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(domainAnalytics?.overall_roi || 0).toFixed(2)}%</div>
              <p className="text-xs text-gray-500">
                {domainAnalytics?.roi_change > 0 ? (
                  <span className="text-green-500 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{domainAnalytics.roi_change}% from last month
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {domainAnalytics?.roi_change || 0}% from last month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Object.keys(domainAnalytics?.domains.counts || {}).length}</div>
              <p className="text-xs text-gray-500">
                <span className="text-green-500">
                  {domainAnalytics?.new_domains_this_month || 0} new this month
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research Domain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Research Domain Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Distribution of projects across different research domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={domainChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ domain, percentage }) => `${domain} (${percentage.toFixed(1)}%)`}
                >
                  {domainChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                  itemStyle={{ color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emerging Areas and Project Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emerging Research Areas */}
          <Card className="bg-transparent border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Emerging Research Areas</CardTitle>
              <CardDescription className="text-gray-400">
                Top trending research domains with high growth potential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergingAreas.length > 0 ? (
                emergingAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{area.domain}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      +{area.growth_rate}% Growth
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No emerging areas identified.</p>
              )}
            </CardContent>
          </Card>

          {/* Project Status Overview */}
          <Card className="bg-transparent border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Project Status Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Current status of all active research projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectStatus ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Active Projects:</span>
                    <Badge variant="secondary">{projectStatus.total_active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Completed Projects:</span>
                    <Badge variant="secondary">{projectStatus.total_completed}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Status Distribution:</h4>
                    {Object.entries(projectStatus.status_percentages).map(([status, percentage]) => (
                      <div key={status} className="flex justify-between items-center text-sm text-gray-400">
                        <span>{status}:</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No project status data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
