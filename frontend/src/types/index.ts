export interface ThermalSource {
  thermal_source_id: number;
  latitude: number;
  longitude: number;
  mean_frp: number;
  max_frp: number;
  total_detections: number;
  active_days: number;
  persistence_score: number;
  recent_activity_rate: number;
  previous_23d_activity_rate: number;
  activity_change: number;
  recent_activity_status: string;
  activity_surge: boolean;
  strong_activity_surge: boolean;
  newly_emerging: boolean;
  high_recent_intensity: boolean;
  low_persistence: boolean;
  established_source: boolean;
  anomaly_score: number;
  anomaly_status: string;
  label: string;
  label_confidence: string;
  classification: string;
  classification_confidence: number;
  classification_source: string;
  confidence_type: string;
  industrial_context_score: number;
  classification_risk: number;
  anomaly_risk: number;
  industrial_risk: number;
  thermal_intensity_risk: number;
  risk_score: number;
  risk_band: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  sentinel_id?: string;
  mgrs_tile?: string;
  scene_date?: string;
  cloud_cover?: number;
  date_difference_days?: number;
  evidence_available: boolean;
  evidence_quality?: string;
  satellite_image_path?: string;
  satellite_evidence_status: 'AVAILABLE' | 'UNAVAILABLE';
  satellite_image_url?: string;
  diurnal_ratio?: number;
  centroid_drift_m?: number;
  operational_baseline_frp?: number;
  surge_ratio?: number;
  surge_z_score?: number;
  thermal_runaway_status?: string;
  blast_radius_m?: number;
  toxic_dispersion_radius_m?: number;
  evacuation_radius_m?: number;
  cvi_score?: number;
  evidence_sha256?: string;
  swir_band_confidence?: string;
  // Root Cause & Facility Attribution (Enriched from ML Intelligence)
  reason_primary?: string;
  reason_secondary?: string;
  reason_tertiary?: string;
  reasoning_summary?: string;
  nearest_facility_summary?: string;
  industrial_evidence_summary?: string;
  nearest_osm_name?: string;
  nearest_osm_category?: string;
  nearest_osm_distance_km?: number;
  cropland_pct?: number;
  tree_cover_pct?: number;
  built_up_pct?: number;
}

export interface TacticalIncidentBrief {
  dispatch_id: string;
  security_classification: string;
  issuing_authority: string;
  source_id: number;
  mgrs_tile: string;
  coordinates: string;
  latitude: number;
  longitude: number;
  classification: string;
  risk_score: number;
  risk_band: string;
  anomaly_status: string;
  thermal_runaway_status: string;
  current_frp: number;
  baseline_frp: number;
  surge_multiplier: number;
  z_score: number;
  diurnal_ratio: number;
  centroid_drift_m: number;
  satellite_sensor: string;
  sentinel_scene_date?: string;
  satellite_image_url?: string;
  blast_radius_m: number;
  toxic_dispersion_radius_m: number;
  evacuation_radius_m: number;
  cvi_score: number;
  nearest_infrastructure: string;
  recommended_sop: string[];
  dispatch_timestamp: string;
  evidence_sha256: string;
}

export interface DisambiguationDomain {
  domain: string;
  color: string;
  badge: string;
  diurnal_ratio: string;
  diurnal_behavior: string;
  centroid_drift: string;
  centroid_drift_desc: string;
  persistence_index: string;
  osm_proximity: string;
  sentinel2_swir: string;
  typical_frp: string;
}

export interface DisambiguationMatrixResponse {
  title: string;
  description: string;
  domains: DisambiguationDomain[];
  sensor_fusion_spec: {
    viirs_firms: string;
    sentinel2_msi: string;
    temporal_window: string;
  };
}

export interface MapPoint {
  id?: number;
  thermal_source_id?: number;
  lat?: number;
  latitude?: number;
  lon?: number;
  longitude?: number;
  risk_band: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  classification: string;
  anomaly_status: string;
  mean_frp: number;
  max_frp: number;
  industrial_context_score: number;
  satellite_evidence_status: string;
  evidence_quality?: string;
}

