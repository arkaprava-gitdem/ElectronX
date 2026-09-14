import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Search,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers
} from 'lucide-react';
import { FORMULA_VAULT } from '../../data/formulas';
import { FormulaItem, LabViewId } from '../../types';

interface FormulaVaultProps {
  onNavigate: (view: LabViewId, detailId?: string) => void;
}

export const FormulaVaultView: React.FC<FormulaVaultProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFormula, setActiveFormula] = useState<FormulaItem>(FORMULA_VAULT[0]);

  // Quick Calculator state: dictionary of variable symbol -> user input
  const [calcInputs, setCalcInputs] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    FORMULA_VAULT[0].variables.forEach((v) => {
      init[v.symbol] = v.defaultValue;
    });
    return init;
  });

  const categories = ['all', ...Array.from(new Set(FORMULA_VAULT.map((f) => f.category)))];

  const filteredFormulas = FORMULA_VAULT.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.latex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectFormula = (f: FormulaItem) => {
    setActiveFormula(f);
    const newInputs: Record<string, number> = {};
    f.variables.forEach((v) => {
      newInputs[v.symbol] = v.defaultValue;
    });
    setCalcInputs(newInputs);
  };

  // Perform calculation
  let calculatedResult: { value: number; unit: string; steps: string[] } | null = null;
  try {
    calculatedResult = activeFormula.calculate(calcInputs);
  } catch (err) {
    calculatedResult = null;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131d27] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              REFERENCE ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">Engineering Reference</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span>Formula Vault & Interactive Solvers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Searchable repository of foundational semiconductor formulas, complete with symbol definitions, SI units, and instant step-by-step numerical solvers.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas by name, equation or parameter..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Formula Browser (5 cols) + Active Solver (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Formula List */}
        <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredFormulas.map((f) => {
            const isSel = f.id === activeFormula.id;
            return (
              <button
                key={f.id}
                onClick={() => handleSelectFormula(f)}
                className={`w-full p-4 rounded-xl border text-left transition flex flex-col gap-2 cursor-pointer ${
                  isSel
                    ? 'bg-slate-900 border-cyan-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {f.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {f.category}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                  {f.latex}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {f.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Active Solver Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-cyan-400 block mb-1">
                {activeFormula.category}
              </span>
              <h2 className="font-display font-bold text-xl text-white">
                {activeFormula.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {activeFormula.description}
              </p>
            </div>

            {/* Formula Equation Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-center font-mono text-base md:text-lg font-bold text-cyan-300 shadow-inner">
              {activeFormula.latex}
            </div>

            {/* Quick Calculator Input Knobs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Instant Numerical Solver</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Enter parameter values
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeFormula.variables.map((v) => (
                  <div key={v.symbol} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">{v.symbol}</span>
                      <span className="text-slate-400 text-[10px]">{v.unit}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {v.name}
                    </span>
                    <input
                      type="number"
                      value={calcInputs[v.symbol] ?? v.defaultValue}
                      onChange={(e) =>
                        setCalcInputs({
                          ...calcInputs,
                          [v.symbol]: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>

              {/* Solved Output Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">
                      Calculated Result:
                    </span>
                    <span className="font-mono text-2xl font-bold text-cyan-300">
                      {calculatedResult !== null
                        ? calculatedResult.value > 1e4 || (calculatedResult.value < 1e-3 && calculatedResult.value > 0)
                          ? calculatedResult.value.toExponential(3)
                          : calculatedResult.value.toFixed(3)
                        : 'Error'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-mono font-bold">
                    {calculatedResult?.unit || ''}
                  </span>
                </div>

                {/* Step-by-step substitution steps */}
                {calculatedResult && calculatedResult.steps && calculatedResult.steps.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                    <span className="text-slate-500 uppercase block font-bold text-[10px]">
                      Substitution Steps:
                    </span>
                    {calculatedResult.steps.map((s, i) => (
                      <div key={i} className="text-slate-400">
                        • {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
