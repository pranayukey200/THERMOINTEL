# THERMOINTEL
**AI-Powered Industrial Thermal Intelligence & Monitoring Platform**
*SIH 2026 Problem Statement 26162*

An operational satellite-based thermal anomaly intelligence platform for the India/India-region bounding box (90-day observation window: 2026-06-01 to 2026-08-29).

---

## 🌟 Core Concept & Problem Solved

Traditional satellite hotspot platforms simply display NASA VIIRS/FIRMS thermal coordinates without context.

**THERMOINTEL answers the critical operational question:**
> *"This satellite-detected thermal anomaly is **WHAT**, is it **NORMAL or ABNORMAL**, and **HOW DANGEROUS** is it?"*

### End-to-End Intelligence Pipeline:
```
VIIRS Thermal Hotspot Detection (15,436 sources)
        ↓
Spatial & Temporal Source Aggregation
        ↓
WorldCover 10m Land-Cover Context
        ↓
OpenStreetMap Industrial Facility Context
        ↓
AI Prototype Classification (7 Classes)
        ↓
Multi-Factor Anomaly & Surge Detection
        ↓
Composite Operational Risk Scoring (0–100)
        ↓
Sentinel-2 Visual Satellite Evidence (93.11% coverage)
        ↓
Explainable AI (XAI) Feature Importance
        ↓
Tactical GIS Command-Centre Interface
```

---

## 🏗️ System Architecture

```
                                  THERMOINTEL PLATFORM
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                    COMMAND CENTRE FRONTEND (React 18 + TypeScript + Vite)                │
│   • Dark Tactical Command Center Aesthetic (Tailwind CSS)                                │
│   • GIS Command Map with Leaflet 60fps Canvas Rendering (15,436 point streaming)        │
│   • 6 Live Animated Telemetry KPI Cards                                                  │
│   • Source Intelligence Dossier with Sentinel-2 Lightbox & 90-Day Event Replay           │
│   • Mission Alerts Queue with Multi-Attribute Urgency Ranking                            │
│   • Dynamic Analytics & Distributions (Recharts)                                         │
│   • Explainable AI (XAI) Model Lab & Feature Weighting                                   │
│   • 1-Click SIH 2026 Demo Narrative Scenarios Launcher                                   │
└───────────────────────────────────────────▲──────────────────────────────────────────────┘
                                            │ REST API / JSON + Static Thumbnails
┌───────────────────────────────────────────▼──────────────────────────────────────────────┐
│                               FASTAPI BACKEND SERVICE (Python 3.14)                      │
│   • /api/sources (Pagination, Multi-Filter, Search, BBox)                                │
│   • /api/sources/map-points (Optimized spatial stream)                                   │
│   • /api/sources/{id}/satellite (Sentinel-2 scene metadata & static image URL)           │
│   • /api/sources/{id}/timeline (90-day observation timeline replay)                      │
│   • /api/alerts (Prioritized critical & abnormal triage queue)                           │
│   • /api/analytics/* (Dynamic summary, classification, risk, anomaly, evidence)         │
│   • /api/feature-importance (Random Forest v1 Gini importance & descriptions)            │
│   • /static/quicklooks (Direct high-speed Sentinel-2 thumbnail serving)                  │
└───────────────────────────────────────────▲──────────────────────────────────────────────┘
                                            │ SQLite Query Layer (Indexed)
┌───────────────────────────────────────────▼──────────────────────────────────────────────┐
│                               SQLITE DATABASE (data/thermintel.db)                       │
│   • 15,436 thermal source records (Zero modification to master intelligence data)        │
│   • Indexed on lat, lon, classification, risk_band, anomaly_status, risk_score          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Authoritative Master Dataset Metrics

- **Total Thermal Sources**: `15,436`
- **Classifications**:
  - `Uncertain / Low Evidence`: 13,832
  - `Agricultural Burning`: 684
  - `Industrial Fire`: 462
  - `Wildfire / Forest Fire`: 281
  - `Persistent Industrial Thermal Activity`: 102
  - `Mining / Industrial Thermal`: 70
  - `Gas Flare`: 5
- **Operational Risk Bands**:
  - `LOW`: 13,912
  - `MODERATE`: 1,496
  - `HIGH`: 27
  - `CRITICAL`: 1 (Source #2868 - Score 88.5)
- **Anomaly Statuses**:
  - `NORMAL / STABLE`: 13,596
  - `WATCH`: 1,795
  - `ABNORMAL`: 43
  - `CRITICAL ANOMALY`: 2
- **Sentinel-2 Visual Evidence**:
  - `AVAILABLE`: 14,373 (93.11%)
  - `UNAVAILABLE`: 1,063 (6.89%) — *preserves honest uncertainty without hiding the source!*
- **Evidence Quality Ratings**:
  - `STRONG`: 10,294
  - `GOOD`: 2,227
  - `MODERATE`: 1,217
  - `WEAK`: 468
  - `HISTORICAL_ONLY`: 167

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Python 3.10+** (Python 3.14 recommended)
- **Node.js 18+** and **npm**

### Step 1: Clone / Navigate to Directory
```bash
cd d:\Hackathon_projects\SIH
```

### Step 2: Ingest Master Data into SQLite (Automated)
```bash
python scripts/init_db.py
```
*Output verifies that all 15,436 rows and 14,373 Sentinel-2 scenes are imported and indexed.*

### Step 3: Launch the Platform

#### Option A: One-Command Platform Launcher (Recommended)
```bash
python run_platform.py
```
This automatically starts:
- **FastAPI Backend**: `http://localhost:8000` (API docs at `http://localhost:8000/docs`)
- **Command Centre UI**: `http://localhost:5173`

