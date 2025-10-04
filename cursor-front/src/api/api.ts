import apiClient from './apiClient';

export interface Paper {
  id: string;
  title: string;
  link: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  journal: string;
  doi?: string;
  keywords: string[];
  citations: number;
  methodology?: string;
  funding?: number;
  return?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  role: string;
  selected_paper_ids: string[];
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

// Papers API
export interface PapersResponse {
  papers: Paper[];
  total: number;
  page: number;
  total_pages: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_previous: boolean;
  role: string;
}

export const fetchPapers = async (role: string, page: number = 1, limit: number = 10): Promise<PapersResponse> => {
  const offset = (page - 1) * limit;
  const res = await apiClient.get('/api/papers', { params: { role, limit, offset } });
  return res.data;
};

export const fetchPaperById = async (id: string, role: string): Promise<Paper> => {
  const res = await apiClient.get(`/api/papers/${id}`, { params: { role } });
  return res.data.paper;
};

// Chat API
export const sendChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post('/api/chat', data);
  return res.data as ChatResponse;
};

export const sendNasaAiChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post('/api/nasa-ai-chat', data);
  return res.data as ChatResponse;
};

export const sendHybridNasaAiChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post('/api/hybrid-nasa-ai-chat', data);
  return res.data as ChatResponse;
};

export const generateHypotheses = async (data: { query: string; role: string }): Promise<{
  hypotheses: Array<{
    hypothesis: string;
    supporting_evidence: string;
    confidence: number;
    type: string;
    related_papers: Array<{ title: string; link: string }>;
  }>;
  metadata: {
    query: string;
    role: string;
    total_papers_analyzed: number;
    generation_date: string;
    hypothesis_types: string[];
  };
  success: boolean;
}> => {
  const res = await apiClient.post('/api/hypothesis', data);
  return res.data;
};

// Analytics API
export const fetchAnalytics = async (role: string) => {
  const res = await apiClient.get('/api/analytics', { params: { role } });
  return res.data;
};

// Knowledge Graph API
export const fetchKnowledgeGraph = async (role: string) => {
  const res = await apiClient.get('/api/knowledge-graph', { params: { role } });
  return res.data;
};

// Gap Finder API
export const fetchGapFinder = async (role: string) => {
  const res = await apiClient.get('/api/gap-finder', { params: { role } });
  return res.data;
};

// Methodology Comparison API
export interface MethodologyExtraction {
  title: string;
  study_type: string;
  subjects: string;
  duration: string;
  conditions: string;
  techniques: string;
  independent_vars: string[];
  dependent_vars: string[];
  outcome: string;
  sample_size: string;
  location: string;
}

export interface MethodologyComparison {
  similarities: string[];
  differences: string[];
  gaps: string[];
  contradictions: string[];
}

export interface MethodologyCompareResponse {
  query: string;
  papers: MethodologyExtraction[];
  comparison: MethodologyComparison;
  total_papers_found: number;
}

export interface MethodologyCompareRequest {
  query: string;
  max_papers?: number;
}

export const fetchMethodologyComparison = async (request: MethodologyCompareRequest): Promise<MethodologyCompareResponse> => {
  const res = await apiClient.post('/api/methodology-compare', request, {
    timeout: 30000, // 30 seconds timeout for methodology comparison
  });
  return res.data;
};

// Mission Planner API
export interface MissionPlannerRequest {
  destination: string;
  crew_size: number;
  duration_days: number;
  payload_capacity: string;
  use_realtime_data?: boolean;
}

export interface RiskAssessment {
  risk: string;
  severity: string;
  expected_loss?: string;
  dose?: string;
  notes?: string;
}

export interface ResourceRequirements {
  food: string;
  water: string;
  oxygen: string;
}

export interface CrewHealthRequirements {
  exercise: string;
  medical_support: string;
}

export interface MissionPlannerResponse {
  mission_feasibility_score: number;
  risks: RiskAssessment[];
  resources: ResourceRequirements;
  crew_health: CrewHealthRequirements;
  recommendations: string[];
  realtime_data?: {
    iss_crew?: {
      current_size: number;
      mission_duration: number;
      exercise_hours: number;
      health_status: string;
    };
    radiation?: {
      current_level: number;
      solar_activity: string;
      space_weather: string;
    };
    research_updates?: {
      latest_bone_loss_study: string;
      muscle_atrophy_rate: string;
      psychological_stress_index: string;
    };
    resource_consumption?: {
      food_per_person_per_day: number;
      water_per_person_per_day: number;
      oxygen_per_person_per_day: number;
    };
  };
  data_timestamp?: string;
}

