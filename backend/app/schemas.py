"""
Pydantic data schemas for THERMOINTEL REST API.
"""
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class ThermalSourceBase(BaseModel):
    thermal_source_id: int
    latitude: float
    longitude: float
    mean_frp: float
    max_frp: float
    total_detections: int
    active_days: int
    persistence_score: float
    recent_activity_rate: float
    previous_23d_activity_rate: float
    activity_change: float
    recent_activity_status: str
    activity_surge: bool
    strong_activity_surge: bool
    newly_emerging: bool
    high_recent_intensity: bool
    low_persistence: bool
    established_source: bool
    anomaly_score: float
    anomaly_status: str
    label: str
    label_confidence: str
    classification: str
    classification_confidence: float
    classification_source: str
    confidence_type: str
    industrial_context_score: int
    classification_risk: int
    anomaly_risk: int
    industrial_risk: int
    thermal_intensity_risk: float
    risk_score: float
    risk_band: str
    sentinel_id: Optional[str] = None
    mgrs_tile: Optional[str] = None
    scene_date: Optional[str] = None
    cloud_cover: Optional[float] = None
    date_difference_days: Optional[float] = None
    evidence_available: bool
    evidence_quality: Optional[str] = None
    satellite_image_path: Optional[str] = None
    satellite_evidence_status: str

class ThermalSourceDetail(ThermalSourceBase):
    satellite_image_url: Optional[str] = None
    diurnal_ratio: Optional[float] = None
    centroid_drift_m: Optional[float] = None
    operational_baseline_frp: Optional[float] = None
    surge_ratio: Optional[float] = None
    surge_z_score: Optional[float] = None
    thermal_runaway_status: Optional[str] = None
    blast_radius_m: Optional[int] = 500
    toxic_dispersion_radius_m: Optional[int] = 2000
    evacuation_radius_m: Optional[int] = 5000
    cvi_score: Optional[float] = None
    evidence_sha256: Optional[str] = None
    swir_band_confidence: Optional[str] = None
    # Root Cause & Facility Attribution (Enriched from ML Intelligence)
    reason_primary: Optional[str] = None
    reason_secondary: Optional[str] = None
    reason_tertiary: Optional[str] = None
    reasoning_summary: Optional[str] = None
    nearest_facility_summary: Optional[str] = None
    industrial_evidence_summary: Optional[str] = None
    nearest_osm_name: Optional[str] = None
    nearest_osm_category: Optional[str] = None
    nearest_osm_distance_km: Optional[float] = None
    cropland_pct: Optional[float] = None
    tree_cover_pct: Optional[float] = None
    built_up_pct: Optional[float] = None

class TacticalIncidentBrief(BaseModel):
    dispatch_id: str
    security_classification: str = "OFFICIAL / DISASTER RESPONSE"
    issuing_authority: str = "NTRO / NATIONAL CRISIS MANAGEMENT DIRECTIVE"
    source_id: int
    mgrs_tile: str
    coordinates: str
    latitude: float
    longitude: float
    classification: str
    risk_score: float
    risk_band: str
    anomaly_status: str
    thermal_runaway_status: str
    current_frp: float
    baseline_frp: float
    surge_multiplier: float
    z_score: float
    diurnal_ratio: float
    centroid_drift_m: float
    satellite_sensor: str
    sentinel_scene_date: Optional[str] = None
    satellite_image_url: Optional[str] = None
    blast_radius_m: int = 500
    toxic_dispersion_radius_m: int = 2000
    evacuation_radius_m: int = 5000
    cvi_score: float
    nearest_infrastructure: str
    recommended_sop: List[str]
    dispatch_timestamp: str
    evidence_sha256: str


class MapPoint(BaseModel):
    id: int
    lat: float
    lon: float
    thermal_source_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_band: str
    risk_score: float
    classification: str
    anomaly_status: str
    mean_frp: float
    max_frp: float
    industrial_context_score: int
    satellite_evidence_status: str
    evidence_quality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class PaginatedSourcesResponse(BaseModel):
    items: List[ThermalSourceDetail]
    total: int
    page: int
    page_size: int
    total_pages: int

class SatelliteEvidenceDetail(BaseModel):
    thermal_source_id: int
    evidence_status: str
    sentinel_id: Optional[str] = None
    mgrs_tile: Optional[str] = None
    scene_date: Optional[str] = None
    cloud_cover: Optional[float] = None
    date_difference_days: Optional[float] = None
    evidence_quality: Optional[str] = None
    image_filename: Optional[str] = None
    image_url: Optional[str] = None
    message: str

class TimelinePoint(BaseModel):
    day: int
    date: str
    estimated_frp: float
    is_active: bool
    phase: str
    day_frp: Optional[float] = None
    night_frp: Optional[float] = None
    daynight: Optional[str] = None

class ObservationItem(BaseModel):
    obs_index: int
    date: str
    date_formatted: str
    frp: float
    pass_type: str
    satellite: str
    brightness_temp_k: float
    is_peak: bool = False

class TimelineResponse(BaseModel):
    thermal_source_id: int
    active_days: int
    total_detections: int
    persistence_score: float
    recent_activity_status: str
    observation_span_days: int
    timeline: List[TimelinePoint]
    observations: Optional[List[ObservationItem]] = None
    night_ratio: Optional[float] = None
    day_ratio: Optional[float] = None
    start_date: Optional[str] = None
    mid_date: Optional[str] = None
    end_date: Optional[str] = None

class AnalyticsSummary(BaseModel):
    total_sources: int
    critical_alerts_count: int
    high_critical_risk_count: int
    abnormal_critical_anomaly_count: int
    industrial_context_sources_count: int
    satellite_evidence_available_count: int
    satellite_evidence_coverage_pct: float
    mean_frp_average: float
    max_frp_highest: float
    high_recent_surge_count: int

class DistributionItem(BaseModel):
    name: str
    count: int
    percentage: float
    avg_risk_score: Optional[float] = None
    avg_anomaly_score: Optional[float] = None

class RiskDistribution(BaseModel):
    bands: List[DistributionItem]
    score_histogram: List[dict]

class AnomalyDistribution(BaseModel):
    statuses: List[DistributionItem]
    surge_metrics: dict

class IndustrialContextDistribution(BaseModel):
    with_industrial_context: int
    without_industrial_context: int
    score_bins: List[dict]

class EvidenceDistribution(BaseModel):
    available_count: int
    unavailable_count: int
    coverage_pct: float
    quality_breakdown: List[DistributionItem]
    avg_cloud_cover: float

class AlertItem(BaseModel):
    thermal_source_id: int
    latitude: float
    longitude: float
    classification: str
    classification_confidence: float
    risk_score: float
    risk_band: str
    anomaly_status: str
    anomaly_score: float
    industrial_context_score: int
    mean_frp: float
    max_frp: float
    evidence_quality: Optional[str] = None
    satellite_evidence_status: str
    recent_activity_status: str
    urgency_rank: float
    alert_level: str
    tags: List[str]

class FeatureImportanceItem(BaseModel):
    feature: str
    display_name: str
    importance: float
    importance_pct: float
    category: str
    description: str
