"""
Chatbot API routes for grounded database thermal intelligence assistant.
Provides endpoint for natural language query processing with tool-calling auditing.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from app.services.chatbot_service import process_chat_query

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
    """
    client_ip = request.client.host if request.client else "default"
    result = process_chat_query(
        user_message=req.message,
        history=req.history,
        client_id=client_ip
    )

    return ChatResponse(
        reply=result["reply"],
        tool_calls=result.get("tool_calls", []),
        action_links=result.get("action_links", []),
        latency_ms=result.get("latency_ms", 0.0),
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

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
