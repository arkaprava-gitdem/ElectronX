import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Sliders,
  Sparkles,
  FlaskConical,
  RotateCcw,
  Info,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck
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

interface MOSFETLabProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const MOSFETLabView: React.FC<MOSFETLabProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'nmos' | 'jfet' | 'cmos-inverter' | 'finfet'>('nmos');

  // NMOS Parameters
  const [vgs, setVgs] = useState<number>(2.5); // Volts
  const [vds, setVds] = useState<number>(3.0); // Volts
  const [vth, setVth] = useState<number>(0.8); // Volts
  const [aspectRatio, setAspectRatio] = useState<number>(10); // W/L
  const kn_prime = 150; // μA/V^2

  // JFET Parameters
  const [jfetVgs, setJfetVgs] = useState<number>(-1.5); // Negative Volts
  const [jfetVds, setJfetVds] = useState<number>(4.0); // Volts
  const vp = -4.0; // Pinch-off voltage
  const idss = 10.0; // mA

  // CMOS Inverter Parameters
  const [cmosVin, setCmosVin] = useState<number>(2.5); // Volts
  const cmosVdd = 5.0; // Volts

  useEffect(() => {
    onSimulate();
  }, [vgs, vds, vth, aspectRatio, jfetVgs, jfetVds, cmosVin]);

  // NMOS Calculations
  const Vov = vgs - vth; // Overdrive voltage
  let nmosRegion = 'Cutoff';
  let nmosId_mA = 0;

  if (Vov <= 0) {
    nmosRegion = 'Cutoff Region (VGS < Vth)';
    nmosId_mA = 0;
  } else if (vds < Vov) {
    nmosRegion = 'Linear / Triode Region (VDS < VGS - Vth)';
    const id_uA = kn_prime * aspectRatio * (Vov * vds - 0.5 * Math.pow(vds, 2));
    nmosId_mA = Math.max(0, id_uA / 1000);
  } else {
    nmosRegion = 'Saturation Region (VDS ≥ VGS - Vth)';
    const id_uA = 0.5 * kn_prime * aspectRatio * Math.pow(Vov, 2);
    nmosId_mA = id_uA / 1000;
  }

  // NMOS Drain Curves Data (ID vs VDS for VGS = 1.0, 1.5, 2.0, 2.5, 3.0 V)
  const nmosDrainCurves = useMemo(() => {
    const data = [];
    const vgsLevels = [1.2, 1.8, 2.4, 3.0];
    for (let v = 0; v <= 5.0; v += 0.2) {
      const pt: Record<string, number> = { vds: Number(v.toFixed(1)) };
      vgsLevels.forEach((vg) => {
        const ov = vg - vth;
        let id = 0;
        if (ov > 0) {
          if (v < ov) {
            id = (kn_prime * aspectRatio * (ov * v - 0.5 * v * v)) / 1000;
          } else {
            id = (0.5 * kn_prime * aspectRatio * ov * ov) / 1000;
          }
        }
        pt[`vgs_${vg.toFixed(1)}`] = Number(id.toFixed(2));
      });
      data.push(pt);
    }
    return data;
  }, [vth, aspectRatio]);

  // JFET Drain Current Calculation: ID = IDSS * (1 - VGS/VP)^2
  const jfetId_mA = useMemo(() => {
    if (jfetVgs <= vp) return 0;
    const vds_sat = jfetVgs - vp;
    if (jfetVds < vds_sat) {
      // Ohmic region
      return idss * (2 * (1 - jfetVgs / vp) * (jfetVds / -vp) - Math.pow(jfetVds / -vp, 2));
    }
    // Saturation (pinch-off)
    return idss * Math.pow(1 - jfetVgs / vp, 2);
  }, [jfetVgs, jfetVds, vp, idss]);

  // CMOS Inverter VTC calculation
  const cmosVout = useMemo(() => {
    const k = 9;
    const VM = cmosVdd / 2;
    return Number((cmosVdd * (0.5 - 0.5 * Math.tanh(k * (cmosVin - VM) / cmosVdd))).toFixed(2));
  }, [cmosVin, cmosVdd]);

  const cmosVtcData = useMemo(() => {
    const data = [];
    const k = 9;
    const VM = cmosVdd / 2;
    for (let v = 0; v <= cmosVdd; v += 0.1) {
      const vo = cmosVdd * (0.5 - 0.5 * Math.tanh(k * (v - VM) / cmosVdd));
      data.push({
        vin: Number(v.toFixed(2)),
        vout: Number(vo.toFixed(2)),
      });
    }
    return data;
  }, [cmosVdd]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1825] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
              MODULE 03
            </span>
            <span className="text-xs font-mono text-slate-400">Field Effect Transistors</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>MOSFET, JFET & CMOS Laboratory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate JFET pinch-off locus, planar MOSFET quadratic equations, CMOS inverter transfer characteristics (VTC), and 3D FinFET gate control.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: 'nmos', label: 'NMOS Transistor' },
            { id: 'jfet', label: 'JFET Pinch-Off' },
            { id: 'cmos-inverter', label: 'CMOS Inverter VTC' },
            { id: 'finfet', label: '3D FinFET Architecture' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: NMOS Transistor */}
      {activeTab === 'nmos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200 flex items-center justify-between">
                <span>NMOS Terminal Voltages</span>
                <span className="text-[10px] font-mono text-emerald-400">Enhancement NMOS</span>
              </h3>

              {/* VGS Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Gate-Source Voltage (VGS):</span>
                  <span className="text-cyan-400 font-bold">{vgs.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4.0"
                  step="0.1"
                  value={vgs}
                  onChange={(e) => setVgs(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* VDS Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Drain-Source Voltage (VDS):</span>
                  <span className="text-emerald-400 font-bold">{vds.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={vds}
                  onChange={(e) => setVds(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* Threshold Voltage Vth */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Threshold Voltage (Vth):</span>
                  <span className="text-amber-400 font-bold">{vth.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.5"
                  step="0.1"
                  value={vth}
                  onChange={(e) => setVth(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Aspect Ratio W/L */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Channel Aspect Ratio (W/L):</span>
                  <span className="text-slate-200 font-bold">{aspectRatio}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="2"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(Number(e.target.value))}
                  className="w-full accent-slate-400"
                />
              </div>
            </div>

            {/* Operating State Box */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[11px] font-bold text-slate-300 block uppercase">
                Conduction State Telemetry:
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Overdrive Voltage (Vov):</span>
                <span className="text-cyan-400 font-bold">{Vov.toFixed(2)} V</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pinch-off Condition (VDS,sat):</span>
                <span className="text-amber-300 font-bold">{Math.max(0, Vov).toFixed(2)} V</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Drain Current (ID):</span>
                <span className="text-emerald-400 font-bold text-sm">{nmosId_mA.toFixed(3)} mA</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Operating Regime:</span>
                <span className="text-cyan-300 font-bold text-[11px]">{nmosRegion}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  NMOS Drain Characteristics: ID vs VDS
                </h3>
                <p className="text-xs text-slate-400">
                  Yellow marker tracks current bias point (VDS = {vds.toFixed(1)}V, ID = {nmosId_mA.toFixed(2)}mA).
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                Quadratic Shichman-Hodges Model
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nmosDrainCurves} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="vds"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Drain-Source Voltage VDS [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Drain Current ID [mA]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="vgs_1.2" stroke="#475569" strokeWidth={1.5} dot={false} name="VGS = 1.2V" isAnimationActive={false} />
                  <Line type="monotone" dataKey="vgs_1.8" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="VGS = 1.8V" isAnimationActive={false} />
                  <Line type="monotone" dataKey="vgs_2.4" stroke="#818cf8" strokeWidth={1.5} dot={false} name="VGS = 2.4V" isAnimationActive={false} />
                  <Line type="monotone" dataKey="vgs_3.0" stroke="#34d399" strokeWidth={1.5} dot={false} name="VGS = 3.0V" isAnimationActive={false} />
                  <ReferenceDot
                    x={Number(vds.toFixed(1))}
                    y={Number(nmosId_mA.toFixed(2))}
                    r={7}
                    fill="#eab308"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* MOS Capacitor Band Inversion Diagram */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-slate-400 block uppercase font-bold text-[11px]">
                Surface Inversion Physics (Si - SiO2 Interface)
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Gate Bias condition: <strong>{Vov > 0 ? 'Strong Inversion (Channel Open)' : vgs > 0 ? 'Depletion Regime' : 'Accumulation Regime'}</strong></span>
                <span className="text-cyan-400">Surface Potential ψs ≥ 2·ψB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JFET Pinch-Off */}
      {activeTab === 'jfet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                N-Channel JFET Biasing Knobs
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Reverse Gate Voltage (VGS):</span>
                  <span className="text-rose-400 font-bold">{jfetVgs.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="-4.0"
                  max="0"
                  step="0.2"
                  value={jfetVgs}
                  onChange={(e) => setJfetVgs(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
                <span className="text-[10px] font-mono text-slate-400 block">
                  Pinch-off happens at VGS = VP = -4.0 V
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Drain Voltage (VDS):</span>
                  <span className="text-emerald-400 font-bold">{jfetVds.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8.0"
                  step="0.2"
                  value={jfetVds}
                  onChange={(e) => setJfetVds(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Drain Current ID:</span>
                  <span className="text-emerald-400 font-bold text-sm">{jfetId_mA.toFixed(2)} mA</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pinch-off Voltage (VP):</span>
                  <span className="text-rose-400 font-bold">-4.0 V</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Zero-Bias IDSS:</span>
                  <span className="text-slate-200">10.0 mA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200">
              JFET Channel Depletion & Pinch-off Geometry
            </h3>
            <p className="text-xs text-slate-400">
              As drain voltage VDS increases, reverse bias across the gate-channel junction is greatest near the drain end. When VDS reaches (VGS - VP), the opposing depletion layers touch, pinching off the conductive channel.
            </p>

            {/* JFET Channel Cross section visual */}
            <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between font-mono text-xs relative overflow-hidden">
              {/* N-Channel with upper and lower P+ gates */}
              <div className="w-full h-32 rounded-lg bg-emerald-950/50 border border-emerald-800 relative flex items-center justify-between px-4">
                {/* Upper P+ gate */}
                <div
                  className="absolute top-0 left-1/4 right-1/4 bg-rose-900/80 border-b-2 border-rose-500 rounded-b-lg transition-all"
                  style={{
                    height: `${Math.min(50, 15 + Math.abs(jfetVgs) * 8 + jfetVds * 2)}px`,
                  }}
                >
                  <span className="text-[10px] text-rose-300 p-1 block text-center">P+ Gate Terminal</span>
                </div>

                {/* Lower P+ gate */}
                <div
                  className="absolute bottom-0 left-1/4 right-1/4 bg-rose-900/80 border-t-2 border-rose-500 rounded-t-lg transition-all"
                  style={{
                    height: `${Math.min(50, 15 + Math.abs(jfetVgs) * 8 + jfetVds * 2)}px`,
                  }}
                >
                  <span className="text-[10px] text-rose-300 p-1 block text-center">P+ Gate Terminal</span>
                </div>

                {/* Source & Drain contacts */}
                <span className="text-cyan-400 font-bold z-10">SOURCE</span>
                <span className="text-emerald-300 text-center font-bold z-10">
                  {jfetVds >= (jfetVgs - vp) ? 'Pinch-off Point at Drain' : 'Open Conductive Channel'}
                </span>
                <span className="text-cyan-400 font-bold z-10">DRAIN</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Pinch-off Locus: <strong>VDS = VGS - VP = {(jfetVgs - vp).toFixed(1)} V</strong></span>
                <span className="text-amber-400 font-bold">Shockley JFET Equation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CMOS Inverter */}
      {activeTab === 'cmos-inverter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                CMOS Inverter Switching Input
              </h3>

              {/* Input Voltage Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Input Voltage (Vin):</span>
                  <span className="text-cyan-400 font-bold">{cmosVin.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={cmosVin}
                  onChange={(e) => setCmosVin(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Quick Logic Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setCmosVin(0.0)}
                  className="py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 hover:bg-slate-900"
                >
                  Logic 0 (0V)
                </button>
                <button
                  onClick={() => setCmosVin(2.5)}
                  className="py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 hover:bg-slate-900"
                >
                  Mid-Rail (VM)
                </button>
                <button
                  onClick={() => setCmosVin(5.0)}
                  className="py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 hover:bg-slate-900"
                >
                  Logic 1 (5V)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Output Voltage (Vout):</span>
                  <span className="text-emerald-400 font-bold text-base">{cmosVout.toFixed(2)} V</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Output Logic State:</span>
                  <span className={cmosVout > 3.5 ? 'text-cyan-400 font-bold' : cmosVout < 1.5 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                    {cmosVout > 3.5 ? 'HIGH (1)' : cmosVout < 1.5 ? 'LOW (0)' : 'Transition Region'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span>PMOS State:</span>
                  <span className={cmosVin < 2.5 ? 'text-emerald-400' : 'text-slate-500'}>
                    {cmosVin < 2.5 ? 'ON (Pull-up)' : 'OFF (Cutoff)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>NMOS State:</span>
                  <span className={cmosVin > 2.5 ? 'text-cyan-400' : 'text-slate-500'}>
                    {cmosVin > 2.5 ? 'ON (Pull-down)' : 'OFF (Cutoff)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Voltage Transfer Characteristics (VTC)
                </h3>
                <p className="text-xs text-slate-400">
                  Dynamic VTC curve showing sharp transition at switching threshold VM = VDD/2 = 2.5 V.
                </p>
              </div>
              <button
                id="cmos-launch-exp-btn"
                onClick={() => onNavigate('experiments', 'exp-cmos-inverter')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Open Virtual Experiment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cmosVtcData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="vin"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Input Voltage Vin [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    label={{ value: 'Output Voltage Vout [V]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                  <ReferenceLine x={2.5} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'VM = 2.5V', fill: '#eab308', fontSize: 10 }} />
                  <ReferenceLine y={2.5} stroke="#eab308" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="vout" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <ReferenceDot
                    x={Number(cmosVin.toFixed(2))}
                    y={Number(cmosVout.toFixed(2))}
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

      {/* TAB 4: 3D FinFET Architecture */}
      {activeTab === 'finfet' && (
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-xs font-mono mb-1.5">
                <span>Educational Conceptual Model</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                3D FinFET (Tri-Gate) Nanometer Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                At sub-20nm nodes, planar MOSFETs suffer from severe short-channel effects (drain-induced barrier lowering, leakage). FinFET raises the channel into a vertical 3D fin wrapped by the gate on three sides for superior electrostatic control.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Planar MOSFET Diagram */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-mono text-slate-400 block uppercase font-bold">
                Conventional Planar MOSFET (1 Gate Side)
              </span>
              <div className="h-44 rounded-lg bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between font-mono text-xs">
                <div className="w-full h-8 bg-indigo-950 border border-indigo-700 rounded text-center text-indigo-300 flex items-center justify-center">
                  Metal Gate (Top Only)
                </div>
                <div className="w-full h-2 bg-amber-600/60 rounded text-[9px] text-center text-amber-200">
                  SiO2 Oxide Layer
                </div>
                <div className="w-full h-16 bg-slate-800 border border-slate-700 rounded flex justify-between p-2 text-[10px]">
                  <span className="text-cyan-400">N+ Source</span>
                  <span className="text-slate-400 text-center">Planar 2D Channel (Leakage under bulk)</span>
                  <span className="text-cyan-400">N+ Drain</span>
                </div>
              </div>
              <div className="text-[11px] text-rose-400 font-mono">
                Limitations: Heavy sub-threshold leakage, punch-through at short gate lengths (L &lt; 28nm).
              </div>
            </div>

            {/* 3D FinFET Diagram */}
            <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <span className="text-xs font-mono text-cyan-400 block uppercase font-bold">
                3D Tri-Gate FinFET (Gate wraps 3 sides)
              </span>
              <div className="h-44 rounded-lg bg-slate-900 border border-cyan-800/50 p-4 flex flex-col justify-between font-mono text-xs relative overflow-hidden">
                {/* 3D Wrapped Gate representation */}
                <div className="w-full h-12 rounded bg-cyan-950/80 border-2 border-cyan-500 flex items-center justify-center text-cyan-300 font-bold text-center">
                  Tri-Gate wraps Left, Top & Right of Fin
                </div>
                <div className="w-16 mx-auto h-20 bg-emerald-700/80 border border-emerald-400 rounded flex items-center justify-center text-white text-[10px] text-center font-bold">
                  Vertical Silicon Fin
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                Advantages: Almost zero sub-threshold leakage, steep sub-threshold swing (~65 mV/dec), lower operating voltage.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
