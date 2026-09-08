import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-[#0A0908]">
      {/* Ambient Floating Cinematic Video Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0A0908]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 filter blur-[1px] brightness-[0.85] contrast-[1.1] opacity-80 transition-opacity duration-1000"
        >
          <source src="/hero_smoke_bg.mp4" type="video/mp4" />
        </video>
        {/* Soft Vignette & Subtle Gradients ensuring the video is clearly visible while keeping text crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0908]/60 via-transparent to-[#0A0908]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-[#0A0908]/60" />
      </div>

      {/* Center Editorial Headline */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center items-center text-center z-10">
        <div className="max-w-5xl space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono uppercase tracking-[0.2em] text-amber-200">
            <span className="w-2 h-2 rounded-full bg-[#D8582B] animate-pulse" />
            {t.sources_monitored}
          </div>

          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            {t.hero_title_1}<br />
            <span className="italic font-light">{t.hero_title_2}</span><br />
            {t.hero_title_3}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/70 font-sans font-light leading-relaxed">
            {t.hero_subtitle}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/map')}
              className="px-7 py-3.5 rounded-full bg-[#D8582B] hover:bg-[#B84318] text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>{t.explore_radar}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/alerts')}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200"
            >
              {t.view_critical_alerts}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
