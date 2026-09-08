"""
THERMOINTEL - FastAPI Backend Application
AI-Powered Industrial Thermal Intelligence & Monitoring Platform
"""
import os
import time
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from app.config import settings
from app.routes import sources, analytics, alerts, explainability, tactical, correlated_events, benchmarks, chat
from app.services.correlated_detection import compute_grid_baselines, run_correlated_detection
from app.services.district_benchmark import assign_sources_to_districts

app = FastAPI(
    title="THERMOINTEL API",
    description="Operational Satellite-based Thermal Intelligence & Monitoring Platform for India/India-region (SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static quicklooks directory for Sentinel-2 thumbnails
quicklooks_path = Path(settings.QUICKLOOKS_DIR)
if not quicklooks_path.exists():
    fallback_path = Path(__file__).resolve().parent.parent.parent / "final" / "sentinel2" / "quicklooks"
    if fallback_path.exists():
        quicklooks_path = fallback_path

if quicklooks_path.exists():
    app.mount("/static/quicklooks", StaticFiles(directory=str(quicklooks_path)), name="quicklooks")
    print(f"[THERMOINTEL] Mounted Sentinel-2 quicklooks from {quicklooks_path}")
else:
    print(f"[THERMOINTEL WARNING] Quicklooks directory not found at {quicklooks_path}")

# Include API routers
app.include_router(sources.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(explainability.router, prefix=settings.API_PREFIX)
app.include_router(tactical.router, prefix=settings.API_PREFIX)
app.include_router(correlated_events.router, prefix=settings.API_PREFIX)
app.include_router(benchmarks.router, prefix=settings.API_PREFIX)
app.include_router(chat.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    """Ensure grid baselines, district tagging, and initial correlated events are ready."""
    try:
        compute_grid_baselines()
        run_correlated_detection()
        assign_sources_to_districts()
        print("[THERMOINTEL] Correlated detection & district benchmarks initialized.")
    except Exception as err:
        print(f"[THERMOINTEL WARNING] Failed to initialize analytics engines: {err}")

START_TIME = time.time()

@app.get("/api/health")
def health_check():
    """Health check verifying database connection, satellite file assets, and uptime."""
    try:
        res = execute_one("SELECT COUNT(*) as total, COUNT(DISTINCT classification) as classes FROM thermal_sources")
        total_sources = res["total"]
        total_classes = res["classes"]
        db_status = "HEALTHY"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"
        total_sources = 0
        total_classes = 0

    quicklook_files_count = len(list(quicklooks_path.glob("*.jpg"))) if quicklooks_path.exists() else 0

    return {
        "status": "HEALTHY" if db_status == "HEALTHY" else "DEGRADED",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "database": {
            "status": db_status,
            "total_records": total_sources,
            "distinct_classes": total_classes,
            "sqlite_file": settings.DATABASE_PATH
        },
        "satellite_evidence": {
            "quicklooks_dir": str(quicklooks_path),
            "quicklooks_found": quicklook_files_count,
            "status": "AVAILABLE" if quicklook_files_count > 0 else "MISSING"
        },
        "version": settings.VERSION
    }

# Mount frontend dist static files if built
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept /api, /docs, /openapi.json, /static
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("static") or full_path == "openapi.json":
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        file_candidate = frontend_dist / full_path
        if file_candidate.is_file():
            return FileResponse(file_candidate)
        
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Frontend index.html not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
