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
        <div className="relative overflow-hidden cosmic-gradient rounded-2xl p-8 mb-8 cosmic-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-purple-500/5"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Space Biology Research Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore 607+ space biology publications with AI-powered insights, comprehensive analytics, 
              and role-specific intelligence for scientists and research managers.
            </p>
            
            {/* Role Selection */}
            <div className="bg-card/80 backdrop-blur-sm border-2 border-border/70 rounded-xl p-6 shadow-lg mb-8 cosmic-hover">
              <h2 className="text-2xl font-semibold text-white mb-4">Choose Your Role</h2>
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
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-2 cosmic-glow">
                  {role} Mode
                </Badge>
              </div>

              <div className="flex justify-center">
                <Button asChild size="lg" className="px-8 py-4 text-lg">
                  <Link href="/dashboard">
                    {role === 'Scientist' && (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Scientist Mode
                      </>
                    )}
                    {role === 'Manager' && (
                      <>
                        <DollarSign className="h-5 w-5 mr-2" />
                        Manager Mode
                      </>
                    )}
                    {role === 'Mission Planner' && (
                      <>
                        <Rocket className="h-5 w-5 mr-2" />
                        Mission Planner Mode
                      </>
                    )}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Powerful Features for Research Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-primary mb-4 cosmic-glow">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
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
          <Card className="border-2 border-primary/50 bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg border-b border-primary/20">
              <CardTitle className="flex items-center text-primary">
                <Brain className="h-6 w-6 mr-2" />
                For Scientists
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Deep technical insights and research analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {scientistFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chart-2 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Manager Benefits */}
          <Card className="border-2 border-chart-2/50 bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
            <CardHeader className="bg-gradient-to-r from-chart-2/10 to-transparent rounded-t-lg border-b border-chart-2/20">
              <CardTitle className="flex items-center text-chart-2">
                <DollarSign className="h-6 w-6 mr-2" />
                For Managers
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Business intelligence and investment analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {managerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chart-2 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Mission Planner Benefits */}
          <Card className="border-2 border-accent/50 bg-card/80 backdrop-blur-sm shadow-lg transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent rounded-t-lg border-b border-accent/20">
              <CardTitle className="flex items-center text-accent">
                <Rocket className="h-6 w-6 mr-2" />
                For Mission Planners
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Mission design and strategic planning tools
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {missionPlannerFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chart-2 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="cosmic-gradient rounded-2xl p-8 border border-border/50">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center cursor-pointer bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center text-primary mb-4 cosmic-glow">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Search Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-muted-foreground">
                  Find relevant research papers with advanced search capabilities
                </CardDescription>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/search">Start Searching</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center cursor-pointer bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-chart-2/20 to-chart-2/40 rounded-lg flex items-center justify-center text-chart-2 mb-4 cosmic-glow">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">Browse Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-muted-foreground">
                  Explore all available research papers with filtering options
                </CardDescription>
                <Button asChild variant="outline" className="w-full border-chart-2/30 hover:bg-chart-2/10">
                  <Link href="/papers">Browse All</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center cursor-pointer bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/40 rounded-lg flex items-center justify-center text-accent mb-4 cosmic-glow">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-white">View Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-muted-foreground">
                  Access your personalized dashboard with analytics and insights
                </CardDescription>
                <Button asChild variant="outline" className="w-full border-accent/30 hover:bg-accent/10">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">607+</div>
              <div className="text-sm text-muted-foreground">Space Biology Papers</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Research Institutions</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 hover:outline hover:outline-2 hover:outline-white/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-white mb-2">99%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
