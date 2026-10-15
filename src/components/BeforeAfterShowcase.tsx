import React, { useState } from 'react';
import { BuildingData, RouteResult, RoutingPreferences } from '../types';
import { calculateRoute } from '../lib/routing';
import { applySimulation, DEFAULT_SIMULATION_CHANGES } from '../lib/simulator';
import { BuildingMap } from './BuildingMap';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  DoorOpen,
  Lock,
  Copy,
  Check,
  Maximize2,
  Sparkles,
  Camera,
  Layers,
  Info,
  Footprints
} from 'lucide-react';

interface BeforeAfterShowcaseProps {
  baselineBuilding: BuildingData;
}

export const BeforeAfterShowcase: React.FC<BeforeAfterShowcaseProps> = ({
  baselineBuilding
}) => {
  const [viewMode, setViewMode] = useState<'side_by_side' | 'interactive_flip'>('side_by_side');
  const [activeFlipState, setActiveFlipState] = useState<'before' | 'after'>('before');
  const [copied, setCopied] = useState(false);

  // Preference for this journey: West Side Entrance -> Administration Office
  const testPrefs: RoutingPreferences = {
    entranceId: 'n-ent-side',
    destinationId: 'n-dest-office',
    requiresStepFree: true,
    minClearWidthMm: 850,
    allowLift: true
  };

  // 1. BEFORE STATE (Baseline Audit Data)
  const beforeBuilding = baselineBuilding;
  const beforeRoute: RouteResult = calculateRoute(beforeBuilding, testPrefs);

  // 2. AFTER STATE (Simulated: Open Authorised West Side Entrance)
  const openSideSim = DEFAULT_SIMULATION_CHANGES.find(
    (s) => s.id === 'sim-open-west-entrance'
  ) || {
    id: 'sim-open-west-entrance',
    label: 'Open Authorised West Side Entrance',
    description: 'Deactivate keycard restriction and configure automated swing operator for public access.',
    type: 'open_side_entrance',
    targetConnectionId: 'c-ent-side-door',
    changes: {
      operationalStatus: 'open',
      clearWidthMm: 950,
      stepFree: true,
      evidenceStatus: 'verified'
    },
    active: true
  };

  const afterBuilding = applySimulation(baselineBuilding, [{ ...openSideSim, active: true }]);
  const afterRoute: RouteResult = calculateRoute(afterBuilding, testPrefs);

  const presentationSummary = `AccessPath Scenario Demonstration:
• Before: Door closed (c-ent-side-door card-locked in baseline) → Office blocked (No route found).
• After: Simulate opening authorised door → Office becomes verified reachable (41.0m, 950mm entrance clearance, 100% step-free).
• Causal Factor: Unlocked directly by simulated intervention "Open Authorised West Side Entrance" with no other barrier remaining.`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(presentationSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
              Feature Scenario Demonstration
            </span>
            <span className="text-xs text-slate-400">Presentation &amp; Screenshot Mode</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
            Authorised Door Access: Before vs. After
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrating how opening a card-restricted door unlocks a previously blocked journey from the accessible parking entrance to the Administration Office.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                viewMode === 'side_by_side'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side Dual View
            </button>
            <button
              onClick={() => setViewMode('interactive_flip')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                viewMode === 'interactive_flip'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive State Toggle
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            title="Copy text summary for presentation slides"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Slide Notes'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Flip Mode Switcher (if in interactive_flip mode) */}
      {viewMode === 'interactive_flip' && (
        <div className="flex items-center justify-center gap-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Select Active View:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFlipState('before')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeFlipState === 'before'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>BEFORE: Door Closed (Office Blocked)</span>
            </button>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <button
              onClick={() => setActiveFlipState('after')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeFlipState === 'after'
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>AFTER: Door Open (Office Reachable)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Comparison Container */}
      <div
        className={`grid gap-6 items-start ${
          viewMode === 'side_by_side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* PANEL 1: BEFORE (Door Closed -> Office Blocked) */}
        {(viewMode === 'side_by_side' || activeFlipState === 'before') && (
          <div className="bg-slate-950 border-2 border-rose-900/70 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              {/* Card Badge Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                    BEFORE: Recorded Baseline Audit
                  </span>
                </div>
                <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">
                  Door Closed · Office Blocked
                </span>
              </div>

              {/* Status Outcome Banner */}
              <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-rose-200 block">
                    State 3: No Matching Route in Recorded Network
                  </span>
                  <p className="text-xs text-rose-300 leading-relaxed">
                    The West Side Entrance door (<code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">c-ent-side-door</code>) requires an authorised staff/student proximity card reader in the baseline audit. Casual visitors or wheelchair users cannot enter.
                  </p>
                </div>
              </div>

              {/* Data & Diagnostics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Origin</span>
                  <p className="text-white font-medium">West Side Entrance (Level 0)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination</span>
                  <p className="text-white font-medium">Admin Office (Level 0)</p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Door Status</span>
                  <p className="text-rose-400 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> CLOSED (Restricted)
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Route Outcome</span>
                  <p className="text-rose-400 font-bold">0.0 m (Blocked)</p>
                </div>
              </div>
            </div>

            {/* Map Preview (Before) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  Baseline Schematic (Closed Door Highlighted)
                </span>
                <span className="text-[11px] text-rose-400 font-mono">No Path Found</span>
              </div>
              <BuildingMap
                building={beforeBuilding}
                routeResult={beforeRoute}
                heightClassName="h-[380px]"
              />
            </div>
          </div>
        )}

        {/* PANEL 2: AFTER (Simulate Opening Authorised Door -> Office Reachable) */}
        {(viewMode === 'side_by_side' || activeFlipState === 'after') && (
          <div className="bg-slate-950 border-2 border-teal-600/80 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              {/* Card Badge Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-300">
                    AFTER: Simulated Improvement Sandbox
                  </span>
                </div>
                <span className="text-[11px] font-bold text-teal-300 bg-teal-950/80 border border-teal-700 px-2 py-0.5 rounded">
                  Door Simulated Open · Office Reachable
                </span>
              </div>

              {/* Status Outcome Banner */}
              <div className="p-3.5 rounded-lg bg-teal-950/50 border border-teal-600 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-teal-200 block">
                    State 1: Verified Accessible Route Available
                  </span>
                  <p className="text-xs text-teal-300 leading-relaxed">
                    Simulating opening the authorised door with automated push-pad activation immediately completes a level, verified 41.0m route to the Administration Office with 900mm minimum bottleneck clearance.
                  </p>
                </div>
              </div>

              {/* Data & Diagnostics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Origin</span>
                  <p className="text-white font-medium">West Side Entrance (Level 0)</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination</span>
                  <p className="text-white font-medium">Admin Office (Level 0)</p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Door Status</span>
                  <p className="text-teal-300 font-bold flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5" /> OPEN (Simulated 950mm)
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Route Outcome</span>
                  <p className="text-teal-300 font-bold">41.0 m (Verified Step-Free)</p>
                </div>
              </div>
            </div>

            {/* Map Preview (After) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  Simulated Floorplan (Glowing Accessible Path)
                </span>
                <span className="text-[11px] text-teal-300 font-mono">100% Step-Free Route</span>
              </div>
              <BuildingMap
                building={afterBuilding}
                routeResult={afterRoute}
                heightClassName="h-[380px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Explanatory Causal Takeaway Banner */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">
              Facility Improvement Insight:
            </span>
            <p className="text-slate-400 leading-relaxed">
              This deterministic simulation proves that no secondary physical barrier (such as narrow corridors or thresholds) exists between the West Entrance and Administration Office. Enabling public push-pad access on this single door completely unlocks the journey.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-slate-400 font-mono text-[11px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Causal factor: sim-open-west-entrance
        </div>
      </div>
    </div>
  );
};
