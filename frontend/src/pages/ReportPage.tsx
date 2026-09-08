import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  MapPin,
  Camera,
  CheckCircle2,
  Navigation,
  Shield,
  FileText,
  Clock,
  Radio
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [form, setForm] = useState({
    reporterName: '',
    phone: '',
    incidentType: 'Industrial Fire',
    state: 'Maharashtra',
    district: '',
    latitude: '',
    longitude: '',
    severity: 'HIGH',
    industrialZone: 'yes',
    description: ''
  });

  const [locating, setLocating] = useState(false);
  const [reportToken, setReportToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(5),
          longitude: pos.coords.longitude.toFixed(5)
        }));
        setLocating(false);
      },
      (err) => {
        console.error("Geo error:", err);
        setLocating(false);
        alert('Could not determine your GPS location. Please enter coordinates manually.');
      }
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.reporterName.trim()) errs.reporterName = 'Reporter name is required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required for dispatch verification.';
    if (!form.district.trim()) errs.district = 'District / Landmark is required.';
    if (!form.latitude.trim() || isNaN(Number(form.latitude))) {
      errs.latitude = 'Valid latitude coordinate is required.';
    }
    if (!form.longitude.trim() || isNaN(Number(form.longitude))) {
      errs.longitude = 'Valid longitude coordinate is required.';
    }
    if (!form.description.trim()) errs.description = 'Please describe the observed thermal event.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate official sovereign reference token
    const token = `GOI-FIRM-${Math.floor(100000 + Math.random() * 900000)}`;
    setReportToken(token);
  };

  const resetForm = () => {
    setReportToken(null);
    setForm({
      reporterName: '',
      phone: '',
      incidentType: 'Industrial Fire',
      state: 'Maharashtra',
      district: '',
      latitude: '',
      longitude: '',
      severity: 'HIGH',
      industrialZone: 'yes',
      description: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] py-8 px-4 sm:px-6 lg:px-8 space-y-8 select-none font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-6">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <Radio className="w-4 h-4 text-[#D9531E] animate-pulse" />
            <span>MINISTRY OF EARTH SCIENCES &bull; NATIONAL EMERGENCY THERMAL INCIDENT INTAKE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
            Report Ground Thermal Incident
          </h1>
          <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-2xl">
            Direct ingestion portal for plant supervisors, first responders, and citizens to notify the National FIRMS thermal monitoring taskforce.
          </p>
        </div>

        {reportToken ? (
          <div className="bg-[#F5F2EB] p-8 rounded-none border border-[#D0C9BE] text-center space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-none bg-[#FEF3C7] border border-[#FCD34D] flex items-center justify-center text-[#D9531E] mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase font-bold text-[#D9531E] tracking-[0.15em]">
                INCIDENT REGISTERED &amp; BROADCASTED TO RADAR
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1E1B18] mt-1">
                Tracking Token: <span className="font-mono text-[#D9531E]">{reportToken}</span>
              </h2>
              <p className="text-xs text-[#5C554E] max-w-lg mx-auto mt-2 leading-relaxed font-sans">
                Your report has been prioritized in the thermal anomaly triage pipeline. Satellite telemetry from the next VIIRS / Sentinel-2 pass will automatically cross-correlate with these coordinates.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white font-sans text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Submit Another Incident Report
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#F5F2EB] p-6 sm:p-8 rounded-none border border-[#D0C9BE] shadow-xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                    Reporter Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.reporterName}
                    onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                    placeholder="e.g. S. Sen (Plant Safety Officer)"
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-2xs"
                  />
                  {errors.reporterName && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.reporterName}</p>}
                </div>

                <div>
                  <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-2xs font-mono"
                  />
                  {errors.phone && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.phone}</p>}
                </div>
              </div>

              {/* Type & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                    Observed Incident Type
                  </label>
                  <select
                    value={form.incidentType}
                    onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-2xs"
                  >
                    <option value="Industrial Fire">Industrial Facility Fire</option>
                    <option value="Gas Flare">Abnormal Gas Flare Surge</option>
                    <option value="Forest Fire">Wildfire / Forest Fire</option>
                    <option value="Agricultural">Agricultural Crop Residue</option>
                    <option value="Chemical Hazard">Chemical / Refinery Blaze</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                    Assessed Severity Level
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-2xs font-bold"
                  >
                    <option value="CRITICAL">Critical (Life / Asset Threat)</option>
                    <option value="HIGH">High (Spreading Rapidly)</option>
                    <option value="MODERATE">Moderate (Localized)</option>
                    <option value="LOW">Low (Contained / Smoldering)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                    Within Industrial Zone?
                  </label>
                  <select
                    value={form.industrialZone}
                    onChange={(e) => setForm({ ...form, industrialZone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] focus:outline-none focus:border-[#D9531E] font-sans text-xs shadow-2xs"
                  >
                    <option value="yes">Yes (MIDC / GIDC / Plant)</option>
                    <option value="no">No (Rural / Forestry / Highway)</option>
                  </select>
                </div>
              </div>

              {/* Geolocation Section */}
              <div className="p-4 rounded-none bg-[#E2DDD4] border border-[#D0C9BE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-[#1E1B18] flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#D9531E]" />
                    <span>Geographic Location Coordinates</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="px-3.5 py-1.5 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{locating ? 'Acquiring GPS...' : 'Auto-Detect Coordinates'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#78716C] font-mono text-[11px] mb-1">District / Landmark *</label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="e.g. Tarapur MIDC, Palghar"
                      className="w-full px-3 py-2 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-sans text-xs"
                    />
                    {errors.district && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.district}</p>}
                  </div>

                  <div>
                    <label className="block text-[#78716C] font-mono text-[11px] mb-1">Latitude (°N) *</label>
                    <input
                      type="text"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="e.g. 19.8234"
                      className="w-full px-3 py-2 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-mono text-xs"
                    />
                    {errors.latitude && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.latitude}</p>}
                  </div>

                  <div>
                    <label className="block text-[#78716C] font-mono text-[11px] mb-1">Longitude (°E) *</label>
                    <input
                      type="text"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="e.g. 72.7541"
                      className="w-full px-3 py-2 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-mono text-xs"
                    />
                    {errors.longitude && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.longitude}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans font-bold text-xs text-[#1E1B18] mb-1.5">
                  Incident Description &amp; Observed Conditions *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail smoke plume density, flame heights, estimated perimeter, or hazardous materials involved..."
                  className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] font-sans text-xs"
                />
                {errors.description && <p className="text-[#991B1B] mt-1 text-[11px] font-sans">{errors.description}</p>}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs uppercase tracking-[0.06em] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Ground Thermal Alert to National Radar</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
