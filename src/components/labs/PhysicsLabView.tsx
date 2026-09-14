import React, { useState, useEffect, useRef } from 'react';
import {
  Atom,
  Thermometer,
  Zap,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { LabViewId } from '../../types';

interface PhysicsLabProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId) => void;
}

export const PhysicsLabView: React.FC<PhysicsLabProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'fermi' | 'transport' | 'conductivity' | 'hall'>('fermi');

  // Fermi-Dirac State
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [dopingType, setDopingType] = useState<'intrinsic' | 'n-type' | 'p-type'>('intrinsic');

  // Transport State
  const [electricField, setElectricField] = useState<number>(150); // V/cm
  const [transportTemp, setTransportTemp] = useState<number>(300); // K
  const [carrierDensity, setCarrierDensity] = useState<number>(30); // arbitrary particle visual count
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Conductivity Calculator State
  const [nConc, setNConc] = useState<number>(1e16); // cm^-3
  const [pConc, setPConc] = useState<number>(2.25e4); // cm^-3
  const [muN, setMuN] = useState<number>(1350); // cm^2/(V·s)
  const [muP, setMuP] = useState<number>(450); // cm^2/(V·s)
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Hall Effect State
  const [hallBField, setHallBField] = useState<number>(0.5); // Tesla
  const [hallCurrent, setHallCurrent] = useState<number>(10); // mA
  const [hallType, setHallType] = useState<'n-type' | 'p-type'>('n-type');

  // Trigger telemetry
  useEffect(() => {
    onSimulate();
  }, [temperature, dopingType, electricField, transportTemp, hallBField, hallCurrent, hallType]);

  // Generate Fermi-Dirac Data points
  const fermiData = React.useMemo(() => {
    const data = [];
    const kB = 8.617333262145e-5; // eV/K
    const Ef = dopingType === 'intrinsic' ? 0 : (dopingType === 'n-type' ? 0.25 : -0.25); // eV relative to midgap
    const kT = kB * Math.max(temperature, 1);

    for (let E = -0.6; E <= 0.6; E += 0.02) {
      let f_E = 0;
      if (temperature === 0) {
        f_E = E < Ef ? 1.0 : (E === Ef ? 0.5 : 0.0);
      } else {
        const exponent = (E - Ef) / kT;
        if (exponent > 50) f_E = 0;
        else if (exponent < -50) f_E = 1;
        else f_E = 1 / (1 + Math.exp(exponent));
      }
      data.push({
        energy: Number(E.toFixed(2)),
        prob: Number(f_E.toFixed(3)),
      });
    }
    return data;
  }, [temperature, dopingType]);

  // Drift and Diffusion Canvas Animation
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 240);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
    };
    window.addEventListener('resize', handleResize);

    // Particles: Left half is drift experiment, right half is diffusion
    interface SimParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'drift' | 'diffusion';
    }

    const particles: SimParticle[] = [];
    // Half particles drift on left
    for (let i = 0; i < carrierDensity; i++) {
      particles.push({
        x: Math.random() * (width / 2 - 20) + 10,
        y: Math.random() * (height - 30) + 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'drift',
      });
    }
    // Half particles diffuse starting from concentrated center on right
    for (let i = 0; i < carrierDensity; i++) {
      particles.push({
        x: width / 2 + 30 + Math.random() * 40,
        y: height / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'diffusion',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dividing boundary
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Section Titles
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`DRIFT DYNAMICS (E = ${electricField} V/cm)`, 15, 20);
      ctx.fillText('DIFFUSION GRADIENT (dn/dx)', width / 2 + 15, 20);

      // E-field arrow for drift side
      const driftVelocity = (electricField / 300) * 1.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, height - 15);
      ctx.lineTo(120, height - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(115, height - 19);
      ctx.lineTo(120, height - 15);
      ctx.lineTo(115, height - 11);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.fillText('Applied E-Field →', 130, height - 12);

      // Thermal velocity factor based on temperature
      const vTh = Math.sqrt(transportTemp / 300) * 1.2;

      particles.forEach((p) => {
        if (p.type === 'drift') {
          // Accelerate in -E direction (electrons move opposite to field)
          p.x -= driftVelocity;
          p.x += p.vx * vTh;
          p.y += p.vy * vTh;

          // Wrap or bounce
          if (p.x < 10) p.x = width / 2 - 15;
          if (p.x > width / 2 - 10) p.x = 10;
          if (p.y < 30) p.y = height - 30;
          if (p.y > height - 25) p.y = 35;

          // Draw electron
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Pure Brownian thermal diffusion
          p.x += p.vx * vTh * 1.5;
          p.y += p.vy * vTh * 1.5;

          // Boundary bounce
          if (p.x < width / 2 + 10 || p.x > width - 10) p.vx *= -1;
          if (p.y < 30 || p.y > height - 25) p.vy *= -1;

          // Draw diffusing carrier
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
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
  }, [carrierDensity, electricField, transportTemp]);

  // Conductivity calculation
  const q = 1.602e-19;
  const conductivity = q * (nConc * muN + pConc * muP);
  const resistivity = conductivity > 0 ? 1 / conductivity : 0;

  // Hall Voltage calculation
  // VH = (IB) / (q * n * d)
  const d_sample = 1e-4; // 100 micrometers
  const carrier_n = hallType === 'n-type' ? 1e16 : 1e16;
  const hallCoeff = (hallType === 'n-type' ? -1 : 1) / (q * carrier_n * 1e6); // m^3/C
  const VH_volts = (hallCoeff * (hallCurrent * 1e-3) * hallBField) / d_sample;
  const VH_mV = VH_volts * 1000;

  return (
    <div className="space-y-6 pb-12">
      {/* Lab Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1424] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              MODULE 01
            </span>
            <span className="text-xs font-mono text-slate-400">Course: PCCEC301</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Atom className="w-6 h-6 text-cyan-400" />
            <span>Semiconductor Physics Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Visualize carrier statistics, energy bands, drift and diffusion transport mechanisms, conductivity, and the Hall effect.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: 'fermi', label: 'Fermi-Dirac Stats' },
            { id: 'transport', label: 'Drift & Diffusion' },
            { id: 'conductivity', label: 'Conductivity Calculator' },
            { id: 'hall', label: 'Hall Effect' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`physics-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Fermi-Dirac Statistics */}
      {activeTab === 'fermi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 flex items-center justify-between">
                <span>Physics Parameters</span>
                <span className="text-[10px] font-mono text-cyan-400">f(E) vs (E - Ei)</span>
              </h3>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lattice Temperature (T):</span>
                  </span>
                  <span className="text-cyan-400 font-bold">{temperature} K</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="25"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0 K (Step Function)</span>
                  <span>300 K (Room)</span>
                  <span>600 K (Hot)</span>
                </div>
              </div>

              {/* Preset Temperatures */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[0, 150, 300, 600].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemperature(t)}
                    className={`py-1 rounded text-[11px] font-mono transition ${
                      temperature === t
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t} K
                  </button>
                ))}
              </div>

              {/* Doping / Fermi Level Position */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 block">
                  Semiconductor Doping Profile:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'intrinsic', label: 'Intrinsic (Ei)' },
                    { id: 'n-type', label: 'N-Type (EF > Ei)' },
                    { id: 'p-type', label: 'P-Type (EF < Ei)' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDopingType(d.id as any)}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition cursor-pointer ${
                        dopingType === d.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thermal Voltage Display */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Thermal Voltage (Vt = kT/q):</span>
                  <span className="text-amber-400">
                    {((8.617e-5 * Math.max(temperature, 1)) * 1000).toFixed(2)} mV
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Probability at E = EF:</span>
                  <span className="text-cyan-400">0.500 (50%)</span>
                </div>
              </div>
            </div>

            {/* Conceptual Insights Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2 text-slate-300">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physical Interpretation:</span>
              </span>
              <p className="leading-relaxed text-slate-400">
                At <strong>T = 0 K</strong>, the Fermi function behaves as an ideal mathematical step: all states below EF are 100% full, and all states above EF are completely empty. As temperature increases, thermal excitation rounds the curve, promoting electrons across the bandgap into conduction states.
              </p>
            </div>
          </div>

          {/* Chart Display (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Fermi-Dirac Distribution Function: f(E)
                </h3>
                <p className="text-xs text-slate-400">
                  Occupancy probability vs Energy level (relative to midgap intrinsic level Ei = 0 eV)
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                f(E) = 1 / [1 + exp((E - EF) / kT)]
              </span>
            </div>

            {/* Recharts Curve */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fermiData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="energy"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Energy (E - Ei) [eV]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 1.05]}
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Probability f(E)', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Occupancy']}
                    labelFormatter={(label) => `Energy: ${label} eV`}
                  />
                  <ReferenceLine y={0.5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'f(E)=0.5', fill: '#eab308', fontSize: 10 }} />
                  {dopingType === 'n-type' && (
                    <ReferenceLine x={0.25} stroke="#06b6d4" strokeDasharray="4 4" label={{ value: 'EF (N-type)', fill: '#06b6d4', fontSize: 10 }} />
                  )}
                  {dopingType === 'p-type' && (
                    <ReferenceLine x={-0.25} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'EF (P-type)', fill: '#f43f5e', fontSize: 10 }} />
                  )}
                  {dopingType === 'intrinsic' && (
                    <ReferenceLine x={0} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'EF = Ei', fill: '#a855f7', fontSize: 10 }} />
                  )}
                  <Line
                    type="monotone"
                    dataKey="prob"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Energy Band Representation Diagram */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 block uppercase">
                Band Diagram Equilibrium Reference (Silicon Eg = 1.12 eV)
              </span>
              <div className="relative h-20 w-full bg-slate-900/90 rounded-lg p-2 flex flex-col justify-between font-mono text-[11px] border border-slate-800">
                {/* Conduction Band */}
                <div className="flex items-center justify-between text-cyan-400 border-b border-cyan-500/40 pb-1">
                  <span>Conduction Band Edge (Ec = +0.56 eV)</span>
                  <span className="text-[10px] text-slate-400">Available electron states</span>
                </div>

                {/* Fermi Level Indicator */}
                <div
                  className="flex items-center justify-between text-amber-300 font-bold border-b border-amber-500/50 pb-0.5"
                  style={{
                    transform: `translateY(${dopingType === 'n-type' ? '-8px' : dopingType === 'p-type' ? '8px' : '0px'})`
                  }}
                >
                  <span>Fermi Level EF ({dopingType === 'intrinsic' ? '0.0 eV' : dopingType === 'n-type' ? '+0.25 eV' : '-0.25 eV'})</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/80 rounded border border-amber-800/40">
                    f(EF) = 0.5
                  </span>
                </div>

                {/* Valence Band */}
                <div className="flex items-center justify-between text-rose-400 border-t border-rose-500/40 pt-1">
                  <span>Valence Band Edge (Ev = -0.56 eV)</span>
                  <span className="text-[10px] text-slate-400">Available hole states</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Drift & Diffusion */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Carrier Transport Simulator: Drift vs Diffusion
                </h3>
                <p className="text-xs text-slate-400">
                  Observe directional drift acceleration under electric field E vs random Brownian thermal diffusion down a concentration gradient.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  J = q(n·μn + p·μp)E + q·Dn(dn/dx)
                </span>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden">
              <canvas ref={particleCanvasRef} className="w-full h-60 block" />
            </div>

            {/* Transport Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Electric Field (E):</span>
                  <span className="text-cyan-400 font-bold">{electricField} V/cm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={electricField}
                  onChange={(e) => setElectricField(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  Drives drift velocity: vd = μ · E
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Temperature (T):</span>
                  <span className="text-amber-400 font-bold">{transportTemp} K</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="25"
                  value={transportTemp}
                  onChange={(e) => setTransportTemp(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  Scales thermal velocity: vth ∝ √T
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Carrier Concentration:</span>
                  <span className="text-emerald-400 font-bold">{carrierDensity} particles</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={carrierDensity}
                  onChange={(e) => setCarrierDensity(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <span className="text-[10px] text-slate-400 block font-mono">
                  Visual particle density
                </span>
              </div>
            </div>

            {/* Einstein Relation Note */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong>Einstein Relation:</strong> The ratio of diffusion coefficient D to mobility μ is strictly tied to thermal voltage: <strong>Dn / μn = Dp / μp = kT/q = Vt</strong>.
                </span>
              </div>
              <button
                onClick={() => onNavigate('formulas')}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline shrink-0"
              >
                View in Formula Vault →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Electrical Conductivity Calculator */}
      {activeTab === 'conductivity' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Conductivity Calculator Inputs
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  σ = q(n·μn + p·μp)
                </span>
              </div>

              {/* Input: Electron Conc */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>Electron Concentration (n):</span>
                  <span className="text-cyan-400">{nConc.toExponential(2)} cm⁻³</span>
                </label>
                <input
                  type="range"
                  min="14"
                  max="19"
                  step="0.2"
                  value={Math.log10(nConc)}
                  onChange={(e) => setNConc(Math.pow(10, Number(e.target.value)))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Input: Hole Conc */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>Hole Concentration (p):</span>
                  <span className="text-rose-400">{pConc.toExponential(2)} cm⁻³</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="19"
                  step="0.5"
                  value={Math.log10(pConc)}
                  onChange={(e) => setPConc(Math.pow(10, Number(e.target.value)))}
                  className="w-full accent-rose-400"
                />
              </div>

              {/* Input: Electron Mobility */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>Electron Mobility (μn):</span>
                  <span className="text-cyan-400">{muN} cm²/(V·s)</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={muN}
                  onChange={(e) => setMuN(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Input: Hole Mobility */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>Hole Mobility (μp):</span>
                  <span className="text-rose-400">{muP} cm²/(V·s)</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="25"
                  value={muP}
                  onChange={(e) => setMuP(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setNConc(1e16);
                    setPConc(2.25e4);
                    setMuN(1350);
                    setMuP(450);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to N-Si Defaults</span>
                </button>

                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showExplanation ? 'Hide Derivation' : 'Explain Step-by-Step'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Calculated Solid-State Transport Properties
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Electrical Conductivity (σ)
                  </span>
                  <div className="font-display text-xl font-bold text-emerald-400">
                    {conductivity.toPrecision(4)} <span className="text-xs font-mono text-slate-400">S/cm</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Specific Resistivity (ρ = 1/σ)
                  </span>
                  <div className="font-display text-xl font-bold text-cyan-400">
                    {resistivity.toPrecision(4)} <span className="text-xs font-mono text-slate-400">Ω·cm</span>
                  </div>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Electron Contribution (q·n·μn):</span>
                  <span className="text-cyan-400">
                    {(q * nConc * muN).toPrecision(4)} S/cm ({((q * nConc * muN) / (conductivity || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hole Contribution (q·p·μp):</span>
                  <span className="text-rose-400">
                    {(q * pConc * muP).toPrecision(4)} S/cm ({((q * pConc * muP) / (conductivity || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Semiconductor Classification:</span>
                  <span className="text-amber-400 font-bold">
                    {nConc > pConc * 10 ? 'Extrinsic N-type' : pConc > nConc * 10 ? 'Extrinsic P-type' : 'Near-Intrinsic'}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Derivation Modal/Box */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2 text-slate-300">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analytical Step-by-Step Breakdown:</span>
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                    <li>Elementary charge constant q = 1.602 × 10⁻¹⁹ Coulombs.</li>
                    <li>
                      Electron drift current contribution: σ_n = (1.602×10⁻¹⁹) × ({nConc.toExponential(2)}) × ({muN}) = {(q * nConc * muN).toExponential(3)} S/cm.
                    </li>
                    <li>
                      Hole drift current contribution: σ_p = (1.602×10⁻¹⁹) × ({pConc.toExponential(2)}) × ({muP}) = {(q * pConc * muP).toExponential(3)} S/cm.
                    </li>
                    <li>
                      Total summed conductivity: σ = σ_n + σ_p = {conductivity.toPrecision(4)} S/cm.
                    </li>
                    <li>
                      Resistivity is the inverse of conductivity: ρ = 1 / σ = {resistivity.toPrecision(4)} Ω·cm.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Hall Effect Simulation */}
      {activeTab === 'hall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Hall Effect Controls
              </h3>

              {/* Carrier Selection */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400 block">Sample Carrier Type:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHallType('n-type')}
                    className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      hallType === 'n-type'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    N-Type (Electrons)
                  </button>
                  <button
                    onClick={() => setHallType('p-type')}
                    className={`py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                      hallType === 'p-type'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-950 border border-slate-800 text-slate-400'
                    }`}
                  >
                    P-Type (Holes)
                  </button>
                </div>
              </div>

              {/* Magnetic Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Perpendicular B-Field (B):</span>
                  <span className="text-cyan-400 font-bold">{hallBField} Tesla</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={hallBField}
                  onChange={(e) => setHallBField(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Longitudinal Current */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Sample Current (I):</span>
                  <span className="text-amber-400 font-bold">{hallCurrent} mA</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={hallCurrent}
                  onChange={(e) => setHallCurrent(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Output Display */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Hall Coefficient (RH):</span>
                  <span className="text-slate-200">{hallCoeff.toExponential(2)} m³/C</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Measured Hall Voltage (VH):</span>
                  <span className={hallType === 'n-type' ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                    {VH_mV.toFixed(2)} mV
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Voltage Polarity:</span>
                  <span className="text-amber-400 font-bold">
                    {hallType === 'n-type' ? 'Negative (-)' : 'Positive (+)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hall Visual Diagram (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200">
              Lorentz Force Carrier Deflection Geometry
            </h3>
            <p className="text-xs text-slate-400">
              Lorentz force F = q(v × B) deflects charge carriers to the side face, setting up an equilibrium electric field EH until qEH balances the magnetic deflection force.
            </p>

            {/* Schematic 3D Bar representation */}
            <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden font-mono text-xs">
              {/* Magnetic field vectors */}
              <div className="flex justify-around text-slate-500 text-[10px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="flex flex-col items-center">
                    <span className="text-cyan-400">⊗ B = {hallBField} T</span>
                    <span>(Into screen)</span>
                  </span>
                ))}
              </div>

              {/* Semiconductor Slab */}
              <div className="my-auto h-24 rounded-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-between px-6 relative">
                {/* Left contact */}
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 block">+ Current In</span>
                  <span className="text-slate-300 font-bold">I = {hallCurrent} mA →</span>
                </div>

                {/* Carrier deflection inside slab */}
                <div className="text-center space-y-1">
                  <span className="text-[11px] text-slate-300 font-bold block">
                    {hallType === 'n-type' ? 'Electrons deflected downward by Lorentz Force' : 'Holes deflected downward by Lorentz Force'}
                  </span>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          hallType === 'n-type'
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {hallType === 'n-type' ? '-' : '+'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right contact */}
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 block">Current Out</span>
                  <span className="text-slate-300 font-bold">→ Ground</span>
                </div>

                {/* Transverse Hall Voltage Probes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-1 text-center">
                  <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                    Probe Terminal A (+)
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-1 text-center">
                  <div className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                    Probe Terminal B (-): VH = {VH_mV.toFixed(2)} mV
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Hall voltage polarity confirms: <strong>{hallType.toUpperCase()} majority carriers</strong></span>
                <span className="text-cyan-400">RH = 1 / (q · {hallType === 'n-type' ? 'n' : 'p'})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
