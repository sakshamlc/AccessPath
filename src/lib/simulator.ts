/**
 * AccessPath Improvement Simulator Engine
 *
 * Operates strictly on deep copies of baseline data.
 * Computes destination reachability before and after proposed physical modifications
 * and isolates causal factors deterministically.
 */

import {
  BuildingData,
  BuildingNode,
  ReachabilityReport,
  RoutingPreferences,
  SimulatedChange
} from '../types';
import { calculateRoute } from './routing';

export const DEFAULT_SIMULATION_CHANGES: SimulatedChange[] = [
  {
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
    active: false
  },
  {
    id: 'sim-restore-lift',
    label: 'Restore Passenger Lift-1 to Service',
    description: 'Complete motor drive servicing and return Lift-1 to active operation between Level 0 and Level 1.',
    type: 'restore_lift',
    targetAssetId: 'lift-1',
    changes: {
      operationalStatus: 'open',
      evidenceStatus: 'verified'
    },
    active: false
  },
  {
    id: 'sim-widen-toilet-door',
    label: 'Widen Level 1 Toilet Doorway',
    description: 'Rehang frame with swing-clear hinges to increase clear passage width from 760mm to 880mm.',
    type: 'remove_obstruction',
    targetConnectionId: 'c-f1-corridor-w-toilet',
    changes: {
      clearWidthMm: 880,
      evidenceStatus: 'verified'
    },
    active: false
  },
  {
    id: 'sim-verify-seminar',
    label: 'Complete Audit for Seminar Room G04 Doorway',
    description: 'Perform physical measurement: records verified clear width of 890mm with flush threshold.',
    type: 'custom_connection',
    targetConnectionId: 'c-f0-stairs-seminar',
    changes: {
      clearWidthMm: 890,
      stepFree: true,
      evidenceStatus: 'verified',
      verifiedAt: new Date().toISOString()
    },
    active: false
  }
];

/**
 * Deep clones building data to guarantee that simulation NEVER mutates baseline data.
 */
export function cloneBuildingData(data: BuildingData): BuildingData {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Applies a list of active simulated changes to a cloned building dataset.
 */
export function applySimulation(
  baseline: BuildingData,
  simulations: SimulatedChange[]
): BuildingData {
  const scenario = cloneBuildingData(baseline);

  simulations
    .filter((sim) => sim.active)
    .forEach((sim) => {
      // Apply connection change
      if (sim.targetConnectionId) {
        const connIndex = scenario.connections.findIndex((c) => c.id === sim.targetConnectionId);
        if (connIndex !== -1) {
          scenario.connections[connIndex] = {
            ...scenario.connections[connIndex],
            ...sim.changes
          };
        }
      }

      // Apply shared asset change
      if (sim.targetAssetId && scenario.sharedAssets[sim.targetAssetId]) {
        scenario.sharedAssets[sim.targetAssetId] = {
          ...scenario.sharedAssets[sim.targetAssetId],
          ...sim.changes
        };
      }
    });

  return scenario;
}

/**
 * Calculates reachable destinations before and after, identifying newly reachable
 * destinations and pinpointing which specific simulated change enabled each one.
 */
export function computeReachabilityReport(
  baseline: BuildingData,
  activeSimulations: SimulatedChange[],
  preferences: RoutingPreferences
): ReachabilityReport {
  const simulatedBuilding = applySimulation(baseline, activeSimulations);
  const destinations = baseline.nodes.filter((n) => n.isDestination);

  const baselineReachable: BuildingNode[] = [];
  const simulatedReachable: BuildingNode[] = [];

  destinations.forEach((dest) => {
    const basePrefs: RoutingPreferences = { ...preferences, destinationId: dest.id };

    // Baseline route
    const baseRoute = calculateRoute(baseline, basePrefs);
    if (baseRoute.status === 'verified_match') {
      baselineReachable.push(dest);
    }

    // Simulated route
    const simRoute = calculateRoute(simulatedBuilding, basePrefs);
    if (simRoute.status === 'verified_match') {
      simulatedReachable.push(dest);
    }
  });

  const newlyReachable = simulatedReachable.filter(
    (simDest) => !baselineReachable.some((baseDest) => baseDest.id === simDest.id)
  );

  // Causal factor identification for each newly reachable destination
  const causalExplanations = newlyReachable.map((dest) => {
    const enablingChanges: string[] = [];

    // Test each active simulation individually to see if it alone unlocked this destination
    activeSimulations
      .filter((s) => s.active)
      .forEach((sim) => {
        const singleSimBuilding = applySimulation(baseline, [sim]);
        const testRoute = calculateRoute(singleSimBuilding, {
          ...preferences,
          destinationId: dest.id
        });
        if (testRoute.status === 'verified_match') {
          enablingChanges.push(sim.label);
        }
      });

    let explanation = '';
    if (enablingChanges.length > 0) {
      explanation = `Enabled by proposed change: "${enablingChanges.join('", "')}".`;
    } else {
      explanation =
        'Enabled by a combination of the active proposed improvements working together.';
    }

    return {
      destinationId: dest.id,
      destinationName: dest.name,
      enablingChanges,
      explanation
    };
  });

  const entrance = baseline.nodes.find((n) => n.id === preferences.entranceId);

  return {
    entranceId: preferences.entranceId,
    entranceName: entrance?.name || 'Selected Entrance',
    preferences,
    baselineReachableDestinations: baselineReachable,
    simulatedReachableDestinations: simulatedReachable,
    newlyReachableDestinations: newlyReachable,
    causalExplanations
  };
}
