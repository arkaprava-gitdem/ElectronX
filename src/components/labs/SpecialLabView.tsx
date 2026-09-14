import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  FlaskConical,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
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

interface SpecialLabProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const SpecialLabView: React.FC<SpecialLabProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [activeDevice, setActiveDevice] = useState<'tunnel' | 'varactor' | 'schottky' | 'scr'>('tunnel');

  // Tunnel Diode State
  const [tunnelV, setTunnelV] = useState<number>(0.15); // Volts

  // Varactor Diode State
  const [varactorVr, setVaractorVr] = useState<number>(4.0); // Volts
  const [inductance_uH, setInductance_uH] = useState<number>(10); // uH

  // Schottky Diode State
  const [diodeV, setDiodeV] = useState<number>(0.35); // Volts

  // SCR State
  const [scrVak, setScrVak] = useState<number>(12); // Volts Anode-Cathode
  const [scrIg_mA, setScrIg_mA] = useState<number>(0); // Gate pulse mA
  const [scrLatched, setScrLatched] = useState<boolean>(false);

  useEffect(() => {
    onSimulate();
  }, [tunnelV, varactorVr, inductance_uH, diodeV, scrVak, scrIg_mA, scrLatched]);

  // Tunnel Diode V-I model (Esaki model: Ip, Vp, Iv, Vv)
  const tunnelData = useMemo(() => {
    const data = [];
    const Vp = 0.08; // 80 mV
    const Ip = 5.0; // mA
    const Vv = 0.35; // 350 mV
    const Iv = 0.8; // mA

    for (let v = 0; v <= 0.65; v += 0.01) {
      let i = 0;
      if (v <= Vp) {
        // Linear to peak tunneling
        i = (Ip / Vp) * v;
      } else if (v <= Vv) {
        // Negative Differential Resistance (NDR)
        const t = (v - Vp) / (Vv - Vp);
        i = Ip - (Ip - Iv) * (3 * t * t - 2 * t * t * t);
      } else {
        // Regular thermal injection diode curve
        i = Iv + 12 * Math.pow((v - Vv) / 0.25, 2.2);
      }
      data.push({
        voltage: Number(v.toFixed(2)),
        current: Number(Math.min(15, i).toFixed(2)),
      });
    }
    return data;
  }, []);

  // Tunnel Current at current slider
  const tunnelCurrent_mA = useMemo(() => {
    const Vp = 0.08;
    const Ip = 5.0;
    const Vv = 0.35;
    const Iv = 0.8;
    if (tunnelV <= Vp) return (Ip / Vp) * tunnelV;
    if (tunnelV <= Vv) {
      const t = (tunnelV - Vp) / (Vv - Vp);
      return Ip - (Ip - Iv) * (3 * t * t - 2 * t * t * t);
    }
    return Iv + 12 * Math.pow((tunnelV - Vv) / 0.25, 2.2);
  }, [tunnelV]);

  // Varactor capacitance: Cj = Cj0 / (1 + Vr/Vbi)^m
  const cj0_pF = 50;
  const vbi = 0.7;
  const varactorCap_pF = useMemo(() => {
    return Number((cj0_pF / Math.sqrt(1 + varactorVr / vbi)).toFixed(2));
  }, [varactorVr]);

  // LC Tank Resonance: fres = 1 / (2 * pi * sqrt(L * C))
  const fres_MHz = useMemo(() => {
    const L = inductance_uH * 1e-6;
    const C = varactorCap_pF * 1e-12;
    const f = 1 / (2 * Math.PI * Math.sqrt(L * C));
    return Number((f / 1e6).toFixed(2)); // MHz
  }, [inductance_uH, varactorCap_pF]);

  // Schottky vs PN Diode Forward Conduction
  const schottkyCurrent_mA = Math.min(60, Math.exp((diodeV - 0.22) / 0.035));
  const pnCurrent_mA = Math.min(60, Math.exp((diodeV - 0.65) / 0.035));

  // SCR Logic
  const handleTriggerSCR = () => {
    setScrIg_mA(15);
    setScrLatched(true);
    setTimeout(() => setScrIg_mA(0), 600); // Pulse turns off
  };

  const scrCurrent_mA = scrLatched && scrVak > 1.2 ? (scrVak - 1.2) / 0.1 : 0.001; // Load resistor = 100 ohms

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#191522] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
              MODULE 05
            </span>
            <span className="text-xs font-mono text-slate-400">Advanced Solid-State Devices</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>Special Semiconductor Devices Laboratory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate quantum mechanical tunneling & NDR in Esaki Diodes, voltage-variable capacitance in Varactors, low-barrier Schottky rectifiers, and PNPN latching in SCRs.
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: 'tunnel', label: 'Tunnel Diode (NDR)' },
            { id: 'varactor', label: 'Varactor Diode (LC)' },
            { id: 'schottky', label: 'Schottky vs PN' },
            { id: 'scr', label: 'SCR Thyristor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDevice(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeDevice === tab.id
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DEVICE 1: Tunnel Diode */}
      {activeDevice === 'tunnel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 flex items-center justify-between">
                <span>Tunnel Diode Bias Control</span>
                <span className="text-[10px] font-mono text-purple-400">Leo Esaki 1957</span>
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Forward Voltage (V):</span>
                  <span className="text-purple-400 font-bold">{tunnelV.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.60"
                  step="0.01"
                  value={tunnelV}
                  onChange={(e) => setTunnelV(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0V</span>
                  <span>Vp (0.08V)</span>
                  <span>Vv (0.35V)</span>
                  <span>0.6V</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current (I):</span>
                  <span className="text-emerald-400 font-bold text-base">{tunnelCurrent_mA.toFixed(2)} mA</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Operating Zone:</span>
                  <span className={tunnelV > 0.08 && tunnelV < 0.35 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {tunnelV <= 0.08 ? 'Tunneling Conduction' : tunnelV < 0.35 ? 'NDR (Negative Resistance)' : 'Normal Thermal Injection'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Peak-to-Valley Ratio (PVR):</span>
                  <span className="text-cyan-400 font-bold">Ip / Iv ≈ 6.25</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <span className="font-mono text-[11px] font-bold text-purple-300 uppercase block">
                Quantum Mechanical Tunneling:
              </span>
              <p>
                Degenerately doped with &gt;10¹⁹ cm⁻³ impurities on both sides. The depletion layer is ultra-thin (&lt;10 nm), enabling wave-mechanical electron tunneling without needing thermal activation over the barrier!
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Esaki Tunnel Diode V-I Characteristic with NDR Region
                </h3>
                <p className="text-xs text-slate-400">
                  Notice between Peak Voltage Vp and Valley Voltage Vv, increasing voltage decreases current (dI/dV &lt; 0), functioning as an ultra-high-frequency microwave oscillator.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                dI/dV &lt; 0
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tunnelData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="voltage"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Diode Voltage V [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Current I [mA]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <ReferenceLine x={0.08} stroke="#eab308" strokeDasharray="2 2" label={{ value: 'Vp', fill: '#eab308', fontSize: 10 }} />
                  <ReferenceLine x={0.35} stroke="#eab308" strokeDasharray="2 2" label={{ value: 'Vv', fill: '#eab308', fontSize: 10 }} />
                  <Line type="monotone" dataKey="current" stroke="#c084fc" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <ReferenceDot
                    x={Number(tunnelV.toFixed(2))}
                    y={Number(tunnelCurrent_mA.toFixed(2))}
                    r={7}
                    fill="#eab308"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE 2: Varactor Diode */}
      {activeDevice === 'varactor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Varactor Tuning & LC Resonator Knobs
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Reverse Bias Voltage (VR):</span>
                  <span className="text-rose-400 font-bold">{varactorVr.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.5"
                  value={varactorVr}
                  onChange={(e) => setVaractorVr(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Tank Inductor (L):</span>
                  <span className="text-cyan-400 font-bold">{inductance_uH} μH</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={inductance_uH}
                  onChange={(e) => setInductance_uH(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Junction Capacitance (CJ):</span>
                  <span className="text-amber-400 font-bold text-base">{varactorCap_pF} pF</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resonant Frequency (fres):</span>
                  <span className="text-emerald-400 font-bold text-base">{fres_MHz} MHz</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Application:</span>
                  <span className="text-slate-300">FM/VHF Voltage-Controlled Oscillator (VCO)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200">
              Capacitance vs Reverse Voltage Law: CJ ∝ 1/√(1 + VR/Vbi)
            </h3>
            <p className="text-xs text-slate-400">
              Increasing reverse bias widens the non-conductive depletion dielectric, thereby reducing capacitance. This electrical tuning replaces bulky mechanical variable capacitors in RF circuits.
            </p>

            <div className="h-60 rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between font-mono text-xs">
              <div className="grid grid-cols-3 gap-4 text-center my-auto">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">REVERSE VOLTAGE</span>
                  <span className="text-rose-400 font-bold text-lg">{varactorVr} V</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">CAPACITANCE CJ</span>
                  <span className="text-amber-400 font-bold text-lg">{varactorCap_pF} pF</span>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-700">
                  <span className="text-cyan-300 block text-[10px]">LC TANK FREQ</span>
                  <span className="text-cyan-400 font-bold text-lg">{fres_MHz} MHz</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Formula: <strong>f = 1 / (2π√(L · CJ))</strong></span>
                <span className="text-emerald-400 font-bold">Precision Electronic RF Tuning</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE 3: Schottky vs PN Diode */}
      {activeDevice === 'schottky' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                Forward Bias Voltage Comparison
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Forward Voltage (VF):</span>
                  <span className="text-cyan-400 font-bold">{diodeV.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.85"
                  step="0.05"
                  value={diodeV}
                  onChange={(e) => setDiodeV(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-bold">Schottky Current:</span>
                  <span className="text-emerald-400 font-bold text-base">{schottkyCurrent_mA.toFixed(2)} mA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Standard PN Diode Current:</span>
                  <span className="text-slate-300 font-bold">{pnCurrent_mA.toFixed(2)} mA</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Schottky conducts at ~0.25V due to lower metal-semiconductor barrier height!
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200">
              Metal-Semiconductor Junction (Majority Carrier Conduction)
            </h3>
            <p className="text-xs text-slate-400">
              Formed by depositing metal (e.g. Platinum or Gold) on N-type silicon. Conduction is purely via majority carrier electrons thermionically emitted over the Schottky barrier.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-2">
                <span className="font-mono text-xs text-cyan-400 font-bold block">
                  SCHOTTKY BARRIER DIODE
                </span>
                <ul className="text-xs text-slate-300 space-y-1 font-mono list-disc list-inside">
                  <li>Cut-in: 0.20 - 0.30 V</li>
                  <li>Zero minority-carrier storage time</li>
                  <li>Reverse recovery time trr &lt; 100 ps</li>
                  <li>Ideal for Switched-Mode Power Supplies (SMPS)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-mono text-xs text-slate-400 font-bold block">
                  STANDARD PN JUNCTION DIODE
                </span>
                <ul className="text-xs text-slate-400 space-y-1 font-mono list-disc list-inside">
                  <li>Cut-in: ~0.70 V (Silicon)</li>
                  <li>Minority-carrier charge storage in base</li>
                  <li>Reverse recovery trr: 5 to 50 ns</li>
                  <li>Higher forward voltage drop and power loss</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE 4: SCR Thyristor */}
      {activeDevice === 'scr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                SCR Anode Voltage & Gate Trigger
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Anode-Cathode Supply (VAK):</span>
                  <span className="text-cyan-400 font-bold">{scrVak} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={scrVak}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setScrVak(v);
                    if (v < 1.0) setScrLatched(false); // Drops below holding voltage
                  }}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  id="scr-gate-trigger-btn"
                  onClick={handleTriggerSCR}
                  className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition cursor-pointer"
                >
                  PULSE GATE (15 mA)
                </button>
                <button
                  onClick={() => setScrLatched(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
                >
                  RESET
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Conduction State:</span>
                  <span className={scrLatched ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {scrLatched ? 'LATCHED ON (Conducting)' : 'FORWARD BLOCKING (OFF)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Load Current (IA):</span>
                  <span className="text-cyan-400 font-bold text-base">{scrCurrent_mA.toFixed(1)} mA</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>Holding Current (IH):</span>
                  <span className="text-slate-300">5.0 mA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200">
              4-Layer P-N-P-N Regenerative Latching Action
            </h3>
            <p className="text-xs text-slate-400">
              The SCR can be modeled as two cross-coupled transistors (PNP + NPN). Applying a momentary gate current pulse triggers positive feedback regeneration; once turned ON, the gate loses control!
            </p>

            {/* 4 layer PNPN diagram */}
            <div className="h-56 rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between font-mono text-xs">
              <div className="grid grid-cols-4 gap-1 h-24 my-auto">
                <div className="rounded bg-rose-950/80 border border-rose-700 flex flex-col items-center justify-center text-rose-300 font-bold">
                  <span>P1</span>
                  <span className="text-[9px] text-slate-400">Anode (+)</span>
                </div>
                <div className="rounded bg-cyan-950/80 border border-cyan-700 flex flex-col items-center justify-center text-cyan-300 font-bold">
                  <span>N1</span>
                  <span className="text-[9px] text-slate-400">Base 1</span>
                </div>
                <div className="rounded bg-rose-950/80 border border-rose-700 flex flex-col items-center justify-center text-rose-300 font-bold relative">
                  <span>P2</span>
                  <span className="text-[9px] text-purple-300">Gate Input</span>
                </div>
                <div className="rounded bg-cyan-950/80 border border-cyan-700 flex flex-col items-center justify-center text-cyan-300 font-bold">
                  <span>N2</span>
                  <span className="text-[9px] text-slate-400">Cathode (-)</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Commutation Requirement: <strong>Reduce IA &lt; IH to turn OFF</strong></span>
                <span className="text-purple-400 font-bold">Regenerative Loop Gain &gt; 1</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
