import React, { useEffect, useState } from 'react';
import { TacticalIncidentBrief } from '../types';
import { api } from '../services/api';
import { downloadTacticalBriefPdf } from '../utils/generateTacticalPdf';
import {
  ShieldAlert,
  Printer,
  Download,
  X,
  CheckSquare,
  Square,
  AlertTriangle,
  Radio,
  FileCheck,
  Building2,
  Crosshair,
  Satellite,
  Flame,
  Check
} from 'lucide-react';

interface TacticalBriefModalProps {
  sourceId: number | null;
  onClose: () => void;
}

export const TacticalBriefModal: React.FC<TacticalBriefModalProps> = ({ sourceId, onClose }) => {
  const [brief, setBrief] = useState<TacticalIncidentBrief | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedSops, setCheckedSops] = useState<Record<number, boolean>>({});
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!sourceId) return;
    setLoading(true);
    setError(null);

    api.getTacticalBrief(sourceId)
      .then((data) => {
        setBrief(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load tactical brief:', err);
        setError('Failed to generate tactical incident brief. Ensure backend service is reachable.');
        setLoading(false);
      });
  }, [sourceId]);

  if (!sourceId) return null;

  const handleDownloadPdf = () => {
    if (!brief) return;
    try {
      setDownloading(true);
      downloadTacticalBriefPdf(brief);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSop = (idx: number) => {
    setCheckedSops((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Container - Printable & Parchment Editorial Styled */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#EAE5DC] text-[#1E1B18] border border-[#D0C9BE] rounded-none shadow-2xl overflow-hidden print:border-none print:m-0 print:p-0 print:bg-[#F5F2EB] print:text-black transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Pinned at Top) */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 bg-[#EAE5DC] border-b border-[#D0C9BE] print:hidden z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-none bg-[#D9531E] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.15em] text-[#D9531E] uppercase">
              TACTICAL INCIDENT DISPATCH // DISASTER GEOSPATIAL BRIEF
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Primary Action: Direct Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={!brief || downloading}
              className="px-4 py-1.5 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white text-xs font-sans font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download official sovereign PDF directly"
            >
              {downloadSuccess ? (
                <Check className="w-4 h-4 text-emerald-200" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {downloadSuccess
                  ? 'PDF Downloaded!'
                  : downloading
                  ? 'Generating PDF...'
                  : 'Download Official PDF'}
              </span>
            </button>

            {/* Secondary Action: Print */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-none bg-[#F5F2EB] hover:bg-[#E2DDD4] text-[#1E1B18] border border-[#D0C9BE] text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Open browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 text-[#5C554E]" />
              <span>Print</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-none text-[#5C554E] hover:text-[#1E1B18] hover:bg-[#D0C9BE]/50 transition-colors cursor-pointer"
              aria-label="Close brief"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#D9531E] border-t-transparent rounded-none animate-spin" />
            <div className="text-xs font-mono tracking-wider text-[#78716C]">
              SYNTHESIZING MULTI-SENSOR GEOINT BRIEF FROM ARCHIVES...
            </div>
          </div>
        )}

        {error && (
          <div className="p-12 text-center text-[#991B1B] font-mono text-xs">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[#991B1B]" />
            <div>{error}</div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-1.5 bg-[#D0C9BE] text-[#1E1B18] rounded-none font-mono text-xs hover:bg-[#D0C9BE]/70 cursor-pointer"
            >
              Close Window
            </button>
          </div>
        )}

        {/* Dispatch Body */}
        {brief && !loading && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs print:p-4 print:space-y-4 print:text-black">
            {/* Official Security Header */}
            <div className="border-b-2 border-[#D9531E] pb-4 text-center space-y-1.5 print:border-black">
              <div className="text-[10px] tracking-[0.15em] text-[#D9531E] font-mono font-bold uppercase print:text-red-700">
                {brief.security_classification}
              </div>
              <div className="text-base sm:text-lg font-serif font-bold tracking-tight text-[#1E1B18] print:text-black">
                GOVERNMENT OF INDIA // NATIONAL TECHNICAL RESEARCH ORGANISATION
              </div>
              <div className="text-[11px] font-sans text-[#5C554E] font-bold print:text-slate-700">
                {brief.issuing_authority}
              </div>
              <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[#78716C] pt-2 border-t border-[#D0C9BE] print:border-slate-300 print:text-slate-600">
                <span>
                  DISPATCH ID: <strong className="text-[#1E1B18] print:text-black">{brief.dispatch_id}</strong>
                </span>
                <span>
                  MGRS GRID: <strong className="text-[#1E1B18] print:text-black">{brief.mgrs_tile}</strong>
                </span>
                <span>
                  GENERATED: <strong className="text-[#1E1B18] print:text-black">{brief.dispatch_timestamp}</strong>
                </span>
              </div>
            </div>

            {/* Runaway & Threat Severity Banner */}
            <div
              className={`p-3.5 rounded-none border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                brief.thermal_runaway_status === 'CATASTROPHIC THERMAL RUNAWAY'
                  ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] print:bg-red-50 print:border-red-600 print:text-red-900'
                  : brief.thermal_runaway_status === 'ELEVATED THERMAL ANOMALY'
                  ? 'bg-[#FFEDD5] border-[#FDBA74] text-[#C2410C] print:bg-orange-50 print:border-orange-500 print:text-orange-900'
                  : 'bg-[#FEF3C7] border-[#FCD34D] text-[#B45309] print:bg-amber-50 print:border-amber-600 print:text-amber-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 flex-shrink-0 text-current" />
                <div>
                  <div className="font-sans font-bold text-sm tracking-wide uppercase">
                    {brief.thermal_runaway_status}
                  </div>
                  <div className="text-[11px] opacity-85 font-sans">
                    Target #{brief.source_id} &bull; Classification: {brief.classification} &bull; Risk Band:{' '}
                    {brief.risk_band} ({brief.risk_score.toFixed(1)}/100)
                  </div>
                </div>
              </div>
              <div className="sm:text-right font-mono text-[11px] border-l sm:border-l-0 sm:border-t-0 pl-3 sm:pl-0 border-current">
                <div>
                  SURGE FACTOR: <strong>{brief.surge_multiplier.toFixed(2)}x</strong>
                </div>
                <div>
                  ANOMALY Z-SCORE: <strong>{brief.z_score.toFixed(2)} &sigma;</strong>
                </div>
              </div>
            </div>

            {/* Core Telemetry Grid (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Thermal Signature & Flaring Baseline */}
              <div className="p-4 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-2.5 shadow-xs print:bg-slate-50 print:border-slate-300">
                <div className="flex items-center gap-2 font-serif font-bold text-[#1E1B18] border-b border-[#D0C9BE] pb-2 print:text-black print:border-slate-300">
                  <Flame className="w-4 h-4 text-[#D9531E]" />
                  <span>30-Day Operational Flaring Baseline vs Peak</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-mono text-[#78716C]">Current Peak FRP:</span>
                    <div className="text-base font-sans font-bold text-[#991B1B] print:text-red-700">
                      {brief.current_frp.toFixed(1)} MW
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[#78716C]">30-Day Mean Baseline:</span>
                    <div className="text-base font-sans font-bold text-[#D9531E] print:text-blue-700">
                      {brief.baseline_frp.toFixed(1)} MW
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[#78716C]">Surge Multiplier:</span>
                    <div className="font-bold text-[#1E1B18] print:text-black">
                      {brief.surge_multiplier.toFixed(2)}x Baseline
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[#78716C]">Z-Score Deviation:</span>
                    <div className="font-bold text-[#1E1B18] print:text-black">
                      {brief.z_score.toFixed(2)} &sigma;
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: 3-Axis Multi-Domain Disambiguation */}
              <div className="p-4 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-2.5 shadow-xs print:bg-slate-50 print:border-slate-300">
                <div className="flex items-center gap-2 font-serif font-bold text-[#1E1B18] border-b border-[#D0C9BE] pb-2 print:text-black print:border-slate-300">
                  <Crosshair className="w-4 h-4 text-[#D9531E]" />
                  <span>3-Axis Multi-Sensor Fire Disambiguation</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-mono text-[#78716C]">Diurnal Ratio (D/N):</span>
                    <div className="text-base font-sans font-bold text-[#1E1B18] print:text-emerald-700">
                      {brief.diurnal_ratio.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-[#78716C]">
                      ({brief.diurnal_ratio < 1.3 ? '24/7 Industrial' : 'Diurnal Daytime Fire'})
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[#78716C]">Centroid Drift (&Delta;m):</span>
                    <div className="text-base font-sans font-bold text-[#1E1B18] print:text-emerald-700">
                      {brief.centroid_drift_m.toFixed(1)} m
                    </div>
                    <span className="text-[10px] text-[#78716C]">
                      ({brief.centroid_drift_m < 120 ? 'Sub-pixel Stationary' : 'Spreading Front'})
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-[#78716C]">Infrastructure Context:</span>
                    <div className="text-[#1E1B18] font-medium print:text-black">
                      {brief.nearest_infrastructure}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Hazard Exclusion Cordons */}
            <div className="p-4 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-3 shadow-xs print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center justify-between border-b border-[#D0C9BE] pb-2 print:border-slate-300">
                <span className="font-serif font-bold text-[#1E1B18] print:text-black flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#D9531E]" />
                  <span>Geodesic Hazard Exclusion Zones & Perimeter Directives</span>
                </span>
                <span className="font-mono text-[#78716C] text-[10px]">
                  CVI SCORE: <strong className="text-[#C2410C] print:text-amber-700">{brief.cvi_score}/100</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-none bg-[#FEE2E2] border border-[#FCA5A5] print:bg-red-50 print:border-red-400">
                  <div className="text-[10px] text-[#991B1B] font-mono font-bold uppercase tracking-wider">Primary Blast Cordon</div>
                  <div className="text-lg font-sans font-bold text-[#991B1B] print:text-red-700">
                    {brief.blast_radius_m} meters
                  </div>
                  <div className="text-[10px] text-[#78716C] mt-1 font-sans">
                    Zero civilian access; immediate thermal explosion perimeter cordon.
                  </div>
                </div>
                <div className="p-3 rounded-none bg-[#FFEDD5] border border-[#FDBA74] print:bg-orange-50 print:border-orange-400">
                  <div className="text-[10px] text-[#C2410C] font-mono font-bold uppercase tracking-wider">Toxic Plume Dispersion</div>
                  <div className="text-lg font-sans font-bold text-[#C2410C] print:text-orange-700">
                    {(brief.toxic_dispersion_radius_m / 1000).toFixed(1)} km
                  </div>
                  <div className="text-[10px] text-[#78716C] mt-1 font-sans">
                    Deploy mobile HAZMAT air monitors & particulate scrubbers downwind.
                  </div>
                </div>
                <div className="p-3 rounded-none bg-[#FEF3C7] border border-[#FCD34D] print:bg-yellow-50 print:border-yellow-400">
                  <div className="text-[10px] text-[#B45309] font-mono font-bold uppercase tracking-wider">Evacuation Staging</div>
                  <div className="text-lg font-sans font-bold text-[#B45309] print:text-yellow-700">
                    {(brief.evacuation_radius_m / 1000).toFixed(1)} km
                  </div>
                  <div className="text-[10px] text-[#78716C] mt-1 font-sans">
                    Stage NDRF rescue vehicles & civilian shelter reception centers.
                  </div>
                </div>
              </div>
            </div>

            {/* Satellite Evidence Section */}
            {brief.satellite_image_url && (
              <div className="p-4 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-2.5 shadow-xs print:bg-slate-50 print:border-slate-300">
                <div className="flex items-center gap-2 font-serif font-bold text-[#1E1B18] border-b border-[#D0C9BE] pb-2 print:text-black print:border-slate-300">
                  <Satellite className="w-4 h-4 text-[#D9531E]" />
                  <span>Multi-Spectral Satellite Imagery (Sentinel-2 20m SWIR Fusion)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={brief.satellite_image_url}
                    alt="Sentinel-2 Satellite Quicklook"
                    className="w-48 h-36 object-cover rounded-none border border-[#D0C9BE] shadow-sm print:border-slate-400"
                  />
                  <div className="space-y-1.5 text-[11px] text-[#1E1B18] font-sans print:text-black">
                    <div>
                      <strong className="font-mono text-[#78716C]">Payload:</strong> {brief.satellite_sensor}
                    </div>
                    <div>
                      <strong className="font-mono text-[#78716C]">Scene Overpass Date:</strong> {brief.sentinel_scene_date || 'N/A'}
                    </div>
                    <div>
                      <strong className="font-mono text-[#78716C]">Spatial Resolution:</strong> 20m SWIR Band 11/12 vs 375m VIIRS
                    </div>
                    <div>
                      <strong className="font-mono text-[#78716C]">Georeferenced Anchor:</strong> {brief.coordinates}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended SOP Action Checklists */}
            <div className="p-4 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-2.5 shadow-xs print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center gap-2 font-serif font-bold text-[#1E1B18] border-b border-[#D0C9BE] pb-2 print:text-black print:border-slate-300">
                <FileCheck className="w-4 h-4 text-[#D9531E]" />
                <span>Mandatory SOP Action Directives (Click to Acknowledge)</span>
              </div>
              <div className="space-y-2">
                {brief.recommended_sop.map((sop, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleSop(idx)}
                    className="flex items-start gap-2.5 p-2.5 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] cursor-pointer hover:bg-[#EAE5DC]/60 transition-colors print:bg-[#F5F2EB] print:border-slate-300"
                  >
                    {checkedSops[idx] ? (
                      <CheckSquare className="w-4 h-4 text-[#D9531E] mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-[#78716C] mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-sans ${
                        checkedSops[idx] ? 'line-through text-[#78716C]' : 'text-[#1E1B18] print:text-black font-medium'
                      }`}
                    >
                      {sop}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Authorization & Sign-Off Block */}
            <div className="pt-4 border-t-2 border-[#D0C9BE] flex flex-col sm:flex-row justify-between items-end gap-6 print:border-black print:pt-4">
              <div className="space-y-1 text-[10px] text-[#78716C] print:text-slate-700">
                <div className="font-mono tracking-wider uppercase text-[#78716C]">CRYPTOGRAPHIC VERIFICATION HASH:</div>
                <div className="font-mono text-[#1E1B18] font-bold tracking-wider print:text-black">
                  {brief.evidence_sha256}
                </div>
                <div className="font-mono text-[9px]">TAMPER-EVIDENT GEOINT BLOCKCHAIN REGISTRY &bull; ARTICLE 352 DIRECTIVE</div>
              </div>
              <div className="text-right space-y-1">
                <div className="w-48 border-b border-[#1E1B18] pb-8 text-center text-[#78716C] font-mono text-[10px] print:border-black">
                  [COMMAND DUTY OFFICER SIGNATURE]
                </div>
                <div className="text-[10px] font-sans text-[#1E1B18] font-bold print:text-black">
                  NATIONAL CRISIS RESPONSE CELL
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalBriefModal;
