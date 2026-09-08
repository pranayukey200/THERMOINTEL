"""
THERMOINTEL - Tactical Intelligence & Disambiguation Router
Sovereign Defense-Grade Endpoints for NTRO & Disaster Response Directives
"""
import datetime
import hashlib
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.database import execute_one
from app.routes.sources import _format_source
from app.schemas import TacticalIncidentBrief

router = APIRouter(prefix="/tactical", tags=["Tactical Intelligence"])

@router.get("/disambiguation-matrix")
def get_disambiguation_matrix():
    """
    Returns the scientific 3-Axis Multi-Domain Fire Disambiguation Matrix
    separating Industrial Point Sources, Agricultural Stubble, and Wildfire Fronts.
    """
    return {
        "title": "3-Axis Multi-Sensor Fire Disambiguation Engine",
        "description": "Scientific criteria segregating industrial persistent flares, agricultural stubble burns, and wildfire fronts",
        "domains": [
            {
                "domain": "Industrial / Petrochemical Emitter",
                "color": "#3B82F6",
                "badge": "STATIONARY INFRASTRUCTURE",
                "diurnal_ratio": "0.95 - 1.25",
                "diurnal_behavior": "Continuous 24/7 day-and-night emissions (shift-work/flare stacks)",
                "centroid_drift": "< 120 meters",
                "centroid_drift_desc": "Sub-pixel fixed coordinate stability pinned to physical facility boundary",
                "persistence_index": "> 0.70 (Multi-week)",
                "osm_proximity": "< 500m to registered heavy industrial/refinery vector polygon",
                "sentinel2_swir": "Sharp localized 20m pixel saturation in Band 12 (2.19 μm) with no burn scar expansion",
                "typical_frp": "25 - 450 MW (Controlled baseline with flare surges)"
            },
            {
                "domain": "Agricultural Stubble Burning",
                "color": "#F59E0B",
                "badge": "TRANSIENT HARVEST CYCLE",
                "diurnal_ratio": "> 3.0 (Day-dominant)",
                "diurnal_behavior": "Sharp diurnal surge between 13:00-16:00 IST; extinguished by evening cooling",
                "centroid_drift": "250 - 800 meters",
                "centroid_drift_desc": "Centroid moves across agricultural field boundaries over consecutive overpasses",
                "persistence_index": "< 0.25 (1 - 3 days max)",
                "osm_proximity": "Zero industrial overlap; 100% cropland / agricultural land-cover classification",
                "sentinel2_swir": "Diffuse moderate SWIR elevation across broad parcels; immediate smoke plume in visible bands",
                "typical_frp": "10 - 80 MW (High smoke optical depth, low localized core temperature)"
            },
            {
                "domain": "Wildfire / Forest Front",
                "color": "#EF4444",
                "badge": "SPREADING THREAT FRONT",
                "diurnal_ratio": "1.80 - 2.60",
                "diurnal_behavior": "Afternoon thermal peak modulated by wind velocity, slope, and ambient humidity",
                "centroid_drift": "> 1,000 meters / 24h",
                "centroid_drift_desc": "High vector displacement along downwind propagation front",
                "persistence_index": "0.35 - 0.65 (Active burn campaign)",
                "osm_proximity": "Reserve forests, protected national parks, wildlife sanctuaries",
                "sentinel2_swir": "Severe SWIR1/SWIR2 radiance coupled with expansive Normalized Burn Ratio (NBR) drop",
                "typical_frp": "50 - 1,500+ MW (Spreading flame front with crown fire spikes)"
            }
        ],
        "sensor_fusion_spec": {
            "viirs_firms": "375m spatial resolution (VNP14IMGTDL) - rapid 12-hour cadence alert trigger",
            "sentinel2_msi": "20m spatial resolution (SWIR Band 11 at 1.61μm & Band 12 at 2.19μm) - sub-facility pin-point verification",
            "temporal_window": "30-day continuous rolling lookback for baseline FRP calibration"
        }
    }


