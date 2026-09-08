"""
Grounded database query functions for THERMOINTEL Chatbot.
Strictly read-only data access functions that return structured JSON dictionaries.
Reuses existing data layers without arbitrary SQL execution.
"""
from typing import Optional, List, Dict, Any
from app.database import execute_query, execute_one
from app.services.district_benchmark import get_district_benchmarks, get_state_benchmarks
from app.services.correlated_detection import get_active_events, get_event_detail
from app.routes.sources import _format_source as _enrich_source_detail

def get_top_risk_sources(
    region: Optional[str] = None,
    tier: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Retrieve highest risk thermal sources ordered by composite risk_score descending.
    Filters optionally by state/district (region) and risk tier (CRITICAL, HIGH, MODERATE, LOW).
    """
    conditions = []
    params = []

    if region:
        reg_clean = region.strip()
        conditions.append("(district LIKE ? OR state LIKE ?)")
        params.extend([f"%{reg_clean}%", f"%{reg_clean}%"])

    if tier:
        conditions.append("risk_band = ?")
        params.append(tier.strip().upper())

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    clamped_limit = min(max(1, limit), 25)
    params.append(clamped_limit)

    query = f"""
    SELECT 
        thermal_source_id,
        latitude,
        longitude,
        district,
        state,
        risk_score,
        risk_band,
        classification,
        anomaly_status,
        mean_frp,
        max_frp,
        industrial_context_score,
        satellite_evidence_status,
        last_seen
    FROM thermal_sources
    {where_clause}
    ORDER BY risk_score DESC, max_frp DESC
    LIMIT ?
    """
    rows = execute_query(query, tuple(params))
    results = []
    for r in rows:
        results.append({
            "source_id": r["thermal_source_id"],
            "latitude": round(r["latitude"], 4),
            "longitude": round(r["longitude"], 4),
            "district": r["district"] or "Unknown",
            "state": r["state"] or "Unknown",
            "risk_score": round(r["risk_score"], 1),
            "risk_band": r["risk_band"],
            "classification": r["classification"],
            "anomaly_status": r["anomaly_status"],
            "mean_frp_mw": round(r["mean_frp"], 1),
            "max_frp_mw": round(r["max_frp"], 1),
            "industrial_score": r["industrial_context_score"],
            "satellite_status": r["satellite_evidence_status"],
            "last_seen": r["last_seen"]
        })
    return results

def get_source_detail(thermal_source_id: int) -> Dict[str, Any]:
    """
    Retrieve the comprehensive intelligence dossier for a specific thermal source ID.
    Includes coordinates, risk decomposition, anomaly diagnostics, and Sentinel-2 overpass status.
    """
    query = "SELECT * FROM thermal_sources WHERE thermal_source_id = ?"
    row = execute_one(query, (thermal_source_id,))
    if not row:
        return {"error": f"Thermal source #{thermal_source_id} not found in database."}

    enriched = _enrich_source_detail(row)
    return {
        "source_id": enriched.get("thermal_source_id"),
        "coordinates": [round(enriched.get("latitude", 0), 4), round(enriched.get("longitude", 0), 4)],
        "district": enriched.get("district") or "Unknown",
        "state": enriched.get("state") or "Unknown",
        "classification": enriched.get("classification"),
        "confidence": enriched.get("classification_confidence"),
        "risk_score": round(enriched.get("risk_score", 0), 1),
        "risk_band": enriched.get("risk_band"),
        "anomaly_status": enriched.get("anomaly_status"),
        "anomaly_score": round(enriched.get("anomaly_score", 0), 1),
        "mean_frp_mw": round(enriched.get("mean_frp", 0), 1),
        "max_frp_mw": round(enriched.get("max_frp", 0), 1),
        "total_detections": enriched.get("total_detections"),
        "active_days": enriched.get("active_days"),
        "persistence_score": round(enriched.get("persistence_score", 0), 1),
        "satellite_evidence_status": enriched.get("satellite_evidence_status"),
        "evidence_quality": enriched.get("evidence_quality"),
        "thermal_runaway_status": enriched.get("thermal_runaway_status"),
        "nearest_facility": enriched.get("nearest_osm_name"),
        "nearest_facility_distance_km": enriched.get("nearest_osm_distance_km"),
        "reasoning_summary": enriched.get("reasoning_summary")
    }

def get_district_benchmark(district_or_state: str, period: str = "current_30day") -> Dict[str, Any]:
    """
    Retrieve the normalized territorial thermal risk benchmark score and 30-day delta
    for a given district or state.
    """
    name_clean = district_or_state.strip()
    
    # Check districts first
    districts = get_district_benchmarks(mode="all")
    all_districts = districts["ranked_leaderboard"] + districts["insufficient_data"]
    matched_district = next(
        (d for d in all_districts if d["district"].lower() == name_clean.lower()),
        None
    )
    if not matched_district:
        # Partial match
        matched_district = next(
            (d for d in all_districts if name_clean.lower() in d["district"].lower()),
            None
        )

    if matched_district:
        return {
            "type": "district",
            "district": matched_district["district"],
            "state": matched_district["state"],
            "benchmark_score": round(matched_district["benchmark_score"], 1),
            "rank": matched_district.get("rank"),
            "status": "RANKED" if matched_district.get("rank") else "INSUFFICIENT_DATA",
            "source_density_per_1000sqkm": round(matched_district["source_density"], 1),
            "area_sqkm": matched_district["area_sqkm"],
            "total_active_sources_30d": matched_district["total_sources"],
            "high_crit_count": matched_district["high_crit_count"],
            "high_crit_share_pct": round(matched_district["high_crit_share"], 1),
            "mean_frp_mw": round(matched_district["mean_frp"], 1),
            "peak_frp_mw": round(matched_district["peak_frp"], 1),
            "dominant_tag": matched_district["dominant_tag"],
            "primary_industries": matched_district.get("primary_industries"),
            "trend_delta_pct": round(matched_district.get("trend_delta_pct") or 0.0, 1),
            "window": districts.get("window_current")
        }

    # Check states
    states = get_state_benchmarks(mode="all")
    matched_state = next(
        (s for s in states["ranked_states"] if s["state"].lower() == name_clean.lower() or name_clean.lower() in s["state"].lower()),
        None
    )
    if matched_state:
        return {
            "type": "state",
            "state": matched_state["state"],
            "benchmark_score": round(matched_state["benchmark_score"], 1),
            "rank": matched_state.get("rank"),
            "state_density_per_1000sqkm": round(matched_state["state_density"], 1),
            "total_area_sqkm": matched_state["total_area_sqkm"],
            "total_active_sources_30d": matched_state["total_sources"],
            "high_crit_count": matched_state["high_crit_count"],
            "district_count": matched_state["district_count"],
            "dominant_tag": matched_state["dominant_tag"],
            "trend_delta_pct": round(matched_state.get("trend_delta_pct") or 0.0, 1),
            "window": states.get("window_current")
        }

    return {"error": f"No district or state matching '{district_or_state}' was found in benchmark catalog."}

def get_correlated_events(active_only: bool = True) -> List[Dict[str, Any]]:
    """
    Retrieve synchronized thermal surge clusters detected via DBSCAN spatio-temporal clustering
    and regional baseline Z-score filtering.
    """
    status_filter = "OPEN" if active_only else None
    events = get_active_events(status=status_filter)
    results = []
    for e in events:
        results.append({
            "event_id": e.get("event_id"),
            "region_name": e.get("region_name"),
            "tag": e.get("tag"),
            "status": e.get("status"),
            "source_count": e.get("source_count"),
            "member_source_ids": e.get("member_source_ids", []),
            "centroid": e.get("centroid"),
            "date_range": e.get("date_range"),
            "z_score": round(e.get("z_score", 0), 2),
            "dominant_classification": e.get("dominant_classification"),
            "peak_frp_mw": round(e.get("peak_frp", 0), 1)
        })
    return results

def get_classification_breakdown(
    region: Optional[str] = None,
    period: str = "current_30day"
) -> Dict[str, Any]:
    """
    Compute distribution of AI threat classifications across the 7 standard types,
    optionally filtered by state/district or national.
    """
    conditions = []
    params = []

    if region:
        reg_clean = region.strip()
        conditions.append("(district LIKE ? OR state LIKE ?)")
        params.extend([f"%{reg_clean}%", f"%{reg_clean}%"])

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    total_query = f"SELECT COUNT(*) as cnt FROM thermal_sources {where_clause}"
    total = execute_one(total_query, tuple(params))["cnt"]

    if total == 0:
        return {"region": region, "total_sources": 0, "breakdown": []}

    query = f"""
    SELECT 
        classification as name,
        COUNT(*) as count,
        AVG(risk_score) as avg_risk_score,
        AVG(mean_frp) as avg_mean_frp
    FROM thermal_sources
    {where_clause}
    GROUP BY classification
    ORDER BY count DESC
    """
    rows = execute_query(query, tuple(params))
    breakdown = []
    for r in rows:
        pct = round((r["count"] / total) * 100.0, 1)
        breakdown.append({
            "classification": r["name"],
            "count": r["count"],
            "percentage": pct,
            "avg_risk_score": round(r["avg_risk_score"] or 0, 1),
            "avg_mean_frp_mw": round(r["avg_mean_frp"] or 0, 1)
        })

    return {
        "region": region or "Pan-India Master Set",
        "total_sources": total,
        "classes_count": len(breakdown),
        "breakdown": breakdown
    }

def get_facility_info(thermal_source_id: int) -> Dict[str, Any]:
    """
    Retrieve infrastructure proximity, OSM name, industrial context score,
    and facility attribution for a given thermal source ID.
    """
    query = """
    SELECT 
        thermal_source_id,
        district,
        state,
        latitude,
        longitude,
        classification,
        industrial_context_score,
        nearest_osm_name,
        nearest_osm_category,
        nearest_osm_distance_km,
        cropland_pct,
        tree_cover_pct,
        built_up_pct,
        reasoning_summary,
        nearest_facility_summary
    FROM thermal_sources
    WHERE thermal_source_id = ?
    """
    row = execute_one(query, (thermal_source_id,))
    if not row:
        return {"error": f"Thermal source #{thermal_source_id} not found."}

    return {
        "source_id": row["thermal_source_id"],
        "location": f"{row['district'] or 'Unknown'}, {row['state'] or 'Unknown'}",
        "coordinates": [round(row["latitude"], 4), round(row["longitude"], 4)],
        "classification": row["classification"],
        "industrial_context_score": row["industrial_context_score"],
        "nearest_osm_facility": row["nearest_osm_name"] or "No named commercial facility identified within 5km",
        "nearest_osm_category": row["nearest_osm_category"] or "Unclassified",
        "distance_km": round(row["nearest_osm_distance_km"], 2) if row["nearest_osm_distance_km"] else None,
        "land_cover": {
            "cropland_pct": row["cropland_pct"],
            "tree_cover_pct": row["tree_cover_pct"],
            "built_up_pct": row["built_up_pct"]
        },
        "reasoning_summary": row["reasoning_summary"],
        "facility_summary": row["nearest_facility_summary"]
    }
