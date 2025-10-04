'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, RefreshCw, Target, Activity, Users, Briefcase, BarChart3
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
        <div className="container mx-auto p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Key Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-transparent border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Skeleton */}
          <Card className="bg-transparent border-gray-700">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-gray-700 rounded animate-pulse"></div>
            </CardContent>
          </Card>

          {/* Bottom Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-transparent border-gray-700">
                <CardHeader>
                  <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
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

  return (
    <MainLayout>
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
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active projects across all domains
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${Object.values(domainAnalytics?.domains.funding || {}).reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Total funding across all domains
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(Object.values(domainAnalytics?.domains.roi || {}).reduce((a, b) => a + b, 0) / Object.keys(domainAnalytics?.domains.roi || {}).length || 0).toFixed(2)}%
              </div>
              <p className="text-xs text-gray-500">
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Average ROI across domains
                </span>
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
                  Research domains with active projects
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research Domain Distribution */}
        <Card className="bg-transparent border-gray-700 hover:border-gray-600 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Research Domain Distribution
            </CardTitle>
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
                  label={({ domain, percentage }) => `${domain} (${(percentage as number).toFixed(1)}%)`}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {domainChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="#1F2937"
                      strokeWidth={2}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
                  itemStyle={{ color: '#9CA3AF' }}
                  formatter={(value: number) => [value, 'Projects']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {domainChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-300">{entry.domain}</span>
                </div>
              ))}
            </div>
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
                      +{area.growth_score}% Growth
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
