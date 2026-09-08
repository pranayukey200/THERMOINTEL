import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Activity, 
  ExternalLink, 
  Search, 
  Filter, 
  Factory, 
  Satellite,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { AlertItem } from '../types';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AlertsCenterProps {
  onSelectSource: (sourceId: number) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ onSelectSource }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    api.getAlerts(selectedLevel, 150)
      .then((data) => {
        setAlerts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch alerts:', err);
        setIsLoading(false);
      });
  }, [selectedLevel]);

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.thermal_source_id.toString().includes(q) ||
      a.classification.toLowerCase().includes(q) ||
      a.anomaly_status.toLowerCase().includes(q) ||
      a.risk_band.toLowerCase().includes(q)
    );
  });

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/60';
      default:
        return 'bg-amber-950/80 text-amber-400 border-amber-500/60';
    }
  };

  return (
    <div className="flex-1 bg-command-bg p-4 flex flex-col gap-4 overflow-hidden select-none">
      {/* Alerts Header & Controls */}
      <div className="tactical-card p-4 rounded-xl border border-command-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-command-crimson animate-pulse" />
            <h2 className="text-base font-black tracking-wide text-white font-mono">
              OPERATIONAL ALERTS & INCIDENT TRIAGE
            </h2>
          </div>
          <p className="text-xs text-command-textMuted font-mono mt-0.5">
            Ranked queue prioritized by composite operational risk score, anomaly severity, and surge dynamics.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'ELEVATED'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                sound.playClick();
                setSelectedLevel(lvl);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedLevel === lvl
                  ? 'bg-command-cyan/20 text-command-cyan border border-command-cyan/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-command-bg text-command-textMuted border border-command-border hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}

          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-command-bg border border-command-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-command-cyan font-mono"
            />
          </div>
        </div>
      </div>

      {/* Alerts Table / Feed */}
      <div className="tactical-card rounded-xl border border-command-border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-command-bg/90 sticky top-0 z-10 border-b border-command-border text-[11px] font-mono text-command-textMuted uppercase">
              <tr>
                <th className="py-2.5 px-3">Urgency Rank</th>
                <th className="py-2.5 px-3">Source #ID</th>
                <th className="py-2.5 px-3">AI Classification</th>
                <th className="py-2.5 px-3">Risk Band</th>
                <th className="py-2.5 px-3">Anomaly Status</th>
                <th className="py-2.5 px-3">Mean / Max FRP</th>
                <th className="py-2.5 px-3">Industrial Score</th>
                <th className="py-2.5 px-3">Satellite Quality</th>
                <th className="py-2.5 px-3">Surge Tags</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 font-mono">
                    <div className="w-6 h-6 border-2 border-command-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    TRIAGING SATELLITE ANOMALIES...
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 font-mono">
                    No active alerts matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.thermal_source_id}
                    onClick={() => {
                      sound.playSelect();
                      onSelectSource(alert.thermal_source_id);
                    }}
                    className="hover:bg-command-cardHover/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${getAlertBadge(alert.alert_level)}`}>
                        {alert.urgency_rank.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-white group-hover:text-command-cyan flex items-center gap-1.5">
                      #{alert.thermal_source_id}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      <div>{alert.classification}</div>
                      <div className="text-[10px] font-mono text-cyan-400">
                        {alert.classification_confidence > 0 ? `${alert.classification_confidence.toFixed(1)}% Conf` : 'Low Evidence'}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        alert.risk_band === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/50' :
                        alert.risk_band === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-500/50' :
                        'bg-amber-950 text-amber-400 border-amber-500/50'
                      }`}>
                        {alert.risk_score.toFixed(1)} ({alert.risk_band})
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <span className={`text-[11px] font-medium ${
                        alert.anomaly_status.includes('CRITICAL') ? 'text-red-400 font-bold' :
                        alert.anomaly_status.includes('ABNORMAL') ? 'text-orange-400' : 'text-amber-400'
                      }`}>
                        {alert.anomaly_status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {alert.mean_frp} / <span className="text-orange-400 font-bold">{alert.max_frp}</span> MW
                    </td>

                    <td className="py-2.5 px-3 font-mono text-blue-300 font-bold">
                      {alert.industrial_context_score}/100
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        alert.satellite_evidence_status === 'AVAILABLE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {alert.evidence_quality || alert.satellite_evidence_status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {alert.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-command-bg border border-command-border text-slate-400 whitespace-nowrap"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button className="px-2.5 py-1 rounded bg-cyan-950/80 border border-command-cyan/40 text-command-cyan group-hover:bg-cyan-500 group-hover:text-black font-mono text-[11px] font-bold transition-all inline-flex items-center gap-1">
                        Dossier <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
