import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Download,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  ChevronRight,
  BookOpen,
  Award
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
import { EXPERIMENTS } from '../../data/experiments';
import { Experiment, LabViewId } from '../../types';
import { markExperimentComplete, isExperimentCompleted } from '../../utils/storage';

interface ExperimentsViewProps {
  initialExperimentId?: string;
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  initialExperimentId,
  onNavigate,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(
    initialExperimentId || EXPERIMENTS[0].id
  );
  const [recordedPoints, setRecordedPoints] = useState<Array<{ voltage: number; current: number; notes?: string }>>([]);
  const [sweepVoltage, setSweepVoltage] = useState<number>(0.0);
  const [activeTab, setActiveTab] = useState<'rig' | 'table' | 'viva'>('rig');
  const [revealedViva, setRevealedViva] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const experiment = EXPERIMENTS.find((e) => e.id === selectedExpId) || EXPERIMENTS[0];

  useEffect(() => {
    if (initialExperimentId) {
      setSelectedExpId(initialExperimentId);
    }
  }, [initialExperimentId]);

  useEffect(() => {
    setIsCompleted(isExperimentCompleted(experiment.id));
    setRecordedPoints([]);
    setSweepVoltage(0.0);
    setRevealedViva({});
  }, [experiment.id]);

  // Compute realistic current based on experiment type & current sweepVoltage
  const computeCurrent = (v: number): number => {
    if (experiment.id === 'exp-pn-forward') {
      if (v < 0) return -0.001;
      return Number(((1e-11 * (Math.exp(Math.min(v / 0.029, 28)) - 1)) * 1000).toFixed(2));
    } else if (experiment.id === 'exp-zener-breakdown') {
      if (v < -5.1) return Number((-((Math.abs(v) - 5.1) / 10) * 1000).toFixed(2));
      if (v < 0) return -0.005;
      return Number(((1e-11 * (Math.exp(Math.min(v / 0.029, 28)) - 1)) * 1000).toFixed(2));
    } else if (experiment.id === 'exp-bjt-output') {
      const knee = 1 - Math.exp(-v / 0.35);
      return Number((120 * 0.03 * knee * (1 + v / 100)).toFixed(2));
    } else if (experiment.id === 'exp-solar-cell') {
      const Isc = 3.5;
      const Voc = 0.61;
      return Number((Math.max(0, Isc * (1 - Math.exp((v - Voc) / 0.035)))).toFixed(2));
    } else if (experiment.id === 'exp-cmos-inverter') {
      // Vout instead of current
      return Number((5.0 * (0.5 - 0.5 * Math.tanh(9 * (v - 2.5) / 5.0))).toFixed(2));
    }
    // Default general diode
    return Number((Math.max(0, Math.exp((v - 0.6) / 0.03))).toFixed(2));
  };

  const currentReading = computeCurrent(sweepVoltage);

  // Manual record point
  const handleRecordPoint = () => {
    setRecordedPoints((prev) => [
      ...prev,
      { voltage: Number(sweepVoltage.toFixed(2)), current: currentReading },
    ]);
  };

