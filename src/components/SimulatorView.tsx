import React, { useState } from 'react';
import {
  BuildingData,
  BuildingNode,
  ReachabilityReport,
  RoutingPreferences,
  SimulatedChange
} from '../types';
import {
  applySimulation,
  computeReachabilityReport,
  DEFAULT_SIMULATION_CHANGES
} from '../lib/simulator';
import { calculateRoute } from '../lib/routing';
import { BuildingMap } from './BuildingMap';
import { BeforeAfterShowcase } from './BeforeAfterShowcase';
import {
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  RotateCcw,
  Zap,
  Lock,
  DoorOpen,
  Maximize2,
  Columns,
  Sliders
} from 'lucide-react';

interface SimulatorViewProps {
  baselineBuilding: BuildingData;
  preferences: RoutingPreferences;
  initialMode?: 'sandbox' | 'showcase';
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  baselineBuilding,
  preferences: initialPrefs,
  initialMode = 'showcase'
}) => {
  const [displayMode, setDisplayMode] = useState<'sandbox' | 'showcase'>(initialMode);
  const [simulations, setSimulations] = useState<SimulatedChange[]>(
    DEFAULT_SIMULATION_CHANGES
  );

  const [simPrefs, setSimPrefs] = useState<RoutingPreferences>(initialPrefs);
  const [selectedDestForInspection, setSelectedDestForInspection] = useState<string>(
    simPrefs.destinationId
  );

  // Toggle a simulated change
  const handleToggleSimulation = (id: string) => {
    setSimulations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleResetSimulations = () => {
    setSimulations(DEFAULT_SIMULATION_CHANGES.map((s) => ({ ...s, active: false })));
  };

  // Generate simulated building
  const simulatedBuilding = applySimulation(baselineBuilding, simulations);

  // Compute reachability report
  const report: ReachabilityReport = computeReachabilityReport(
    baselineBuilding,
    simulations,
    simPrefs
  );

  // Active route in simulation for selected destination
  const activeSimRoute = calculateRoute(simulatedBuilding, {
    ...simPrefs,
    destinationId: selectedDestForInspection
  });

  const entrances = baselineBuilding.nodes.filter((n) => n.isEntrance);
  const destinations = baselineBuilding.nodes.filter((n) => n.isDestination);

  return (
    <div className="space-y-6">
      {/* Simulation Sandbox Notice */}
      <div className="bg-purple-950/40 border border-purple-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-200 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px]">
              Improvement Simulator — Sandbox Isolation
            </span>
            <span className="text-slate-400">Baseline audit is never mutated</span>
          </div>
          <p className="text-slate-300">
            Simulate physical changes (e.g. door operators, widening, lift restoration) to evaluate network reachability impacts before committing capital.
          </p>
        </div>

        <button
          onClick={handleResetSimulations}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
          <span>Reset Sandbox</span>
        </button>
      </div>

      {/* Simulator Mode Selector: Demonstration Showcase vs. Custom Sandbox */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDisplayMode('showcase')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              displayMode === 'showcase'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>Before vs. After Demonstration (Authorised Door Unlock)</span>
          </button>

          <button
            onClick={() => setDisplayMode('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              displayMode === 'sandbox'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Multi-Intervention Sandbox</span>
          </button>
        </div>

        <span className="hidden lg:inline text-[11px] text-slate-400 px-2">
          {displayMode === 'showcase'
            ? 'Screenshot-ready comparison for slides & reports'
            : 'Custom entrance & intervention testing matrix'}
        </span>
      </div>

      {displayMode === 'showcase' ? (
        <BeforeAfterShowcase baselineBuilding={baselineBuilding} />
      ) : (
        /* Simulator Controls & Reachability Metrics */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Proposed Interventions */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              Proposed Interventions (Sandbox Toggles)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Activate simulated facility upgrades to test destination reachability.
            </p>
          </div>

          {/* Test Profile Parameters */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-3 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="sim-entrance-select"
                className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider"
              >
                Test Entrance
              </label>
              <select
                id="sim-entrance-select"
                value={simPrefs.entranceId}
                onChange={(e) =>
                  setSimPrefs({ ...simPrefs, entranceId: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {entrances.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name} (Level {ent.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simPrefs.requiresStepFree}
                  onChange={(e) =>
                    setSimPrefs({ ...simPrefs, requiresStepFree: e.target.checked })
                  }
                  className="rounded bg-slate-800 text-purple-600 focus:ring-purple-500"
                />
                <span>Step-Free Access</span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Min width:</span>
                <input
                  type="number"
                  step="10"
                  min="500"
                  max="1500"
                  value={simPrefs.minClearWidthMm}
                  onChange={(e) =>
                    setSimPrefs({
                      ...simPrefs,
                      minClearWidthMm: parseInt(e.target.value) || 0
                    })
                  }
                  className="w-16 bg-slate-800 border border-slate-700 text-white rounded px-1.5 py-0.5 text-xs font-mono text-center"
                />
                <span className="text-slate-400 text-[11px]">mm</span>
              </div>
            </div>
          </div>

          {/* Intervention Switches */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Available Interventions:
            </span>

            {simulations.map((sim) => (
              <div
                key={sim.id}
                onClick={() => handleToggleSimulation(sim.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  sim.active
                    ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{sim.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {sim.description}
                    </p>
                  </div>

                  <div
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 mt-0.5 ${
                      sim.active ? 'bg-purple-600 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Target:{' '}
                    <strong className="text-purple-300 font-mono">
                      {sim.targetConnectionId || sim.targetAssetId}
                    </strong>
                  </span>
                  <span className={sim.active ? 'text-purple-300 font-semibold' : 'text-slate-500'}>
                    {sim.active ? 'Active in Simulation' : 'Inactive (Baseline)'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed">
            <strong>Honest reporting principle:</strong> Simulation metrics demonstrate network reachability only. Do not claim that a simulated change has physically happened or invent unverified cost savings.
          </div>
        </div>

        {/* Right Column: Reachability Impact & Causal Attribution */}
        <div className="lg:col-span-7 space-y-5">
          {/* Reachability Dashboard Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  Reachability Impact Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparing baseline vs simulated accessible destinations for {report.entranceName}.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Baseline
                  </span>
                  <span className="font-bold text-white text-base">
                    {report.baselineReachableDestinations.length}/{destinations.length}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500" />

                <div className="text-right">
                  <span className="text-purple-400 block text-[10px] uppercase font-semibold">
                    Simulated
                  </span>
                  <span className="font-bold text-purple-300 text-base">
                    {report.simulatedReachableDestinations.length}/{destinations.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Newly Reachable Highlights */}
            {report.newlyReachableDestinations.length > 0 ? (
              <div className="p-3.5 rounded-lg bg-teal-950/50 border border-teal-600/70 space-y-3">
                <div className="flex items-center gap-2 text-teal-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {report.newlyReachableDestinations.length} Destination
                    {report.newlyReachableDestinations.length > 1 ? 's' : ''} Newly Unlocked!
                  </h4>
                </div>

                <div className="space-y-2">
                  {report.causalExplanations.map((cause) => (
                    <div
                      key={cause.destinationId}
                      className="bg-slate-900/90 p-2.5 rounded-lg border border-teal-800/60 text-xs text-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {cause.destinationName}
                        </span>
                        <span className="text-[10px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded font-medium">
                          Newly Reachable
                        </span>
                      </div>
                      <p className="text-teal-200 text-xs mt-1 font-medium">
                        {cause.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <span>
                  No additional destinations unlocked with current active interventions. Try activating "Restore Passenger Lift-1" or "Open Authorised West Side Entrance".
                </span>
              </div>
            )}

            {/* Destination Status List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Destination Status Matrix:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {destinations.map((dest) => {
                  const isBase = report.baselineReachableDestinations.some((d) => d.id === dest.id);
                  const isSim = report.simulatedReachableDestinations.some((d) => d.id === dest.id);
                  const isNew = isSim && !isBase;

                  return (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDestForInspection(dest.id)}
                      className={`text-left p-2.5 rounded-lg border transition-colors ${
                        selectedDestForInspection === dest.id
                          ? 'border-purple-500 bg-purple-950/40'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate mr-2">
                          {dest.name}
                        </span>
                        {isNew ? (
                          <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 border border-teal-700 px-1.5 py-0.5 rounded shrink-0">
                            + Newly Unlocked
                          </span>
                        ) : isSim ? (
                          <span className="text-[10px] font-medium text-emerald-400 shrink-0">
                            Reachable
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-rose-400 shrink-0">
                            Blocked
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Level {dest.level}</span>
                        <span className="text-slate-500">Click to view route on map</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulated Building Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Simulated Scenario Floorplan
              </h3>
              <span className="text-xs text-slate-400">
                Inspecting: {destinations.find((d) => d.id === selectedDestForInspection)?.name}
              </span>
            </div>
            <BuildingMap
              building={simulatedBuilding}
              routeResult={activeSimRoute}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
