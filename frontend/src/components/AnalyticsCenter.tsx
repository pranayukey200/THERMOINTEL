import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldAlert, 
  Activity, 
  Satellite, 
  Factory,
  Flame
} from 'lucide-react';
import { 
  DistributionItem, 
  RiskDistribution, 
  AnomalyDistribution, 
  IndustrialContextDistribution, 
  EvidenceDistribution 
} from '../types';
import { api } from '../services/api';

const COLORS = ['#00F0FF', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#64748B'];

export const AnalyticsCenter: React.FC = () => {
  const [classifications, setClassifications] = useState<DistributionItem[]>([]);
  const [riskData, setRiskData] = useState<RiskDistribution | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyDistribution | null>(null);
  const [industrialData, setIndustrialData] = useState<IndustrialContextDistribution | null>(null);
  const [evidenceData, setEvidenceData] = useState<EvidenceDistribution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getClassificationDistribution(),
      api.getRiskDistribution(),
      api.getAnomalyDistribution(),
      api.getIndustrialContextDistribution(),
      api.getEvidenceDistribution(),
    ])
      .then(([cls, risk, anomaly, ind, ev]) => {
        setClassifications(cls);
        setRiskData(risk);
        setAnomalyData(anomaly);
        setIndustrialData(ind);
        setEvidenceData(ev);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 bg-command-bg flex items-center justify-center p-8">
        <div className="tactical-card p-6 rounded-xl flex items-center gap-3 border border-command-cyan">
          <div className="w-6 h-6 border-2 border-command-cyan border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm text-command-cyan font-bold">
            CALCULATING INTELLIGENCE DISTRIBUTIONS ACROSS 15,436 SOURCES...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-command-bg p-4 overflow-y-auto space-y-4 select-none">
      {/* Title */}
      <div className="tactical-card p-4 rounded-xl border border-command-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-black font-mono tracking-wide text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-command-cyan" />
            OPERATIONAL INTELLIGENCE ANALYTICS & DISTRIBUTION
          </h2>
          <p className="text-xs text-command-textMuted font-mono mt-0.5">
            Aggregated statistics dynamically queried from 15,436 India-region thermal sources.
          </p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Classification Distribution */}
        <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <span className="font-mono text-xs font-bold text-command-cyan flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              AI CLASSIFICATION BREAKDOWN
            </span>
            <span className="text-[11px] font-mono text-slate-400">7 Prototype Classes</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classifications}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2B48" />
                <XAxis type="number" stroke="#8493B2" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8493B2"
                  tick={{ fontSize: 10, fill: '#E2E8F0' }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#00F0FF',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} sources`, 'Count']}
                />
                <Bar dataKey="count" fill="#00F0FF" radius={[0, 4, 4, 0]}>
                  {classifications.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Risk Score Histogram */}
        <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <span className="font-mono text-xs font-bold text-orange-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              OPERATIONAL RISK SPECTRUM (0-100)
            </span>
            <span className="text-[11px] font-mono text-slate-400">10-Point Score Bins</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskData?.score_histogram || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2B48" />
                <XAxis dataKey="range" stroke="#8493B2" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <YAxis stroke="#8493B2" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#F97316',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} sources`, 'Count']}
                />
                <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Status Distribution */}
        <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <span className="font-mono text-xs font-bold text-command-amber flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              ANOMALY STATUS & SURGE METRICS
            </span>
            <span className="text-[11px] font-mono text-slate-400">Temporal Behaviour</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyData?.statuses || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(anomalyData?.statuses || []).map((entry, index) => {
                      let color = '#10B981';
                      if (entry.name.includes('CRITICAL')) color = '#EF4444';
                      else if (entry.name.includes('ABNORMAL')) color = '#F97316';
                      else if (entry.name.includes('WATCH')) color = '#F59E0B';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1322',
                      borderColor: '#F59E0B',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                    formatter={(val: any) => [`${val.toLocaleString()} sources`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Surge metrics counters */}
            <div className="space-y-2 text-xs font-mono flex flex-col justify-center">
              <div className="bg-command-bg/80 p-2 rounded border border-command-border flex justify-between">
                <span className="text-slate-400">Activity Surges:</span>
                <span className="font-bold text-amber-300">{anomalyData?.surge_metrics.activity_surges}</span>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border flex justify-between">
                <span className="text-slate-400">Strong Activity Surges:</span>
                <span className="font-bold text-red-400">{anomalyData?.surge_metrics.strong_surges}</span>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border flex justify-between">
                <span className="text-slate-400">Newly Emerging Sources:</span>
                <span className="font-bold text-cyan-300">{anomalyData?.surge_metrics.newly_emerging}</span>
              </div>
              <div className="bg-command-bg/80 p-2 rounded border border-command-border flex justify-between">
                <span className="text-slate-400">High Recent Intensity:</span>
                <span className="font-bold text-orange-300">{anomalyData?.surge_metrics.high_recent_intensity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sentinel-2 Satellite Evidence Quality */}
        <div className="tactical-card p-4 rounded-xl border border-command-border space-y-3">
          <div className="flex items-center justify-between border-b border-command-border pb-2">
            <span className="font-mono text-xs font-bold text-command-emerald flex items-center gap-1.5">
              <Satellite className="w-4 h-4" />
              SENTINEL-2 EVIDENCE COVERAGE (93.11%)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Avg Cloud: {evidenceData?.avg_cloud_cover}%
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evidenceData?.quality_breakdown || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2B48" />
                <XAxis dataKey="name" stroke="#8493B2" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <YAxis stroke="#8493B2" tick={{ fontSize: 10, fill: '#8493B2' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: '#10B981',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(val: any) => [`${val.toLocaleString()} sources`, 'Count']}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]}>
                  {(evidenceData?.quality_breakdown || []).map((entry, index) => {
                    let fill = '#10B981';
                    if (entry.name === 'STRONG') fill = '#10B981';
                    else if (entry.name === 'GOOD') fill = '#00F0FF';
                    else if (entry.name === 'MODERATE') fill = '#F59E0B';
                    else if (entry.name === 'WEAK') fill = '#F97316';
                    else fill = '#64748B';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
