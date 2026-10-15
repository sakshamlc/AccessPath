/**
 * Deterministic Routing Engine for AccessPath
 *
 * Implements Dijkstra's algorithm for shortest accessible paths with
 * strict verification and potential-path diagnostic modes.
 */

import {
  BuildingData,
  BuildingNode,
  Connection,
  RouteResult,
  RouteStep,
  RoutingPreferences,
  SharedAsset,
  UnverifiedCondition
} from '../types';

interface GraphEdge {
  connection: Connection;
  fromNodeId: string;
  toNodeId: string;
  weight: number;
}

export interface EffectiveConnection extends Connection {
  effectiveOperationalStatus: 'open' | 'closed' | 'unknown';
  effectiveEvidenceStatus: 'verified' | 'reported' | 'unknown';
}

/**
 * Resolves shared asset status (e.g. lift-1) for a connection.
 * If a shared asset is closed or maintenance, the connection is closed.
 */
export function getEffectiveConnection(
  conn: Connection,
  sharedAssets: Record<string, SharedAsset>
): EffectiveConnection {
  let effectiveOperational = conn.operationalStatus;
  let effectiveEvidence = conn.evidenceStatus;

  if (conn.sharedAssetId && sharedAssets[conn.sharedAssetId]) {
    const asset = sharedAssets[conn.sharedAssetId];
    if (asset.operationalStatus === 'closed') {
      effectiveOperational = 'closed';
    } else if (asset.operationalStatus === 'unknown' && effectiveOperational !== 'closed') {
      effectiveOperational = 'unknown';
    }

    if (asset.evidenceStatus !== 'verified') {
      effectiveEvidence = asset.evidenceStatus;
    }
  }

  return {
    ...conn,
    effectiveOperationalStatus: effectiveOperational,
    effectiveEvidenceStatus: effectiveEvidence
  };
}

/**
 * Checks if a connection meets STRICT verified criteria.
 */
function isConnectionStrictlyAllowed(
  conn: EffectiveConnection,
  prefs: RoutingPreferences
): { allowed: boolean; reason?: string } {
  // 1. Must be open
  if (conn.effectiveOperationalStatus !== 'open') {
    return {
      allowed: false,
      reason: `Connection is ${conn.effectiveOperationalStatus}${conn.sharedAssetId ? ` (shared asset: ${conn.sharedAssetId})` : ''}`
    };
  }

  // 2. Step-free requirement rejects stairs and unknown step status
  if (prefs.requiresStepFree) {
    if (conn.connectionType === 'stairs') {
      return { allowed: false, reason: 'Stairs cannot be used in step-free mode' };
    }
    if (conn.stepFree !== true) {
      return { allowed: false, reason: 'Connection step-free status is not verified' };
    }
  }

  // 3. Lift usage preference
  if (!prefs.allowLift && conn.connectionType === 'lift') {
    return { allowed: false, reason: 'Lift use is disabled by user preference' };
  }

  // 4. Clear width requirement
  if (prefs.minClearWidthMm > 0) {
    if (conn.clearWidthMm === null) {
      return { allowed: false, reason: 'Clear width is unmeasured (null)' };
    }
    if (conn.clearWidthMm < prefs.minClearWidthMm) {
      return {
        allowed: false,
        reason: `Clear width (${conn.clearWidthMm}mm) is narrower than minimum required (${prefs.minClearWidthMm}mm)`
      };
    }
  }

  // 5. Evidence status must be verified in strict mode
  if (conn.effectiveEvidenceStatus !== 'verified') {
    return {
      allowed: false,
      reason: `Evidence status is ${conn.effectiveEvidenceStatus}, not verified`
    };
  }

  return { allowed: true };
}

/**
 * Checks if a connection could POTENTIALLY be allowed if unverified/unknown conditions were verified.
 * Confirmed physically impossible conditions (stairs when step-free, confirmed narrower widths, confirmed closed) remain rejected.
 */
