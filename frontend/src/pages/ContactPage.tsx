import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'general',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.message.trim() || form.message.length < 20) {
      errs.message = 'Message must be at least 20 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        department: 'general',
        subject: '',
        message: ''
      });
      setErrors({});
    }, 800);
  };

  const faqs = [
    {
      q: 'What is the revisit interval of VIIRS FIRMS thermal observations?',
      a: 'NASA VIIRS instruments aboard the Suomi-NPP and NOAA-20/21 satellites achieve high temporal coverage with 2 to 4 overpasses per 24-hour cycle over the Indian subcontinent at 375-meter spatial resolution.'
    },
    {
      q: 'How are industrial fires distinguished from agricultural stubble burning?',
      a: 'The platform integrates a 15-feature Random Forest classifier that correlates thermal detection coordinates with Bhuvan/OpenStreetMap industrial land use parcels, multi-spectral land cover, and 90-day persistence signatures. Routine crop residue fires lack high stationary persistence.'
    },
    {
      q: 'What criteria triggers a "CRITICAL" operational incident alert?',
      a: 'Incidents achieve CRITICAL status when the composite risk score exceeds 70.0. This is typically triggered by a sudden abnormal thermal surge (mean FRP > 50 MW) co-located within high-consequence industrial facilities, chemical plants, or refinery perimeters.'
    },
    {
      q: 'How does Sentinel-2 optical imagery validate thermal hotspots?',
      a: 'Sentinel-2 Multi-Spectral Instrument (MSI) provides 10m/20m resolution optical RGB and short-wave infrared (SWIR) granules. When cloud cover is below threshold, automated matching provides clear optical verification of factory stacks, burn scars, and flare pits.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAE5DC] text-[#1E1B18] py-8 px-4 sm:px-6 lg:px-8 space-y-10 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="border-b border-[#D0C9BE] pb-6">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <Phone className="w-4 h-4" />
            <span>GOVERNMENT OPERATIONS &amp; INQUIRIES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1B18] tracking-tight mt-1">
            Contact &amp; Operations Center
          </h1>
          <p className="text-[#5C554E] font-sans text-xs sm:text-sm mt-1 max-w-2xl">
            National Thermal Surveillance Taskforce. Direct communications for state disaster management authorities, industrial safety controllers, and technical integrations.
          </p>
        </div>

        {/* Grid: Form & Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#F5F2EB] p-6 sm:p-8 rounded-none border border-[#D0C9BE] shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1E1B18]">
                  Official Correspondence Portal
                </h2>
                <p className="text-xs text-[#78716C] font-sans mt-1">
                  All communications are routed through the central thermal intelligence coordination cell.
                </p>
              </div>

              {submitted && (
                <div className="p-4 rounded-none bg-[#FEF3C7] border border-[#FCD34D] flex items-start gap-3 text-[#B45309] text-xs font-sans">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#D9531E] mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-[#1E1B18]">Inquiry Dispatched Successfully</h3>
                    <p className="mt-0.5 text-[#5C554E]">
                      Your inquiry has been assigned sovereign ticket ref <strong className="font-mono text-[#D9531E]">IND-2026-T{Math.floor(1000 + Math.random() * 9000)}</strong>. A duty intelligence officer will respond within 4 business hours.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#1E1B18] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] shadow-2xs text-xs"
                    />
                    {errors.name && <p className="text-[#991B1B] mt-1 text-[11px]">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B18] mb-1.5">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. r.verma@nic.in"
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] shadow-2xs text-xs"
                    />
                    {errors.email && <p className="text-[#991B1B] mt-1 text-[11px]">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#1E1B18] mb-1.5">
                      Routing Department
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] focus:outline-none focus:border-[#D9531E] shadow-2xs text-xs"
                    >
                      <option value="general">National Operations Desk</option>
                      <option value="technical">Algorithm &amp; Sensor Calibration</option>
                      <option value="emergency">Emergency Disaster Management</option>
                      <option value="legal">Sovereign Data Governance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1E1B18] mb-1.5">
                      Subject Matter *
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Flare Anomaly Discrepancy"
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] shadow-2xs text-xs"
                    />
                    {errors.subject && <p className="text-[#991B1B] mt-1 text-[11px]">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1E1B18] mb-1.5">
                    Operational Message * (min. 20 chars)
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details regarding the thermal observation, MGRS grid coordinates, sensor IDs, or operational inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#D0C9BE] bg-[#F5F2EB] text-[#1E1B18] placeholder-[#78716C] focus:outline-none focus:border-[#D9531E] shadow-2xs text-xs"
                  />
                  {errors.message && <p className="text-[#991B1B] mt-1 text-[11px]">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-none bg-[#D9531E] hover:bg-[#B84214] text-white font-sans font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-[0.06em]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting to Secure Node...' : 'Dispatch Secure Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Contact Cards & Emergency Hotline */}
          <div className="lg:col-span-5 space-y-6">
            {/* Emergency Hotline Banner */}
            <div className="bg-[#EAE5DC] border-l-4 border-l-[#D9531E] border border-[#D0C9BE] p-5 rounded-none shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-[#991B1B] font-bold text-xs font-mono uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-[#D9531E]" />
                <span>Immediate Industrial Emergency Hotline</span>
              </div>
              <p className="text-xs text-[#1E1B18] font-sans leading-relaxed">
                For catastrophic uncontrolled chemical flare escalations, industrial blazes, or disaster evacuations:
              </p>
              <div className="pt-2">
                <a
                  href="tel:1800118800"
                  className="text-xl font-bold font-mono text-[#D9531E] hover:underline"
                >
                  1800-11-8800 (Toll-Free 24/7)
                </a>
                <span className="block text-[10px] text-[#78716C] mt-0.5 font-mono">
                  Direct Line &bull; Disaster Management Operations Cell
                </span>
              </div>
            </div>

            {/* Direct Channel Cards */}
            <div className="bg-[#F5F2EB] p-6 rounded-none border border-[#D0C9BE] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#1E1B18]">
                Sovereign Taskforce Headquarters
              </h3>

              <div className="space-y-3.5 text-xs text-[#1E1B18] font-sans">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D9531E] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E1B18] block">National Geospatial Operations Hub</span>
                    <span className="text-[#5C554E] leading-relaxed">
                      Ministry of Earth Sciences, Prithvi Bhavan, Lodhi Road, New Delhi 110003, India
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#D9531E] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#1E1B18] block">Secure Intelligence Dispatch</span>
                    <span className="text-[#5C554E] font-mono text-[11px]">operations@thermointel.gov.in</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#D9531E] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#1E1B18] block">Surveillance Watch Operational Hours</span>
                    <span className="text-[#5C554E]">Continuous 24/7/365 Spaceborne Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Technical FAQs */}
        <div className="bg-[#F5F2EB] p-6 sm:p-8 rounded-none border border-[#D0C9BE] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#D9531E] font-mono font-bold text-xs tracking-[0.15em] uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>FREQUENTLY ANSWERED TECHNICAL INQUIRIES</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1E1B18]">
            Thermal Sensor Intelligence &amp; Data FAQ
          </h2>

          <div className="divide-y divide-[#D0C9BE] pt-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-[#1E1B18] hover:text-[#D9531E] transition-colors cursor-pointer"
                >
                  <span className="font-serif text-sm font-bold">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#D9531E] flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#78716C] flex-shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 text-xs text-[#5C554E] font-sans leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
