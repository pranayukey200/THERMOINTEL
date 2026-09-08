"""
Alerts triage and mission-critical event management routes.
"""
from typing import Optional, List
from fastapi import APIRouter, Query
from app.database import execute_query
from app.schemas import AlertItem

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertItem])
def get_alerts(
    alert_level: Optional[str] = Query(None, description="Filter by level: CRITICAL, HIGH, ELEVATED, ALL"),
    classification: Optional[str] = Query(None),
    min_risk_score: Optional[float] = Query(None, ge=0.0),
    limit: int = Query(100, ge=1, le=500)
):
    """
    Retrieve prioritized operational alerts based on combined risk score, anomaly severity, and surge indicators.
    """
    conditions = []
    params = []

    # Priority pool: High/Critical risk, Abnormal/Critical anomaly, or active surges
    base_condition = """
    (
        risk_band IN ('CRITICAL', 'HIGH') 
        OR anomaly_status IN ('CRITICAL ANOMALY', 'ABNORMAL')
        OR strong_activity_surge = 1
        OR risk_score >= 50.0
    )
    """
    conditions.append(base_condition)

    if alert_level and alert_level.upper() != "ALL":
        lvl = alert_level.upper()
        if lvl == "CRITICAL":
            conditions.append("(risk_band = 'CRITICAL' OR anomaly_status = 'CRITICAL ANOMALY')")
        elif lvl == "HIGH":
            conditions.append("(risk_band = 'HIGH' OR (anomaly_status = 'ABNORMAL' AND risk_score >= 40))")
        elif lvl == "ELEVATED":
            conditions.append("(risk_score >= 30 AND risk_score < 60)")

    if classification:
        conditions.append("classification = ?")
        params.append(classification)

    if min_risk_score is not None:
        conditions.append("risk_score >= ?")
        params.append(min_risk_score)

    where_clause = " WHERE " + " AND ".join(conditions)

    query = f"""
    SELECT 
        thermal_source_id,
        latitude,
        longitude,
        classification,
        classification_confidence,
        risk_score,
        risk_band,
        anomaly_status,
        anomaly_score,
        industrial_context_score,
        mean_frp,
        max_frp,
        evidence_quality,
        satellite_evidence_status,
        recent_activity_status,
        activity_surge,
        strong_activity_surge,
        newly_emerging,
        high_recent_intensity,
        (
            (risk_score * 0.55) + 
            (anomaly_score * 0.35) + 
            (strong_activity_surge * 15.0) +
            (CASE WHEN industrial_context_score > 0 THEN 5.0 ELSE 0.0 END)
        ) as urgency_rank
    FROM thermal_sources
    {where_clause}
    ORDER BY urgency_rank DESC, risk_score DESC
    LIMIT ?
    """
    params.append(limit)
    rows = execute_query(query, tuple(params))

    alerts = []
    for r in rows:
        # Determine alert level
        if r["risk_band"] == "CRITICAL" or r["anomaly_status"] == "CRITICAL ANOMALY" or r["urgency_rank"] >= 80:
            lvl = "CRITICAL"
        elif r["risk_band"] == "HIGH" or r["anomaly_status"] == "ABNORMAL" or r["urgency_rank"] >= 60:
            lvl = "HIGH"
        else:
            lvl = "ELEVATED"

        # Generate tags
        tags = []
        if r["risk_band"] in ("CRITICAL", "HIGH"):
            tags.append(f"{r['risk_band']} RISK")
        if r["anomaly_status"] in ("CRITICAL ANOMALY", "ABNORMAL"):
            tags.append(r["anomaly_status"])
        if r["strong_activity_surge"]:
            tags.append("STRONG SURGE")
        elif r["activity_surge"]:
            tags.append("ACTIVITY SURGE")
        if r["newly_emerging"]:
            tags.append("NEWLY EMERGING")
        if r["industrial_context_score"] > 50:
            tags.append("HIGH INDUSTRIAL VICINITY")
        elif r["industrial_context_score"] > 0:
            tags.append("INDUSTRIAL VICINITY")
        if r["max_frp"] > 50:
            tags.append("HIGH THERMAL POWER")

        alerts.append(AlertItem(
            thermal_source_id=r["thermal_source_id"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            classification=r["classification"],
            classification_confidence=r["classification_confidence"],
            risk_score=r["risk_score"],
            risk_band=r["risk_band"],
            anomaly_status=r["anomaly_status"],
            anomaly_score=r["anomaly_score"],
            industrial_context_score=r["industrial_context_score"],
            mean_frp=r["mean_frp"],
            max_frp=r["max_frp"],
            evidence_quality=r.get("evidence_quality"),
            satellite_evidence_status=r["satellite_evidence_status"],
            recent_activity_status=r["recent_activity_status"],
            urgency_rank=round(r["urgency_rank"], 2),
            alert_level=lvl,
            tags=tags
        ))

    return alerts
