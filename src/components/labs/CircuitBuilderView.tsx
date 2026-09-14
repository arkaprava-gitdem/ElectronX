import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CircuitBoard,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Activity,
  Layers,
  HelpCircle,
  Eye,
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
  ReferenceLine
} from 'recharts';
import { LabViewId } from '../../types';

interface CircuitBuilderProps {
  onSimulate: () => void;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

interface CircuitPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  components: string[];
  param1Label: string;
  param1Min: number;
  param1Max: number;
  param1Step: number;
  param1Unit: string;
  defaultParam1: number;
  param2Label?: string;
  param2Min?: number;
  param2Max?: number;
  param2Step?: number;
  param2Unit?: string;
  defaultParam2?: number;
}

const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    id: 'half-wave',
    name: 'Half-Wave Rectifier + Filter',
    category: 'Diode Rectification',
    description: 'Converts AC into pulsating DC. Adding smoothing filter capacitor C filters ripple voltage Vr.',
    components: ['AC Source (12V 50Hz)', '1N4007 PN Diode', 'Filter Cap (C)', 'Load Resistor (RL)'],
    param1Label: 'Filter Capacitor (C)',
    param1Min: 10,
    param1Max: 1000,
    param1Step: 10,
    param1Unit: 'μF',
    defaultParam1: 100,
    param2Label: 'Load Resistance (RL)',
    param2Min: 100,
    param2Max: 2000,
    param2Step: 50,
    param2Unit: 'Ω',
    defaultParam2: 500,
  },
  {
    id: 'bridge-rectifier',
    name: 'Full-Wave Bridge Rectifier',
    category: 'Diode Rectification',
    description: '4-diode Graetz bridge rectifies both positive and negative AC half-cycles. Twice the ripple frequency (100 Hz).',
    components: ['AC Source (12V 50Hz)', 'Bridge (4x 1N4007)', 'Filter Cap (C)', 'Load Resistor (RL)'],
    param1Label: 'Filter Capacitor (C)',
    param1Min: 10,
    param1Max: 1000,
    param1Step: 10,
    param1Unit: 'μF',
    defaultParam1: 220,
    param2Label: 'Load Resistance (RL)',
    param2Min: 100,
    param2Max: 2000,
    param2Step: 50,
    param2Unit: 'Ω',
    defaultParam2: 470,
  },
  {
    id: 'zener-regulator',
    name: 'Zener Shunt Voltage Regulator',
    category: 'Regulators',
    description: 'Stabilizes DC output voltage at Vz = 5.1V despite fluctuations in unregulated input voltage or load current.',
    components: ['Unregulated DC Source', 'Series Resistor (Rs)', '5.1V Zener Diode', 'Variable Load (RL)'],
    param1Label: 'Input DC Voltage (Vin)',
    param1Min: 6.0,
    param1Max: 18.0,
    param1Step: 0.5,
    param1Unit: 'V',
    defaultParam1: 12.0,
    param2Label: 'Load Resistance (RL)',
    param2Min: 100,
    param2Max: 2000,
    param2Step: 50,
    param2Unit: 'Ω',
    defaultParam2: 500,
  },
  {
    id: 'ce-amplifier',
    name: 'BJT Common-Emitter Amplifier',
    category: 'Transistor Amplifiers',
    description: 'Inverting AC voltage amplifier with 180° phase inversion. Coupling capacitors block DC bias.',
    components: ['Input AC (20mV 1kHz)', 'NPN 2N2222', 'R1/R2 Biasing', 'RC Collector Load'],
    param1Label: 'Collector Resistor (RC)',
    param1Min: 1.0,
    param1Max: 10.0,
    param1Step: 0.5,
    param1Unit: 'kΩ',
    defaultParam1: 3.3,
    param2Label: 'Input AC Amplitude',
    param2Min: 5,
    param2Max: 50,
    param2Step: 5,
    param2Unit: 'mV',
    defaultParam2: 20,
  },
  {
    id: 'led-driver',
    name: 'Current-Limited LED Driver',
    category: 'Optoelectronics',
    description: 'Calculates ballast resistor R = (Vcc - Vf) / If to prevent thermal runaway and destruction of the LED.',
    components: ['DC Voltage Supply', 'Ballast Resistor (R)', 'High-Brightness Blue LED'],
    param1Label: 'Supply Voltage (Vcc)',
    param1Min: 3.3,
    param1Max: 15.0,
    param1Step: 0.5,
    param1Unit: 'V',
    defaultParam1: 5.0,
    param2Label: 'Ballast Resistor (R)',
    param2Min: 50,
    param2Max: 500,
    param2Step: 10,
    param2Unit: 'Ω',
    defaultParam2: 120,
  },
];

