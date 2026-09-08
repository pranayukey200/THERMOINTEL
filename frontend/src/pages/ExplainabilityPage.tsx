import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  Brain,
  ShieldCheck,
  Layers,
  Info,
  CheckCircle2,
  FileCode,
  Sliders,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { FeatureImportanceResponse } from '../types';

export const ExplainabilityPage: React.FC = () => {
  const [data, setData] = useState<FeatureImportanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getFeatureImportance()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Feature importance error:", err);
        setLoading(false);
      });
  }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    'Land Cover': '#2E7D32',
    'Industrial Context': '#D9531E',
    'VIIRS Radiometric': '#991B1B',
    'Temporal Persistence': '#B45309',
    'Spatial Context': '#6D28D9'
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-[#EAE5DC] text-[#1E1B18]">
        <div className="p-6 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] shadow-xs flex items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#D9531E] border-t-transparent rounded-none animate-spin" />
          <span className="font-mono text-sm tracking-wider text-[#78716C]">
            Loading Random Forest explainability vectors and feature weights...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] py-8 px-4 sm:px-6 lg:px-8 space-y-8 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-6">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <Brain className="w-4 h-4" />
            <span>EXPLAINABLE AI &amp; MODEL AUDITING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
            Machine Learning Explainability (XAI)
          </h1>
          <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-3xl">
            Complete algorithmic transparency into the Random Forest classification architecture.
            Feature importance distribution derived across 15 engineered physical, industrial, and temporal indicators.
          </p>
        </div>

        {/* Model Overview Banner */}
        <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-6 rounded-none shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-[#D9531E] text-white flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-[#D9531E] font-bold uppercase tracking-wider">
                CLASSIFIER PROFILE
              </span>
              <h2 className="text-lg font-serif font-bold text-[#1E1B18]">
                {data?.model_name || 'Random Forest Multi-Spectral Hotspot Classifier v1.0'}
              </h2>
              <p className="text-xs text-[#78716C] font-sans">
                15 Calibrated Input Features &bull; Gini Impurity Criterion &bull; 100 Estimators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-none bg-[#EAE5DC] text-[#1E1B18] border border-[#D0C9BE] text-xs font-sans font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              <span>MODEL AUDITED &amp; VERIFIED</span>
            </span>
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#78716C]">
            Feature Contribution by Domain Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(data?.category_summary || []).map((cat, idx) => {
              const color = CATEGORY_COLORS[cat.category] || '#D9531E';
              return (
                <div
                  key={idx}
                  className="bg-[#F5F2EB] border border-[#D0C9BE] p-4 rounded-none shadow-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans font-bold text-[#1E1B18]">{cat.category}</span>
                    <span className="font-mono font-bold" style={{ color }}>
                      {cat.total_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#D0C9BE]/40 h-1.5 rounded-none overflow-hidden">
                    <div
                      className="h-full rounded-none transition-all duration-500"
                      style={{ width: `${cat.total_pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[10px] text-[#78716C] font-sans block">
                    Domain weighting in threat prediction
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Importance Horizontal Bar Chart */}
        <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-6 rounded-none shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D0C9BE] pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1E1B18]">
                Relative Feature Importance Spectrum
              </h2>
              <p className="text-xs text-[#78716C] font-sans">
                Normalized Gini importance percentage across all 15 trained dimensions
              </p>
            </div>
            <Layers className="w-5 h-5 text-[#D9531E]" />
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.features || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#E2DDD5" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  stroke="#78716C"
                  domain={[0, 'auto']}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="display_name"
                  tick={{ fontSize: 11, fill: '#1E1B18', width: 150 }}
                  stroke="#78716C"
                  interval={0}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Importance Weight']}
                  contentStyle={{
                    backgroundColor: '#F5F2EB',
                    color: '#1E1B18',
                    borderRadius: '8px',
                    border: '1px solid #D0C9BE',
                    fontSize: '11px',
                    fontFamily: 'sans-serif',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="importance_pct" radius={[0, 4, 4, 0]}>
                  {(data?.features || []).map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#D9531E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Dictionary Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-serif font-bold text-[#1E1B18]">
            Feature Definitions &amp; Engineering Rationale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.features || []).map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#F5F2EB] border border-[#D0C9BE] p-4 rounded-none shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#D9531E]">
                      {feat.feature}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-none bg-[#EAE5DC] text-[#1E1B18]">
                      {feat.importance_pct.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#1E1B18]">
                    {feat.display_name}
                  </h3>
                  <p className="text-xs text-[#5C554E] mt-1 font-sans leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#D0C9BE] flex justify-between items-center text-[11px]">
                  <span
                    className="font-sans font-bold"
                    style={{ color: CATEGORY_COLORS[feat.category] || '#D9531E' }}
                  >
                    {feat.category}
                  </span>
                  <span className="text-[#78716C] font-mono text-[10px]">Normalized Feature</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Transparency Disclosure - Institutional Callout Box */}
        <div className="bg-[#EAE5DC] border-l-4 border-l-[#D9531E] border border-[#D0C9BE] p-6 rounded-none shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[#1E1B18] font-serif font-bold text-sm">
            <Info className="w-4 h-4 text-[#D9531E]" />
            <span>Government Transparency &amp; Audit Disclosure</span>
          </div>
          <p className="text-xs text-[#1E1B18] font-sans leading-relaxed">
            {data?.transparency_disclosure ||
              'This machine learning pipeline has been configured to adhere to responsible AI governance frameworks for emergency disaster response. Classifications represent evidence-derived probabilities rather than absolute ground truth. High-consequence detections trigger dual human-in-the-loop review alongside Sentinel-2 multi-spectral optical ground validation.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPage;
