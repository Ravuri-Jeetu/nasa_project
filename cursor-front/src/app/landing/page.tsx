'use client';

import MainLayout from '@/components/main-layout';
import LoadingSpinner from '@/components/loading-spinner';
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
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const { role, setRole } = useAppStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsLoaded(true);
    }, 3000); // 3 seconds loading

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

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
    <>
      <LoadingSpinner isLoading={isLoading} />
      <MainLayout>
        <div className="min-h-screen">
        {/* Hero Section */}
        <motion.div 
          className="relative overflow-hidden cosmic-gradient rounded-2xl p-8 mb-8 cosmic-glow"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-purple-500/5"></div>
          
          {/* Animated Earth Background - Fixed Position */}
          <motion.div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15 z-0 pointer-events-none"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 1.1, 1],
              rotate: [0, 360]
            }}
            transition={{
              scale: { duration: 2, ease: "easeOut" },
              rotate: { duration: 60, repeat: Infinity, ease: "linear" }
            }}
          >
            <div className="relative">
              {/* Earth Sphere */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-2xl relative overflow-hidden">
                {/* Continents */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-full opacity-60">
                  {/* North America */}
                  <div className="absolute top-1/4 left-1/4 w-12 h-10 bg-green-600 rounded-full transform rotate-12 opacity-80"></div>
                  {/* South America */}
                  <div className="absolute top-1/2 left-1/5 w-6 h-16 bg-green-700 rounded-full transform rotate-6 opacity-70"></div>
                  {/* Europe/Africa */}
                  <div className="absolute top-1/3 right-1/3 w-10 h-12 bg-green-600 rounded-full transform -rotate-12 opacity-75"></div>
                  {/* Asia */}
                  <div className="absolute top-1/4 right-1/6 w-16 h-10 bg-green-700 rounded-full transform rotate-6 opacity-70"></div>
                  {/* Australia */}
                  <div className="absolute bottom-1/3 right-1/4 w-8 h-5 bg-green-600 rounded-full transform -rotate-6 opacity-80"></div>
                </div>
                
                {/* Clouds */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-full"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="absolute top-1/4 left-1/3 w-6 h-3 bg-white/30 rounded-full blur-sm"></div>
                  <div className="absolute top-1/2 right-1/4 w-5 h-2 bg-white/25 rounded-full blur-sm"></div>
                  <div className="absolute bottom-1/3 left-1/5 w-8 h-4 bg-white/20 rounded-full blur-sm"></div>
                  <div className="absolute bottom-1/4 right-1/3 w-6 h-3 bg-white/30 rounded-full blur-sm"></div>
                </motion.div>
                
                {/* Atmosphere */}
                <div className="absolute inset-0 rounded-full border-3 border-blue-300/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]"></div>
              </div>
              
              {/* Orbiting Elements */}
              <motion.div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ transformOrigin: 'center 160px' }}
              >
                <div className="w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/2 left-0 transform -translate-x-3"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ transformOrigin: '160px center' }}
              >
                <div className="w-2 h-2 bg-gray-300 rounded-full shadow-lg"></div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Floating Elements */}
          <motion.div
            className="absolute top-10 left-10 text-blue-400/20"
            variants={floatingVariants}
            animate="float"
          >
            <Brain className="h-8 w-8" />
          </motion.div>
          <motion.div
            className="absolute top-20 right-20 text-purple-400/20"
            variants={floatingVariants}
            animate="float"
            transition={{ delay: 1 }}
          >
            <Rocket className="h-6 w-6" />
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-20 text-green-400/20"
            variants={floatingVariants}
            animate="float"
            transition={{ delay: 2 }}
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Space Biology Research Platform
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explore 607+ space biology publications with AI-powered insights, comprehensive analytics, 
              and role-specific intelligence for scientists and research managers.
            </motion.p>
            
            {/* Role Selection */}
            <motion.div 
              className="bg-card/80 backdrop-blur-sm border-2 border-border/70 rounded-xl p-6 shadow-lg mb-8 cosmic-hover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.h2 
                className="text-2xl font-semibold text-white mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Choose Your Role
              </motion.h2>
              {/* Role Selector */}
              <motion.div 
                className="bg-muted/20 rounded-xl mb-6 p-2 border border-border/30 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Role Buttons */}
                <div className="flex">
                  <motion.button
                    onClick={() => setRole('Scientist')}
                    className={`relative flex-1 py-4 px-6 rounded-full transition-all duration-300 ${
                      role === 'Scientist' 
                        ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102'
                    }`}
                    whileHover={{ scale: role === 'Scientist' ? 1.08 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: role === 'Scientist' 
                        ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ 
                          rotate: role === 'Scientist' ? 360 : 0,
                          scale: role === 'Scientist' ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Brain className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">Scientist</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setRole('Manager')}
                    className={`relative flex-1 py-4 px-6 rounded-full transition-all duration-300 ${
                      role === 'Manager' 
                        ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102'
                    }`}
                    whileHover={{ scale: role === 'Manager' ? 1.08 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: role === 'Manager' 
                        ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ 
                          rotate: role === 'Manager' ? 360 : 0,
                          scale: role === 'Manager' ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <DollarSign className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">Manager</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setRole('Mission Planner')}
                    className={`relative flex-1 py-4 px-6 rounded-full transition-all duration-300 ${
                      role === 'Mission Planner' 
                        ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-102'
                    }`}
                    whileHover={{ scale: role === 'Mission Planner' ? 1.08 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: role === 'Mission Planner' 
                        ? '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ 
                          rotate: role === 'Mission Planner' ? 360 : 0,
                          scale: role === 'Mission Planner' ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Rocket className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium">Mission Planner</span>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center space-x-2 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-2 cosmic-glow"
                  >
                    {role} Mode
                  </Badge>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button asChild size="lg" className="px-8 py-4 text-lg group">
                    <Link href="/dashboard">
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {role === 'Scientist' && (
                          <>
                            <motion.div
                              animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            >
                              <Brain className="h-5 w-5 mr-2" />
                            </motion.div>
                            Scientist Mode
                          </>
                        )}
                        {role === 'Manager' && (
                          <>
                            <motion.div
                              animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            >
                              <DollarSign className="h-5 w-5 mr-2" />
                            </motion.div>
                            Manager Mode
                          </>
                        )}
                        {role === 'Mission Planner' && (
                          <>
                            <motion.div
                              animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2
                              }}
                            >
                              <Rocket className="h-5 w-5 mr-2" />
                            </motion.div>
                            Mission Planner Mode
                          </>
                        )}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Powerful Features for Research Excellence
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center bg-card/80 backdrop-blur-sm border-2 border-border/70 shadow-lg transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 group hover:scale-105">
                  <CardHeader>
                    <motion.div 
                      className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-primary mb-4 cosmic-glow"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-lg text-white group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

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
    </>
  );
}
