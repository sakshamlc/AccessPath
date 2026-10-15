/**
 * Automated Logic Verification Test Suite
 *
 * Runs deterministic tests against core routing, access criteria,
 * shared assets, and simulation isolation.
 */

import { SEED_BUILDING } from '../data/seedData';
import { calculateRoute } from './routing';
import { applySimulation, computeReachabilityReport, DEFAULT_SIMULATION_CHANGES } from './simulator';
import { BuildingData, RoutingPreferences } from '../types';

export interface TestCaseResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  actualDetails: string;
}

export function runAllLogicTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];
  const baseData: BuildingData = JSON.parse(JSON.stringify(SEED_BUILDING));

  // TEST 1: Step-free mode rejects stairs
  {
    // Test route from Main Entrance to Office with step-free = true vs false
    const prefsWithStairs: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-office',
      requiresStepFree: false,
      minClearWidthMm: 750,
      allowLift: true
    };
    const routeAllowStairs = calculateRoute(baseData, prefsWithStairs);

    const prefsStepFree: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-office',
      requiresStepFree: true,
      minClearWidthMm: 750,
      allowLift: true
    };
    const routeStepFree = calculateRoute(baseData, prefsStepFree);

    const stairUsedInAllowStairs = routeAllowStairs.connections.some((c) => c.connectionType === 'stairs');
    const stairUsedInStepFree = routeStepFree.connections.some((c) => c.connectionType === 'stairs');
    const passed = stairUsedInAllowStairs && !stairUsedInStepFree && routeStepFree.status === 'verified_match';

    results.push({
      id: 'test-step-free-rejects-stairs',
      name: 'Step-free mode rejects stairs',
      description: 'Stairs must be excluded when step-free access is enabled, selecting longer ramp alternative.',
      passed,
      actualDetails: `Without step-free: uses stairs (${routeAllowStairs.totalDistanceMetres}m). With step-free: rejects stairs, chooses ramp route (${routeStepFree.totalDistanceMetres}m). Passed: ${passed}.`
    });
  }

  // TEST 2: Clear width equal to selected minimum passes
  {
    // Door to office has clear width 900mm. Test with minClearWidthMm = 900mm
    const prefsExact: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-office',
      requiresStepFree: true,
      minClearWidthMm: 900,
      allowLift: true
    };
    const route = calculateRoute(baseData, prefsExact);
    const passed = route.status === 'verified_match' && (route.minWidthEncounteredMm ?? 0) >= 900;

    results.push({
      id: 'test-exact-width-passes',
      name: 'Clear width equal to selected minimum passes',
      description: 'Paths with minimum clearance matching requested threshold (900mm) must be admitted.',
      passed,
      actualDetails: `Requested 900mm on route with 900mm bottleneck. Route status: ${route.status}, min width: ${route.minWidthEncounteredMm}mm.`
    });
  }

  // TEST 3: Narrower widths fail
  {
    // Level 1 toilet doorway is 760mm. Testing destination Level 1 toilet with 800mm min width
    const prefsNarrow: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-toilet-1',
      requiresStepFree: true,
      minClearWidthMm: 800,
      allowLift: true
    };
    const route = calculateRoute(baseData, prefsNarrow);
    const passed = route.status === 'no_route' && route.failureReasons.some((r) => r.includes('760mm') || r.includes('below the requested'));

    results.push({
      id: 'test-narrower-widths-fail',
      name: 'Narrower widths fail',
      description: 'A door measured at 760mm must fail when user requires 800mm minimum clearance.',
      passed,
      actualDetails: `Tested 800mm requirement against 760mm doorway. Route status: ${route.status}. Failure reason: "${route.failureReasons[0]}".`
    });
  }

  // TEST 4: Unknown widths never produce a verified route
  {
    // Seminar room G04 doorway has clearWidthMm = null and evidenceStatus = 'unknown'
    const prefsUnknown: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-seminar',
      requiresStepFree: true,
      minClearWidthMm: 800,
      allowLift: true
    };
    const route = calculateRoute(baseData, prefsUnknown);
    const passed = route.status === 'potential_match' && route.unverifiedConditions.length > 0;

    results.push({
      id: 'test-unknown-widths-flagged',
      name: 'Unknown widths never produce verified route',
      description: 'Connections with null clear width must never be labeled verified, and must appear in potential condition checklist.',
      passed,
      actualDetails: `Doorway with null width returned status "${route.status}" with ${route.unverifiedConditions.length} condition flagged: "${route.unverifiedConditions[0]?.issue}".`
    });
  }

  // TEST 5: Closed shared assets affect every relevant connection
  {
    // Mark Lift-1 as closed
    const dataWithClosedLift: BuildingData = JSON.parse(JSON.stringify(baseData));
    dataWithClosedLift.sharedAssets['lift-1'].operationalStatus = 'closed';

    const prefsUpper: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-library', // Library is on Level 1
      requiresStepFree: true,
      minClearWidthMm: 800,
      allowLift: true
    };

    const route = calculateRoute(dataWithClosedLift, prefsUpper);
    const passed = route.status === 'no_route' && route.failureReasons.some((r) => r.includes('Lift-1'));

    results.push({
      id: 'test-closed-shared-asset',
      name: 'Closed shared assets affect every relevant connection',
      description: 'Closing shared asset Lift-1 immediately cascades and blocks all step-free routes between Level 0 and Level 1.',
      passed,
      actualDetails: `Lift-1 marked closed. Step-free route to Level 1 Library resulted in "${route.status}". Diagnostic: "${route.failureReasons[0]}".`
    });
  }

  // TEST 6: Disconnected destinations return an explanatory result
  {
    // Test an unreachable condition (e.g. lift disallowed when destination is on upper floor)
    const prefsNoLift: RoutingPreferences = {
      entranceId: 'n-ent-main',
      destinationId: 'n-dest-classroom-201',
      requiresStepFree: true,
      minClearWidthMm: 800,
      allowLift: false // Lift disallowed
    };
    const route = calculateRoute(baseData, prefsNoLift);
    const passed = route.status === 'no_route' && route.failureReasons.length > 0;

    results.push({
      id: 'test-disconnected-explanation',
      name: 'Disconnected destinations return an explanatory result',
      description: 'System must return clear diagnostic explanations detailing the exact barriers or missing transit modes.',
      passed,
      actualDetails: `Route status: ${route.status}. Explanatory message: "${route.failureReasons[0]}".`
    });
  }

  // TEST 7: Improvement scenarios do not mutate baseline data
  {
    const originalWestDoorStatus = baseData.connections.find((c) => c.id === 'c-ent-side-door')?.operationalStatus;
    const simChanges = DEFAULT_SIMULATION_CHANGES.map((s) =>
      s.id === 'sim-open-west-entrance' ? { ...s, active: true } : s
    );

    const simulatedBuilding = applySimulation(baseData, simChanges);
    const simulatedWestDoorStatus = simulatedBuilding.connections.find((c) => c.id === 'c-ent-side-door')?.operationalStatus;
    const baselineWestDoorStatusAfter = baseData.connections.find((c) => c.id === 'c-ent-side-door')?.operationalStatus;

    const passed =
      originalWestDoorStatus === 'closed' &&
      simulatedWestDoorStatus === 'open' &&
      baselineWestDoorStatusAfter === 'closed';

    results.push({
      id: 'test-simulation-isolation',
      name: 'Improvement scenarios do not mutate baseline data',
      description: 'Applying a simulation sandbox modification must strictly preserve baseline audit state.',
      passed,
      actualDetails: `Baseline before: ${originalWestDoorStatus}, Simulated: ${simulatedWestDoorStatus}, Baseline after: ${baselineWestDoorStatusAfter}. Baseline unchanged: ${passed}.`
    });
  }

  return results;
}
