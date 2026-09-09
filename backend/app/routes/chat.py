"""
Chatbot API routes for grounded database thermal intelligence assistant.
Provides endpoint for natural language query processing with tool-calling auditing.
"""
from datetime import datetime
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel, Field
from app.services.chatbot_service import process_chat_query
from app.database import save_chat_message, get_chat_history, clear_chat_history

router = APIRouter(prefix="/chat", tags=["Grounded Database Assistant"])

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User question")
    history: Optional[List[Dict[str, Any]]] = Field(default=None, description="Previous message history")

class ToolCallTrace(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    execution_ms: float

class ActionLink(BaseModel):
    type: str
    label: str
    url: Optional[str] = None
    prompt: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    tool_calls: List[ToolCallTrace]
    action_links: List[ActionLink]
    latency_ms: float
    timestamp: str

STARTER_QUESTIONS = [
    {
        "category": "Top Risk",
        "prompt": "What are the top critical risk thermal sources in Chhattisgarh?",
        "tool": "get_top_risk_sources"
    },
    {
        "category": "Dossier",
        "prompt": "Give me the intelligence dossier and satellite evidence for source #2868.",
        "tool": "get_source_detail"
    },
    {
        "category": "Benchmarks",
        "prompt": "What is the thermal risk benchmark score and 30-day trend for Cuddalore district?",
        "tool": "get_district_benchmark"
    },
    {
        "category": "Facility",
        "prompt": "Which industrial facility is closest to hotspot #2868 and what is its distance?",
        "tool": "get_facility_info"
    },
    {
        "category": "Correlated",
        "prompt": "Are there any active correlated surge events detected across India?",
        "tool": "get_correlated_events"
    },
    {
        "category": "Breakdown",
        "prompt": "Break down the threat classifications in Tamil Nadu.",
        "tool": "get_classification_breakdown"
    }
]

@router.post("/message", response_model=ChatResponse)
def handle_chat_message(req: ChatMessageRequest, request: Request):
    """
    Process a user message using safe, read-only database tool calling.
    Returns the grounded explanation alongside verifiable tool call audit traces.
    Persists the conversation turn into SQLite database.
    """
    client_ip = request.client.host if request.client else "default"
    result = process_chat_query(
        user_message=req.message,
        history=req.history,
        client_id=client_ip
    )

    # Persist conversation turn in SQLite
    try:
        save_chat_message(
            user_message=req.message,
            assistant_reply=result["reply"],
            tool_calls_json=json.dumps(result.get("tool_calls", [])),
            action_links_json=json.dumps(result.get("action_links", [])),
            latency_ms=result.get("latency_ms", 0.0),
            session_id=client_ip
        )
    except Exception as e:
        print(f"[Chat History Error] Could not persist message: {e}")

    return ChatResponse(
        reply=result["reply"],
        tool_calls=result.get("tool_calls", []),
        action_links=result.get("action_links", []),
        latency_ms=result.get("latency_ms", 0.0),
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@router.get("/history")
def get_history(limit: int = Query(50, ge=1, le=200), session_id: Optional[str] = None):
    """Retrieve persisted chat conversation turns from SQLite database."""
    history_rows = get_chat_history(limit=limit, session_id=session_id)
    # Parse JSON fields
    formatted = []
    for row in history_rows:
        tool_calls = []
        action_links = []
        try:
            if row.get("tool_calls_json"):
                tool_calls = json.loads(row["tool_calls_json"])
        except Exception:
            pass
        try:
            if row.get("action_links_json"):
                action_links = json.loads(row["action_links_json"])
        except Exception:
            pass

        formatted.append({
            "id": row["id"],
            "session_id": row["session_id"],
            "user_message": row["user_message"],
            "assistant_reply": row["assistant_reply"],
            "tool_calls": tool_calls,
            "action_links": action_links,
            "latency_ms": row.get("latency_ms", 0.0),
            "created_at": row.get("created_at")
        })
    return formatted

@router.delete("/history")
def clear_history(session_id: Optional[str] = None):
    """Clear chat conversation history in SQLite database."""
    clear_chat_history(session_id=session_id)
    return {"status": "success", "message": "Chat history cleared"}

@router.get("/starters", response_model=List[Dict[str, Any]])
def get_chat_starters():
    """Retrieve pre-verified starter prompts for instant user exploration."""
    return STARTER_QUESTIONS

@router.get("/status")
def get_chat_status():
    """Check chatbot service status and tool catalog."""
    return {
        "status": "OPERATIONAL",
        "engine": "Grounded Database Tool-Calling Router (Zero External API Keys)",
        "rate_limit": "30 requests/min per IP",
        "available_tools": [
            "get_top_risk_sources",
            "get_source_detail",
            "get_district_benchmark",
            "get_correlated_events",
            "get_classification_breakdown",
            "get_facility_info"
        ]
    }

