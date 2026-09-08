import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { ArrowUp, Flame, ExternalLink, Globe, Award, FileText, Phone, ShieldCheck, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Layout: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { lang } = useLanguage();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const isMapPage = location.pathname === '/map' || location.pathname === '/territory';

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B17] text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className={`flex-grow ${isLandingPage || isMapPage ? 'pt-0' : 'pt-16'}`}>
        <Outlet />
      </main>

      {/* Modernized Sovereign Footer */}
      {!isLandingPage && !isMapPage && (
        <footer className="bg-[#030712] border-t border-blue-900/40 mt-16 text-slate-400 text-sm font-sans">
          {/* Top Info Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Column 1: Brand & Overview */}
              <div className="md:col-span-1 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-blue-600/10">
                    <Flame className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="font-sans font-black text-xl text-white tracking-tight uppercase">
                    THERMOINTEL
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400 font-sans">
                  {lang === 'HI'
                    ? 'वीआईआईआरएस एफआईआरएमएस एवं सेंटिनल-2 उपग्रह डेटा द्वारा संचालित भारत का संप्रभु थर्मल इंटेलिजेंस एवं औद्योगिक अग्नि विसंगति पहचान वेधशाला।'
                    : 'Sovereign AI-Powered Satellite Thermal Intelligence & Industrial Fire Anomaly Detection Observatory across India. Real-time monitoring of 15,436 thermal sources.'}
                </p>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#070F1E] border border-blue-900/40 text-[11px] font-mono text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>SIH 2026 • Problem Statement: 26162</span>
                </div>
              </div>

              {/* Column 2: Core Systems */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-200 font-bold mb-4">
                  {lang === 'HI' ? 'प्रमुख प्रणालियाँ' : 'Core Systems'}
                </h3>
                <ul className="space-y-2.5 text-xs font-mono">
                  <li>
                    <Link to="/map" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{lang === 'HI' ? 'थर्मल मैट्रिक्स (जीआईएस मानचित्र)' : 'Thermal Matrix (GIS Map)'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/analytics" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{lang === 'HI' ? 'खुफिया विश्लेषण डैशबोर्ड' : 'Intelligence Analytics'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/alerts" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{lang === 'HI' ? 'गंभीर घटना अलर्ट कतार' : 'Incident Alerts Queue'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/threat-profiles" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{lang === 'HI' ? 'खतरा प्रोफाइल एवं पाइपलाइन' : 'Threat Profiles & Pipeline'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/explainability" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{lang === 'HI' ? 'मॉडल स्पष्टीकरण (XAI)' : 'Model Explainability (XAI)'}</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Data Providers */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-200 font-bold mb-4">
                  {lang === 'HI' ? 'डेटा प्रदाता' : 'Data Providers'}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-400 font-mono">
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>NASA FIRMS VIIRS 375m NRT</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>ESA Copernicus Sentinel-2 MSI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Bhuvan &amp; OpenStreetMap Layers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>ISRO Space Applications Centre</span>
                  </li>
                </ul>
              </div>

              {/* Column 4: Emergency & Support */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-slate-200 font-bold mb-4">
                  {lang === 'HI' ? 'आपातकालीन सहायता' : 'Emergency & Support'}
                </h3>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {lang === 'HI'
                    ? 'राष्ट्रीय थर्मल आपातकालीन घटना प्रतिक्रिया 24x7 हेल्पलाइन:'
                    : 'National Emergency Thermal Incident Response Hotline:'}
                </p>
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-300 mb-3 p-2.5 rounded-lg bg-[#070F1E] border border-blue-900/40 w-fit">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1800-11-FIRE (24x7 Toll-Free)</span>
                </div>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 hover:text-white transition-colors"
                >
                  <span>{lang === 'HI' ? 'घटना रिपोर्ट दर्ज करें' : 'Submit Incident Report'}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Sovereign Strip */}
          <div className="bg-[#02050D] border-t border-blue-900/40 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-sans">
              <p>
                © 2026 THERMOINTEL — Government of India | Ministry of Earth Sciences &amp; Forest Fire Cell. All Rights Reserved.
              </p>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <Link to="/contact" className="hover:text-cyan-400 text-slate-400 transition-colors">
                  {lang === 'HI' ? 'संपर्क' : 'Contact'}
                </Link>
                <span className="text-slate-700">•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  WCAG 2.1 AA Compliant
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYS STATUS: NOMINAL
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 p-3 rounded-xl bg-[#0B172E]/95 hover:bg-blue-600 text-white border border-blue-900/50 hover:border-blue-400 shadow-2xl backdrop-blur-md transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Layout;
