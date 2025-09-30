'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { 
  Brain, 
  DollarSign, 
  Search, 
  BarChart3, 
  Users, 
  BookOpen,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  Rocket,
  Shield,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { role, setRole } = useAppStore();

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Advanced Search",
      description: "Search across thousands of research papers with intelligent filtering and sorting capabilities."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get role-specific analysis and recommendations powered by advanced AI technology."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Data Visualization",
      description: "Interactive charts and graphs to understand research trends and patterns."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaboration Tools",
      description: "Share insights and collaborate with your research team seamlessly."
    }
  ];

  const scientistFeatures = [
    "Deep technical analysis and methodology evaluation",
    "Research impact metrics and citation tracking",
    "Knowledge graph visualization",
    "Gap analysis and research opportunities",
    "Technical limitations assessment"
  ];

  const managerFeatures = [
    "ROI analysis and investment potential",
    "Market trends and competitive analysis",
    "Resource allocation optimization",
    "Risk assessment and mitigation strategies",
    "Business intelligence dashboards"
  ];

  const missionPlannerFeatures = [
    "Mission risk assessment and mitigation",
    "Resource planning and optimization",
    "Mission design and architecture",
    "Timeline and milestone tracking",
    "Cost-benefit analysis for missions"
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Space Biology Research Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore 607+ space biology publications with AI-powered insights, comprehensive analytics, 
              and role-specific intelligence for scientists and research managers.
            </p>
            
            {/* Role Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose Your Role</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <Button
                  variant={role === 'Scientist' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setRole('Scientist')}
                  className="px-8 py-4 text-lg"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Scientist
                </Button>
                <Button
                  variant={role === 'Manager' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setRole('Manager')}
                  className="px-8 py-4 text-lg"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Manager
                </Button>
                <Button
                  variant={role === 'Mission Planner' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setRole('Mission Planner')}
                  className="px-8 py-4 text-lg"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Mission Planner
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                  {role} Mode
                </Badge>
              </div>

              <Button asChild size="lg" className="px-8 py-4 text-lg">
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Powerful Features for Research Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Role-Specific Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Scientist Benefits */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center text-blue-900">
                <Brain className="h-6 w-6 mr-2" />
                For Scientists
              </CardTitle>
              <CardDescription className="text-blue-700">
                Deep technical insights and research analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {scientistFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Manager Benefits */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50 rounded-t-lg">
              <CardTitle className="flex items-center text-green-900">
                <DollarSign className="h-6 w-6 mr-2" />
                For Managers
              </CardTitle>
              <CardDescription className="text-green-700">
                Business intelligence and investment analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {managerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Mission Planner Benefits */}
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center text-purple-900">
                <Rocket className="h-6 w-6 mr-2" />
                For Mission Planners
              </CardTitle>
              <CardDescription className="text-purple-700">
                Mission design and strategic planning tools
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {missionPlannerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle>Search Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Find relevant research papers with advanced search capabilities
                </CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/search">Start Searching</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Browse Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Explore all available research papers with filtering options
                </CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/papers">Browse All</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>View Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Access your personalized dashboard with analytics and insights
                </CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">607+</div>
              <div className="text-sm text-gray-600">Space Biology Papers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Research Institutions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
