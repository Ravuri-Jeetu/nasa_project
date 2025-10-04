'use client';

import React, { useState } from 'react';
import { useHypothesisGenerationMutation } from '@/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Lightbulb, FileText, TrendingUp, Target } from 'lucide-react';

interface Hypothesis {
  hypothesis: string;
  supporting_evidence: string;
  confidence: number;
  type: string;
  related_papers: Array<{ title: string; link: string; }>;
}

interface HypothesisResponse {
  hypotheses: Hypothesis[];
  metadata: {
    query: string;
    role: string;
    total_papers_analyzed: number;
    generation_date: string;
    hypothesis_types: string[];
  };
  success: boolean;
}

const HypothesisGenerator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [metadata, setMetadata] = useState<HypothesisResponse['metadata'] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hypothesisMutation = useHypothesisGenerationMutation();

  const handleGenerateHypotheses = async () => {
    if (!query.trim()) {
      setError('Please enter a research query');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await hypothesisMutation.mutateAsync({
        query: query.trim(),
        role: 'scientist'
      });

      if (result.success) {
        setHypotheses(result.hypotheses);
        setMetadata(result.metadata);
      } else {
        setError('Failed to generate hypotheses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getHypothesisIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gap-based':
        return <Target className="w-4 h-4" />;
      case 'methodology-driven':
        return <FileText className="w-4 h-4" />;
      case 'trend-based':
        return <TrendingUp className="w-4 h-4" />;
      case 'custom query':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">🧪 Hypothesis Generation</h2>
        <p className="text-gray-300">
          Generate testable scientific hypotheses based on NASA space biology research
        </p>
      </div>

      {/* Input Section */}
      <Card className="bg-transparent border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Research Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research topic or question (e.g., 'microgravity effects on bone density')"
              className="bg-transparent border-gray-600 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateHypotheses()}
            />
            <Button
              onClick={handleGenerateHypotheses}
              disabled={isGenerating || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Generate
            </Button>
          </div>
          
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      {metadata && (
        <Card className="bg-transparent border-gray-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Query:</span>
                <p className="text-white font-medium">{metadata.query}</p>
              </div>
              <div>
                <span className="text-gray-400">Papers Analyzed:</span>
                <p className="text-white font-medium">{metadata.total_papers_analyzed}</p>
              </div>
              <div>
                <span className="text-gray-400">Hypothesis Types:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {metadata.hypothesis_types.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hypotheses Results */}
      {hypotheses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Generated Hypotheses ({hypotheses.length})
          </h3>
          
          {hypotheses.map((hypothesis, index) => (
            <Card key={index} className="bg-transparent border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getHypothesisIcon(hypothesis.type)}
                    <Badge variant="outline" className="text-xs">
                      {hypothesis.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getConfidenceColor(hypothesis.confidence)}`}>
                      {hypothesis.confidence}% Confidence
                    </div>
                    <div className="text-xs text-gray-400">
                      {getConfidenceLabel(hypothesis.confidence)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hypothesis Statement */}
                <div>
                  <h4 className="text-white font-medium mb-2">Hypothesis:</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {hypothesis.hypothesis}
                  </p>
                </div>

                {/* Supporting Evidence */}
                <div>
                  <h4 className="text-white font-medium mb-2">Supporting Evidence:</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {hypothesis.supporting_evidence}
                  </p>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Confidence Level</span>
                    <span>{hypothesis.confidence}%</span>
                  </div>
                  <Progress 
                    value={hypothesis.confidence} 
                    className="h-2"
                  />
                </div>

                {/* Related Papers */}
                {hypothesis.related_papers.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Related Research:</h4>
                    <div className="space-y-1">
                      {hypothesis.related_papers.map((paper, paperIndex) => (
                        <div key={paperIndex} className="text-sm text-gray-400 bg-gray-800/50 p-2 rounded hover:bg-gray-700/50 transition-colors">
                          <a 
                            href={paper.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                          >
                            {paper.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Example Queries */}
      {hypotheses.length === 0 && !isGenerating && (
        <Card className="bg-transparent border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">💡 Example Research Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "microgravity effects on bone density",
                "radiation exposure and immune system",
                "plant growth in space environments",
                "psychological effects of long-duration missions",
                "cardiovascular adaptations to space",
                "muscle atrophy prevention strategies"
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => setQuery(example)}
                >
                  <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HypothesisGenerator;