export const CircuitBuilderView: React.FC<CircuitBuilderProps> = ({
  onSimulate,
  onNavigate,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bridge-rectifier');
  const [param1, setParam1] = useState<number>(220);
  const [param2, setParam2] = useState<number>(470);
  const [showProbeB, setShowProbeB] = useState<boolean>(true);

  const preset = CIRCUIT_PRESETS.find((p) => p.id === selectedPresetId) || CIRCUIT_PRESETS[0];

  // Sync parameters when preset changes
  useEffect(() => {
    setParam1(preset.defaultParam1);
    if (preset.defaultParam2 !== undefined) {
      setParam2(preset.defaultParam2);
    }
  }, [preset.id]);

  useEffect(() => {
    onSimulate();
  }, [param1, param2, selectedPresetId]);

  // Compute Oscilloscope Waveform data based on preset & circuit parameters
  const scopeData = useMemo(() => {
    const points = [];
    const numCycles = 3;
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const time_ms = Number(((i / steps) * (numCycles * 20)).toFixed(2)); // 50Hz = 20ms period
      const phase = (i / steps) * numCycles * 2 * Math.PI;

      if (preset.id === 'half-wave') {
        const vin = 12 * Math.sin(phase);
        // Half-wave rectified with RC smoothing
        const Vpeak = 12 - 0.7; // diode drop
        const tau_ms = (param2 * (param1 * 1e-6)) * 1000;
        // Ripple peak-to-peak
        const Vr = Math.min(Vpeak * 0.9, Vpeak / (50 * (param2 * (param1 * 1e-6))));
        const cycleProgress = (phase / (2 * Math.PI)) % 1;
        let vout = 0;
        if (cycleProgress < 0.25) {
          vout = Math.max(0, vin - 0.7);
        } else {
          vout = Math.max(0, Vpeak - Vr * (cycleProgress - 0.25) * 1.33);
        }

        points.push({
          time: time_ms,
          probeA_Vin: Number(vin.toFixed(2)),
          probeB_Vout: Number(vout.toFixed(2)),
        });
      } else if (preset.id === 'bridge-rectifier') {
        const vin = 12 * Math.sin(phase);
        const Vpeak = 12 - 1.4; // 2 diode drops
        const tau_ms = (param2 * (param1 * 1e-6)) * 1000;
        const Vr = Math.min(Vpeak * 0.8, Vpeak / (100 * (param2 * (param1 * 1e-6)))); // 100Hz ripple
        const cycleProgress = (phase / Math.PI) % 1;
        let vout = 0;
        if (cycleProgress < 0.3) {
          vout = Math.max(0, Math.abs(vin) - 1.4);
        } else {
          vout = Math.max(0, Vpeak - Vr * (cycleProgress - 0.3) * 1.4);
        }

        points.push({
          time: time_ms,
          probeA_Vin: Number(vin.toFixed(2)),
          probeB_Vout: Number(vout.toFixed(2)),
        });
      } else if (preset.id === 'zener-regulator') {
        // Vin has 100Hz ripple
        const vin = param1 + 1.2 * Math.sin(phase * 2);
        const Vz = 5.1;
        const Rs = 150;
        const Iz = Math.max(0, (vin - Vz) / Rs - Vz / param2);
        const vout = Iz > 0 ? Vz + (Iz * 5) / 1000 : (vin * param2) / (Rs + param2);

        points.push({
          time: time_ms,
          probeA_Vin: Number(vin.toFixed(2)),
          probeB_Vout: Number(vout.toFixed(2)),
        });
      } else if (preset.id === 'ce-amplifier') {
        // CE amplifier with inverted gain
        const vin_mV = param2 * Math.sin(phase);
        const Av = -(param1 * 1000) / 25; // Av = -RC/re
        const vout_V = (Av * (vin_mV / 1000)) + 6.0; // centered at VCE_Q = 6V

        points.push({
          time: time_ms,
          probeA_Vin: Number((vin_mV / 10).toFixed(2)), // scaled for display
          probeB_Vout: Number(Math.max(0.2, Math.min(12, vout_V)).toFixed(2)),
        });
      } else if (preset.id === 'led-driver') {
        const Vf = 3.1; // Blue LED Vf
        const if_mA = Math.max(0, ((param1 - Vf) / param2) * 1000);
        points.push({
          time: time_ms,
          probeA_Vin: Number(param1.toFixed(2)),
          probeB_Vout: Number(if_mA.toFixed(2)),
        });
      }
    }
    return points;
  }, [preset.id, param1, param2]);

  // Derived Metrics
  const rippleFactor = useMemo(() => {
    if (preset.id === 'bridge-rectifier') {
      const f = 100;
      const C = param1 * 1e-6;
      const R = param2;
      return (1 / (4 * Math.sqrt(3) * f * C * R)).toFixed(3);
    } else if (preset.id === 'half-wave') {
      const f = 50;
      const C = param1 * 1e-6;
      const R = param2;
      return (1 / (2 * Math.sqrt(3) * f * C * R)).toFixed(3);
    }
    return 'N/A';
  }, [preset.id, param1, param2]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101b24] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              SIMULATION BENCH
            </span>
            <span className="text-xs font-mono text-slate-400">Interactive Circuit Sandbox</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CircuitBoard className="w-6 h-6 text-cyan-400" />
            <span>Interactive Circuit Sandbox & Oscilloscope</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Simulate standard university electronics circuits, observe real-time dual-channel oscilloscope traces, adjust passive components, and watch ripple factors & voltage regulation in action.
          </p>
        </div>
      </div>

      {/* Preset Selector Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {CIRCUIT_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPresetId(p.id)}
            className={`px-4 py-2.5 rounded-xl border text-left whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedPresetId === p.id
                ? 'bg-slate-900 border-cyan-500 shadow-md'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-slate-200 block">
              {p.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {p.category}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Controls + Schematic & Oscilloscope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Circuit Details & Component Tuners (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-200">
                {preset.name}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                Active Schematic
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {preset.description}
            </p>

            {/* Bill of Materials */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase font-bold">
                Components Connected:
              </span>
              <ul className="text-xs text-slate-300 font-mono space-y-1">
                {preset.components.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tuner 1 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{preset.param1Label}:</span>
                <span className="text-cyan-400 font-bold">
                  {param1} {preset.param1Unit}
                </span>
              </div>
              <input
                type="range"
                min={preset.param1Min}
                max={preset.param1Max}
                step={preset.param1Step}
                value={param1}
                onChange={(e) => setParam1(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Tuner 2 (if exists) */}
            {preset.param2Label && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{preset.param2Label}:</span>
                  <span className="text-emerald-400 font-bold">
                    {param2} {preset.param2Unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={preset.param2Min}
                  max={preset.param2Max}
                  step={preset.param2Step}
                  value={param2}
                  onChange={(e) => setParam2(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            )}
          </div>

          {/* Telemetry Panel */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[11px] font-bold text-slate-300 block uppercase">
              Circuit Telemetry:
            </span>
            {rippleFactor !== 'N/A' && (
              <div className="flex justify-between text-slate-400">
                <span>Ripple Factor (γ):</span>
                <span className="text-amber-400 font-bold">{rippleFactor}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Probe Channel A (Input):</span>
              <span className="text-cyan-400 font-bold">12.0 V pk</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Probe Channel B (Output):</span>
              <span className="text-emerald-400 font-bold">Active Load</span>
            </div>
          </div>
        </div>

        {/* Right: Dual-Channel Digital Oscilloscope (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Dual-Channel Digital Oscilloscope Trace</span>
              </h3>
              <p className="text-xs text-slate-400">
                CH1 (Cyan): Raw Circuit Input • CH2 (Emerald): Filtered/Amplified Circuit Output
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProbeB(!showProbeB)}
                className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                  showProbeB ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showProbeB ? 'CH2: ON' : 'CH2: OFF'}
              </button>
            </div>
          </div>

          {/* Scope Screen */}
          <div className="h-80 w-full pt-2 rounded-xl bg-slate-950 p-3 border border-slate-800 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scopeData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2a3a" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'Time [ms] (5 ms/div)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'Voltage [V] / Current [mA]', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <ReferenceLine y={0} stroke="#334155" strokeWidth={1.5} />
                <Line
                  type="monotone"
                  dataKey="probeA_Vin"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name="CH1: Input Vin"
                />
                {showProbeB && (
                  <Line
                    type="monotone"
                    dataKey="probeB_Vout"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                    name="CH2: Output Vout"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scope controls footer */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 p-3 rounded-lg bg-slate-950 border border-slate-800 gap-2">
            <div className="flex items-center gap-4">
              <span className="text-cyan-400">● CH1: 5.0 V / div</span>
              <span className="text-emerald-400">● CH2: 5.0 V / div</span>
              <span className="text-slate-400">Timebase: 5 ms / div</span>
            </div>
            <span className="text-slate-300">Trigger: CH1 Edge (Rising, 0.0V)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
