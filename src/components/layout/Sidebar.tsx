import React from 'react';
import {
  LayoutDashboard,
  Atom,
  Zap,
  Cpu,
  Layers,
  SunMedium,
  Radio,
  Share2,
  FlaskConical,
  Scale,
  Sparkles,
  Calculator,
  HelpCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { LabViewId, StudentProgress } from '../../types';

interface SidebarProps {
  currentView: LabViewId;
  onNavigate: (view: LabViewId) => void;
  progress: StudentProgress;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: LabViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  module?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  progress,
  mobileMenuOpen,
  onCloseMobile,
}) => {
  const primaryNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'physics', label: 'Semiconductor Physics', icon: Atom, module: 'MOD 01' },
    { id: 'pn-junction', label: 'PN Junction Lab', icon: Zap, module: 'MOD 02' },
    { id: 'bjt', label: 'BJT Lab', icon: Cpu, module: 'MOD 02' },
    { id: 'mosfet', label: 'MOSFET & CMOS Lab', icon: Layers, module: 'MOD 03' },
    { id: 'opto', label: 'Optoelectronics', icon: SunMedium, module: 'MOD 04' },
    { id: 'special-devices', label: 'Special Devices', icon: Radio, module: 'MOD 05' },
  ];

  const toolsNav: NavItem[] = [
    { id: 'circuit-builder', label: 'Circuit Builder', icon: Share2, tag: 'Interactive' },
    { id: 'experiments', label: 'Virtual Experiments', icon: FlaskConical, tag: '8 Labs' },
    { id: 'comparator', label: 'Device Comparator', icon: Scale },
    { id: 'mentor', label: 'AI Mentor', icon: Sparkles, tag: 'Smart' },
    { id: 'formulas', label: 'Formula Vault', icon: Calculator },
    { id: 'quizzes', label: 'Syllabus Quizzes', icon: CheckCircle2 },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleItemClick = (id: LabViewId) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:sticky top-[49px] left-0 z-35 h-[calc(100vh-49px)] w-64 bg-[#0d121c] border-r border-slate-800/80 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-5">
          {/* Main Labs Group */}
          <div>
            <div className="px-2.5 mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Core Laboratories
              </span>
            </div>

            <nav className="space-y-0.5">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer group ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.module && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {item.module}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Workbench & Tools Group */}
          <div>
            <div className="px-2.5 mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Analysis & Tools
              </span>
            </div>

            <nav className="space-y-0.5">
              {toolsNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer group ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.tag && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-cyan-950 text-cyan-300'
                            : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Syllabus & Quick Stats */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <div className="rounded-lg p-2.5 bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Syllabus Covered</span>
              <span className="text-cyan-400 font-semibold">
                {Math.min(100, Math.round((progress.devicesExplored.length / 12) * 100))}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((progress.devicesExplored.length / 12) * 100))}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Basic Electronic Devices</span>
              <span className="text-slate-300 font-semibold">PCCEC301</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
