import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Laboratory and Feature Views
import { LandingPage } from './components/labs/LandingPage';
import { DashboardView } from './components/labs/DashboardView';
import { PhysicsLabView } from './components/labs/PhysicsLabView';
import { PNJunctionLabView } from './components/labs/PNJunctionLabView';
import { BJTLabView } from './components/labs/BJTLabView';
import { MOSFETLabView } from './components/labs/MOSFETLabView';
import { OptoLabView } from './components/labs/OptoLabView';
import { SpecialLabView } from './components/labs/SpecialLabView';
import { CircuitBuilderView } from './components/labs/CircuitBuilderView';
import { ExperimentsView } from './components/labs/ExperimentsView';
import { ComparatorView } from './components/labs/ComparatorView';
import { AIMentorView } from './components/labs/AIMentorView';
import { FormulaVaultView } from './components/labs/FormulaVaultView';
import { QuizView } from './components/labs/QuizView';

// State & Types
import { LabViewId, StudentProgress } from './types';
import { getStoredProgress, recordSimulationInteraction } from './utils/storage';

export function App() {
  const [currentView, setCurrentView] = useState<LabViewId>('landing');
  const [activeDetailId, setActiveDetailId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<StudentProgress>(() => getStoredProgress());

  // Listen to storage update events
  useEffect(() => {
    const handleStorageChange = () => {
      setProgress(getStoredProgress());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavigate = (view: LabViewId, detailId?: string) => {
    setCurrentView(view);
    setActiveDetailId(detailId);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulate = () => {
    recordSimulationInteraction();
    setProgress(getStoredProgress());
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        progress={progress}
        onOpenSearch={() => setIsSearchOpen(true)}
        mobileMenuOpen={mobileNavOpen}
        setMobileMenuOpen={setMobileNavOpen}
      />

      {/* Main App Layout */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage onEnterLab={(view) => handleNavigate(view || 'dashboard')} />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          {/* Collapsible Sidebar Navigation */}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#090e17] border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:bg-transparent lg:border-none lg:w-60 lg:shrink-0 ${
              mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
          >
            <div className="h-full pt-16 lg:pt-0">
              <Sidebar
                currentView={currentView}
                onNavigate={handleNavigate}
                progress={progress}
                mobileMenuOpen={mobileNavOpen}
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </div>
          </div>

          {/* Backdrop on mobile */}
          {mobileNavOpen && (
            <div
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
            />
          )}

          {/* Primary View Canvas */}
          <main className="flex-1 min-w-0">
            {currentView === 'dashboard' && (
              <DashboardView progress={progress} onNavigate={handleNavigate} />
            )}
            {currentView === 'physics' && (
              <PhysicsLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'pn-junction' && (
              <PNJunctionLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'bjt' && (
              <BJTLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'mosfet' && (
              <MOSFETLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'opto' && (
              <OptoLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'special-devices' && (
              <SpecialLabView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'circuit-builder' && (
              <CircuitBuilderView onSimulate={handleSimulate} onNavigate={handleNavigate} />
            )}
            {currentView === 'experiments' && (
              <ExperimentsView
                initialExperimentId={activeDetailId}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === 'comparator' && (
              <ComparatorView onNavigate={handleNavigate} />
            )}
            {currentView === 'mentor' && (
              <AIMentorView onNavigate={handleNavigate} />
            )}
            {currentView === 'formulas' && (
              <FormulaVaultView onNavigate={handleNavigate} />
            )}
            {currentView === 'quizzes' && (
              <QuizView onNavigate={handleNavigate} />
            )}
          </main>
        </div>
      )}

      {/* Global Search Quick Modal (Cmd+K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleNavigate}
      />
    </div>
  );
}

export default App;
