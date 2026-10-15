/**
 * AccessPath Data Models and Routing Interfaces
 */

export type NodeType =
  | 'entrance'
  | 'destination'
  | 'junction'
  | 'doorway'
  | 'lift_landing'
  | 'stairs_landing'
  | 'corridor';

export type DestinationCategory =
  | 'office'
  | 'classroom'
  | 'library'
  | 'toilet'
  | 'lecture_hall'
  | 'lab'
  | 'entrance'
  | 'transit'
  | 'junction';

export interface BuildingNode {
  id: string;
  name: string;
  type: NodeType;
  level: number; // 0 = Ground Floor, 1 = First Floor
  x: number; // schematic coordinate in SVG units
  y: number; // schematic coordinate in SVG units
  category?: DestinationCategory;
  description?: string;
  isEntrance?: boolean;
  isDestination?: boolean;
}

export type ConnectionType = 'corridor' | 'doorway' | 'stairs' | 'ramp' | 'lift';

export type StepFreeStatus = boolean | 'unknown';
export type OperationalStatus = 'open' | 'closed' | 'unknown';
export type EvidenceStatus = 'verified' | 'reported' | 'unknown';

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceMetres: number;
  connectionType: ConnectionType;
  clearWidthMm: number | null; // null if unmeasured / unknown
  stepFree: StepFreeStatus;
  operationalStatus: OperationalStatus;
  evidenceStatus: EvidenceStatus;
  verifiedAt: string | null; // ISO date string
  notes: string;
  photoUrl?: string | null;
  sharedAssetId?: string | null; // e.g. 'lift-1'
  bidirectional?: boolean; // defaults to true
}

export interface SharedAsset {
  id: string;
  name: string;
  assetType: 'lift' | 'door_operator' | 'ramp_barrier';
  operationalStatus: OperationalStatus;
  evidenceStatus: EvidenceStatus;
  verifiedAt: string | null;
  notes: string;
  capacity?: string;
  doorClearWidthMm?: number | null;
}

export interface BuildingData {
  id: string;
  name: string;
  disclaimer: string;
  lastUpdated: string;
  nodes: BuildingNode[];
  connections: Connection[];
  sharedAssets: Record<string, SharedAsset>;
}

export interface RoutingPreferences {
  entranceId: string;
  destinationId: string;
  requiresStepFree: boolean;
  minClearWidthMm: number;
  allowLift: boolean;
}

export interface RouteStep {
  stepNumber: number;
  fromNode: BuildingNode;
  toNode: BuildingNode;
  connection: Connection;
  instruction: string;
  distanceMetres: number;
  connectionType: ConnectionType;
  clearWidthMm: number | null;
  isStepFree: boolean | 'unknown';
  verificationNotice?: string;
}

export interface UnverifiedCondition {
  connectionId: string;
  fromName: string;
  toName: string;
  connectionType: ConnectionType;
  issue: string;
  clearWidthMm: number | null;
  evidenceStatus: EvidenceStatus;
  notes: string;
}

export interface RouteResult {
  status: 'verified_match' | 'potential_match' | 'no_route';
  nodes: BuildingNode[];
  connections: Connection[];
  totalDistanceMetres: number;
  minWidthEncounteredMm: number | null;
  hasLifts: boolean;
  hasRamps: boolean;
  hasStairs: boolean;
  steps: RouteStep[];
  unverifiedConditions: UnverifiedCondition[];
  failureReasons: string[];
  diagnostics?: string[];
}

export interface SimulatedChange {
  id: string;
  label: string;
  description: string;
  type: 'open_side_entrance' | 'remove_obstruction' | 'restore_lift' | 'custom_connection' | 'custom_asset';
  targetConnectionId?: string;
  targetAssetId?: string;
  changes: Partial<Connection> | Partial<SharedAsset>;
  active: boolean;
}

export interface ReachabilityReport {
  entranceId: string;
  entranceName: string;
  preferences: RoutingPreferences;
  baselineReachableDestinations: BuildingNode[];
  simulatedReachableDestinations: BuildingNode[];
  newlyReachableDestinations: BuildingNode[];
  causalExplanations: {
    destinationId: string;
    destinationName: string;
    enablingChanges: string[];
    explanation: string;
  }[];
}