function isConnectionPotentiallyAllowed(
  conn: EffectiveConnection,
  prefs: RoutingPreferences
): { allowed: boolean; condition?: UnverifiedCondition; reason?: string } {
  // Confirmed closed cannot be used even potentially
  if (conn.effectiveOperationalStatus === 'closed') {
    return { allowed: false, reason: 'Connection is closed' };
  }

  // Physical stairs can NEVER be step-free
  if (prefs.requiresStepFree && conn.connectionType === 'stairs') {
    return { allowed: false, reason: 'Stairs cannot be step-free' };
  }

  // Lift preference
  if (!prefs.allowLift && conn.connectionType === 'lift') {
    return { allowed: false, reason: 'Lift disallowed' };
  }

  // Measured width that is definitely narrower cannot pass
  if (
    prefs.minClearWidthMm > 0 &&
    conn.clearWidthMm !== null &&
    conn.clearWidthMm < prefs.minClearWidthMm
  ) {
    return {
      allowed: false,
      reason: `Width is confirmed at ${conn.clearWidthMm}mm (below required ${prefs.minClearWidthMm}mm)`
    };
  }

  // Collect any unverified or unknown items that require physical checking
  let issue: string | null = null;
  if (conn.clearWidthMm === null && prefs.minClearWidthMm > 0) {
    issue = `Clear passage width is unmeasured; requires physical verification of ≥${prefs.minClearWidthMm}mm.`;
  } else if (conn.effectiveEvidenceStatus !== 'verified') {
    issue = `Evidence status is "${conn.effectiveEvidenceStatus}" (last audit not confirmed).`;
  } else if (prefs.requiresStepFree && conn.stepFree === 'unknown') {
    issue = 'Step-free suitability is recorded as unknown.';
  } else if (conn.effectiveOperationalStatus === 'unknown') {
    issue = 'Operational status is unknown.';
  }

  let unverified: UnverifiedCondition | undefined;
  if (issue) {
    unverified = {
      connectionId: conn.id,
      fromName: conn.fromNodeId,
      toName: conn.toNodeId,
      connectionType: conn.connectionType,
      issue,
      clearWidthMm: conn.clearWidthMm,
      evidenceStatus: conn.effectiveEvidenceStatus,
      notes: conn.notes
    };
  }

  return { allowed: true, condition: unverified };
}

/**
 * Executes deterministic Dijkstra algorithm on an edge list.
 */
function runDijkstra(
  startNodeId: string,
  endNodeId: string,
  edges: GraphEdge[]
): { pathNodeIds: string[]; pathEdges: GraphEdge[]; totalDist: number } | null {
  const distances: Record<string, number> = {};
  const previousNode: Record<string, string | null> = {};
  const previousEdge: Record<string, GraphEdge | null> = {};
  const unvisited = new Set<string>();

  // Collect all unique nodes from edges
  edges.forEach((edge) => {
    unvisited.add(edge.fromNodeId);
    unvisited.add(edge.toNodeId);
    if (distances[edge.fromNodeId] === undefined) distances[edge.fromNodeId] = Infinity;
    if (distances[edge.toNodeId] === undefined) distances[edge.toNodeId] = Infinity;
  });

  if (!unvisited.has(startNodeId) || !unvisited.has(endNodeId)) {
    return null;
  }

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let current: string | null = null;
    let smallestDist = Infinity;
    for (const nodeId of unvisited) {
      if (distances[nodeId] < smallestDist) {
        smallestDist = distances[nodeId];
        current = nodeId;
      }
    }

    if (current === null || smallestDist === Infinity) {
      break;
    }

    if (current === endNodeId) {
      break;
    }

    unvisited.delete(current);

    // Find outgoing edges from current
    const outgoing = edges.filter((e) => e.fromNodeId === current && unvisited.has(e.toNodeId));
    for (const edge of outgoing) {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.toNodeId]) {
        distances[edge.toNodeId] = alt;
        previousNode[edge.toNodeId] = current;
        previousEdge[edge.toNodeId] = edge;
      }
    }
  }

  if (distances[endNodeId] === Infinity || previousNode[endNodeId] === undefined) {
    return null;
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const pathEdges: GraphEdge[] = [];
  let curr: string | null = endNodeId;

  while (curr !== null) {
    pathNodeIds.unshift(curr);
    const edge = previousEdge[curr];
    if (edge) {
      pathEdges.unshift(edge);
      curr = previousNode[curr] || null;
    } else {
      break;
    }
  }

  return {
    pathNodeIds,
    pathEdges,
    totalDist: distances[endNodeId]
  };
}

/**
 * Builds step-by-step turn-by-turn route instructions.
 */
