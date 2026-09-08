import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  Factory,
  TrendingUp,
  TrendingDown,
  Compass,
  Search,
  Filter,
  BarChart3,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ArrowUpDown,
  X,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  Leaf
} from 'lucide-react';
import { api } from '../services/api';
import {
  DistrictBenchmarkItem,
  DistrictBenchmarkResponse,
  StateBenchmarkItem,
  StateBenchmarkResponse
} from '../types';

export const BenchmarksPage: React.FC = () => {
  const navigate = useNavigate();

  // Primary State
  const [viewType, setViewType] = useState<'districts' | 'states'>('districts');
  const [mode, setMode] = useState<'all' | 'industrial'>('all');
  const [districtTab, setDistrictTab] = useState<'ranked' | 'insufficient'>('ranked');

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'density' | 'risk' | 'sources' | 'trend'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Data State
  const [districtData, setDistrictData] = useState<DistrictBenchmarkResponse | null>(null);
  const [stateData, setStateData] = useState<StateBenchmarkResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictBenchmarkItem | null>(null);
  const [districtDetailData, setDistrictDetailData] = useState<{
    district: DistrictBenchmarkItem;
    top_sources: any[];
    satellite_evidence_samples: any[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Load District & State Benchmarks
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getDistrictBenchmarks(mode, selectedState === 'ALL' ? undefined : selectedState),
      api.getStateBenchmarks(mode)
    ])
      .then(([districts, states]) => {
        if (!isMounted) return;
        setDistrictData(districts);
        setStateData(states);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Benchmarks fetch error:', err);
        setError('Failed to load risk benchmark datasets.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, selectedState]);

  // Handle Opening Detail Modal
  const handleOpenDetail = (district: DistrictBenchmarkItem) => {
    setSelectedDistrict(district);
    setLoadingDetail(true);
    api.getDistrictDetail(district.district)
      .then((data) => {
        setDistrictDetailData(data);
        setLoadingDetail(false);
      })
      .catch((err) => {
        console.error('Failed to load district detail:', err);
        setLoadingDetail(false);
      });
  };

  const handleCloseDetail = () => {
    setSelectedDistrict(null);
    setDistrictDetailData(null);
  };

  // Navigate to Map with District Filter & Centering
  const handleInspectOnMap = (district: DistrictBenchmarkItem) => {
    const [cLat, cLon] = district.centroid;
    const bboxParam = district.bbox ? `&bbox=${district.bbox.join(',')}` : '';
    navigate(
      `/map?district=${encodeURIComponent(district.district)}&state=${encodeURIComponent(
        district.state
      )}&lat=${cLat}&lon=${cLon}&filter_district=true${bboxParam}`
    );
  };

  // Navigate to Map with State Filter
  const handleInspectStateOnMap = (stateItem: StateBenchmarkItem) => {
    navigate(
      `/map?state=${encodeURIComponent(stateItem.state)}&filter_state=true`
    );
  };

  // Unique list of states for dropdown
  const availableStates = useMemo(() => {
    if (!stateData) return [];
    return stateData.ranked_states.map((s) => s.state).sort();
  }, [stateData]);

  // Filtered and Sorted Districts
  const displayedDistricts = useMemo(() => {
    if (!districtData) return [];
    const sourceList =
      districtTab === 'ranked'
        ? districtData.ranked_leaderboard
        : districtData.insufficient_data;

    let filtered = sourceList.filter((d) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchesName = d.district.toLowerCase().includes(s);
        const matchesState = d.state.toLowerCase().includes(s);
        const matchesInd = d.primary_industries?.toLowerCase().includes(s);
        if (!matchesName && !matchesState && !matchesInd) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'score') {
        valA = a.benchmark_score;
        valB = b.benchmark_score;
      } else if (sortBy === 'density') {
        valA = a.source_density;
        valB = b.source_density;
      } else if (sortBy === 'risk') {
        valA = a.avg_risk_score;
        valB = b.avg_risk_score;
      } else if (sortBy === 'sources') {
        valA = a.total_sources;
        valB = b.total_sources;
      } else if (sortBy === 'trend') {
        valA = a.trend_delta_pct ?? 0;
        valB = b.trend_delta_pct ?? 0;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [districtData, districtTab, searchTerm, sortBy, sortOrder]);

  // Filtered and Sorted States
  const displayedStates = useMemo(() => {
    if (!stateData) return [];
    let filtered = stateData.ranked_states.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return s.state.toLowerCase().includes(q);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'score') {
        valA = a.benchmark_score;
        valB = b.benchmark_score;
      } else if (sortBy === 'density') {
        valA = a.state_density;
        valB = b.state_density;
      } else if (sortBy === 'sources') {
        valA = a.total_sources;
        valB = b.total_sources;
      } else if (sortBy === 'trend') {
        valA = a.trend_delta_pct ?? 0;
        valB = b.trend_delta_pct ?? 0;
      } else {
        valA = a.benchmark_score;
        valB = b.benchmark_score;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [stateData, searchTerm, sortBy, sortOrder]);

  // Color helper for Benchmark Scores
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#DC2626] bg-[#FEE2E2] border-[#FCA5A5]';
    if (score >= 50) return 'text-[#D97706] bg-[#FEF3C7] border-[#FCD34D]';
    if (score >= 35) return 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]';
    return 'text-[#475569] bg-[#F1F5F9] border-[#CBD5E1]';
  };

  const getScoreBarGradient = (score: number) => {
    if (score >= 70) return 'bg-[#DC2626]';
    if (score >= 50) return 'bg-[#D97706]';
    if (score >= 35) return 'bg-[#0284C7]';
    return 'bg-[#64748B]';
  };

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] pt-24 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#D9531E] uppercase">
                <BarChart3 className="w-4 h-4 text-[#D9531E]" />
                SOVEREIGN TERRITORIAL NORMALIZATION
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1E1B18] tracking-tight mt-1">
                District &amp; State Thermal Risk Benchmarks
              </h1>
              <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-3xl">
                30-day spatial density per 1,000 km², cross-district percentile rankings, and strictly segregated industrial versus agricultural activity scores.
              </p>
            </div>

            {/* Rolling Window Badge */}
            <div className="bg-[#F5F2EB] border border-[#D0C9BE] px-4 py-2 text-xs font-mono">
              <div className="text-[10px] text-[#78716C] uppercase tracking-wider font-bold">ROLLING 30-DAY WINDOW</div>
              <div className="font-bold text-[#1E1B18] mt-0.5">
                {districtData?.window_current || '2026-07-31 to 2026-08-29'}
              </div>
              <div className="text-[10px] text-[#78716C] mt-0.5">
                Prior baseline: {districtData?.window_prior || '2026-07-01 to 2026-07-30'}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Callout Note */}
        <div className="bg-[#F5F2EB] border-l-4 border-[#D9531E] border-y border-r border-[#D0C9BE] p-4 text-xs font-sans">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[#D9531E] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#5C554E]">
              <span className="font-bold text-[#1E1B18]">Statistical Normalization Framework: </span>
              Scores are not raw counts. They are derived from (1) spatial density per 1,000 km² using authentic boundary areas, (2) percentile ranking across all Indian districts, (3) high/critical threat share, and (4) peak FRP intensity. Districts with &lt;5 active sources are isolated into Insufficient Data to protect statistical significance.
            </div>
          </div>
        </div>

        {/* Primary Controls Row */}
        <div className="bg-[#F5F2EB] p-4 border border-[#D0C9BE] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Jurisdiction Toggle: Districts vs States */}
            <div className="flex items-center gap-1 border border-[#D0C9BE] bg-[#EAE5DC] p-1">
              <button
                onClick={() => setViewType('districts')}
                className={`px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  viewType === 'districts'
                    ? 'bg-[#1E1B18] text-white shadow-xs'
                    : 'text-[#5C554E] hover:text-[#1E1B18]'
                }`}
              >
                District Leaderboard
              </button>
              <button
                onClick={() => setViewType('states')}
                className={`px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  viewType === 'states'
                    ? 'bg-[#1E1B18] text-white shadow-xs'
                    : 'text-[#5C554E] hover:text-[#1E1B18]'
                }`}
              >
                State Rollup
              </button>
            </div>

            {/* Benchmark Analysis Mode Toggle: Total vs Industrial Only */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#78716C] uppercase hidden sm:inline">MODE:</span>
              <div className="flex items-center gap-1 border border-[#D0C9BE] bg-[#EAE5DC] p-1">
                <button
                  onClick={() => setMode('all')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === 'all'
                      ? 'bg-[#D9531E] text-white shadow-xs'
                      : 'text-[#5C554E] hover:text-[#1E1B18]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Total Thermal Activity
                </button>
                <button
                  onClick={() => setMode('industrial')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === 'industrial'
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-[#5C554E] hover:text-[#1E1B18]'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5" />
                  Industrial Risk Only
                </button>
              </div>
            </div>

          </div>

          {/* Secondary Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D0C9BE]">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72 text-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#78716C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={viewType === 'districts' ? 'Search district, state, industry...' : 'Search state...'}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D0C9BE] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] text-xs font-sans"
              />
            </div>

            {/* Controls right side */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              
              {/* State Filter (Districts View only) */}
              {viewType === 'districts' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-mono text-[#78716C] uppercase text-[11px]">State:</span>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-white border border-[#D0C9BE] px-2.5 py-1.5 text-xs font-sans text-[#1E1B18] focus:outline-none focus:border-[#D9531E] cursor-pointer"
                  >
                    <option value="ALL">All States ({availableStates.length})</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-mono text-[#78716C] uppercase text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#D0C9BE] px-2.5 py-1.5 text-xs font-sans text-[#1E1B18] focus:outline-none focus:border-[#D9531E] cursor-pointer"
                >
                  <option value="score">Benchmark Score</option>
                  <option value="density">Source Density</option>
                  <option value="risk">Avg Risk Score</option>
                  <option value="sources">Source Count</option>
                  <option value="trend">Trend Delta (Δ%)</option>
                </select>
                <button
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="p-1.5 border border-[#D0C9BE] bg-white text-[#5C554E] hover:text-[#1E1B18] cursor-pointer"
                  title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* District Qualification Subtabs (Ranked vs Insufficient Data) */}
          {viewType === 'districts' && districtData && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDistrictTab('ranked')}
                className={`px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  districtTab === 'ranked'
                    ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                    : 'bg-white text-[#5C554E] border-[#D0C9BE] hover:text-[#1E1B18]'
                }`}
              >
                Ranked Leaderboard ({districtData.eligible_count})
              </button>
              <button
                onClick={() => setDistrictTab('insufficient')}
                className={`px-3 py-1 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  districtTab === 'insufficient'
                    ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                    : 'bg-white text-[#5C554E] border-[#D0C9BE] hover:text-[#1E1B18]'
                }`}
              >
                Insufficient Data &lt;5 sources ({districtData.insufficient_count})
              </button>
            </div>
          )}

        </div>

        {/* Quick KPI Overview Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-4">
            <div className="text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
              {viewType === 'districts' ? 'QUALIFIED DISTRICTS' : 'MONITORED STATES'}
            </div>
            <div className="text-2xl font-serif font-extrabold text-[#1E1B18] mt-1">
              {viewType === 'districts'
                ? districtData?.eligible_count ?? '—'
                : stateData?.state_count ?? '—'}
            </div>
            <div className="text-[11px] text-[#5C554E] mt-0.5">
              {viewType === 'districts'
                ? `of ${districtData?.total_districts_monitored || 54} total cataloged`
                : 'Aggregated via area-weighted scoring'}
            </div>
          </div>

          <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-4">
            <div className="text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
              {viewType === 'districts' ? 'HIGHEST BENCHMARK' : 'TOP RISK STATE'}
            </div>
            <div className="text-xl font-serif font-extrabold text-[#D9531E] mt-1 truncate">
              {viewType === 'districts'
                ? districtData?.ranked_leaderboard?.[0]?.district || '—'
                : stateData?.ranked_states?.[0]?.state || '—'}
            </div>
            <div className="text-[11px] font-mono text-[#5C554E] mt-0.5">
              Score:{' '}
              <span className="font-bold text-[#1E1B18]">
                {viewType === 'districts'
                  ? districtData?.ranked_leaderboard?.[0]?.benchmark_score?.toFixed(1) || '—'
                  : stateData?.ranked_states?.[0]?.benchmark_score?.toFixed(1) || '—'}
              </span>{' '}
              / 100
            </div>
          </div>

          <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-4">
            <div className="text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
              SEGREGATION MODE
            </div>
            <div className="text-sm font-sans font-bold text-[#1E1B18] mt-1 flex items-center gap-1.5">
              {mode === 'industrial' ? (
                <>
                  <Factory className="w-4 h-4 text-[#1E3A8A]" />
                  <span className="text-[#1E3A8A]">Industrial Only (0% Agri)</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-[#D9531E]" />
                  <span className="text-[#D9531E]">Total Thermal Activity</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-[#5C554E] mt-0.5">
              {mode === 'industrial' ? 'Strict petrochemical / refinery filtering' : 'Includes agro-burning & biomass'}
            </div>
          </div>

          <div className="bg-[#F5F2EB] border border-[#D0C9BE] p-4">
            <div className="text-[11px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
              ACTIVE SOURCES IN WINDOW
            </div>
            <div className="text-2xl font-serif font-extrabold text-[#1E1B18] mt-1">
              {viewType === 'districts'
                ? districtData?.ranked_leaderboard?.reduce((acc, d) => acc + d.total_sources, 0) || '—'
                : stateData?.ranked_states?.reduce((acc, s) => acc + s.total_sources, 0) || '—'}
            </div>
            <div className="text-[11px] text-[#5C554E] mt-0.5">
              Hotspots detected across current 30-day cycle
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center bg-[#F5F2EB] border border-[#D0C9BE]">
            <div className="w-8 h-8 border-2 border-[#D9531E] border-t-transparent rounded-none animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-[#5C554E]">Computing normalized territorial risk metrics...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B]">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-[#DC2626]" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Leaderboard Cards Container */}
        {!loading && !error && (
          <div className="space-y-3">
            {viewType === 'districts' ? (
              displayedDistricts.length === 0 ? (
                <div className="p-12 text-center bg-[#F5F2EB] border border-[#D0C9BE] text-[#78716C]">
                  No districts match the selected filters.
                </div>
              ) : (
                displayedDistricts.map((district) => (
                  <div
                    key={`${district.state}-${district.district}`}
                    className="bg-[#F5F2EB] border border-[#D0C9BE] p-4 sm:p-5 transition-all hover:border-[#1E1B18] hover:shadow-xs group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left Block: Rank, Name, Badges, Industry */}
                      <div className="flex items-start gap-4">
                        {/* Rank Badge */}
                        <div
                          className={`w-10 h-10 shrink-0 flex items-center justify-center font-mono font-extrabold text-sm border ${
                            district.rank === 1
                              ? 'bg-[#D9531E] text-white border-[#D9531E]'
                              : district.rank === 2
                              ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                              : district.rank === 3
                              ? 'bg-[#5C554E] text-white border-[#5C554E]'
                              : 'bg-white text-[#5C554E] border-[#D0C9BE]'
                          }`}
                        >
                          {district.rank ? `#${district.rank}` : '—'}
                        </div>

                        {/* District Information */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B18]">
                              {district.district}
                            </h2>
                            <span className="px-2 py-0.5 bg-white border border-[#D0C9BE] text-[11px] font-mono font-bold text-[#5C554E]">
                              {district.state}
                            </span>
                            
                            {/* Dominant Activity Tag */}
                            {district.dominant_tag === 'INDUSTRIAL_DOMINANT' ? (
                              <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[10px] font-mono font-bold flex items-center gap-1">
                                <Factory className="w-3 h-3 text-[#1E40AF]" />
                                INDUSTRIAL DOMINANT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-mono font-bold flex items-center gap-1">
                                <Leaf className="w-3 h-3 text-[#065F46]" />
                                AGRICULTURAL DOMINANT
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#5C554E] flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                              Area:{' '}
                              <strong className="text-[#1E1B18]">
                                {district.area_sqkm.toLocaleString()} km²
                              </strong>
                            </span>
                            <span>
                              Density:{' '}
                              <strong className="text-[#1E1B18]">
                                {district.source_density.toFixed(1)} / 1k km²
                              </strong>
                            </span>
                            <span>
                              Active Sources:{' '}
                              <strong className="text-[#1E1B18]">
                                {district.total_sources}
                              </strong>
                            </span>
                            <span>
                              High/Crit Severity:{' '}
                              <strong className="text-[#DC2626]">
                                {district.high_crit_count} ({district.high_crit_share.toFixed(0)}%)
                              </strong>
                            </span>
                          </div>

                          {district.primary_industries && (
                            <div className="text-[11px] font-mono text-[#78716C]">
                              Focus Belts: {district.primary_industries}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Score Gauge, Trend Delta, Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#D0C9BE]">
                        
                        {/* Benchmark Score Display */}
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-[#78716C] uppercase font-bold">
                            BENCHMARK SCORE
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-0.5">
                            <span
                              className={`text-2xl font-mono font-extrabold px-2.5 py-0.5 border ${getScoreColor(
                                district.benchmark_score
                              )}`}
                            >
                              {district.benchmark_score.toFixed(1)}
                            </span>
                          </div>

                          {/* 30-Day Trend Delta */}
                          <div className="flex items-center gap-1 justify-end text-xs font-mono mt-1">
                            {district.trend_delta_pct !== undefined && district.trend_delta_pct !== null ? (
                              district.trend_delta_pct > 0 ? (
                                <span className="text-[#DC2626] font-bold flex items-center gap-0.5">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  +{district.trend_delta_pct.toFixed(1)}%
                                </span>
                              ) : district.trend_delta_pct < 0 ? (
                                <span className="text-[#16A34A] font-bold flex items-center gap-0.5">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  {district.trend_delta_pct.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-[#78716C] font-bold">±0.0%</span>
                              )
                            ) : (
                              <span className="text-[#78716C]">New</span>
                            )}
                            <span className="text-[10px] text-[#78716C]">vs prior</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDetail(district)}
                            className="px-3 py-2 bg-white border border-[#D0C9BE] text-[#1E1B18] text-xs font-sans font-bold hover:bg-[#EAE5DC] transition-all cursor-pointer"
                            title="View Contributing Normalization Metrics"
                          >
                            Breakdown
                          </button>
                          
                          <button
                            onClick={() => handleInspectOnMap(district)}
                            className="px-3.5 py-2 bg-[#D9531E] text-white text-xs font-sans font-bold hover:bg-[#B84314] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Filter Map to District Boundary"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Map</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ))
              )
            ) : (
              /* States Rollup View */
              displayedStates.length === 0 ? (
                <div className="p-12 text-center bg-[#F5F2EB] border border-[#D0C9BE] text-[#78716C]">
                  No states match the search.
                </div>
              ) : (
                displayedStates.map((stateItem) => (
                  <div
                    key={stateItem.state}
                    className="bg-[#F5F2EB] border border-[#D0C9BE] p-4 sm:p-5 transition-all hover:border-[#1E1B18] hover:shadow-xs group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left Block: State Rank, Name, Area, Active Districts */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 shrink-0 flex items-center justify-center font-mono font-extrabold text-sm border ${
                            stateItem.rank === 1
                              ? 'bg-[#D9531E] text-white border-[#D9531E]'
                              : stateItem.rank === 2
                              ? 'bg-[#1E1B18] text-white border-[#1E1B18]'
                              : stateItem.rank === 3
                              ? 'bg-[#5C554E] text-white border-[#5C554E]'
                              : 'bg-white text-[#5C554E] border-[#D0C9BE]'
                          }`}
                        >
                          {stateItem.rank ? `#${stateItem.rank}` : '—'}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B18]">
                              {stateItem.state}
                            </h2>
                            <span className="px-2 py-0.5 bg-white border border-[#D0C9BE] text-[11px] font-mono font-bold text-[#5C554E]">
                              {stateItem.district_count} Monitored Districts
                            </span>
                            {stateItem.dominant_tag === 'INDUSTRIAL_DOMINANT' ? (
                              <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[10px] font-mono font-bold flex items-center gap-1">
                                <Factory className="w-3 h-3 text-[#1E40AF]" />
                                INDUSTRIAL DOMINANT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-mono font-bold flex items-center gap-1">
                                <Leaf className="w-3 h-3 text-[#065F46]" />
                                AGRICULTURAL DOMINANT
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#5C554E] flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                              Total Area:{' '}
                              <strong className="text-[#1E1B18]">
                                {stateItem.total_area_sqkm.toLocaleString()} km²
                              </strong>
                            </span>
                            <span>
                              State Density:{' '}
                              <strong className="text-[#1E1B18]">
                                {stateItem.state_density.toFixed(1)} / 1k km²
                              </strong>
                            </span>
                            <span>
                              Active Sources:{' '}
                              <strong className="text-[#1E1B18]">
                                {stateItem.total_sources}
                              </strong>
                            </span>
                            <span>
                              High/Crit Sources:{' '}
                              <strong className="text-[#DC2626]">
                                {stateItem.high_crit_count}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Score & Action */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#D0C9BE]">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-[#78716C] uppercase font-bold">
                            STATE BENCHMARK
                          </div>
                          <div className="flex items-center gap-2 justify-end mt-0.5">
                            <span
                              className={`text-2xl font-mono font-extrabold px-2.5 py-0.5 border ${getScoreColor(
                                stateItem.benchmark_score
                              )}`}
                            >
                              {stateItem.benchmark_score.toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 justify-end text-xs font-mono mt-1">
                            {stateItem.trend_delta_pct > 0 ? (
                              <span className="text-[#DC2626] font-bold flex items-center gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +{stateItem.trend_delta_pct.toFixed(1)}%
                              </span>
                            ) : stateItem.trend_delta_pct < 0 ? (
                              <span className="text-[#16A34A] font-bold flex items-center gap-0.5">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {stateItem.trend_delta_pct.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-[#78716C] font-bold">±0.0%</span>
                            )}
                            <span className="text-[10px] text-[#78716C]">vs prior</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInspectStateOnMap(stateItem)}
                          className="px-3.5 py-2 bg-[#D9531E] text-white text-xs font-sans font-bold hover:bg-[#B84314] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Map</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

      </div>

      {/* DETAIL BREAKDOWN MODAL / DRAWER */}
      {selectedDistrict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F5F2EB] border border-[#1E1B18] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D0C9BE] pb-4">
              <div>
                <div className="text-xs font-mono font-bold text-[#D9531E] uppercase">
                  TERRITORIAL BENCHMARK DOSSIER
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#1E1B18]">
                  {selectedDistrict.district}, {selectedDistrict.state}
                </h3>
                <p className="text-xs text-[#5C554E] mt-0.5">
                  Spatial Area: {selectedDistrict.area_sqkm.toLocaleString()} km² • Centroid: [
                  {selectedDistrict.centroid[0].toFixed(3)}°N, {selectedDistrict.centroid[1].toFixed(3)}°E]
                </p>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-1.5 border border-[#D0C9BE] bg-white text-[#5C554E] hover:text-[#1E1B18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Component Weights Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Overall Score Card */}
              <div className="bg-white border border-[#D0C9BE] p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase font-bold">
                    COMPOSITE BENCHMARK SCORE
                  </div>
                  <div className="text-4xl font-mono font-extrabold text-[#1E1B18] mt-2">
                    {selectedDistrict.benchmark_score.toFixed(1)}{' '}
                    <span className="text-base text-[#78716C] font-normal">/ 100</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DDD4] mt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#78716C]">Leaderboard Rank:</span>
                  <strong className="text-[#1E1B18]">
                    {selectedDistrict.rank ? `#${selectedDistrict.rank}` : 'Insufficient Data'}
                  </strong>
                </div>
              </div>

              {/* 30-Day Trend Delta Card */}
              <div className="bg-white border border-[#D0C9BE] p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase font-bold">
                    30-DAY TEMPORAL TREND
                  </div>
                  <div className="text-3xl font-mono font-extrabold mt-2">
                    {selectedDistrict.trend_delta_pct !== undefined && selectedDistrict.trend_delta_pct !== null ? (
                      selectedDistrict.trend_delta_pct > 0 ? (
                        <span className="text-[#DC2626] flex items-center gap-1">
                          <TrendingUp className="w-6 h-6" />
                          +{selectedDistrict.trend_delta_pct.toFixed(1)}%
                        </span>
                      ) : selectedDistrict.trend_delta_pct < 0 ? (
                        <span className="text-[#16A34A] flex items-center gap-1">
                          <TrendingDown className="w-6 h-6" />
                          {selectedDistrict.trend_delta_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[#78716C]">±0.0%</span>
                      )
                    ) : (
                      <span className="text-sm font-sans text-[#78716C]">No prior cycle data</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DDD4] mt-3 text-[11px] text-[#5C554E]">
                  Compared against prior 30-day window ({districtData?.window_prior || '2026-07-01 to 2026-07-30'})
                </div>
              </div>

            </div>

            {/* Contributing Metrics Breakdown (Normalized Percentiles) */}
            <div className="space-y-3 bg-white border border-[#D0C9BE] p-4">
              <div className="text-xs font-mono font-bold text-[#1E1B18] uppercase tracking-wider">
                NORMALIZED COMPONENT METRICS (WEIGHTED DECOMPOSITION)
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. Spatial Density (30%) */}
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-[#5C554E]">
                      Spatial Source Density (Weight: 30%):{' '}
                      <strong>{selectedDistrict.source_density.toFixed(1)} / 1k km²</strong>
                    </span>
                    <strong className="text-[#1E1B18]">
                      {(selectedDistrict.density_percentile ?? 50).toFixed(0)}th percentile
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-[#E2DDD4]">
                    <div
                      className="h-2 bg-[#D9531E]"
                      style={{ width: `${Math.min(100, selectedDistrict.density_percentile ?? 50)}%` }}
                    />
                  </div>
                </div>

                {/* 2. Risk Score Percentile (30%) */}
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-[#5C554E]">
                      Cross-District Risk Rank (Weight: 30%):{' '}
                      <strong>Avg {selectedDistrict.avg_risk_score.toFixed(1)} / 100</strong>
                    </span>
                    <strong className="text-[#1E1B18]">
                      {(selectedDistrict.risk_percentile ?? 50).toFixed(0)}th percentile
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-[#E2DDD4]">
                    <div
                      className="h-2 bg-[#1E3A8A]"
                      style={{ width: `${Math.min(100, selectedDistrict.risk_percentile ?? 50)}%` }}
                    />
                  </div>
                </div>

                {/* 3. High/Critical Severity Share (25%) */}
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-[#5C554E]">
                      High / Critical Severity Share (Weight: 25%):{' '}
                      <strong>
                        {selectedDistrict.high_crit_count} / {selectedDistrict.total_sources} sources
                      </strong>
                    </span>
                    <strong className="text-[#1E1B18]">
                      {selectedDistrict.high_crit_share.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-[#E2DDD4]">
                    <div
                      className="h-2 bg-[#DC2626]"
                      style={{ width: `${Math.min(100, selectedDistrict.high_crit_share)}%` }}
                    />
                  </div>
                </div>

                {/* 4. Peak FRP Intensity (15%) */}
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-[#5C554E]">
                      Peak Fire Radiative Power (Weight: 15%):{' '}
                      <strong>{selectedDistrict.peak_frp.toFixed(1)} MW</strong> (Mean: {selectedDistrict.mean_frp.toFixed(1)} MW)
                    </span>
                    <strong className="text-[#1E1B18]">
                      {(selectedDistrict.peak_frp_percentile ?? 50).toFixed(0)}th percentile
                    </strong>
                  </div>
                  <div className="w-full h-2 bg-[#E2DDD4]">
                    <div
                      className="h-2 bg-[#D97706]"
                      style={{ width: `${Math.min(100, selectedDistrict.peak_frp_percentile ?? 50)}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Classification Mix */}
            <div className="bg-white border border-[#D0C9BE] p-4 space-y-3">
              <div className="text-xs font-mono font-bold text-[#1E1B18] uppercase tracking-wider">
                THERMAL CLASSIFICATION DISTRIBUTION IN {selectedDistrict.district}
              </div>
              <div className="space-y-1.5 text-xs">
                {Object.entries(selectedDistrict.classification_counts || {}).map(([cls, count]) => {
                  const pct = ((count / selectedDistrict.total_sources) * 100).toFixed(0);
                  const isInd =
                    cls.includes('Industrial') || cls.includes('Gas Flare') || cls.includes('Mining');
                  return (
                    <div key={cls} className="flex items-center justify-between font-mono py-1 border-b border-[#F5F2EB]">
                      <span className="flex items-center gap-1.5">
                        {isInd ? (
                          <Factory className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        ) : (
                          <Leaf className="w-3.5 h-3.5 text-[#16A34A]" />
                        )}
                        <span className="text-[#1E1B18]">{cls}</span>
                      </span>
                      <span className="font-bold text-[#5C554E]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 border border-[#D0C9BE] bg-white text-xs font-sans font-bold text-[#5C554E] hover:text-[#1E1B18] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseDetail();
                  handleInspectOnMap(selectedDistrict);
                }}
                className="px-5 py-2 bg-[#D9531E] text-white text-xs font-sans font-bold hover:bg-[#B84314] flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                Inspect All Sources on Map
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BenchmarksPage;
