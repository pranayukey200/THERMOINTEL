import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  TrendingUp,
  ChevronRight,
  Flame,
  Layers,
  Satellite,
  Activity,
  ArrowRight,
  Info,
  Crosshair,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { DistributionItem, DisambiguationMatrixResponse } from '../types';

export const ThreatProfilesPage: React.FC = () => {
  const [classes, setClasses] = useState<DistributionItem[]>([]);
  const [matrix, setMatrix] = useState<DisambiguationMatrixResponse | null>(null);
  const [selectedDomainIdx, setSelectedDomainIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getClassificationDistribution().catch((err) => {
        console.error("Classification error:", err);
        return [];
      }),
      api.getDisambiguationMatrix().catch((err) => {
        console.error("Disambiguation error:", err);
        return null;
      })
    ]).then(([classList, matrixData]) => {
      setClasses(classList);
      setMatrix(matrixData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] py-8 px-4 sm:px-6 lg:px-8 space-y-12 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Sovereign Page Header */}
        <div className="border-b border-[#D0C9BE] pb-6">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <Crosshair className="w-4 h-4 text-[#D9531E]" />
            <span>GOVERNMENT OF INDIA // NTRO GEOINT DISAMBIGUATION ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
            Threat Profiles &amp; 3-Axis Multi-Domain Disambiguation
          </h1>
          <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-3xl">
            Scientific methodology resolving spatial-spectral ambiguity between persistent industrial stacks, flaring surges, seasonal agricultural stubble burns, and wildfire propagation fronts.
          </p>
        </div>

        {/* SECTION 1: 3-AXIS MULTI-DOMAIN DISAMBIGUATION ENGINE */}
        <section className="bg-[#F5F2EB] text-[#1E1B18] p-6 sm:p-8 rounded-none border border-[#D0C9BE] space-y-6 shadow-xs">
          <div className="border-b border-[#D0C9BE] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
                <Crosshair className="w-4 h-4" />
                <span>CORE SCIENTIFIC INNOVATION // 3-AXIS DISAMBIGUATION</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1E1B18] mt-1">
                Multi-Sensor Fire Domain Segregation Engine
              </h2>
              <p className="text-xs text-[#5C554E] mt-1 max-w-2xl font-sans">
                NASA FIRMS 375m detections lack physical domain context. Our engine resolves ambiguity across 3 orthogonal dimensions: Temporal Diurnal Radiance, Centroid Spatial Displacement, and High-Resolution 20m SWIR Radiance.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {matrix?.domains.map((dom, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDomainIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-none text-xs font-sans font-bold uppercase tracking-[0.06em] transition-all cursor-pointer ${
                    selectedDomainIdx === idx
                      ? 'bg-[#D9531E] text-white shadow-xs'
                      : 'bg-[#F5F2EB] text-[#5C554E] hover:text-[#1E1B18] hover:bg-[#E2DDD4] border border-[#D0C9BE]'
                  }`}
                >
                  {dom.domain.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Domain Dossier */}
          {matrix && matrix.domains[selectedDomainIdx] && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-xs">
              {/* Domain Overview Card */}
              <div className="p-5 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#D9531E]">
                    {matrix.domains[selectedDomainIdx].badge}
                  </span>
                  <span
                    className="w-3 h-3 rounded-none"
                    style={{ backgroundColor: matrix.domains[selectedDomainIdx].color }}
                  />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#1E1B18]">
                  {matrix.domains[selectedDomainIdx].domain}
                </h3>
                <p className="text-[#5C554E] font-sans text-xs leading-relaxed">
                  {matrix.domains[selectedDomainIdx].diurnal_behavior}
                </p>
                <div className="pt-2 border-t border-[#D0C9BE] space-y-2">
                  <div>
                    <span className="text-[#78716C] font-mono block text-[10px] uppercase">TYPICAL FIRE RADIATIVE POWER</span>
                    <span className="font-bold text-[#1E1B18] text-sm font-sans">{matrix.domains[selectedDomainIdx].typical_frp}</span>
                  </div>
                  <div>
                    <span className="text-[#78716C] font-mono block text-[10px] uppercase">OSM VECTOR COINCIDENCE</span>
                    <span className="text-[#1E1B18] text-xs font-sans font-medium">{matrix.domains[selectedDomainIdx].osm_proximity}</span>
                  </div>
                </div>
              </div>

              {/* 3 Orthogonal Physical Axes */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Axis 1 */}
                <div className="p-4 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] space-y-2 shadow-xs">
                  <div className="text-[10px] text-[#78716C] font-mono font-bold uppercase tracking-wider">Axis 1: Diurnal Ratio (D/N)</div>
                  <div className="text-2xl font-bold font-sans text-[#1E1B18]">
                    {matrix.domains[selectedDomainIdx].diurnal_ratio}
                  </div>
                  <p className="text-[11px] text-[#5C554E] font-sans leading-relaxed">
                    Ratio of daytime afternoon overpass FRP vs night-time VIIRS overpass FRP. Stationary industrial processes emit 24/7 (ratio ~ 1.0), whereas stubble burns peak between 13:00-16:00 IST.
                  </p>
                </div>

                {/* Axis 2 */}
                <div className="p-4 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] space-y-2 shadow-xs">
                  <div className="text-[10px] text-[#78716C] font-mono font-bold uppercase tracking-wider">Axis 2: Centroid Drift (&Delta;m)</div>
                  <div className="text-2xl font-bold font-sans text-[#1E1B18]">
                    {matrix.domains[selectedDomainIdx].centroid_drift}
                  </div>
                  <p className="text-[11px] text-[#5C554E] font-sans leading-relaxed">
                    {matrix.domains[selectedDomainIdx].centroid_drift_desc}
                  </p>
                </div>

                {/* Axis 3 */}
                <div className="p-4 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] space-y-2 shadow-xs">
                  <div className="text-[10px] text-[#78716C] font-mono font-bold uppercase tracking-wider">Axis 3: 20m SWIR Radiance</div>
                  <div className="text-xs font-mono font-bold text-[#D9531E] uppercase tracking-tight">
                    Sentinel-2 MSI B11/B12
                  </div>
                  <p className="text-[11px] text-[#5C554E] font-sans leading-relaxed">
                    {matrix.domains[selectedDomainIdx].sentinel2_swir}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flaring vs Catastrophic Thermal Runaway Mathematical Formulation */}
          <div className="p-5 rounded-none bg-[#EAE5DC] border border-[#D0C9BE] space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#D0C9BE] pb-2">
              <span className="font-serif font-bold text-sm text-[#1E1B18] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#D9531E]" />
                <span>Operational Flaring vs. Catastrophic Thermal Runaway Anomaly Formulation</span>
              </span>
              <span className="text-[10px] font-mono text-[#78716C] bg-[#F5F2EB] px-2.5 py-0.5 rounded-none border border-[#D0C9BE]">
                Z-Score Statistical Criterion
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-none bg-[#F5F2EB] border border-[#D0C9BE] space-y-2 shadow-xs">
                <div className="text-[#2E7D32] font-mono font-bold text-xs uppercase tracking-wider">Controlled Operational Flaring</div>
                <div className="text-[#5C554E] font-sans text-xs">
                  Refinery flare stacks maintain an established 30-day baseline thermal radiance (FRP_30d) with diurnal fluctuations:
                </div>
                <div className="p-2 rounded-none bg-[#E2DDD4] text-[#1E1B18] font-mono text-center text-xs border border-[#D0C9BE]">
                  Surge Multiplier = Peak FRP / Baseline FRP &lt; 1.8x &nbsp;|&nbsp; Z &lt; 2.0&sigma;
                </div>
              </div>

              <div className="p-3.5 rounded-none bg-[#FEE2E2] border border-[#FCA5A5] space-y-2 shadow-xs">
                <div className="text-[#991B1B] font-mono font-bold text-xs uppercase tracking-wider">Catastrophic Thermal Runaway</div>
                <div className="text-[#991B1B]/80 font-sans text-xs">
                  Sudden surge exceeding 3.0x moving baseline triggers emergency industrial hazard exclusion alerts:
                </div>
                <div className="p-2 rounded-none bg-[#F5F2EB] text-[#991B1B] font-mono text-center text-xs border border-[#FCA5A5] font-bold">
                  Surge Multiplier &ge; 3.0x &nbsp;|&nbsp; Z = (Peak FRP - Mean) / StdDev &ge; 3.0&sigma;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: AI CLASSIFICATION PROFILE CARDS */}
        <section className="space-y-6">
          <div className="border-b border-[#D0C9BE] pb-4">
            <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
              <Shield className="w-4 h-4" />
              <span>Random Forest 15-Feature Classifier</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
              AI-Engineered Threat Classifications
            </h2>
            <p className="text-xs sm:text-sm text-[#5C554E] mt-0.5 font-sans">
              15-feature Random Forest classifier trained on 15,436 India-region thermal sources distinguishing high-consequence industrial events from routine agricultural or natural burning.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center bg-[#F5F2EB] rounded-none border border-[#D0C9BE] shadow-xs">
              <div className="w-8 h-8 border-2 border-[#D9531E] border-t-transparent rounded-none animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#78716C] font-mono">Synchronizing classification intelligence...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {classes.map((cls, idx) => (
                <div
                  key={idx}
                  className="bg-[#F5F2EB] p-5 rounded-none border border-[#D0C9BE] hover:border-[#D9531E]/60 hover:shadow-md transition-all group flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-none bg-[#EAE5DC] text-[#1E1B18] flex items-center justify-center font-bold text-xs font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-none bg-[#E2DDD4] text-[#5C554E] border border-[#D0C9BE]">
                        {cls.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#1E1B18] group-hover:text-[#D9531E] transition-colors">
                      {cls.name}
                    </h3>

                    <p className="text-xs text-[#5C554E] font-sans mt-1.5 line-clamp-3 leading-relaxed">
                      {cls.name.includes('Industrial Fire')
                        ? 'Uncontrolled thermal release in heavy industrial or manufacturing zones. High priority for safety controllers.'
                        : cls.name.includes('Gas Flare')
                        ? 'Continuous regulated industrial hydrocarbon flare operations in oil, refinery, or petrochemical plants.'
                        : cls.name.includes('Forest')
                        ? 'Canopy or surface vegetative fire detected across recognized forest reserve areas.'
                        : cls.name.includes('Agricultural')
                        ? 'Seasonal post-harvest crop stubble burning in rural agricultural parcels.'
                        : cls.name.includes('Mining')
                        ? 'Thermal activity linked to open-cast surface mining, smelters, or coal washery sites.'
                        : cls.name.includes('Persistent')
                        ? 'Long-standing stationary thermal point source observed continuously over 90 days.'
                        : 'Low-confidence thermal detection requiring optical Sentinel-2 validation.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#D0C9BE] flex items-center justify-between text-xs">
                    <span className="font-mono text-[#78716C] text-[11px]">
                      {cls.count.toLocaleString()} sources
                    </span>
                    <Link
                      to={`/map?classification=${encodeURIComponent(cls.name)}`}
                      className="text-[#D9531E] font-sans font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                    >
                      <span>View On Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: END-TO-END SURVEILLANCE PIPELINE */}
        <section className="bg-[#EAE5DC]/50 py-10 px-6 sm:px-8 rounded-none border border-[#D0C9BE] space-y-8 shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.15em] text-[#D9531E]">
              <TrendingUp className="w-4 h-4" />
              <span>OPERATIONAL PIPELINE ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight">
              End-to-End Surveillance Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[#5C554E] font-sans">
              How FIRM Detector Fire Industrial processes raw satellite telemetry into actionable sovereign intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#F5F2EB] p-6 rounded-none border border-[#D0C9BE] space-y-3 relative shadow-xs">
              <div className="w-9 h-9 rounded-none bg-[#D9531E] text-white flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                VIIRS Satellite NRT Detection
              </h3>
              <p className="text-xs text-[#5C554E] font-sans leading-relaxed">
                Suomi-NPP and NOAA-20 VIIRS 375m sensors detect thermal infrared anomalies with latitude, longitude, and Fire Radiative Power (MW).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F5F2EB] p-6 rounded-none border border-[#D0C9BE] space-y-3 relative shadow-xs">
              <div className="w-9 h-9 rounded-none bg-[#D9531E] text-white flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                AI Multi-Spectral Classifier
              </h3>
              <p className="text-xs text-[#5C554E] font-sans leading-relaxed">
                15 engineered features including land cover, industrial zoning distance, and temporal persistence classify the source into 7 threat types.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F5F2EB] p-6 rounded-none border border-[#D0C9BE] space-y-3 relative shadow-xs">
              <div className="w-9 h-9 rounded-none bg-[#D9531E] text-white flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                Sentinel-2 Optical Evidence
              </h3>
              <p className="text-xs text-[#5C554E] font-sans leading-relaxed">
                High-resolution 10m/20m Sentinel-2 MSI RGB scenes (1,764 verified granules) provide optical ground truth and burn scar validation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F5F2EB] p-6 rounded-none border border-[#D0C9BE] space-y-3 relative shadow-xs">
              <div className="w-9 h-9 rounded-none bg-[#D9531E] text-white flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                Composite Risk &amp; Triage
              </h3>
              <p className="text-xs text-[#5C554E] font-sans leading-relaxed">
                Weighted fusion of classification risk, anomaly severity, thermal power, and industrial proximity ranks urgent incidents for disaster response teams.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white text-xs font-sans font-bold shadow-xs transition-all"
            >
              <span>Return to Live Thermal Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThreatProfilesPage;
