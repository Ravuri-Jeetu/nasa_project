'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CheckCircle, Star, Link, Brain, Target, BarChart3, TrendingUp } from 'lucide-react';

interface KnowledgeGraphProps {
  papers: Array<{ id: string; title: string; keywords?: string[]; citations?: number; funding?: number; methodology?: string }>;
  role: string;
}

interface KnowledgeGraphData {
  nodes: Array<{ id: string; type: string; label: string; [key: string]: unknown }>;
  edges: Array<{ source: string; target: string; type?: string; [key: string]: unknown }>;
  research_areas: Record<string, number>;
  methodologies: Record<string, number>;
  statistics: {
    total_papers: number;
    total_nodes: number;
    total_edges: number;
    research_areas_count: number;
    methodologies_count: number;
  };
}

export default function KnowledgeGraph({ papers, role }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [showIntraPaperRelations, setShowIntraPaperRelations] = useState(false);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'research_areas' | 'methodologies' | 'papers'>('research_areas');

  // Fetch real knowledge graph data
  useEffect(() => {
    const fetchKnowledgeGraph = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/knowledge-graph?role=${role}`);
        const data = await response.json();
        if (data.error) {
          console.error('Error fetching knowledge graph:', data.error);
          return;
        }
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching knowledge graph:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeGraph();
  }, [role]);

  // Get top 4 papers based on citations and relevance
  const getTopPapers = () => {
    if (!papers || papers.length === 0) return [];
    
    return papers
      .sort((a, b) => {
        const scoreA = (a.citations || 0) + (a.funding ? Math.log(a.funding) : 0);
        const scoreB = (b.citations || 0) + (b.funding ? Math.log(b.funding) : 0);
        return scoreB - scoreA;
      })
      .slice(0, 4);
  };

  const topPapers = getTopPapers();

  // Generate intrapaper relationship data from real data
  const generateIntraPaperRelations = () => {
    if (selectedPapers.length < 2) return { nodes: [], edges: [] };
    
    const selectedPaperData = papers.filter(p => selectedPapers.includes(p.id));
    const nodes = selectedPaperData.map((paper, index) => ({
      id: paper.id,
      label: paper.title.length > 30 ? paper.title.substring(0, 30) + '...' : paper.title,
      color: `hsl(${index * 90}, 70%, 50%)`,
      citations: paper.citations || 0,
      methodology: paper.methodology || 'Research'
    }));

    // Generate relationships based on real keyword analysis
    const edges = [];
    for (let i = 0; i < selectedPaperData.length; i++) {
      for (let j = i + 1; j < selectedPaperData.length; j++) {
        const paper1 = selectedPaperData[i];
        const paper2 = selectedPaperData[j];
        
        // Calculate similarity score using real keywords
        const keywords1 = new Set((paper1.keywords || []).map((k: string) => k.toLowerCase()));
        const keywords2 = new Set((paper2.keywords || []).map((k: string) => k.toLowerCase()));
        const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
        const similarity = intersection.size / Math.max(keywords1.size, keywords2.size, 1);
        
        if (similarity > 0.2 || paper1.methodology === paper2.methodology) {
          edges.push({
            source: paper1.id,
            target: paper2.id,
            strength: similarity,
            type: similarity > 0.5 ? 'strong' : 'weak'
          });
        }
      }
    }

    return { nodes, edges };
  };

  const getNodePosition = (index: number, total: number, centerX = 400, centerY = 300, radius = 180) => {
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const selectedNodeData = graphData?.nodes.find(node => node.id === selectedNode);

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const getFilteredNodes = () => {
    if (!graphData) return [];
    
    switch (viewMode) {
      case 'research_areas':
        return graphData.nodes.filter(node => node.type === 'research_area');
      case 'methodologies':
        return graphData.nodes.filter(node => node.type === 'methodology');
      case 'papers':
        return graphData.nodes.filter(node => node.type === 'paper');
      default:
        return graphData.nodes;
    }
  };

  const getFilteredEdges = () => {
    if (!graphData) return [];
    
    const filteredNodes = getFilteredNodes();
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    
    return graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing research data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!graphData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Failed to load knowledge graph data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredNodes = getFilteredNodes();
  const filteredEdges = getFilteredEdges();
  const intraPaperData = generateIntraPaperRelations();

  return (
    <div className="space-y-4">
      {/* Enhanced Statistics Overview */}
      <Card className="bg-transparent border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-white font-bold">
              Real Data Analysis
            </span>
          </CardTitle>
          <CardDescription className="text-gray-300 font-medium">
            Knowledge graph built from {graphData.statistics.total_papers} space biology publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-transparent rounded-xl border border-blue-100 transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
              <div className="text-3xl font-bold text-white mb-1">
                {graphData.statistics.total_papers}
              </div>
              <div className="text-sm font-semibold text-white">Total Papers</div>
              <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-transparent rounded-xl border border-green-100 transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
              <div className="text-3xl font-bold text-white mb-1">
                {graphData.statistics.research_areas_count}
              </div>
              <div className="text-sm font-semibold text-white">Research Areas</div>
              <div className="w-full bg-green-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-transparent rounded-xl border border-purple-100 transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
              <div className="text-3xl font-bold text-white mb-1">
                {graphData.statistics.methodologies_count}
              </div>
              <div className="text-sm font-semibold text-white">Methodologies</div>
              <div className="w-full bg-purple-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-transparent rounded-xl border border-orange-100 transition-all duration-300 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50">
              <div className="text-3xl font-bold text-white mb-1">
                {graphData.statistics.total_edges}
              </div>
              <div className="text-sm font-semibold text-white">Relationships</div>
              <div className="w-full bg-orange-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Top Papers Selection */}
      <Card className="bg-transparent border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-600" />
            <span className="text-white font-bold">
              Top 4 Research Papers
            </span>
          </CardTitle>
          <CardDescription className="text-gray-300 font-medium">
            Select papers to analyze their intrapaper relationships using real keyword analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPapers.map((paper, index) => (
              <div
                key={paper.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPapers.includes(paper.id)
                    ? 'border-blue-500 bg-blue-50/20 shadow-md'
                    : 'border-gray-200 bg-transparent hover:outline hover:outline-2 hover:outline-white/50'
                }`}
                onClick={() => togglePaperSelection(paper.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedPapers.includes(paper.id) ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                      )}
                      <Badge variant="outline" className="text-xs font-semibold bg-transparent text-white border-white/30">
                        #{index + 1}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-white">{paper.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {paper.citations || 0} citations
                      </span>
                      {paper.funding && (
                        <span className="flex items-center gap-1">
                          <span className="text-green-600">$</span>
                          {paper.funding.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedPapers.length >= 2 && (
            <div className="mt-6 flex gap-3">
              <Button
                variant={showIntraPaperRelations ? "default" : "outline"}
                onClick={() => setShowIntraPaperRelations(!showIntraPaperRelations)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Brain className="h-4 w-4" />
                {showIntraPaperRelations ? 'Hide' : 'Show'} Intrapaper Relationships
              </Button>
              <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold px-3 py-1">
                {selectedPapers.length} papers selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Knowledge Graph Visualization */}
      <Card className="bg-transparent border-blue-200 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="text-white font-bold">
              Knowledge Graph Visualization
            </span>
          </CardTitle>
          <CardDescription className="text-gray-300 font-medium">
            {showIntraPaperRelations 
              ? 'Real-time analysis of relationships between selected papers'
              : 'Interactive visualization - hover to see labels, click to select and view details'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!showIntraPaperRelations && (
            <div className="mb-6 flex gap-2">
              <Button
                variant={viewMode === 'research_areas' ? "default" : "outline"}
                onClick={() => setViewMode('research_areas')}
                size="sm"
                className={viewMode === 'research_areas' ? 
                  "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : 
                  "hover:bg-blue-50 border-blue-200"
                }
              >
                Research Areas
              </Button>
              <Button
                variant={viewMode === 'methodologies' ? "default" : "outline"}
                onClick={() => setViewMode('methodologies')}
                size="sm"
                className={viewMode === 'methodologies' ? 
                  "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : 
                  "hover:bg-blue-50 border-blue-200"
                }
              >
                Methodologies
              </Button>
              <Button
                variant={viewMode === 'papers' ? "default" : "outline"}
                onClick={() => setViewMode('papers')}
                size="sm"
                className={viewMode === 'papers' ? 
                  "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" : 
                  "hover:bg-blue-50 border-blue-200"
                }
              >
                Top Papers
              </Button>
            </div>
          )}

          <div className="relative h-[600px] bg-transparent rounded-xl overflow-hidden border border-blue-200 shadow-lg">
            {/* Animated background particles */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Hover instruction */}
            <div className="absolute top-4 right-4 bg-transparent backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white border border-gray-200">
              💡 Hover to see labels • Click to select
            </div>
            
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* CSS animations */}
              <style>
                {`
                  @keyframes rotate {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: 15; }
                  }
                  @keyframes smoothScale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1.1); }
                  }
                  @keyframes fadeInUp {
                    from { 
                      opacity: 0; 
                      transform: translateY(10px); 
                    }
                    to { 
                      opacity: 1; 
                      transform: translateY(0); 
                    }
                  }
                  @keyframes dash {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: 10; }
                  }
                `}
              </style>
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9"/>
                </linearGradient>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1"/>
                </filter>
              </defs>
              
              {showIntraPaperRelations ? (
                // Enhanced Intrapaper Relationships Graph
                <>
                  {/* Animated edges for paper relationships */}
                  {intraPaperData.edges.map((edge, index) => {
                    const sourceNode = intraPaperData.nodes.find(n => n.id === edge.source);
                    const targetNode = intraPaperData.nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = intraPaperData.nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = intraPaperData.nodes.findIndex(n => n.id === edge.target);
                    const sourcePos = getNodePosition(sourceIndex, intraPaperData.nodes.length, 400, 300, 120);
                    const targetPos = getNodePosition(targetIndex, intraPaperData.nodes.length, 400, 300, 120);
                    
                    return (
                      <g key={index}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={edge.type === 'strong' ? "url(#edgeGradient)" : "#94A3B8"}
                          strokeWidth={edge.type === 'strong' ? 4 : 2}
                          opacity={edge.strength * 0.8 + 0.3}
                          filter="url(#shadow)"
                          className="animate-pulse"
                        />
                        {/* Animated dots along the edge */}
                        <circle
                          cx={sourcePos.x + (targetPos.x - sourcePos.x) * 0.5}
                          cy={sourcePos.y + (targetPos.y - sourcePos.y) * 0.5}
                          r="2"
                          fill={edge.type === 'strong' ? "#3B82F6" : "#94A3B8"}
                          opacity="0.6"
                          className="animate-ping"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Enhanced nodes for papers with smooth enlargement */}
                  {intraPaperData.nodes.map((node, index) => {
                    const position = getNodePosition(index, intraPaperData.nodes.length, 400, 300, 120);
                    const isSelected = selectedNode === node.id;
                    const nodeSize = isSelected ? 25 : 18;
                    
                    return (
                      <g key={node.id}>
                        {/* Smooth animated outer ring that enlarges with node in place */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={nodeSize + 6}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth={isSelected ? 2 : 0}
                          opacity={isSelected ? 0.6 : 0}
                          className="transition-all duration-300 ease-out"
                          style={{
                            strokeDasharray: isSelected ? "8 4" : "0 0",
                            strokeDashoffset: isSelected ? 0 : 12,
                            animation: isSelected ? "rotate 1.5s linear infinite" : "none",
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        
                        {/* Smooth selection indicator - REMOVED */}
                        
                        {/* Main paper node with smooth hover enlargement in place */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={nodeSize}
                          fill={node.color}
                          stroke={isSelected ? "#1F2937" : "white"}
                          strokeWidth={isSelected ? 3 : 2}
                          filter="url(#glow)"
                          className="cursor-pointer transition-all duration-300 ease-out"
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          onMouseEnter={() => setSelectedNode(node.id)}
                          onMouseLeave={() => setSelectedNode(null)}
                          style={{
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                            filter: isSelected ? 'url(#glow) brightness(1.2) drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' : 'url(#glow)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        
                        {/* Smooth inner highlight that scales in place */}
                        <circle
                          cx={position.x - nodeSize * 0.3}
                          cy={position.y - nodeSize * 0.3}
                          r={nodeSize * 0.3}
                          fill="white"
                          opacity={isSelected ? 0.6 : 0.5}
                          className="transition-all duration-300 ease-out"
                          style={{
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        
                        {/* Smooth paper title that scales in place */}
                        <text
                          x={position.x}
                          y={position.y + 4}
                          textAnchor="middle"
                          className="text-sm font-bold fill-white pointer-events-none drop-shadow-lg transition-all duration-300 ease-out"
                          style={{
                            opacity: isSelected ? 1 : 0.9,
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {node.citations}
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : (
                // Beautiful Modern Research Areas Knowledge Graph
                <>
                  {/* Elegant curved edges with gradient effects */}
                  {filteredEdges.map((edge, index) => {
                    const sourceNode = filteredNodes.find(n => n.id === edge.source);
                    const targetNode = filteredNodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = filteredNodes.findIndex(n => n.id === edge.source);
                    const targetIndex = filteredNodes.findIndex(n => n.id === edge.target);
                    const sourcePos = getNodePosition(sourceIndex, filteredNodes.length);
                    const targetPos = getNodePosition(targetIndex, filteredNodes.length);
                    
                    // Create curved path for more elegant connections
                    const midX = (sourcePos.x + targetPos.x) / 2;
                    const midY = (sourcePos.y + targetPos.y) / 2;
                    const controlX = midX + (Math.random() - 0.5) * 50;
                    const controlY = midY + (Math.random() - 0.5) * 50;
                    
                    const edgeColor = edge.type === 'content_similarity' ? "#3B82F6" : 
                                    edge.type === 'citation_network' ? "#10B981" :
                                    edge.type === 'keyword_cooccurrence' ? "#F59E0B" : "#EF4444";
                    
                    return (
                      <g key={index}>
                        {/* Curved path with gradient */}
                        <defs>
                          <linearGradient id={`edgeGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={edgeColor} stopOpacity="0.8"/>
                            <stop offset="50%" stopColor={edgeColor} stopOpacity="0.4"/>
                            <stop offset="100%" stopColor={edgeColor} stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        
                        <path
                          d={`M ${sourcePos.x} ${sourcePos.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`}
                          stroke={`url(#edgeGradient-${index})`}
                          strokeWidth={Math.max(3, (edge.weight as number) * 8)}
                          fill="none"
                          opacity="0.6"
                          filter="url(#shadow)"
                          className="transition-all duration-700 ease-out"
                          style={{
                            strokeDasharray: "5 5",
                            strokeDashoffset: 0,
                            animation: "dash 2s linear infinite"
                          }}
                        />
                        
                        {/* Floating particles along the edge */}
                        <circle
                          cx={sourcePos.x + (targetPos.x - sourcePos.x) * 0.2}
                          cy={sourcePos.y + (targetPos.y - sourcePos.y) * 0.2}
                          r="2"
                          fill={edgeColor}
                          opacity="0.7"
                          className="animate-pulse"
                        />
                        <circle
                          cx={sourcePos.x + (targetPos.x - sourcePos.x) * 0.8}
                          cy={sourcePos.y + (targetPos.y - sourcePos.y) * 0.8}
                          r="1.5"
                          fill={edgeColor}
                          opacity="0.5"
                          className="animate-ping"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Beautiful modern nodes with enhanced design */}
                  {filteredNodes.map((node, index) => {
                    const position = getNodePosition(index, filteredNodes.length);
                    const isSelected = selectedNode === node.id;
                    // Fixed: Ensure consistent base size for all nodes
                    const baseSize = 22;
                    const nodeSize = isSelected ? 35 : baseSize;
                    
                    // Use the node's color from backend data
                    const nodeColor = (node.color as string) || `hsl(${(index * 60) % 360}, 70%, 55%)`;
                    
                    return (
                      <g key={node.id}>
                        {/* Outer glow ring with pulsing effect */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={nodeSize + 12}
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth={isSelected ? 4 : 2}
                          opacity={isSelected ? 0.6 : 0.3}
                          className="transition-all duration-500 ease-out"
                          style={{
                            strokeDasharray: isSelected ? "15 5" : "0 0",
                            strokeDashoffset: isSelected ? 0 : 20,
                            animation: isSelected ? "rotate 3s linear infinite" : "none",
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.3))'
                          }}
                        />
                        
                        {/* Selection indicator with modern design - REMOVED */}
                        
                        {/* Main node with gradient and modern styling */}
                        <defs>
                          <radialGradient id={`nodeGradient-${node.id}`} cx="30%" cy="30%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
                            <stop offset="70%" stopColor={nodeColor} stopOpacity="0.9"/>
                            <stop offset="100%" stopColor={nodeColor} stopOpacity="1"/>
                          </radialGradient>
                        </defs>
                        
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={nodeSize}
                          fill={`url(#nodeGradient-${node.id})`}
                          stroke={isSelected ? "#1F2937" : "white"}
                          strokeWidth={isSelected ? 5 : 4}
                          filter="url(#glow)"
                          className="cursor-pointer transition-all duration-400 ease-out"
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          onMouseEnter={() => setSelectedNode(node.id)}
                          onMouseLeave={() => setSelectedNode(null)}
                          style={{
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                            filter: isSelected ? 'url(#glow) brightness(1.3) drop-shadow(0 0 25px rgba(59, 130, 246, 0.6))' : 'url(#glow)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isSelected ? '0 0 30px rgba(0,0,0,0.4)' : '0 0 10px rgba(0,0,0,0.2)'
                          }}
                        />
                        
                        {/* Inner highlight with modern design */}
                        <circle
                          cx={position.x - nodeSize * 0.25}
                          cy={position.y - nodeSize * 0.25}
                          r={nodeSize * 0.35}
                          fill="white"
                          opacity={isSelected ? 0.8 : 0.6}
                          className="transition-all duration-400 ease-out"
                          style={{
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'blur(1px)'
                          }}
                        />
                        
                        {/* Enhanced node label with better typography */}
                        <text
                          x={position.x}
                          y={position.y + 6}
                          textAnchor="middle"
                          className={`font-bold fill-white pointer-events-none transition-all duration-400 ease-out ${
                            nodeSize > 25 ? 'text-base' : 'text-sm'
                          }`}
                          style={{
                            opacity: isSelected ? 1 : 0.9,
                            transformOrigin: `${position.x}px ${position.y}px`,
                            transform: isSelected ? 'scale(1.4)' : 'scale(1)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {(node.count as number) || (node.citations as number) || ''}
                        </text>
                        
                        {/* Node type indicator - REMOVED */}
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {/* Enhanced Node Labels - Hidden by default, shown on hover */}
            <div className="absolute inset-0 pointer-events-none">
              {(showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).map((node, index) => {
                const position = getNodePosition(index, (showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).length, 400, 300, showIntraPaperRelations ? 120 : 180);
                return (
                  <div
                    key={`label-${node.id}`}
                    className={`absolute text-sm font-semibold text-gray-800 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-gray-200 max-w-36 transition-all duration-300 opacity-0 pointer-events-none ${
                      selectedNode === node.id ? 'opacity-100' : ''
                    }`}
                    style={{
                      left: position.x - 72,
                      top: position.y + (showIntraPaperRelations ? 30 : 40),
                      width: 144,
                      textAlign: 'center'
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: node.color as string }}
                      />
                      <span className="truncate">{node.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Selected Node Info */}
          {selectedNodeData && !showIntraPaperRelations && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">{selectedNodeData.label}</h3>
              <p className="text-sm text-blue-700 mb-4 font-medium">
                {(selectedNodeData.count as number) || (selectedNodeData.citations as number) || 0} {selectedNodeData.type === 'paper' ? 'citations' : 'papers'} in this area
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-semibold px-3 py-1">
                  {selectedNodeData.type === 'research_area' ? 'Research Area' : 
                   selectedNodeData.type === 'methodology' ? 'Methodology' : 'Research Paper'}
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold px-3 py-1">
                  {role === 'Scientist' ? 'High Impact' : 'Strong ROI'}
                </Badge>
              </div>
            </div>
          )}

          {/* Enhanced Intrapaper Relationship Info */}
          {showIntraPaperRelations && selectedPapers.length >= 2 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-lg">
              <h3 className="font-bold text-green-900 mb-3 text-lg">Real Keyword Analysis</h3>
              <p className="text-sm text-green-700 mb-4 font-medium">
                Analyzing {selectedPapers.length} selected papers using TF-IDF similarity and keyword co-occurrence
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold px-3 py-1">
                  {intraPaperData.edges.length} relationships found
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700 font-semibold px-3 py-1">
                  Real keyword similarity
                </Badge>
              </div>
            </div>
          )}
          
          {/* Enhanced Legend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {(showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).map((node) => (
              <div key={`legend-${node.id}`} className="flex items-center space-x-2 p-2 bg-transparent rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: node.color as string }}
                />
                <span className="text-sm font-semibold text-white">{node.label}</span>
                {showIntraPaperRelations && (
                  <span className="text-xs text-white font-medium">({node.citations as number} citations)</span>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Relationship Legend for Real Data */}
          {!showIntraPaperRelations && (
            <div className="mt-6 p-4 bg-transparent rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-white mb-3">Relationship Types (Real Data):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="text-white font-medium">Content Similarity (TF-IDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  <span className="text-white font-medium">Citation Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  <span className="text-white font-medium">Keyword Co-occurrence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                  <span className="text-white font-medium">Author Collaboration</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Relationship Legend for Intrapaper View */}
          {showIntraPaperRelations && (
            <div className="mt-6 p-4 bg-transparent rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-white mb-3">Relationship Types:</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="text-white font-medium">Strong similarity (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                  <span className="text-white font-medium">Weak similarity (20-50%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
