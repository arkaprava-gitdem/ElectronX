import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Layers,
  Cpu,
  Info,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { LabViewId } from '../../types';

interface ComparatorViewProps {
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

interface TransistorSpec {
  id: string;
  name: string;
  type: string;
  controlMechanism: string;
  inputImpedance: string;
  carriers: string;
  switchingSpeed: string;
  tempCoefficient: string;
  thermalRunaway: string;
  noiseFigure: string;
  siliconDensity: string;
  bestUseCases: string;
}

const TRANSISTOR_SPECS: TransistorSpec[] = [
  {
    id: 'bjt',
    name: 'Bipolar Junction Transistor (BJT)',
    type: 'Bipolar',
    controlMechanism: 'Current-controlled (IB controls IC)',
    inputImpedance: 'Low (1 kΩ to 10 kΩ)',
    carriers: 'Bipolar (Both electrons & holes)',
    switchingSpeed: 'Moderate (Minority carrier storage delay, ~50 ns)',
    tempCoefficient: 'Negative temp coeff of VBE (-2 mV/°C)',
    thermalRunaway: 'Susceptible to Thermal Runaway (requires Re stabilization)',
    noiseFigure: 'Low at low frequencies / audio',
    siliconDensity: 'Moderate area requirement',
    bestUseCases: 'Linear audio amplifiers, precision analog current mirrors, discrete switching',
  },
  {
    id: 'jfet',
    name: 'Junction Field Effect Transistor (JFET)',
    type: 'Unipolar',
    controlMechanism: 'Voltage-controlled (VGS controls ID via reverse depletion)',
    inputImpedance: 'High (~10⁸ to 10⁹ Ω, reverse-biased PN gate)',
    carriers: 'Unipolar (Majority carriers only)',
    switchingSpeed: 'Fast (No minority carrier storage)',
    tempCoefficient: 'Positive temp coeff of resistance',
    thermalRunaway: 'Immune to thermal runaway',
    noiseFigure: 'Extremely Low (no oxide interface states, popular in audio preamps)',
    siliconDensity: 'Moderate',
    bestUseCases: 'Low-noise audio/RF preamps, analog switches, high-impedance buffers',
  },
  {
    id: 'mosfet',
    name: 'Planar MOSFET',
    type: 'Unipolar',
    controlMechanism: 'Voltage-controlled (VGS modulates surface inversion)',
    inputImpedance: 'Extremely High (~10¹² to 10¹⁴ Ω, SiO2 oxide isolation)',
    carriers: 'Unipolar (Majority carriers only)',
    switchingSpeed: 'Very Fast (Limited only by gate capacitance charging)',
    tempCoefficient: 'Positive temp coeff (channel mobility decreases with T)',
    thermalRunaway: 'Immune to thermal runaway (safe to parallel power MOSFETs)',
    noiseFigure: 'Moderate (1/f flicker noise at Si-SiO2 interface)',
    siliconDensity: 'High (Scalable down to ~28nm planar)',
    bestUseCases: 'Power supplies (SMPS), motor drives, legacy VLSI CMOS logic',
  },
  {
    id: 'finfet',
    name: '3D FinFET (Tri-Gate)',
    type: 'Unipolar 3D',
    controlMechanism: 'Voltage-controlled (Gate wraps vertical fin on 3 sides)',
    inputImpedance: 'Extremely High (~10¹⁴ Ω, High-k metal gate)',
    carriers: 'Unipolar (Majority carriers)',
    switchingSpeed: 'Ultra-Fast (sub-nanosecond, sub-10ps gate delays)',
    tempCoefficient: 'Positive temp coeff',
    thermalRunaway: 'Immune to thermal runaway',
    noiseFigure: 'Low (Reduced short-channel leakage and drain-induced barrier lowering)',
    siliconDensity: 'Ultra-Dense (7nm, 5nm, 3nm nodes; billions per chip)',
    bestUseCases: 'Modern microprocessors, GPUs, smartphone SoCs, high-density AI accelerators',
  },
];

interface MaterialSpec {
  name: string;
  formula: string;
  bandgap_eV: number;
  electronMobility: string;
  breakdownField_MVcm: number;
  thermalCond_WcmK: number;
  maxOperatingTemp: string;
  powerLoss: string;
}

const WIDE_BANDGAP_SPECS: MaterialSpec[] = [
  {
    name: 'Silicon (Si)',
    formula: 'Si',
    bandgap_eV: 1.12,
    electronMobility: '1400 cm²/V·s',
    breakdownField_MVcm: 0.3,
    thermalCond_WcmK: 1.5,
    maxOperatingTemp: '150 °C',
    powerLoss: 'Baseline (High conduction losses at high voltages)',
  },
  {
    name: 'Silicon Carbide (SiC)',
    formula: '4H-SiC',
    bandgap_eV: 3.26,
    electronMobility: '900 cm²/V·s',
    breakdownField_MVcm: 3.0,
    thermalCond_WcmK: 4.9,
    maxOperatingTemp: '400 °C',
    powerLoss: 'Ultra-Low (10x higher breakdown voltage, high thermal conductivity)',
  },
  {
    name: 'Gallium Nitride (GaN)',
    formula: 'GaN',
    bandgap_eV: 3.40,
    electronMobility: '2000 cm²/V·s (2DEG HEMT)',
    breakdownField_MVcm: 3.3,
    thermalCond_WcmK: 2.0,
    maxOperatingTemp: '300 °C',
    powerLoss: 'Extremely Low (Ultra-fast GHz switching, compact power chargers)',
  },
];

export const ComparatorView: React.FC<ComparatorViewProps> = ({ onNavigate }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['bjt', 'mosfet', 'finfet']);
  const [activeTab, setActiveTab] = useState<'transistor' | 'semiconductor'>('transistor');

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const activeSpecs = TRANSISTOR_SPECS.filter((s) => selectedIds.includes(s.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#151928] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              ANALYSIS MATRIX
            </span>
            <span className="text-xs font-mono text-slate-400">Device Comparator</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-cyan-400" />
            <span>Semiconductor Device & Material Comparator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Directly cross-compare transistor architectures (BJT vs JFET vs MOSFET vs FinFET) and wide-bandgap materials (Si vs SiC vs GaN) for circuit design tradeoffs.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('transistor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'transistor'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transistors Matrix
          </button>
          <button
            onClick={() => setActiveTab('semiconductor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              activeTab === 'semiconductor'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Si vs SiC vs GaN
          </button>
        </div>
      </div>

      {/* TRANSISTOR MATRIX TAB */}
      {activeTab === 'transistor' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono text-slate-400 mr-2">Select devices to compare:</span>
            {TRANSISTOR_SPECS.map((s) => {
              const active = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSelect(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                    active
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {active ? '✓ ' : '+ '} {s.name}
                </button>
              );
            })}
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="p-3.5 text-slate-400 font-bold uppercase w-48 sticky left-0 bg-slate-900">
                    Parameter
                  </th>
                  {activeSpecs.map((s) => (
                    <th key={s.id} className="p-3.5 text-cyan-400 font-bold text-sm min-w-[220px]">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Classification</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 font-bold text-slate-200">{s.type}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Controlling Action</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 text-cyan-300">{s.controlMechanism}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Input Impedance (Zin)</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 text-emerald-400 font-bold">{s.inputImpedance}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Charge Carriers</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5">{s.carriers}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Switching Speed</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 text-amber-300">{s.switchingSpeed}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Thermal Stability</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5">{s.thermalRunaway}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Noise Performance</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5">{s.noiseFigure}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Integration Density</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 text-purple-300">{s.siliconDensity}</td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 text-slate-400 font-bold sticky left-0 bg-slate-950">Primary Application</td>
                  {activeSpecs.map((s) => (
                    <td key={s.id} className="p-3.5 text-slate-400 leading-relaxed">{s.bestUseCases}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEMICONDUCTOR MATERIALS TAB (Si vs SiC vs GaN) */}
      {activeTab === 'semiconductor' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h3 className="font-display font-bold text-base text-slate-200">
              Wide Bandgap (WBG) Semiconductor Revolution
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              While conventional Silicon has powered microelectronics for 60 years, its narrow 1.12 eV bandgap fundamentally limits breakdown field and operating temperature. SiC and GaN feature 3x larger bandgaps and 10x higher breakdown electric fields, transforming electric vehicles (EVs), solar inverters, and fast GaN chargers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WIDE_BANDGAP_SPECS.map((mat) => (
              <div
                key={mat.formula}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs"
              >
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] text-cyan-400 block font-bold">{mat.formula}</span>
                  <h4 className="font-display font-bold text-base text-white">{mat.name}</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bandgap Energy (Eg):</span>
                    <span className="text-amber-400 font-bold">{mat.bandgap_eV} eV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Breakdown Field:</span>
                    <span className="text-emerald-400 font-bold">{mat.breakdownField_MVcm} MV/cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thermal Conductivity:</span>
                    <span className="text-cyan-400 font-bold">{mat.thermalCond_WcmK} W/cm·K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Electron Mobility:</span>
                    <span className="text-slate-200">{mat.electronMobility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Junction Temp:</span>
                    <span className="text-rose-400 font-bold">{mat.maxOperatingTemp}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  {mat.powerLoss}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
