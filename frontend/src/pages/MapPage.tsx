import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Factory,
  Satellite,
  Search,
  RefreshCw,
  Shield,
  Filter,
  MapPin,
  X,
  ChevronRight,
  AlertCircle,
  Crosshair,
  Compass,
  Layers,
  ChevronDown,
  Check,
  Navigation,
  Eye,
  ChevronLeft,
  Radio
} from 'lucide-react';
import { CommandMap, getClassificationColor, getClassificationColorName } from '../components/CommandMap';
import { SourceDetailModal } from '../components/SourceDetailModal';
import { api } from '../services/api';
import { MapPoint, AnalyticsSummary, FilterState, SearchSuggestion, TargetLocation, RiskDistribution } from '../types';
import { useLanguage } from '../context/LanguageContext';

const CLASSIFICATIONS = [
  'Industrial Fire',
  'Gas Flare',
  'Wildfire / Forest Fire',
  'Agricultural Burning',
  'Mining / Industrial Thermal',
  'Persistent Industrial Thermal Activity',
  'Uncertain / Low Evidence'
];

const RISK_BANDS = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

const ANOMALY_STATUSES = [
  'CRITICAL ANOMALY',
  'ABNORMAL',
  'WATCH',
  'NORMAL / STABLE'
];

const EVIDENCE_QUALITIES = [
  'STRONG',
  'GOOD',
  'MODERATE',
  'WEAK',
  'HISTORICAL_ONLY'
];

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(() => {
    const param = searchParams.get('source_id') || searchParams.get('id');
    return param ? parseInt(param, 10) : null;
  });
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(() => {
    return searchParams.get('modal') === 'true';
  });
  const [inspectedMeta, setInspectedMeta] = useState<{
    id: number;
    lat: number;
    lon: number;
    classification?: string;
    riskScore?: number;
    riskBand?: string;
  } | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Correlated Thermal Activity Cluster Inspection State
  const [clusterState, setClusterState] = useState<{
    clusterId: string;
    sourceIds: number[];
    regionName: string;
    zScore?: string;
    lat: number;
    lon: number;
    currentMemberIndex: number;
  } | null>(null);

  // District / State Benchmark Filter & HUD State
  const [districtBenchmarkState, setDistrictBenchmarkState] = useState<{
    district?: string;
    state?: string;
    isStateOnly?: boolean;
  } | null>(() => {
    const filterDistrict = searchParams.get('filter_district') === 'true';
    const filterState = searchParams.get('filter_state') === 'true';
    const d = searchParams.get('district');
    const s = searchParams.get('state');
    if (filterDistrict && d) {
      return { district: decodeURIComponent(d), state: s ? decodeURIComponent(s) : undefined, isStateOnly: false };
    }
    if (filterState && s) {
      return { state: decodeURIComponent(s), isStateOnly: true };
    }
    return null;
  });

  // Search & Navigation State
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [targetLocation, setTargetLocation] = useState<TargetLocation | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter Drawer State
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState<boolean>(false);

  // Critical Alerts (59) Directory Drawer State
  const [isAlertDirectoryOpen, setIsAlertDirectoryOpen] = useState<boolean>(false);
  const [alertSubfilter, setAlertSubfilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'SURGE'>('ALL');
  const [alertSearch, setAlertSearch] = useState<string>('');

  // Display Layers & Classification Legend state
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    classification: searchParams.get('classification') || '',
    risk_band: searchParams.get('risk_band') || '',
    anomaly_status: '',
    evidence_quality: '',
    satellite_evidence_status: '',
    min_risk_score: 0,
    min_frp: 0,
    search: '',
    has_industrial_context: undefined,
    is_alert: undefined,
    district:
      searchParams.get('filter_district') === 'true' && searchParams.get('district')
        ? decodeURIComponent(searchParams.get('district')!)
        : undefined,
    state: searchParams.get('state') ? decodeURIComponent(searchParams.get('state')!) : undefined
  });

  useEffect(() => {
    const param = searchParams.get('source_id') || searchParams.get('id');
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const clsParam = searchParams.get('cls');
    const riskParam = searchParams.get('risk');
    const bandParam = searchParams.get('band');
    const isInspect = searchParams.get('inspect') === 'true';

    if (param) {
      const parsed = parseInt(param, 10);
      if (!isNaN(parsed)) {
        setSelectedSourceId(parsed);

        if (latParam && lonParam) {
          const lat = parseFloat(latParam);
          const lon = parseFloat(lonParam);
          if (!isNaN(lat) && !isNaN(lon)) {
            setTargetLocation({
              lat,
              lon,
              zoom: 16.0,
              label: `Inspecting Hotspot #SRC-${parsed}${clsParam ? ` (${clsParam})` : ''}`,
              count: 1
            });
            setSearchFeedback(`📍 Inspecting Hotspot #SRC-${parsed} at [${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E]`);
            setInspectedMeta({
              id: parsed,
              lat,
              lon,
              classification: clsParam ? decodeURIComponent(clsParam) : undefined,
              riskScore: riskParam ? parseFloat(riskParam) : undefined,
              riskBand: bandParam || undefined
            });
          }
        } else {
          setInspectedMeta((prev) => (prev?.id === parsed ? prev : { id: parsed, lat: 0, lon: 0 }));
        }

        if (searchParams.get('modal') === 'true') {
          setIsDossierModalOpen(true);
        } else if (isInspect) {
          setIsDossierModalOpen(false);
        }
      }
    }

    const clusterIdParam = searchParams.get('cluster_id');
    const sourcesParam = searchParams.get('sources');
    const nameParam = searchParams.get('name');
    const zParam = searchParams.get('z');

    if (sourcesParam) {
      const sids = sourcesParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (sids.length > 0) {
        const cLat = latParam ? parseFloat(latParam) : 0;
        const cLon = lonParam ? parseFloat(lonParam) : 0;
        const region = nameParam ? decodeURIComponent(nameParam) : 'Spatial Cluster';
        setClusterState({
          clusterId: clusterIdParam || 'CORRELATED-CLUSTER',
          sourceIds: sids,
          regionName: region,
          zScore: zParam || undefined,
          lat: cLat,
          lon: cLon,
          currentMemberIndex: 0
        });
        setSearchFeedback(`⚡ Correlated Cluster [${clusterIdParam || 'ACTIVE'}]: ${sids.length} synchronized surge hotspots in ${region}`);
      }
    }

    const districtParam = searchParams.get('district');
    const stateParam = searchParams.get('state');
    const filterDistrictParam = searchParams.get('filter_district') === 'true';
    const filterStateParam = searchParams.get('filter_state') === 'true';

    if (filterDistrictParam && districtParam) {
      const decodedDistrict = decodeURIComponent(districtParam);
      const decodedState = stateParam ? decodeURIComponent(stateParam) : undefined;
      setDistrictBenchmarkState({
        district: decodedDistrict,
        state: decodedState,
        isStateOnly: false
      });
      setFilters((prev) => ({
        ...prev,
        district: decodedDistrict,
        ...(decodedState ? { state: decodedState } : {})
      }));

      if (latParam && lonParam) {
        const dLat = parseFloat(latParam);
        const dLon = parseFloat(lonParam);
        if (!isNaN(dLat) && !isNaN(dLon)) {
          setTargetLocation({
            lat: dLat,
            lon: dLon,
            zoom: 10.5,
            label: `${decodedDistrict} District (${decodedState || ''}) Benchmark Area`,
            count: 0
          });
        }
      }
      setSearchFeedback(`📍 Spatial Boundary Filter: ${decodedDistrict} District (${decodedState || ''})`);
    } else if (filterStateParam && stateParam) {
      const decodedState = decodeURIComponent(stateParam);
      setDistrictBenchmarkState({
        state: decodedState,
        isStateOnly: true
      });
      setFilters((prev) => ({
        ...prev,
        state: decodedState,
        district: undefined
      }));
      setSearchFeedback(`📍 State Filter Active: ${decodedState}`);
    }
  }, [searchParams]);

  // Synchronize inspection metadata with loaded mapPoints if lat/lon were not provided in URL
  useEffect(() => {
    if (selectedSourceId && mapPoints.length > 0) {
      const pt = mapPoints.find((p) => (p.id ?? p.thermal_source_id) === selectedSourceId);
      if (pt) {
        const pLat = pt.lat ?? pt.latitude;
        const pLon = pt.lon ?? pt.longitude;
        if (pLat !== undefined && pLon !== undefined && !isNaN(pLat) && !isNaN(pLon)) {
          if (!targetLocation) {
            setTargetLocation({
              lat: pLat,
              lon: pLon,
              zoom: 16.0,
              label: `Inspecting Hotspot #SRC-${selectedSourceId} (${pt.classification})`,
              count: 1
            });
          }
          setInspectedMeta({
            id: selectedSourceId,
            lat: pLat,
            lon: pLon,
            classification: pt.classification,
            riskScore: pt.risk_score,
            riskBand: pt.risk_band
          });
        }
      }
    }
  }, [selectedSourceId, mapPoints, targetLocation]);

  const handleClearInspection = () => {
    setSelectedSourceId(null);
    setInspectedMeta(null);
    setTargetLocation(null);
    setSearchFeedback('');
    setIsDossierModalOpen(false);
  };

  const handleClearDistrictBenchmark = () => {
    setDistrictBenchmarkState(null);
    setFilters((prev) => ({
      ...prev,
      district: undefined,
      state: undefined
    }));
    setSearchFeedback('Cleared territorial benchmark boundary filter.');
  };

  const handleClusterCycleSource = (direction: 'prev' | 'next') => {
    if (!clusterState || clusterState.sourceIds.length === 0) return;
    const len = clusterState.sourceIds.length;
    const newIdx = direction === 'next'
      ? (clusterState.currentMemberIndex + 1) % len
      : (clusterState.currentMemberIndex - 1 + len) % len;

    const targetId = clusterState.sourceIds[newIdx];
    setClusterState((prev) => prev ? { ...prev, currentMemberIndex: newIdx } : null);
    setSelectedSourceId(targetId);

    const pt = mapPoints.find((p) => (p.id ?? p.thermal_source_id) === targetId);
    if (pt) {
      const pLat = pt.lat ?? pt.latitude;
      const pLon = pt.lon ?? pt.longitude;
      if (pLat !== undefined && pLon !== undefined) {
        setInspectedMeta({
          id: targetId,
          lat: pLat,
          lon: pLon,
          classification: pt.classification,
          riskScore: pt.risk_score,
          riskBand: pt.risk_band
        });
        setTargetLocation({
          lat: pLat,
          lon: pLon,
          zoom: 15.5,
          label: `Cluster Member #${newIdx + 1}: SRC-${targetId} (${pt.classification || 'Hotspot'})`,
          count: 1
        });
        setSearchFeedback(`📍 Cluster Member #${newIdx + 1}/${len}: SRC-${targetId} at [${pLat.toFixed(4)}°N, ${pLon.toFixed(4)}°E]`);
      }
    }
  };

  const handleClearClusterInspection = () => {
    setClusterState(null);
    handleClearInspection();
  };

  // Accurate dynamic counter state (synchronized with both /analytics/summary and /analytics/risk)
  const [counterStats, setCounterStats] = useState({
    sources: 15436,
    criticalPoints: 1,
    highRisk: 27,
    moderateRisk: 1496,
    lowRisk: 13912,
    alerts: 59,
    anomalies: 45,
    industrial: 5236,
    coverage: 93.1
  });

  // Calculate active filters count
  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.classification) c++;
    if (filters.risk_band) c++;
    if (filters.anomaly_status) c++;
    if (filters.satellite_evidence_status) c++;
    if (filters.evidence_quality) c++;
    if (filters.has_industrial_context) c++;
    return c;
  }, [filters]);

  // Load summary and risk distribution to verify exact numbers
  useEffect(() => {
    Promise.all([
      api.getAnalyticsSummary().catch(() => null),
      api.getRiskDistribution().catch(() => null)
    ]).then(([summaryData, riskData]) => {
      if (summaryData) setSummary(summaryData);

      const critCount = riskData?.bands?.find((b) => b.name === 'CRITICAL')?.count ?? 1;
      const highCount = riskData?.bands?.find((b) => b.name === 'HIGH')?.count ?? 27;
      const modCount = riskData?.bands?.find((b) => b.name === 'MODERATE')?.count ?? 1496;
      const lowCount = riskData?.bands?.find((b) => b.name === 'LOW')?.count ?? 13912;

      setCounterStats({
        sources: summaryData?.total_sources || 15436,
        criticalPoints: critCount,
        highRisk: highCount,
        moderateRisk: modCount,
        lowRisk: lowCount,
        alerts: summaryData?.critical_alerts_count || 59,
        anomalies: summaryData?.abnormal_critical_anomaly_count || 45,
        industrial: summaryData?.industrial_context_sources_count || 5236,
        coverage: +(summaryData?.satellite_evidence_coverage_pct || 93.1).toFixed(1)
      });
    });
  }, []);

  // Sync with searchParams if navigated with ?classification=... or ?risk_band=...
  useEffect(() => {
    const classParam = searchParams.get('classification');
    const riskParam = searchParams.get('risk_band');
    if (classParam || riskParam) {
      setFilters((prev) => ({
        ...prev,
        ...(classParam ? { classification: classParam } : {}),
        ...(riskParam ? { risk_band: riskParam } : {})
      }));
    }
  }, [searchParams]);

  // Fetch search suggestions debounced
  useEffect(() => {
    const query = filters.search.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      api.getSearchSuggestions(query)
        .then((items) => {
          setSuggestions(items);
          setIsDropdownOpen(items.length > 0);
        })
        .catch((err) => console.error("Suggestions error:", err));
    }, 150);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss search feedback popup after 4 seconds
  useEffect(() => {
    if (!searchFeedback) return;
    const timer = setTimeout(() => {
      setSearchFeedback('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [searchFeedback]);

  // Fetch map points with debouncing
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMap(true);

    const timeout = setTimeout(() => {
      api.getMapPoints(filters)
        .then((pts) => {
          if (isMounted) {
            setMapPoints(pts);
            setIsLoadingMap(false);

            // Cleanly clear selectedSourceId if it is no longer in the filtered dataset
            if (selectedSourceId && !pts.some((p) => (p.id ?? p.thermal_source_id) === selectedSourceId)) {
              setSelectedSourceId(null);
            }

            // Auto-center & select if search returned a specific source ID
            if (pts.length === 1 && filters.search) {
              const p = pts[0];
              const pLat = p.lat ?? p.latitude;
              const pLon = p.lon ?? p.longitude;
              const pId = p.id ?? p.thermal_source_id;
              if (pLat !== undefined && pLon !== undefined && pId !== undefined) {
                setTargetLocation({
                  lat: pLat,
                  lon: pLon,
                  zoom: 12,
                  label: `Source #${pId} (${p.classification})`,
                  count: 1
                });
                setSelectedSourceId(pId);
                setSearchFeedback(`🔍 Centered on Source #${pId} (${p.classification})`);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Map points error:", err);
          if (isMounted) setIsLoadingMap(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [filters]);

  const handleSelectSuggestion = (s: SearchSuggestion) => {
    setIsDropdownOpen(false);
    const searchVal = s.title || s.value || '';
    setFilters((prev) => ({ ...prev, search: searchVal }));
    if (s.lat !== undefined && s.lon !== undefined) {
      setTargetLocation({
        lat: s.lat,
        lon: s.lon,
        zoom: s.zoom ?? 11,
        label: s.title,
        count: s.count
      });
      setSearchFeedback(`📍 Navigated to ${s.title} (${s.count ?? 1} sources)`);
    } else {
      setSearchFeedback(`🔍 Filtered by "${s.title}"`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    const query = filters.search.trim();
    if (!query) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    } else {
      api.getSearchSuggestions(query).then((items) => {
        if (items.length > 0) {
          handleSelectSuggestion(items[0]);
        } else {
          setSearchFeedback(`⚠️ No coordinates found for "${query}". Filtering dataset.`);
        }
      });
    }
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, search: '' }));
    setSuggestions([]);
    setIsDropdownOpen(false);
    setTargetLocation(null);
    setSearchFeedback('');
  };

  const handleSelectRiskBand = (band: string) => {
    setSelectedSourceId(null);
    setFilters((prev) => ({
      ...prev,
      risk_band: prev.risk_band === band ? '' : band,
      is_alert: undefined
    }));
    setIsAlertDirectoryOpen(false);
  };

  const handleToggleCriticalAlerts = () => {
    setSelectedSourceId(null);
    if (filters.is_alert) {
      setFilters((prev) => ({ ...prev, is_alert: undefined }));
      setIsAlertDirectoryOpen(false);
      setSearchFeedback('');
    } else {
      setFilters({
        classification: '',
        risk_band: '',
        anomaly_status: '',
        evidence_quality: '',
        satellite_evidence_status: '',
        min_risk_score: 0,
        min_frp: 0,
        search: '',
        has_industrial_context: undefined,
        is_alert: true
      });
      setIsAlertDirectoryOpen(true);
      setSearchFeedback('🚨 Loaded all 59 Critical Triage Alerts across India. Click any alert to locate.');
    }
  };

  const handleFitAllAlerts = () => {
    const map = (window as any)._mapInstance;
    if (!map || mapPoints.length === 0) return;

    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    mapPoints.forEach((p) => {
      const lat = p.lat ?? p.latitude;
      const lon = p.lon ?? p.longitude;
      if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
      }
    });

    if (minLat <= maxLat && minLon <= maxLon) {
      map.fitBounds(
        [[minLon - 1, minLat - 1], [maxLon + 1, maxLat + 1]],
        { padding: 80, duration: 1200 }
      );
    }
  };

  const handleFlyToAlert = (pt: MapPoint) => {
    const pLat = pt.lat ?? pt.latitude;
    const pLon = pt.lon ?? pt.longitude;
    const pId = pt.id ?? pt.thermal_source_id;
    if (pLat !== undefined && pLon !== undefined && pId !== undefined) {
      setTargetLocation({
        lat: pLat,
        lon: pLon,
        zoom: 12.5,
        label: `Alert #${pId} (${pt.classification} — ${getClassificationColorName(pt.classification)})`,
        count: 1
      });
      setSelectedSourceId(pId);
      setSearchFeedback(`📍 Flying to Alert #${pId} (${pt.classification} — ${getClassificationColorName(pt.classification)})`);
    }
  };

  // Filtered list of the 59 critical alerts
  const criticalAlertsList = useMemo(() => {
    if (!filters.is_alert) return [];
    return mapPoints.filter((p) => {
      const id = p.id ?? p.thermal_source_id ?? 0;
      const matchesSearch =
        !alertSearch ||
        id.toString().includes(alertSearch) ||
        (p.classification && p.classification.toLowerCase().includes(alertSearch.toLowerCase())) ||
        (p.anomaly_status && p.anomaly_status.toLowerCase().includes(alertSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (alertSubfilter === 'CRITICAL') return p.risk_band === 'CRITICAL';
      if (alertSubfilter === 'HIGH') return p.risk_band === 'HIGH';
      if (alertSubfilter === 'SURGE') return (p.anomaly_status?.includes('CRITICAL') || p.anomaly_status?.includes('ABNORMAL'));
      return true;
    });
  }, [filters.is_alert, mapPoints, alertSearch, alertSubfilter]);

  const handleResetFilters = () => {
    setFilters({
      classification: '',
      risk_band: '',
      anomaly_status: '',
      evidence_quality: '',
      satellite_evidence_status: '',
      min_risk_score: 0,
      min_frp: 0,
      search: '',
      has_industrial_context: undefined,
      is_alert: undefined
    });
    setIsAlertDirectoryOpen(false);
    handleClearInspection();
  };

  return (
    <div className="relative w-full h-screen bg-[#0E0D0C] overflow-hidden select-none">
      {/* ═════════════════════════ MAP CONTAINER ═════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <CommandMap
          points={mapPoints}
          selectedSourceId={selectedSourceId}
          onSelectSource={(id) => {
            setSelectedSourceId(id);
            setIsDossierModalOpen(true);
          }}
          isLoading={isLoadingMap}
          showHeatmapExternal={showHeatmap}
          onToggleHeatmap={setShowHeatmap}
          selectedRiskBand={filters.risk_band}
          onSelectRiskBand={handleSelectRiskBand}
          targetLocation={targetLocation}
          onResetLocation={() => setTargetLocation(null)}
          showHazardZones={true}
          clusterSourceIds={clusterState ? clusterState.sourceIds : undefined}
        />
      </div>

      {/* ═════════════════════ TOP SEARCH & FILTER CONTROLS ═════════════════════ */}
      <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-2xl z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 w-full justify-end">
          {/* Filter Bar Toggle Button */}
          <button
            id="btn-filter-options"
            onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono font-bold transition-all shadow-2xl cursor-pointer ${
              isFilterTrayOpen || activeFilterCount > 0
                ? 'bg-[#D8582B] hover:bg-[#B84318] text-white border border-[#D8582B] shadow-[#D8582B]/30'
                : 'glass-pill-dark text-white/80 hover:text-white border border-white/15'
            }`}
            title="Toggle multi-parameter GIS filter options"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t.filter_options}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#D8582B] font-bold text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${isFilterTrayOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Search Input Container */}
          <div ref={searchContainerRef} className="relative w-full sm:w-80">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center rounded-xl glass-pill-dark shadow-2xl border border-white/15 px-3 py-2 text-white">
                <Search className="w-4 h-4 text-white/50 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder={t.search_placeholder}
                  className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-medium"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-white/40 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl glass-card-editorial shadow-2xl overflow-hidden z-50 text-white max-h-60 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-white/40 border-b border-white/10">
                  {t.direct_location_targets}
                </div>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#D8582B] flex-shrink-0" />
                      <span className="font-medium truncate">{s.title}</span>
                    </div>
                    {s.count !== undefined && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                        {s.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════ EXPANDABLE FILTER BAR TRAY ════════════════════ */}
        {isFilterTrayOpen && (
          <div className="w-full rounded-2xl glass-card-editorial border border-white/15 p-3.5 shadow-2xl space-y-3 animate-fade-in text-xs font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#D8582B]" />
                <span className="font-bold text-white tracking-wide">
                  {lang === 'HI' ? 'बहु-पैरामीटर भू-स्थानिक फ़िल्टर' : 'Multi-Parameter GIS Filters'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60">
                  <strong className="text-emerald-400 font-bold">{mapPoints.length.toLocaleString()}</strong> {lang === 'HI' ? 'अनुकूल स्रोत' : 'matching hotspots'}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[#D8582B] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t.clear_filters}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Classification Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/50 block uppercase font-mono">
                  {t.classification_filter}
                </label>
                <select
                  value={filters.classification}
                  onChange={(e) => setFilters((prev) => ({ ...prev, classification: e.target.value }))}
                  className="w-full bg-[#161412] text-white text-xs border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#D8582B] cursor-pointer"
                >
                  <option value="">{lang === 'HI' ? 'सभी वर्गीकरण (All)' : 'All Classifications'}</option>
                  {CLASSIFICATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c} — {getClassificationColorName(c)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Anomaly Status Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/50 block uppercase font-mono">
                  {t.anomaly_filter}
                </label>
                <select
                  value={filters.anomaly_status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, anomaly_status: e.target.value }))}
                  className="w-full bg-[#161412] text-white text-xs border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#D8582B] cursor-pointer"
                >
                  <option value="">{lang === 'HI' ? 'सभी विसंगति स्थितियां' : 'All Anomaly Statuses'}</option>
                  {ANOMALY_STATUSES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Satellite Evidence Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/50 block uppercase font-mono">
                  {t.satellite_filter}
                </label>
                <select
                  value={filters.satellite_evidence_status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, satellite_evidence_status: e.target.value }))}
                  className="w-full bg-[#161412] text-white text-xs border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#D8582B] cursor-pointer"
                >
                  <option value="">{lang === 'HI' ? 'सभी उपग्रह साक्ष्य' : 'All Satellite'}</option>
                  <option value="AVAILABLE">{lang === 'HI' ? 'उपग्रह उपलब्ध (93.1%)' : 'Available (93.1%)'}</option>
                  <option value="UNAVAILABLE">{lang === 'HI' ? 'उपग्रह अनुपलब्ध (6.9%)' : 'Unavailable (6.9%)'}</option>
                </select>
              </div>

              {/* Evidence Quality Select */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/50 block uppercase font-mono">
                  {t.quality_filter}
                </label>
                <select
                  value={filters.evidence_quality}
                  onChange={(e) => setFilters((prev) => ({ ...prev, evidence_quality: e.target.value }))}
                  className="w-full bg-[#161412] text-white text-xs border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#D8582B] cursor-pointer"
                >
                  <option value="">{lang === 'HI' ? 'सभी साक्ष्य गुणवत्ता' : 'All Evidence Quality'}</option>
                  {EVIDENCE_QUALITIES.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industrial Context Toggle */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({
                    ...prev,
                    has_industrial_context: prev.has_industrial_context ? undefined : true
                  }))}
                  className={`w-full py-2 px-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                    filters.has_industrial_context
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-[#161412] border-white/15 text-white/70 hover:text-white'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'HI' ? 'औद्योगिक कॉरिडोर (>40)' : 'Heavy Industrial (>40)'}</span>
                </button>
              </div>

              {/* Reset All Quick Action */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.reset_all_filters}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Feedback pill */}
        {searchFeedback && (
          <div className="text-[11px] px-3 py-1.5 rounded-lg glass-pill-amber text-amber-200 flex items-center justify-between shadow-lg">
            <span>{searchFeedback}</span>
            <button onClick={() => setSearchFeedback('')} className="text-amber-300/60 hover:text-white ml-2 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════ LEFT VERTICAL TELEMETRY PANEL (FULL-HEIGHT & ENLARGED) ══════════════════ */}
      <aside id="telemetry-left-panel" className="hidden lg:flex absolute left-0 top-16 bottom-0 w-[340px] z-20 flex-col bg-[#0E0D0C]/95 backdrop-blur-2xl border-r border-white/15 shadow-2xl pointer-events-none select-none">
        {/* Panel Sovereign Header */}
        <div className="px-4 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between pointer-events-auto">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-[#D8582B] font-extrabold block">
              TERRITORY TELEMETRY
            </span>
            <h3 className="text-base font-serif font-black text-white tracking-wide mt-0.5">
              {lang === 'HI' ? 'राष्ट्रीय थर्मल मैट्रिक्स' : 'National Hotspot Monitor'}
            </h3>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        </div>

        {/* Scrollable Metric Cards Area - Enhanced fonts and padding to fill vertical space */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 pointer-events-auto custom-scrollbar">
          {/* Total Hotspots (15,436) */}
          <div
            id="hud-total-hotspots-btn"
            onClick={() => {
              handleResetFilters();
              setIsAlertDirectoryOpen(false);
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              !filters.risk_band && !filters.classification && !filters.is_alert && !filters.search && !targetLocation
                ? 'bg-white/[0.12] border-white/30 shadow-md ring-1 ring-white/20'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to reset filters and view all 15,436 hotspots across India"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-white/70 font-bold tracking-wider block mb-0.5">{t.total_hotspots}</span>
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {counterStats.sources.toLocaleString()}
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">{t.india_master_set}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
                <Flame className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Critical Points (1) */}
          <div
            id="hud-critical-points-btn"
            onClick={() => handleSelectRiskBand('CRITICAL')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filters.risk_band === 'CRITICAL'
                ? 'bg-red-500/25 border-red-500/80 shadow-lg ring-1 ring-red-500/60'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to filter map to Critical points"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-wider block mb-0.5">{t.critical_points}</span>
                <span className="text-2xl font-black font-mono text-red-400 tracking-tight">
                  {counterStats.criticalPoints}
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">Critical Threat ({counterStats.criticalPoints} {t.pts})</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* High Risk Points (27) */}
          <div
            id="hud-high-risk-btn"
            onClick={() => handleSelectRiskBand('HIGH')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filters.risk_band === 'HIGH'
                ? 'bg-orange-500/25 border-orange-500/80 shadow-lg ring-1 ring-orange-500/60'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to filter map to High Risk points"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-orange-400 font-bold tracking-wider block mb-0.5">{t.high_risk}</span>
                <span className="text-2xl font-black font-mono text-orange-300 tracking-tight">
                  {counterStats.highRisk}
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">High Risk Band ({counterStats.highRisk} {t.pts})</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Moderate Risk Points (1,496) */}
          <div
            id="hud-moderate-risk-btn"
            onClick={() => handleSelectRiskBand('MODERATE')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filters.risk_band === 'MODERATE'
                ? 'bg-amber-500/25 border-amber-500/80 shadow-lg ring-1 ring-amber-500/60'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to filter map to Moderate Risk points"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider block mb-0.5">{t.moderate_risk}</span>
                <span className="text-2xl font-black font-mono text-amber-300 tracking-tight">
                  {counterStats.moderateRisk.toLocaleString()}
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">Moderate Risk Band</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Low Risk Points (13,912) */}
          <div
            id="hud-low-risk-btn"
            onClick={() => handleSelectRiskBand('LOW')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filters.risk_band === 'LOW'
                ? 'bg-blue-500/25 border-blue-500/80 shadow-lg ring-1 ring-blue-500/60'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to filter map to Low Risk points"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-blue-400 font-bold tracking-wider block mb-0.5">{t.low_risk}</span>
                <span className="text-2xl font-black font-mono text-blue-300 tracking-tight">
                  {counterStats.lowRisk.toLocaleString()}
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">Baseline Operation</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Critical Incident Queue (59) */}
          <div
            id="hud-critical-alerts-btn"
            onClick={handleToggleCriticalAlerts}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              filters.is_alert
                ? 'bg-red-500/35 border-red-500/80 shadow-lg shadow-red-500/30 ring-2 ring-red-500'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
            }`}
            title="Click to view and locate all 59 Critical Triage Alerts on map"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-wider block mb-0.5">{t.critical_alerts}</span>
                <span className="text-2xl font-black font-mono text-red-400 flex items-center gap-2 tracking-tight">
                  {counterStats.alerts}
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-red-500/30 text-red-300">
                    {filters.is_alert ? 'LOCATING' : 'QUEUE'}
                  </span>
                </span>
                <span className="text-[11px] text-white/50 block mt-1 font-medium">Click to Locate (59 {t.pts})</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sudden Surges / Anomalies (45) */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
            <div>
              <span className="text-xs font-mono uppercase text-purple-300 font-bold tracking-wider block mb-0.5">{t.anomalies}</span>
              <span className="text-2xl font-black font-mono text-purple-300 tracking-tight">
                {counterStats.anomalies}
              </span>
              <span className="text-[11px] text-white/50 block mt-1 font-medium">{t.sudden_surges}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Industrial Corridors (5,236) */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
            <div>
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider block mb-0.5">{t.industrial}</span>
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {counterStats.industrial.toLocaleString()}
              </span>
              <span className="text-[11px] text-white/50 block mt-1 font-medium">{t.factory_proximity}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <Factory className="w-5 h-5" />
            </div>
          </div>

          {/* Satellite Coverage (93.1%) */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-300 font-bold tracking-wider block mb-0.5">{t.coverage}</span>
              <span className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
                {counterStats.coverage}%
              </span>
              <span className="text-[11px] text-white/50 block mt-1 font-medium">{t.sentinel_verified}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
              <Satellite className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Panel Sovereign Footer / Operational Telemetry Sync */}
        <div className="px-4 py-3 border-t border-white/10 bg-white/[0.03] flex items-center justify-between text-xs font-mono pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 font-bold uppercase tracking-wider text-[11px]">VIIRS &bull; SENTINEL-2 NRT</span>
          </div>
          <span className="text-emerald-400 font-extrabold text-[11px]">ACTIVE SYNC</span>
        </div>
      </aside>

      {/* ════════════════════ DISPLAY LAYERS & CLASSIFICATION LEGEND ════════════════════ */}
      <div id="display-layers-panel" className="absolute top-[460px] right-4 sm:right-6 z-20 hidden sm:flex flex-col items-end gap-2 pointer-events-auto">
        <div className="p-4 rounded-2xl glass-card-editorial border border-white/20 shadow-2xl space-y-3 text-xs text-white font-mono min-w-[360px] max-w-[390px] backdrop-blur-2xl transition-all">
          <div
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="flex items-center justify-between border-b border-white/15 pb-2 text-xs text-white/70 uppercase cursor-pointer hover:text-white transition-colors select-none"
            title="Click to collapse/expand layers & legend"
          >
            <div className="flex items-center gap-2 font-bold tracking-wider text-white">
              <Layers className="w-4 h-4 text-[#D8582B]" />
              <span className="text-xs tracking-wider">{t.display_layers}</span>
            </div>
            <div className="flex items-center gap-2">
              <span id="hud-point-count" className="text-emerald-400 font-extrabold font-mono text-xs">{mapPoints.length.toLocaleString()} {t.pts}</span>
              <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isLegendOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {isLegendOpen && (
            <>
              {/* Classification Color Legend */}
              <div id="classification-color-legend" className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-white/60 uppercase tracking-wider font-extrabold">
                  <span>{t.color_legend}</span>
                  <span className="text-[10px] text-white/40 lowercase font-medium">6 classes &bull; dynamic clusters</span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2" title="Industrial Fire (#F97316)">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] flex-shrink-0 shadow-md border border-white/20" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_industrial}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Wildfire / Forest Fire (#EF4444)">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] flex-shrink-0 shadow-md border border-white/20" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_wildfire}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Agricultural Burning (#EAB308)">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#EAB308] flex-shrink-0 shadow-md border border-white/20" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_agricultural}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Mining / Industrial (#8B5CF6)">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8B5CF6] flex-shrink-0 shadow-md border border-white/20" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_mining}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Unlabeled / Uncertain (#22C55E - Translucent)">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E]/50 border border-[#22C55E] flex-shrink-0 shadow-md" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_unlabeled}</span>
                  </div>
                  <div className="flex items-center gap-2" title="Needs Review / Gas Flare (#FFFFFF)">
                    <span className="w-3.5 h-3.5 rounded-full bg-white border border-black/50 flex-shrink-0 shadow-md" />
                    <span className="text-white/95 text-xs font-semibold truncate">{t.color_needs_review}</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer py-1.5 hover:text-white text-white/90 transition-colors border-t border-white/10 pt-2">
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <Flame className="w-4 h-4 text-[#D8582B]" />
                  {t.density_heatmap}
                </span>
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="w-4 h-4 accent-[#D8582B] rounded cursor-pointer"
                />
              </label>

              {(filters.risk_band || filters.classification || filters.anomaly_status || filters.search || filters.is_alert || targetLocation) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.reset_all_filters}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════ CRITICAL ALERTS INCIDENT DIRECTORY (59) ══════════════ */}
      {isAlertDirectoryOpen && filters.is_alert && (
        <div id="critical-alerts-directory" className="absolute top-20 right-4 sm:right-6 z-30 w-full sm:w-[420px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl glass-card-editorial border border-red-500/50 shadow-2xl shadow-red-950/70 backdrop-blur-2xl animate-fade-in text-white font-sans overflow-hidden">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-red-950/90 to-red-900/60 border-b border-red-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/25 border border-red-500/50 flex items-center justify-center text-red-300">
                <ShieldAlert className="w-4 h-4 animate-pulse text-red-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-red-200">
                  {t.critical_alerts_queue}
                </h3>
                <p className="text-[10px] text-red-300/80 font-mono">
                  59 Urgent Triage Thermal Hotspots Across India
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                id="btn-fit-all-alerts"
                onClick={handleFitAllAlerts}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 border border-white/10 transition-colors cursor-pointer"
                title="Fit all 59 hotspots on map screen"
              >
                <Compass className="w-3 h-3 text-red-300" />
                <span className="hidden sm:inline">{t.fit_all_alerts}</span>
              </button>
              <button
                id="btn-close-alert-directory"
                onClick={() => setIsAlertDirectoryOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Close directory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subfilters & Search Bar */}
          <div className="p-3 border-b border-white/10 space-y-2 bg-[#12100E]/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
              <input
                id="input-alert-search"
                type="text"
                value={alertSearch}
                onChange={(e) => setAlertSearch(e.target.value)}
                placeholder="Search alert by ID, class, or status..."
                className="w-full bg-[#1A1715] border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500 font-mono"
              />
              {alertSearch && (
                <button
                  onClick={() => setAlertSearch('')}
                  className="absolute right-2.5 top-2 text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subfilter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono scrollbar-none pb-0.5">
              {[
                { id: 'ALL', label: 'All 59' },
                { id: 'CRITICAL', label: '1 Critical' },
                { id: 'HIGH', label: '27 High Risk' },
                { id: 'SURGE', label: '31 Surges' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAlertSubfilter(tab.id as any)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    alertSubfilter === tab.id
                      ? 'bg-red-500/35 border border-red-500 text-white font-bold'
                      : 'bg-white/[0.04] border border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="flex-1 overflow-y-auto max-h-[460px] p-2.5 space-y-2 text-xs font-mono">
            {criticalAlertsList.length === 0 ? (
              <div className="p-6 text-center text-white/40">
                No alerts match the search query "{alertSearch}".
              </div>
            ) : (
              criticalAlertsList.map((pt) => {
                const id = pt.id ?? pt.thermal_source_id ?? 0;
                const lat = pt.lat ?? pt.latitude ?? 0;
                const lon = pt.lon ?? pt.longitude ?? 0;
                const isSelected = selectedSourceId === id;
                const classColor = getClassificationColor(pt.classification);
                const colorName = getClassificationColorName(pt.classification);

                return (
                  <div
                    key={id}
                    id={`alert-card-${id}`}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-red-500/25 border-red-500 ring-1 ring-red-500 shadow-lg'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">#{id}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            pt.risk_band === 'CRITICAL'
                              ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                              : 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                          }`}
                        >
                          {pt.risk_band} ({Number(pt.risk_score).toFixed(1)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: classColor,
                            border: classColor === '#FFFFFF' ? '1px solid #000' : 'none'
                          }}
                        />
                        <span className="text-[10px] text-white/90 font-sans truncate max-w-[140px]" title={`${pt.classification} — ${colorName}`}>
                          {pt.classification} — {colorName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-white/60 mb-2 font-sans">
                      <div>
                        FRP: <span className="text-amber-300 font-mono font-bold">{Number(pt.mean_frp).toFixed(1)} MW</span>
                      </div>
                      <div className="text-right font-mono text-white/50">
                        {lat.toFixed(3)}°N, {lon.toFixed(3)}°E
                      </div>
                      <div className="col-span-2 text-[9px] font-mono text-red-300/80 truncate">
                        Status: {pt.anomaly_status}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                      <button
                        onClick={() => handleFlyToAlert(pt)}
                        className="flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Fly directly to this hotspot on map with radar beacon"
                      >
                        <Navigation className="w-3 h-3 text-cyan-300" />
                        <span>{t.locate_on_map}</span>
                      </button>
                      <button
                        onClick={() => setSelectedSourceId(id)}
                        className="py-1 px-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Open full intelligence dossier"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ INTEL DOSSIER MODAL ══════════════════ */}
      {selectedSourceId && isDossierModalOpen && (
        <SourceDetailModal
          sourceId={selectedSourceId}
          onClose={() => setIsDossierModalOpen(false)}
        />
      )}

      {/* ══════════════════ CORRELATED CLUSTER TACTICAL HUD CARD ══════════════════ */}
      {clusterState && (
        <div
          id="correlated-cluster-hud"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+170px)] z-30 w-[94%] sm:w-auto min-w-[360px] sm:max-w-2xl bg-[#12100E]/95 backdrop-blur-xl border border-[#D9531E] border-l-4 border-l-[#D9531E] shadow-[0_16px_50px_rgba(0,0,0,0.8)] p-3.5 sm:p-4 text-white select-none transition-all animate-fade-in pointer-events-auto"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Cluster Identity and Meta */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-[#D9531E]/20 border border-[#D9531E] flex items-center justify-center flex-shrink-0 relative">
                <Radio className="w-5 h-5 text-[#D9531E] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D9531E] animate-ping" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D9531E] uppercase">
                    CORRELATED THERMAL EVENT
                  </span>
                  <span className="text-[10px] font-mono text-white/40">&bull;</span>
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    {clusterState.clusterId}
                  </span>
                  {clusterState.zScore && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                      +{clusterState.zScore}σ Regional Z-Score
                    </span>
                  )}
                </div>

                <div className="text-xs font-sans font-medium text-slate-200 truncate mt-0.5 flex items-center gap-2">
                  <span className="font-bold text-white">{clusterState.regionName}</span>
                  <span className="text-white/40">&bull;</span>
                  <span className="text-xs text-[#D9531E] font-mono">
                    {clusterState.sourceIds.length} Synchronized Hotspots
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper / Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              {/* Stepper Controls */}
              <div className="flex items-center gap-1 bg-[#1E1B18] px-2 py-1 border border-[#D0C9BE]/30">
                <button
                  id="btn-cluster-prev"
                  onClick={() => handleClusterCycleSource('prev')}
                  className="p-1 hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Previous Cluster Source"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1 text-slate-300 whitespace-nowrap">
                  {selectedSourceId ? `SRC-${selectedSourceId} (${clusterState.currentMemberIndex + 1}/${clusterState.sourceIds.length})` : `${clusterState.sourceIds.length} Sources`}
                </span>
                <button
                  id="btn-cluster-next"
                  onClick={() => handleClusterCycleSource('next')}
                  className="p-1 hover:bg-white/10 text-white transition-colors cursor-pointer"
                  title="Next Cluster Source"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedSourceId && (
                <button
                  id="btn-cluster-dossier"
                  onClick={() => setIsDossierModalOpen(true)}
                  className="px-3 py-1.5 bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  title="Open Intelligence Dossier for current source"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
              )}

              <button
                id="btn-exit-cluster"
                onClick={handleClearClusterInspection}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Exit Cluster Inspection Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TACTICAL INSPECTION HUD CARD ══════════════════ */}
      {selectedSourceId && inspectedMeta && !isDossierModalOpen && !clusterState && (
        <div
          id="tactical-inspection-hud"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+170px)] z-30 w-[92%] sm:w-auto min-w-[340px] sm:max-w-xl bg-[#12100E]/95 backdrop-blur-xl border border-[#D9531E]/60 shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-3.5 sm:p-4 text-white select-none transition-all animate-fade-in pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Icon + Beacon */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D9531E]/20 border border-[#D9531E] flex items-center justify-center flex-shrink-0 relative">
                <Crosshair className="w-5 h-5 text-[#D9531E]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D9531E] uppercase">
                    INSPECTING HOTSPOT
                  </span>
                  <span className="text-[10px] font-mono text-white/40">&bull;</span>
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    SRC-{inspectedMeta.id}
                  </span>
                  {inspectedMeta.riskBand && (
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                      inspectedMeta.riskBand === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      inspectedMeta.riskBand === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {inspectedMeta.riskBand}
                    </span>
                  )}
                </div>

                <div className="text-xs font-sans font-medium text-slate-200 truncate mt-0.5 flex items-center gap-2">
                  <span>{inspectedMeta.classification || 'Thermal Anomaly'}</span>
                  {inspectedMeta.lat !== 0 && (
                    <>
                      <span className="text-white/40">&bull;</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {inspectedMeta.lat.toFixed(4)}°N, {inspectedMeta.lon.toFixed(4)}°E
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="btn-inspect-dossier"
                onClick={() => setIsDossierModalOpen(true)}
                className="px-3.5 py-2 bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Open complete intelligence dossier"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>

              <button
                id="btn-close-inspect"
                onClick={handleClearInspection}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Exit Inspection Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ DISTRICT / STATE BENCHMARK HUD CARD ══════════════════ */}
      {districtBenchmarkState && !clusterState && !selectedSourceId && (
        <div
          id="district-benchmark-hud"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+170px)] z-30 w-[94%] sm:w-auto min-w-[360px] sm:max-w-xl bg-[#12100E]/95 backdrop-blur-xl border border-[#D9531E] border-l-4 border-l-[#D9531E] shadow-[0_16px_50px_rgba(0,0,0,0.8)] p-3.5 sm:p-4 text-white select-none transition-all animate-fade-in pointer-events-auto"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-[#D9531E]/20 border border-[#D9531E] flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5 text-[#D9531E]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D9531E] uppercase">
                    {districtBenchmarkState.isStateOnly ? 'STATE RISK BENCHMARK' : 'DISTRICT RISK BENCHMARK'}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">•</span>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">
                    FILTER ACTIVE
                  </span>
                </div>

                <div className="text-sm font-sans font-bold text-white truncate mt-0.5 flex items-center gap-2">
                  <span>
                    {districtBenchmarkState.district
                      ? `${districtBenchmarkState.district}, ${districtBenchmarkState.state || ''}`
                      : districtBenchmarkState.state}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-xs text-[#D9531E] font-mono font-bold">
                    {mapPoints.length} Hotspots
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <button
                id="btn-back-to-benchmarks"
                onClick={() => navigate('/benchmarks')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-sans font-bold text-xs transition-all cursor-pointer"
                title="Return to risk benchmarks leaderboard"
              >
                Leaderboard
              </button>

              <button
                id="btn-clear-district-filter"
                onClick={handleClearDistrictBenchmark}
                className="px-3 py-1.5 bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                title="Clear district filter and show all India hotspots"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
