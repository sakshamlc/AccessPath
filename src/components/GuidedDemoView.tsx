import React, { useState } from 'react';
import {
  BuildingData,
  BuildingNode,
  RouteResult,
  RoutingPreferences
} from '../types';
import { calculateRoute } from '../lib/routing';
import { applySimulation, DEFAULT_SIMULATION_CHANGES } from '../lib/simulator';
import { BuildingMap } from './BuildingMap';
import { BeforeAfterShowcase } from './BeforeAfterShowcase';
import {
  Presentation,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  Columns,
  Camera
} from 'lucide-react';

interface GuidedDemoViewProps {
  building: BuildingData;
  onUpdateBuilding: (b: BuildingData) => void;
  onResetToSeed: () => void;
}

export const GuidedDemoView: React.FC<GuidedDemoViewProps> = ({
  building,
  onUpdateBuilding,
  onResetToSeed
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('scenario-a');
  const [showShowcase, setShowShowcase] = useState<boolean>(false);

  // Local demo preferences and state
  const [demoPrefs, setDemoPrefs] = useState<RoutingPreferences>({
    entranceId: 'n-ent-main',
    destinationId: 'n-dest-office',
    requiresStepFree: true,
    minClearWidthMm: 850,
    allowLift: true
  });

  const [activeSimId, setActiveSimId] = useState<string | null>(null);

  // Effective demo building (incorporates simulation if step 5/6)
  let effectiveBuilding = building;
  if (activeSimId) {
    const sim = DEFAULT_SIMULATION_CHANGES.find((s) => s.id === activeSimId);
    if (sim) {
      effectiveBuilding = applySimulation(building, [{ ...sim, active: true }]);
    }
  }

  // Calculate route
  const currentRoute: RouteResult = calculateRoute(effectiveBuilding, demoPrefs);

  // Scripted 7-step presentation
  const STEPS = [
    {
      step: 1,
      title: '1. Select a Step-Free Visitor Profile',
      subtitle: 'Configures 850mm clear width and mandates step-free access without medical disclosure.',
      actionLabel: 'Apply Step-Free Profile (850mm)',
      execute: () => {
        setDemoPrefs({
          entranceId: 'n-ent-main',
          destinationId: 'n-dest-office',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
        setActiveSimId(null);
      },
      explanation:
        'The visitor arrives at the Main Public Entrance. Their mobility device requires a minimum 850mm passage width and cannot negotiate stairs.'
    },
    {
      step: 2,
      title: '2. Find the Office Route (Scenario A)',
      subtitle: 'Deterministic engine rejects the 3-step short route and routes via the exterior ramp.',
      actionLabel: 'Calculate Route to Administration Office',
      execute: () => {
        setDemoPrefs({
          entranceId: 'n-ent-main',
          destinationId: 'n-dest-office',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
        setActiveSimId(null);
      },
      explanation:
        'Notice the shortest physical connection to the foyer has 3 steps (masonry plinth). Because step-free mode is active, the algorithm strictly rejects stairs and routes the visitor via the 1:14 covered ramp (28m total distance, verified step-free).'
    },
    {
      step: 3,
      title: '3. Mark Lift-1 Unavailable (Scenario B)',
      subtitle: 'Simulates a facility audit finding where Lift-1 is closed for maintenance.',
      actionLabel: 'Close Lift-1 in Audit Manager',
      execute: () => {
        const updated = JSON.parse(JSON.stringify(building)) as BuildingData;
        updated.sharedAssets['lift-1'].operationalStatus = 'closed';
        updated.sharedAssets['lift-1'].notes = 'Closed for emergency drive motor maintenance.';
        onUpdateBuilding(updated);
        setDemoPrefs({
          entranceId: 'n-ent-main',
          destinationId: 'n-dest-library', // Level 1
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
        setActiveSimId(null);
      },
      explanation:
        'We update centralized shared asset Lift-1 to "closed". The system immediately cascades this status across all connecting lift shafts on Ground and First Floor.'
    },
    {
      step: 4,
      title: '4. Explain the Blocked Destination',
      subtitle: 'Level 1 Library becomes unreachable in step-free mode.',
      actionLabel: 'Inspect Route Failure Diagnostics',
      execute: () => {
        setDemoPrefs({
          entranceId: 'n-ent-main',
          destinationId: 'n-dest-library',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
      },
      explanation:
        'The system returns State 3 (No Matching Route). The diagnostic clearly explains: "Vertical travel to Level 1 requires Lift-1, which is currently recorded as closed for maintenance." Ambulatory stairs are not used.'
    },
    {
      step: 5,
      title: '5. Simulate Opening Authorised Side Entrance (Scenario C)',
      subtitle: 'Testing a sandbox improvement without altering baseline data.',
      actionLabel: 'Simulate Opening West Side Entrance',
      execute: () => {
        setActiveSimId('sim-open-west-entrance');
        setDemoPrefs({
          entranceId: 'n-ent-side',
          destinationId: 'n-dest-office',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
      },
      explanation:
        'In the Improvement Simulator sandbox, we simulate deactivating the keycard restriction on the West Side Entrance. Baseline audit data remains untouched.'
    },
    {
      step: 6,
      title: '6. Show Newly Reachable Journeys & Causal Explanation',
      subtitle: 'Engine calculates the delta and explains the exact enabling intervention.',
      actionLabel: 'Show Unlocked Journey Analysis',
      execute: () => {
        setActiveSimId('sim-open-west-entrance');
        setDemoPrefs({
          entranceId: 'n-ent-side',
          destinationId: 'n-dest-office',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
      },
      explanation:
        'Visitors arriving at the accessible parking bay can now directly enter the building and reach the Administration Office and Ground Toilet via level corridors (21.5m, step-free).'
    },
    {
      step: 7,
      title: '7. Reset Demo to Initial Baseline',
      subtitle: 'Restores the original clean illustrative college dataset.',
      actionLabel: 'Reset Demo Data to Seed',
      execute: () => {
        onResetToSeed();
        setActiveSimId(null);
        setDemoPrefs({
          entranceId: 'n-ent-main',
          destinationId: 'n-dest-office',
          requiresStepFree: true,
          minClearWidthMm: 850,
          allowLift: true
        });
        setCurrentStep(1);
      },
      explanation:
        'All temporary audit adjustments and sandbox overrides are cleared. The application is ready for another judge or presentation run.'
    }
  ];

  const handleLaunchScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    if (scenarioId === 'scenario-a') {
      // Scenario A: Main entrance to Office
      setDemoPrefs({
        entranceId: 'n-ent-main',
        destinationId: 'n-dest-office',
        requiresStepFree: true,
        minClearWidthMm: 850,
        allowLift: true
      });
      setActiveSimId(null);
    } else if (scenarioId === 'scenario-b') {
      // Scenario B: Closing lift blocks destination
      const updated = JSON.parse(JSON.stringify(building)) as BuildingData;
      updated.sharedAssets['lift-1'].operationalStatus = 'closed';
      onUpdateBuilding(updated);
      setDemoPrefs({
        entranceId: 'n-ent-main',
        destinationId: 'n-dest-library',
        requiresStepFree: true,
        minClearWidthMm: 850,
        allowLift: true
      });
      setActiveSimId(null);
    } else if (scenarioId === 'scenario-c') {
      // Scenario C: Opening authorised side entrance unlocks journey
      setActiveSimId('sim-open-west-entrance');
      setDemoPrefs({
        entranceId: 'n-ent-side',
        destinationId: 'n-dest-office',
        requiresStepFree: true,
        minClearWidthMm: 850,
        allowLift: true
      });
    } else if (scenarioId === 'scenario-d') {
      // Scenario D: Unknown doorway width prevents route being verified
      onResetToSeed();
      setActiveSimId(null);
      setDemoPrefs({
        entranceId: 'n-ent-main',
        destinationId: 'n-dest-seminar',
        requiresStepFree: true,
        minClearWidthMm: 850,
        allowLift: true
      });
    } else if (scenarioId === 'scenario-e') {
      // Scenario E: Destination remains unreachable after irrelevant fix
      const updated = JSON.parse(JSON.stringify(building)) as BuildingData;
      updated.sharedAssets['lift-1'].operationalStatus = 'closed';
      onUpdateBuilding(updated);
      // Simulate widening toilet door (irrelevant to upper library)
      setActiveSimId('sim-widen-toilet-door');
      setDemoPrefs({
        entranceId: 'n-ent-main',
        destinationId: 'n-dest-library',
        requiresStepFree: true,
        minClearWidthMm: 850,
        allowLift: true
      });
    }
  };

  const currentStepObj = STEPS[currentStep - 1];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-200 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px]">
              Guided Presentation Mode for Judges
            </span>
            <span className="text-slate-400">2-minute repeatable live demonstration</span>
          </div>
          <p className="text-slate-300">
            Follow the 7-step interactive walkthrough or trigger specific test scenarios below to see real-time deterministic route calculation.
          </p>
        </div>

        <button
          onClick={() => {
            onResetToSeed();
            setActiveSimId(null);
            setCurrentStep(1);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Quick Scenario Buttons (A, B, C, D, E) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Scenario Triggers (Requirements Checklist)
          </span>
          <span className="text-[11px] text-slate-400">Click any scenario to load instant state</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          <button
            onClick={() => handleLaunchScenario('scenario-a')}
            className={`text-left p-2.5 rounded-lg border transition-all ${
              activeScenarioId === 'scenario-a'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <span>Scenario A</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Main entrance to Office: short stairs vs longer step-free ramp.
            </p>
          </button>

          <button
            onClick={() => handleLaunchScenario('scenario-b')}
            className={`text-left p-2.5 rounded-lg border transition-all ${
              activeScenarioId === 'scenario-b'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <span>Scenario B</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Lift-1 closed blocks Level 1 Library with no other step-free route.
            </p>
          </button>

          <button
            onClick={() => handleLaunchScenario('scenario-c')}
            className={`text-left p-2.5 rounded-lg border transition-all ${
              activeScenarioId === 'scenario-c'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <span>Scenario C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Opening authorised side entrance unlocks previously blocked access.
            </p>
          </button>

          <button
            onClick={() => handleLaunchScenario('scenario-d')}
            className={`text-left p-2.5 rounded-lg border transition-all ${
              activeScenarioId === 'scenario-d'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <span>Scenario D</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Unknown doorway width (Seminar G04) triggers potential route check.
            </p>
          </button>

          <button
            onClick={() => handleLaunchScenario('scenario-e')}
            className={`text-left p-2.5 rounded-lg border transition-all ${
              activeScenarioId === 'scenario-e'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold text-white flex items-center gap-1">
              <span>Scenario E</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Destination remains unreachable after an irrelevant ground fix.
            </p>
          </button>
        </div>

        {/* Dedicated Presentation View Trigger */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setShowShowcase((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              showShowcase
                ? 'bg-teal-600 text-white ring-2 ring-teal-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800/60'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>
              {showShowcase
                ? 'Hide Side-by-Side Presentation View'
                : '📸 View Side-by-Side Presentation View (Authorised Door Unlock: Before vs After)'}
            </span>
          </button>
          <span className="text-[11px] text-slate-400">
            Perfect for capturing screenshots for presentation slides &amp; judge evaluations
          </span>
        </div>
      </div>

      {/* Render Side-by-Side Before/After Showcase if open */}
      {showShowcase && (
        <BeforeAfterShowcase baselineBuilding={building} />
      )}

      {/* Main Walkthrough Card & Schematic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7-Step Interactive Walkthrough Stepper */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Presentation className="w-4 h-4 text-amber-400" />
                Step-by-Step Guided Script
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Step {currentStep} of {STEPS.length}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
              Step {currentStep}/7
            </span>
          </div>

          {/* Current Step Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">{currentStepObj.title}</h3>
              <p className="text-xs text-teal-300 mt-0.5 font-medium">
                {currentStepObj.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              {currentStepObj.explanation}
            </p>

            {/* Run Action Button */}
            <button
              onClick={currentStepObj.execute}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStepObj.actionLabel}</span>
            </button>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep((s) => Math.max(s - 1, 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={() => setCurrentStep((s) => Math.min(s + 1, STEPS.length))}
              disabled={currentStep === STEPS.length}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-slate-300"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Presentation Timing Cue Card */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1.5">
            <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block">
              2-Minute Presentation Flow Guide:
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <strong className="text-slate-300">0:00–0:20:</strong> Explain visitor journey &amp; step-free parameters.
              </li>
              <li>
                <strong className="text-slate-300">0:20–0:50:</strong> Calculate Office route (observe ramp chosen over stairs).
              </li>
              <li>
                <strong className="text-slate-300">0:50–1:15:</strong> Close Lift-1 and show blocked Library diagnostic.
              </li>
              <li>
                <strong className="text-slate-300">1:15–1:45:</strong> Simulate opening West Side Entrance to restore access.
              </li>
              <li>
                <strong className="text-slate-300">1:45–2:00:</strong> Emphasize deterministic routing &amp; physical audit scope.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Result and Schematic Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Outcome Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
              currentRoute.status === 'verified_match'
                ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
                : currentRoute.status === 'potential_match'
                ? 'bg-amber-950/40 border-amber-600/70 text-amber-200'
                : 'bg-rose-950/40 border-rose-600/70 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {currentRoute.status === 'verified_match' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : currentRoute.status === 'potential_match' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {currentRoute.status === 'verified_match'
                    ? 'State 1: Verified Route Available'
                    : currentRoute.status === 'potential_match'
                    ? 'State 2: Potential Route (Conditions Unverified)'
                    : 'State 3: No Matching Route in Network'}
                </span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {currentRoute.status === 'verified_match'
                    ? `Total distance: ${currentRoute.totalDistanceMetres}m. All path segments verified step-free with ≥${demoPrefs.minClearWidthMm}mm clearance.`
                    : currentRoute.status === 'potential_match'
                    ? `Potential route of ${currentRoute.totalDistanceMetres}m found, but ${currentRoute.unverifiedConditions.length} physical condition(s) require audit verification.`
                    : currentRoute.failureReasons[0]}
                </p>
              </div>
            </div>

            {activeSimId && (
              <span className="text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-600 px-2 py-0.5 rounded shrink-0 uppercase">
                Simulated Condition
              </span>
            )}
          </div>

          {/* Interactive Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Live Schematic Feedback
              </span>
              <span className="text-slate-400">
                Route: {building.nodes.find((n) => n.id === demoPrefs.entranceId)?.name} →{' '}
                {building.nodes.find((n) => n.id === demoPrefs.destinationId)?.name}
              </span>
            </div>
            <BuildingMap building={effectiveBuilding} routeResult={currentRoute} />
          </div>
        </div>
      </div>
    </div>
  );
};