export const fetchMissionAnalysis = async (request: MissionPlannerRequest): Promise<MissionPlannerResponse> => {
  const res = await apiClient.post('/api/mission-planner', request, {
    timeout: 30000, // 30 seconds timeout for mission analysis
  });
  return res.data;
};

// ==================== DYNAMIC MANAGER DASHBOARD API ====================

// Manager Dashboard Types
export interface DomainAnalytics {
  total_projects: number;
  domains: {
    counts: Record<string, number>;
    percentages: Record<string, number>;
    recent_counts: Record<string, number>;
    funding: Record<string, number>;
    roi: Record<string, number>;
  };
  last_updated: string;
}

export interface InvestmentRecommendation {
  primary_recommendation: {
    domain: string;
    action: string;
    current_studies: number;
    suggested_increase: number;
    expected_outcome: number;
    investment_needed: number;
    potential_roi: number;
  };
  balance_recommendation: {
    domain: string;
    action: string;
    current_studies: number;
    suggested_decrease: number;
    expected_outcome: number;
    cost_savings: number;
    current_roi: number;
  };
  financial_impact: {
    total_investment: number;
    total_savings: number;
    net_investment: number;
    roi_multiplier: number;
  };
}

export interface RedFlagAlert {
  domain: string;
  alert_level: string;
  recent_studies: number;
  total_studies: number;
  threshold: number;
  importance: string;
  suggested_increase: number;
  estimated_cost: number;
  urgency: string;
}

export interface BudgetSimulation {
  domain: string;
  adjustment_percentage: number;
  current: {
    studies: number;
    funding: number;
    roi: number;
  };
  projected: {
    studies: number;
    funding: number;
    roi: number;
  };
  impact: {
    study_difference: number;
    funding_difference: number;
    additional_investment: number;
    cost_savings: number;
  };
}

export interface EmergingArea {
  domain: string;
  growth_score: number;
  recent_studies: number;
  total_studies: number;
  status: string;
  potential: string;
}

export interface ProjectStatus {
  overall_status: Record<string, number>;
  status_percentages: Record<string, number>;
  completion_by_domain: Record<string, { completed: number; total: number }>;
  total_active: number;
  total_completed: number;
}

export interface CrossDomainSynergy {
  total_synergies: number;
  high_potential_synergies: number;
  collaboration_opportunities: number;
  avg_synergy_score: number;
  top_synergies: Array<{
    domain1: string;
    domain2: string;
    synergy_score: number;
    shared_resources: string[];
    benefits: string[];
    recommended_investment: number;
  }>;
  investment_recommendations: Array<{
    title: string;
    description: string;
    investment_amount: number;
    expected_roi: number;
    timeline: string;
    priority: string;
  }>;
}

// Manager Dashboard API Functions
export const fetchDomainAnalytics = async (): Promise<DomainAnalytics> => {
  const res = await apiClient.get('/api/manager/domain-analytics');
  return res.data.data;
};

export const fetchInvestmentRecommendations = async (): Promise<InvestmentRecommendation> => {
  const res = await apiClient.get('/api/manager/investment-recommendations');
  return res.data.data;
};

export const fetchRedFlagAlerts = async (): Promise<RedFlagAlert[]> => {
  const res = await apiClient.get('/api/manager/red-flag-alerts');
  return res.data.data;
};

export const fetchBudgetSimulation = async (
  domain: string, 
  adjustmentPercentage: number
): Promise<BudgetSimulation> => {
  const res = await apiClient.get('/api/manager/budget-simulation', {
    params: { domain, adjustment_percentage: adjustmentPercentage }
  });
  return res.data.data;
};

export const fetchEmergingAreas = async (): Promise<EmergingArea[]> => {
  const res = await apiClient.get('/api/manager/emerging-areas');
  return res.data.data;
};

export const fetchProjectStatus = async (): Promise<ProjectStatus> => {
  const res = await apiClient.get('/api/manager/project-status');
  return res.data.data;
};

export const fetchCrossDomainSynergy = async (): Promise<CrossDomainSynergy> => {
  const res = await apiClient.get('/api/manager/cross-domain-synergy');
  return res.data.data;
};

export const refreshManagerData = async () => {
  const res = await apiClient.post('/api/manager/refresh-data');
  return res.data;
};

export const fetchDashboardSummary = async () => {
  const res = await apiClient.get('/api/manager/dashboard-summary');
  return res.data.data;
};

