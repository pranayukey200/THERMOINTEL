import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  ShieldAlert, 
  Activity, 
  Factory, 
  Satellite, 
  Clock, 
  Calendar, 
  ExternalLink, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Info,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { ThermalSource, TimelineResponse } from '../types';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface SourceDetailDrawerProps {
  source: ThermalSource | null;
  onClose: () => void;
  isLoading: boolean;
}

export const SourceDetailDrawer: React.FC<SourceDetailDrawerProps> = ({
  source,
  onClose,
  isLoading
}) => {
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentReplayDay, setCurrentReplayDay] = useState<number>(89);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Fetch timeline on source change
  useEffect(() => {
    if (!source) return;
    setCurrentReplayDay(89);
    setIsPlaying(false);
    api.getSourceTimeline(source.thermal_source_id)
      .then((data) => setTimelineData(data))
      .catch((err) => console.error('Timeline fetch error:', err));
  }, [source?.thermal_source_id]);

  // Replay animation interval
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentReplayDay((prev) => {
          if (prev >= 89) {
            setIsPlaying(false);
            return 89;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!source) return null;

  const copyCoordinates = () => {
    sound.playClick();
    navigator.clipboard.writeText(`${source.latitude}, ${source.longitude}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const getRiskColor = (band: string) => {
    switch (band) {
      case 'CRITICAL': return 'text-red-400 bg-red-950/80 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-950/80 border-orange-500/50';
      case 'MODERATE': return 'text-amber-400 bg-amber-950/80 border-amber-500/50';
      default: return 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50';
    }
  };

  const getAnomalyColor = (status: string) => {
    if (status.includes('CRITICAL')) return 'text-red-400 bg-red-950/60 border-red-500/40';
    if (status.includes('ABNORMAL')) return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
    if (status.includes('WATCH')) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  };

  const getQualityColor = (q?: string) => {
    switch (q) {
      case 'STRONG': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'GOOD': return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
      case 'MODERATE': return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      default: return 'text-slate-400 border-slate-600/40 bg-slate-800/40';
    }
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-command-card/95 backdrop-blur-xl border-l border-command-border z-40 shadow-2xl flex flex-col overflow-hidden text-command-text animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-command-border flex items-center justify-between bg-command-bg/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-command-cyan/50 flex items-center justify-center text-command-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black font-mono tracking-wider text-white">
                  SOURCE #{source.thermal_source_id}
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getRiskColor(source.risk_band)}`}>
                  {source.risk_band} RISK
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-command-textMuted font-mono">
                <span>{source.latitude.toFixed(5)}° N, {source.longitude.toFixed(5)}° E</span>
                <button
                  onClick={copyCoordinates}
                  className="hover:text-command-cyan transition-colors"
                  title="Copy coordinates"
                >
                  {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-command-bg border border-command-border text-command-textMuted hover:text-white hover:border-command-cyan transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Intelligence Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {/* Top Operational Risk Gauge Card */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-command-cyan flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                OPERATIONAL RISK SCORE
              </span>
              <span className="font-mono text-xl font-black text-white">
                {source.risk_score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </span>
            </div>

            {/* Risk Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3 border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  source.risk_score >= 70 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  source.risk_score >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                  'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, source.risk_score))}%` }}
              />
            </div>

            {/* Risk Breakdown Matrix */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-command-border/60 text-center font-mono">
              <div className="bg-command-bg/80 p-1.5 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Class Risk</div>
                <div className="font-bold text-white mt-0.5">{source.classification_risk}</div>
              </div>
              <div className="bg-command-bg/80 p-1.5 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Anomaly</div>
                <div className="font-bold text-white mt-0.5">{source.anomaly_risk}</div>
              </div>
              <div className="bg-command-bg/80 p-1.5 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Industrial</div>
                <div className="font-bold text-white mt-0.5">{source.industrial_risk}</div>
              </div>
              <div className="bg-command-bg/80 p-1.5 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Intensity</div>
                <div className="font-bold text-white mt-0.5">{source.thermal_intensity_risk.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* AI Prototype Classification */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                AI CLASSIFICATION INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                Random Forest v1
              </span>
            </div>

            <div className="bg-command-bg/80 p-3 rounded-lg border border-command-border mb-2.5">
              <div className="text-sm font-bold text-white mb-1">
                {source.classification}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Confidence:</span>
                <span className="text-cyan-300 font-bold">
                  {source.classification_confidence > 0 
                    ? `${source.classification_confidence.toFixed(1)}%` 
                    : 'N/A (Low Evidence)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-0.5">
                <span>Confidence Basis:</span>
                <span className="text-slate-300">{source.confidence_type}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-900/40 p-2 rounded border border-slate-800">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Evidence-derived prototype classification based on land-cover, FRP dynamics, and industrial context.
              </span>
            </div>
          </div>

          {/* Anomaly Detection & Surge Telemetry */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-command-amber flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                ANOMALY & TEMPORAL SURGE BEHAVIOUR
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getAnomalyColor(source.anomaly_status)}`}>
                {source.anomaly_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5 font-mono">
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Anomaly Score</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {source.anomaly_score.toFixed(1)} <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Recent Status</div>
                <div className="text-[11px] font-bold text-amber-300 mt-0.5 truncate" title={source.recent_activity_status}>
                  {source.recent_activity_status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Surge Flags */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div className={`p-1.5 rounded border text-center ${source.newly_emerging ? 'bg-red-950/60 border-red-500/50 text-red-300 font-bold' : 'bg-command-bg/60 border-command-border text-slate-500'}`}>
                Newly Emerging
              </div>
              <div className={`p-1.5 rounded border text-center ${source.strong_activity_surge || source.activity_surge ? 'bg-orange-950/60 border-orange-500/50 text-orange-300 font-bold' : 'bg-command-bg/60 border-command-border text-slate-500'}`}>
                {source.strong_activity_surge ? 'Strong Surge' : source.activity_surge ? 'Activity Surge' : 'Stable Rate'}
              </div>
              <div className={`p-1.5 rounded border text-center ${source.high_recent_intensity ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-bold' : 'bg-command-bg/60 border-command-border text-slate-500'}`}>
                High Intensity
              </div>
            </div>
          </div>

          {/* Thermal Radiative Metrics */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <span className="font-mono text-xs font-bold text-command-cyan flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4" />
              VIIRS THERMAL RADIATIVE METRICS
            </span>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Mean FRP</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">{source.mean_frp} MW</div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Peak FRP</div>
                <div className="text-sm font-bold text-orange-400 mt-0.5">{source.max_frp} MW</div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Detections</div>
                <div className="text-sm font-bold text-white mt-0.5">{source.total_detections}</div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Active Days</div>
                <div className="text-sm font-bold text-white mt-0.5">{source.active_days} / 90</div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Persistence</div>
                <div className="text-sm font-bold text-white mt-0.5">{source.persistence_score.toFixed(2)}</div>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                <div className="text-[10px] text-slate-400">Activity Delta</div>
                <div className="text-sm font-bold text-white mt-0.5">{source.activity_change.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Industrial Vicinity Context */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Factory className="w-4 h-4" />
                INDUSTRIAL CONTEXT & FACILITY PROXIMITY
              </span>
              <span className="font-mono text-xs font-bold text-blue-300">
                Score: {source.industrial_context_score} / 100
              </span>
            </div>

            <div className="bg-command-bg/80 p-2.5 rounded-lg border border-command-border mb-2 text-xs text-slate-300">
              {source.industrial_context_score > 50 ? (
                <p>High spatial correlation with OpenStreetMap mapped industrial/mining/refinery infrastructure.</p>
              ) : source.industrial_context_score > 0 ? (
                <p>Moderate proximity to industrial infrastructure elements within 5km radius.</p>
              ) : (
                <p className="text-slate-400">No major industrial infrastructure mapped in immediate vicinity (open-field / rural / forest domain).</p>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/40 p-2 rounded border border-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Proximity provides supporting context; does not guarantee facility origin.</span>
            </div>
          </div>

          {/* Sentinel-2 Satellite Evidence Section */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-command-emerald flex items-center gap-1.5">
                <Satellite className="w-4 h-4" />
                SENTINEL-2 SATELLITE VISUAL EVIDENCE
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                source.satellite_evidence_status === 'AVAILABLE' 
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {source.satellite_evidence_status}
              </span>
            </div>

            {source.satellite_evidence_status === 'AVAILABLE' && source.satellite_image_url ? (
              <div className="space-y-2.5">
                {/* Image Thumbnail Container with Zoom Lightbox Trigger */}
                <div 
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-command-border bg-black aspect-video flex items-center justify-center shadow-lg"
                >
                  <img
                    src={source.satellite_image_url}
                    alt="Sentinel-2 Optical Evidence"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                    <span className="text-[11px] font-mono text-white flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" /> Click to expand optical scene
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${getQualityColor(source.evidence_quality)}`}>
                      {source.evidence_quality} QUALITY
                    </span>
                  </div>
                </div>

                {/* Evidence Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                    <span className="text-slate-400 block text-[10px]">Scene Date:</span>
                    <span className="font-bold text-white">{source.scene_date || 'N/A'}</span>
                  </div>
                  <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                    <span className="text-slate-400 block text-[10px]">MGRS Tile:</span>
                    <span className="font-bold text-cyan-300">{source.mgrs_tile || 'N/A'}</span>
                  </div>
                  <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                    <span className="text-slate-400 block text-[10px]">Cloud Cover:</span>
                    <span className="font-bold text-white">{source.cloud_cover !== undefined ? `${source.cloud_cover}%` : 'N/A'}</span>
                  </div>
                  <div className="bg-command-bg/80 p-2 rounded border border-command-border">
                    <span className="text-slate-400 block text-[10px]">Temporal Offset:</span>
                    <span className="font-bold text-white">{source.date_difference_days !== undefined ? `${source.date_difference_days} days` : 'N/A'}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 break-all bg-command-bg/60 p-1.5 rounded border border-command-border">
                  Scene: {source.sentinel_id}
                </div>
              </div>
            ) : (
              <div className="bg-command-bg/90 p-4 rounded-lg border border-dashed border-slate-700 text-center space-y-1.5">
                <Satellite className="w-6 h-6 text-slate-600 mx-auto" />
                <div className="text-xs font-mono font-bold text-slate-300">
                  SATELLITE EVIDENCE: UNAVAILABLE
                </div>
                <div className="text-[11px] text-slate-400">
                  No suitable cloud-free Sentinel-2 optical scene was indexed for this spatial window.
                </div>
                <div className="text-[10px] text-cyan-400/80 pt-1 font-mono">
                  (Thermal detection confirmed via VIIRS FIRMS hotspot sensor)
                </div>
              </div>
            )}
          </div>

          {/* 90-Day Thermal Event Replay */}
          <div className="tactical-card p-3.5 rounded-xl border border-command-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-command-cyan flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                90-DAY THERMAL EVENT REPLAY
              </span>
              <span className="font-mono text-xs text-slate-400">
                Day {currentReplayDay + 1} / 90
              </span>
            </div>

            {timelineData && (
              <div className="space-y-2">
                {/* Timeline Bar visualization */}
                <div className="h-10 bg-command-bg/80 p-1 rounded-lg border border-command-border flex items-end gap-0.5 overflow-hidden">
                  {timelineData.timeline.map((pt, idx) => (
                    <div
                      key={idx}
                      title={`${pt.date}: ${pt.estimated_frp} MW (${pt.phase})`}
                      className={`flex-1 rounded-t transition-all ${
                        idx > currentReplayDay
                          ? 'bg-slate-800 opacity-20'
                          : pt.is_active
                          ? pt.phase.includes('Surge')
                            ? 'bg-red-500'
                            : 'bg-cyan-400'
                          : 'bg-slate-700 h-1'
                      }`}
                      style={{
                        height: pt.is_active && idx <= currentReplayDay
                          ? `${Math.max(20, Math.min(100, (pt.estimated_frp / source.max_frp) * 100))}%`
                          : '4px'
                      }}
                    />
                  ))}
                </div>

                {/* Scrubber & Replay Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (currentReplayDay >= 89) setCurrentReplayDay(0);
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPlaying(false);
                      setCurrentReplayDay(0);
                    }}
                    className="p-1.5 rounded bg-command-bg border border-command-border text-command-textMuted hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={89}
                    value={currentReplayDay}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentReplayDay(parseInt(e.target.value));
                    }}
                    className="flex-1 accent-command-cyan cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Current date indicator */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>2026-06-01 (Start)</span>
                  <span className="text-cyan-300 font-bold">
                    {timelineData.timeline[currentReplayDay]?.date}
                  </span>
                  <span>2026-08-29 (Latest)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Sentinel-2 Satellite Image */}
      {isLightboxOpen && source.satellite_image_url && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="tactical-card max-w-4xl w-full rounded-2xl overflow-hidden border border-command-cyan shadow-[0_0_40px_rgba(0,240,255,0.3)] bg-command-card"
          >
            <div className="p-3 bg-command-bg border-b border-command-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-command-emerald" />
                <span className="font-mono text-xs font-bold text-white">
                  SENTINEL-2 OPTICAL SCENE &bull; {source.sentinel_id}
                </span>
              </div>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={source.satellite_image_url}
                alt="High Resolution Sentinel-2"
                className="max-h-[68vh] object-contain rounded"
              />
            </div>

            <div className="p-3 bg-command-bg text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-slate-300">
              <div>Acquired: <span className="text-white font-bold">{source.scene_date}</span></div>
              <div>Tile: <span className="text-cyan-400 font-bold">{source.mgrs_tile}</span></div>
              <div>Cloud: <span className="text-white font-bold">{source.cloud_cover}%</span></div>
              <div>Quality: <span className="text-emerald-400 font-bold">{source.evidence_quality}</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