function buildRouteSteps(
  pathNodes: BuildingNode[],
  pathConnections: Connection[]
): RouteStep[] {
  const steps: RouteStep[] = [];

  for (let i = 0; i < pathConnections.length; i++) {
    const conn = pathConnections[i];
    const from = pathNodes[i];
    const to = pathNodes[i + 1];

    let instruction = '';
    const widthStr = conn.clearWidthMm ? `${conn.clearWidthMm}mm width` : 'unmeasured width';

    switch (conn.connectionType) {
      case 'ramp':
        instruction = `Take the ramp from ${from.name} toward ${to.name} (${conn.distanceMetres}m, ${widthStr}, gradient checked).`;
        break;
      case 'lift':
        instruction = `Take the lift from ${from.name} to ${to.name} (door width ${widthStr}, serves Level ${from.level} & Level ${to.level}).`;
        break;
      case 'stairs':
        instruction = `Ascend/descend stairs between ${from.name} and ${to.name} (${conn.distanceMetres}m, not step-free).`;
        break;
      case 'doorway':
        instruction = `Pass through doorway into ${to.name} (${widthStr}, clear opening).`;
        break;
      case 'corridor':
      default:
        instruction = `Follow the corridor from ${from.name} to ${to.name} (${conn.distanceMetres}m, ${widthStr}).`;
        break;
    }

    steps.push({
      stepNumber: i + 1,
      fromNode: from,
      toNode: to,
      connection: conn,
      instruction,
      distanceMetres: conn.distanceMetres,
      connectionType: conn.connectionType,
      clearWidthMm: conn.clearWidthMm,
      isStepFree: conn.stepFree,
      verificationNotice:
        conn.evidenceStatus !== 'verified'
          ? `Status is ${conn.evidenceStatus} — not physically verified.`
          : undefined
    });
  }

  return steps;
}

/**
 * Analyzes network failure reasons when no route is found.
 */
function analyzeFailure(
  startNode: BuildingNode,
  destNode: BuildingNode,
  building: BuildingData,
  prefs: RoutingPreferences
): string[] {
  const reasons: string[] = [];

  // Check if destination is on different level and vertical transitions are blocked
  if (startNode.level !== destNode.level) {
    const liftAsset = building.sharedAssets['lift-1'];
    if (prefs.requiresStepFree) {
      if (!prefs.allowLift) {
        reasons.push(
          `Destination is on Level ${destNode.level}, but lift usage is turned off in your preferences. Stairs are not step-free.`
        );
      } else if (liftAsset && liftAsset.operationalStatus === 'closed') {
        reasons.push(
          `Vertical travel to Level ${destNode.level} requires Lift-1, which is currently recorded as closed for maintenance.`
        );
      }
    }
  }

  // Check entrance availability
  const startConnections = building.connections.filter(
    (c) => c.fromNodeId === startNode.id || c.toNodeId === startNode.id
  );
  const openStartConns = startConnections.filter((c) => c.operationalStatus === 'open');
  if (openStartConns.length === 0) {
    reasons.push(`${startNode.name} currently has no open outgoing connections in the audit.`);
  }

  // Check doorway clearances to destination
  const destConnections = building.connections.filter(
    (c) => c.fromNodeId === destNode.id || c.toNodeId === destNode.id
  );
  const narrowDoorways = destConnections.filter(
    (c) => c.clearWidthMm !== null && c.clearWidthMm < prefs.minClearWidthMm
  );
  if (narrowDoorways.length > 0 && destConnections.every((c) => (c.clearWidthMm ?? 0) < prefs.minClearWidthMm)) {
    reasons.push(
      `Access to ${destNode.name} has a clear passage width below the requested ${prefs.minClearWidthMm}mm (measured at ${narrowDoorways[0].clearWidthMm}mm).`
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      `No contiguous accessible path exists in the recorded network between "${startNode.name}" and "${destNode.name}" that satisfies your required parameters (${prefs.minClearWidthMm}mm clear width, ${prefs.requiresStepFree ? 'step-free' : 'any'}).`
    );
  }

  return reasons;
}

/**
 * Main Deterministic Route Finding Function
 */
