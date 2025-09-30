import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPapers, fetchPaperById, sendChatMessage, fetchAnalytics, fetchKnowledgeGraph, fetchGapFinder, fetchMethodologyComparison, Paper, ChatRequest, ChatResponse, PapersResponse, MethodologyCompareRequest } from './api';

// Papers queries
export const usePapers = (role: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['papers', role, page, limit],
    queryFn: () => fetchPapers(role, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePaper = (id: string, role: string) => {
  return useQuery({
    queryKey: ['paper', id, role],
    queryFn: () => fetchPaperById(id, role),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Chat mutation
export const useChatMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChatRequest) => sendChatMessage(data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// Analytics queries
export const useAnalytics = (role: string) => {
  return useQuery({
    queryKey: ['analytics', role],
    queryFn: () => fetchAnalytics(role),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useKnowledgeGraph = (role: string) => {
  return useQuery({
    queryKey: ['knowledge-graph', role],
    queryFn: () => fetchKnowledgeGraph(role),
    staleTime: 10 * 60 * 1000,
  });
};

export const useGapFinder = (role: string) => {
  return useQuery({
    queryKey: ['gap-finder', role],
    queryFn: () => fetchGapFinder(role),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Methodology Comparison Hook
export const useMethodologyComparison = (request: MethodologyCompareRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['methodology-comparison', request.query, request.max_papers],
    queryFn: () => fetchMethodologyComparison(request),
    enabled: enabled && request.query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });
};
