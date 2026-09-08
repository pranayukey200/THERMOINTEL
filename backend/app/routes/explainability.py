"""
Explainable AI (XAI) and feature importance routes.
Provides model-level feature importance breakdown derived from Random Forest v1.
"""
import os
import pandas as pd
from fastapi import APIRouter
from app.config import settings
from app.schemas import FeatureImportanceItem

router = APIRouter(prefix="/feature-importance", tags=["Explainability"])

FEATURE_METADATA = {
    "cropland_pct": {
        "display_name": "Cropland Coverage (%)",
        "category": "Land-Cover Context",
        "description": "WorldCover 10m agricultural land-cover percentage in source vicinity; strongly influences agricultural burning vs wildfire discrimination."
    },
    "tree_cover_pct": {
        "display_name": "Tree Cover (%)",
        "category": "Land-Cover Context",
        "description": "WorldCover 10m dense tree/forest canopy coverage; key indicator for wildfire and forest fire classification."
    },
    "industrial_context_score": {
        "display_name": "Industrial Context Score",
        "category": "Industrial Proximity",
        "description": "Composite score derived from OpenStreetMap industrial infrastructure (refineries, chemical plants, steel works, mines, power stations)."
    },
    "nearest_osm_distance_km_ml": {
        "display_name": "Nearest Facility Distance (km)",
        "category": "Industrial Proximity",
        "description": "Geodesic distance to closest mapped industrial or infrastructure asset in OSM."
    },
    "persistence_score": {
        "display_name": "Persistence Score",
        "category": "Temporal Dynamics",
        "description": "Measure of multi-week continuous thermal recurrence; differentiates ongoing operational flares from transient open-field fires."
    },
    "active_days": {
        "display_name": "Active Days Count",
        "category": "Temporal Dynamics",
        "description": "Total discrete calendar days with detected FIRMS thermal hotspots across the 90-day window."
    },
    "osm_features_5km": {
        "display_name": "Industrial Assets (5km Radius)",
        "category": "Industrial Proximity",
        "description": "Density of verified industrial, mining, and energy generation points within 5km radius."
    },
    "quarries_5km": {
        "display_name": "Quarries / Mines (5km Radius)",
        "category": "Industrial Proximity",
        "description": "Count of active extraction sites and mineral processing facilities within 5km."
    },
    "mean_frp": {
        "display_name": "Mean Fire Radiative Power (MW)",
        "category": "VIIRS Thermal Metrics",
        "description": "Average thermal energy output across all detections measured in Megawatts by VIIRS."
    },
    "max_frp": {
        "display_name": "Peak Fire Radiative Power (MW)",
        "category": "VIIRS Thermal Metrics",
        "description": "Highest single-pass thermal radiance recorded during observation span."
    },
    "mean_bright_ti4": {
        "display_name": "Mean Brightness Temp (K)",
        "category": "VIIRS Thermal Metrics",
        "description": "Mean 3.75µm mid-infrared brightness temperature from VIIRS I-band sensor."
    },
    "total_detections": {
        "display_name": "Total Detection Count",
        "category": "Temporal Dynamics",
        "description": "Cumulative count of individual satellite overpass hotspot alerts for this thermal cluster."
    },
    "night_ratio": {
        "display_name": "Night Overpass Ratio",
        "category": "Temporal Dynamics",
        "description": "Fraction of thermal detections occurring during nighttime passes (characteristic of 24/7 continuous industrial processes)."
    },
    "observation_span_days": {
        "display_name": "Observation Span (Days)",
        "category": "Temporal Dynamics",
        "description": "Calendar days elapsed between earliest and latest recorded satellite thermal triggers."
    },
    "grassland_pct": {
        "display_name": "Grassland Coverage (%)",
        "category": "Land-Cover Context",
        "description": "WorldCover 10m grassland / shrubland percentage for open brushfire and rangeland discrimination."
    }
}

@router.get("", response_model=dict)
def get_feature_importance():
    """
    Retrieve feature importance breakdown for the Random Forest classifier.
    Includes feature descriptions, categories, and ethical AI model transparency notes.
    """
    csv_path = settings.FEATURE_IMPORTANCE_PATH
    if not os.path.exists(csv_path):
        # Fallback to final path
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "final", "random_forest_feature_importance_v1.csv")

    items = []
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        for _, row in df.iterrows():
            feat = row["feature"]
            meta = FEATURE_METADATA.get(feat, {
                "display_name": feat.replace("_", " ").title(),
                "category": "General Thermal Feature",
                "description": "Model input feature influencing classification decision boundaries."
            })
            items.append(FeatureImportanceItem(
                feature=feat,
                display_name=meta["display_name"],
                importance=float(row["importance"]),
                importance_pct=float(row["importance_pct"]),
                category=meta["category"],
                description=meta["description"]
            ))
    else:
        # Static fallback if file is temporarily unreachable
        for feat, meta in FEATURE_METADATA.items():
            items.append(FeatureImportanceItem(
                feature=feat,
                display_name=meta["display_name"],
                importance=0.05,
                importance_pct=5.0,
                category=meta["category"],
                description=meta["description"]
            ))

    # Category summaries
    cat_summary = {}
    for item in items:
        cat_summary[item.category] = round(cat_summary.get(item.category, 0.0) + item.importance_pct, 2)

    return {
        "model_name": "Random Forest Operational Classifier v1",
        "features": [i.model_dump() for i in items],
        "category_summary": [{"category": k, "total_pct": v} for k, v in cat_summary.items()],
        "transparency_disclosure": (
            "Features influencing the prototype Random Forest classification. "
            "These metrics represent relative feature importance across prototype decision boundaries "
            "and are presented for operational interpretability, not statistical causality."
        )
    }
