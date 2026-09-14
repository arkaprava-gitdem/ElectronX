import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  RotateCcw,
  Sliders,
  Thermometer,
  FlaskConical,
  Activity,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { LabViewId } from '../../types';

interface PNJunctionLabProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const PNJunctionLabView: React.FC<PNJunctionLabProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [biasVoltage, setBiasVoltage] = useState<number>(0.65); // Volts
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [naDoping, setNaDoping] = useState<number>(1e16); // cm^-3
  const [ndDoping, setNdDoping] = useState<number>(1e16); // cm^-3
  const [isZenerMode, setIsZenerMode] = useState<boolean>(false);
  const [zenerBreakdownV, setZenerBreakdownV] = useState<number>(5.1); // Volts
  const [activeTab, setActiveTab] = useState<'cross-section' | 'energy-band' | 'vi-curve'>('cross-section');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Notify parent on parameter interaction
  useEffect(() => {
    onSimulate();
  }, [biasVoltage, temperature, naDoping, ndDoping, isZenerMode, zenerBreakdownV]);

  // Physical constants
  const q = 1.602e-19;
  const eps0 = 8.854e-14; // F/cm
  const eps_r = 11.7; // Silicon relative permittivity
  const eps_s = eps_r * eps0;
  const kB = 1.3806e-23;
  const ni_300K = 1.5e10; // cm^-3
  // Temperature dependence of ni
  const ni = ni_300K * Math.pow(temperature / 300, 1.5) * Math.exp((-1.12 * q) / (2 * kB * temperature) + (1.12 * q) / (2 * kB * 300));
  const Vt = (kB * temperature) / q; // Volts

  // Built-in potential: Vbi = Vt * ln((NA * ND) / ni^2)
  const Vbi = useMemo(() => {
    const ratio = Math.max(1, (naDoping * ndDoping) / Math.pow(Math.max(ni, 1e8), 2));
    return Number((Vt * Math.log(ratio)).toFixed(3));
  }, [Vt, naDoping, ndDoping, ni]);

  // Net potential across barrier: Vbi - V (must be >= 0.05 for physical numerical stability)
  const netBarrier = Math.max(0.05, Vbi - biasVoltage);

  // Depletion Width: W = sqrt( (2 * eps_s / q) * (1/NA + 1/ND) * (Vbi - V) )
  const depletionWidth_um = useMemo(() => {
    const factor = (2 * eps_s / q) * (1 / naDoping + 1 / ndDoping) * netBarrier;
    const W_cm = Math.sqrt(Math.max(0, factor));
    return Number((W_cm * 1e4).toFixed(3)); // in micrometers
  }, [eps_s, q, naDoping, ndDoping, netBarrier]);

  // Max Electric Field: Emax = (2 * netBarrier) / W
  const Emax_kVcm = useMemo(() => {
    const W_cm = depletionWidth_um * 1e-4;
    if (W_cm <= 0) return 0;
    const E = (2 * netBarrier) / W_cm;
    return Number((E / 1000).toFixed(1)); // kV/cm
  }, [netBarrier, depletionWidth_um]);

  // Shockley Diode Current calculation
  const diodeCurrent_mA = useMemo(() => {
    const eta = 1.15;
    const Is = 1e-11 * Math.pow(temperature / 300, 3) * Math.exp((-1.12 / 8.617e-5) * (1 / temperature - 1 / 300));

    if (isZenerMode) {
      if (biasVoltage < -zenerBreakdownV) {
        // In breakdown
        const overV = Math.abs(biasVoltage) - zenerBreakdownV;
        const Rz = 10; // ohms
        return -(overV / Rz) * 1000; // mA
      } else if (biasVoltage < 0) {
        return -Is * 1e3;
      }
    }

    if (biasVoltage >= 0) {
      const expTerm = Math.min(biasVoltage / (eta * Vt), 28);
      const I_A = Is * (Math.exp(expTerm) - 1);
      return Number((I_A * 1000).toFixed(2));
    } else {
      // Reverse bias
      if (biasVoltage < -5.0 && !isZenerMode) {
        // Avalanche breakdown
        return -50;
      }
      return Number((-Is * 1e6).toFixed(3)); // microamps or negligible
    }
  }, [biasVoltage, temperature, Vt, isZenerMode, zenerBreakdownV]);

  // Generate V-I Curve data
  const viCurveData = useMemo(() => {
    const data = [];
    const minV = isZenerMode ? -(zenerBreakdownV + 1.5) : -3.0;
    const maxV = 0.85;
    const step = 0.05;

    for (let v = minV; v <= maxV; v += step) {
      let i_mA = 0;
      const eta = 1.15;
      const Is = 1e-11;

      if (isZenerMode && v < -zenerBreakdownV) {
        const overV = Math.abs(v) - zenerBreakdownV;
        i_mA = -(overV / 10) * 1000;
      } else if (v >= 0) {
        const expTerm = Math.min(v / (eta * Vt), 28);
        i_mA = (Is * (Math.exp(expTerm) - 1)) * 1000;
      } else {
        i_mA = -0.001;
      }

      data.push({
        voltage: Number(v.toFixed(2)),
        current: Number(Math.max(-80, Math.min(80, i_mA)).toFixed(2)),
      });
    }
    return data;
  }, [isZenerMode, zenerBreakdownV, Vt]);

  // Animated Junction Cross Section Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 550);
    let height = (canvas.height = 200);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
    };
    window.addEventListener('resize', handleResize);

    // Visual depletion width in pixels: scales between 20px (forward bias) and 140px (deep reverse)
    const baseW = 60;
    const pixelW = Math.max(15, Math.min(150, baseW * Math.sqrt(netBarrier / Vbi)));

    // Carrier particles
    interface Carrier {
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'hole' | 'electron';
    }

    const carriers: Carrier[] = [];
    for (let i = 0; i < 35; i++) {
      // P-side holes
      carriers.push({
        x: Math.random() * (width / 2 - pixelW / 2 - 20) + 10,
        y: Math.random() * (height - 30) + 15,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'hole',
      });
      // N-side electrons
      carriers.push({
        x: width / 2 + pixelW / 2 + 10 + Math.random() * (width / 2 - pixelW / 2 - 20),
        y: Math.random() * (height - 30) + 15,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'electron',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const midX = width / 2;
      const xLeft = midX - pixelW / 2;
      const xRight = midX + pixelW / 2;

      // P-region Background
      ctx.fillStyle = '#1e111a';
      ctx.fillRect(0, 0, xLeft, height);

      // N-region Background
      ctx.fillStyle = '#0c1b2b';
      ctx.fillRect(xRight, 0, width - xRight, height);

      // Depletion Region (space-charge layer)
      ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
      ctx.fillRect(xLeft, 0, pixelW, height);

      // Depletion Boundaries
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xLeft, 0);
      ctx.lineTo(xLeft, height);
      ctx.moveTo(xRight, 0);
      ctx.lineTo(xRight, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Metallurgical junction center line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, height);
      ctx.stroke();

      // Draw Immobile Space-Charge Ions inside Depletion Layer
      // P-side: negative acceptor ions [-]
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      for (let y = 35; y < height - 20; y += 40) {
        ctx.fillText('[-]', (xLeft + midX) / 2, y);
      }
      // N-side: positive donor ions [+]
      ctx.fillStyle = '#06b6d4';
      for (let y = 35; y < height - 20; y += 40) {
        ctx.fillText('[+]', (midX + xRight) / 2, y);
      }

      // Electric Field arrow inside Depletion Region (points from + to -)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xRight - 5, height - 15);
      ctx.lineTo(xLeft + 5, height - 15);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(xLeft + 5, height - 19);
      ctx.lineTo(xLeft, height - 15);
      ctx.lineTo(xLeft + 5, height - 11);
      ctx.fill();

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`Internal E-Field (${Emax_kVcm} kV/cm)`, midX, height - 20);

      // Section Labels
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`P-REGION (NA = ${naDoping.toExponential(0)})`, xLeft / 2, 20);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`N-REGION (ND = ${ndDoping.toExponential(0)})`, (xRight + width) / 2, 20);

      ctx.fillStyle = '#facc15';
      ctx.fillText(`DEPLETION LAYER: W = ${depletionWidth_um} μm`, midX, 20);

      // Render Moving Mobile Charge Carriers
      carriers.forEach((c) => {
        // Forward bias injects carriers across barrier
        if (biasVoltage > 0.65) {
          if (c.type === 'hole') c.x += 0.8;
          if (c.type === 'electron') c.x -= 0.8;
        }

        c.x += c.vx;
        c.y += c.vy;

        // Carrier boundary bounce / repulsion by depletion field
        if (c.type === 'hole') {
          if (c.x < 10) c.x = 10;
          if (c.x > xLeft - 5 && biasVoltage < 0.6) c.vx *= -1;
          if (c.x > width - 10) c.x = 10;
        } else {
          if (c.x > width - 10) c.x = width - 10;
          if (c.x < xRight + 5 && biasVoltage < 0.6) c.vx *= -1;
          if (c.x < 10) c.x = width - 10;
        }

        if (c.y < 25) c.vy *= -1;
        if (c.y > height - 25) c.vy *= -1;

        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
        if (c.type === 'hole') {
          ctx.fillStyle = '#f43f5e';
          ctx.fill();
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [netBarrier, Vbi, naDoping, ndDoping, depletionWidth_um, Emax_kVcm, biasVoltage]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101928] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              MODULE 02
            </span>
            <span className="text-xs font-mono text-slate-400">Junctions & Rectifiers</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>PN Junction & Zener Diode Laboratory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Directly manipulate bias potentials, observe depletion layer thinning/expansion, energy band bending, Shockley conduction, and Zener quantum breakdown.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            id="pn-lab-zener-toggle"
            onClick={() => setIsZenerMode(!isZenerMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
              isZenerMode
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{isZenerMode ? 'ZENER MODE: ACTIVE' : 'SWITCH TO ZENER'}</span>
          </button>

          <button
            id="pn-lab-launch-exp-btn"
            onClick={() => onNavigate('experiments', isZenerMode ? 'exp-zener-breakdown' : 'exp-pn-forward')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>RUN LAB EXP</span>
          </button>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Biasing & Material Knobs</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Educational Model
              </span>
            </div>

            {/* Quick Bias Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Quick Operating State Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setBiasVoltage(0.0)}
                  className={`p-2 rounded-lg text-xs font-mono transition text-left ${
                    biasVoltage === 0
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Equilibrium (0V)
                </button>
                <button
                  onClick={() => setBiasVoltage(0.70)}
                  className={`p-2 rounded-lg text-xs font-mono transition text-left ${
                    biasVoltage === 0.7
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Forward (+0.70V)
                </button>
                <button
                  onClick={() => setBiasVoltage(-2.0)}
                  className={`p-2 rounded-lg text-xs font-mono transition text-left ${
                    biasVoltage === -2.0
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reverse (-2.0V)
                </button>
                <button
                  onClick={() => setBiasVoltage(isZenerMode ? -zenerBreakdownV : -5.0)}
                  className={`p-2 rounded-lg text-xs font-mono transition text-left ${
                    biasVoltage <= -5.0 || (isZenerMode && biasVoltage <= -zenerBreakdownV)
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Breakdown ({isZenerMode ? `-${zenerBreakdownV}V` : '-5.0V'})
                </button>
              </div>
            </div>

            {/* Bias Voltage Continuous Slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Applied Bias (V):</span>
                <span className={biasVoltage >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {biasVoltage > 0 ? `+${biasVoltage.toFixed(2)}` : biasVoltage.toFixed(2)} Volts
                </span>
              </div>
              <input
                type="range"
                min="-6.0"
                max="0.85"
                step="0.05"
                value={biasVoltage}
                onChange={(e) => setBiasVoltage(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>-6.0V (Reverse)</span>
                <span>0V (Thermal Eq)</span>
                <span>+0.85V (Forward)</span>
              </div>
            </div>

            {/* Zener Breakdown Selector (when active) */}
            {isZenerMode && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                <div className="flex justify-between text-xs font-mono text-amber-300 font-semibold">
                  <span>Zener Breakdown Rating:</span>
                  <span>{zenerBreakdownV} V</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[3.3, 5.1, 6.8, 12.0].map((vz) => (
                    <button
                      key={vz}
                      onClick={() => setZenerBreakdownV(vz)}
                      className={`py-1 rounded text-[10px] font-mono transition ${
                        zenerBreakdownV === vz
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {vz}V
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Temperature Slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Junction Temp (T):</span>
                </span>
                <span className="text-amber-400 font-bold">{temperature} K</span>
              </div>
              <input
                type="range"
                min="250"
                max="400"
                step="10"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Doping Adjusters */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block">
                  Acceptor NA (P-side)
                </label>
                <select
                  value={naDoping}
                  onChange={(e) => setNaDoping(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-rose-400 focus:outline-none"
                >
                  <option value={1e15}>1 × 10¹⁵ cm⁻³</option>
                  <option value={1e16}>1 × 10¹⁶ cm⁻³</option>
                  <option value={1e17}>1 × 10¹⁷ cm⁻³</option>
                  <option value={5e17}>5 × 10¹⁷ cm⁻³ (Heavy)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 block">
                  Donor ND (N-side)
                </label>
                <select
                  value={ndDoping}
                  onChange={(e) => setNdDoping(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 focus:outline-none"
                >
                  <option value={1e15}>1 × 10¹⁵ cm⁻³</option>
                  <option value={1e16}>1 × 10¹⁶ cm⁻³</option>
                  <option value={1e17}>1 × 10¹⁷ cm⁻³</option>
                  <option value={5e17}>5 × 10¹⁷ cm⁻³ (Heavy)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Real-time Physical State Telemetry */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase">
              Real-time Calculated Metrics:
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Built-in Potential (Vbi):</span>
              <span className="text-cyan-400 font-bold">{Vbi} V</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Depletion Width (W):</span>
              <span className="text-amber-300 font-bold">{depletionWidth_um} μm</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Peak Electric Field (Emax):</span>
              <span className="text-rose-400 font-bold">{Emax_kVcm} kV/cm</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Effective Barrier Height:</span>
              <span className="text-slate-200 font-bold">{netBarrier.toFixed(2)} eV</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>Diode Current (I):</span>
              <span className="text-emerald-400 font-bold text-sm">
                {diodeCurrent_mA.toFixed(2)} mA
              </span>
            </div>
          </div>
        </div>

        {/* Right: Visualization & Plots (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub-tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('cross-section')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'cross-section'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Space-Charge Cross Section
              </button>
              <button
                onClick={() => setActiveTab('energy-band')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'energy-band'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Energy Band Bending
              </button>
              <button
                onClick={() => setActiveTab('vi-curve')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'vi-curve'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Dynamic V-I Curve
              </button>
            </div>
          </div>

          {/* VIEW 1: Cross Section Canvas */}
          {activeTab === 'cross-section' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    Metallurgical Junction & Space-Charge Carrier Dynamics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Observe how bias alters the depletion barrier. In forward bias, the barrier collapses; in reverse bias, space charge expands.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  W ∝ √(Vbi - V)
                </span>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-52 block" />
              </div>

              {/* Dynamic status pill */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-slate-300 font-mono">
                    State: {biasVoltage > 0.65 ? 'Forward Conduction (Barrier Collapsed)' : biasVoltage > 0 ? 'Sub-cut-in Forward' : biasVoltage < -zenerBreakdownV && isZenerMode ? 'Zener Breakdown (Quantum Tunneling)' : 'Reverse Biased (Drift Leakage Only)'}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  Vcut-in ≈ 0.70 V (Silicon)
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: Energy Band Diagram */}
          {activeTab === 'energy-band' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    Energy-Band Bending Across the Junction
                  </h3>
                  <p className="text-xs text-slate-400">
                    Under equilibrium, the Fermi level EF is flat. Applying forward voltage raises the P-side band energies relative to N-side by qV, reducing the electron barrier.
                  </p>
                </div>
              </div>

              {/* Band diagram visualization */}
              <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between font-mono text-xs relative overflow-hidden">
                {/* Visual band slope */}
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Conduction Band Ec */}
                  <path
                    d={`M 20,${40 - biasVoltage * 25} Q 280,${40 - biasVoltage * 25} 320,100 L 580,100`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  {/* Valence Band Ev */}
                  <path
                    d={`M 20,${120 - biasVoltage * 25} Q 280,${120 - biasVoltage * 25} 320,180 L 580,180`}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                  />
                  {/* Fermi Level EF */}
                  <line
                    x1="20"
                    y1={110 - biasVoltage * 25}
                    x2="280"
                    y2={110 - biasVoltage * 25}
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="320"
                    y1="110"
                    x2="580"
                    y2="110"
                    stroke="#eab308"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  {/* Barrier bracket */}
                  <line x1="300" y1={40 - biasVoltage * 25} x2="300" y2="100" stroke="#94a3b8" strokeWidth="1" />
                </svg>

                <div className="absolute top-4 left-6 text-rose-400">
                  <span>P-Region Bands</span>
                  <span className="block text-[10px] text-slate-400">Fermi level EF near Ev</span>
                </div>
                <div className="absolute bottom-4 right-6 text-cyan-400 text-right">
                  <span>N-Region Bands</span>
                  <span className="block text-[10px] text-slate-400">Fermi level EF near Ec</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="text-amber-300 font-bold block">
                    Barrier Height: q(Vbi - V) = {netBarrier.toFixed(2)} eV
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {biasVoltage > 0 ? 'Barrier lowered by forward bias' : 'Barrier heightened by reverse bias'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: Dynamic V-I Curve */}
          {activeTab === 'vi-curve' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    {isZenerMode ? 'Zener Diode Static V-I Characteristics' : 'PN Diode Static V-I Characteristics'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Yellow dot indicates the current operating bias point (VD = {biasVoltage.toFixed(2)}V, ID = {diodeCurrent_mA.toFixed(2)}mA).
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                  Shockley Equation
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viCurveData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="voltage"
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Diode Voltage VD [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Diode Current ID [mA]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} mA`, 'Current']}
                      labelFormatter={(label) => `Voltage: ${label} V`}
                    />
                    <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                    <ReferenceLine x={0.7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Vγ = 0.7V', fill: '#10b981', fontSize: 10 }} />
                    {isZenerMode && (
                      <ReferenceLine x={-zenerBreakdownV} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Vz = -${zenerBreakdownV}V`, fill: '#f59e0b', fontSize: 10 }} />
                    )}
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    {/* Operating Point Marker */}
                    <ReferenceDot
                      x={Number(biasVoltage.toFixed(2))}
                      y={Number(Math.max(-80, Math.min(80, diodeCurrent_mA)).toFixed(2))}
                      r={6}
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span>Dynamic Resistance (rf = ΔV/ΔI): <strong>{diodeCurrent_mA > 1 ? `${((1.15 * Vt * 1000) / diodeCurrent_mA).toFixed(1)} Ω` : '> 10 kΩ'}</strong></span>
                <span className="text-amber-400 font-bold">Q-Point: ({biasVoltage.toFixed(2)} V, {diodeCurrent_mA.toFixed(2)} mA)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
