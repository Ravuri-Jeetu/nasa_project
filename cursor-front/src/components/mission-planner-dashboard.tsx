'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  MapPin,
  Zap,
  Activity,
  Gauge
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface MissionPlannerDashboardProps {
  role: string;
}

export default function MissionPlannerDashboard({ role }: MissionPlannerDashboardProps) {
  const [selectedMission, setSelectedMission] = useState('mars-exploration');

  // Mock data for Mission Risk Assessment
  const riskData = [
    { category: 'Technical', risk: 25, mitigation: 75, impact: 'High' },
    { category: 'Environmental', risk: 40, mitigation: 60, impact: 'Medium' },
    { category: 'Human Factors', risk: 30, mitigation: 70, impact: 'High' },
    { category: 'Resource', risk: 20, mitigation: 80, impact: 'Low' },
    { category: 'Timeline', risk: 35, mitigation: 65, impact: 'Medium' }
  ];

  // Mock data for Resource Planning
  const resourceData = [
    { resource: 'Personnel', allocated: 45, required: 60, cost: 2500000 },
    { resource: 'Equipment', allocated: 80, required: 85, cost: 5000000 },
    { resource: 'Fuel', allocated: 70, required: 75, cost: 1200000 },
    { resource: 'Supplies', allocated: 90, required: 95, cost: 800000 },
    { resource: 'Communication', allocated: 95, required: 100, cost: 600000 }
  ];

  // Mock data for Mission Design
  const missionPhases = [
    { phase: 'Pre-Launch', duration: 180, status: 'Completed', progress: 100 },
    { phase: 'Launch', duration: 1, status: 'In Progress', progress: 75 },
    { phase: 'Transit', duration: 210, status: 'Planned', progress: 0 },
    { phase: 'Mars Orbit', duration: 30, status: 'Planned', progress: 0 },
    { phase: 'Surface Operations', duration: 500, status: 'Planned', progress: 0 },
    { phase: 'Return Journey', duration: 210, status: 'Planned', progress: 0 }
  ];

  const pieData = [
    { name: 'Personnel', value: 25, color: '#3B82F6' },
    { name: 'Equipment', value: 40, color: '#10B981' },
    { name: 'Fuel', value: 15, color: '#F59E0B' },
    { name: 'Supplies', value: 12, color: '#EF4444' },
    { name: 'Communication', value: 8, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center text-white">
            <Rocket className="h-8 w-8 mr-3 text-purple-600" />
            Mission Planner Dashboard
          </h1>
          <p className="text-gray-600">
            Strategic mission planning, risk assessment, and resource optimization
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            Mission Planner Mode
          </Badge>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="h-4 w-4 mr-2" />
            Configure Mission
          </Button>
        </div>
      </div>

      {/* Mission Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Active Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={selectedMission === 'mars-exploration' ? 'default' : 'outline'}
              onClick={() => setSelectedMission('mars-exploration')}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mars Exploration Mission
            </Button>
            <Button
              variant={selectedMission === 'lunar-base' ? 'default' : 'outline'}
              onClick={() => setSelectedMission('lunar-base')}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Lunar Base Construction
            </Button>
            <Button
              variant={selectedMission === 'asteroid-mining' ? 'default' : 'outline'}
              onClick={() => setSelectedMission('asteroid-mining')}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Asteroid Mining Mission
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="risk-assessment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risk-assessment" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="resource-planning" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Resource Planning
          </TabsTrigger>
          <TabsTrigger value="mission-design" className="flex items-center">
            <Rocket className="h-4 w-4 mr-2" />
            Mission Design & Architecture
          </TabsTrigger>
        </TabsList>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk-assessment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Mission Risk Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive risk assessment for {selectedMission.replace('-', ' ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="risk" fill="#EF4444" name="Risk Level" />
                    <Bar dataKey="mitigation" fill="#10B981" name="Mitigation" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-orange-500" />
                  Risk Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskData.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-white">{risk.category}</h3>
                        <Badge 
                          variant={risk.impact === 'High' ? 'destructive' : 
                                  risk.impact === 'Medium' ? 'default' : 'secondary'}
                        >
                          {risk.impact} Impact
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Risk Level: {risk.risk}%</span>
                          <span>Mitigation: {risk.mitigation}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${risk.risk}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Mitigation Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Risk Mitigation Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-transparent">
                  <h4 className="font-semibold text-white mb-2">Technical Risks</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Redundant systems implementation</li>
                    <li>• Extensive testing protocols</li>
                    <li>• Backup communication systems</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-transparent">
                  <h4 className="font-semibold text-white mb-2">Environmental Risks</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Radiation shielding systems</li>
                    <li>• Dust storm monitoring</li>
                    <li>• Temperature regulation</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-transparent">
                  <h4 className="font-semibold text-white mb-2">Human Factors</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Psychological support systems</li>
                    <li>• Medical emergency protocols</li>
                    <li>• Crew rotation planning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Planning Tab */}
        <TabsContent value="resource-planning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Resource Allocation
                </CardTitle>
                <CardDescription>
                  Current resource allocation vs requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resource" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                    <Bar dataKey="required" fill="#EF4444" name="Required" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Breakdown */}
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                Budget Breakdown
              </CardTitle>
                <CardDescription>
                  Total mission budget: $10.1M
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resource Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Resource Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceData.map((resource, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg text-white">{resource.resource}</h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Cost: ${resource.cost.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">
                          Gap: {resource.required - resource.allocated}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Allocated: {resource.allocated}%</span>
                        <span>Required: {resource.required}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            resource.allocated >= resource.required ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${resource.allocated}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Design & Architecture Tab */}
        <TabsContent value="mission-design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Mission Timeline
                </CardTitle>
                <CardDescription>
                  Mission phases and progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missionPhases.map((phase, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          phase.status === 'Completed' ? 'bg-green-500' :
                          phase.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-white">{phase.phase}</h3>
                          <Badge variant={
                            phase.status === 'Completed' ? 'default' :
                            phase.status === 'In Progress' ? 'secondary' : 'outline'
                          }>
                            {phase.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Duration: {phase.duration} days
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              phase.status === 'Completed' ? 'bg-green-500' :
                              phase.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mission Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-500" />
                  Mission Architecture
                </CardTitle>
                <CardDescription>
                  System components and dependencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-transparent">
                    <h4 className="font-semibold text-white mb-2">Launch Vehicle</h4>
                    <div className="text-sm text-blue-700">
                      <div>• Heavy-lift rocket system</div>
                      <div>• Payload capacity: 50,000 kg</div>
                      <div>• Reliability: 98.5%</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">Spacecraft</h4>
                    <div className="text-sm text-green-700">
                      <div>• Crew module: 6 astronauts</div>
                      <div>• Life support: 500 days</div>
                      <div>• Radiation shielding: 5cm</div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-purple-800 mb-2">Surface Systems</h4>
                    <div className="text-sm text-purple-700">
                      <div>• Habitat module: 200m²</div>
                      <div>• Power: Solar + nuclear</div>
                      <div>• Mobility: Rover + EVA suits</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Mission Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">98.5%</div>
                  <div className="text-sm text-gray-600">Mission Success Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,131</div>
                  <div className="text-sm text-gray-600">Total Mission Days</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$10.1M</div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">6</div>
                  <div className="text-sm text-gray-600">Crew Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
