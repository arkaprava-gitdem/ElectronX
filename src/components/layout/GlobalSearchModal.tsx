import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight, Zap, Atom, Cpu, Layers, SunMedium, Radio, FlaskConical, Calculator } from 'lucide-react';
import { SEMICONDUCTOR_DEVICES } from '../../data/devices';
import { FORMULA_VAULT } from '../../data/formulas';
import { VIRTUAL_EXPERIMENTS } from '../../data/experiments';
import { LabViewId } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (view: LabViewId, detailId?: string) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Device' | 'Experiment' | 'Formula' | 'Concept';
  view: LabViewId;
  detailId?: string;
  module?: string;
}

export const GlobalSearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate searchable items
  const allItems: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    // Devices
    SEMICONDUCTOR_DEVICES.forEach((d) => {
      let targetView: LabViewId = 'dashboard';
      if (d.id.includes('pn') || d.id.includes('zener')) targetView = 'pn-junction';
      else if (d.id.includes('bjt')) targetView = 'bjt';
      else if (d.id.includes('fet') || d.id.includes('mos') || d.id.includes('cmos')) targetView = 'mosfet';
      else if (d.id.includes('led') || d.id.includes('solar') || d.category === 'opto') targetView = 'opto';
      else if (d.category === 'special') targetView = 'special-devices';

      list.push({
        id: `dev-${d.id}`,
        title: d.name,
        subtitle: `${d.tagline} • Apps: ${d.applications.slice(0, 2).join(', ')}`,
        category: 'Device',
        view: targetView,
        detailId: d.id,
        module: d.module,
      });

      // Also add key concepts from the device
      d.applications.forEach((app, i) => {
        list.push({
          id: `app-${d.id}-${i}`,
          title: app,
          subtitle: `Application of ${d.name}`,
          category: 'Concept',
          view: targetView,
          detailId: d.id,
          module: d.module,
        });
      });
    });

    // Experiments
    VIRTUAL_EXPERIMENTS.forEach((exp) => {
      list.push({
        id: `exp-${exp.id}`,
        title: exp.title,
        subtitle: exp.objective,
        category: 'Experiment',
        view: 'experiments',
        detailId: exp.id,
        module: exp.module,
      });
    });

    // Formulas
    FORMULA_VAULT.forEach((f) => {
      list.push({
        id: `f-${f.id}`,
        title: f.name,
        subtitle: `${f.latex} • ${f.description}`,
        category: 'Formula',
        view: 'formulas',
        detailId: f.id,
      });
    });

    // Core Physics Concepts
    const physicsConcepts = [
      { name: 'Fermi-Dirac Distribution', desc: 'Probability of electron occupancy at energy E', id: 'fermi' },
      { name: 'Carrier Drift & Mobility', desc: 'Electric field induced carrier velocity and scattering', id: 'drift' },
      { name: 'Carrier Diffusion Dynamics', desc: 'Concentration gradient driven carrier transport', id: 'diffusion' },
      { name: 'Hall Effect & Hall Voltage', desc: 'Magnetic deflection determining carrier type and density', id: 'hall' },
      { name: 'Breakdown Mechanisms (Zener vs Avalanche)', desc: 'Quantum tunneling vs impact ionization multiplication', id: 'breakdown' },
      { name: 'Pinch-off Voltage & Channel Saturation', desc: 'Constriction of conductive channel in JFET/MOSFET', id: 'pinch-off' },
      { name: 'Solar Cell Fill Factor & MPPT', desc: 'Squareness of photovoltaic I-V curve and peak power tracking', id: 'mppt' }
    ];

    physicsConcepts.forEach((c) => {
      list.push({
        id: `concept-${c.id}`,
        title: c.name,
        subtitle: c.desc,
        category: 'Concept',
        view: 'physics',
        detailId: c.id,
        module: 'MOD 01',
      });
    });

    return list;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8);
    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, allItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-xl bg-[#0f1420] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#0c101a]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices, breakdown, formulas, experiments, concepts..."
            autoFocus
            className="w-full bg-transparent border-none text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700 ml-1"
          >
            ESC
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/60 bg-slate-900/40 text-[11px] font-mono text-slate-400 overflow-x-auto">
          <span>Quick queries:</span>
          {['PN Junction', 'Zener Breakdown', 'BJT Q-Point', 'CMOS', 'Solar Cell', 'Conductivity'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0"
              >
                {tag}
              </button>
            )
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching laboratory items found for &quot;{query}&quot;. Try searching for &quot;breakdown&quot;, &quot;MOSFET&quot;, or &quot;drift&quot;.
            </div>
          ) : (
            results.map((item) => {
              const getCategoryBadge = (cat: string) => {
                switch (cat) {
                  case 'Device':
                    return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50';
                  case 'Experiment':
                    return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50';
                  case 'Formula':
                    return 'bg-amber-950/80 text-amber-400 border-amber-800/50';
                  default:
                    return 'bg-indigo-950/80 text-indigo-400 border-indigo-800/50';
                }
              };

              return (
                <button
                  key={item.id}
                  id={`search-result-${item.id}`}
                  onClick={() => {
                    onSelectResult(item.view, item.detailId);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-800/60 transition group flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition truncate">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getCategoryBadge(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      {item.module && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.module}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-400 transition shrink-0 text-xs">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-[#0c101a] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>ELECTRONX Knowledge Index • 12 Devices & 8 Experiments</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
