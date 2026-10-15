/**
 * Storage and Import/Export Validation for AccessPath
 *
 * Enforces schema validation, integrity checks, and local browser persistence.
 */

import { SEED_BUILDING } from '../data/seedData';
import { BuildingData, Connection } from '../types';

const STORAGE_KEY = 'accesspath_building_audit_v1';

export function loadBuildingData(): BuildingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_BUILDING;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved building audit from localStorage:', err);
  }
  return SEED_BUILDING;
}

export function saveBuildingData(data: BuildingData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save building audit to localStorage:', err);
  }
}

export function resetToSeedData(): BuildingData {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(SEED_BUILDING));
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    nodeCount: number;
    connectionCount: number;
    sharedAssetCount: number;
    verifiedConnectionCount: number;
    unverifiedConnectionCount: number;
  };
  validatedData?: BuildingData;
}

/**
 * Rigorously validates uploaded/imported building JSON before applying it.
 * Rejects duplicate IDs, dangling node references, invalid numbers.
 * Keeps unknown measurements as null.
 */
export function validateBuildingJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return {
      isValid: false,
      errors: [`Invalid JSON syntax: ${(err as Error).message}`],
      warnings: [],
      summary: {
        nodeCount: 0,
        connectionCount: 0,
        sharedAssetCount: 0,
        verifiedConnectionCount: 0,
        unverifiedConnectionCount: 0
      }
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      errors: ['Building data must be a JSON object.'],
      warnings: [],
      summary: {
        nodeCount: 0,
        connectionCount: 0,
        sharedAssetCount: 0,
        verifiedConnectionCount: 0,
        unverifiedConnectionCount: 0
      }
    };
  }

  const raw = parsed as Partial<BuildingData>;

  if (!raw.name || typeof raw.name !== 'string') {
    errors.push('Building object must have a non-empty "name" string.');
  }

  if (!Array.isArray(raw.nodes) || raw.nodes.length === 0) {
    errors.push('Building must contain a non-empty "nodes" array.');
  }

  if (!Array.isArray(raw.connections) || raw.connections.length === 0) {
    errors.push('Building must contain a non-empty "connections" array.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      summary: {
        nodeCount: raw.nodes?.length || 0,
        connectionCount: raw.connections?.length || 0,
        sharedAssetCount: 0,
        verifiedConnectionCount: 0,
        unverifiedConnectionCount: 0
      }
    };
  }

  // 1. Validate Nodes
  const nodeIds = new Set<string>();
  const nodes = raw.nodes!;
  let hasEntrance = false;
  let hasDestination = false;

  nodes.forEach((node, idx) => {
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Node at index ${idx} is missing a string "id".`);
      return;
    }
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node id found: "${node.id}". Node IDs must be unique.`);
    }
    nodeIds.add(node.id);

    if (!node.name || typeof node.name !== 'string') {
      errors.push(`Node "${node.id}" is missing a valid name.`);
    }

    if (typeof node.level !== 'number') {
      errors.push(`Node "${node.id}" must specify numeric level (e.g. 0, 1).`);
    }

    if (typeof node.x !== 'number' || typeof node.y !== 'number') {
      errors.push(`Node "${node.id}" schematic coordinates (x, y) must be numeric.`);
    }

    if (node.isEntrance) hasEntrance = true;
    if (node.isDestination) hasDestination = true;
  });

  if (!hasEntrance) {
    warnings.push('No nodes have "isEntrance: true". Routing requires at least one entrance.');
  }
  if (!hasDestination) {
    warnings.push('No nodes have "isDestination: true". Routing requires at least one destination.');
  }

  // 2. Validate Connections
  const connectionIds = new Set<string>();
  const connections: Connection[] = [];
  let verifiedCount = 0;
  let unverifiedCount = 0;

  const validTypes = new Set(['corridor', 'doorway', 'stairs', 'ramp', 'lift']);

  raw.connections!.forEach((conn, idx) => {
    if (!conn.id || typeof conn.id !== 'string') {
      errors.push(`Connection at index ${idx} is missing an "id".`);
      return;
    }
    if (connectionIds.has(conn.id)) {
      errors.push(`Duplicate connection id found: "${conn.id}". Connection IDs must be unique.`);
    }
    connectionIds.add(conn.id);

    // Node reference validation
    if (!nodeIds.has(conn.fromNodeId)) {
      errors.push(
        `Connection "${conn.id}" references non-existent fromNodeId: "${conn.fromNodeId}".`
      );
    }
    if (!nodeIds.has(conn.toNodeId)) {
      errors.push(`Connection "${conn.id}" references non-existent toNodeId: "${conn.toNodeId}".`);
    }

    // Distance validation
    if (typeof conn.distanceMetres !== 'number' || conn.distanceMetres <= 0 || isNaN(conn.distanceMetres)) {
      errors.push(`Connection "${conn.id}" has invalid distanceMetres. Must be positive number.`);
    }

    // Type validation
    if (!validTypes.has(conn.connectionType)) {
      errors.push(
        `Connection "${conn.id}" has unrecognized connectionType: "${conn.connectionType}". Must be one of corridor, doorway, stairs, ramp, lift.`
      );
    }

    // Width validation: must be null or positive number
    if (conn.clearWidthMm !== null && conn.clearWidthMm !== undefined) {
      if (typeof conn.clearWidthMm !== 'number' || conn.clearWidthMm <= 0 || isNaN(conn.clearWidthMm)) {
        errors.push(
          `Connection "${conn.id}" clearWidthMm must be either null (unmeasured) or positive number in mm.`
        );
      }
    }

    // Evidence status rule: "Do not label imported information verified unless its evidence status and verification date were explicitly supplied."
    let evidence = conn.evidenceStatus;
    if (evidence === 'verified' && (!conn.verifiedAt || typeof conn.verifiedAt !== 'string')) {
      warnings.push(
        `Connection "${conn.id}" was marked "verified" without a verifiedAt timestamp; changed to "reported".`
      );
      evidence = 'reported';
    } else if (!evidence || !['verified', 'reported', 'unknown'].includes(evidence)) {
      evidence = 'unknown';
    }

    if (evidence === 'verified') {
      verifiedCount++;
    } else {
      unverifiedCount++;
    }

    connections.push({
      id: conn.id,
      fromNodeId: conn.fromNodeId,
      toNodeId: conn.toNodeId,
      distanceMetres: Number(conn.distanceMetres) || 5,
      connectionType: conn.connectionType,
      clearWidthMm: conn.clearWidthMm !== undefined ? conn.clearWidthMm : null,
      stepFree: conn.stepFree !== undefined ? conn.stepFree : 'unknown',
      operationalStatus: conn.operationalStatus || 'open',
      evidenceStatus: evidence,
      verifiedAt: conn.verifiedAt || null,
      notes: conn.notes || '',
      photoUrl: conn.photoUrl || null,
      sharedAssetId: conn.sharedAssetId || null,
      bidirectional: conn.bidirectional !== false
    });
  });

  const sharedAssets = raw.sharedAssets || {};

  const cleanData: BuildingData = {
    id: raw.id || `imported-${Date.now()}`,
    name: raw.name || 'Imported Building',
    disclaimer: raw.disclaimer || 'Illustrative demo data — not a verified building audit.',
    lastUpdated: new Date().toISOString(),
    nodes,
    connections,
    sharedAssets
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      sharedAssetCount: Object.keys(sharedAssets).length,
      verifiedConnectionCount: verifiedCount,
      unverifiedConnectionCount: unverifiedCount
    },
    validatedData: errors.length === 0 ? cleanData : undefined
  };
}

export function downloadSampleJSON(): void {
  const json = JSON.stringify(SEED_BUILDING, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accesspath-sample-building.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