#### Option B: Run Services Separately

**Terminal 1 (Backend):**
```bash
python run_backend.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, database status, and quicklooks directory check |
| `GET` | `/api/sources` | Paginated thermal sources with multi-filtering (`classification`, `risk_band`, `anomaly_status`, `evidence_quality`, `search`, `min_risk_score`, etc.) |
| `GET` | `/api/sources/map-points` | Lightweight spatial point stream for high-performance GIS map rendering |
| `GET` | `/api/sources/{id}` | Complete 42-column intelligence dossier for a single source |
| `GET` | `/api/sources/{id}/satellite` | Sentinel-2 scene metadata and static thumbnail image link |
| `GET` | `/api/sources/{id}/timeline` | 90-day observation timeline for the Event Replay feature |
| `GET` | `/api/alerts` | Prioritized triage queue sorted by operational urgency rank |
| `GET` | `/api/analytics/summary` | Top-level real-time KPI metrics |
| `GET` | `/api/analytics/classification` | Prototype classification breakdown with average risk/anomaly |
| `GET` | `/api/analytics/risk` | Risk band distribution and 10-score histogram buckets |
| `GET` | `/api/analytics/anomaly` | Anomaly status distribution and surge counts |
| `GET` | `/api/analytics/industrial-context` | Industrial context score bins & distribution |
| `GET` | `/api/analytics/evidence` | Sentinel-2 coverage & visual quality breakdown |
| `GET` | `/api/feature-importance` | Random Forest feature importance weights and categories |
| `GET` | `/static/quicklooks/{file}.jpg` | High-resolution Sentinel-2 optical scene thumbnails |

---

## 🎯 SIH 2026 Jury Presentation Flow (1-Click Presets)

Click the **"Demo Scenarios"** button in the header to instantly demonstrate all 5 core narratives:

1. **🚨 Scenario 1: Critical Industrial Fire Emergency (`Source #2868`)**
   - *Classification:* Industrial Fire (92.3% confidence)
   - *Anomaly:* CRITICAL ANOMALY (score 90)
   - *Risk:* 88.5 / 100 (CRITICAL)
   - *Evidence:* Strong Sentinel-2 visual confirmation, refinery proximity (score 75).

2. **🏭 Scenario 2: Persistent Gas Flare (`Source #1494`)**
   - *Classification:* Gas Flare
   - *Anomaly:* NORMAL / STABLE
   - *Risk:* 31.9 (Moderate baseline)
   - *Key takeaway:* High FRP is **not** automatically an emergency if the thermal process is persistent and stable!

3. **🌾 Scenario 3: Rapid Agricultural Surge Anomaly (`Source #13282`)**
   - *Classification:* Agricultural Burning
   - *Anomaly:* ABNORMAL (Activity surge trigger)
   - *Context:* High cropland percentage with sudden rate increase.

4. **❓ Scenario 4: Honest Low-Evidence / Uncertain Source (`Source #0`)**
   - *Classification:* Uncertain / Low Evidence
   - *Confidence:* 0.0%
   - *Key takeaway:* The system **never** hallucinates false 99% accuracy when evidence is sparse.

5. **🛰️ Scenario 5: Satellite Unavailable Handling (`Source #11`)**
   - *Classification:* Persistent Industrial Thermal Activity
   - *Satellite:* UNAVAILABLE (Gracefully handled without hiding the source from operator view).

---

## 🛡️ Scientific & Operational Integrity Rules Followed

1. **Zero Data Tampering**: All 15,436 master dataset rows, classifications, and risk scores are ingested verbatim without modification.
2. **Honest AI Terminology**: Features and predictions are presented as *"Evidence-Derived Prototype AI Classifications"* and *"Operational Risk Scores"*, rather than falsely claiming scientifically validated ground-truth accuracy.
3. **Sensor Attribution**: VIIRS is correctly identified as the thermal detection sensor; Sentinel-2 is presented as visual supporting optical evidence.
4. **Context vs Causality**: OSM facility proximity is documented as supporting spatial context rather than absolute physical proof of causation.
