'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Package,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { MissionPlannerRequest, MissionPlannerResponse } from '@/api/api';

const destinations = [
  { value: 'mars', label: 'Mars' },
  { value: 'moon', label: 'Moon' },
  { value: 'asteroid', label: 'Asteroid' },
  { value: 'space station', label: 'Space Station' }
];

const severityColors = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200'
};

// Mock data generation function
const generateMockMissionAnalysis = (request: MissionPlannerRequest): MissionPlannerResponse => {
  const { destination, crew_size, duration_days, payload_capacity, use_realtime_data } = request;
  
  // Calculate base feasibility score based on parameters
  let baseScore = 70;
  
  // Adjust score based on destination
  const destinationScores = {
    'moon': 85,
    'mars': 65,
    'asteroid': 55,
    'space station': 90
  };
  baseScore = destinationScores[destination as keyof typeof destinationScores] || 70;
  
  // Adjust based on crew size (optimal range: 2-6)
  if (crew_size < 2 || crew_size > 8) baseScore -= 15;
  else if (crew_size >= 2 && crew_size <= 6) baseScore += 10;
  
  // Adjust based on duration (shorter missions are more feasible)
  if (duration_days > 500) baseScore -= 20;
  else if (duration_days < 100) baseScore += 15;
  
  // Generate risks based on destination and duration
  const risks = [];
  
  if (destination === 'mars') {
    risks.push({
      risk: 'Radiation Exposure',
      severity: duration_days > 500 ? 'High' : 'Medium',
      dose: `${Math.round(0.5 + duration_days * 0.001)} mSv`,
      notes: 'Mars missions face significant cosmic radiation exposure'
    });
    risks.push({
      risk: 'Psychological Isolation',
      severity: 'Medium',
      notes: 'Extended isolation may impact crew mental health'
    });
  } else if (destination === 'moon') {
    risks.push({
      risk: 'Lunar Dust Exposure',
      severity: 'Medium',
      notes: 'Lunar regolith can cause respiratory issues'
    });
    risks.push({
      risk: 'Radiation from Solar Events',
      severity: 'Low',
      notes: 'Moon missions face periodic solar particle events'
    });
  }
  
  // Add duration-based risks
  if (duration_days > 300) {
    risks.push({
      risk: 'Muscle Atrophy',
      severity: 'High',
      notes: 'Extended microgravity causes significant muscle loss'
    });
    risks.push({
      risk: 'Bone Density Loss',
      severity: 'High',
      notes: 'Bone loss accelerates in microgravity environments'
    });
  }
  
  // Generate resource requirements
  const foodPerPersonPerDay = 1.8; // kg
  const waterPerPersonPerDay = 3.5; // kg
  const oxygenPerPersonPerDay = 0.84; // kg
  
  const totalFood = Math.round(crew_size * duration_days * foodPerPersonPerDay);
  const totalWater = Math.round(crew_size * duration_days * waterPerPersonPerDay);
  const totalOxygen = Math.round(crew_size * duration_days * oxygenPerPersonPerDay);
  
  // Generate recommendations
  const recommendations = [
    'Implement comprehensive exercise protocols to mitigate muscle atrophy',
    'Deploy advanced radiation shielding systems for crew protection',
    'Establish psychological support systems for long-duration missions',
    'Design redundant life support systems for mission safety',
    'Conduct extensive pre-mission training and simulations'
  ];
  
  if (duration_days > 500) {
    recommendations.push('Consider crew rotation schedules for extended missions');
  }
  
  if (crew_size > 6) {
    recommendations.push('Implement conflict resolution protocols for larger crews');
  }
  
  // Generate real-time data if requested
  let realtime_data = undefined;
  if (use_realtime_data) {
    realtime_data = {
      iss_crew: {
        current_size: 7,
        mission_duration: 180,
        exercise_hours: 2.5,
        health_status: 'Good'
      },
      radiation: {
        current_level: 0.5,
        solar_activity: 'Low',
        space_weather: 'Quiet'
      },
      research_updates: {
        latest_bone_loss_study: 'ARED exercise reduces bone loss by 70%',
        muscle_atrophy_rate: '2-3% per month in microgravity',
        psychological_stress_index: 'Moderate - within acceptable limits'
      },
      resource_consumption: {
        food_per_person_per_day: 1.8,
        water_per_person_per_day: 3.5,
        oxygen_per_person_per_day: 0.84
      }
    };
  }
  
  return {
    mission_feasibility_score: Math.max(0, Math.min(100, baseScore)),
    risks,
    resources: {
      food: `${totalFood} kg total (${foodPerPersonPerDay} kg/person/day)`,
      water: `${totalWater} kg total (${waterPerPersonPerDay} kg/person/day)`,
      oxygen: `${totalOxygen} kg total (${oxygenPerPersonPerDay} kg/person/day)`
    },
    crew_health: {
      exercise: `Minimum ${Math.round(duration_days / 30 * 2)} hours/day of resistive exercise required`,
      medical_support: 'Full medical kit, telemedicine capabilities, emergency protocols'
    },
    recommendations,
    realtime_data,
    data_timestamp: new Date().toISOString()
  };
};