export interface PaginatedSourcesResponse {
  items: ThermalSource[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SatelliteEvidenceDetail {
  thermal_source_id: number;
  evidence_status: string;
  sentinel_id?: string;
  mgrs_tile?: string;
  scene_date?: string;
  cloud_cover?: number;
  date_difference_days?: number;
  evidence_quality?: string;
  image_filename?: string;
  image_url?: string;
  message: string;
}

export interface TimelinePoint {
  day: number;
  date: string;
  estimated_frp: number;
  is_active: boolean;
  phase: string;
}

export interface TimelineResponse {
  thermal_source_id: number;
  active_days: number;
  total_detections: number;
  persistence_score: number;
  recent_activity_status: string;
  observation_span_days: number;
  timeline: TimelinePoint[];
}

export interface AnalyticsSummary {
  total_sources: number;
  critical_alerts_count: number;
  high_critical_risk_count: number;
  abnormal_critical_anomaly_count: number;
  industrial_context_sources_count: number;
  satellite_evidence_available_count: number;
  satellite_evidence_coverage_pct: number;
  mean_frp_average: number;
  max_frp_highest: number;
  high_recent_surge_count: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
  avg_risk_score?: number;
  avg_anomaly_score?: number;
}

export interface RiskDistribution {
  bands: DistributionItem[];
  score_histogram: { range: string; lower: number; upper: number; count: number; percentage: number }[];
}

export interface AnomalyDistribution {
  statuses: DistributionItem[];
  surge_metrics: {
    activity_surges: number;
    strong_surges: number;
    newly_emerging: number;
    high_recent_intensity: number;
    low_persistence: number;
    established_sources: number;
  };
}

export interface IndustrialContextDistribution {
  with_industrial_context: number;
  without_industrial_context: number;
  score_bins: { label: string; count: number; percentage: number }[];
}

export interface EvidenceDistribution {
  available_count: number;
  unavailable_count: number;
  coverage_pct: number;
  quality_breakdown: DistributionItem[];
  avg_cloud_cover: number;
}

export interface AlertItem {
  thermal_source_id: number;
  latitude: number;
  longitude: number;
  classification: string;
  classification_confidence: number;
  risk_score: number;
  risk_band: string;
  anomaly_status: string;
  anomaly_score: number;
  industrial_context_score: number;
  mean_frp: number;
  max_frp: number;
  evidence_quality?: string;
  satellite_evidence_status: string;
  recent_activity_status: string;
  urgency_rank: number;
  alert_level: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  tags: string[];
}

export interface FeatureImportanceItem {
  feature: string;
  display_name: string;
  importance: number;
  importance_pct: number;
  category: string;
  description: string;
}

export interface FeatureImportanceResponse {
  model_name: string;
  features: FeatureImportanceItem[];
  category_summary: { category: string; total_pct: number }[];
  transparency_disclosure: string;
}

export interface FilterState {
  classification: string;
  risk_band: string;
  anomaly_status: string;
  evidence_quality: string;
  satellite_evidence_status: string;
  min_risk_score: number;
  min_frp: number;
  search: string;
  has_industrial_context?: boolean;
  is_alert?: boolean;
}

export interface SearchSuggestion {
  type: 'location' | 'source' | 'classification' | 'risk_band';
  title: string;
  subtitle: string;
  value: string;
  lat?: number;
  lon?: number;
  zoom?: number;
  count?: number;
  source_id?: number;
  bbox?: [number, number, number, number];
}

export interface TargetLocation {
  lat: number;
  lon: number;
  zoom?: number;
  label?: string;
  count?: number;
}

export interface CorrelatedThermalEvent {
  event_id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  tag: 'INVESTIGATE_INDUSTRIAL' | 'LOW_URGENCY_AGRICULTURAL';
  region_name: string;
  source_count: number;
  source_ids: number[];
  centroid_lat: number;
  centroid_lon: number;
  z_score: number;
  baseline_mean: number;
  baseline_std: number;
  start_date: string;
  end_date: string;
  first_detected_at: string;
  last_detected_at: string;
  consecutive_misses: number;
  detection_run_id: number;
  member_sources?: any[];
}


