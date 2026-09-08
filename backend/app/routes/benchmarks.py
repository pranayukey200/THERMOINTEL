"""
THERMOINTEL - District and State Thermal Risk Benchmark Router
REST API endpoints for sovereign regional risk benchmarking and leaderboards
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from app.services.district_benchmark import (
    get_district_benchmarks,
    get_state_benchmarks,
    get_district_detail
)

router = APIRouter(prefix="/benchmarks", tags=["Regional Thermal Benchmarks"])


@router.get("/districts")
def get_district_benchmark_leaderboard(
    mode: str = Query("all", description="Benchmark mode: 'all' (Total Thermal) or 'industrial' (Industrial Risk Only)"),
    state: Optional[str] = Query(None, description="Filter districts by state name")
):
    """
    Returns the ranked district leaderboard (N >= 5 sources) and insufficient data registry (N < 5 sources).
    All rankings use spatial density (sources / 1000 km^2) and cross-district percentile ranks.
    """
    if mode not in ("all", "industrial"):
        mode = "all"
    return get_district_benchmarks(mode=mode, state_filter=state)


@router.get("/states")
def get_state_benchmark_leaderboard(
    mode: str = Query("all", description="Benchmark mode: 'all' or 'industrial'")
):
    """
    Returns state-level thermal risk benchmarks rolled up as an area-weighted average of its districts.
    """
    if mode not in ("all", "industrial"):
        mode = "all"
    return get_state_benchmarks(mode=mode)


@router.get("/districts/{district_name}")
def get_single_district_detail(district_name: str):
    """
    Returns the granular metric breakdown and classification mix for a specific district.
    """
    detail = get_district_detail(district_name)
    if not detail:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found in benchmark catalog")
    return detail
