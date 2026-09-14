import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Sliders,
  Activity,
  Layers,
  Sparkles,
  FlaskConical,
  RotateCcw,
  Info,
  TrendingUp,
  Volume2
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

interface BJTLabProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const BJTLabView: React.FC<BJTLabProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [bjtType, setBjtType] = useState<'NPN' | 'PNP'>('NPN');
  const [vcc, setVcc] = useState<number>(12); // Volts
  const [rc_kOhm, setRc_kOhm] = useState<number>(2.2); // kOhms
  const [rb_kOhm, setRb_kOhm] = useState<number>(47); // kOhms
  const [ib_uA, setIb_uA] = useState<number>(30); // microamps
  const [beta, setBeta] = useState<number>(120);
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [activeTab, setActiveTab] = useState<'output-loadline' | 'amplifier' | 'cross-section' | 'input-curve'>('output-loadline');

  // Small signal amplifier controls
  const [vin_mV, setVin_mV] = useState<number>(20); // mV peak-to-peak input

  useEffect(() => {
    onSimulate();
  }, [vcc, rc_kOhm, rb_kOhm, ib_uA, beta, temperature, vin_mV]);

  // Calculations
  const RC_ohms = rc_kOhm * 1000;
  const Ic_sat_mA = (vcc / RC_ohms) * 1000; // mA
  const Ib_mA = ib_uA * 1e-3;

  // Unclamped active collector current
  const Ic_active_mA = beta * Ib_mA;

  // Actual Q-point current (limited by saturation)
  const Ic_Q_mA = Math.min(Ic_sat_mA - 0.2, Ic_active_mA);
  const Vce_Q_volts = Math.max(0.2, vcc - (Ic_Q_mA * 1e-3) * RC_ohms);

  // Operating region
  const region =
    ib_uA === 0
      ? 'Cutoff Region (IC ≈ 0)'
      : Vce_Q_volts <= 0.35
      ? 'Saturation Region (VCE ≈ 0.2V)'
      : 'Forward Active Linear Amplification Region';

  // Small signal parameters
  const Vt = (1.38e-23 * temperature) / 1.602e-19; // ~26mV
  const re = Ic_Q_mA > 0.05 ? (Vt * 1000) / Ic_Q_mA : 9999; // ohms
  const Av = -(RC_ohms / re); // Inverting voltage gain
  const vout_peak_V = Math.abs(Av * (vin_mV * 1e-3));

  // Check if amplifier output clips
  const upperHeadroom_V = vcc - Vce_Q_volts;
  const lowerHeadroom_V = Vce_Q_volts - 0.2;
  const isClipped = vout_peak_V > Math.min(upperHeadroom_V, lowerHeadroom_V);

  // Output curves for multiple base currents (10, 20, 30, 40, 50, 60 uA)
  const ibSteps = [10, 20, 30, 40, 50, 60];
  const outputCurvesData = useMemo(() => {
    const data = [];
    for (let vce = 0; vce <= vcc + 1; vce += 0.5) {
      const point: Record<string, number> = { vce: Number(vce.toFixed(1)) };
      ibSteps.forEach((ib) => {
        // Saturation knee factor: 1 - exp(-vce / 0.4)
        const knee = 1 - Math.exp(-vce / 0.35);
        // Early effect: (1 + vce / 100)
        const ic = (beta * (ib * 1e-3)) * knee * (1 + vce / 100);
        point[`ib_${ib}`] = Number(ic.toFixed(2));
      });
      // Also add the load line point: IC = (VCC - VCE) / RC
      const ic_load = Math.max(0, ((vcc - vce) / RC_ohms) * 1000);
      point['load_line'] = Number(ic_load.toFixed(2));
      data.push(point);
    }
    return data;
  }, [vcc, RC_ohms, beta]);

  // Amplifier waveform simulation data
  const amplifierWaveformData = useMemo(() => {
    const points = [];
    const numCycles = 2;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const time_ms = (i / steps) * numCycles; // 2 ms window for 1 kHz
      const phase = (i / steps) * numCycles * 2 * Math.PI;
      const vin = (vin_mV / 2) * Math.sin(phase); // mV
      let vout = (Av * (vin / 1000)); // Volts relative to VCE_Q

      // Apply non-linear clipping at rails
      let actualVce = Vce_Q_volts + vout;
      if (actualVce > vcc) actualVce = vcc;
      if (actualVce < 0.2) actualVce = 0.2;

      points.push({
        time: Number(time_ms.toFixed(2)),
        vin_mV: Number(vin.toFixed(1)),
        vce_V: Number(actualVce.toFixed(2)),
      });
    }
    return points;
  }, [vin_mV, Av, Vce_Q_volts, vcc]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
              MODULE 02
            </span>
            <span className="text-xs font-mono text-slate-400">Bipolar Junction Transistors</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>Common-Emitter BJT Laboratory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate Common-Emitter characteristics, adjust DC load lines and Q-point stability, analyze small-signal AC amplifier gain, and view carrier injection cross-sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBjtType(bjtType === 'NPN' ? 'PNP' : 'NPN')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 border border-slate-700 transition"
          >
            Polarity: {bjtType} Transistor
          </button>
          <button
            id="bjt-launch-exp-btn"
            onClick={() => onNavigate('experiments', 'exp-bjt-output')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>BJT LAB EXPERIMENT</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-slate-200 flex items-center justify-between">
              <span>Circuit & Biasing Controls</span>
              <span className="text-[10px] font-mono text-indigo-400">CE Mode</span>
            </h3>

            {/* Base Current Selector (Primary Family Step) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Base Current (IB):</span>
                <span className="text-indigo-400 font-bold">{ib_uA} μA</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="10"
                value={ib_uA}
                onChange={(e) => setIb_uA(Number(e.target.value))}
                className="w-full accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 μA (Cutoff)</span>
                <span>30 μA</span>
                <span>60 μA (Sat)</span>
              </div>
            </div>

            {/* Supply Voltage VCC */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">DC Supply (VCC):</span>
                <span className="text-cyan-400 font-bold">{vcc} V</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={vcc}
                onChange={(e) => setVcc(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Collector Resistor RC */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Collector Resistor (RC):</span>
                <span className="text-emerald-400 font-bold">{rc_kOhm} kΩ</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={rc_kOhm}
                onChange={(e) => setRc_kOhm(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            {/* Current Gain Beta */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Current Gain β (h_FE):</span>
                <span className="text-amber-400 font-bold">{beta}</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Operating Point Telemetry Box */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase">
              Quiescent Operating Point (Q-Point):
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Collector Voltage (VCE_Q):</span>
              <span className="text-cyan-400 font-bold">{Vce_Q_volts.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Collector Current (IC_Q):</span>
              <span className="text-emerald-400 font-bold">{Ic_Q_mA.toFixed(2)} mA</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Saturation Current (VCC/RC):</span>
              <span className="text-slate-200 font-bold">{Ic_sat_mA.toFixed(2)} mA</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Collector Dissipation (PC):</span>
              <span className="text-amber-400 font-bold">{(Vce_Q_volts * Ic_Q_mA).toFixed(1)} mW</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>Operating Region:</span>
              <span className="text-cyan-300 font-bold text-[11px] truncate">{region}</span>
            </div>
          </div>
        </div>

        {/* Right: Curves & Dynamic Views (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('output-loadline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'output-loadline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. IC vs VCE & DC Load Line
            </button>
            <button
              onClick={() => setActiveTab('amplifier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'amplifier'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Small-Signal AC Amplifier
            </button>
            <button
              onClick={() => setActiveTab('cross-section')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'cross-section'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Transistor Carrier Cross Section
            </button>
          </div>

          {/* VIEW 1: Output Characteristics & DC Load Line */}
          {activeTab === 'output-loadline' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    Common-Emitter Output Family (IC vs VCE) & Dynamic DC Load Line
                  </h3>
                  <p className="text-xs text-slate-400">
                    Family of curves for IB = 10 to 60 μA. Red line is the DC Load Line connecting VCC and VCC/RC.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                  IC = β·IB(1 + VCE/VA)
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={outputCurvesData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="vce"
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Collector-Emitter Voltage VCE [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Collector Current IC [mA]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    {/* IB Step Curves */}
                    <Line type="monotone" dataKey="ib_10" stroke="#475569" strokeWidth={1.5} dot={false} name="IB = 10 μA" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ib_20" stroke="#64748b" strokeWidth={1.5} dot={false} name="IB = 20 μA" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ib_30" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="IB = 30 μA" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ib_40" stroke="#818cf8" strokeWidth={1.5} dot={false} name="IB = 40 μA" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ib_50" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="IB = 50 μA" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ib_60" stroke="#c084fc" strokeWidth={1.5} dot={false} name="IB = 60 μA" isAnimationActive={false} />
                    
                    {/* DC Load Line */}
                    <Line type="linear" dataKey="load_line" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 2" dot={false} name="DC Load Line" isAnimationActive={false} />

                    {/* Q-Point Marker */}
                    <ReferenceDot
                      x={Number(Vce_Q_volts.toFixed(1))}
                      y={Number(Ic_Q_mA.toFixed(2))}
                      r={7}
                      fill="#eab308"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-200">
                    Active Q-Point: <strong>({Vce_Q_volts.toFixed(2)} V, {Ic_Q_mA.toFixed(2)} mA)</strong>
                  </span>
                </div>
                <span className="text-rose-400">Load Line: IC_sat = {Ic_sat_mA.toFixed(2)} mA, VCE_cutoff = {vcc} V</span>
              </div>
            </div>
          )}

          {/* VIEW 2: Small-Signal AC Amplifier */}
          {activeTab === 'amplifier' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    Common-Emitter Voltage Amplifier Waveform Simulation
                  </h3>
                  <p className="text-xs text-slate-400">
                    Observe 180° inverted amplified waveform. Clipping occurs if output exceeds supply rails.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                  Av = -RC / re = {Av.toFixed(1)} V/V
                </span>
              </div>

              {/* Input AC Signal Slider */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono text-slate-400">AC Input Signal Amplitude (Vin):</span>
                  <div className="text-xs font-mono text-cyan-400 font-bold">{vin_mV} mVpp (1 kHz Sine)</div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={vin_mV}
                  onChange={(e) => setVin_mV(Number(e.target.value))}
                  className="w-48 accent-cyan-400"
                />
                {isClipped ? (
                  <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold">
                    SIGNAL CLIPPED!
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                    Linear Amplification
                  </span>
                )}
              </div>

              {/* Waveform plot */}
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={amplifierWaveformData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'Time [ms]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      label={{ value: 'VCE Output Voltage [V]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <ReferenceLine y={vcc} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'VCC Rail', fill: '#f43f5e', fontSize: 10 }} />
                    <ReferenceLine y={0.2} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'VCE(sat)', fill: '#f43f5e', fontSize: 10 }} />
                    <ReferenceLine y={Vce_Q_volts} stroke="#eab308" strokeDasharray="2 2" label={{ value: 'DC Q-Level', fill: '#eab308', fontSize: 10 }} />
                    <Line type="monotone" dataKey="vce_V" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} name="Output Vout(t)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW 3: Transistor Cross Section */}
          {activeTab === 'cross-section' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">
                NPN Bipolar Transistor Physical Structure & Carrier Injection
              </h3>
              <p className="text-xs text-slate-400">
                Heavily doped Emitter (N+) injects electrons across forward-biased BE junction into the ultra-thin Base (P). Most electrons diffuse through base without recombining and get collected by reverse-biased Collector (N).
              </p>

              <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between font-mono text-xs">
                {/* 3 Region blocks */}
                <div className="grid grid-cols-12 gap-1 h-36">
                  {/* Emitter */}
                  <div className="col-span-4 rounded-lg bg-cyan-950/80 border border-cyan-800 p-3 flex flex-col justify-between text-cyan-300">
                    <div>
                      <span className="font-bold text-sm block">EMITTER (N+)</span>
                      <span className="text-[10px] text-slate-400">Heavily Doped (10¹⁸ cm⁻³)</span>
                    </div>
                    <div className="text-[11px]">
                      <span>IE = {(Ic_Q_mA + Ib_mA).toFixed(2)} mA</span>
                    </div>
                  </div>

                  {/* Base */}
                  <div className="col-span-2 rounded-lg bg-rose-950/80 border border-rose-800 p-3 flex flex-col justify-between text-rose-300">
                    <div>
                      <span className="font-bold text-xs block">BASE (P)</span>
                      <span className="text-[9px] text-slate-400">Ultra-thin (&lt;1 μm)</span>
                    </div>
                    <div className="text-[10px]">
                      <span>IB = {ib_uA} μA</span>
                    </div>
                  </div>

                  {/* Collector */}
                  <div className="col-span-6 rounded-lg bg-indigo-950/80 border border-indigo-800 p-3 flex flex-col justify-between text-indigo-300">
                    <div>
                      <span className="font-bold text-sm block">COLLECTOR (N)</span>
                      <span className="text-[10px] text-slate-400">Moderately Doped, Large Area</span>
                    </div>
                    <div className="text-[11px]">
                      <span>IC = {Ic_Q_mA.toFixed(2)} mA</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs pt-2 border-t border-slate-800">
                  <span>Base Transport Factor: <strong>α = {((beta) / (beta + 1)).toFixed(4)}</strong></span>
                  <span className="text-cyan-400 font-bold">99.2% of electrons reach Collector</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
