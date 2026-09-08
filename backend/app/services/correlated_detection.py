import os
import math
import json
import sqlite3
import hashlib
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN

from app.config import settings
from app.gazetteer import INDIAN_LOCATIONS

def get_db():
    conn = sqlite3.connect(settings.DATABASE_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_tables():
    """Ensure all required tables for correlated detection exist."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS grid_cell_baselines (
            grid_lat INTEGER NOT NULL,
            grid_lon INTEGER NOT NULL,
            region_name TEXT NOT NULL,
            total_sources INTEGER NOT NULL,
            mean_daily_surges REAL NOT NULL,
            std_daily_surges REAL NOT NULL,
            PRIMARY KEY (grid_lat, grid_lon)
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS correlated_thermal_events (
            event_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'OPEN',
            tag TEXT NOT NULL,
            region_name TEXT NOT NULL,
            source_count INTEGER NOT NULL,
            source_ids TEXT NOT NULL,
            centroid_lat REAL NOT NULL,
            centroid_lon REAL NOT NULL,
            z_score REAL NOT NULL,
            baseline_mean REAL NOT NULL,
            baseline_std REAL NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            first_detected_at TEXT NOT NULL,
            last_detected_at TEXT NOT NULL,
            consecutive_misses INTEGER NOT NULL DEFAULT 0,
            detection_run_id INTEGER NOT NULL
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS correlated_detection_runs (
            run_id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_timestamp TEXT NOT NULL,
            strict_mode INTEGER NOT NULL,
            total_surges INTEGER NOT NULL,
            raw_clusters INTEGER NOT NULL,
            significant_clusters INTEGER NOT NULL,
            open_events INTEGER NOT NULL
        )
        ''')
        conn.commit()

def resolve_region_name(lat: float, lon: float) -> str:
    """Find the nearest Indian city or industrial cluster from gazetteer."""
    best_dist = float('inf')
    best_name = f'Zone ({int(lat)}°N, {int(lon)}°E)'
    
    for key, loc in INDIAN_LOCATIONS.items():
        l_lat = loc.get('lat')
        l_lon = loc.get('lon')
        if l_lat is not None and l_lon is not None:
            dist = math.hypot(lat - l_lat, lon - l_lon)
            if dist < best_dist:
                best_dist = dist
                state = loc.get('state', '')
                loc_name = loc.get('name', key.title())
                if dist <= 1.5:  # within ~150km
                    best_name = f'{loc_name}, {state}' if state else loc_name
                elif dist <= 3.0:
                    best_name = f'{loc_name} Belt, {state}' if state else loc_name

    return best_name

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def compute_grid_baselines() -> Dict[Tuple[int, int], Dict[str, Any]]:
    """
    Step 1: Compute historical average daily count of sources with activity_surge=TRUE
    for each 1°×1° spatial grid cell using existing historical per-source activity data.
    Stores in grid_cell_baselines table.
    """
    init_tables()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if baselines already computed
        cursor.execute('SELECT count(*) FROM grid_cell_baselines')
        count = cursor.fetchone()[0]
        if count >= 400:
            cursor.execute('SELECT * FROM grid_cell_baselines')
            baselines = {}
            for r in cursor.fetchall():
                baselines[(r['grid_lat'], r['grid_lon'])] = dict(r)
            return baselines

        # Otherwise compute from thermal_sources
        df = pd.read_sql('''
            SELECT thermal_source_id, latitude, longitude, activity_surge, 
                   previous_23d_activity_rate, classification
            FROM thermal_sources
        ''', conn)

        df['grid_lat'] = df['latitude'].apply(math.floor).astype(int)
        df['grid_lon'] = df['longitude'].apply(math.floor).astype(int)

        baselines = {}
        for (glat, glon), group in df.groupby(['grid_lat', 'grid_lon']):
            surge_group = group[group['activity_surge'] == 1]
            rates = surge_group['previous_23d_activity_rate'].values
            
            # Expected daily surge count from historical baseline rates
            if len(rates) > 0:
                mean_daily = float(rates.sum())
                # Exact Poisson-binomial variance: Var = sum(p_i * (1 - p_i))
                variance = float((rates * (1.0 - rates)).sum())
                # Floor std dev at 0.5 to prevent singularity in quiet cells
                std_daily = float(max(math.sqrt(max(variance, 0.01)), 0.5))
            else:
                mean_daily = 0.0
                std_daily = 0.5

            region_name = resolve_region_name(glat + 0.5, glon + 0.5)
            row_dict = {
                'grid_lat': glat,
                'grid_lon': glon,
                'region_name': region_name,
                'total_sources': len(group),
                'mean_daily_surges': round(mean_daily, 4),
                'std_daily_surges': round(std_daily, 4)
            }
            baselines[(glat, glon)] = row_dict

            cursor.execute('''
                INSERT OR REPLACE INTO grid_cell_baselines 
                (grid_lat, grid_lon, region_name, total_sources, mean_daily_surges, std_daily_surges)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (glat, glon, region_name, len(group), row_dict['mean_daily_surges'], row_dict['std_daily_surges']))

        conn.commit()
        return baselines

def get_event_dates_map() -> Dict[int, str]:
    """Map source_id to latest observation date."""
    ev_path = os.path.join(os.path.dirname(settings.DATABASE_PATH), 'processed', 'thermal_satellite_evidence_index_90day.csv')
    date_map = {}
    if os.path.exists(ev_path):
        ev = pd.read_csv(ev_path, usecols=['thermal_source_id', 'last_seen', 'scene_date', 'date_difference_days'])
        for _, row in ev.iterrows():
            sid = int(row['thermal_source_id'])
            if pd.notna(row.get('last_seen')):
                date_map[sid] = str(row['last_seen'])[:10]
            elif pd.notna(row.get('scene_date')) and str(row.get('scene_date')) != '':
                base = datetime.fromisoformat(str(row['scene_date'])[:10])
                diff = int(row.get('date_difference_days') or 0)
                if diff > 0:
                    date_map[sid] = (base + timedelta(days=diff)).strftime('%Y-%m-%d')
                else:
                    date_map[sid] = base.strftime('%Y-%m-%d')
    return date_map

def run_correlated_detection(strict_mode: bool = False) -> Dict[str, Any]:
    """
    Execute full 5-step Correlated Thermal Activity Detection:
    1. Baseline lookup
    2. DBSCAN spatio-temporal clustering: (haversine_km / 150) + (days_apart / 3), min_samples=3
    3. Regional Z-score significance filter (Z >= 2.0)
    4. Land-cover tagging (Agricultural vs Industrial)
    5. Stateful deduplication and auto-closing (2 consecutive misses)
    """
    baselines = compute_grid_baselines()
    dates_map = get_event_dates_map()

    with get_db() as conn:
        cursor = conn.cursor()
        
        # Step 2: Clustering
        surge_filter = 'strong_activity_surge = 1' if strict_mode else 'activity_surge = 1'
        query = f'''
            SELECT thermal_source_id, latitude, longitude, classification, 
                   activity_surge, strong_activity_surge, risk_score, risk_band,
                   scene_date, date_difference_days, mean_frp, max_frp
            FROM thermal_sources
            WHERE {surge_filter}
        '''
        df = pd.read_sql(query, conn)

        if len(df) < 3:
            return {'status': 'success', 'events_found': 0, 'clusters': []}

        # Resolve date for each source
        def resolve_date(r):
            sid = int(r['thermal_source_id'])
            if sid in dates_map:
                return dates_map[sid]
            if pd.notna(r['scene_date']) and r['scene_date'] != '':
                base = datetime.fromisoformat(str(r['scene_date'])[:10])
                diff = int(r['date_difference_days'] or 0)
                if diff > 0:
                    return (base + timedelta(days=diff)).strftime('%Y-%m-%d')
                return base.strftime('%Y-%m-%d')
            return '2026-08-28'

        df['event_date_str'] = df.apply(resolve_date, axis=1)
        df['event_date'] = pd.to_datetime(df['event_date_str'])

        N = len(df)
        coords = df[['latitude', 'longitude']].values
        dates = df['event_date'].values

        # Build pairwise combined spatio-temporal distance matrix
        # Metric: (haversine_distance_km / 150) + (days_apart / 3)
        dist_matrix = np.zeros((N, N), dtype=np.float32)
        for i in range(N):
            for j in range(i + 1, N):
                h_dist = haversine_km(coords[i, 0], coords[i, 1], coords[j, 0], coords[j, 1])
                t_dist = abs((dates[i] - dates[j]) / np.timedelta64(1, 'D'))
                combined = (h_dist / 150.0) + (t_dist / 3.0)
                dist_matrix[i, j] = combined
                dist_matrix[j, i] = combined

        db = DBSCAN(eps=1.0, min_samples=3, metric='precomputed')
        labels = db.fit_predict(dist_matrix)
        df['cluster_label'] = labels

        unique_labels = [l for l in set(labels) if l != -1]
        raw_clusters_count = len(unique_labels)
        
        # Step 3 & 4: Significance Filter & Land-cover Tagging
        surviving_clusters = []
        for c in unique_labels:
            c_df = df[df['cluster_label'] == c]
            source_count = len(c_df)
            member_ids = sorted(c_df['thermal_source_id'].astype(int).tolist())
            
            centroid_lat = float(c_df['latitude'].mean())
            centroid_lon = float(c_df['longitude'].mean())
            glat = int(math.floor(centroid_lat))
            glon = int(math.floor(centroid_lon))

            base_info = baselines.get((glat, glon), {
                'mean_daily_surges': 0.0,
                'std_daily_surges': 0.5,
                'region_name': resolve_region_name(centroid_lat, centroid_lon)
            })
            base_mean = base_info['mean_daily_surges']
            base_std = max(base_info['std_daily_surges'], 0.5)

            z_score = float((source_count - base_mean) / base_std)

            # Significance check: discard if z-score < 2.0
            if z_score < 2.0:
                continue

            # Step 4: Land-cover tagging
            ag_ratio = float((c_df['classification'] == 'Agricultural Burning').mean())
            tag = 'LOW_URGENCY_AGRICULTURAL' if ag_ratio > 0.70 else 'INVESTIGATE_INDUSTRIAL'
            
            start_date_str = str(c_df['event_date_str'].min())
            end_date_str = str(c_df['event_date_str'].max())
            region_name = base_info['region_name']

            # Step 6: Dynamic alert text
            title = f'{source_count} thermal sources across {region_name} exhibited synchronized abnormal activity between {start_date_str} and {end_date_str}.'

            surviving_clusters.append({
                'source_count': source_count,
                'source_ids': member_ids,
                'centroid_lat': round(centroid_lat, 5),
                'centroid_lon': round(centroid_lon, 5),
                'z_score': round(z_score, 2),
                'baseline_mean': round(base_mean, 2),
                'baseline_std': round(base_std, 2),
                'start_date': start_date_str,
                'end_date': end_date_str,
                'tag': tag,
                'region_name': region_name,
                'title': title
            })

        # Step 5: Stateful Deduplication & Auto-closing
        cursor.execute('SELECT * FROM correlated_thermal_events WHERE status = \"OPEN\"')
        open_events = [dict(r) for r in cursor.fetchall()]
        
        # Run record
        cursor.execute('''
            INSERT INTO correlated_detection_runs 
            (run_timestamp, strict_mode, total_surges, raw_clusters, significant_clusters, open_events)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (datetime.utcnow().isoformat(), int(strict_mode), N, raw_clusters_count, len(surviving_clusters), len(open_events)))
        run_id = cursor.lastrowid

        matched_open_event_ids = set()
        persisted_events = []

        now_iso = datetime.utcnow().isoformat()

        for cluster in surviving_clusters:
            new_source_set = set(cluster['source_ids'])
            matched_event = None
            
            # Check overlap with existing open events (>= 70% source overlap)
            for oe in open_events:
                existing_source_set = set(json.loads(oe['source_ids']))
                intersection = len(new_source_set & existing_source_set)
                overlap_ratio = intersection / max(len(new_source_set), len(existing_source_set))
                if overlap_ratio >= 0.70:
                    matched_event = oe
                    break

            if matched_event:
                # Update existing event
                eid = matched_event['event_id']
                matched_open_event_ids.add(eid)
                merged_ids = sorted(list(new_source_set | set(json.loads(matched_event['source_ids']))))
                merged_count = len(merged_ids)
                new_end_date = max(matched_event['end_date'], cluster['end_date'])
                
                cursor.execute('''
                    UPDATE correlated_thermal_events
                    SET source_ids = ?,
                        source_count = ?,
                        end_date = ?,
                        last_detected_at = ?,
                        consecutive_misses = 0,
                        detection_run_id = ?
                    WHERE event_id = ?
                ''', (json.dumps(merged_ids), merged_count, new_end_date, now_iso, run_id, eid))
                
                cluster['event_id'] = eid
                cluster['status'] = 'OPEN'
                persisted_events.append(cluster)
            else:
                # Assign deterministic hash of sorted member source IDs
                source_str = ','.join(map(str, cluster['source_ids']))
                eid = 'CEV-' + hashlib.sha256(source_str.encode()).hexdigest()[:10].upper()
                
                cursor.execute('''
                    INSERT OR REPLACE INTO correlated_thermal_events
                    (event_id, title, status, tag, region_name, source_count, source_ids,
                     centroid_lat, centroid_lon, z_score, baseline_mean, baseline_std,
                     start_date, end_date, first_detected_at, last_detected_at, consecutive_misses, detection_run_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                ''', (
                    eid, cluster['title'], 'OPEN', cluster['tag'], cluster['region_name'],
                    cluster['source_count'], json.dumps(cluster['source_ids']),
                    cluster['centroid_lat'], cluster['centroid_lon'], cluster['z_score'],
                    cluster['baseline_mean'], cluster['baseline_std'],
                    cluster['start_date'], cluster['end_date'], now_iso, now_iso, run_id
                ))
                cluster['event_id'] = eid
                cluster['status'] = 'OPEN'
                persisted_events.append(cluster)

        # Auto-close open events that were not matched in this run
        for oe in open_events:
            eid = oe['event_id']
            if eid not in matched_open_event_ids:
                new_misses = oe['consecutive_misses'] + 1
                new_status = 'CLOSED' if new_misses >= 2 else 'OPEN'
                cursor.execute('''
                    UPDATE correlated_thermal_events
                    SET consecutive_misses = ?,
                        status = ?
                    WHERE event_id = ?
                ''', (new_misses, new_status, eid))

        conn.commit()

        return {
            'status': 'success',
            'run_id': run_id,
            'total_surges': N,
            'raw_clusters': raw_clusters_count,
            'significant_clusters': len(surviving_clusters),
            'events': persisted_events
        }

def get_active_events(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Query correlated events from database."""
    init_tables()
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute('SELECT * FROM correlated_thermal_events WHERE status = ? ORDER BY z_score DESC', (status,))
        else:
            cursor.execute('SELECT * FROM correlated_thermal_events ORDER BY status ASC, z_score DESC')
        rows = [dict(r) for r in cursor.fetchall()]
        for r in rows:
            r['source_ids'] = json.loads(r['source_ids'])
        return rows

def get_event_detail(event_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve full event detail including member sources."""
    init_tables()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM correlated_thermal_events WHERE event_id = ?', (event_id,))
        row = cursor.fetchone()
        if not row:
            return None
        event = dict(row)
        source_ids = json.loads(event['source_ids'])
        event['source_ids'] = source_ids

        # Fetch detailed telemetry for member sources
        placeholders = ','.join('?' * len(source_ids))
        cursor.execute(f'''
            SELECT thermal_source_id, latitude, longitude, classification, 
                   classification_confidence, risk_score, risk_band, anomaly_status,
                   mean_frp, max_frp, industrial_context_score, satellite_evidence_status
            FROM thermal_sources
            WHERE thermal_source_id IN ({placeholders})
        ''', source_ids)
        event['member_sources'] = [dict(r) for r in cursor.fetchall()]
        return event

def get_all_baselines() -> List[Dict[str, Any]]:
    """Retrieve all computed 1°×1° grid cell baselines."""
    init_tables()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM grid_cell_baselines ORDER BY total_sources DESC')
        return [dict(r) for r in cursor.fetchall()]
