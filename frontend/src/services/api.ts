import {
  ThermalSource,
  MapPoint,
  PaginatedSourcesResponse,
  SatelliteEvidenceDetail,
  TimelineResponse,
  AnalyticsSummary,
  DistributionItem,
  RiskDistribution,
  AnomalyDistribution,
  IndustrialContextDistribution,
  EvidenceDistribution,
  AlertItem,
  FeatureImportanceResponse,
  FilterState,
  SearchSuggestion,
  TacticalIncidentBrief,
  DisambiguationMatrixResponse,
  CorrelatedThermalEvent,
  DistrictBenchmarkResponse,
  StateBenchmarkResponse,
  DistrictBenchmarkItem,
  ChatResponse,
  StarterQuestion
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  getHealth: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Sources
  getSources: async (
    page: number = 1,
    pageSize: number = 50,
    filters: Partial<FilterState> = {},
    sortBy: string = 'risk_score',
    sortOrder: string = 'desc'
  ): Promise<PaginatedSourcesResponse> => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);

    if (filters.classification) params.set('classification', filters.classification);
    if (filters.risk_band) params.set('risk_band', filters.risk_band);
    if (filters.anomaly_status) params.set('anomaly_status', filters.anomaly_status);
    if (filters.evidence_quality) params.set('evidence_quality', filters.evidence_quality);
    if (filters.satellite_evidence_status) params.set('satellite_evidence_status', filters.satellite_evidence_status);
    if (filters.min_risk_score !== undefined && filters.min_risk_score > 0) {
      params.set('min_risk_score', filters.min_risk_score.toString());
    }
    if (filters.min_frp !== undefined && filters.min_frp > 0) {
      params.set('min_frp', filters.min_frp.toString());
    }
    if (filters.search) params.set('search', filters.search);
    if (filters.has_industrial_context !== undefined) {
      params.set('has_industrial_context', filters.has_industrial_context.toString());
    }
    if (filters.is_alert !== undefined) {
      params.set('is_alert', filters.is_alert.toString());
    }

    const res = await fetch(`${API_BASE}/sources?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
  },

  // Map Points for GIS
  getMapPoints: async (filters: Partial<FilterState> = {}, limit: number = 20000): Promise<MapPoint[]> => {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());

    if (filters.classification) params.set('classification', filters.classification);
    if (filters.risk_band) params.set('risk_band', filters.risk_band);
    if (filters.anomaly_status) params.set('anomaly_status', filters.anomaly_status);
    if (filters.evidence_quality) params.set('evidence_quality', filters.evidence_quality);
    if (filters.satellite_evidence_status) params.set('satellite_evidence_status', filters.satellite_evidence_status);
    if (filters.min_risk_score !== undefined && filters.min_risk_score > 0) {
      params.set('min_risk_score', filters.min_risk_score.toString());
    }
    if (filters.min_frp !== undefined && filters.min_frp > 0) {
      params.set('min_frp', filters.min_frp.toString());
    }
    if (filters.search) params.set('search', filters.search);
    if (filters.has_industrial_context !== undefined) {
      params.set('has_industrial_context', filters.has_industrial_context.toString());
    }
    if (filters.is_alert !== undefined) {
      params.set('is_alert', filters.is_alert.toString());
    }
    if (filters.district) {
      params.set('district', filters.district);
    }
    if (filters.state) {
      params.set('state', filters.state);
    }

    const res = await fetch(`${API_BASE}/sources/map-points?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch map points');
    return res.json();
  },

  // Search Suggestions (Autocomplete)
  getSearchSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
    if (!query || query.trim().length === 0) return [];
    const params = new URLSearchParams({ q: query.trim() });
    const res = await fetch(`${API_BASE}/sources/search-suggestions?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Single Source Detail
  getSourceDetail: async (sourceId: number): Promise<ThermalSource> => {
    const res = await fetch(`${API_BASE}/sources/${sourceId}`);
    if (!res.ok) throw new Error(`Failed to fetch source #${sourceId}`);
    return res.json();
  },

  // Single Source Satellite Evidence
  getSourceSatellite: async (sourceId: number): Promise<SatelliteEvidenceDetail> => {
    const res = await fetch(`${API_BASE}/sources/${sourceId}/satellite`);
    if (!res.ok) throw new Error(`Failed to fetch satellite evidence for #${sourceId}`);
    return res.json();
  },

  // Single Source Timeline
  getSourceTimeline: async (sourceId: number): Promise<TimelineResponse> => {
    const res = await fetch(`${API_BASE}/sources/${sourceId}/timeline`);
    if (!res.ok) throw new Error(`Failed to fetch timeline for #${sourceId}`);
    return res.json();
  },

  // Alerts
  getAlerts: async (level?: string, limit: number = 100): Promise<AlertItem[]> => {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    if (level && level !== 'ALL') params.set('alert_level', level);

    const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },

  getClassificationDistribution: async (): Promise<DistributionItem[]> => {
    const res = await fetch(`${API_BASE}/analytics/classification`);
    if (!res.ok) throw new Error('Failed to fetch classification analytics');
    return res.json();
  },

  getRiskDistribution: async (): Promise<RiskDistribution> => {
    const res = await fetch(`${API_BASE}/analytics/risk`);
    if (!res.ok) throw new Error('Failed to fetch risk analytics');
    return res.json();
  },

  getAnomalyDistribution: async (): Promise<AnomalyDistribution> => {
    const res = await fetch(`${API_BASE}/analytics/anomaly`);
    if (!res.ok) throw new Error('Failed to fetch anomaly analytics');
    return res.json();
  },

  getIndustrialContextDistribution: async (): Promise<IndustrialContextDistribution> => {
    const res = await fetch(`${API_BASE}/analytics/industrial-context`);
    if (!res.ok) throw new Error('Failed to fetch industrial context analytics');
    return res.json();
  },

  getEvidenceDistribution: async (): Promise<EvidenceDistribution> => {
    const res = await fetch(`${API_BASE}/analytics/evidence`);
    if (!res.ok) throw new Error('Failed to fetch evidence analytics');
    return res.json();
  },

  // Explainability / Feature Importance
  getFeatureImportance: async (): Promise<FeatureImportanceResponse> => {
    const res = await fetch(`${API_BASE}/feature-importance`);
    if (!res.ok) throw new Error('Failed to fetch feature importance');
    return res.json();
  },

  // Tactical Intelligence & Disambiguation
  getTacticalBrief: async (sourceId: number): Promise<TacticalIncidentBrief> => {
    const res = await fetch(`${API_BASE}/tactical/brief/${sourceId}`);
    if (!res.ok) throw new Error(`Failed to generate tactical incident brief for source #${sourceId}`);
    return res.json();
  },

  getDisambiguationMatrix: async (): Promise<DisambiguationMatrixResponse> => {
    const res = await fetch(`${API_BASE}/tactical/disambiguation-matrix`);
    if (!res.ok) throw new Error('Failed to fetch disambiguation matrix');
    return res.json();
  },

  // Correlated Thermal Activity Detection
  getCorrelatedEvents: async (status: string = 'OPEN', tag?: string): Promise<CorrelatedThermalEvent[]> => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (tag) params.set('tag', tag);
    const res = await fetch(`${API_BASE}/correlated-events?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch correlated events');
    return res.json();
  },

  getCorrelatedEventDetail: async (eventId: string): Promise<CorrelatedThermalEvent> => {
    const res = await fetch(`${API_BASE}/correlated-events/${eventId}`);
    if (!res.ok) throw new Error(`Failed to fetch correlated event ${eventId}`);
    return res.json();
  },

  triggerCorrelatedDetection: async (strictMode: boolean = false): Promise<any> => {
    const res = await fetch(`${API_BASE}/correlated-events/run-detection?strict_mode=${strictMode}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run correlated detection');
    return res.json();
  },

  // District & State Thermal Risk Benchmarks
  getDistrictBenchmarks: async (mode: string = 'all', state?: string): Promise<DistrictBenchmarkResponse> => {
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    if (state && state !== 'ALL') params.set('state', state);
    const res = await fetch(`${API_BASE}/benchmarks/districts?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch district benchmarks');
    return res.json();
  },

  getStateBenchmarks: async (mode: string = 'all'): Promise<StateBenchmarkResponse> => {
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    const res = await fetch(`${API_BASE}/benchmarks/states?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch state benchmarks');
    return res.json();
  },

  getDistrictDetail: async (districtName: string): Promise<{
    district: DistrictBenchmarkItem;
    top_sources: any[];
    satellite_evidence_samples: any[];
  }> => {
    const res = await fetch(`${API_BASE}/benchmarks/districts/${encodeURIComponent(districtName)}`);
    if (!res.ok) throw new Error(`Failed to fetch district details for ${districtName}`);
    return res.json();
  },

  // Grounded Database Assistant
  sendChatMessage: async (message: string, history?: any[]): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error('Failed to send message to assistant');
    return res.json();
  },

  getChatStarters: async (): Promise<StarterQuestion[]> => {
    const res = await fetch(`${API_BASE}/chat/starters`);
    if (!res.ok) return [];
    return res.json();
  },

  getChatStatus: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/chat/status`);
    if (!res.ok) return null;
    return res.json();
  }
};
