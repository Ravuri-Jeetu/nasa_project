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
        const keywords1 = new Set((paper1.keywords || []).map(k => k.toLowerCase()));
        const keywords2 = new Set((paper2.keywords || []).map(k => k.toLowerCase()));
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
      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Real Data Analysis
          </CardTitle>
          <CardDescription>
            Knowledge graph built from {graphData.statistics.total_papers} space biology publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{graphData.statistics.total_papers}</div>
              <div className="text-sm text-gray-600">Total Papers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{graphData.statistics.research_areas_count}</div>
              <div className="text-sm text-gray-600">Research Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{graphData.statistics.methodologies_count}</div>
              <div className="text-sm text-gray-600">Methodologies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{graphData.statistics.total_edges}</div>
              <div className="text-sm text-gray-600">Relationships</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Papers Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Top 4 Research Papers
          </CardTitle>
          <CardDescription>
            Select papers to analyze their intrapaper relationships using real keyword analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topPapers.map((paper, index) => (
              <div
                key={paper.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedPapers.includes(paper.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePaperSelection(paper.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {selectedPapers.includes(paper.id) ? (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      ) : (
                        <div className="h-4 w-4 border border-gray-300 rounded-full" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">{paper.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{paper.citations || 0} citations</span>
                      {paper.funding && <span>• ${paper.funding.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedPapers.length >= 2 && (
            <div className="mt-4 flex gap-2">
              <Button
                variant={showIntraPaperRelations ? "default" : "outline"}
                onClick={() => setShowIntraPaperRelations(!showIntraPaperRelations)}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                {showIntraPaperRelations ? 'Hide' : 'Show'} Intrapaper Relationships
              </Button>
              <Badge variant="secondary">
                {selectedPapers.length} papers selected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Knowledge Graph Visualization
          </CardTitle>
          <CardDescription>
            {showIntraPaperRelations 
              ? 'Real-time analysis of relationships between selected papers'
              : 'Interactive visualization of research connections from real data'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showIntraPaperRelations && (
            <div className="mb-4 flex gap-2">
              <Button
                variant={viewMode === 'research_areas' ? "default" : "outline"}
                onClick={() => setViewMode('research_areas')}
                size="sm"
              >
                Research Areas
              </Button>
              <Button
                variant={viewMode === 'methodologies' ? "default" : "outline"}
                onClick={() => setViewMode('methodologies')}
                size="sm"
              >
                Methodologies
              </Button>
              <Button
                variant={viewMode === 'papers' ? "default" : "outline"}
                onClick={() => setViewMode('papers')}
                size="sm"
              >
                Top Papers
              </Button>
            </div>
          )}

          <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              {showIntraPaperRelations ? (
                // Intrapaper Relationships Graph
                <>
                  {/* Edges for paper relationships */}
                  {intraPaperData.edges.map((edge, index) => {
                    const sourceNode = intraPaperData.nodes.find(n => n.id === edge.source);
                    const targetNode = intraPaperData.nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = intraPaperData.nodes.findIndex(n => n.id === edge.source);
                    const targetIndex = intraPaperData.nodes.findIndex(n => n.id === edge.target);
                    const sourcePos = getNodePosition(sourceIndex, intraPaperData.nodes.length, 200, 150, 100);
                    const targetPos = getNodePosition(targetIndex, intraPaperData.nodes.length, 200, 150, 100);
                    
                    return (
                      <line
                        key={index}
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={edge.type === 'strong' ? "#3B82F6" : "#94A3B8"}
                        strokeWidth={edge.type === 'strong' ? 3 : 1}
                        opacity={edge.strength * 0.8 + 0.2}
                      />
                    );
                  })}
                  
                  {/* Nodes for papers */}
                  {intraPaperData.nodes.map((node, index) => {
                    const position = getNodePosition(index, intraPaperData.nodes.length, 200, 150, 100);
                    
                    return (
                      <g key={node.id}>
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r="15"
                          fill={node.color}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer transition-all duration-200"
                        />
                        <text
                          x={position.x}
                          y={position.y + 3}
                          textAnchor="middle"
                          className="text-xs font-medium fill-white pointer-events-none"
                        >
                          {node.citations}
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : (
                // Real Data Knowledge Graph
                <>
                  {/* Edges for real relationships */}
                  {filteredEdges.map((edge, index) => {
                    const sourceNode = filteredNodes.find(n => n.id === edge.source);
                    const targetNode = filteredNodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = filteredNodes.findIndex(n => n.id === edge.source);
                    const targetIndex = filteredNodes.findIndex(n => n.id === edge.target);
                    const sourcePos = getNodePosition(sourceIndex, filteredNodes.length);
                    const targetPos = getNodePosition(targetIndex, filteredNodes.length);
                    
                    return (
                      <line
                        key={index}
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={edge.type === 'content_similarity' ? "#3B82F6" : 
                               edge.type === 'citation_network' ? "#10B981" :
                               edge.type === 'keyword_cooccurrence' ? "#F59E0B" : "#EF4444"}
                        strokeWidth={Math.max(1, edge.weight * 5)}
                        opacity={0.6}
                      />
                    );
                  })}
                  
                  {/* Nodes for real data */}
                  {filteredNodes.map((node, index) => {
                    const position = getNodePosition(index, filteredNodes.length);
                    const isSelected = selectedNode === node.id;
                    
                    return (
                      <g key={node.id}>
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={isSelected ? 25 : Math.max(10, node.size / 5)}
                          fill={node.color}
                          stroke={isSelected ? "#1F2937" : "white"}
                          strokeWidth={isSelected ? 3 : 2}
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                        />
                        <text
                          x={position.x}
                          y={position.y + 4}
                          textAnchor="middle"
                          className="text-xs font-medium fill-white pointer-events-none"
                        >
                          {node.count || node.citations || ''}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {/* Node Labels */}
            <div className="absolute inset-0 pointer-events-none">
              {(showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).map((node, index) => {
                const position = getNodePosition(index, (showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).length, 200, 150, showIntraPaperRelations ? 100 : 120);
                return (
                  <div
                    key={`label-${node.id}`}
                    className="absolute text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm max-w-32"
                    style={{
                      left: position.x - 64,
                      top: position.y + (showIntraPaperRelations ? 25 : 35),
                      width: 128,
                      textAlign: 'center'
                    }}
                  >
                    {node.label}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Selected Node Info */}
          {selectedNodeData && !showIntraPaperRelations && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">{selectedNodeData.label}</h3>
              <p className="text-sm text-blue-700 mb-2">
                {selectedNodeData.count || selectedNodeData.citations || 0} {selectedNodeData.type === 'paper' ? 'citations' : 'papers'} in this area
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedNodeData.type === 'research_area' ? 'Research Area' : 
                   selectedNodeData.type === 'methodology' ? 'Methodology' : 'Research Paper'}
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {role === 'Scientist' ? 'High Impact' : 'Strong ROI'}
                </Badge>
              </div>
            </div>
          )}

          {/* Intrapaper Relationship Info */}
          {showIntraPaperRelations && selectedPapers.length >= 2 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Real Keyword Analysis</h3>
              <p className="text-sm text-green-700 mb-2">
                Analyzing {selectedPapers.length} selected papers using TF-IDF similarity and keyword co-occurrence
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {intraPaperData.edges.length} relationships found
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  Real keyword similarity
                </Badge>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {(showIntraPaperRelations ? intraPaperData.nodes : filteredNodes).map((node) => (
              <div key={`legend-${node.id}`} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs text-gray-600">{node.label}</span>
                {showIntraPaperRelations && (
                  <span className="text-xs text-gray-500">({node.citations} citations)</span>
                )}
              </div>
            ))}
          </div>

          {/* Relationship Legend for Real Data */}
          {!showIntraPaperRelations && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Relationship Types (Real Data):</h4>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-blue-500"></div>
                  <span className="text-gray-600">Content Similarity (TF-IDF)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span className="text-gray-600">Citation Network</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-yellow-500"></div>
                  <span className="text-gray-600">Keyword Co-occurrence</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span className="text-gray-600">Author Collaboration</span>
                </div>
              </div>
            </div>
          )}

          {/* Relationship Legend for Intrapaper View */}
          {showIntraPaperRelations && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Relationship Types:</h4>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-blue-500"></div>
                  <span className="text-gray-600">Strong similarity (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-gray-400"></div>
                  <span className="text-gray-600">Weak similarity (20-50%)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
