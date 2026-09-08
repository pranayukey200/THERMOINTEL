from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from app.services.correlated_detection import (
    run_correlated_detection,
    get_active_events,
    get_event_detail,
    get_all_baselines
)

router = APIRouter(prefix="/correlated-events", tags=["Correlated Thermal Events"])

@router.get("", response_model=List[Dict[str, Any]])
def list_correlated_events(
    status: Optional[str] = Query("OPEN", description="Filter by event status: OPEN, CLOSED, ALL"),
    tag: Optional[str] = Query(None, description="Filter by tag: INVESTIGATE_INDUSTRIAL or LOW_URGENCY_AGRICULTURAL")
):
    """
    Retrieve all correlated thermal activity events detected across India.
    """
    filter_status = None if status and status.upper() == "ALL" else (status.upper() if status else "OPEN")
    events = get_active_events(filter_status)
    if tag:
        events = [e for e in events if e.get("tag") == tag.upper()]
    return events

@router.get("/baselines", response_model=List[Dict[str, Any]])
def get_grid_baselines():
    """
    Retrieve computed historical 1°×1° grid cell baselines across India.
    """
    return get_all_baselines()

@router.get("/{event_id}", response_model=Dict[str, Any])
def get_correlated_event(event_id: str):
    """
    Retrieve full dossier for a specific correlated thermal activity event,
    including member thermal source coordinates, classifications, and telemetry.
    """
    event = get_event_detail(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Correlated event '{event_id}' not found.")
    return event

@router.post("/run-detection", response_model=Dict[str, Any])
def trigger_detection(
    strict_mode: bool = Query(False, description="Use strong_activity_surge for stricter clustering")
):
    """
    Trigger the 5-step DBSCAN spatio-temporal clustering and regional Z-score significance filter.
    """
    return run_correlated_detection(strict_mode=strict_mode)