  // Auto sweep simulation
  const handleAutoSweep = () => {
    const pts = [];
    const min = experiment.id === 'exp-zener-breakdown' ? -7.0 : 0.0;
    const max = experiment.id === 'exp-pn-forward' ? 0.85 : experiment.id === 'exp-solar-cell' ? 0.62 : 5.0;
    const step = (max - min) / 15;

    for (let v = min; v <= max; v += step) {
      const roundV = Number(v.toFixed(2));
      pts.push({
        voltage: roundV,
        current: computeCurrent(roundV),
      });
    }
    setRecordedPoints(pts);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = experiment.id === 'exp-cmos-inverter' ? 'Input Voltage (V),Output Voltage (V)\n' : 'Voltage (V),Current (mA)\n';
    const rows = recordedPoints.map((p) => `${p.voltage},${p.current}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experiment.id}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mark completion
  const handleCompleteLab = () => {
    markExperimentComplete(experiment.id);
    setIsCompleted(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b2a] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              VIRTUAL BENCH
            </span>
            <span className="text-xs font-mono text-slate-400">University Syllabus Lab Practical</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            <span>Virtual Experiments Workbench</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete simulated lab practicals, record observation tables with auto-sweep or manual dials, analyze plots, and test understanding via Viva Voce questions.
          </p>
        </div>

        {/* Completion status indicator */}
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>EXPERIMENT COMPLETED</span>
            </div>
          ) : (
            <button
              onClick={handleCompleteLab}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>MARK COMPLETED (+100 XP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Experiment Selector (3 cols) + Test Rig Workbench (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Experiment List (3 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider px-1 block">
            Laboratory Syllabus Practicals (8)
          </span>
          <div className="space-y-1.5 max-h-[650px] overflow-y-auto pr-1">
            {EXPERIMENTS.map((exp, idx) => {
              const active = exp.id === experiment.id;
              const done = isExperimentCompleted(exp.id);
              return (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    active
                      ? 'bg-slate-900 border-cyan-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono mt-0.5 shrink-0 ${
                    done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-600' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {done ? '✓' : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {exp.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 line-clamp-1">
                      {exp.module}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Experiment Rig & Measurement (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Experiment Title & Objective Card */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                {experiment.module}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Apparatus: {experiment.apparatus.slice(0, 3).join(', ')}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-white">
              {experiment.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Objective:</strong> {experiment.objective}
            </p>
          </div>

          {/* Sub-tabs: Test Rig / Observation Table / Viva Voce */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('rig')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'rig'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Virtual Test Rig & Dial
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Observation Table & Plot ({recordedPoints.length})
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'viva'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Viva Voce Questions ({experiment.quiz.length})
            </button>
          </div>

          {/* TAB 1: Virtual Test Rig & Dial */}
          {activeTab === 'rig' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
              {/* Virtual Instruments Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DMM 1: Voltmeter */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>DIGITAL VOLTMETER (V)</span>
                    <span className="text-emerald-400">AUTO-RANGE</span>
                  </div>
                  <div className="h-16 rounded-lg bg-black border border-slate-700 flex items-center justify-center font-mono text-2xl font-bold text-cyan-400 tracking-wider shadow-inner">
                    {sweepVoltage.toFixed(3)} <span className="text-sm ml-1 text-slate-400">V</span>
                  </div>
                </div>

                {/* DMM 2: Ammeter */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>DIGITAL AMMETER (I)</span>
                    <span className="text-emerald-400">AUTO-RANGE</span>
                  </div>
                  <div className="h-16 rounded-lg bg-black border border-slate-700 flex items-center justify-center font-mono text-2xl font-bold text-emerald-400 tracking-wider shadow-inner">
                    {currentReading.toFixed(3)} <span className="text-sm ml-1 text-slate-400">{experiment.id === 'exp-cmos-inverter' ? 'V' : 'mA'}</span>
                  </div>
                </div>
              </div>

              {/* Power Supply Knob Slider */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Regulated DC Power Supply Adjust Knob</span>
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {sweepVoltage.toFixed(2)} Volts
                  </span>
                </div>

                <input
                  type="range"
                  min={experiment.id === 'exp-zener-breakdown' ? -8.0 : 0.0}
                  max={experiment.id === 'exp-pn-forward' ? 0.90 : experiment.id === 'exp-solar-cell' ? 0.65 : 6.0}
                  step={0.05}
                  value={sweepVoltage}
                  onChange={(e) => setSweepVoltage(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    id="exp-record-point-btn"
                    onClick={handleRecordPoint}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>RECORD DATA POINT</span>
                  </button>
                  <button
                    id="exp-auto-sweep-btn"
                    onClick={handleAutoSweep}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RUN AUTO-SWEEP</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wide block">
                  Experimental Procedure:
                </span>
                <ol className="space-y-1.5 text-xs text-slate-300 font-mono list-decimal list-inside bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {experiment.procedureSteps.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Observation Table & Plot */}
          {activeTab === 'table' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-200">
                    Recorded Experimental Dataset ({recordedPoints.length} points)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Data acquired from virtual multimeters. Downloadable in CSV format.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={recordedPoints.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT CSV</span>
                  </button>
                  <button
                    onClick={() => setRecordedPoints([])}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/40 text-xs font-mono transition cursor-pointer"
                  >
                    CLEAR
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Voltage (V)</th>
                      <th className="p-2.5">{experiment.id === 'exp-cmos-inverter' ? 'Output Vout (V)' : 'Current (mA)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {recordedPoints.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-500">
                          No data recorded yet. Use the dial slider or click "Run Auto-Sweep" in Tab 1!
                        </td>
                      </tr>
                    ) : (
                      recordedPoints.map((pt, pIdx) => (
                        <tr key={pIdx} className="hover:bg-slate-900/40">
                          <td className="p-2.5 text-slate-500">{pIdx + 1}</td>
                          <td className="p-2.5 font-bold text-cyan-400">{pt.voltage.toFixed(2)} V</td>
                          <td className="p-2.5 font-bold text-emerald-400">{pt.current.toFixed(2)} {experiment.id === 'exp-cmos-inverter' ? 'V' : 'mA'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Experimental Scatter Plot */}
              {recordedPoints.length > 1 && (
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recordedPoints} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="voltage" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Voltage V [V]', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} label={{ value: 'Response', angle: -90, position: 'insideLeft', offset: 5, fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Viva Voce Questions */}
          {activeTab === 'viva' && (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-200">
                  Oral Viva Voce Exam Preparation
                </h3>
                <p className="text-xs text-slate-400">
                  Standard university viva exam questions frequently asked by external examiners.
                </p>
              </div>

              <div className="space-y-3">
                {experiment.quiz.map((vq, qIdx) => {
                  const isOpen = !!revealedViva[qIdx];
                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          Q{qIdx + 1}: {vq.question}
                        </span>
                        <button
                          onClick={() =>
                            setRevealedViva((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))
                          }
                          className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 shrink-0 cursor-pointer"
                        >
                          {isOpen ? 'HIDE ANSWER' : 'REVEAL ANSWER'}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1">
                          <div className="text-xs text-emerald-300 font-mono font-bold">
                            Answer: {vq.options[vq.correctIndex]}
                          </div>
                          <p className="text-xs text-slate-300 font-mono leading-relaxed">
                            {vq.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
