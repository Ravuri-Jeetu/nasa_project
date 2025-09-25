import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPapers, fetchPaperById, sendChatMessage, fetchAnalytics, fetchKnowledgeGraph, Paper, ChatRequest, ChatResponse } from './api';

// Papers queries
export const usePapers = (role: string) => {
  return useQuery({
    queryKey: ['papers', role],
    queryFn: () => fetchPapers(role),
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
