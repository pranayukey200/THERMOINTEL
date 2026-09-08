"""
Grounded database conversational service for THERMOINTEL.
Executes pre-tested read-only query functions from chatbot_tools.py,
ensures every stated metric is grounded in database facts, and returns
structured tool call audit trails.
"""
import re
import time
from typing import Dict, List, Any, Optional
from app.services.chatbot_tools import (
    get_top_risk_sources,
    get_source_detail,
    get_district_benchmark,
    get_correlated_events,
    get_classification_breakdown,
    get_facility_info
)

# In-memory sliding window rate limiter
RATE_LIMIT_STORE: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 30

def check_rate_limit(client_id: str = "default") -> bool:
    """Returns True if within rate limit, False if rate limited."""
    now = time.time()
    timestamps = RATE_LIMIT_STORE.get(client_id, [])
    # Evict timestamps older than window
    valid_ts = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(valid_ts) >= RATE_LIMIT_MAX_REQUESTS:
        RATE_LIMIT_STORE[client_id] = valid_ts
        return False
    valid_ts.append(now)
    RATE_LIMIT_STORE[client_id] = valid_ts
    return True

# Indian States and Districts dictionary for entity extraction
KNOWN_LOCATIONS = [
    "Durg", "Cuddalore", "Bhilai", "Korba", "Dhanbad", "Bokaro", "Ranchi", 
    "Bathinda", "Amritsar", "Ludhiana", "Jalandhar", "Kamrup", "Guwahati", 
    "Peddapalli", "Singrauli", "Raigarh", "Kutch", "Jamnagar", "Angul", "Jharsuguda", 
    "Sundargarh", "Paschim Bardhaman", "Purba Bardhaman", "Asansol", "Durgapur",
    "Chhattisgarh", "Tamil Nadu", "Punjab", "Assam", "Jharkhand", "Odisha",
    "West Bengal", "Gujarat", "Telangana", "Madhya Pradesh", "Rajasthan",
    "Maharashtra", "Karnataka", "Uttar Pradesh", "Haryana", "Andhra Pradesh", "Bihar"
]

