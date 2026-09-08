import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  Database,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Compass,
  AlertTriangle,
  Flame,
  Factory,
  Shield,
  Clock,
  Layers,
  Code2
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, StarterQuestion, ToolCallTrace } from '../types';

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [starters, setStarters] = useState<StarterQuestion[]>([]);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load Starters on mount
  useEffect(() => {
    api.getChatStarters()
      .then((data) => setStarters(data))
      .catch((err) => console.error('Failed to load starters:', err));

    // Welcome message
    const welcomeMsg: ChatMessage = {
      id: 'welcome-0',
      role: 'assistant',
      content:
        "Welcome to **THERMOINTEL AI Assistant**. I am directly connected to the sovereign Indian thermal intelligence database covering 15,436 monitored sources, 54 territorial district benchmarks, and spatio-temporal surge clusters.\n\n" +
        "Every answer I give is strictly grounded via pre-tested, read-only database query tools. Select a starter prompt below or ask any question about hotspots, facilities, district benchmarks, or correlated events.",
      timestamp: new Date().toISOString(),
      tool_calls: []
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto-scroll messages container to bottom when messages update
  useEffect(() => {
    if (messages.length > 1 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSendMessage = async (text?: string) => {
    const query = (text || inputValue).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChatMessage(query, historyPayload);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        tool_calls: res.tool_calls,
        action_links: res.action_links,
        timestamp: res.timestamp,
        latency_ms: res.latency_ms
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ An error occurred while executing the database query. Please try again or rephrase your question.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: "Conversation reset. You can ask any factual query about thermal hotspots, facility proximity, or district risk benchmarks.",
      timestamp: new Date().toISOString(),
      tool_calls: []
    };
    setMessages([welcomeMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] pt-6 pb-12 px-4 sm:px-6 lg:px-8 select-none flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-4">
        
        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#D9531E] uppercase">
              <Bot className="w-4 h-4 text-[#D9531E]" />
              SOVEREIGN DATABASE INTELLIGENCE ASSISTANT
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1E1B18] tracking-tight mt-1">
              Grounded AI Assistant
            </h1>
            <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-0.5 max-w-2xl">
              Natural language queries executed against live database tables via pre-tested, read-only tools. Every number, coordinate, and score is verified with zero free-form SQL hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <Database className="w-3.5 h-3.5 text-[#059669]" />
              DATABASE CONNECTED
            </span>
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              OPERATIONAL (30 req/min)
            </span>
            <button
              onClick={handleClearChat}
              className="px-3 py-1 bg-white border border-[#D0C9BE] text-[#5C554E] hover:text-[#1E1B18] text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Starter Question Chips */}
        {starters.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D9531E]" />
              RECOMMENDED QUERIES:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {starters.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-[#F5F2EB] border border-[#D0C9BE] hover:border-[#D9531E] hover:bg-white text-[#1E1B18] text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shadow-2xs shrink-0 disabled:opacity-50"
                >
                  <span className="px-1.5 py-0.5 bg-[#EAE5DC] text-[#78716C] font-mono text-[10px] font-bold">
                    {s.category}
                  </span>
                  <span>{s.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div ref={messagesContainerRef} className="flex-1 bg-[#F5F2EB] border border-[#D0C9BE] shadow-xs p-4 sm:p-6 overflow-y-auto space-y-6 min-h-[440px] max-h-[620px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1.5 px-1">
                {m.role === 'user' ? (
                  <span className="text-[11px] font-mono font-bold text-[#78716C] uppercase">
                    USER OPERATOR
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-[#D9531E] uppercase flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    THERMOINTEL INTELLIGENCE ENGINE
                  </span>
                )}
                {m.latency_ms !== undefined && (
                  <span className="text-[10px] font-mono text-[#78716C]">
                    • {m.latency_ms}ms
                  </span>
                )}
              </div>

              {/* Message Body */}
              <div
                className={`max-w-3xl p-4 sm:p-5 border text-sm font-sans leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-xs'
                    : 'bg-white text-[#1E1B18] border-[#D0C9BE] shadow-xs'
                }`}
              >
                {/* Render Markdown-like content */}
                <div className="space-y-2 whitespace-pre-line">
                  {m.content}
                </div>

                {/* Traceable Tool Verification Badge & Expansion Drawer */}
                {m.tool_calls && m.tool_calls.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E2DDD4] space-y-2">
                    {m.tool_calls.map((t, tIdx) => {
                      const traceKey = `${m.id}-tool-${tIdx}`;
                      const isExpanded = expandedTraceId === traceKey;
                      return (
                        <div
                          key={tIdx}
                          className="bg-[#F5F2EB] border border-[#D0C9BE] text-xs font-mono"
                        >
                          <button
                            onClick={() => toggleTrace(traceKey)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#EAE5DC] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                              <span className="font-bold text-[#1E1B18]">
                                Grounded via <code className="text-[#D9531E]">{t.tool_name}()</code>
                              </span>
                              <span className="text-[10px] text-[#78716C]">
                                ({t.execution_ms}ms database latency)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[#5C554E]">
                              <span className="text-[10px] uppercase font-bold">
                                {isExpanded ? 'Hide Trace' : 'View Trace'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </button>

                          {/* Expanded JSON Audit Payload */}
                          {isExpanded && (
                            <div className="p-3 bg-[#1E1B18] text-[#EAE5DC] border-t border-[#D0C9BE] overflow-x-auto text-[11px] font-mono space-y-2">
                              <div>
                                <span className="text-[#93C5FD] font-bold">INPUT ARGUMENTS:</span>
                                <pre className="mt-0.5 text-[#F3F4F6]">
                                  {JSON.stringify(t.arguments, null, 2)}
                                </pre>
                              </div>
                              <div className="pt-2 border-t border-white/10">
                                <span className="text-[#86EFAC] font-bold">DATABASE RECORD PAYLOAD:</span>
                                <pre className="mt-0.5 text-[#F3F4F6] max-h-48 overflow-y-auto">
                                  {JSON.stringify(t.result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Links (Navigate to Map / District) */}
                {m.action_links && m.action_links.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E2DDD4] flex flex-wrap items-center gap-2">
                    {m.action_links.map((action, aIdx) => (
                      action.url ? (
                        <button
                          key={aIdx}
                          onClick={() => navigate(action.url!)}
                          className="px-3 py-1.5 bg-[#D9531E] hover:bg-[#B84314] text-white text-xs font-sans font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>{action.label}</span>
                        </button>
                      ) : action.prompt ? (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action.prompt!)}
                          className="px-3 py-1.5 bg-white border border-[#D0C9BE] hover:bg-[#EAE5DC] text-[#1E1B18] text-xs font-sans font-bold transition-all cursor-pointer"
                        >
                          {action.label}
                        </button>
                      ) : null
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Loading Bubble */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-mono font-bold text-[#D9531E] uppercase">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                QUERYING DATABASE ENGINE...
              </div>
              <div className="bg-white border border-[#D0C9BE] p-4 text-xs font-mono text-[#5C554E] flex items-center gap-2 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-[#D9531E] animate-ping" />
                <span>Executing read-only SQLite parameter query and verifying metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-3 shadow-xs flex items-center gap-3">
          <textarea
            id="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about any thermal source (#2868), district benchmark (Cuddalore), facility proximity, or surge clusters..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-white border border-[#D0C9BE] p-2.5 text-xs sm:text-sm font-sans text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] resize-none"
          />

          <button
            id="btn-send-chat"
            onClick={() => handleSendMessage()}
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2.5 bg-[#D9531E] hover:bg-[#B84314] text-white text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer Integrity Notice */}
        <div className="text-[11px] font-mono text-[#78716C] text-center">
          100% Deterministic SQL Verification • No Hallucination • Safe Read-Only Queries • Direct Live Telemetry
        </div>

      </div>
    </div>
  );
};

export default AiAssistantPage;
