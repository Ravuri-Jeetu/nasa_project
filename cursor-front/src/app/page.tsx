'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import NASALayout from '@/components/nasa-layout';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  DollarSign, 
  Rocket, 
  Search, 
  BarChart3, 
  Users, 
  BookOpen,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Target,
  Globe,
  Layers,
  Cpu,
  Satellite,
  Users2
} from 'lucide-react';
import Link from 'next/link';


export default function HomePage() {
  const router = useRouter();
  const { role, setRole } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Advanced Search",
      description: "AI-powered search across 607+ space biology publications with intelligent filtering",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Insights",
      description: "Role-specific analysis and recommendations powered by advanced AI technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Data Visualization",
      description: "Interactive charts and graphs for understanding research trends and patterns",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaboration Tools",
      description: "Share insights and collaborate with your research team seamlessly",
      color: "from-orange-500 to-red-500"
    }
  ];

  const roleBenefits = {
    'Scientist': {
      icon: <Brain className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Deep technical analysis and methodology evaluation",
        "Research impact metrics and citation tracking",
        "Knowledge graph visualization",
        "Gap analysis and research opportunities"
      ]
    },
    'Manager': {
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      features: [
        "ROI analysis and investment potential",
        "Market trends and competitive analysis",
        "Resource allocation optimization",
        "Risk assessment and mitigation strategies"
      ]
    },
    'Mission Planner': {
      icon: <Rocket className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      features: [
        "Mission risk assessment and mitigation",
        "Resource planning and optimization",
        "Mission design and architecture",
        "Timeline and milestone tracking"
      ]
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <NASALayout>
      <div className="min-h-screen relative">

        {/* Hero Section */}
        <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="slide-up">
              <h1 className="text-6xl md:text-8xl font-orbitron font-bold mb-8 cosmic-text-high-contrast leading-tight">
                SpaceScope
                <br />
                <span className="text-4xl md:text-6xl">Space Biology Research Platform</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 font-rajdhani font-light mb-12 max-w-4xl mx-auto leading-relaxed space-text-shadow">
                Explore the frontiers of space biology with AI-powered insights, 
                comprehensive analytics, and mission control interfaces designed for 
                the next generation of space research.
              </p>
            </div>

            {/* Mission Role Selection Card */}
            <div className="relative w-full mx-auto mb-16 slide-up">
              {/* Main Card Container */}
              <div className="relative overflow-hidden rounded-3xl">
                {/* Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-slate-800/3 to-gray-900/5 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/1 via-transparent to-transparent" />
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-cyan-400/5 p-[1px]">
                  <div className="h-full w-full rounded-3xl bg-transparent" />
                </div>
                
                {/* Content */}
                <div className="relative p-6 md:p-8">
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 border border-blue-400/30">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-gray-900 mb-3">
                      Mission Role Selection
                    </h2>
                    <p className="text-base text-white/70 font-rajdhani max-w-2xl mx-auto space-text-shadow">
                      Choose your specialized role to access tailored research capabilities
                    </p>
                  </div>

                  {/* Role Selection Grid - Horizontal Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {(['Scientist', 'Manager', 'Mission Planner'] as const).map((roleOption, index) => {
                      const isActive = role === roleOption;
                      const roleData = {
                        'Scientist': { 
                          icon: <Satellite className="h-8 w-8" />, 
                          color: 'from-blue-400 to-cyan-400',
                          bgColor: 'from-blue-500/3 to-cyan-500/3',
                          borderColor: 'border-blue-400/5',
                          shadowColor: 'shadow-blue-400/5'
                        },
                        'Manager': { 
                          icon: <Users2 className="h-8 w-8" />, 
                          color: 'from-cyan-400 to-blue-400',
                          bgColor: 'from-cyan-500/3 to-blue-500/3',
                          borderColor: 'border-cyan-400/5',
                          shadowColor: 'shadow-cyan-400/5'
                        },
                        'Mission Planner': { 
                          icon: <Target className="h-8 w-8" />, 
                          color: 'from-purple-400 to-pink-400',
                          bgColor: 'from-purple-500/3 to-pink-500/3',
                          borderColor: 'border-purple-400/5',
                          shadowColor: 'shadow-purple-400/5'
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
                          <div className={`relative overflow-hidden rounded-xl p-4 md:p-6 h-full transition-all duration-500 ${
                            isActive 
                              ? `bg-gradient-to-br ${roleConfig.bgColor} ${roleConfig.borderColor} border-2 shadow-xl ${roleConfig.shadowColor}` 
                              : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                          }`}>
                            
                            {/* Animated Background Effect */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${roleConfig.bgColor}`} />
                            
                            {/* Content */}
                            <div className="relative z-10 text-center">
                              {/* Icon */}
                              <div className={`mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-500 ${
                                isActive 
                                  ? `bg-gradient-to-br ${roleConfig.color} text-white shadow-lg` 
                                  : 'bg-white/10 text-white/60 group-hover:text-white group-hover:bg-white/20'
                              }`}>
                                <div className="scale-75 md:scale-100">
                                  {roleConfig.icon}
                                </div>
                              </div>
                              
                              {/* Title */}
                              <h3 className={`text-lg md:text-xl font-orbitron font-bold mb-2 transition-colors duration-500 ${
                                isActive ? 'text-white space-text-shadow' : 'text-white/90 group-hover:text-white space-text-shadow'
                              }`}>
                                {roleOption}
                              </h3>
                              
                              {/* Description */}
                              <p className={`text-xs md:text-sm font-rajdhani transition-colors duration-500 leading-tight ${
                                isActive ? 'text-white/90 space-text-shadow' : 'text-white/70 group-hover:text-white/90 space-text-shadow'
                              }`}>
                                {roleOption === 'Scientist' && 'Advanced research analysis and technical insights'}
                                {roleOption === 'Manager' && 'Strategic planning and resource optimization'}
                                {roleOption === 'Mission Planner' && 'Mission design and operational planning'}
                              </p>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Section */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Active Role Badge */}
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/3 to-purple-500/3 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/5 shadow-lg">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <span className="text-white font-rajdhani font-semibold text-base space-text-shadow">
                        {role} Mode Active
                      </span>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    </div>

                    {/* Launch Button */}
                    <Button 
                      asChild 
                      size="lg" 
                      className="group px-8 py-4 text-lg font-orbitron font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white border-0 rounded-xl shadow-2xl shadow-blue-500/30 transition-all duration-500 hover:scale-110 hover:shadow-blue-500/50"
                    >
                      <Link href="/dashboard" className="flex items-center space-x-2">
                        <span>Get Started</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold cosmic-text-gradient mb-6">
                Mission Control Features
              </h2>
              <p className="text-xl text-white/70 font-rajdhani max-w-3xl mx-auto">
                Advanced tools and interfaces designed for space biology research excellence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glassmorphism rounded-xl p-6 text-center holographic-glow slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-orbitron font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 font-rajdhani text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Specific Benefits */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold cosmic-text-gradient mb-6">
                Mission-Specific Capabilities
              </h2>
              <p className="text-xl text-white/70 font-rajdhani max-w-3xl mx-auto">
                Tailored intelligence and tools for your specific research role
              </p>
            </div>

            <div className="glassmorphism rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${roleBenefits[role].color} rounded-xl flex items-center justify-center text-white mr-4 shadow-lg`}>
                  {roleBenefits[role].icon}
                </div>
                <div>
                  <h3 className="text-3xl font-orbitron font-bold cosmic-text-gradient">
                    {role} Capabilities
                  </h3>
                  <p className="text-white/70 font-rajdhani">
                    Specialized tools and insights for {role.toLowerCase()} operations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roleBenefits[role].features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-white/90 font-rajdhani">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl md:text-5xl font-orbitron font-bold cosmic-text-gradient mb-6">
                Quick Mission Actions
              </h2>
              <p className="text-xl text-white/70 font-rajdhani max-w-3xl mx-auto">
                Launch into your research mission with these essential tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/search" className="group">
                <div className="glassmorphism rounded-xl p-8 text-center holographic-glow h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-semibold text-white mb-3">
                    Search Database
                  </h3>
                  <p className="text-white/70 font-rajdhani mb-6">
                    Advanced search across 607+ space biology publications
                  </p>
                  <Button variant="outline" className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400">
                    Start Searching
                  </Button>
                </div>
              </Link>

              <Link href="/papers" className="group">
                <div className="glassmorphism rounded-xl p-8 text-center holographic-glow h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-semibold text-white mb-3">
                    Browse Papers
                  </h3>
                  <p className="text-white/70 font-rajdhani mb-6">
                    Explore all available research papers with filtering
                  </p>
                  <Button variant="outline" className="border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400">
                    Browse All
                  </Button>
                </div>
              </Link>

              <Link href="/dashboard" className="group">
                <div className="glassmorphism rounded-xl p-8 text-center holographic-glow h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-orbitron font-semibold text-white mb-3">
                    Mission Dashboard
                  </h3>
                  <p className="text-white/70 font-rajdhani mb-6">
                    Access your personalized analytics and insights
                  </p>
                  <Button variant="outline" className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400">
                    Launch Dashboard
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "607+", label: "Space Biology Papers", color: "from-blue-500 to-cyan-500" },
                { number: "500+", label: "Active Researchers", color: "from-green-500 to-emerald-500" },
                { number: "50+", label: "Research Institutions", color: "from-purple-500 to-pink-500" },
                { number: "99%", label: "Mission Success Rate", color: "from-orange-500 to-red-500" }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glassmorphism rounded-xl p-6 text-center holographic-glow fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`text-4xl font-orbitron font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-rajdhani text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="glassmorphism rounded-xl p-8">
              <h3 className="text-2xl font-orbitron font-bold cosmic-text-gradient mb-4">
                Ready to Launch Your Mission?
              </h3>
              <p className="text-white/70 font-rajdhani mb-6 max-w-2xl mx-auto">
                Join the next generation of space biology research with our comprehensive platform
              </p>
              <Button 
                asChild 
                size="lg" 
                className="px-8 py-4 text-lg font-rajdhani font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25"
              >
                <Link href="/dashboard">
                  Begin Mission
                  <Rocket className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </NASALayout>
  );
}