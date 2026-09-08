import React from 'react';
import { 
  X, 
  PlayCircle, 
  Flame, 
  ShieldAlert, 
  Factory, 
  Activity, 
  HelpCircle, 
  Satellite, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { sound } from '../services/sound';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (sourceId: number, tab?: 'map' | 'alerts' | 'analytics' | 'explainability') => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 2868,
      title: '1. Critical Industrial Fire Incident',
      sourceId: 2868,
      badge: 'CRITICAL ALERT',
      badgeColor: 'bg-red-950 text-red-400 border-red-500/60',
      description: 'Major industrial anomaly with high thermal radiative power, OSM refinery vicinity (score 75), and strong Sentinel-2 optical confirmation.',
      keyPoints: [
        'AI Classification: Industrial Fire (92.3% confidence)',
        'Anomaly Status: CRITICAL ANOMALY (score 90)',
        'Composite Operational Risk: 88.5 / 100',
        'Sentinel-2 visual optical evidence available'
      ],
      icon: Flame,
      iconColor: 'text-red-400'
    },
    {
      id: 1494,
      title: '2. Persistent Gas Flare (Normal / Stable)',
      sourceId: 1494,
      badge: 'NORMAL / STABLE',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500/60',
      description: 'High persistence industrial flare. Demonstrates core intelligence: high FRP is NOT automatically abnormal when recurrent.',
      keyPoints: [
        'AI Classification: Gas Flare (High Persistence)',
        'Anomaly Status: NORMAL / STABLE (Baseline flare)',
        'Operational Risk: 31.9 (Moderate baseline)',
        'Preserves normal industrial operational state'
      ],
      icon: Factory,
      iconColor: 'text-emerald-400'
    },
    {
      id: 13282,
      title: '3. Rapid Agricultural Surge Anomaly',
      sourceId: 13282,
      badge: 'ABNORMAL SURGE',
      badgeColor: 'bg-amber-950 text-amber-400 border-amber-500/60',
      description: 'Crop-residue burning event in agricultural zone exhibiting sudden surge dynamics and elevation to Abnormal status.',
      keyPoints: [
        'AI Classification: Agricultural Burning',
        'Anomaly Status: ABNORMAL (Activity Surge trigger)',
        'High Cropland coverage in land-cover model',
        'Recent activity rate surge detected'
      ],
      icon: Activity,
      iconColor: 'text-amber-400'
    },
    {
      id: 0,
      title: '4. Uncertain / Low Evidence (Preserved Ambiguity)',
      sourceId: 0,
      badge: 'LOW EVIDENCE',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-600',
      description: 'Transient single-pass detection. Demonstrates system integrity: does not fabricate false 99% accuracy when evidence is insufficient.',
      keyPoints: [
        'AI Classification: Uncertain / Low Evidence',
        'Confidence: 0.0% (Honest uncertainty)',
        'Preserved for operator triage rather than hallucinated',
        'Operational Risk: 12.9 (Low)'
      ],
      icon: HelpCircle,
      iconColor: 'text-slate-400'
    },
    {
      id: 11,
      title: '5. Satellite Imagery Unavailable Handling',
      sourceId: 11,
      badge: 'SAT UNAVAILABLE',
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-500/60',
      description: 'Thermal source without cloud-free Sentinel-2 catalogue match. Demonstrates graceful fallback without hiding the source.',
      keyPoints: [
        'Confirmed VIIRS FIRMS thermal hotspot',
        'Satellite Evidence: Gracefully flagged UNAVAILABLE',
        'All AI classification and risk telemetry preserved',
        'Clear operator disclosure'
      ],
      icon: Satellite,
      iconColor: 'text-cyan-400'
    }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="tactical-card max-w-2xl w-full rounded-2xl overflow-hidden border border-command-cyan shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[85vh] bg-command-card"
      >
        {/* Header */}
        <div className="p-4 bg-command-bg border-b border-command-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-command-cyan/50 flex items-center justify-center text-command-cyan">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                SIH 2026 DEMO NARRATIVE SCENARIOS
              </h3>
              <p className="text-[11px] font-mono text-command-textMuted">
                Pre-calibrated test cases demonstrating key intelligence pipeline capabilities.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-command-card border border-command-border text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scenarios List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs font-sans">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  sound.playSelect();
                  onSelectScenario(sc.sourceId, 'map');
                  onClose();
                }}
                className="tactical-card-interactive p-3.5 rounded-xl border border-command-border flex flex-col justify-between gap-2.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-bold text-white group-hover:text-command-cyan transition-colors">
                    <Icon className={`w-4 h-4 ${sc.iconColor}`} />
                    <span>{sc.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {sc.description}
                </p>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-400 bg-command-bg/80 p-2 rounded border border-command-border">
                  {sc.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-1 truncate">
                      <span className="text-cyan-400">&bull;</span> {pt}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-command-cyan">
                  <span>Target Source #{sc.sourceId}</span>
                  <span className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    Inspect on Map &amp; Dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
