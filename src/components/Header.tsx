import React from 'react';
import {
  Navigation,
  Map as MapIcon,
  ClipboardList,
  SlidersHorizontal,
  Presentation,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Beaker
} from 'lucide-react';
import { DISCLAIMER_TEXT } from '../data/seedData';

export type ActiveTab = 'route' | 'map' | 'audit' | 'simulator' | 'guided_demo' | 'tests';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  testPassCount: number;
  totalTests: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  testPassCount,
  totalTests
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner: Mandatory Data Disclaimer */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="font-semibold tracking-wide uppercase text-[11px] text-amber-300">
            Audit Notice:
          </span>
          <span>{DISCLAIMER_TEXT}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300">
          <span>Local browser storage</span>
          <span aria-hidden="true">·</span>
          <span>Deterministic graph routing</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm ring-1 ring-teal-400/30">
            <Navigation className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">AccessPath</h1>
              <span className="text-[11px] uppercase tracking-wider text-teal-400 font-medium bg-teal-950/60 border border-teal-700/50 px-1.5 py-0.5 rounded">
                Demo College Wing
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Indoor accessible navigation &amp; facility improvement simulator
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors ${
              activeTab === 'tests'
                ? 'bg-teal-900/60 border-teal-500 text-teal-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Inspect deterministic test suite verification"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            <span>Logic Tests: {testPassCount}/{totalTests} Passed</span>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Reset audit dataset back to seed defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Reset Demo Data</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav aria-label="Main Navigation" className="border-t border-slate-800 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('route')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'route'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>1. Find a Route</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'map'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-4 h-4" aria-hidden="true" />
            <span>2. Building Map</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" aria-hidden="true" />
            <span>3. Audit Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>4. Improvement Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('guided_demo')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'guided_demo'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-300" aria-hidden="true" />
            <span className="text-amber-200">5. Guided Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'tests'
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Beaker className="w-4 h-4" aria-hidden="true" />
            <span>Logic Verification</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
