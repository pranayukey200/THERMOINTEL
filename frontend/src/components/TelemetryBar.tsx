import React from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Factory, 
  Satellite,
  TrendingUp,
  Zap
} from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { sound } from '../services/sound';

interface TelemetryBarProps {
  summary: AnalyticsSummary | null;
  onFilterPreset?: (preset: string) => void;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ summary, onFilterPreset }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 bg-command-bg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="tactical-card p-3 rounded-lg animate-pulse h-20 bg-command-card/50" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      id: 'total',
      label: 'TOTAL THERMAL SOURCES',
      value: summary.total_sources.toLocaleString(),
      subtext: `Avg Mean FRP: ${summary.mean_frp_average} MW`,
      icon: Flame,
      color: 'text-command-cyan',
      borderColor: 'border-command-border',
      glow: 'shadow-[0_0_12px_rgba(0,240,255,0.1)]',
      onClick: () => {
        sound.playClick();
        onFilterPreset?.('all');
      }
    },
    {
      id: 'critical_alerts',
      label: 'CRITICAL ALERTS',
      value: summary.critical_alerts_count.toLocaleString(),
      subtext: 'High Priority Triage Queue',
      icon: AlertTriangle,
      color: 'text-command-crimson',
      borderColor: 'border-command-crimson/40',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      pulse: true,
      onClick: () => {
        sound.playCriticalAlert();
        onFilterPreset?.('critical_alerts');
      }
    },
    {
      id: 'high_risk',
      label: 'HIGH / CRITICAL RISK',
      value: summary.high_critical_risk_count.toLocaleString(),
      subtext: 'Composite Risk >= 70',
      icon: ShieldAlert,
      color: 'text-orange-400',
      borderColor: 'border-orange-500/40',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.15)]',
      onClick: () => {
        sound.playClick();
        onFilterPreset?.('high_risk');
      }
    },
    {
      id: 'anomalies',
      label: 'ABNORMAL / SURGE',
      value: summary.abnormal_critical_anomaly_count.toLocaleString(),
      subtext: `${summary.high_recent_surge_count} Recent Surges`,
      icon: Activity,
      color: 'text-command-amber',
      borderColor: 'border-command-amber/40',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      onClick: () => {
        sound.playClick();
        onFilterPreset?.('abnormal');
      }
    },
    {
      id: 'industrial',
      label: 'INDUSTRIAL CONTEXT',
      value: summary.industrial_context_sources_count.toLocaleString(),
      subtext: 'OSM Facility Proximity',
      icon: Factory,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]',
      onClick: () => {
        sound.playClick();
        onFilterPreset?.('industrial');
      }
    },
    {
      id: 'satellite',
      label: 'SATELLITE EVIDENCE',
      value: `${summary.satellite_evidence_coverage_pct}%`,
      subtext: `${summary.satellite_evidence_available_count.toLocaleString()} Sentinel-2 Scenes`,
      icon: Satellite,
      color: 'text-command-emerald',
      borderColor: 'border-command-emerald/40',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      onClick: () => {
        sound.playClick();
        onFilterPreset?.('satellite_available');
      }
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 px-4 py-2.5 bg-command-bg/95 border-b border-command-border select-none">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <button
            key={kpi.id}
            onClick={kpi.onClick}
            className={`tactical-card-interactive p-3 rounded-lg text-left flex flex-col justify-between relative overflow-hidden border ${kpi.borderColor} ${kpi.glow}`}
          >
            {/* Background ambient glow */}
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-mono font-semibold tracking-wider text-command-textMuted uppercase">
                {kpi.label}
              </span>
              <Icon className={`w-4 h-4 ${kpi.color} ${kpi.pulse ? 'animate-pulse' : ''}`} />
            </div>

            <div className="flex items-baseline justify-between mt-0.5">
              <span className={`text-xl font-mono font-bold tracking-tight ${kpi.color}`}>
                {kpi.value}
              </span>
            </div>

            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
              {kpi.subtext}
            </div>
          </button>
        );
      })}
    </div>
  );
};
