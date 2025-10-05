'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
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
  Gauge,
  Heart,
  Leaf,
  Bug
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
  const router = useRouter();
  const [selectedMission, setSelectedMission] = useState('mars-exploration');
  const [activeTab, setActiveTab] = useState('risk-assessment');
  const [missionReadinessData, setMissionReadinessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic data for Mission Risk Assessment based on selected mission
  const getRiskData = (mission: string) => {
    const baseData = [
      { category: 'Technical', risk: 25, mitigation: 75, impact: 'High' },
      { category: 'Environmental', risk: 40, mitigation: 60, impact: 'Medium' },
      { category: 'Human Factors', risk: 30, mitigation: 70, impact: 'High' },
      { category: 'Resource', risk: 20, mitigation: 80, impact: 'Low' },
      { category: 'Timeline', risk: 35, mitigation: 65, impact: 'Medium' }
    ];

    switch (mission) {
      case 'mars-exploration':
        return [
          { category: 'Technical', risk: 45, mitigation: 55, impact: 'High' },
          { category: 'Environmental', risk: 60, mitigation: 40, impact: 'High' },
          { category: 'Human Factors', risk: 50, mitigation: 50, impact: 'High' },
          { category: 'Resource', risk: 35, mitigation: 65, impact: 'Medium' },
          { category: 'Timeline', risk: 40, mitigation: 60, impact: 'High' }
        ];
      case 'lunar-base':
        return [
          { category: 'Technical', risk: 30, mitigation: 70, impact: 'Medium' },
          { category: 'Environmental', risk: 35, mitigation: 65, impact: 'Medium' },
          { category: 'Human Factors', risk: 25, mitigation: 75, impact: 'Medium' },
          { category: 'Resource', risk: 15, mitigation: 85, impact: 'Low' },
          { category: 'Timeline', risk: 25, mitigation: 75, impact: 'Medium' }
        ];
      case 'asteroid-mining':
        return [
          { category: 'Technical', risk: 55, mitigation: 45, impact: 'High' },
          { category: 'Environmental', risk: 45, mitigation: 55, impact: 'High' },
          { category: 'Human Factors', risk: 40, mitigation: 60, impact: 'High' },
          { category: 'Resource', risk: 50, mitigation: 50, impact: 'High' },
          { category: 'Timeline', risk: 60, mitigation: 40, impact: 'High' }
        ];
      default:
        return baseData;
    }
  };

  const riskData = getRiskData(selectedMission);

  // Dynamic data for Resource Planning based on selected mission
  const getResourceData = (mission: string) => {
    const baseData = [
      { resource: 'Personnel', allocated: 45, required: 60, cost: 2500000 },
      { resource: 'Equipment', allocated: 80, required: 85, cost: 5000000 },
      { resource: 'Fuel', allocated: 70, required: 75, cost: 1200000 },
      { resource: 'Supplies', allocated: 90, required: 95, cost: 800000 },
      { resource: 'Communication', allocated: 95, required: 100, cost: 600000 }
    ];

    switch (mission) {
      case 'mars-exploration':
        return [
          { resource: 'Personnel', allocated: 30, required: 85, cost: 4500000 },
          { resource: 'Equipment', allocated: 60, required: 95, cost: 8000000 },
          { resource: 'Fuel', allocated: 40, required: 90, cost: 2500000 },
          { resource: 'Supplies', allocated: 70, required: 98, cost: 1500000 },
          { resource: 'Communication', allocated: 85, required: 100, cost: 1200000 }
        ];
      case 'lunar-base':
        return [
          { resource: 'Personnel', allocated: 60, required: 70, cost: 3000000 },
          { resource: 'Equipment', allocated: 85, required: 90, cost: 6000000 },
          { resource: 'Fuel', allocated: 80, required: 85, cost: 1500000 },
          { resource: 'Supplies', allocated: 95, required: 98, cost: 1000000 },
          { resource: 'Communication', allocated: 90, required: 100, cost: 800000 }
        ];
      case 'asteroid-mining':
        return [
          { resource: 'Personnel', allocated: 25, required: 90, cost: 5500000 },
          { resource: 'Equipment', allocated: 50, required: 98, cost: 10000000 },
          { resource: 'Fuel', allocated: 30, required: 95, cost: 3000000 },
          { resource: 'Supplies', allocated: 60, required: 99, cost: 2000000 },
          { resource: 'Communication', allocated: 75, required: 100, cost: 1500000 }
        ];
      default:
        return baseData;
    }
  };

  const resourceData = getResourceData(selectedMission);

        // Get mission title dynamically
        const getMissionTitle = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return 'Mars Exploration Mission';
            case 'lunar-base':
              return 'Lunar Base Construction';
            case 'asteroid-mining':
              return 'Asteroid Mining Mission';
            default:
              return 'Mission Planning';
          }
        };

        // Get mission goal
        const getMissionGoal = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return 'Establish human presence on Mars';
            case 'lunar-base':
              return 'Build sustainable lunar settlement';
            case 'asteroid-mining':
              return 'Extract valuable resources from asteroids';
            default:
              return 'Space exploration mission';
          }
        };

        // Get mission duration
        const getMissionDuration = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return '2-3 years (including transit)';
            case 'lunar-base':
              return '6 months - 2 years';
            case 'asteroid-mining':
              return '1-4 years (depending on target)';
            default:
              return 'Variable duration';
          }
        };

        // Get crew size
        const getCrewSize = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return '4-6 astronauts';
            case 'lunar-base':
              return '6-12 astronauts';
            case 'asteroid-mining':
              return '3-8 astronauts';
            default:
              return 'TBD';
          }
        };

        // Get launch vehicle
        const getLaunchVehicle = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return 'Super Heavy Launch System';
            case 'lunar-base':
              return 'SLS Block 2 or Starship';
            case 'asteroid-mining':
              return 'Falcon Heavy or SLS';
            default:
              return 'TBD';
          }
        };

        // Get payload capacity
        const getPayloadCapacity = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return '100+ tons';
            case 'lunar-base':
              return '150+ tons';
            case 'asteroid-mining':
              return '50-100 tons';
            default:
              return 'Variable';
          }
        };

        // Get power system
        const getPowerSystem = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return 'Solar + Nuclear (RTG)';
            case 'lunar-base':
              return 'Solar + Battery + Nuclear';
            case 'asteroid-mining':
              return 'Solar + Battery backup';
            default:
              return 'TBD';
          }
        };

        // Get communication
        const getCommunication = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return 'Deep Space Network + Relay';
            case 'lunar-base':
              return 'Lunar Relay + Direct Earth';
            case 'asteroid-mining':
              return 'Deep Space Network';
            default:
              return 'Standard';
          }
        };

        // Get mission objectives
        const getMissionObjectives = (mission: string) => {
          switch (mission) {
            case 'mars-exploration':
              return [
                'Establish human settlement on Mars',
                'Conduct scientific research on Martian surface',
                'Test life support systems for long duration',
                'Prepare infrastructure for future missions',
                'Study Martian geology and climate'
              ];
            case 'lunar-base':
              return [
                'Build permanent lunar settlement',
                'Test in-situ resource utilization (ISRU)',
                'Develop lunar manufacturing capabilities',
                'Establish lunar agriculture systems',
                'Create launch platform for deep space missions'
              ];
            case 'asteroid-mining':
              return [
                'Identify and characterize target asteroids',
                'Develop asteroid mining technologies',
                'Extract valuable metals and minerals',
                'Test space manufacturing processes',
                'Establish economic viability of space mining'
              ];
            default:
              return ['Mission objectives to be determined'];
          }
        };

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

  // Mission Readiness data
  const missionReadinessCategories = [
    {
      id: 'crew-health',
      name: 'Crew Health',
      score: 85,
      level: 'Green',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      findings: ['ARED protocols reduce bone loss by 70%', 'Cardiovascular monitoring maintains 85% function'],
      implications: ['Include resistive exercise system', 'Add bone density monitoring']
    },
    {
      id: 'radiation',
      name: 'Radiation',
      score: 75,
      level: 'Green',
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      findings: ['Hybrid shielding reduces exposure by 75%', 'Real-time monitoring provides accurate tracking'],
      implications: ['Implement multi-layered shielding', 'Deploy radiation dosimetry systems']
    },
    {
      id: 'food-life-support',
      name: 'Food & Life Support',
      score: 70,
      level: 'Yellow',
      icon: Leaf,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      findings: ['ISS ECLSS achieves 98% water recovery', 'Hydroponic systems achieve 90% crop yield'],
      implications: ['Design closed-loop life support', 'Implement controlled environment agriculture']
    },
    {
      id: 'microbial-risks',
      name: 'Microbial Risks',
      score: 55,
      level: 'Yellow',
      icon: Bug,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      findings: ['Automated monitoring detects contamination 3x faster', 'Sterilization protocols reduce risk by 95%'],
      implications: ['Implement automated monitoring systems', 'Design sterilization protocols']
    },
    {
      id: 'system-integration',
      name: 'System Integration',
      score: 65,
      level: 'Yellow',
      icon: Settings,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      findings: ['Gateway architecture reduces complexity by 40%', 'Triple redundancy reduces failure probability by 99.9%'],
      implications: ['Design modular systems', 'Implement comprehensive redundancy']
    }
  ];

  const overallScore = Math.round(missionReadinessCategories.reduce((sum, cat) => sum + cat.score, 0) / missionReadinessCategories.length);
  const overallLevel = overallScore >= 70 ? 'Green' : overallScore >= 40 ? 'Yellow' : 'Red';

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
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                router.push('/mission-planner');
              }, 1000);
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            {loading ? 'Redirecting...' : 'Configure Mission'}
          </Button>
        </div>
      </div>

      {/* Mission Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Active Mission: {getMissionTitle(selectedMission)}
            </div>
            {loading && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Updating...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={selectedMission === 'mars-exploration' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedMission('mars-exploration');
                setActiveTab('risk-assessment');
              }}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Mars Exploration Mission
            </Button>
            <Button
              variant={selectedMission === 'lunar-base' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedMission('lunar-base');
                setActiveTab('risk-assessment');
              }}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Lunar Base Construction
            </Button>
            <Button
              variant={selectedMission === 'asteroid-mining' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedMission('asteroid-mining');
                setActiveTab('risk-assessment');
              }}
              className="flex items-center transition-all duration-300"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Asteroid Mining Mission
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mission Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="h-5 w-5 mr-2 text-blue-600" />
            Mission Details: {getMissionTitle(selectedMission)}
          </CardTitle>
          <CardDescription>
            Comprehensive overview of the selected mission parameters and specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mission Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">Mission Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mission Type:</span>
                  <span className="font-medium">{getMissionTitle(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Goal:</span>
                  <span className="font-medium">{getMissionGoal(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getMissionDuration(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crew Size:</span>
                  <span className="font-medium">{getCrewSize(selectedMission)}</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Technical Specifications</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Launch Vehicle:</span>
                  <span className="font-medium">{getLaunchVehicle(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payload Capacity:</span>
                  <span className="font-medium">{getPayloadCapacity(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Power System:</span>
                  <span className="font-medium">{getPowerSystem(selectedMission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Communication:</span>
                  <span className="font-medium">{getCommunication(selectedMission)}</span>
                </div>
              </div>
            </div>

            {/* Mission Objectives */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600">Mission Objectives</h3>
              <div className="space-y-2">
                {getMissionObjectives(selectedMission).map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs with Bubble Effect */}
      <div className="space-y-4">
        {/* Custom Tab Selector with Bubble Effect */}
        <motion.div 
          className="bg-muted/20 rounded-xl p-2 border border-border/30 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'risk-assessment', label: 'Risk Assessment', icon: Shield },
              { id: 'resource-planning', label: 'Resource Planning', icon: Settings },
              { id: 'mission-design', label: 'Mission Design', icon: Rocket },
              { id: 'mission-readiness', label: 'Mission Readiness', icon: Target },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 px-4 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102'
                  }`}
                  whileHover={{ scale: isActive ? 1.08 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    boxShadow: isActive 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: isActive ? 360 : 0,
                        scale: isActive ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium text-sm">{tab.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Risk Assessment Tab */}
        {activeTab === 'risk-assessment' && (
        <div className="space-y-4">
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
        </div>
        )}

        {/* Resource Planning Tab */}
        {activeTab === 'resource-planning' && (
        <div className="space-y-4">
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
        </div>
        )}

        {/* Mission Design & Architecture Tab */}
        {activeTab === 'mission-design' && (
        <div className="space-y-4">
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
        </div>
        )}

        {/* Mission Readiness Tab */}
        {activeTab === 'mission-readiness' && (
        <div className="space-y-4">
          {/* Overall Mission Readiness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-500" />
                Mission Readiness Index
              </CardTitle>
              <CardDescription>
                Comprehensive assessment of mission readiness across critical space mission categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      overallLevel === 'Green' ? 'text-green-600' :
                      overallLevel === 'Yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${
                      overallLevel === 'Green' ? 'bg-green-500' :
                      overallLevel === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`font-semibold ${
                      overallLevel === 'Green' ? 'text-green-700' :
                      overallLevel === 'Yellow' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {overallLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Based on 40+ NASA research publications</div>
                  <div className="text-sm text-gray-600">Environment: {selectedMission.replace('-', ' ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Readiness Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missionReadinessCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-6 w-6 ${category.color}`} />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          category.level === 'Green' ? 'bg-green-100 text-green-800' :
                          category.level === 'Yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }
                      >
                        {category.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          category.level === 'Green' ? 'bg-green-500' :
                          category.level === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-semibold ${
                          category.level === 'Green' ? 'text-green-700' :
                          category.level === 'Yellow' ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {category.level}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {category.score}
                      </div>
                    </div>
                    
                    {/* Key Findings */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Findings:</h4>
                      <div className="space-y-1">
                        {category.findings.map((finding, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {finding}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Design Implications */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Design Implications:</h4>
                      <div className="space-y-1">
                        {category.implications.map((implication, index) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                            {implication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mission Readiness Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Mission Readiness Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2</div>
                  <div className="text-sm text-gray-600">Categories Ready (Green)</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-600">Categories Need Attention (Yellow)</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">40+</div>
                  <div className="text-sm text-gray-600">Research Publications Analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
