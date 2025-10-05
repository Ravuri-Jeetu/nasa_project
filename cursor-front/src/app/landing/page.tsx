'use client';

import NASALayout from '@/components/nasa-layout';
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
    <NASALayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden cosmic-gradient rounded-2xl p-8 mb-8 cosmic-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-purple-500/5"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Space Biology Research Platform
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore 607+ space biology publications with AI-powered insights, comprehensive analytics, 
              and role-specific intelligence for scientists and research managers.
            </p>
            
            {/* Mission Role Selection Card */}
            <div className="relative max-w-5xl mx-auto mb-16 slide-up">
              {/* Main Card Container */}
              <div className="relative overflow-hidden rounded-3xl">
                {/* Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-purple-900/90 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 p-[2px]">
                  <div className="h-full w-full rounded-3xl bg-transparent" />
                </div>
                
                {/* Content */}
                <div className="relative p-8 md:p-12">
                  {/* Header Section */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 border border-blue-400/30">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-orbitron font-bold cosmic-text-gradient mb-4">
                      Mission Role Selection
                    </h2>
                    <p className="text-lg text-white/70 font-rajdhani max-w-2xl mx-auto">
                      Choose your specialized role to access tailored research capabilities and mission control interfaces
                    </p>
                  </div>

                  {/* Role Selection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {(['Scientist', 'Manager', 'Mission Planner'] as const).map((roleOption, index) => {
                      const isActive = role === roleOption;
                      const roleData = {
                        'Scientist': { 
                          icon: <Brain className="h-8 w-8" />, 
                          color: 'from-blue-500 to-cyan-500',
                          bgColor: 'from-blue-600/20 to-cyan-600/20',
                          borderColor: 'border-blue-400/40',
                          shadowColor: 'shadow-blue-500/25'
                        },
                        'Manager': { 
                          icon: <DollarSign className="h-8 w-8" />, 
                          color: 'from-emerald-500 to-green-500',
                          bgColor: 'from-emerald-600/20 to-green-600/20',
                          borderColor: 'border-emerald-400/40',
                          shadowColor: 'shadow-emerald-500/25'
                        },
                        'Mission Planner': { 
                          icon: <Rocket className="h-8 w-8" />, 
                          color: 'from-purple-500 to-pink-500',
                          bgColor: 'from-purple-600/20 to-pink-600/20',
                          borderColor: 'border-purple-400/40',
                          shadowColor: 'shadow-purple-500/25'
                        }
                      };

                      const roleConfig = roleData[roleOption];

                      return (
                        <div
                          key={roleOption}
                          className={`relative group cursor-pointer transition-all duration-500 hover:scale-105 ${
                            isActive ? 'scale-105' : ''
                          }`}
                          onClick={() => setRole(roleOption)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Card Background */}
                          <div className={`relative overflow-hidden rounded-2xl p-8 h-full transition-all duration-500 ${
                            isActive 
                              ? `bg-gradient-to-br ${roleConfig.bgColor} ${roleConfig.borderColor} border-2 shadow-xl ${roleConfig.shadowColor}` 
                              : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}>
                            
                            {/* Animated Background Effect */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${roleConfig.bgColor}`} />
                            
                            {/* Content */}
                            <div className="relative z-10 text-center">
                              {/* Icon */}
                              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                isActive 
                                  ? `bg-gradient-to-br ${roleConfig.color} text-white shadow-lg` 
                                  : 'bg-white/10 text-white/60 group-hover:text-white group-hover:bg-white/20'
                              }`}>
                                {roleConfig.icon}
                              </div>
                              
                              {/* Title */}
                              <h3 className={`text-xl font-orbitron font-bold mb-2 transition-colors duration-500 ${
                                isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                              }`}>
                                {roleOption}
                              </h3>
                              
                              {/* Description */}
                              <p className={`text-sm font-rajdhani transition-colors duration-500 ${
                                isActive ? 'text-white/80' : 'text-white/60 group-hover:text-white/80'
                              }`}>
                                {roleOption === 'Scientist' && 'Advanced research analysis and technical insights'}
                                {roleOption === 'Manager' && 'Strategic planning and resource optimization'}
                                {roleOption === 'Mission Planner' && 'Mission design and operational planning'}
                              </p>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute top-4 right-4">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
              
                  {/* Status Section */}
                  <div className="flex flex-col items-center space-y-6">
                    {/* Active Role Badge */}
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-400/30 shadow-lg">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                      <span className="text-white font-rajdhani font-semibold text-lg">
                        {role} Mode Active
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

                    {/* Launch Button */}
                    <Button 
                      asChild 
                      size="lg" 
                      className="group px-12 py-6 text-xl font-orbitron font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white border-0 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:scale-110 hover:shadow-blue-500/50"
                    >
                      <Link href="/dashboard" className="flex items-center space-x-3">
                        <span>Launch Mission Control</span>
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
            Powerful Features for Research Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center cosmic-hover bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-primary mb-4 cosmic-glow">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
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
          <Card className="border-primary/30 cosmic-hover bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent rounded-t-lg">
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
          <Card className="border-chart-2/30 cosmic-hover bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-chart-2/10 to-transparent rounded-t-lg">
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
          <Card className="border-accent/30 cosmic-hover bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent rounded-t-lg">
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
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center cosmic-hover cursor-pointer bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center text-primary mb-4 cosmic-glow">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">Search Papers</CardTitle>
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

            <Card className="text-center cosmic-hover cursor-pointer bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-chart-2/20 to-chart-2/40 rounded-lg flex items-center justify-center text-chart-2 mb-4 cosmic-glow">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">Browse Papers</CardTitle>
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

            <Card className="text-center cosmic-hover cursor-pointer bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/40 rounded-lg flex items-center justify-center text-accent mb-4 cosmic-glow">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">View Dashboard</CardTitle>
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
          <Card className="text-center cosmic-hover bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">607+</div>
              <div className="text-sm text-muted-foreground">Space Biology Papers</div>
            </CardContent>
          </Card>
          <Card className="text-center cosmic-hover bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-chart-2 to-green-400 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center cosmic-hover bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Research Institutions</div>
            </CardContent>
          </Card>
          <Card className="text-center cosmic-hover bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-chart-4 to-orange-400 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NASALayout>
  );
}
