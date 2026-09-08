import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Satellite,
  CheckCircle2,
  Clock,
  Eye,
  Radio,
  Download,
  Check,
  Factory,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { AlertItem } from '../types';
import { SourceDetailModal } from '../components/SourceDetailModal';
import { getClassificationColor, getClassificationColorName } from '../components/CommandMap';
import { downloadTacticalBriefPdf } from '../utils/generateTacticalPdf';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleInspectOnMap = (alert: AlertItem) => {
    navigate(
      `/map?source_id=${alert.thermal_source_id}&lat=${alert.latitude}&lon=${alert.longitude}&cls=${encodeURIComponent(alert.classification)}&risk=${alert.risk_score}&band=${alert.risk_band}&inspect=true`
    );
  };

  useEffect(() => {
    setLoading(true);
    api.getAlerts(selectedLevel === 'ALL' ? undefined : selectedLevel, 150)
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Alerts fetch error:", err);
        setLoading(false);
      });
  }, [selectedLevel]);

  const filteredAlerts = alerts.filter((a) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      a.thermal_source_id.toString().includes(s) ||
      a.classification.toLowerCase().includes(s) ||
      a.anomaly_status.toLowerCase().includes(s) ||
      a.tags.some((t) => t.toLowerCase().includes(s))
    );
  });

  const handleDownloadPdf = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      const briefData = await api.getTacticalBrief(id);
      downloadTacticalBriefPdf(briefData);
    } catch (err) {
      console.error("Failed to generate brief:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getAlertLevelBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]';
      case 'HIGH':
        return 'bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]';
      case 'ELEVATED':
      case 'MODERATE':
        return 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]';
      default:
        return 'bg-[#E2E8F0] text-[#475569] border border-[#CBD5E1]';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#991B1B]';
    if (score >= 60) return 'text-[#C2410C]';
    if (score >= 40) return 'text-[#B45309]';
    return 'text-[#475569]';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#991B1B]';
    if (score >= 60) return 'bg-[#C2410C]';
    if (score >= 40) return 'bg-[#B45309]';
    return 'bg-[#475569]';
  };

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] py-8 px-4 sm:px-6 lg:px-8 space-y-6 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-6">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <Radio className="w-4 h-4 text-[#D9531E] animate-pulse" />
            <span>MINISTRY OF EARTH SCIENCES &bull; SOVEREIGN INCIDENT TRIAGE QUEUE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
            Operational Thermal Alerts &amp; Incidents
          </h1>
          <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-3xl">
            Priority-ranked incident queue computed from composite risk scores, temporal surge dynamics, and proximity to sovereign industrial infrastructure across India.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#F5F2EB] p-4 rounded-none border border-[#D0C9BE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Level Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {['ALL', 'CRITICAL', 'HIGH', 'ELEVATED'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-1.5 rounded-none text-xs font-sans font-bold uppercase tracking-[0.06em] transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#D9531E] text-white shadow-xs'
                    : 'bg-[#F5F2EB] text-[#5C554E] hover:text-[#1E1B18] hover:bg-[#E2DDD4] border border-[#D0C9BE]'
                }`}
              >
                {lvl === 'ALL' ? 'All Alerts' : `${lvl} Level`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80 text-xs">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#78716C]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, classification, anomaly, tag..."
              className="w-full pl-9 pr-4 py-2 bg-[#F5F2EB] border border-[#D0C9BE] rounded-none text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-xs"
            />
          </div>
        </div>

        {/* Alerts Ranked List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-24 text-center bg-[#F5F2EB] rounded-none border border-[#D0C9BE] shadow-xs">
              <div className="w-8 h-8 border-2 border-[#D9531E] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-[#78716C]">Ranking sovereign incident triage matrix...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="py-20 text-center text-[#5C554E] bg-[#F5F2EB] rounded-none border border-[#D0C9BE] shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="font-serif font-bold text-base text-[#1E1B18]">No active alerts match current filter criteria.</p>
              <p className="text-xs text-[#78716C] mt-1 font-sans">All monitoring zones are currently reporting nominal baseline activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const isCrit = alert.alert_level === 'CRITICAL';
                const isHigh = alert.alert_level === 'HIGH';

                return (
                  <div
                    key={alert.thermal_source_id}
                    onClick={() => setSelectedSourceId(alert.thermal_source_id)}
                    className="bg-[#F5F2EB] rounded-none border border-[#D0C9BE] hover:border-[#D9531E]/60 transition-all cursor-pointer shadow-xs hover:shadow-md overflow-hidden group"
                  >
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Rank + Tag + Name/Identifier */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-10 h-10 rounded-none bg-[#EAE5DC] flex items-center justify-center font-mono font-bold text-xs text-[#1E1B18] flex-shrink-0">
                          #{alert.urgency_rank < 10 ? `0${alert.urgency_rank}` : alert.urgency_rank}
                        </div>

                        {/* Identifiers & Threat */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-sans font-bold uppercase tracking-[0.06em] ${getAlertLevelBadge(alert.alert_level)}`}>
                              {alert.alert_level}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspectOnMap(alert);
                              }}
                              className="font-mono text-xs font-bold text-[#D9531E] hover:underline cursor-pointer inline-flex items-center gap-1"
                              title="Inspect this hotspot on tactical map"
                            >
                              SRC-{alert.thermal_source_id}
                            </button>
                            <span className="text-xs font-sans text-[#78716C]">&bull;</span>
                            <span className={`text-xs font-mono font-medium ${
                              alert.anomaly_status.includes('CRITICAL') ? 'text-[#991B1B]' :
                              alert.anomaly_status.includes('ABNORMAL') ? 'text-[#C2410C]' :
                              'text-[#5C554E]'
                            }`}>
                              {alert.anomaly_status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-none flex-shrink-0"
                              style={{
                                backgroundColor: getClassificationColor(alert.classification),
                                border: getClassificationColor(alert.classification) === '#F5F2EB' ? '1px solid #D0C9BE' : 'none'
                              }}
                            />
                            <h3 className="font-serif font-bold text-base text-[#1E1B18] truncate">
                              {alert.classification}
                            </h3>
                            <span className="text-[11px] font-mono text-[#78716C]">
                              ({alert.classification_confidence > 1 ? alert.classification_confidence.toFixed(1) : (alert.classification_confidence * 100).toFixed(1)}% conf)
                            </span>
                          </div>

                          {/* Tags */}
                          {alert.tags && alert.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {alert.tags.slice(0, 3).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] text-[10px] text-[#5C554E] font-sans"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle: FRP & Telemetry */}
                      <div className="flex items-center gap-6 text-xs sm:border-l sm:border-[#D0C9BE] sm:pl-6">
                        <div>
                          <div className="font-mono text-[10px] text-[#78716C] uppercase">Mean FRP</div>
                          <div className="font-sans font-bold text-sm text-[#1E1B18]">
                            {alert.mean_frp.toFixed(1)} MW
                          </div>
                          <div className="text-[10px] font-mono text-[#78716C]">
                            Peak: {alert.max_frp.toFixed(1)} MW
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] text-[#78716C] uppercase">Industrial Context</div>
                          <div className="font-sans font-bold text-sm text-[#1E1B18]">
                            {alert.industrial_context_score}/100
                          </div>
                          <div className="w-16 bg-[#D0C9BE] h-1 rounded-none mt-1 overflow-hidden">
                            <div
                              className="bg-[#D9531E] h-1 rounded-none"
                              style={{ width: `${alert.industrial_context_score}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[10px] text-[#78716C] uppercase">Sentinel-2</div>
                          <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-medium block mt-0.5 ${
                            alert.satellite_evidence_status === 'AVAILABLE'
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]'
                              : 'bg-[#E2DDD4] text-[#78716C] border border-[#D0C9BE]'
                          }`}>
                            {alert.satellite_evidence_status === 'AVAILABLE' ? (alert.evidence_quality || 'AVAILABLE') : 'NO SCENE'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Big Score Number + Action Buttons */}
                      <div className="flex items-center gap-4 sm:border-l sm:border-[#D0C9BE] sm:pl-6 self-stretch justify-between md:justify-end">
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-[#78716C] uppercase tracking-wider">Risk Score</div>
                          <div className={`font-sans font-bold text-2xl ${getScoreColor(alert.risk_score)}`}>
                            {alert.risk_score.toFixed(1)}
                          </div>
                          <div className="text-[10px] font-sans text-[#78716C]">
                            {alert.risk_band}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDownloadPdf(e, alert.thermal_source_id)}
                            disabled={downloadingId === alert.thermal_source_id}
                            className="p-2 rounded-none bg-[#F5F2EB] hover:bg-[#E2DDD4] border border-[#D0C9BE] text-[#1E1B18] hover:text-[#D9531E] transition-colors cursor-pointer shadow-xs"
                            title="Download PDF Brief"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-inspect-${alert.thermal_source_id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectOnMap(alert);
                            }}
                            className="px-3.5 py-2 rounded-none bg-[#1E1B18] hover:bg-[#D9531E] text-white font-sans font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title="Inspect Hotspot Location on Tactical GIS Map"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#EAE5DC]" />
                            <span>Inspect</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSourceId(alert.thermal_source_id);
                            }}
                            className="px-4 py-2 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress / Severity Bar Underneath Full Width */}
                    <div className="w-full bg-[#D0C9BE]/40 h-1">
                      <div
                        className={`h-1 transition-all ${getProgressBarColor(alert.risk_score)}`}
                        style={{ width: `${Math.min(100, Math.max(0, alert.risk_score))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Dossier Inspection Modal */}
      <SourceDetailModal
        sourceId={selectedSourceId}
        onClose={() => setSelectedSourceId(null)}
      />
    </div>
  );
};

export default AlertsPage;
