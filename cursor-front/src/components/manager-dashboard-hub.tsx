'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PiggyBank, 
  AlertTriangle, 
  Calculator, 
  Network,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboardHub() {
  const features = [
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Real-time research analytics, domain insights, and project metrics',
      icon: BarChart3,
      href: '/manager/analytics',
      color: 'text-blue-500',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-600',
      stats: ['Total Projects', 'Funding Overview', 'ROI Analysis', 'Domain Distribution']
    },
    {
      id: 'investment',
      title: 'Investment Recommendations',
      description: 'Strategic funding allocation based on ROI and impact analysis',
      icon: PiggyBank,
      href: '/manager/investment',
      color: 'text-green-500',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600',
      stats: ['Primary Recommendations', 'Balance Optimization', 'Financial Impact', 'ROI Projections']
    },
    {
      id: 'alerts',
      title: 'Red Flag Alerts',
      description: 'Critical alerts for project risks and performance issues',
      icon: AlertTriangle,
      href: '/manager/alerts',
      color: 'text-red-500',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600',
      stats: ['Critical Alerts', 'Warning Levels', 'Risk Assessment', 'Action Plans']
    },
    {
      id: 'simulation',
      title: 'Budget Simulation',
      description: 'Test funding scenarios and analyze their impact on research outcomes',
      icon: Calculator,
      href: '/manager/simulation',
      color: 'text-purple-500',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-600',
      stats: ['Scenario Testing', 'Impact Analysis', 'ROI Modeling', 'Risk Evaluation']
    },
    {
      id: 'synergy',
      title: 'Synergy Analysis',
      description: 'Identify collaboration opportunities between research domains',
      icon: Network,
      href: '/manager/synergy',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-600',
      stats: ['Cross-Domain Pairs', 'Collaboration Potential', 'Similarity Analysis', 'Partnership Opportunities']
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Manager Dashboard</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Comprehensive research management tools for strategic decision-making and portfolio optimization
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card 
              key={feature.id}
              className={`bg-transparent border-gray-700 hover:${feature.borderColor} transition-all duration-300 hover:scale-105 group`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${feature.bgColor} ${feature.borderColor} border`}>
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-white group-hover:text-gray-200 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {feature.stats.map((stat, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-gray-800 text-gray-300 border-gray-600"
                      >
                        {stat}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Link href={feature.href}>
                  <Button className="w-full group-hover:bg-opacity-90 transition-all duration-300">
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-gray-300">
            Common management tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/manager/alerts">
              <Button variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Check Alerts
              </Button>
            </Link>
            <Link href="/manager/investment">
              <Button variant="outline" className="w-full border-green-600 text-green-400 hover:bg-green-900/20">
                <PiggyBank className="h-4 w-4 mr-2" />
                Review Investments
              </Button>
            </Link>
            <Link href="/manager/simulation">
              <Button variant="outline" className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20">
                <Calculator className="h-4 w-4 mr-2" />
                Run Simulation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