export function calculateRoute(
  building: BuildingData,
  prefs: RoutingPreferences
): RouteResult {
  const nodeMap = new Map<string, BuildingNode>();
  building.nodes.forEach((n) => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(prefs.entranceId);
  const endNode = nodeMap.get(prefs.destinationId);

  if (!startNode || !endNode) {
    return {
      status: 'no_route',
      nodes: [],
      connections: [],
      totalDistanceMetres: 0,
      minWidthEncounteredMm: null,
      hasLifts: false,
      hasRamps: false,
      hasStairs: false,
      steps: [],
      unverifiedConditions: [],
      failureReasons: ['Invalid entrance or destination specified.']
    };
  }

  if (startNode.id === endNode.id) {
    return {
      status: 'verified_match',
      nodes: [startNode],
      connections: [],
      totalDistanceMetres: 0,
      minWidthEncounteredMm: null,
      hasLifts: false,
      hasRamps: false,
      hasStairs: false,
      steps: [],
      unverifiedConditions: [],
      failureReasons: []
    };
  }

  // PHASE 1: Attempt STRICT verified route
  const strictEdges: GraphEdge[] = [];
  building.connections.forEach((conn) => {
    const effective = getEffectiveConnection(conn, building.sharedAssets);
    const check = isConnectionStrictlyAllowed(effective, prefs);
    if (check.allowed) {
      strictEdges.push({
        connection: effective,
        fromNodeId: conn.fromNodeId,
        toNodeId: conn.toNodeId,
        weight: conn.distanceMetres
      });
      if (conn.bidirectional !== false) {
        strictEdges.push({
          connection: effective,
          fromNodeId: conn.toNodeId,
          toNodeId: conn.fromNodeId,
          weight: conn.distanceMetres
        });
      }
    }
  });

  const strictResult = runDijkstra(startNode.id, endNode.id, strictEdges);

  if (strictResult) {
    const pathNodes = strictResult.pathNodeIds.map((id) => nodeMap.get(id)!);
    const pathConnections = strictResult.pathEdges.map((e) => e.connection);

    let minWidth: number | null = null;
    let hasLifts = false;
    let hasRamps = false;
    let hasStairs = false;

    pathConnections.forEach((c) => {
      if (c.clearWidthMm !== null) {
        if (minWidth === null || c.clearWidthMm < minWidth) {
          minWidth = c.clearWidthMm;
        }
      }
      if (c.connectionType === 'lift') hasLifts = true;
      if (c.connectionType === 'ramp') hasRamps = true;
      if (c.connectionType === 'stairs') hasStairs = true;
    });

    const steps = buildRouteSteps(pathNodes, pathConnections);

    return {
      status: 'verified_match',
      nodes: pathNodes,
      connections: pathConnections,
      totalDistanceMetres: Number(strictResult.totalDist.toFixed(1)),
      minWidthEncounteredMm: minWidth,
      hasLifts,
      hasRamps,
      hasStairs,
      steps,
      unverifiedConditions: [],
      failureReasons: []
    };
  }

  // PHASE 2: Strict failed. Attempt POTENTIAL route with condition warnings
  const potentialEdges: GraphEdge[] = [];
  const conditionMap = new Map<string, UnverifiedCondition>();

  building.connections.forEach((conn) => {
    const effective = getEffectiveConnection(conn, building.sharedAssets);
    const check = isConnectionPotentiallyAllowed(effective, prefs);
    if (check.allowed) {
      if (check.condition) {
        const fromN = nodeMap.get(conn.fromNodeId)?.name || conn.fromNodeId;
        const toN = nodeMap.get(conn.toNodeId)?.name || conn.toNodeId;
        conditionMap.set(conn.id, {
          ...check.condition,
          fromName: fromN,
          toName: toN
        });
      }

      potentialEdges.push({
        connection: effective,
        fromNodeId: conn.fromNodeId,
        toNodeId: conn.toNodeId,
        weight: conn.distanceMetres
      });
      if (conn.bidirectional !== false) {
        potentialEdges.push({
          connection: effective,
          fromNodeId: conn.toNodeId,
          toNodeId: conn.fromNodeId,
          weight: conn.distanceMetres
        });
      }
    }
  });

  const potentialResult = runDijkstra(startNode.id, endNode.id, potentialEdges);

  if (potentialResult) {
    const pathNodes = potentialResult.pathNodeIds.map((id) => nodeMap.get(id)!);
    const pathConnections = potentialResult.pathEdges.map((e) => e.connection);

    let minWidth: number | null = null;
    let hasLifts = false;
    let hasRamps = false;
    let hasStairs = false;
    const pathUnverified: UnverifiedCondition[] = [];

    pathConnections.forEach((c) => {
      if (c.clearWidthMm !== null) {
        if (minWidth === null || c.clearWidthMm < minWidth) {
          minWidth = c.clearWidthMm;
        }
      }
      if (c.connectionType === 'lift') hasLifts = true;
      if (c.connectionType === 'ramp') hasRamps = true;
      if (c.connectionType === 'stairs') hasStairs = true;

      const cond = conditionMap.get(c.id);
      if (cond && !pathUnverified.some((u) => u.connectionId === c.id)) {
        pathUnverified.push(cond);
      }
    });

    const steps = buildRouteSteps(pathNodes, pathConnections);

    return {
      status: 'potential_match',
      nodes: pathNodes,
      connections: pathConnections,
      totalDistanceMetres: Number(potentialResult.totalDist.toFixed(1)),
      minWidthEncounteredMm: minWidth,
      hasLifts,
      hasRamps,
      hasStairs,
      steps,
      unverifiedConditions: pathUnverified,
      failureReasons: []
    };
  }

  // PHASE 3: No route exists in either strict or potential mode
  const failureReasons = analyzeFailure(startNode, endNode, building, prefs);

  return {
    status: 'no_route',
    nodes: [],
    connections: [],
    totalDistanceMetres: 0,
    minWidthEncounteredMm: null,
    hasLifts: false,
    hasRamps: false,
    hasStairs: false,
    steps: [],
    unverifiedConditions: [],
    failureReasons
  };
}
