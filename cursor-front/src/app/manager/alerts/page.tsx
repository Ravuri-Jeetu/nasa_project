'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, AlertCircle, AlertOctagon } from 'lucide-react';
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

  const getAlertIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Transform RedFlagAlert to match the expected format
  const transformedAlerts = alerts.map(alert => ({
    ...alert,
    level: alert.alert_level,
    title: `Alert in ${alert.domain}`,
    description: `${alert.importance} - ${alert.recent_studies} recent studies, ${alert.total_studies} total`,
    project: alert.domain,
    domain: alert.domain,
    impact: alert.urgency,
    timestamp: new Date().toISOString()
  }));

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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              Red Flag Alerts
            </h1>
            <p className="text-gray-600 mt-2">
              Critical alerts and warnings for project risks and performance issues
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </Button>
        </div>

        {/* Alerts Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-red-900/20 border-red-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertOctagon className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {alerts.filter(alert => alert.alert_level.toLowerCase() === 'critical').length}
                  </div>
                  <div className="text-sm text-red-300">Critical Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-900/20 border-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {alerts.filter(alert => alert.alert_level.toLowerCase() === 'high').length}
                  </div>
                  <div className="text-sm text-orange-300">High Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-900/20 border-yellow-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {alerts.filter(alert => alert.alert_level.toLowerCase() === 'medium').length}
                  </div>
                  <div className="text-sm text-yellow-300">Medium Priority</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="bg-transparent border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Active Alerts</CardTitle>
            <CardDescription className="text-gray-400">
              All current alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transformedAlerts.length > 0 ? (
              <div className="space-y-4">
                {transformedAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    alert.level.toLowerCase() === 'critical' 
                      ? 'bg-red-900/20 border-red-600' 
                      : alert.level.toLowerCase() === 'high'
                      ? 'bg-orange-900/20 border-orange-600'
                      : 'bg-yellow-900/20 border-yellow-600'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert.level)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{alert.title}</h3>
                            <Badge variant={getAlertBadgeVariant(alert.level)}>
                              {alert.level}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Project: {alert.project}</span>
                            <span>Domain: {alert.domain}</span>
                            {alert.impact && <span>Impact: {alert.impact}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Active Alerts</h3>
                <p className="text-gray-500">
                  All systems are running smoothly. No critical issues detected.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