@router.get("/brief/{source_id}", response_model=TacticalIncidentBrief)
def get_tactical_incident_brief(source_id: int):
    """
    Generates an official, print-ready sovereign tactical incident brief
    formatted for NTRO, NDRF, and Crisis Management Authorities.
    """
    row = execute_one("SELECT * FROM thermal_sources WHERE thermal_source_id = ?", [source_id])
    if not row:
        raise HTTPException(status_code=404, detail=f"Thermal source ID {source_id} not found in intelligence registry.")

    source = _format_source(row)
    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    
    # Coordinates formatting
    lat = source["latitude"]
    lon = source["longitude"]
    lat_card = f"{abs(lat):.4f}°{'N' if lat >= 0 else 'S'}"
    lon_card = f"{abs(lon):.4f}°{'E' if lon >= 0 else 'W'}"
    coord_str = f"{lat_card}, {lon_card}"

    # Generate SOP based on risk & classification
    is_runaway = source["thermal_runaway_status"] == "CATASTROPHIC THERMAL RUNAWAY"

    sop_actions = [
        "IMMEDIATE: Issue automated alert to District Disaster Management Authority (DDMA) & State EOC.",
        f"PERIMETER: Enforce primary hazard blast cordon ({source['blast_radius_m']}m) and restrict civilian transit.",
        f"DISPERSION: Deploy atmospheric air-sampling & hazardous chemical detection team within {source['toxic_dispersion_radius_m']}m radius.",
        "SATELLITE TASKING: Request emergency priority tasking overpass for Sentinel-2 / Cartosat-3 sub-meter high-res payload.",
        f"EVACUATION STAGING: Prepare secondary evacuation centers within {source['evacuation_radius_m']}m outer contingency boundary."
    ]

    if is_runaway:
        sop_actions.insert(0, "CRITICAL DIRECTIVE: Thermal runaway exceeds 3.0x moving operational baseline. Authorize emergency industrial shutdown protocol.")
    
    if "Agricultural" in source["classification"]:
        sop_actions = [
            "MONITORING: Dispatch State Pollution Control Board (SPCB) flying squad for field-level geotagged verification.",
            "SMOKE PLUME ADVISORY: Notify regional air quality index (AQI) monitoring centers of downwind particulate matter influx.",
            "COMMUNITY ALERT: Coordinate with local agricultural extension officer to verify stubble management equipment availability.",
            "SATELLITE ARCHIVE: Log spatial coordinates into national crop residue burning monitoring registry."
        ]

    # Infrastructure description
    ind_score = source.get("industrial_context_score", 0)
    if ind_score >= 60:
        infra = f"High-Density Industrial Complex / Energy Infrastructure (Context Score: {ind_score}/100)"
    elif ind_score >= 25:
        infra = f"Mixed Industrial-Commercial Buffer Zone (Context Score: {ind_score}/100)"
    else:
        infra = f"Rural / Open Agricultural or Natural Canopy (Context Score: {ind_score}/100)"

    return TacticalIncidentBrief(
        dispatch_id=f"NTRO-GEOINT-2026-{source_id:06d}",
        security_classification="CONFIDENTIAL // DISASTER RELIEF & CRITICAL INFRASTRUCTURE PROTECTION",
        issuing_authority="NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) / CRISIS RESPONSE GEOINT CELL",
        source_id=source_id,
        mgrs_tile=source.get("mgrs_tile") or "43R-HQ",
        coordinates=coord_str,
        latitude=lat,
        longitude=lon,
        classification=source["classification"],
        risk_score=source["risk_score"],
        risk_band=source["risk_band"],
        anomaly_status=source["anomaly_status"],
        thermal_runaway_status=source["thermal_runaway_status"],
        current_frp=source["max_frp"],
        baseline_frp=source["operational_baseline_frp"],
        surge_multiplier=source["surge_ratio"],
        z_score=source["surge_z_score"],
        diurnal_ratio=source["diurnal_ratio"],
        centroid_drift_m=source["centroid_drift_m"],
        satellite_sensor="VIIRS (375m) + Sentinel-2 MSI (20m B11/B12)" if source.get("satellite_evidence_status") == "AVAILABLE" else "VIIRS Suomi-NPP / NOAA-20 (375m)",
        sentinel_scene_date=source.get("scene_date"),
        satellite_image_url=source.get("satellite_image_url"),
        blast_radius_m=source["blast_radius_m"],
        toxic_dispersion_radius_m=source["toxic_dispersion_radius_m"],
        evacuation_radius_m=source["evacuation_radius_m"],
        cvi_score=source["cvi_score"],
        nearest_infrastructure=infra,
        recommended_sop=sop_actions,
        dispatch_timestamp=now_utc,
        evidence_sha256=source["evidence_sha256"]
    )
