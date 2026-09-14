import React, { useState } from 'react';
import {
  Search,
  Activity,
  Award,
  Sparkles,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { LabViewId, StudentProgress } from '../../types';

interface NavbarProps {
  currentView: LabViewId;
  onNavigate: (view: LabViewId) => void;
  progress: StudentProgress;
  onOpenSearch: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  progress,
  onOpenSearch,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const getViewTitle = (view: LabViewId) => {
    switch (view) {
      case 'landing': return 'Welcome';
      case 'dashboard': return 'Laboratory Workspace';
      case 'physics': return 'Semiconductor Physics Explorer';
      case 'pn-junction': return 'PN Junction & Zener Lab';
      case 'bjt': return 'Common-Emitter BJT Laboratory';
      case 'mosfet': return 'FET, MOSFET & CMOS Laboratory';
      case 'opto': return 'Optoelectronics & Solar Cell Lab';
      case 'special-devices': return 'Special Semiconductor Devices';
      case 'circuit-builder': return 'Virtual Circuit Builder';
      case 'experiments': return 'Virtual Laboratory Experiments';
      case 'comparator': return 'Device Comparator';
      case 'mentor': return 'ElectronX AI Mentor';
      case 'formulas': return 'Formula Vault & Calculator';
      case 'quizzes': return 'Syllabus Assessment & Quiz';
      case 'about': return 'About ElectronX (PCCEC301)';
      default: return 'Laboratory';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            id="navbar-brand-button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-[#0b0f17] rounded-[7px] flex items-center justify-center">
                <span className="font-display text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">
                  EX
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold tracking-wider text-base text-white group-hover:text-cyan-400 transition">
                  ELECTRONX
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                Semiconductor Lab
              </span>
            </div>
          </div>

          {/* Current view breadcrumb */}
          {currentView !== 'landing' && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
              <span className="text-slate-400">Lab</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-medium">{getViewTitle(currentView)}</span>
            </div>
          )}
        </div>

        {/* Center: Quick Search Trigger */}
        <button
          id="navbar-search-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-slate-200 text-xs transition group w-44 sm:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
          <span className="flex-1 text-left truncate">Search devices, formulas...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Right: Telemetry & Lab Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-900/40 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium tracking-tight">
              ElectronX Lab • Online
            </span>
          </div>

          {/* Lab Score Badge */}
          <button
            id="navbar-score-badge"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-xs transition cursor-pointer"
            title="Your Cumulative Laboratory Score"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-semibold text-amber-300 text-xs">
              {progress.labScore}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">PTS</span>
          </button>

          {/* AI Mentor Quick Link */}
          <button
            id="navbar-mentor-quick-btn"
            onClick={() => onNavigate('mentor')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-700/50 hover:border-cyan-400 text-cyan-300 text-xs font-medium transition cursor-pointer shadow-sm shadow-cyan-900/20"
            title="Ask ElectronX AI Mentor"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">AI Mentor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
