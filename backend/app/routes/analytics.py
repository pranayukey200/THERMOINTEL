"""
Analytics and intelligence summary API routes.
Calculates distributions, risk statistics, anomaly counts, and satellite coverage dynamically from the database.
"""
from fastapi import APIRouter
from app.database import execute_query, execute_one
from app.schemas import (
    AnalyticsSummary,
    DistributionItem,
    RiskDistribution,
    AnomalyDistribution,
    IndustrialContextDistribution,
    EvidenceDistribution
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary():
    """Retrieve top-level KPI telemetry calculated from the live database."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    # High / Critical Risk
    risk_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE risk_band IN ('HIGH', 'CRITICAL')"
    high_crit_risk = execute_one(risk_query)["cnt"]

    # Critical Anomaly / Abnormal
    anomaly_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE anomaly_status IN ('ABNORMAL', 'CRITICAL ANOMALY')"
    abnormal_crit = execute_one(anomaly_query)["cnt"]

    # Industrial context
    ind_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE industrial_context_score > 0"
    ind_cnt = execute_one(ind_query)["cnt"]

    # Satellite coverage
    sat_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE satellite_evidence_status = 'AVAILABLE'"
    sat_avail = execute_one(sat_query)["cnt"]
    sat_pct = round((sat_avail / total) * 100, 2) if total > 0 else 0.0

    # Intensity
    intensity_query = "SELECT AVG(mean_frp) as avg_mean, MAX(max_frp) as max_val FROM thermal_sources"
    intensity_res = execute_one(intensity_query)
    avg_mean_frp = round(intensity_res["avg_mean"], 2) if intensity_res and intensity_res["avg_mean"] else 0.0
    max_val_frp = round(intensity_res["max_val"], 2) if intensity_res and intensity_res["max_val"] else 0.0

    # Surges
    surge_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE strong_activity_surge = 1 OR activity_surge = 1"
    surge_cnt = execute_one(surge_query)["cnt"]

    # Critical Alerts (Urgent triage threshold: Risk >= 70 OR Anomaly Score >= 70 OR Critical Anomaly)
    alerts_query = """
    SELECT COUNT(*) as cnt FROM thermal_sources 
    WHERE risk_band IN ('CRITICAL', 'HIGH') OR anomaly_status IN ('CRITICAL ANOMALY', 'ABNORMAL')
    """
    alerts_cnt = execute_one(alerts_query)["cnt"]

    return AnalyticsSummary(
        total_sources=total,
        critical_alerts_count=alerts_cnt,
        high_critical_risk_count=high_crit_risk,
        abnormal_critical_anomaly_count=abnormal_crit,
        industrial_context_sources_count=ind_cnt,
        satellite_evidence_available_count=sat_avail,
        satellite_evidence_coverage_pct=sat_pct,
        mean_frp_average=avg_mean_frp,
        max_frp_highest=max_val_frp,
        high_recent_surge_count=surge_cnt
    )

@router.get("/classification", response_model=list[DistributionItem])
def get_classification_distribution():
    """Return distribution of all prototype classifications with average risk and anomaly scores."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    query = """
    SELECT 
        classification as name,
        COUNT(*) as count,
        AVG(risk_score) as avg_risk_score,
        AVG(anomaly_score) as avg_anomaly_score
    FROM thermal_sources
    GROUP BY classification
    ORDER BY count DESC
    """
    rows = execute_query(query)
    items = []
    for r in rows:
        pct = round((r["count"] / total) * 100, 2) if total > 0 else 0.0
        items.append(DistributionItem(
            name=r["name"],
            count=r["count"],
            percentage=pct,
            avg_risk_score=round(r["avg_risk_score"], 2) if r["avg_risk_score"] else 0.0,
            avg_anomaly_score=round(r["avg_anomaly_score"], 2) if r["avg_anomaly_score"] else 0.0
        ))
    return items

@router.get("/risk", response_model=RiskDistribution)
def get_risk_distribution():
    """Return risk band distribution and 10-point histogram bins."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    query_bands = """
    SELECT 
        risk_band as name,
        COUNT(*) as count,
        AVG(risk_score) as avg_risk_score
    FROM thermal_sources
    GROUP BY risk_band
    ORDER BY 
        CASE risk_band
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MODERATE' THEN 3
            WHEN 'LOW' THEN 4
            ELSE 5
        END
    """
    band_rows = execute_query(query_bands)
    bands = []
    for r in band_rows:
        pct = round((r["count"] / total) * 100, 2) if total > 0 else 0.0
        bands.append(DistributionItem(
            name=r["name"],
            count=r["count"],
            percentage=pct,
            avg_risk_score=round(r["avg_risk_score"], 2) if r["avg_risk_score"] else 0.0
        ))

    # Calculate 10-score histogram buckets (0-10, 10-20, ... 90-100)
    histogram = []
    for lower in range(0, 100, 10):
        upper = lower + 10
        if upper == 100:
            hist_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE risk_score >= ? AND risk_score <= ?"
        else:
            hist_query = "SELECT COUNT(*) as cnt FROM thermal_sources WHERE risk_score >= ? AND risk_score < ?"
        cnt = execute_one(hist_query, (lower, upper))["cnt"]
        histogram.append({
            "range": f"{lower}-{upper}",
            "lower": lower,
            "upper": upper,
            "count": cnt,
            "percentage": round((cnt / total) * 100, 2) if total > 0 else 0.0
        })

    return RiskDistribution(bands=bands, score_histogram=histogram)

@router.get("/anomaly", response_model=AnomalyDistribution)
def get_anomaly_distribution():
    """Return anomaly status breakdown and surge telemetry counts."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    query_statuses = """
    SELECT 
        anomaly_status as name,
        COUNT(*) as count,
        AVG(anomaly_score) as avg_anomaly_score,
        AVG(risk_score) as avg_risk_score
    FROM thermal_sources
    GROUP BY anomaly_status
    ORDER BY 
        CASE anomaly_status
            WHEN 'CRITICAL ANOMALY' THEN 1
            WHEN 'ABNORMAL' THEN 2
            WHEN 'WATCH' THEN 3
            WHEN 'NORMAL / STABLE' THEN 4
            ELSE 5
        END
    """
    status_rows = execute_query(query_statuses)
    statuses = []
    for r in status_rows:
        pct = round((r["count"] / total) * 100, 2) if total > 0 else 0.0
        statuses.append(DistributionItem(
            name=r["name"],
            count=r["count"],
            percentage=pct,
            avg_anomaly_score=round(r["avg_anomaly_score"], 2) if r["avg_anomaly_score"] else 0.0,
            avg_risk_score=round(r["avg_risk_score"], 2) if r["avg_risk_score"] else 0.0
        ))

    # Surge breakdown
    surge_row = execute_one("""
    SELECT 
        SUM(activity_surge) as activity_surges,
        SUM(strong_activity_surge) as strong_surges,
        SUM(newly_emerging) as newly_emerging_sources,
        SUM(high_recent_intensity) as high_recent_intensity_sources,
        SUM(low_persistence) as low_persistence_sources,
        SUM(established_source) as established_sources
    FROM thermal_sources
    """)

    surge_metrics = {
        "activity_surges": surge_row["activity_surges"] or 0,
        "strong_surges": surge_row["strong_surges"] or 0,
        "newly_emerging": surge_row["newly_emerging_sources"] or 0,
        "high_recent_intensity": surge_row["high_recent_intensity_sources"] or 0,
        "low_persistence": surge_row["low_persistence_sources"] or 0,
        "established_sources": surge_row["established_sources"] or 0
    }

    return AnomalyDistribution(statuses=statuses, surge_metrics=surge_metrics)

@router.get("/industrial-context", response_model=IndustrialContextDistribution)
def get_industrial_context_distribution():
    """Return industrial vicinity breakdown and score bracket distribution."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    with_ctx = execute_one("SELECT COUNT(*) as cnt FROM thermal_sources WHERE industrial_context_score > 0")["cnt"]
    without_ctx = total - with_ctx

    bins = [
        {"label": "None (0)", "min": 0, "max": 0},
        {"label": "Low (1-25)", "min": 1, "max": 25},
        {"label": "Moderate (26-50)", "min": 26, "max": 50},
        {"label": "High (51-75)", "min": 51, "max": 75},
        {"label": "Very High (76-100)", "min": 76, "max": 100},
    ]

    score_bins = []
    for b in bins:
        if b["min"] == 0:
            cnt = execute_one("SELECT COUNT(*) as cnt FROM thermal_sources WHERE industrial_context_score = 0")["cnt"]
        else:
            cnt = execute_one("SELECT COUNT(*) as cnt FROM thermal_sources WHERE industrial_context_score >= ? AND industrial_context_score <= ?", (b["min"], b["max"]))["cnt"]
        
        score_bins.append({
            "label": b["label"],
            "count": cnt,
            "percentage": round((cnt / total) * 100, 2) if total > 0 else 0.0
        })

    return IndustrialContextDistribution(
        with_industrial_context=with_ctx,
        without_industrial_context=without_ctx,
        score_bins=score_bins
    )

@router.get("/evidence", response_model=EvidenceDistribution)
def get_evidence_distribution():
    """Return Sentinel-2 coverage and visual quality ratings."""
    total_query = "SELECT COUNT(*) as cnt FROM thermal_sources"
    total = execute_one(total_query)["cnt"]

    sat_avail = execute_one("SELECT COUNT(*) as cnt FROM thermal_sources WHERE satellite_evidence_status = 'AVAILABLE'")["cnt"]
    sat_unavail = total - sat_avail
    coverage_pct = round((sat_avail / total) * 100, 2) if total > 0 else 0.0

    avg_cloud = execute_one("SELECT AVG(cloud_cover) as avg_cc FROM thermal_sources WHERE cloud_cover != -1.0")["avg_cc"]

    quality_rows = execute_query("""
    SELECT 
        CASE 
            WHEN evidence_quality IS NULL OR evidence_quality = '' THEN 'UNAVAILABLE'
            ELSE evidence_quality 
        END as name,
        COUNT(*) as count
    FROM thermal_sources
    GROUP BY name
    ORDER BY count DESC
    """)

    quality_breakdown = []
    for r in quality_rows:
        pct = round((r["count"] / total) * 100, 2) if total > 0 else 0.0
        quality_breakdown.append(DistributionItem(
            name=r["name"],
            count=r["count"],
            percentage=pct
        ))

    return EvidenceDistribution(
        available_count=sat_avail,
        unavailable_count=sat_unavail,
        coverage_pct=coverage_pct,
        quality_breakdown=quality_breakdown,
        avg_cloud_cover=round(avg_cloud, 2) if avg_cloud else 0.0
    )
