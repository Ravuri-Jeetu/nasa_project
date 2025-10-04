'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import ManagerNavigation from '@/components/manager-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  AlertTriangle, 
  AlertCircle, 
  AlertOctagon,
  TrendingDown,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { 
  type RedFlagAlert,
  fetchRedFlagAlerts,
  refreshManagerData
} from '@/api/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      const alertData = await fetchRedFlagAlerts();
      setAlerts(alertData);
    } catch (error) {
      console.error('Error loading alerts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshManagerData();
      await loadAlertsData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, []);

  const getSeverityIcon = (alertLevel: string) => {
    switch (alertLevel.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getSeverityColor = (alertLevel: string) => {
    switch (alertLevel.toLowerCase()) {
      case 'critical':
        return 'border-red-600 bg-red-900/20';
      case 'warning':
        return 'border-yellow-600 bg-yellow-900/20';
      case 'info':
        return 'border-blue-600 bg-blue-900/20';
      default:
        return 'border-orange-600 bg-orange-900/20';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ManagerNavigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Red Flag Alerts
            </h1>
            <p className="text-gray-600 mt-2">
              Critical alerts requiring immediate attention for project risks and underperformance
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </Button>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <p className="text-xs text-gray-500">Active alerts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {alerts.filter(alert => alert.alert_level.toLowerCase() === 'critical').length}
              </div>
              <p className="text-xs text-gray-500">Requires immediate action</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {alerts.filter(alert => alert.alert_level.toLowerCase() === 'warning').length}
              </div>
              <p className="text-xs text-gray-500">Monitor closely</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Urgency</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {alerts.filter(alert => alert.urgency.toLowerCase() === 'high').length}
              </div>
              <p className="text-xs text-gray-500">Time-sensitive</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="bg-transparent border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Active Alerts
            </CardTitle>
            <CardDescription className="text-gray-400">
              Detailed information about each alert and recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className={`p-6 rounded-lg border ${getSeverityColor(alert.alert_level)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(alert.alert_level)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {alert.domain} Alert
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getUrgencyColor(alert.urgency)}>
                            {alert.urgency} Urgency
                          </Badge>
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {alert.alert_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Alert #{index + 1}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-300">Recent Studies</span>
                      </div>
                      <div className="text-lg font-bold text-red-400">
                        {alert.recent_studies}
                      </div>
                      <div className="text-xs text-gray-500">
                        Below threshold: {alert.threshold}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-300">Total Studies</span>
                      </div>
                      <div className="text-lg font-bold text-blue-400">
                        {alert.total_studies}
                      </div>
                      <div className="text-xs text-gray-500">
                        All time projects
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-300">Estimated Cost</span>
                      </div>
                      <div className="text-lg font-bold text-green-400">
                        ${alert.estimated_cost?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Required investment
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-300">Suggested Increase</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-400">
                        +{alert.suggested_increase}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Funding adjustment
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Impact Level:</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        {alert.importance}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      This domain requires immediate attention due to declining research activity. 
                      The suggested funding increase of {alert.suggested_increase}% could help restore 
                      research momentum and prevent further decline.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-400 mb-2">All Clear!</h3>
                <p className="text-gray-500">
                  No red flag alerts at this time. All research domains are performing within expected parameters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Resolve All Alerts
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Target className="h-4 w-4 mr-2" />
            Generate Action Plan
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
