import React from 'react';
import {
  BuildingData,
  BuildingNode,
  RouteResult,
  RoutingPreferences
} from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Footprints,
  Maximize2,
  Building2,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  Sliders,
  Check
} from 'lucide-react';
import { BuildingMap } from './BuildingMap';

interface FindRouteViewProps {
  building: BuildingData;
  preferences: RoutingPreferences;
  onPreferencesChange: (newPrefs: RoutingPreferences) => void;
  routeResult: RouteResult;
  onNavigateToSimulator?: () => void;
}

const PRESETS = [
  {
    name: 'Manual / Standard Wheelchair',
    stepFree: true,
    width: 850,
    allowLift: true,
    desc: '850mm clearance, step-free required'
  },
  {
    name: 'Power Chair / Wide Mobility Device',
    stepFree: true,
    width: 900,
    allowLift: true,
    desc: '900mm clearance, step-free required'
  },
  {
    name: 'Walker / Cane / Stroller',
    stepFree: true,
    width: 750,
    allowLift: true,
    desc: '750mm clearance, step-free required'
  },
  {
    name: 'General Ambulatory Visitor',
    stepFree: false,
    width: 650,
    allowLift: true,
    desc: 'Stairs permitted, standard doors'
  }
];

export const FindRouteView: React.FC<FindRouteViewProps> = ({
  building,
  preferences,
  onPreferencesChange,
  routeResult,
  onNavigateToSimulator
}) => {
  const entrances = building.nodes.filter((n) => n.isEntrance);
  const destinations = building.nodes.filter((n) => n.isDestination);

  const selectedEntrance = building.nodes.find((n) => n.id === preferences.entranceId);
  const selectedDest = building.nodes.find((n) => n.id === preferences.destinationId);

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    onPreferencesChange({
      ...preferences,
      requiresStepFree: preset.stepFree,
      minClearWidthMm: preset.width,
      allowLift: preset.allowLift
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-300 text-xs">
        <div>
          <span className="font-semibold text-white block text-sm">
            Deterministic Accessible Route Navigation
          </span>
          <p className="text-slate-400 mt-0.5">
            Routes are computed using recorded audit graph measurements. No medical diagnosis or account is required.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300 shrink-0">
          <Clock className="w-4 h-4 text-teal-400" />
          <span>Audit timestamp: {new Date(building.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Route & Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Route Parameters */}
        <div className="lg:col-span-4 space-y-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              Route Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select entrance, destination, and physical clearance parameters.
            </p>
          </div>

          {/* Entrance Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="entrance-select"
              className="block text-xs font-semibold text-slate-200 uppercase tracking-wider"
            >
              Building Entrance
            </label>
            <select
              id="entrance-select"
              value={preferences.entranceId}
              onChange={(e) =>
                onPreferencesChange({ ...preferences, entranceId: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {entrances.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} (Level {ent.level})
                </option>
              ))}
            </select>
            {selectedEntrance?.description && (
              <p className="text-[11px] text-slate-400 italic">
                {selectedEntrance.description}
              </p>
            )}
          </div>

          {/* Destination Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="destination-select"
              className="block text-xs font-semibold text-slate-200 uppercase tracking-wider"
            >
              Destination
            </label>
            <select
              id="destination-select"
              value={preferences.destinationId}
              onChange={(e) =>
                onPreferencesChange({ ...preferences, destinationId: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name} (Level {dest.level})
                </option>
              ))}
            </select>
            {selectedDest?.description && (
              <p className="text-[11px] text-slate-400 italic">
                {selectedDest.description}
              </p>
            )}
          </div>

          {/* Illustrative Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Illustrative Clearance Presets
              </span>
              <span className="text-[10px] text-slate-400">Editable below</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESETS.map((preset) => {
                const isSelected =
                  preferences.requiresStepFree === preset.stepFree &&
                  preferences.minClearWidthMm === preset.width &&
                  preferences.allowLift === preset.allowLift;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-left p-2 rounded-lg text-xs transition-colors border ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-500 text-teal-200 font-medium'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Criteria Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            {/* Step-free checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preferences.requiresStepFree}
                onChange={(e) =>
                  onPreferencesChange({ ...preferences, requiresStepFree: e.target.checked })
                }
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Require Step-Free Access
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Excludes all stairs and steps; mandates level corridors, compliant ramps, or lifts.
                </span>
              </div>
            </label>

            {/* Minimum passage width */}
            <div className="space-y-1">
              <label
                htmlFor="min-width-input"
                className="block text-xs font-semibold text-slate-200"
              >
                Minimum Clear Passage Width (mm)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="min-width-input"
                  type="number"
                  min="500"
                  max="2000"
                  step="10"
                  value={preferences.minClearWidthMm}
                  onChange={(e) =>
                    onPreferencesChange({
                      ...preferences,
                      minClearWidthMm: Math.max(0, parseInt(e.target.value) || 0)
                    })
                  }
                  className="w-28 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
                <span className="text-xs text-slate-400">mm clear opening</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Doors narrower than this value fail in strict mode. Unmeasured doors (null) cannot produce a verified route.
              </p>
            </div>

            {/* Allow Lift Use */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={preferences.allowLift}
                onChange={(e) =>
                  onPreferencesChange({ ...preferences, allowLift: e.target.checked })
                }
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Allow Passenger Lift Usage
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Enables vertical travel via Lift-1 when in service.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Area: Route Result & Map */}
        <div className="lg:col-span-8 space-y-5">
          {/* Output State Card (1 of 3 States) */}
          {routeResult.status === 'verified_match' && (
            <div className="bg-emerald-950/40 border border-emerald-600/70 rounded-xl p-4 shadow-sm text-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-emerald-300">
                        State 1: Verified Accessible Route Available
                      </h3>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                        100% Audit Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      A continuous route satisfying your access requirements was found using confirmed physical audit measurements.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-white">
                    {routeResult.totalDistanceMetres} m
                  </span>
                  <span className="text-[11px] text-slate-400 block">Total distance</span>
                </div>
              </div>

              {/* Summary Metrics Chips */}
              <div className="mt-3 pt-3 border-t border-emerald-900/50 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    Narrowest bottleneck:{' '}
                    <strong className="text-white">
                      {routeResult.minWidthEncounteredMm} mm
                    </strong>{' '}
                    (≥ {preferences.minClearWidthMm} mm required)
                  </span>
                </div>

                {routeResult.hasRamps && (
                  <span className="bg-slate-800 text-teal-300 px-2 py-0.5 rounded text-[11px]">
                    Includes exterior ramp
                  </span>
                )}

                {routeResult.hasLifts && (
                  <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded text-[11px]">
                    Includes Passenger Lift-1
                  </span>
                )}
              </div>
            </div>
          )}

          {routeResult.status === 'potential_match' && (
            <div className="bg-amber-950/40 border border-amber-600/70 rounded-xl p-4 shadow-sm text-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5">
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-amber-300">
                        State 2: Potential Route Identified (Requires Condition Check)
                      </h3>
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                        Verification Required
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      A physical pathway connects your entrance to destination, but one or more measurements or evidence records have not been formally confirmed.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-white">
                    {routeResult.totalDistanceMetres} m
                  </span>
                  <span className="text-[11px] text-slate-400 block">Estimated length</span>
                </div>
              </div>

              {/* Unverified Conditions Checklist */}
              <div className="mt-3 pt-3 border-t border-amber-900/50 space-y-2">
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                  Conditions Requiring Confirmation Before Travel:
                </span>
                <ul className="space-y-1.5">
                  {routeResult.unverifiedConditions.map((cond, i) => (
                    <li
                      key={i}
                      className="bg-slate-900/80 border border-amber-800/60 p-2 rounded text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-200">
                          {cond.fromName} ↔ {cond.toName} ({cond.connectionType})
                        </div>
                        <p className="text-slate-300 text-[11px] mt-0.5">{cond.issue}</p>
                        {cond.notes && (
                          <p className="text-slate-400 text-[10px] mt-0.5 italic">
                            Auditor note: {cond.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {routeResult.status === 'no_route' && (
            <div className="bg-rose-950/40 border border-rose-700/80 rounded-xl p-4 shadow-sm text-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-rose-500/20 text-rose-400 mt-0.5">
                  <XCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-300">
                    State 3: No Matching Route in Recorded Network
                  </h3>
                  <p className="text-xs text-slate-300">
                    No physical route could be found matching your selected requirements in the current building audit.
                  </p>
                </div>
              </div>

              {/* Diagnostic Reasons for Failure */}
              <div className="mt-3 pt-3 border-t border-rose-900/50 space-y-1.5">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                  Identified Barriers / Obstacles:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-rose-200">
                  {routeResult.failureReasons.map((reason, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>

                {preferences.entranceId === 'n-ent-side' && (
                  <div className="mt-3 bg-purple-950/70 border border-purple-700/80 p-3 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2 text-purple-200 font-bold">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Hackathon Demo Scenario: Authorised Door Closure</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      The West Side door is locked in baseline audit data. In the <strong>Improvement Simulator</strong>, you can demonstrate how simulating opening this authorised door makes the Administration Office 100% verified reachable!
                    </p>
                    {onNavigateToSimulator && (
                      <button
                        type="button"
                        onClick={onNavigateToSimulator}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <span>Open Side-by-Side Simulator Demonstration</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-3 bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
                  <span>
                    Tip: Visit the <strong>Improvement Simulator</strong> to test how repairing Lift-1, opening the side entrance, or widening doorways restores access for this journey.
                  </span>
                  {onNavigateToSimulator && (
                    <button
                      type="button"
                      onClick={onNavigateToSimulator}
                      className="text-teal-400 hover:underline shrink-0 text-xs font-semibold"
                    >
                      Open Simulator →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Building Schematic Diagram Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Interactive Building Schematic
              </h3>
              <span className="text-xs text-slate-400">
                {selectedEntrance?.name} → {selectedDest?.name}
              </span>
            </div>
            <BuildingMap building={building} routeResult={routeResult} />
          </div>

          {/* Numbered Step-by-Step Text Route Directions */}
          {routeResult.steps.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-teal-400" />
                  Numbered Step-by-Step Route Guidance
                </h3>
                <span className="text-[11px] text-slate-400">
                  {routeResult.steps.length} sequential segments
                </span>
              </div>

              <ol className="space-y-2 text-xs">
                {routeResult.steps.map((step) => (
                  <li
                    key={step.stepNumber}
                    className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-100 font-medium leading-relaxed">
                        {step.instruction}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span>Segment: {step.distanceMetres}m</span>
                        {step.clearWidthMm && (
                          <span>Clearance: {step.clearWidthMm}mm</span>
                        )}
                        <span>
                          Type:{' '}
                          <strong className="capitalize text-slate-300">
                            {step.connectionType}
                          </strong>
                        </span>
                        {step.verificationNotice && (
                          <span className="text-amber-400 font-medium">
                            {step.verificationNotice}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
