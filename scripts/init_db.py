"""
Database initialization script for THERMOINTEL.
Ingests the master intelligence CSV into SQLite and creates indexes.
"""
import os
import sqlite3
import pandas as pd
import numpy as np

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "thermintel.db")
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed", "thermal_master_intelligence_90day.csv")

def init_database():
    print(f"Loading master intelligence data from: {CSV_PATH}")
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Master CSV not found at {CSV_PATH}")
    
    df = pd.read_csv(CSV_PATH)
    total_records = len(df)
    print(f"Read {total_records} rows and {len(df.columns)} columns.")

    # Convert booleans to integers for SQLite compatibility
    bool_cols = [
        'activity_surge', 'strong_activity_surge', 'newly_emerging', 
        'high_recent_intensity', 'low_persistence', 'established_source'
    ]
    for col in bool_cols:
        if col in df.columns:
            df[col] = df[col].astype(bool).astype(int)

    # Handle evidence_available boolean/object
    if 'evidence_available' in df.columns:
        df['evidence_available'] = df['evidence_available'].map(lambda x: 1 if str(x).lower() in ('true', '1') else 0)

    # Ensure null values in text columns are clean
    text_cols = ['sentinel_id', 'mgrs_tile', 'scene_date', 'evidence_quality', 'satellite_image_path']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna('')

    num_cols = ['cloud_cover', 'date_difference_days']
    for col in num_cols:
        if col in df.columns:
            df[col] = df[col].fillna(-1.0)

    # Ensure database directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing database at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table schema
    cursor.execute("""
    CREATE TABLE thermal_sources (
        thermal_source_id INTEGER PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        mean_frp REAL NOT NULL,
        max_frp REAL NOT NULL,
        total_detections INTEGER NOT NULL,
        active_days INTEGER NOT NULL,
        persistence_score REAL NOT NULL,
        recent_activity_rate REAL NOT NULL,
        previous_23d_activity_rate REAL NOT NULL,
        activity_change REAL NOT NULL,
        recent_activity_status TEXT NOT NULL,
        activity_surge INTEGER NOT NULL,
        strong_activity_surge INTEGER NOT NULL,
        newly_emerging INTEGER NOT NULL,
        high_recent_intensity INTEGER NOT NULL,
        low_persistence INTEGER NOT NULL,
        established_source INTEGER NOT NULL,
        anomaly_score REAL NOT NULL,
        anomaly_status TEXT NOT NULL,
        label TEXT NOT NULL,
        label_confidence TEXT NOT NULL,
        classification TEXT NOT NULL,
        classification_confidence REAL NOT NULL,
        classification_source TEXT NOT NULL,
        confidence_type TEXT NOT NULL,
        industrial_context_score INTEGER NOT NULL,
        classification_risk INTEGER NOT NULL,
        anomaly_risk INTEGER NOT NULL,
        industrial_risk INTEGER NOT NULL,
        thermal_intensity_risk REAL NOT NULL,
        risk_score REAL NOT NULL,
        risk_band TEXT NOT NULL,
        sentinel_id TEXT,
        mgrs_tile TEXT,
        scene_date TEXT,
        cloud_cover REAL,
        date_difference_days REAL,
        evidence_available INTEGER NOT NULL,
        evidence_quality TEXT,
        satellite_image_path TEXT,
        satellite_evidence_status TEXT NOT NULL
    );
    """)

    # Insert data
    df.to_sql("thermal_sources", conn, if_exists="append", index=False)
    print(f"Inserted {total_records} rows into table thermal_sources.")

    # Create indexes for optimal query speed
    print("Building indexes...")
    cursor.execute("CREATE INDEX idx_sources_coords ON thermal_sources(latitude, longitude);")
    cursor.execute("CREATE INDEX idx_sources_classification ON thermal_sources(classification);")
    cursor.execute("CREATE INDEX idx_sources_anomaly_status ON thermal_sources(anomaly_status);")
    cursor.execute("CREATE INDEX idx_sources_risk_band ON thermal_sources(risk_band);")
    cursor.execute("CREATE INDEX idx_sources_risk_score ON thermal_sources(risk_score);")
    cursor.execute("CREATE INDEX idx_sources_anomaly_score ON thermal_sources(anomaly_score);")
    cursor.execute("CREATE INDEX idx_sources_industrial ON thermal_sources(industrial_context_score);")
    cursor.execute("CREATE INDEX idx_sources_evidence_status ON thermal_sources(satellite_evidence_status);")
    cursor.execute("CREATE INDEX idx_sources_evidence_quality ON thermal_sources(evidence_quality);")

    conn.commit()

    # Verification
    cursor.execute("SELECT COUNT(*) FROM thermal_sources;")
    db_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT classification) FROM thermal_sources;")
    class_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM thermal_sources WHERE satellite_evidence_status = 'AVAILABLE';")
    sat_avail_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM thermal_sources WHERE satellite_evidence_status = 'UNAVAILABLE';")
    sat_unavail_count = cursor.fetchone()[0]

    conn.close()

    print("=" * 60)
    print(f"DATABASE VERIFICATION COMPLETE:")
    print(f" - Total records: {db_count} (Expected: 15436)")
    print(f" - Classifications: {class_count} classes")
    print(f" - Satellite Available: {sat_avail_count} (Expected: 14373)")
    print(f" - Satellite Unavailable: {sat_unavail_count} (Expected: 1063)")
    print("=" * 60)
    assert db_count == 15436, f"Expected 15436 records, got {db_count}"
    assert sat_avail_count == 14373, f"Expected 14373 available, got {sat_avail_count}"
    assert sat_unavail_count == 1063, f"Expected 1063 unavailable, got {sat_unavail_count}"
    print("ALL INTEGRITY ASSERTIONS PASSED!")

if __name__ == "__main__":
    init_database()
