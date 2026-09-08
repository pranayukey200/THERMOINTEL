import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  ExternalLink, 
  Activity, 
  Flame, 
  ChevronRight, 
  ChevronLeft,
  RefreshCw, 
  Radio,
  Sliders
} from 'lucide-react';
import { CorrelatedThermalEvent } from '../types';

interface CorrelatedEventBannerProps {
  events: CorrelatedThermalEvent[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CorrelatedEventBanner: React.FC<CorrelatedEventBannerProps> = ({
  events,
  onRefresh,
  isRefreshing
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (!events || events.length === 0) {
    return null;
  }

  const currentEvent = events[Math.min(currentIndex, events.length - 1)];

  const handleInspectClusterOnMap = (event: CorrelatedThermalEvent) => {
    const sourceIdsStr = event.source_ids.join(',');
    navigate(
      `/map?cluster_id=${encodeURIComponent(event.event_id)}&sources=${encodeURIComponent(sourceIdsStr)}&lat=${event.centroid_lat}&lon=${event.centroid_lon}&name=${encodeURIComponent(event.region_name)}&z=${event.z_score.toFixed(1)}&inspect_cluster=true`
    );
  };

  const isIndustrial = currentEvent.tag === 'INVESTIGATE_INDUSTRIAL';

  return (
    <div 
      id="correlated-thermal-activity-banner"
      className="bg-[#FBF7F2] border-y sm:border border-[#D0C9BE] border-l-4 border-l-[#D9531E] shadow-sm select-none transition-all overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E7DFD5]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#D9531E] font-mono font-bold text-xs uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#D9531E]" />
              <span>SYNCHRONIZED SURGE DETECTION ENGINE</span>
            </div>
            <span className="text-[#A8A29E] text-xs">&bull;</span>
            <span className="font-mono text-xs font-bold text-[#1E1B18]">
              {currentEvent.event_id}
            </span>
            <span className="text-[#A8A29E] text-xs">&bull;</span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                isIndustrial
                  ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                  : 'bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]'
              }`}
            >
              {currentEvent.tag}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {events.length > 1 && (
              <div className="flex items-center gap-1 font-mono text-xs text-[#5C554E] mr-2">
                <span>Cluster {currentIndex + 1} of {events.length}</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1))}
                    className="p-1 border border-[#D0C9BE] bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#1E1B18] cursor-pointer"
                    title="Previous Cluster"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0))}
                    className="p-1 border border-[#D0C9BE] bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#1E1B18] cursor-pointer"
                    title="Next Cluster"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 border border-[#D0C9BE] bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#5C554E] hover:text-[#1E1B18] transition-colors cursor-pointer"
                title="Re-run Correlated Detection Algorithm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#D9531E]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Alert Message */}
        <div className="pt-3 pb-2">
          <h2 className="font-serif font-bold text-base sm:text-lg text-[#1E1B18] leading-snug tracking-tight">
            {currentEvent.title}
          </h2>
        </div>

        {/* Statistical Footprint & Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 pb-3 text-xs border-b border-[#E7DFD5]">
          <div>
            <span className="font-mono text-[10px] text-[#78716C] uppercase block">Regional Z-Score</span>
            <span className="font-sans font-bold text-sm text-[#991B1B]">
              +{currentEvent.z_score.toFixed(1)}σ
            </span>
            <span className="font-mono text-[9px] text-[#78716C] block">
              Threshold: &ge; 2.0σ
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] text-[#78716C] uppercase block">Spatial Baseline</span>
            <span className="font-sans font-bold text-sm text-[#1E1B18]">
              {currentEvent.baseline_mean.toFixed(1)} avg/day
            </span>
            <span className="font-mono text-[9px] text-[#78716C] block">
              Std Dev: &plusmn;{currentEvent.baseline_std.toFixed(1)}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] text-[#78716C] uppercase block">Cluster Footprint</span>
            <span className="font-sans font-bold text-sm text-[#1E1B18]">
              {currentEvent.source_count} Active Sources
            </span>
            <span className="font-mono text-[9px] text-[#78716C] block">
              DBSCAN (150km / 3d)
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] text-[#78716C] uppercase block">Cluster Centroid</span>
            <span className="font-mono font-medium text-xs text-[#1E1B18]">
              {currentEvent.centroid_lat.toFixed(3)}°N, {currentEvent.centroid_lon.toFixed(3)}°E
            </span>
            <span className="font-mono text-[9px] text-[#78716C] block">
              Span: {currentEvent.start_date} &rarr; {currentEvent.end_date}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-[#5C554E]">Member Sources ({currentEvent.source_ids.length}):</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentEvent.source_ids.slice(0, 6).map((sid) => (
                <button
                  key={sid}
                  onClick={() => navigate(`/map?source_id=${sid}&inspect=true`)}
                  className="px-2 py-0.5 bg-[#EAE5DC] hover:bg-[#D9531E] hover:text-white border border-[#D0C9BE] text-[10px] font-mono text-[#1E1B18] transition-colors cursor-pointer"
                  title={`Inspect single source SRC-${sid}`}
                >
                  SRC-{sid}
                </button>
              ))}
              {currentEvent.source_ids.length > 6 && (
                <span className="text-[10px] font-mono text-[#78716C]">
                  +{currentEvent.source_ids.length - 6} more
                </span>
              )}
            </div>
          </div>

          <button
            id="btn-view-cluster-map"
            onClick={() => handleInspectClusterOnMap(currentEvent)}
            className="w-full sm:w-auto px-5 py-2 bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer flex-shrink-0"
            title="Navigate to tactical GIS map highlighting every source in this cluster"
          >
            <MapPin className="w-4 h-4" />
            <span>View All {currentEvent.source_count} Sources on Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrelatedEventBanner;