export default function MissionPlannerPage() {
  const router = useRouter();
  const [missionParams, setMissionParams] = useState<MissionPlannerRequest>({
    destination: 'mars',
    crew_size: 4,
    duration_days: 900,
    payload_capacity: '50 tons',
    use_realtime_data: true
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MissionPlannerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock analysis
      const mockAnalysis = generateMockMissionAnalysis(missionParams);
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Error analyzing mission. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleParameterChange = (field: keyof MissionPlannerRequest, value: string | number | boolean) => {
    setMissionParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Rocket className="h-8 w-8 text-blue-600" />
              Mission Planner
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Design and evaluate space missions based on biological constraints
          </p>
        </div>
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Mission'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Mission Parameters
              </CardTitle>
              <CardDescription>
                Configure your space mission parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-white">Destination</Label>
                <Select 
                  value={missionParams.destination} 
                  onValueChange={(value) => handleParameterChange('destination', value)}
                >
                  <SelectTrigger className="bg-white/10 border-gray-300 text-white backdrop-blur-sm">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-sm border-gray-300">
                    {destinations.map((dest) => (
                      <SelectItem key={dest.value} value={dest.value} className="text-gray-900 hover:bg-gray-100">
                        {dest.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Crew Size */}
              <div className="space-y-2">
                <Label htmlFor="crew_size" className="text-white">Crew Size</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Input
                    id="crew_size"
                    type="number"
                    min="1"
                    max="12"
                    value={missionParams.crew_size}
                    onChange={(e) => handleParameterChange('crew_size', parseInt(e.target.value) || 1)}
                    className="flex-1 bg-white/10 border-gray-300 text-white backdrop-blur-sm placeholder:text-gray-300"
                  />
                  <span className="text-sm text-gray-500">astronauts</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Mission Duration</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{missionParams.duration_days} days</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round(missionParams.duration_days / 365 * 10) / 10} years)
                    </span>
                  </div>
                  <Slider
                    value={[missionParams.duration_days]}
                    onValueChange={([value]) => handleParameterChange('duration_days', value)}
                    min={30}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>30 days</span>
                    <span>1000 days</span>
                  </div>
                </div>
              </div>

              {/* Payload Capacity */}
              <div className="space-y-2">
                <Label htmlFor="payload" className="text-white">Payload Capacity</Label>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <Input
                    id="payload"
                    value={missionParams.payload_capacity}
                    onChange={(e) => handleParameterChange('payload_capacity', e.target.value)}
                    placeholder="e.g., 50 tons"
                    className="bg-white/10 border-gray-300 text-white backdrop-blur-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Real-time Data Toggle */}
              <div className="space-y-2">
                <Label className="text-white">Data Source</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="realtime"
                    checked={missionParams.use_realtime_data}
                    onChange={(e) => handleParameterChange('use_realtime_data', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="realtime" className="text-sm text-white">
                    Use Real-time Data
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Include live ISS crew data, radiation levels, and latest research findings
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <Label className="text-white">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMissionParams({
                      destination: 'moon',
                      crew_size: 2,
                      duration_days: 30,
                      payload_capacity: '10 tons',
                      use_realtime_data: missionParams.use_realtime_data
                    })}
                  >
                    Moon Mission
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMissionParams({
                      destination: 'mars',
                      crew_size: 6,
                      duration_days: 900,
                      payload_capacity: '100 tons',
                      use_realtime_data: missionParams.use_realtime_data
                    })}
                  >
                    Mars Mission
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Analyzing mission feasibility...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
                  <p className="text-red-600">Error analyzing mission. Please try again.</p>
                </div>
              </CardContent>
            </Card>
          ) : analysis ? (
            <>
              {/* Mission Feasibility Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Mission Feasibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Overall Feasibility Score</span>
                      <span className={`text-3xl font-bold ${getFeasibilityColor(analysis.mission_feasibility_score)}`}>
                        {analysis.mission_feasibility_score}/100
                      </span>
                    </div>
                    <Progress 
                      value={analysis.mission_feasibility_score} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Low Risk</span>
                      <span>High Risk</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {analysis.risks.map((risk, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{risk.risk}</h3>
                          <Badge 
                            variant="outline" 
                            className={severityColors[risk.severity as keyof typeof severityColors]}
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {risk.expected_loss && (
                            <p><strong>Expected Loss:</strong> {risk.expected_loss}</p>
                          )}
                          {risk.dose && (
                            <p><strong>Radiation Dose:</strong> {risk.dose}</p>
                          )}
                          {risk.notes && (
                            <p><strong>Notes:</strong> {risk.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resource Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Resource Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">🍎</div>
                      <h3 className="font-semibold">Food</h3>
                      <p className="text-sm text-gray-600 mt-1">{analysis.resources.food}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">💧</div>
                      <h3 className="font-semibold">Water</h3>
                      <p className="text-sm text-gray-600 mt-1">{analysis.resources.water}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">💨</div>
                      <h3 className="font-semibold">Oxygen</h3>
                      <p className="text-sm text-gray-600 mt-1">{analysis.resources.oxygen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crew Health Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Crew Health Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        Exercise Requirements
                      </h3>
                      <p className="text-gray-600">{analysis.crew_health.exercise}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Medical Support
                      </h3>
                      <p className="text-gray-600">{analysis.crew_health.medical_support}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Data */}
              {analysis.realtime_data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Live Space Data
                      {analysis.data_timestamp && (
                        <Badge variant="outline" className="text-xs">
                          Updated: {new Date(analysis.data_timestamp).toLocaleTimeString()}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ISS Crew Data */}
                      {analysis.realtime_data.iss_crew && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            Current ISS Crew
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Crew Size:</strong> {analysis.realtime_data.iss_crew.current_size} astronauts</p>
                            <p><strong>Mission Duration:</strong> {analysis.realtime_data.iss_crew.mission_duration} days</p>
                            <p><strong>Exercise Hours:</strong> {analysis.realtime_data.iss_crew.exercise_hours} hours/day</p>
                            <p><strong>Health Status:</strong> 
                              <Badge variant="outline" className={`ml-2 ${
                                analysis.realtime_data.iss_crew.health_status === 'Good' ? 'bg-green-100 text-green-800' :
                                analysis.realtime_data.iss_crew.health_status === 'Poor' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {analysis.realtime_data.iss_crew.health_status}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Radiation Data */}
                      {analysis.realtime_data.radiation && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            Radiation Levels
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Current Level:</strong> {analysis.realtime_data.radiation.current_level} mSv/day</p>
                            <p><strong>Solar Activity:</strong> {analysis.realtime_data.radiation.solar_activity}</p>
                            <p><strong>Space Weather:</strong> {analysis.realtime_data.radiation.space_weather}</p>
                          </div>
                        </div>
                      )}

                      {/* Research Updates */}
                      {analysis.realtime_data.research_updates && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                            Latest Research
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Bone Loss:</strong> {analysis.realtime_data.research_updates.latest_bone_loss_study}</p>
                            <p><strong>Muscle Atrophy:</strong> {analysis.realtime_data.research_updates.muscle_atrophy_rate}</p>
                            <p><strong>Stress Index:</strong> {analysis.realtime_data.research_updates.psychological_stress_index}</p>
                          </div>
                        </div>
                      )}

                      {/* Resource Consumption */}
                      {analysis.realtime_data.resource_consumption && (
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-green-600" />
                            Current Consumption
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Food:</strong> {analysis.realtime_data.resource_consumption.food_per_person_per_day} kg/person/day</p>
                            <p><strong>Water:</strong> {analysis.realtime_data.resource_consumption.water_per_person_per_day} kg/person/day</p>
                            <p><strong>Oxygen:</strong> {analysis.realtime_data.resource_consumption.oxygen_per_person_per_day} kg/person/day</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Plan Your Mission?</h3>
                  <p className="text-gray-500">Configure your mission parameters and click &quot;Analyze Mission&quot; to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