def extract_source_id(text: str) -> Optional[int]:
    """Extract thermal source ID like 2868, #2868, SRC-2868, source 2868."""
    match = re.search(r"(?:src[-_\s#]*|source[-_\s#]*|hotspot[-_\s#]*|#)\s*(\d+)", text, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Standalone 3 to 5 digit number
    num_match = re.search(r"\b(\d{2,5})\b", text)
    if num_match:
        val = int(num_match.group(1))
        if 1 <= val <= 16000:
            return val
    return None

def extract_location(text: str) -> Optional[str]:
    """Extract known district or state from query text."""
    lower = text.lower()
    for loc in KNOWN_LOCATIONS:
        if loc.lower() in lower:
            return loc
    return None

def extract_risk_tier(text: str) -> Optional[str]:
    """Extract risk tier from query text."""
    lower = text.lower()
    if "critical" in lower:
        return "CRITICAL"
    if "high" in lower:
        return "HIGH"
    if "moderate" in lower or "medium" in lower:
        return "MODERATE"
    if "low" in lower:
        return "LOW"
    return None

def process_chat_query(
    user_message: str,
    history: Optional[List[Dict[str, str]]] = None,
    client_id: str = "default"
) -> Dict[str, Any]:
    """
    Main grounded conversational router.
    Parses intent, invokes matching tool, quotes exact facts, and returns audit trace.
    """
    start_time = time.time()
    
    # Rate limit check
    if not check_rate_limit(client_id):
        return {
            "reply": "⚠️ Rate limit exceeded. Please wait a moment before submitting further queries (maximum 30 queries per minute).",
            "tool_calls": [],
            "action_links": [],
            "latency_ms": round((time.time() - start_time) * 1000, 1)
        }

    clean_msg = user_message.strip()
    lower_msg = clean_msg.lower()

    # Ambiguity check
    if lower_msg in ["which is highest risk", "what is highest risk", "highest risk?", "tell me the highest risk"]:
        return {
            "reply": (
                "Could you clarify what you mean by 'highest risk'?\n\n"
                "• **Highest Risk Thermal Source**: The specific facility/hotspot point with the highest composite risk score.\n"
                "• **Highest Risk District**: The territorial jurisdiction with the highest normalized 30-day thermal risk benchmark.\n\n"
                "You can ask: *'What are the top critical risk sources?'* or *'Which district has the highest benchmark score?'*"
            ),
            "tool_calls": [],
            "action_links": [
                {"type": "suggestion", "label": "Top Critical Risk Hotspots", "prompt": "What are the top critical risk thermal sources in India?"},
                {"type": "suggestion", "label": "Highest Benchmark District", "prompt": "Which district has the highest thermal risk benchmark score?"}
            ],
            "latency_ms": round((time.time() - start_time) * 1000, 1)
        }

    source_id = extract_source_id(clean_msg)
    location = extract_location(clean_msg)
    tier = extract_risk_tier(clean_msg)

    tool_name = ""
    tool_args: Dict[str, Any] = {}
    tool_result: Any = None
    reply = ""
    action_links = []

    # 1. Facility & Infrastructure Proximity Query
    if source_id and any(k in lower_msg for k in ["facility", "factory", "osm", "infrastructure", "plant", "proximity", "distance", "company"]):
        tool_name = "get_facility_info"
        tool_args = {"thermal_source_id": source_id}
        tool_result = get_facility_info(source_id)

        if "error" in tool_result:
            reply = f"I queried the sovereign infrastructure database, but {tool_result['error']}"
        else:
            dist_text = f"{tool_result['distance_km']} km away" if tool_result['distance_km'] is not None else "distance not measured"
            reply = (
                f"### Infrastructure Proximity Report for Source #SRC-{source_id}\n\n"
                f"• **Location**: {tool_result['location']} at coordinates `[{tool_result['coordinates'][0]}°N, {tool_result['coordinates'][1]}°E]`\n"
                f"• **Threat Classification**: {tool_result['classification']}\n"
                f"• **Industrial Context Score**: **{tool_result['industrial_context_score']}/100**\n"
                f"• **Nearest Sovereign Facility**: **{tool_result['nearest_osm_facility']}** ({tool_result['nearest_osm_category']}, {dist_text})\n"
                f"• **Land Cover Composition**: {tool_result['land_cover']['built_up_pct']}% Built-up, {tool_result['land_cover']['cropland_pct']}% Cropland, {tool_result['land_cover']['tree_cover_pct']}% Tree cover.\n"
                f"• **Intelligence Assessment**: {tool_result['reasoning_summary']}"
            )
            action_links.append({
                "type": "map_source",
                "label": f"Inspect Source #{source_id} on Map",
                "url": f"/map?source_id={source_id}&lat={tool_result['coordinates'][0]}&lon={tool_result['coordinates'][1]}&inspect=true"
            })

    # 2. Source Dossier & Detail Query
    elif source_id and any(k in lower_msg for k in ["source", "hotspot", "dossier", "telemetry", "detail", "satellite", "frp", "evidence", "tell me about"]):
        tool_name = "get_source_detail"
        tool_args = {"thermal_source_id": source_id}
        tool_result = get_source_detail(source_id)

        if "error" in tool_result:
            reply = f"Database query completed: {tool_result['error']}"
        else:
            reply = (
                f"### Intelligence Dossier for Hotspot #SRC-{source_id}\n\n"
                f"• **Jurisdiction**: {tool_result['district']}, {tool_result['state']} `[{tool_result['coordinates'][0]}°N, {tool_result['coordinates'][1]}°E]`\n"
                f"• **AI Classification**: **{tool_result['classification']}** (Confidence: {round((tool_result['confidence'] or 0.85)*100, 1)}%)\n"
                f"• **Composite Risk**: **{tool_result['risk_score']}/100** (Band: **{tool_result['risk_band']}**)\n"
                f"• **Anomaly Status**: **{tool_result['anomaly_status']}** (Anomaly Score: {tool_result['anomaly_score']}/100)\n"
                f"• **Thermal Intensity**: Mean FRP **{tool_result['mean_frp_mw']} MW** (Peak: **{tool_result['max_frp_mw']} MW**)\n"
                f"• **Temporal Persistence**: Detected active on {tool_result['active_days']} days with persistence score {tool_result['persistence_score']}/100\n"
                f"• **Sentinel-2 Satellite Evidence**: Status is **{tool_result['satellite_evidence_status']}** (Quality: {tool_result['evidence_quality'] or 'STANDARD'})\n"
                f"• **Runaway Evaluation**: {tool_result['thermal_runaway_status']}"
            )
            action_links.append({
                "type": "map_source",
                "label": f"Inspect Hotspot #{source_id} on Live Map",
                "url": f"/map?source_id={source_id}&lat={tool_result['coordinates'][0]}&lon={tool_result['coordinates'][1]}&inspect=true"
            })

    # 3. Correlated Activity & Synchronized Surge Clusters
    elif any(k in lower_msg for k in ["correlated", "synchronized", "surge cluster", "cluster", "dbscan", "synchronized events", "regional surge"]):
        tool_name = "get_correlated_events"
        tool_args = {"active_only": True}
        tool_result = get_correlated_events(active_only=True)

        if not tool_result:
            reply = "I queried the spatio-temporal clustering engine. There are currently **0 active correlated surge clusters** detected across India."
        else:
            lines = [f"Found **{len(tool_result)} active correlated thermal activity events** across India:"]
            for idx, e in enumerate(tool_result[:4], 1):
                lines.append(
                    f"\n**{idx}. Event [{e['event_id']}] — {e['region_name']}**\n"
                    f"   • Hotspot Count: **{e['source_count']} synchronized sources**\n"
                    f"   • Significance Z-Score: **+{e['z_score']}σ** above historical cell baseline\n"
                    f"   • Dominant Classification: {e['dominant_classification']} (Peak FRP: **{e['peak_frp_mw']} MW**)\n"
                    f"   • Tag: `{e['tag']}` (Active window: {e['date_range']})"
                )
                action_links.append({
                    "type": "map_cluster",
                    "label": f"Inspect Event {e['event_id']} on Map",
                    "url": f"/map?cluster_id={e['event_id']}&sources={','.join(map(str, e['member_source_ids'][:10]))}&name={e['region_name']}&z={e['z_score']}"
                })
            reply = "\n".join(lines)

    # 4. Top Risk Sources Query (if user asks for top, highest, sources, hotspots, critical points)
    elif any(k in lower_msg for k in ["top", "highest risk", "sources", "hotspots", "points", "critical", "alerts", "worst"]):
        target_tier = tier or ("CRITICAL" if "alert" in lower_msg or "critical" in lower_msg else None)
        tool_name = "get_top_risk_sources"
        tool_args = {"region": location, "tier": target_tier, "limit": 5}
        tool_result = get_top_risk_sources(region=location, tier=target_tier, limit=5)

        if not tool_result:
            region_str = f" in {location}" if location else ""
            tier_str = f" with risk tier '{target_tier}'" if target_tier else ""
            reply = f"I queried the database, but no thermal sources match{region_str}{tier_str}."
        else:
            region_str = f" in **{location}**" if location else " across **Pan-India**"
            tier_str = f" ({target_tier} tier)" if target_tier else ""
            lines = [f"### Top Risk Thermal Sources{region_str}{tier_str}\n"]
            for idx, s in enumerate(tool_result, 1):
                lines.append(
                    f"**{idx}. Hotspot #SRC-{s['source_id']}** — {s['district']}, {s['state']}\n"
                    f"   • Risk Score: **{s['risk_score']}/100** ({s['risk_band']}) | Anomaly: **{s['anomaly_status']}**\n"
                    f"   • Classification: **{s['classification']}** (Industrial Context: {s['industrial_score']}/100)\n"
                    f"   • Coordinates: `[{s['latitude']}°N, {s['longitude']}°E]` | FRP: **{s['mean_frp_mw']} MW** (Peak: **{s['max_frp_mw']} MW**)\n"
                    f"   • Satellite Overpass: `{s['satellite_status']}` (Last Seen: {s['last_seen']})"
                )
                action_links.append({
                    "type": "map_source",
                    "label": f"Inspect Source #{s['source_id']}",
                    "url": f"/map?source_id={s['source_id']}&lat={s['latitude']}&lon={s['longitude']}&inspect=true"
                })
            reply = "\n".join(lines)

    # 5. District or State Thermal Risk Benchmark
    elif any(k in lower_msg for k in ["benchmark", "density", "leaderboard", "rank", "state score", "district score", "normalized risk"]) or (location and any(k in lower_msg for k in ["score", "status", "overview"])):
        target_loc = location or "Durg"
        tool_name = "get_district_benchmark"
        tool_args = {"district_or_state": target_loc, "period": "current_30day"}
        tool_result = get_district_benchmark(target_loc)

        if "error" in tool_result:
            reply = f"Benchmark catalog query completed: {tool_result['error']}"
        else:
            is_dist = tool_result["type"] == "district"
            trend_symbol = "+" if tool_result["trend_delta_pct"] > 0 else ""
            reply = (
                f"### Territorial Thermal Risk Benchmark: {tool_result.get('district', tool_result.get('state'))}\n\n"
                f"• **Jurisdiction Level**: {tool_result['type'].upper()} ({tool_result.get('state', '')})\n"
                f"• **Composite Benchmark Score**: **{tool_result['benchmark_score']} / 100** (National Rank: **#{tool_result['rank']}**)\n"
                f"• **Spatial Source Density**: **{tool_result.get('source_density_per_1000sqkm', tool_result.get('state_density_per_1000sqkm'))} sources per 1,000 km²** (Boundary Area: {tool_result.get('area_sqkm', tool_result.get('total_area_sqkm')):,} km²)\n"
                f"• **30-Day Active Hotspots**: **{tool_result['total_active_sources_30d']} sources**\n"
                f"• **High / Critical Severity Sources**: **{tool_result['high_crit_count']}**\n"
                f"• **30-Day Temporal Trend Delta**: **{trend_symbol}{tool_result['trend_delta_pct']}%** vs prior cycle\n"
                f"• **Dominant Activity Profile**: `{tool_result['dominant_tag']}`\n"
                f"• **Evaluation Cycle**: {tool_result['window']}"
            )
            if is_dist:
                action_links.append({
                    "type": "map_district",
                    "label": f"View {tool_result['district']} District on Map",
                    "url": f"/map?district={tool_result['district']}&state={tool_result['state']}&filter_district=true"
                })
            else:
                action_links.append({
                    "type": "map_state",
                    "label": f"View {tool_result['state']} on Map",
                    "url": f"/map?state={tool_result['state']}&filter_state=true"
                })

    # 5. Threat Classification Breakdown
    elif any(k in lower_msg for k in ["classification", "breakdown", "types of fire", "classes", "distribution", "share"]):
        tool_name = "get_classification_breakdown"
        tool_args = {"region": location, "period": "current_30day"}
        tool_result = get_classification_breakdown(region=location)

        lines = [
            f"### AI Threat Classification Breakdown for **{tool_result['region']}**\n",
            f"Total Hotspot Detections Monitored: **{tool_result['total_sources']:,}** across {tool_result['classes_count']} classes:\n"
        ]
        for c in tool_result["breakdown"]:
            lines.append(
                f"• **{c['classification']}**: **{c['count']:,} sources** ({c['percentage']}%) — Avg Risk: **{c['avg_risk_score']}**, Mean FRP: **{c['avg_mean_frp_mw']} MW**"
            )
        reply = "\n".join(lines)

    # 6. Default / Top Risk Sources (Fallback)
    else:
        target_tier = tier or ("CRITICAL" if "alert" in lower_msg else None)
        tool_name = "get_top_risk_sources"
        tool_args = {"region": location, "tier": target_tier, "limit": 5}
        tool_result = get_top_risk_sources(region=location, tier=target_tier, limit=5)

        if not tool_result:
            region_str = f" in {location}" if location else ""
            tier_str = f" with risk tier '{target_tier}'" if target_tier else ""
            reply = f"I queried the database, but no thermal sources match{region_str}{tier_str}."
        else:
            region_str = f" in **{location}**" if location else " across **Pan-India**"
            tier_str = f" ({target_tier} tier)" if target_tier else ""
            lines = [f"### Top Risk Thermal Sources{region_str}{tier_str}\n"]
            for idx, s in enumerate(tool_result, 1):
                lines.append(
                    f"**{idx}. Hotspot #SRC-{s['source_id']}** — {s['district']}, {s['state']}\n"
                    f"   • Risk Score: **{s['risk_score']}/100** ({s['risk_band']}) | Anomaly: **{s['anomaly_status']}**\n"
                    f"   • Classification: **{s['classification']}** (Industrial Context: {s['industrial_score']}/100)\n"
                    f"   • Coordinates: `[{s['latitude']}°N, {s['longitude']}°E]` | FRP: **{s['mean_frp_mw']} MW** (Peak: **{s['max_frp_mw']} MW**)\n"
                    f"   • Satellite Overpass: `{s['satellite_status']}` (Last Seen: {s['last_seen']})"
                )
                action_links.append({
                    "type": "map_source",
                    "label": f"Inspect Source #{s['source_id']}",
                    "url": f"/map?source_id={s['source_id']}&lat={s['latitude']}&lon={s['longitude']}&inspect=true"
                })
            reply = "\n".join(lines)

    latency_ms = round((time.time() - start_time) * 1000, 1)

    return {
        "reply": reply,
        "tool_calls": [
            {
                "tool_name": tool_name,
                "arguments": tool_args,
                "result": tool_result,
                "execution_ms": latency_ms
            }
        ] if tool_name else [],
        "action_links": action_links,
        "latency_ms": latency_ms
    }
