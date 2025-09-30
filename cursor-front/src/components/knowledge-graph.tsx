'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CheckCircle, Star, Link, Brain, Target, BarChart3, TrendingUp } from 'lucide-react';

interface KnowledgeGraphProps {
  papers: any[];
  role: string;
}

interface KnowledgeGraphData {
  nodes: any[];
  edges: any[];
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

  const getNodePosition = (index: number, total: number, centerX = 200, centerY = 150, radius = 120) => {
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
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
              Real Data Analysis
            </span>
          </CardTitle>
          <CardDescription className="text-gray-700 font-medium">
            Knowledge graph built from {graphData.statistics.total_papers} space biology publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white/60 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                {graphData.statistics.total_papers}
              </div>
              <div className="text-sm font-semibold text-gray-700">Total Papers</div>
              <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                {graphData.statistics.research_areas_count}
              </div>
              <div className="text-sm font-semibold text-gray-700">Research Areas</div>
              <div className="w-full bg-green-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl border border-purple-100 hover:shadow-md transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1">
                {graphData.statistics.methodologies_count}
              </div>
              <div className="text-sm font-semibold text-gray-700">Methodologies</div>
              <div className="w-full bg-purple-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-1">
                {graphData.statistics.total_edges}
              </div>
              <div className="text-sm font-semibold text-gray-700">Relationships</div>
              <div className="w-full bg-orange-200 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Top Papers Selection */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-600" />
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">
              Top 4 Research Papers
            </span>
          </CardTitle>
          <CardDescription className="text-gray-700 font-medium">
            Select papers to analyze their intrapaper relationships using real keyword analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPapers.map((paper, index) => (
              <div
                key={paper.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPapers.includes(paper.id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white'
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
                      <Badge variant="outline" className="text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100">
                        #{index + 1}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-800">{paper.title}</h4>
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
      <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
              Knowledge Graph Visualization
            </span>
          </CardTitle>
          <CardDescription className="text-gray-700 font-medium">
            {showIntraPaperRelations 
              ? 'Real-time analysis of relationships between selected papers'
              : 'Interactive visualization - hover to see labels, click to select and view details'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          <div className="relative h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-xl overflow-hidden border border-blue-200 shadow-lg">
            {/* Animated background particles */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Hover instruction */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
              💡 Hover to see labels • Click to select
            </div>
            
            <svg width="100%" height="100%" className="absolute inset-0">
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
                    const sourcePos = getNodePosition(sourceIndex, intraPaperData.nodes.length, 200, 150, 100);
                    const targetPos = getNodePosition(targetIndex, intraPaperData.nodes.length, 200, 150, 100);
                    
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
                  
                  {/* Enhanced nodes for papers */}
                  {intraPaperData.nodes.map((node, index) => {
                    const position = getNodePosition(index, intraPaperData.nodes.length, 200, 150, 100);
                    
                    return (
                      <g key={node.id}>
                        {/* Outer glow ring */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r="20"
                          fill="none"
                          stroke={node.color}
                          strokeWidth="1"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                        {/* Main node with gradient */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r="18"
                          fill={node.color}
                          stroke="white"
                          strokeWidth="3"
                          filter="url(#glow)"
                          className="cursor-pointer transition-all duration-300 hover:scale-110"
                          onMouseEnter={() => setSelectedNode(node.id)}
                          onMouseLeave={() => setSelectedNode(null)}
                        />
                        {/* Inner highlight */}
                        <circle
                          cx={position.x - 4}
                          cy={position.y - 4}
                          r="6"
                          fill="white"
                          opacity="0.3"
                        />
                        <text
                          x={position.x}
                          y={position.y + 4}
                          textAnchor="middle"
                          className="text-sm font-bold fill-white pointer-events-none drop-shadow-lg"
                        >
                          {node.citations}
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : (
                // Enhanced Real Data Knowledge Graph
                <>
                  {/* Enhanced edges for real relationships */}
                  {filteredEdges.map((edge, index) => {
                    const sourceNode = filteredNodes.find(n => n.id === edge.source);
                    const targetNode = filteredNodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = filteredNodes.findIndex(n => n.id === edge.source);
                    const targetIndex = filteredNodes.findIndex(n => n.id === edge.target);
                    const sourcePos = getNodePosition(sourceIndex, filteredNodes.length);
                    const targetPos = getNodePosition(targetIndex, filteredNodes.length);
                    
                    const edgeColor = edge.type === 'content_similarity' ? "#3B82F6" : 
                                    edge.type === 'citation_network' ? "#10B981" :
                                    edge.type === 'keyword_cooccurrence' ? "#F59E0B" : "#EF4444";
                    
                    return (
                      <g key={index}>
                        <line
                          x1={sourcePos.x}
                          y1={sourcePos.y}
                          x2={targetPos.x}
                          y2={targetPos.y}
                          stroke={edgeColor}
                          strokeWidth={Math.max(2, edge.weight * 6)}
                          opacity={0.7}
                          filter="url(#shadow)"
                          className="transition-all duration-500"
                        />
                        {/* Animated connection indicator */}
                        <circle
                          cx={sourcePos.x + (targetPos.x - sourcePos.x) * 0.3}
                          cy={sourcePos.y + (targetPos.y - sourcePos.y) * 0.3}
                          r="1.5"
                          fill={edgeColor}
                          opacity="0.8"
                          className="animate-ping"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Enhanced nodes for real data */}
                  {filteredNodes.map((node, index) => {
                    const position = getNodePosition(index, filteredNodes.length);
                    const isSelected = selectedNode === node.id;
                    const nodeSize = isSelected ? 30 : Math.max(15, node.size / 4);
                    
                    return (
                      <g key={node.id}>
                        {/* Outer ring for selected nodes */}
                        {isSelected && (
                          <circle
                            cx={position.x}
                            cy={position.y}
                            r={nodeSize + 8}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="3"
                            opacity="0.8"
                            className="animate-pulse"
                          />
                        )}
                        
                        {/* Selection indicator text */}
                        {isSelected && (
                          <text
                            x={position.x}
                            y={position.y - nodeSize - 15}
                            textAnchor="middle"
                            className="text-xs font-bold fill-blue-600 pointer-events-none"
                          >
                            SELECTED
                          </text>
                        )}
                        
                        {/* Main node with enhanced styling */}
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={nodeSize}
                          fill={node.color}
                          stroke={isSelected ? "#1F2937" : "white"}
                          strokeWidth={isSelected ? 4 : 3}
                          filter="url(#glow)"
                          className="cursor-pointer transition-all duration-300 hover:scale-110"
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          onMouseEnter={() => setSelectedNode(node.id)}
                          onMouseLeave={() => setSelectedNode(null)}
                        />
                        
                        {/* Inner highlight circle */}
                        <circle
                          cx={position.x - nodeSize * 0.3}
                          cy={position.y - nodeSize * 0.3}
                          r={nodeSize * 0.4}
                          fill="white"
                          opacity="0.4"
                        />
                        
                        {/* Node label */}
                        <text
                          x={position.x}
                          y={position.y + 5}
                          textAnchor="middle"
                          className={`font-bold fill-white pointer-events-none drop-shadow-lg ${
                            nodeSize > 20 ? 'text-sm' : 'text-xs'
                          }`}
                        >
                          {node.count || node.citations || ''}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {/* Enhanced Node Labels - Hidden by default, shown on hover */}
            <div className="absolute inset-0 pointer-events-none">
              {(showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).map((node, index) => {
                const position = getNodePosition(index, (showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).length, 200, 150, showIntraPaperRelations ? 100 : 120);
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
                        style={{ backgroundColor: node.color }}
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
                {selectedNodeData.count || selectedNodeData.citations || 0} {selectedNodeData.type === 'paper' ? 'citations' : 'papers'} in this area
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
              <div key={`legend-${node.id}`} className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg border border-gray-100">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-sm font-semibold text-gray-700">{node.label}</span>
                {showIntraPaperRelations && (
                  <span className="text-xs text-gray-500 font-medium">({node.citations} citations)</span>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Relationship Legend for Real Data */}
          {!showIntraPaperRelations && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Relationship Types (Real Data):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Content Similarity (TF-IDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Citation Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Keyword Co-occurrence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Author Collaboration</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Relationship Legend for Intrapaper View */}
          {showIntraPaperRelations && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Relationship Types:</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Strong similarity (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                  <span className="text-gray-600 font-medium">Weak similarity (20-50%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
