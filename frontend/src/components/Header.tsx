import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  Satellite, 
  ShieldAlert, 
  BarChart3, 
  Cpu, 
  Volume2, 
  VolumeX, 
  PlayCircle, 
  Map, 
  Layers,
  Flame,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { sound } from '../services/sound';

interface HeaderProps {
  activeTab: 'map' | 'alerts' | 'analytics' | 'explainability';
  setActiveTab: (tab: 'map' | 'alerts' | 'analytics' | 'explainability') => void;
  onOpenDemoScenarios: () => void;
  criticalAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDemoScenarios,
  criticalAlertCount
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleTabChange = (tab: 'map' | 'alerts' | 'analytics' | 'explainability') => {
    sound.playSelect();
    setActiveTab(tab);
  };

  return (
    <header className="bg-command-card border-b border-command-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none relative z-30 shadow-lg">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/40 border border-command-cyan/50 text-command-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Satellite className="w-6 h-6 animate-pulse-slow" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-command-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-command-cyan"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-1.5">
              THERMO<span className="text-command-cyan glow-cyan">INTEL</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-command-cyan border border-command-cyan/40">
              SIH 26162
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-command-emerald border border-command-emerald/40 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-command-emerald animate-pulse"></span>
              VIIRS/S2 OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-command-textMuted font-mono">
            AI-Powered Industrial Thermal Intelligence & Monitoring Platform
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-command-bg/80 p-1 rounded-lg border border-command-border">
        <button
          onClick={() => handleTabChange('map')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'map'
              ? 'bg-command-cyan/20 text-command-cyan border border-command-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'text-command-textMuted hover:text-white hover:bg-command-card'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          GIS Command Map
        </button>

        <button
          onClick={() => handleTabChange('alerts')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all relative ${
            activeTab === 'alerts'
              ? 'bg-command-crimson/20 text-command-crimson border border-command-crimson/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              : 'text-command-textMuted hover:text-white hover:bg-command-card'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Alerts Triage
          {criticalAlertCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-command-crimson text-white font-bold animate-pulse">
              {criticalAlertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-command-amber/20 text-command-amber border border-command-amber/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'text-command-textMuted hover:text-white hover:bg-command-card'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Analytics & Trends
        </button>

        <button
          onClick={() => handleTabChange('explainability')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'explainability'
              ? 'bg-command-purple/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
              : 'text-command-textMuted hover:text-white hover:bg-command-card'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Explainable AI (XAI)
        </button>
      </nav>

      {/* Right Controls: Telemetry, Audio, Demo Tour */}
      <div className="flex items-center gap-3">
        {/* Time and Telemetry ticker */}
        <div className="hidden xl:flex flex-col items-end text-[11px] font-mono text-command-textMuted">
          <div className="flex items-center gap-1 text-command-cyan">
            <Radio className="w-3 h-3 text-command-cyan animate-pulse" />
            <span>REGION: INDIA BOX (90-DAY)</span>
          </div>
          <span className="text-slate-400">{timeStr}</span>
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
          className="p-2 rounded-lg bg-command-bg border border-command-border text-command-textMuted hover:text-white hover:border-command-cyan transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-command-cyan" />}
        </button>

        {/* Guided Demo Tour Launcher */}
        <button
          onClick={() => {
            sound.playSelect();
            onOpenDemoScenarios();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all transform hover:scale-[1.02]"
        >
          <PlayCircle className="w-4 h-4 text-white" />
          <span>Demo Scenarios</span>
        </button>
      </div>
    </header>
  );
};
