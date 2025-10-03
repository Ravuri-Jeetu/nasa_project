import React from 'react';
import MissionReadinessPanel from '@/components/MissionReadinessPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Target, Users, Zap } from 'lucide-react';

export default function MissionReadinessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Rocket className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mission Readiness Index</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Comprehensive assessment of mission readiness across critical space mission categories. 
            This tool analyzes research publications to evaluate our preparedness for long-duration space missions.
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mission Categories</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Critical mission areas analyzed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Publications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30+</div>
              <p className="text-xs text-muted-foreground">
                Peer-reviewed studies analyzed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Method</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI</div>
              <p className="text-xs text-muted-foreground">
                Keyword mapping + scoring algorithms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Environment</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Transit</div>
              <p className="text-xs text-muted-foreground">
                Deep space mission focus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mission Categories Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mission Categories Analyzed</CardTitle>
            <p className="text-sm text-gray-600">
              Each category represents a critical aspect of long-duration space missions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">H</span>
                </div>
                <h3 className="font-semibold text-sm">Crew Health</h3>
                <p className="text-xs text-gray-600 mt-1">Physical & psychological well-being</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">R</span>
                </div>
                <h3 className="font-semibold text-sm">Radiation</h3>
                <p className="text-xs text-gray-600 mt-1">Cosmic radiation protection</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">F</span>
                </div>
                <h3 className="font-semibold text-sm">Food & Life Support</h3>
                <p className="text-xs text-gray-600 mt-1">Sustainable life support systems</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">M</span>
                </div>
                <h3 className="font-semibold text-sm">Microbial Risks</h3>
                <p className="text-xs text-gray-600 mt-1">Contamination prevention</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <h3 className="font-semibold text-sm">System Integration</h3>
                <p className="text-xs text-gray-600 mt-1">Mission architecture & optimization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Mission Readiness Panel */}
        <MissionReadinessPanel />

        {/* Footer Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">About This Analysis</h3>
              <p className="text-sm text-blue-800 max-w-4xl mx-auto">
                The Mission Readiness Index uses a rule-based scoring system that analyzes research publications 
                to assess our preparedness for long-duration space missions. Scores are calculated based on 
                the quantity and quality of evidence, presence of tested countermeasures, and research gaps. 
                This tool helps mission architects identify critical areas requiring additional research and 
                development before embarking on deep space missions.
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Badge variant="outline" className="bg-white">
                  Rule-based Analysis
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Keyword Mapping
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Evidence Scoring
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Design Implications
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
