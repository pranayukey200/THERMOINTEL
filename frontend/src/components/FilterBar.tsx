import React from 'react';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  Layers, 
  Flame, 
  AlertTriangle, 
  Satellite, 
  Factory,
  ChevronDown
} from 'lucide-react';
import { FilterState } from '../types';
import { sound } from '../services/sound';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatching: number;
  isLoading: boolean;
  onReset: () => void;
}

const CLASSIFICATIONS = [
  'All Classifications',
  'Industrial Fire',
  'Gas Flare',
  'Wildfire / Forest Fire',
  'Agricultural Burning',
  'Mining / Industrial Thermal',
  'Persistent Industrial Thermal Activity',
  'Uncertain / Low Evidence',
];

const RISK_BANDS = ['All Risk Bands', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

const ANOMALY_STATUSES = [
  'All Anomaly Statuses',
  'CRITICAL ANOMALY',
  'ABNORMAL',
  'WATCH',
  'NORMAL / STABLE',
];

const EVIDENCE_QUALITIES = [
  'All Quality',
  'STRONG',
  'GOOD',
  'MODERATE',
  'WEAK',
  'HISTORICAL_ONLY',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatching,
  isLoading,
  onReset,
}) => {
  const handleChange = (key: keyof FilterState, value: any) => {
    sound.playClick();
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-command-card/90 border-b border-command-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs relative">
        <Search className="w-3.5 h-3.5 text-command-textMuted absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Source #ID or keyword..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full pl-8 pr-3 py-1.5 rounded-md bg-command-bg border border-command-border text-command-text placeholder-command-textMuted/60 focus:outline-none focus:border-command-cyan font-mono text-xs"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            className="absolute right-2 text-command-textMuted hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Classification */}
        <select
          value={filters.classification || 'All Classifications'}
          onChange={(e) =>
            handleChange(
              'classification',
              e.target.value === 'All Classifications' ? '' : e.target.value
            )
          }
          className="bg-command-bg border border-command-border rounded-md px-2.5 py-1.5 text-command-text focus:outline-none focus:border-command-cyan cursor-pointer text-xs"
        >
          {CLASSIFICATIONS.map((c) => (
            <option key={c} value={c} className="bg-command-card text-white">
              {c}
            </option>
          ))}
        </select>

        {/* Risk Band */}
        <select
          value={filters.risk_band || 'All Risk Bands'}
          onChange={(e) =>
            handleChange(
              'risk_band',
              e.target.value === 'All Risk Bands' ? '' : e.target.value
            )
          }
          className="bg-command-bg border border-command-border rounded-md px-2.5 py-1.5 text-command-text focus:outline-none focus:border-command-cyan cursor-pointer text-xs"
        >
          {RISK_BANDS.map((r) => (
            <option key={r} value={r} className="bg-command-card text-white">
              {r === 'All Risk Bands' ? r : `Risk: ${r}`}
            </option>
          ))}
        </select>

        {/* Anomaly Status */}
        <select
          value={filters.anomaly_status || 'All Anomaly Statuses'}
          onChange={(e) =>
            handleChange(
              'anomaly_status',
              e.target.value === 'All Anomaly Statuses' ? '' : e.target.value
            )
          }
          className="bg-command-bg border border-command-border rounded-md px-2.5 py-1.5 text-command-text focus:outline-none focus:border-command-cyan cursor-pointer text-xs"
        >
          {ANOMALY_STATUSES.map((a) => (
            <option key={a} value={a} className="bg-command-card text-white">
              {a === 'All Anomaly Statuses' ? a : `Anomaly: ${a}`}
            </option>
          ))}
        </select>

        {/* Satellite Evidence Status */}
        <select
          value={filters.satellite_evidence_status || 'All Satellite'}
          onChange={(e) =>
            handleChange(
              'satellite_evidence_status',
              e.target.value === 'All Satellite' ? '' : e.target.value
            )
          }
          className="bg-command-bg border border-command-border rounded-md px-2.5 py-1.5 text-command-text focus:outline-none focus:border-command-cyan cursor-pointer text-xs"
        >
          <option value="All Satellite" className="bg-command-card">
            Satellite: All
          </option>
          <option value="AVAILABLE" className="bg-command-card">
            Satellite: Available (93.1%)
          </option>
          <option value="UNAVAILABLE" className="bg-command-card">
            Satellite: Unavailable (6.9%)
          </option>
        </select>

        {/* Evidence Quality */}
        <select
          value={filters.evidence_quality || 'All Quality'}
          onChange={(e) =>
            handleChange(
              'evidence_quality',
              e.target.value === 'All Quality' ? '' : e.target.value
            )
          }
          className="bg-command-bg border border-command-border rounded-md px-2.5 py-1.5 text-command-text focus:outline-none focus:border-command-cyan cursor-pointer text-xs"
        >
          {EVIDENCE_QUALITIES.map((q) => (
            <option key={q} value={q} className="bg-command-card text-white">
              {q === 'All Quality' ? 'Evidence Quality: All' : `Quality: ${q}`}
            </option>
          ))}
        </select>

        {/* Industrial context toggle */}
        <button
          onClick={() => {
            sound.playClick();
            setFilters((prev) => ({
              ...prev,
              has_industrial_context:
                prev.has_industrial_context === true
                  ? undefined
                  : true,
            }));
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-colors ${
            filters.has_industrial_context === true
              ? 'bg-blue-900/40 text-blue-300 border-blue-500'
              : 'bg-command-bg text-command-textMuted border-command-border hover:text-white'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          <span>Industrial Vicinity</span>
        </button>

        {/* Reset button */}
        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          title="Reset all filters"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-command-bg border border-command-border text-command-textMuted hover:text-command-cyan hover:border-command-cyan transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Matching Count Ticker */}
      <div className="flex items-center gap-2 font-mono text-xs text-command-textMuted">
        <span>Filtered:</span>
        <span className="font-bold text-command-cyan glow-cyan">
          {isLoading ? '...' : totalMatching.toLocaleString()}
        </span>
        <span>sources</span>
      </div>
    </div>
  );
};
