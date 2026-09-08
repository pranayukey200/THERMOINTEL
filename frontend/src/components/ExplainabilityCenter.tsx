import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Info, 
  BarChart3, 
  ShieldCheck, 
  HelpCircle,
  Database,
  Satellite,
  Factory
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { FeatureImportanceResponse } from '../types';
import { api } from '../services/api';

const CATEGORY_COLORS: Record<string, string> = {
  'Land-Cover Context': '#10B981',
  'Industrial Proximity': '#3B82F6',
  'Temporal Dynamics': '#F59E0B',
  'VIIRS Thermal Metrics': '#EF4444',
  'General Thermal Feature': '#8B5CF6'
};

export const ExplainabilityCenter: React.FC = () => {
  const [xaiData, setXaiData] = useState<FeatureImportanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getFeatureImportance()
      .then((data) => {
        setXaiData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load XAI data:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !xaiData) {
    return (
      <div className="flex-1 bg-command-bg flex items-center justify-center p-8">
        <div className="tactical-card p-6 rounded-xl flex items-center gap-3 border border-purple-500/40">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm text-purple-300 font-bold">
            LOADING MODEL EXPLAINABILITY & RANDOM FOREST FEATURE WEIGHTS...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-command-bg p-4 overflow-y-auto space-y-4 select-none">
      {/* Title & Architecture Card */}
      <div className="tactical-card p-4 rounded-xl border border-command-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-black font-mono tracking-wide text-white">
              EXPLAINABLE AI (XAI) & MODEL TRANSPARENCY
            </h2>
          </div>
          <p className="text-xs text-command-textMuted font-mono mt-0.5">
            Feature importance ranking and decision boundary weighting from Random Forest Classifier v1.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold">
            Model: Random Forest v1
          </span>
          <span className="px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
            15 Key Features
          </span>
        </div>
      </div>

      {/* Main Feature Importance Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Horizontal Bar Chart (2 cols) */}
        <div className="lg:col-span-2 tactical-card p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <span className="font-mono text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              GLOBAL FEATURE IMPORTANCE WEIGHTING (%)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Gini Impurity Metric</span>
          </div>

          <div className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={xaiData.features}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2B48" />
                <XAxis type="number" stroke="#8493B2" unit="%" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <YAxis
                  type="category"
                  dataKey="display_name"
                  stroke="#8493B2"
                  tick={{ fontSize: 11, fill: '#E2E8F0' }}
                  width={180}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                />
                <Bar dataKey="importance_pct" radius={[0, 4, 4, 0]}>
                  {xaiData.features.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#8B5CF6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown & Ethical Transparency (1 col) */}
        <div className="space-y-4">
          {/* Category Group Summary */}
          <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
            <div className="font-mono text-xs font-bold text-command-cyan border-b border-command-border pb-2">
              FEATURE DOMAIN CONTRIBUTIONS
            </div>
            <div className="space-y-2 text-xs font-mono">
              {xaiData.category_summary.map((cat) => {
                const color = CATEGORY_COLORS[cat.category] || '#8B5CF6';
                return (
                  <div key={cat.category} className="bg-command-bg/80 p-2.5 rounded-lg border border-command-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {cat.category}
                      </span>
                      <span className="font-bold text-cyan-300">{cat.total_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cat.total_pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Transparency & Ethical Guidance */}
          <div className="tactical-card p-4 rounded-xl border border-command-border bg-purple-950/20 space-y-2">
            <div className="font-mono text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              OPERATIONAL TRANSPARENCY
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {xaiData.transparency_disclosure}
            </p>
            <div className="text-[10px] font-mono text-purple-300/80 pt-1 border-t border-purple-500/20">
              • High FRP != automatically abnormal (e.g. persistent flares are normal/stable).
              <br />
              • OSM proximity is supporting context, not proven physical cause.
            </div>
          </div>
        </div>
      </div>

      {/* Feature Explanations Dictionary */}
      <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
        <div className="font-mono text-xs font-bold text-command-cyan border-b border-command-border pb-2">
          FEATURE DEFINITIONS & SENSOR ORIGINS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {xaiData.features.map((f) => (
            <div key={f.feature} className="bg-command-bg/80 p-3 rounded-lg border border-command-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1 font-mono">
                  <span className="font-bold text-white text-xs">{f.display_name}</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{f.importance_pct}%</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mb-1.5">
                  Category: <span className="text-slate-300">{f.category}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-normal">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
