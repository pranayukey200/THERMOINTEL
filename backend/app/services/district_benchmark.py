"""
THERMOINTEL - District and State Thermal Risk Benchmark Engine
Sovereign Spatial Risk Normalization & Comparative Analytics
"""
import math
import sqlite3
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from app.config import settings

DB_PATH = settings.DATABASE_PATH

# Authoritative Indian District Boundary & Area Reference Catalog
# Areas in square kilometers (km^2), centroids, bounding boxes, and state mappings.
INDIAN_DISTRICTS: Dict[str, Dict[str, Any]] = {
    # Jharkhand
    "Dhanbad": {
        "state": "Jharkhand",
        "area_sqkm": 2040.0,
        "centroid": (23.7957, 86.4304),
        "bbox": [23.60, 86.10, 24.05, 86.75],
        "type": "Industrial/Mining",
        "primary_industries": "Coking Coal, Jharia Coalfield, Heavy Metallurgy"
    },
    "Bokaro": {
        "state": "Jharkhand",
        "area_sqkm": 2883.0,
        "centroid": (23.6693, 86.1511),
        "bbox": [23.40, 85.80, 23.90, 86.45],
        "type": "Industrial",
        "primary_industries": "SAIL Steel Plant, Thermal Power, Coal Washeries"
    },
    "Ranchi": {
        "state": "Jharkhand",
        "area_sqkm": 5097.0,
        "centroid": (23.3441, 85.3096),
        "bbox": [23.00, 84.90, 23.65, 85.70],
        "type": "Mixed/Urban",
        "primary_industries": "Heavy Engineering Corporation, Mineral Processing"
    },
    "East Singhbhum": {
        "state": "Jharkhand",
        "area_sqkm": 3562.0,
        "centroid": (22.8046, 86.2029),
        "bbox": [22.45, 85.90, 23.15, 86.60],
        "type": "Industrial/Metallurgy",
        "primary_industries": "Tata Steel, Copper Smelting, Uranium Mining"
    },
    "Ramgarh": {
        "state": "Jharkhand",
        "area_sqkm": 1341.0,
        "centroid": (23.6300, 85.5100),
        "bbox": [23.45, 85.30, 23.85, 85.75],
        "type": "Mining/Power",
        "primary_industries": "Coal Mining, Thermal Power Generation, Sponge Iron"
    },

    # Chhattisgarh
    "Korba": {
        "state": "Chhattisgarh",
        "area_sqkm": 6598.0,
        "centroid": (22.3595, 82.7501),
        "bbox": [22.00, 82.30, 22.95, 83.20],
        "type": "Power/Mining",
        "primary_industries": "NTPC Super Thermal, BALCO Aluminium, SECL Coal"
    },
    "Durg": {
        "state": "Chhattisgarh",
        "area_sqkm": 2238.0,
        "centroid": (21.1938, 81.3509),
        "bbox": [20.90, 81.10, 21.50, 81.65],
        "type": "Industrial/Steel",
        "primary_industries": "Bhilai Steel Plant, Heavy Engineering, Cement"
    },
    "Raipur": {
        "state": "Chhattisgarh",
        "area_sqkm": 2892.0,
        "centroid": (21.2514, 81.6296),
        "bbox": [20.95, 81.40, 21.60, 82.10],
        "type": "Industrial/Rerolling",
        "primary_industries": "Steel Rerolling, Agro-Processing, Power Generation"
    },
    "Raigarh": {
        "state": "Chhattisgarh",
        "area_sqkm": 7086.0,
        "centroid": (21.8974, 83.3950),
        "bbox": [21.50, 82.90, 22.45, 83.80],
        "type": "Power/Sponge Iron",
        "primary_industries": "Jindal Steel & Power, Coal Extraction, Sponge Iron"
    },

    # Madhya Pradesh
    "Singrauli": {
        "state": "Madhya Pradesh",
        "area_sqkm": 5672.0,
        "centroid": (24.1997, 82.6644),
        "bbox": [23.80, 82.10, 24.65, 83.15],
        "type": "Super Thermal Power",
        "primary_industries": "NTPC Vindhyachal, Sasan Ultra Mega Power, Northern Coalfields"
    },
    "Sonbhadra": {
        "state": "Uttar Pradesh",
        "area_sqkm": 6788.0,
        "centroid": (24.4500, 82.9800),
        "bbox": [23.85, 82.50, 24.95, 83.40],
        "type": "Energy Capital",
        "primary_industries": "Thermal Power Stations, Hindalco Aluminium, Chemical"
    },
    "Bhopal": {
        "state": "Madhya Pradesh",
        "area_sqkm": 2772.0,
        "centroid": (23.2599, 77.4126),
        "bbox": [23.00, 77.10, 23.55, 77.70],
        "type": "Industrial/Urban",
        "primary_industries": "BHEL Heavy Electricals, Mandideep Industrial Area"
    },
    "Indore": {
        "state": "Madhya Pradesh",
        "area_sqkm": 3898.0,
        "centroid": (22.7196, 75.8577),
        "bbox": [22.40, 75.50, 23.05, 76.15],
        "type": "Auto/Pharma",
        "primary_industries": "Pithampur Special Economic Zone, Pharmaceuticals"
    },

    # Gujarat
    "Jamnagar": {
        "state": "Gujarat",
        "area_sqkm": 14125.0,
        "centroid": (22.4707, 70.0577),
        "bbox": [21.80, 69.40, 22.95, 70.60],
        "type": "Petrochemical/Refinery",
        "primary_industries": "Reliance Industries Jamnagar Refinery, Nayara Energy"
    },
    "Surat": {
        "state": "Gujarat",
        "area_sqkm": 4418.0,
        "centroid": (21.1702, 72.8311),
        "bbox": [20.80, 72.50, 21.55, 73.25],
        "type": "Petrochemical/Textile",
        "primary_industries": "Hazira Industrial Belt, ONGC Gas Processing, AM/NS Steel"
    },
    "Bharuch": {
        "state": "Gujarat",
        "area_sqkm": 5253.0,
        "centroid": (21.6264, 73.0152),
        "bbox": [21.30, 72.60, 22.00, 73.40],
        "type": "Chemical PCPIR",
        "primary_industries": "Ankleshwar PCPIR, Dahej Petrochemicals & LNG Terminal"
    },
    "Valsad": {
        "state": "Gujarat",
        "area_sqkm": 3034.0,
        "centroid": (20.3893, 72.9106),
        "bbox": [20.10, 72.65, 20.75, 73.20],
        "type": "Chemical/Industrial",
        "primary_industries": "Vapi GIDC Chemical Estate, Paper Mills, Dyes"
    },
    "Ahmedabad": {
        "state": "Gujarat",
        "area_sqkm": 8086.0,
        "centroid": (23.0225, 72.5714),
        "bbox": [22.60, 71.90, 23.45, 73.10],
        "type": "Industrial/Manufacturing",
        "primary_industries": "Textiles, Chemicals, Sanand Automotive Corridor"
    },
    "Vadodara": {
        "state": "Gujarat",
        "area_sqkm": 7556.0,
        "centroid": (22.3072, 73.1812),
        "bbox": [21.90, 72.80, 22.70, 73.60],
        "type": "Petrochemical/Refinery",
        "primary_industries": "IOCL Gujarat Refinery, IPCL Petrochemicals, Heavy Glass"
    },

    # Maharashtra
    "Chandrapur": {
        "state": "Maharashtra",
        "area_sqkm": 11443.0,
        "centroid": (19.9615, 79.2961),
        "bbox": [19.40, 78.80, 20.50, 79.90],
        "type": "Super Thermal/Coal",
        "primary_industries": "CSTPS Chandrapur Super Thermal Power, WCL Coal Mines"
    },
    "Mumbai Suburban": {
        "state": "Maharashtra",
        "area_sqkm": 446.0,
        "centroid": (19.0760, 72.8777),
        "bbox": [18.90, 72.75, 19.30, 73.05],
        "type": "Petrochemical/Urban",
        "primary_industries": "BPCL & HPCL Refineries Mahul, Chemical Terminals"
    },
    "Thane": {
        "state": "Maharashtra",
        "area_sqkm": 4214.0,
        "centroid": (19.2183, 72.9781),
        "bbox": [19.00, 72.80, 19.65, 73.45],
        "type": "Chemical/Manufacturing",
        "primary_industries": "Trans-Thane Creek (TTC) Industrial Area, Chemical Plants"
    },
    "Palghar": {
        "state": "Maharashtra",
        "area_sqkm": 5344.0,
        "centroid": (19.8656, 72.6841),
        "bbox": [19.50, 72.50, 20.20, 73.10],
        "type": "Nuclear/Chemical",
        "primary_industries": "Tarapur Atomic Power Station, Boisar MIDC Chemical Zone"
    },
    "Pune": {
        "state": "Maharashtra",
        "area_sqkm": 15643.0,
        "centroid": (18.5204, 73.8567),
        "bbox": [18.10, 73.30, 19.20, 74.50],
        "type": "Automotive/Foundry",
        "primary_industries": "Chakan Auto Hub, Bhosari MIDC, Heavy Engineering"
    },
    "Nagpur": {
        "state": "Maharashtra",
        "area_sqkm": 9892.0,
        "centroid": (21.1458, 79.0882),
        "bbox": [20.70, 78.50, 21.65, 79.60],
        "type": "Thermal/Logistics",
        "primary_industries": "Koradi & Khaparkheda Power Stations, MIHAN Corridor"
    },

    # Odisha
    "Angul": {
        "state": "Odisha",
        "area_sqkm": 6375.0,
        "centroid": (20.8444, 85.1511),
        "bbox": [20.40, 84.70, 21.30, 85.60],
        "type": "Aluminium/Steel",
        "primary_industries": "NALCO Smelter, Jindal Steel & Power, NTPC Kaniha"
    },
    "Jharsuguda": {
        "state": "Odisha",
        "area_sqkm": 2081.0,
        "centroid": (21.8554, 84.0062),
        "bbox": [21.60, 83.70, 22.15, 84.30],
        "type": "Aluminium/Power",
        "primary_industries": "Vedanta Aluminium Complex, OPGC Thermal Power"
    },
    "Sundargarh": {
        "state": "Odisha",
        "area_sqkm": 9712.0,
        "centroid": (22.2604, 84.8536),
        "bbox": [21.80, 83.50, 22.60, 85.30],
        "type": "Steel/Mining",
        "primary_industries": "Rourkela Steel Plant (SAIL), Iron Ore & Manganese Mines"
    },
    "Jagatsinghpur": {
        "state": "Odisha",
        "area_sqkm": 1668.0,
        "centroid": (20.3165, 86.6114),
        "bbox": [20.00, 86.10, 20.55, 86.90],
        "type": "Refinery/Port",
        "primary_industries": "IOCL Paradeep Refinery, Paradeep Phosphates, Major Port"
    },

    # West Bengal
    "Paschim Bardhaman": {
        "state": "West Bengal",
        "area_sqkm": 1603.0,
        "centroid": (23.6739, 86.9524),
        "bbox": [23.40, 86.70, 23.90, 87.45],
        "type": "Coal/Steel Corridor",
        "primary_industries": "IISCO Burnpur, Durgapur Steel Plant, Raniganj Coal Belt"
    },
    "Kolkata": {
        "state": "West Bengal",
        "area_sqkm": 206.0,
        "centroid": (22.5726, 88.3639),
        "bbox": [22.45, 88.25, 22.70, 88.45],
        "type": "Urban/Commercial",
        "primary_industries": "River Port Operations, Heavy Warehousing, Manufacturing"
    },

    # Punjab (High Agricultural Stubble + Refineries)
    "Bathinda": {
        "state": "Punjab",
        "area_sqkm": 3385.0,
        "centroid": (30.2110, 74.9455),
        "bbox": [29.80, 74.60, 30.55, 75.30],
        "type": "Refinery/Agricultural",
        "primary_industries": "Guru Gobind Singh Refinery (HMEL), Thermal Power, Cropland"
    },
    "Ludhiana": {
        "state": "Punjab",
        "area_sqkm": 3767.0,
        "centroid": (30.9010, 75.8573),
        "bbox": [30.60, 75.40, 31.25, 76.25],
        "type": "Industrial/Agricultural",
        "primary_industries": "Engineering, Textiles, Cycle Industry, Agricultural Burning"
    },
    "Amritsar": {
        "state": "Punjab",
        "area_sqkm": 2683.0,
        "centroid": (31.6340, 74.8723),
        "bbox": [31.35, 74.50, 31.95, 75.20],
        "type": "Agricultural/Border",
        "primary_industries": "Intensive Cropland Harvest Residue, Food Processing"
    },
    "Jalandhar": {
        "state": "Punjab",
        "area_sqkm": 2632.0,
        "centroid": (31.3260, 75.5762),
        "bbox": [31.00, 75.25, 31.60, 75.85],
        "type": "Manufacturing/Agricultural",
        "primary_industries": "Sports Goods, Agricultural Residue Burning, Leather"
    },
    "Patiala": {
        "state": "Punjab",
        "area_sqkm": 3218.0,
        "centroid": (30.3398, 76.3869),
        "bbox": [30.00, 76.00, 30.70, 76.80],
        "type": "Agricultural/Power",
        "primary_industries": "Nabhat Thermal Power, Intensive Stubble Burning Belt"
    },

    # Haryana
    "Panipat": {
        "state": "Haryana",
        "area_sqkm": 1268.0,
        "centroid": (29.3909, 76.9635),
        "bbox": [29.15, 76.70, 29.65, 77.25],
        "type": "Petrochemical/Refinery",
        "primary_industries": "IOCL Panipat Refinery, Petrochemicals Complex, Heavy Textile"
    },
    "Karnal": {
        "state": "Haryana",
        "area_sqkm": 2520.0,
        "centroid": (29.6857, 76.9905),
        "bbox": [29.40, 76.65, 29.95, 77.30],
        "type": "Agricultural/Industrial",
        "primary_industries": "Basmati Cropland Residue, Agro-Equipment Manufacturing"
    },
    "Gurugram": {
        "state": "Haryana",
        "area_sqkm": 1258.0,
        "centroid": (28.4595, 77.0266),
        "bbox": [28.25, 76.80, 28.65, 77.25],
        "type": "Automotive/Tech",
        "primary_industries": "Maruti Suzuki Auto Plant, Manesar Industrial Estate"
    },

    # Karnataka
    "Bengaluru Urban": {
        "state": "Karnataka",
        "area_sqkm": 2196.0,
        "centroid": (12.9716, 77.5946),
        "bbox": [12.65, 77.35, 13.25, 77.85],
        "type": "Urban/Industrial",
        "primary_industries": "Peenya Industrial Estate, Electronics, Defense Aerospace"
    },
    "Ballari": {
        "state": "Karnataka",
        "area_sqkm": 8447.0,
        "centroid": (15.1394, 76.9214),
        "bbox": [14.65, 76.35, 15.65, 77.35],
        "type": "Steel/Iron Ore",
        "primary_industries": "JSW Vijayanagar Steel Toranagallu, Iron Ore Mining"
    },

    # Tamil Nadu
    "Chennai": {
        "state": "Tamil Nadu",
        "area_sqkm": 426.0,
        "centroid": (13.0827, 80.2707),
        "bbox": [12.90, 80.15, 13.25, 80.35],
        "type": "Industrial/Urban",
        "primary_industries": "Manali Petrochemical Corridor, CPCL Refinery, Ennore Port"
    },
    "Tiruvallur": {
        "state": "Tamil Nadu",
        "area_sqkm": 3422.0,
        "centroid": (13.1432, 79.9070),
        "bbox": [12.95, 79.60, 13.55, 80.30],
        "type": "Heavy Industry/Power",
        "primary_industries": "Ennore Thermal Power, Heavy Vehicles Factory, Auto Corridor"
    },
    "Cuddalore": {
        "state": "Tamil Nadu",
        "area_sqkm": 3678.0,
        "centroid": (11.5976, 79.4862),
        "bbox": [11.20, 79.20, 11.95, 79.85],
        "type": "Lignite/Power",
        "primary_industries": "NLC Neyveli Lignite Mines, Super Thermal Power Plants, SIPCOT"
    },

    # Telangana
    "Peddapalli": {
        "state": "Telangana",
        "area_sqkm": 2236.0,
        "centroid": (18.7551, 79.5134),
        "bbox": [18.45, 79.20, 19.05, 79.80],
        "type": "Super Thermal Power",
        "primary_industries": "NTPC Ramagundam Super Thermal Power, SCCL Coal Mining"
    },
    "Hyderabad": {
        "state": "Telangana",
        "area_sqkm": 217.0,
        "centroid": (17.3850, 78.4867),
        "bbox": [17.25, 78.35, 17.55, 78.60],
        "type": "Pharma/Urban",
        "primary_industries": "Pharma City, Defense Manufacturing, Chemical Industries"
    },

    # Andhra Pradesh
    "Visakhapatnam": {
        "state": "Andhra Pradesh",
        "area_sqkm": 1048.0,
        "centroid": (17.6868, 83.2185),
        "bbox": [17.50, 83.00, 17.95, 83.45],
        "type": "Steel/Port",
        "primary_industries": "RINL Vizag Steel Plant, HPCL Refinery, Coastal Maritime"
    },
    "Anakapalli": {
        "state": "Andhra Pradesh",
        "area_sqkm": 4292.0,
        "centroid": (17.6913, 83.0039),
        "bbox": [17.30, 82.50, 18.00, 83.20],
        "type": "Pharma/Power",
        "primary_industries": "Jawaharlal Nehru Pharma City, NTPC Simhadri Super Thermal"
    },

    # Rajasthan
    "Jaipur": {
        "state": "Rajasthan",
        "area_sqkm": 11143.0,
        "centroid": (26.9124, 75.7873),
        "bbox": [26.40, 75.10, 27.40, 76.30],
        "type": "Manufacturing/Mining",
        "primary_industries": "Vishwakarma Industrial Area, Metal Processing, Gems"
    },
    "Alwar": {
        "state": "Rajasthan",
        "area_sqkm": 8380.0,
        "centroid": (27.5530, 76.6346),
        "bbox": [27.10, 76.20, 28.15, 77.20],
        "type": "Automotive/Chemical",
        "primary_industries": "Bhiwadi Industrial Area, Matsya Industrial Area, Auto Hub"
    },

    # Uttar Pradesh
    "Kanpur Nagar": {
        "state": "Uttar Pradesh",
        "area_sqkm": 3155.0,
        "centroid": (26.4499, 80.3319),
        "bbox": [26.15, 79.95, 26.80, 80.60],
        "type": "Leather/Chemical",
        "primary_industries": "Heavy Tanneries, Fertilizer & Ordnance Factories"
    },
    "Gautam Buddha Nagar": {
        "state": "Uttar Pradesh",
        "area_sqkm": 1442.0,
        "centroid": (28.5355, 77.3910),
        "bbox": [28.20, 77.25, 28.70, 77.65],
        "type": "Industrial/Electronics",
        "primary_industries": "Noida & Greater Noida Industrial Zone, Manufacturing"
    },

    # Bihar
    "Patna": {
        "state": "Bihar",
        "area_sqkm": 3202.0,
        "centroid": (25.5941, 85.1376),
        "bbox": [25.25, 84.70, 25.85, 85.50],
        "type": "Agro/Industrial",
        "primary_industries": "Food Processing, Fertilizer Terminals, Gangetic Agriculture"
    },

    # Assam
    "Kamrup Metropolitan": {
        "state": "Assam",
        "area_sqkm": 1528.0,
        "centroid": (26.1445, 91.7362),
        "bbox": [25.90, 91.45, 26.40, 92.00],
        "type": "Refinery/Logistics",
        "primary_industries": "IOCL Guwahati Refinery, North-East Industrial Gateway"
    }
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in kilometers."""
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def assign_sources_to_districts():
    """
    Performs spatial join tagging on all 15,436 thermal sources:
    Associates each source with an authentic district and state.
    Updates the database with district and state columns.
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Ensure columns exist
    c.execute("PRAGMA table_info(thermal_sources)")
    cols = [col[1] for col in c.fetchall()]
    if "district" not in cols:
        c.execute("ALTER TABLE thermal_sources ADD COLUMN district TEXT")
    if "state" not in cols:
        c.execute("ALTER TABLE thermal_sources ADD COLUMN state TEXT")
    conn.commit()

    # Check how many are currently untagged
    c.execute("SELECT COUNT(*) FROM thermal_sources WHERE district IS NULL OR state IS NULL")
    untagged_count = c.fetchone()[0]
    if untagged_count == 0:
        conn.close()
        return

    print(f"[DistrictBenchmark] Tagging {untagged_count} thermal sources with district/state...")

    # Load all sources
    df = pd.read_sql("SELECT thermal_source_id, latitude, longitude FROM thermal_sources", conn)

    updates = []
    district_items = list(INDIAN_DISTRICTS.items())

    for _, row in df.iterrows():
        sid = int(row["thermal_source_id"])
        lat = float(row["latitude"])
        lon = float(row["longitude"])

        best_district = None
        best_state = None
        best_dist = float("inf")

        # First pass: check bbox containment
        for dname, dinfo in district_items:
            min_lat, min_lon, max_lat, max_lon = dinfo["bbox"]
            if min_lat <= lat <= max_lat and min_lon <= lon <= max_lon:
                c_lat, c_lon = dinfo["centroid"]
                d = haversine_km(lat, lon, c_lat, c_lon)
                if d < best_dist:
                    best_dist = d
                    best_district = dname
                    best_state = dinfo["state"]

        # Fallback: find nearest centroid
        if best_district is None:
            for dname, dinfo in district_items:
                c_lat, c_lon = dinfo["centroid"]
                d = haversine_km(lat, lon, c_lat, c_lon)
                if d < best_dist:
                    best_dist = d
                    best_district = dname
                    best_state = dinfo["state"]

        updates.append((best_district, best_state, sid))

    c.executemany("UPDATE thermal_sources SET district = ?, state = ? WHERE thermal_source_id = ?", updates)
    conn.commit()
    conn.close()
    print(f"[DistrictBenchmark] Successfully assigned {len(updates)} sources to districts.")


def compute_percentile_ranks(values: List[float]) -> List[float]:
    """
    Computes empirical percentile ranks [0, 100] for a list of values.
    """
    n = len(values)
    if n <= 1:
        return [50.0] * n
    sorted_vals = sorted(values)
    ranks = []
    for v in values:
        # standard percentile rank formula: (count(y < v) + 0.5 * count(y == v)) / n * 100
        less = sum(1 for y in sorted_vals if y < v)
        equal = sum(1 for y in sorted_vals if y == v)
        p = ((less + 0.5 * equal) / float(n)) * 100.0
        ranks.append(round(p, 1))
    return ranks


def calculate_window_district_metrics(
    start_date: str,
    end_date: str,
    mode: str = "all"
) -> Dict[str, Dict[str, Any]]:
    """
    Aggregates per-district metrics over a date window [start_date, end_date].
    mode: 'all' (all sources) or 'industrial' (only Industrial Fire, Persistent Industrial, Mining).
    """
    conn = sqlite3.connect(DB_PATH)

    sql = """
        SELECT
            district,
            state,
            classification,
            risk_score,
            risk_band,
            mean_frp,
            max_frp,
            last_seen
        FROM thermal_sources
        WHERE last_seen >= ? AND last_seen <= ?
          AND district IS NOT NULL
    """
    df = pd.read_sql(sql, conn, params=[start_date, end_date])
    conn.close()

    if mode == "industrial":
        # Strictly isolate industrial sources - DO NOT blend agricultural burning
        df = df[df["classification"].isin([
            "Industrial Fire",
            "Persistent Industrial Thermal Activity",
            "Mining / Industrial Thermal"
        ])]

    district_metrics = {}

    for dname, dinfo in INDIAN_DISTRICTS.items():
        sub = df[df["district"] == dname]
        total_sources = len(sub)
        area_sqkm = dinfo["area_sqkm"]
        area_k_km2 = area_sqkm / 1000.0
        density = round(total_sources / area_k_km2, 2)

        # Classification counts
        cls_counts = sub["classification"].value_counts().to_dict() if total_sources > 0 else {}

        # Industrial vs Agricultural counts for tagging
        ind_count = sum(sub["classification"].isin([
            "Industrial Fire",
            "Persistent Industrial Thermal Activity",
            "Mining / Industrial Thermal"
        ]))
        agri_count = sum(sub["classification"] == "Agricultural Burning")

        if ind_count >= agri_count:
            dominant_tag = "INDUSTRIAL_DOMINANT"
        else:
            dominant_tag = "AGRICULTURAL_DOMINANT"

        if total_sources > 0:
            avg_risk = round(float(sub["risk_score"].mean()), 1)
            high_crit_count = int(sub["risk_band"].isin(["HIGH", "CRITICAL"]).sum())
            high_crit_share = round((high_crit_count / float(total_sources)) * 100.0, 1)
            mean_frp = round(float(sub["mean_frp"].mean()), 1)
            peak_frp = round(float(sub["max_frp"].max()), 1)
        else:
            avg_risk = 0.0
            high_crit_count = 0
            high_crit_share = 0.0
            mean_frp = 0.0
            peak_frp = 0.0

        district_metrics[dname] = {
            "district": dname,
            "state": dinfo["state"],
            "area_sqkm": area_sqkm,
            "total_sources": total_sources,
            "source_density": density,
            "avg_risk_score": avg_risk,
            "high_crit_count": high_crit_count,
            "high_crit_share": high_crit_share,
            "mean_frp": mean_frp,
            "peak_frp": peak_frp,
            "classification_counts": cls_counts,
            "dominant_tag": dominant_tag,
            "centroid": dinfo["centroid"],
            "bbox": dinfo["bbox"],
            "primary_industries": dinfo.get("primary_industries", "")
        }

    return district_metrics


def get_district_benchmarks(
    mode: str = "all",
    state_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes normalized District Thermal Risk Benchmarks:
    1. Current rolling 30-day window: 2026-07-31 to 2026-08-29.
    2. Prior 30-day window: 2026-07-01 to 2026-07-30.
    3. Normalization: source density (per 1000 km^2), percentile ranks across districts.
    4. Separates eligible districts (N >= 5) from insufficient data districts (N < 5).
    5. Percentage change delta against prior window.
    """
    assign_sources_to_districts()

    # Window definitions (rolling 30-day & prior 30-day)
    cur_start, cur_end = "2026-07-31", "2026-08-29"
    pri_start, pri_end = "2026-07-01", "2026-07-30"

    current_data = calculate_window_district_metrics(cur_start, cur_end, mode=mode)
    prior_data = calculate_window_district_metrics(pri_start, pri_end, mode=mode)

    # Filter by state if provided
    if state_filter:
        current_data = {k: v for k, v in current_data.items() if v["state"].lower() == state_filter.lower()}
        prior_data = {k: v for k, v in prior_data.items() if v["state"].lower() == state_filter.lower()}

    # Separate eligible (N >= 5) vs insufficient (< 5)
    eligible = [d for d in current_data.values() if d["total_sources"] >= 5]
    insufficient = [d for d in current_data.values() if d["total_sources"] < 5]

    # Calculate percentiles among eligible districts
    if eligible:
        densities = [d["source_density"] for d in eligible]
        risks = [d["avg_risk_score"] for d in eligible]
        peak_frps = [d["peak_frp"] for d in eligible]

        density_pcts = compute_percentile_ranks(densities)
        risk_pcts = compute_percentile_ranks(risks)
        peak_frp_pcts = compute_percentile_ranks(peak_frps)

        for i, d in enumerate(eligible):
            d["density_percentile"] = density_pcts[i]
            d["risk_percentile"] = risk_pcts[i]
            d["peak_frp_percentile"] = peak_frp_pcts[i]

            # Composite Score (0 - 100)
            # 30% Source Density Percentile + 30% Risk Percentile + 25% High/Crit Share + 15% Peak FRP Percentile
            score = (
                0.30 * d["density_percentile"] +
                0.30 * d["risk_percentile"] +
                0.25 * d["high_crit_share"] +
                0.15 * d["peak_frp_percentile"]
            )
            d["benchmark_score"] = round(min(max(score, 0.0), 100.0), 1)
    else:
        for d in eligible:
            d["benchmark_score"] = 0.0
            d["density_percentile"] = 0.0
            d["risk_percentile"] = 0.0
            d["peak_frp_percentile"] = 0.0

    # Calculate prior scores for trend delta
    prior_eligible = [d for d in prior_data.values() if d["total_sources"] >= 5]
    if prior_eligible:
        p_densities = [d["source_density"] for d in prior_eligible]
        p_risks = [d["avg_risk_score"] for d in prior_eligible]
        p_peak_frps = [d["peak_frp"] for d in prior_eligible]

        p_density_pcts = compute_percentile_ranks(p_densities)
        p_risk_pcts = compute_percentile_ranks(p_risks)
        p_peak_frp_pcts = compute_percentile_ranks(p_peak_frps)

        for i, d in enumerate(prior_eligible):
            pscore = (
                0.30 * p_density_pcts[i] +
                0.30 * p_risk_pcts[i] +
                0.25 * d["high_crit_share"] +
                0.15 * p_peak_frp_pcts[i]
            )
            d["benchmark_score"] = round(min(max(pscore, 0.0), 100.0), 1)

    prior_score_map = {d["district"]: d.get("benchmark_score", 0.0) for d in prior_eligible}

    # Compute trend deltas
    for d in eligible:
        pri_score = prior_score_map.get(d["district"], 0.0)
        d["prior_benchmark_score"] = pri_score
        if pri_score > 0:
            delta = ((d["benchmark_score"] - pri_score) / pri_score) * 100.0
            d["trend_delta_pct"] = round(delta, 1)
        elif d["benchmark_score"] > 0:
            d["trend_delta_pct"] = 100.0
        else:
            d["trend_delta_pct"] = 0.0

    # Sort eligible by benchmark_score descending
    eligible.sort(key=lambda x: x["benchmark_score"], reverse=True)
    for idx, d in enumerate(eligible):
        d["rank"] = idx + 1

    # Insufficient data districts
    for d in insufficient:
        d["rank"] = None
        d["benchmark_score"] = 0.0
        d["trend_delta_pct"] = 0.0
        d["density_percentile"] = 0.0
        d["risk_percentile"] = 0.0
        d["peak_frp_percentile"] = 0.0
        d["status_note"] = f"Insufficient activity ({d['total_sources']} sources < 5 threshold for 30-day statistical benchmark)"

    return {
        "mode": mode,
        "window_current": f"{cur_start} to {cur_end}",
        "window_prior": f"{pri_start} to {pri_end}",
        "total_districts_monitored": len(INDIAN_DISTRICTS),
        "eligible_count": len(eligible),
        "insufficient_count": len(insufficient),
        "ranked_leaderboard": eligible,
        "insufficient_data": insufficient
    }


def get_state_benchmarks(mode: str = "all") -> Dict[str, Any]:
    """
    Computes State-Level Thermal Risk Benchmarks:
    Rolls up district scores as an area-weighted average:
    State Score = sum(District Score * District Area) / sum(District Area)
    Includes prior 30-day window and trend delta.
    """
    district_res = get_district_benchmarks(mode=mode)
    eligible = district_res["ranked_leaderboard"]
    insufficient = district_res["insufficient_data"]
    all_districts = eligible + insufficient

    # Group by state
    state_groups: Dict[str, List[Dict[str, Any]]] = {}
    for d in all_districts:
        st = d["state"]
        if st not in state_groups:
            state_groups[st] = []
        state_groups[st].append(d)

    state_results = []

    for state_name, dlist in state_groups.items():
        total_area = sum(d["area_sqkm"] for d in dlist)
        total_sources = sum(d["total_sources"] for d in dlist)

        # Area-weighted average score
        weighted_score_sum = sum(d["benchmark_score"] * d["area_sqkm"] for d in dlist)
        weighted_prior_sum = sum(d.get("prior_benchmark_score", 0.0) * d["area_sqkm"] for d in dlist)

        state_score = round(weighted_score_sum / total_area, 1) if total_area > 0 else 0.0
        prior_state_score = round(weighted_prior_sum / total_area, 1) if total_area > 0 else 0.0

        if prior_state_score > 0:
            delta = ((state_score - prior_state_score) / prior_state_score) * 100.0
            trend_delta_pct = round(delta, 1)
        elif state_score > 0:
            trend_delta_pct = 100.0
        else:
            trend_delta_pct = 0.0

        state_density = round(total_sources / (total_area / 1000.0), 2) if total_area > 0 else 0.0
        high_crit_count = sum(d["high_crit_count"] for d in dlist)

        # Combined classifications
        combined_cls: Dict[str, int] = {}
        for d in dlist:
            for cname, ccount in d.get("classification_counts", {}).items():
                combined_cls[cname] = combined_cls.get(cname, 0) + ccount

        # Dominant tag
        ind_total = sum(combined_cls.get(k, 0) for k in [
            "Industrial Fire",
            "Persistent Industrial Thermal Activity",
            "Mining / Industrial Thermal"
        ])
        agri_total = combined_cls.get("Agricultural Burning", 0)
        dominant_tag = "INDUSTRIAL_DOMINANT" if ind_total >= agri_total else "AGRICULTURAL_DOMINANT"

        state_results.append({
            "state": state_name,
            "benchmark_score": state_score,
            "prior_benchmark_score": prior_state_score,
            "trend_delta_pct": trend_delta_pct,
            "total_sources": total_sources,
            "total_area_sqkm": round(total_area, 0),
            "state_density": state_density,
            "high_crit_count": high_crit_count,
            "district_count": len(dlist),
            "classification_counts": combined_cls,
            "dominant_tag": dominant_tag
        })

    state_results.sort(key=lambda x: x["benchmark_score"], reverse=True)
    for idx, s in enumerate(state_results):
        s["rank"] = idx + 1

    return {
        "mode": mode,
        "window_current": district_res["window_current"],
        "window_prior": district_res["window_prior"],
        "state_count": len(state_results),
        "ranked_states": state_results
    }


def get_district_detail(district_name: str) -> Optional[Dict[str, Any]]:
    """
    Returns full metrics and breakdown for a single district.
    """
    benchmarks = get_district_benchmarks(mode="all")
    for d in benchmarks["ranked_leaderboard"] + benchmarks["insufficient_data"]:
        if d["district"].lower() == district_name.lower():
            return d
    return None
