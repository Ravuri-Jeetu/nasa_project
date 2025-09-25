'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CheckCircle, Star, Link, Brain, Target } from 'lucide-react';

interface KnowledgeGraphProps {
  papers: any[];
  role: string;
}

export default function KnowledgeGraph({ papers, role }: KnowledgeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [showIntraPaperRelations, setShowIntraPaperRelations] = useState(false);

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

  // Generate intrapaper relationship data
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

    // Generate relationships based on common keywords and methodologies
    const edges = [];
    for (let i = 0; i < selectedPaperData.length; i++) {
      for (let j = i + 1; j < selectedPaperData.length; j++) {
        const paper1 = selectedPaperData[i];
        const paper2 = selectedPaperData[j];
        
        // Calculate similarity score
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

  // Generate research area graph data
  const generateResearchAreaGraph = () => {
    const nodes = [];
    const edges = [];
    
    // Create nodes for different research areas based on actual papers
    const researchAreas = [
      { id: 'microgravity', label: 'Microgravity', color: '#3B82F6', count: 0 },
      { id: 'stem-cells', label: 'Stem Cells', color: '#10B981', count: 0 },
      { id: 'bone-research', label: 'Bone Research', color: '#F59E0B', count: 0 },
      { id: 'radiation', label: 'Radiation Biology', color: '#EF4444', count: 0 },
      { id: 'cardiac', label: 'Cardiac Research', color: '#8B5CF6', count: 0 },
      { id: 'gene-expression', label: 'Gene Expression', color: '#06B6D4', count: 0 },
    ];

    // Count papers in each area
    papers.forEach(paper => {
      const title = (paper.title || '').toLowerCase();
      const abstract = (paper.abstract || '').toLowerCase();
      const text = title + ' ' + abstract;
      
      if (text.includes('microgravity') || text.includes('space')) {
        researchAreas[0].count++;
      }
      if (text.includes('stem cell') || text.includes('embryonic')) {
        researchAreas[1].count++;
      }
      if (text.includes('bone') || text.includes('skeletal')) {
        researchAreas[2].count++;
      }
      if (text.includes('radiation') || text.includes('cosmic')) {
        researchAreas[3].count++;
      }
      if (text.includes('cardiac') || text.includes('heart')) {
        researchAreas[4].count++;
      }
      if (text.includes('gene') || text.includes('expression')) {
        researchAreas[5].count++;
      }
    });

    // Create connections between research areas
    const connections = [
      ['microgravity', 'stem-cells'],
      ['microgravity', 'bone-research'],
      ['stem-cells', 'gene-expression'],
      ['bone-research', 'radiation'],
      ['cardiac', 'microgravity'],
      ['gene-expression', 'radiation'],
      ['microgravity', 'cardiac'],
    ];

    return { nodes: researchAreas, edges: connections };
  };

  const researchAreaData = generateResearchAreaGraph();
  const intraPaperData = generateIntraPaperRelations();

  const getNodePosition = (index: number, total: number, centerX = 200, centerY = 150, radius = 120) => {
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const selectedNodeData = researchAreaData.nodes.find(node => node.id === selectedNode);

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Papers Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Top 4 Research Papers
          </CardTitle>
          <CardDescription>
            Select papers to analyze their intrapaper relationships
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

      {/* Knowledge Graph Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {showIntraPaperRelations ? 'Intrapaper Relationship Graph' : 'Research Knowledge Graph'}
          </CardTitle>
          <CardDescription>
            {showIntraPaperRelations 
              ? 'Visualization of relationships between selected papers'
              : 'Interactive visualization of research connections and relationships'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                // Research Areas Graph
                <>
                  {/* Edges for research areas */}
                  {researchAreaData.edges.map((edge, index) => {
                    const sourceNode = researchAreaData.nodes.find(n => n.id === edge[0]);
                    const targetNode = researchAreaData.nodes.find(n => n.id === edge[1]);
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceIndex = researchAreaData.nodes.findIndex(n => n.id === edge[0]);
                    const targetIndex = researchAreaData.nodes.findIndex(n => n.id === edge[1]);
                    const sourcePos = getNodePosition(sourceIndex, researchAreaData.nodes.length);
                    const targetPos = getNodePosition(targetIndex, researchAreaData.nodes.length);
                    
                    return (
                      <line
                        key={index}
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    );
                  })}
                  
                  {/* Nodes for research areas */}
                  {researchAreaData.nodes.map((node, index) => {
                    const position = getNodePosition(index, researchAreaData.nodes.length);
                    const isSelected = selectedNode === node.id;
                    
                    return (
                      <g key={node.id}>
                        <circle
                          cx={position.x}
                          cy={position.y}
                          r={isSelected ? 25 : 20}
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
                          {node.count}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {/* Node Labels */}
            <div className="absolute inset-0 pointer-events-none">
              {(showIntraPaperRelations ? intraPaperData.nodes : researchAreaData.nodes).map((node, index) => {
                const position = getNodePosition(index, (showIntraPaperRelations ? intraPaperData.nodes : researchAreaData.nodes).length, 200, 150, showIntraPaperRelations ? 100 : 120);
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
                {selectedNodeData.count} research papers in this area
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Active Research Area
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
              <h3 className="font-semibold text-green-900 mb-2">Intrapaper Relationships</h3>
              <p className="text-sm text-green-700 mb-2">
                Analyzing {selectedPapers.length} selected papers for keyword and methodology similarities
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {intraPaperData.edges.length} relationships found
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  Keyword-based similarity
                </Badge>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {(showIntraPaperRelations ? intraPaperData.nodes : researchAreaData.nodes).map((node) => (
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
