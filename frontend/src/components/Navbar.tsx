import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Minimize2,
  Globe,
  Menu,
  X,
  Flame,
  Shield,
  Layers,
  Brain
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { lang: selectedLang, setLang: setSelectedLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route awareness: Landing page and live GIS map stay strictly transparent
  const isDarkPage = location.pathname === '/' || location.pathname === '/map' || location.pathname === '/territory';

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        isDarkPage
          ? 'bg-transparent border-b border-transparent text-white'
          : 'bg-[#EAE5DC]/95 backdrop-blur-md border-b border-[#D0C9BE] shadow-xs text-[#1E1B18]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT CONTROLS */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Fullscreen Expand Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className={`p-1.5 rounded-none transition-colors flex-shrink-0 cursor-pointer ${
                isDarkPage
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-[#5C554E] hover:text-[#1E1B18] hover:bg-[#D0C9BE]/50'
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Left Nav Tabs */}
            <nav
              className={`flex items-center gap-5 text-sm font-sans font-bold uppercase tracking-[0.08em] ${
                isDarkPage ? 'text-white/90 font-mono tracking-wider' : 'text-[#5C554E]'
              }`}
            >
              <NavLink
                to="/map"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                {t.thermal_matrix}
              </NavLink>
            </nav>
          </div>

          {/* CENTER BRAND */}
          <div
            className="flex items-center justify-center cursor-pointer select-none py-1"
            onClick={() => navigate('/')}
          >
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors ${
                isDarkPage
                  ? 'font-editorial text-white hover:text-amber-200 drop-shadow-md'
                  : 'font-serif text-[#1E1B18] hover:text-[#D9531E]'
              }`}
            >
              ThermoTrace
            </span>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Right Nav Links */}
            <nav
              className={`hidden md:flex items-center gap-5 text-sm font-sans font-bold uppercase tracking-[0.08em] ${
                isDarkPage ? 'text-white/90 font-mono tracking-wider' : 'text-[#5C554E]'
              }`}
            >
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                {t.analytics}
              </NavLink>
              <NavLink
                to="/alerts"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                {t.alerts}
              </NavLink>
              <NavLink
                to="/benchmarks"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                {t.benchmarks}
              </NavLink>
              <NavLink
                to="/explainability"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                XAI
              </NavLink>
              <NavLink
                to="/report"
                className={({ isActive }) =>
                  isDarkPage
                    ? `relative py-1 whitespace-nowrap transition-colors hover:text-cyan-300 ${
                        isActive
                          ? 'text-cyan-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-cyan-400'
                          : ''
                      }`
                    : `relative py-1 whitespace-nowrap transition-colors hover:text-[#1E1B18] ${
                        isActive
                          ? 'text-[#D9531E] font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#D9531E]'
                          : ''
                      }`
                }
              >
                {t.triage}
              </NavLink>
            </nav>

            {/* Multilingual Selector [ 🌐 EN | हिंदी ] - Square Shape */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 text-xs ${
                isDarkPage
                  ? 'bg-black/30 border border-white/20 text-white rounded-none backdrop-blur-xs'
                  : 'bg-[#F5F2EB] border border-[#D0C9BE] text-[#1E1B18] rounded-none shadow-2xs'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${isDarkPage ? 'text-cyan-300' : 'text-[#D9531E]'}`} />
              {(['EN', 'HI'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2 py-0.5 text-xs font-sans font-extrabold transition-all cursor-pointer rounded-none ${
                    selectedLang === lang
                      ? isDarkPage
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-[#D9531E] text-white shadow-2xs'
                      : isDarkPage
                      ? 'text-white/70 hover:text-white'
                      : 'text-[#78716C] hover:text-[#1E1B18]'
                  }`}
                >
                  {lang === 'EN' ? 'EN' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-1.5 rounded-none transition-colors ${
                isDarkPage
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-[#5C554E] hover:text-[#1E1B18] hover:bg-[#D0C9BE]/50'
              }`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE PANEL */}
      {mobileOpen && (
        <div
          className={`md:hidden px-6 py-4 space-y-3 text-sm font-sans ${
            isDarkPage
              ? 'bg-[#070F1E]/95 backdrop-blur-xl border-b border-white/10 text-white font-mono'
              : 'bg-[#EAE5DC]/98 backdrop-blur-xl border-b border-[#D0C9BE] text-[#1E1B18]'
          }`}
        >
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            01 HERO &amp; RADAR OVERVIEW
          </NavLink>
          <NavLink
            to="/map"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            TERRITORY (COMMAND MAP)
          </NavLink>
          <NavLink
            to="/alerts"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            ALERTS &amp; INCIDENT TRIAGE
          </NavLink>
          <NavLink
            to="/benchmarks"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            BENCHMARKS (RISK LEADERBOARD)
          </NavLink>
          <NavLink
            to="/analytics"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            ANALYTICS &amp; SENSORS
          </NavLink>
          <NavLink
            to="/explainability"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            EXPLAINABLE AI (XAI)
          </NavLink>
          <NavLink
            to="/threat-profiles"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            THREAT PROFILES (3-AXIS)
          </NavLink>
          <NavLink
            to="/report"
            onClick={() => setMobileOpen(false)}
            className="block py-2 font-bold hover:text-[#D9531E]"
          >
            REPORT GROUND INCIDENT
          </NavLink>
          <div
            className={`pt-2 flex items-center justify-between border-t ${
              isDarkPage ? 'border-white/10' : 'border-[#D0C9BE]'
            }`}
          >
            <span className={`text-xs font-bold ${isDarkPage ? 'text-white/70' : 'text-[#78716C]'}`}>Language:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLang('EN')}
                className={`px-3 py-0.5 rounded-none text-xs font-extrabold ${
                  selectedLang === 'EN'
                    ? isDarkPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#D9531E] text-white'
                    : 'text-white/60'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setSelectedLang('HI')}
                className={`px-3 py-0.5 rounded-none text-xs font-extrabold ${
                  selectedLang === 'HI'
                    ? isDarkPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#D9531E] text-white'
                    : 'text-white/60'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
