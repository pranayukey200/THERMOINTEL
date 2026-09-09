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

def init_chat_db():
    """Initialize chat_history table in SQLite database."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL DEFAULT 'default',
                user_message TEXT NOT NULL,
                assistant_reply TEXT NOT NULL,
                tool_calls_json TEXT,
                action_links_json TEXT,
                latency_ms REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

# Ensure table exists on module load
init_chat_db()

def save_chat_message(
    user_message: str,
    assistant_reply: str,
    tool_calls_json: str = "[]",
    action_links_json: str = "[]",
    latency_ms: float = 0.0,
    session_id: str = "default"
) -> int:
    """Persist a conversation turn into SQLite chat_history table."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chat_history (session_id, user_message, assistant_reply, tool_calls_json, action_links_json, latency_ms)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (session_id, user_message, assistant_reply, tool_calls_json, action_links_json, latency_ms))
        conn.commit()
        return cursor.lastrowid

def get_chat_history(limit: int = 50, session_id: str | None = None) -> list[dict]:
    """Retrieve persisted conversation turns from SQLite."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if session_id:
            cursor.execute("""
                SELECT id, session_id, user_message, assistant_reply, tool_calls_json, action_links_json, latency_ms, created_at
                FROM chat_history
                WHERE session_id = ?
                ORDER BY id ASC
                LIMIT ?
            """, (session_id, limit))
        else:
            cursor.execute("""
                SELECT id, session_id, user_message, assistant_reply, tool_calls_json, action_links_json, latency_ms, created_at
                FROM chat_history
                ORDER BY id ASC
                LIMIT ?
            """, (limit,))
        return cursor.fetchall()

def clear_chat_history(session_id: str | None = None):
    """Clear chat history in SQLite."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if session_id:
            cursor.execute("DELETE FROM chat_history WHERE session_id = ?", (session_id,))
        else:
            cursor.execute("DELETE FROM chat_history")
        conn.commit()

