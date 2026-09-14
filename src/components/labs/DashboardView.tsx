import React from 'react';
import {
  Zap,
  Cpu,
  Layers,
  SunMedium,
  FlaskConical,
  Award,
  Activity,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2
} from 'lucide-react';
import { LabViewId, StudentProgress } from '../../types';
import { SEMICONDUCTOR_DEVICES } from '../../data/devices';
import { VIRTUAL_EXPERIMENTS } from '../../data/experiments';

interface DashboardProps {
  progress: StudentProgress;
  onNavigate: (view: LabViewId) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  progress,
  onNavigate,
}) => {
  // Select a "Device of the Day" deterministically based on date
  const dayIndex = new Date().getDate() % SEMICONDUCTOR_DEVICES.length;
  const deviceOfTheDay = SEMICONDUCTOR_DEVICES[dayIndex] || SEMICONDUCTOR_DEVICES[0];

  const popularLabs = [
    {
      id: 'pn-junction',
      title: 'PN Junction & Zener Lab',
      desc: 'Visualize dynamic depletion region, energy band bending, and reverse breakdown voltage.',
      icon: Zap,
      view: 'pn-junction' as LabViewId,
      tag: 'Core Diode Physics',
      color: 'from-cyan-500/20 to-sky-500/10'
    },
    {
      id: 'bjt',
      title: 'Common-Emitter BJT',
      desc: 'Explore active, saturation, and cutoff regions with dynamic Q-point on the DC load line.',
      icon: Cpu,
      view: 'bjt' as LabViewId,
      tag: 'Bipolar Amplification',
      color: 'from-indigo-500/20 to-blue-500/10'
    },
    {
      id: 'mosfet',
      title: 'CMOS Inverter & MOSFETs',
      desc: 'Investigate quadratic drain current, noise margins on VTC, and 3D FinFET gate control.',
      icon: Layers,
      view: 'mosfet' as LabViewId,
      tag: 'Digital VLSI',
      color: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      id: 'opto',
      title: 'Solar Cell & Photonics',
      desc: 'Plot I-V / P-V curves, determine Maximum Power Point (MPPT), and compute Fill Factor.',
      icon: SunMedium,
      view: 'opto' as LabViewId,
      tag: 'Energy & Opto',
      color: 'from-amber-500/20 to-yellow-500/10'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1424] to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
              LABORATORY WORKSPACE
            </span>
            <span className="text-xs font-mono text-slate-400">PCCEC301</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Semiconductor Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Your interactive workspace for device physics visualization, dynamic characteristics, virtual experiments, and AI mentorship.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            id="dashboard-start-experiment-btn"
            onClick={() => onNavigate('experiments')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>START EXPERIMENT</span>
          </button>
          <button
            id="dashboard-browse-devices-btn"
            onClick={() => onNavigate('comparator')}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <span>COMPARE DEVICES</span>
          </button>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Engineering Simulation Disclaimer:</strong> Numerical models run in real-time in your browser using standard physical equations (Shockley, Poisson approximation, quadratic MOSFET models) for educational intuition and classroom demonstration.
        </span>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Devices Explored
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-white">
                {progress.devicesExplored.length}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 12</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Simulations Run
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-white">
                {progress.simulationsRun}
              </span>
              <span className="text-xs font-mono text-emerald-400">ACTIVE</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Experiments Completed
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-white">
                {progress.experimentsCompleted.length}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 8</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-800/50 text-indigo-400">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Cumulative Lab Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-amber-400">
                {progress.labScore}
              </span>
              <span className="text-xs font-mono text-slate-400">PTS</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800/50 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Popular Labs & Continue Experiment / Device of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Popular Interactive Labs (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Popular Laboratories</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Real-time Simulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularLabs.map((lab) => {
              const Icon = lab.icon;
              return (
                <div
                  key={lab.id}
                  id={`dashboard-lab-${lab.id}`}
                  onClick={() => onNavigate(lab.view)}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 group-hover:scale-105 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {lab.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-200 group-hover:text-cyan-300 transition">
                        {lab.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {lab.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                    <span>Enter Laboratory</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links Row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onNavigate('physics')}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 text-left transition"
            >
              <span className="text-[10px] font-mono text-slate-400 block">MODULE 01</span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                Fermi-Dirac Physics
              </span>
            </button>
            <button
              onClick={() => onNavigate('circuit-builder')}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 text-left transition"
            >
              <span className="text-[10px] font-mono text-slate-400 block">INTERACTIVE</span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                Circuit Builder
              </span>
            </button>
            <button
              onClick={() => onNavigate('formulas')}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 text-left transition"
            >
              <span className="text-[10px] font-mono text-slate-400 block">REFERENCE</span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">
                Formula Vault
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Continue Experiment & Device of the Day (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Continue Experiment Card */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#111827] to-[#0c101a] border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                ACTIVE LAB SESSION
              </span>
              <FlaskConical className="w-4 h-4 text-cyan-400" />
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-slate-100">
                {VIRTUAL_EXPERIMENTS[0].title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Plot static forward V-I characteristics, verify knee potential, and measure dynamic resistance rf.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="font-mono text-slate-400 text-[11px]">Est. 20 mins</span>
              <button
                id="dashboard-resume-exp-btn"
                onClick={() => onNavigate('experiments')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Resume Lab</span>
              </button>
            </div>
          </div>

          {/* Device of the Day */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Device of the Day</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {deviceOfTheDay.module}
              </span>
            </div>

            <div>
              <h4 className="font-display font-bold text-base text-slate-100">
                {deviceOfTheDay.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1 italic">
                &ldquo;{deviceOfTheDay.tagline}&rdquo;
              </p>
            </div>

            {/* Quick Cross Section Preview */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Dominant Carriers:</span>
                <span className="text-cyan-400">{deviceOfTheDay.carrierType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Input Control:</span>
                <span className="text-slate-200">{deviceOfTheDay.controlMechanism}</span>
              </div>
            </div>

            <button
              id="dashboard-view-device-day-btn"
              onClick={() => {
                let targetView: LabViewId = 'pn-junction';
                if (deviceOfTheDay.id.includes('bjt')) targetView = 'bjt';
                else if (deviceOfTheDay.id.includes('mos') || deviceOfTheDay.id.includes('fet') || deviceOfTheDay.id.includes('cmos')) targetView = 'mosfet';
                else if (deviceOfTheDay.category === 'opto') targetView = 'opto';
                else if (deviceOfTheDay.category === 'special') targetView = 'special-devices';
                onNavigate(targetView);
              }}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <span>Explore Device Physics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* AI Mentor Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-indigo-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Have a physics question?</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ask the ElectronX AI Mentor for 5-level structured breakdown.
              </p>
            </div>
            <button
              onClick={() => onNavigate('mentor')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
