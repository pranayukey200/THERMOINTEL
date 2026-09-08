"""
SQLite database helper utilities for THERMOINTEL.
"""
import sqlite3
from contextlib import contextmanager
from typing import Generator
from app.config import settings

def dict_factory(cursor, row):
    """Convert SQLite row tuple to dictionary with proper boolean conversion."""
    d = {}
    for idx, col in enumerate(cursor.description):
        col_name = col[0]
        val = row[idx]
        # Convert integer flags back to booleans where expected
        if col_name in ('activity_surge', 'strong_activity_surge', 'newly_emerging', 
                        'high_recent_intensity', 'low_persistence', 'established_source', 'evidence_available'):
            d[col_name] = bool(val)
        else:
            d[col_name] = val
    return d

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """Provide a transactional SQLite database connection."""
    conn = sqlite3.connect(settings.DATABASE_PATH, timeout=20.0)
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()

def execute_query(query: str, params: tuple = ()) -> list[dict]:
    """Execute a read query and return dictionary rows."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

def execute_one(query: str, params: tuple = ()) -> dict | None:
    """Execute a read query and return a single row or None."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchone()
