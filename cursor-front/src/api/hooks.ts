import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPapers, fetchPaperById, sendChatMessage, sendNasaAiChatMessage, sendHybridNasaAiChatMessage, generateHypotheses, fetchAnalytics, fetchKnowledgeGraph, fetchGapFinder, fetchMethodologyComparison, fetchMissionAnalysis, fetchSynergyAnalysis, fetchDomainSynergies, fetchSynergyDetails, fetchSynergyInvestmentRecommendations, refreshSynergyAnalysis, fetchDomainAnalytics, fetchInvestmentRecommendations, fetchRedFlagAlerts, fetchEmergingAreas, fetchProjectStatus, fetchBudgetSimulation, ChatRequest, MethodologyCompareRequest, MissionPlannerRequest } from './api';

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

// NASA AI Chat mutation
export const useNasaAiChatMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChatRequest) => sendNasaAiChatMessage(data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// Hybrid NASA AI Chat mutation
export const useHybridNasaAiChatMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChatRequest) => sendHybridNasaAiChatMessage(data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// Hypothesis generation mutation
export const useHypothesisGenerationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { query: string; role: string }) => generateHypotheses(data),
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

// Mission Planner Hook
export const useMissionAnalysis = (request: MissionPlannerRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['mission-analysis', request.destination, request.crew_size, request.duration_days, request.payload_capacity],
    queryFn: () => fetchMissionAnalysis(request),
    enabled: enabled && request.destination.trim().length > 0 && request.crew_size > 0 && request.duration_days > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });
};

// Synergy Analysis queries
export const useSynergyAnalysis = () => {
  return useQuery({
    queryKey: ['synergy-analysis'],
    queryFn: fetchSynergyAnalysis,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useDomainSynergies = (domain: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['domain-synergies', domain, limit],
    queryFn: () => fetchDomainSynergies(domain, limit),
    enabled: !!domain,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSynergyDetails = (projectA: string, projectB: string) => {
  return useQuery({
    queryKey: ['synergy-details', projectA, projectB],
    queryFn: () => fetchSynergyDetails(projectA, projectB),
    enabled: !!projectA && !!projectB,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSynergyInvestmentRecommendations = (budget: number, riskTolerance: string = "Medium") => {
  return useQuery({
    queryKey: ['synergy-investment', budget, riskTolerance],
    queryFn: () => fetchSynergyInvestmentRecommendations(budget, riskTolerance),
    enabled: budget > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRefreshSynergyAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: refreshSynergyAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synergy-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['domain-synergies'] });
      queryClient.invalidateQueries({ queryKey: ['synergy-investment'] });
    },
  });
};

// Manager Dashboard hooks
export const useDomainAnalytics = () => {
  return useQuery({
    queryKey: ['domain-analytics'],
    queryFn: fetchDomainAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvestmentRecommendations = () => {
  return useQuery({
    queryKey: ['investment-recommendations'],
    queryFn: fetchInvestmentRecommendations,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRedFlagAlerts = () => {
  return useQuery({
    queryKey: ['red-flag-alerts'],
    queryFn: fetchRedFlagAlerts,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEmergingAreas = () => {
  return useQuery({
    queryKey: ['emerging-areas'],
    queryFn: fetchEmergingAreas,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectStatus = () => {
  return useQuery({
    queryKey: ['project-status'],
    queryFn: fetchProjectStatus,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBudgetSimulation = (domain: string, adjustmentPercentage: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['budget-simulation', domain, adjustmentPercentage],
    queryFn: () => fetchBudgetSimulation(domain, adjustmentPercentage),
    enabled: enabled && !!domain,
    staleTime: 5 * 60 * 1000,
  });
};
