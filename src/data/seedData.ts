/**
 * Seed data for fictional building: Demo College Wing
 *
 * Notice: Always display "Illustrative demo data — not a verified building audit."
 */

import { BuildingData } from '../types';

export const DISCLAIMER_TEXT =
  'Illustrative demo data — not a verified building audit. Always check current physical conditions.';

export const SEED_BUILDING: BuildingData = {
  id: 'demo-college-wing',
  name: 'Demo College Wing',
  disclaimer: DISCLAIMER_TEXT,
  lastUpdated: '2026-10-12T09:30:00Z',
  nodes: [
    // --- Level 0 (Ground Floor) ---
    {
      id: 'n-ent-main',
      name: 'Main Public Entrance',
      type: 'entrance',
      level: 0,
      x: 120,
      y: 420,
      category: 'entrance',
      isEntrance: true,
      description: 'Double manual push doors with low threshold ramp adjacent to steps.'
    },
    {
      id: 'n-ent-side',
      name: 'West Side Entrance (Accessible)',
      type: 'entrance',
      level: 0,
      x: 60,
      y: 200,
      category: 'entrance',
      isEntrance: true,
      description: 'Flush-threshold automated door from accessible parking bay. Card access required in baseline.'
    },
    {
      id: 'n-f0-foyer',
      name: 'Central Reception Foyer',
      type: 'junction',
      level: 0,
      x: 280,
      y: 350,
      category: 'transit',
      description: 'Spacious level concourse with information desk and directional signage.'
    },
    {
      id: 'n-f0-ramp-entrance',
      name: 'Main Entrance Low-Slope Ramp',
      type: 'junction',
      level: 0,
      x: 180,
      y: 450,
      category: 'transit',
      description: '1:14 exterior covered ramp bypassing entrance flight.'
    },
    {
      id: 'n-f0-steps-entrance',
      name: 'Main Entrance 3-Step Plinth',
      type: 'junction',
      level: 0,
      x: 200,
      y: 390,
      category: 'junction',
      description: 'Three 160mm exterior steps with bilateral handrails directly into east foyer.'
    },
    {
      id: 'n-f0-corridor-w',
      name: 'West Ground Corridor',
      type: 'corridor',
      level: 0,
      x: 160,
      y: 200,
      category: 'transit',
      description: 'Straight passage connecting west entrance and lift lobby.'
    },
    {
      id: 'n-f0-lift',
      name: 'Ground Floor Lift Landing',
      type: 'lift_landing',
      level: 0,
      x: 280,
      y: 200,
      category: 'transit',
      description: 'Lift-1 landing with call buttons at 1000mm height and audio announcements.'
    },
    {
      id: 'n-f0-stairs',
      name: 'Ground Floor Stair Foot',
      type: 'stairs_landing',
      level: 0,
      x: 350,
      y: 220,
      category: 'transit',
      description: 'Central open staircase leading to Level 1 lobby (22 risers).'
    },
    {
      id: 'n-f0-corridor-e',
      name: 'East Ground Corridor',
      type: 'corridor',
      level: 0,
      x: 420,
      y: 350,
      category: 'transit',
      description: 'Ground corridor providing access to administrative offices and toilet.'
    },
    {
      id: 'n-dest-office',
      name: 'Student & Faculty Administration Office',
      type: 'destination',
      level: 0,
      x: 520,
      y: 350,
      category: 'office',
      isDestination: true,
      description: 'Main enquiries counter with lowered section and hearing loop.'
    },
    {
      id: 'n-dest-toilet-g',
      name: 'Ground Floor Accessible Toilet (Entrance)',
      type: 'destination',
      level: 0,
      x: 420,
      y: 430,
      category: 'toilet',
      isDestination: true,
      description: 'Toilet entrance door route only. Internal layout and turning circle require physical inspection.'
    },
    {
      id: 'n-dest-seminar',
      name: 'Seminar Room G04',
      type: 'destination',
      level: 0,
      x: 480,
      y: 200,
      category: 'classroom',
      isDestination: true,
      description: 'Ground floor seminar room with unverified secondary doorway width.'
    },

    // --- Level 1 (First Floor) ---
    {
      id: 'n-f1-lift',
      name: 'Level 1 Lift Landing',
      type: 'lift_landing',
      level: 1,
      x: 280,
      y: 200,
      category: 'transit',
      description: 'Level 1 lift landing with tactile paving and directional signage.'
    },
    {
      id: 'n-f1-stairs',
      name: 'Level 1 Stair Head',
      type: 'stairs_landing',
      level: 1,
      x: 350,
      y: 220,
      category: 'transit',
      description: 'Top landing of central staircase with tactile hazard strip.'
    },
    {
      id: 'n-f1-lobby',
      name: 'Level 1 Central Lobby',
      type: 'junction',
      level: 1,
      x: 320,
      y: 280,
      category: 'transit',
      description: 'Central first-floor crossroads connecting library, lecture halls and classrooms.'
    },
    {
      id: 'n-f1-corridor-w',
      name: 'Level 1 West Corridor',
      type: 'corridor',
      level: 1,
      x: 180,
      y: 280,
      category: 'transit',
      description: 'Corridor leading to Computer Lab B.'
    },
    {
      id: 'n-f1-corridor-e',
      name: 'Level 1 East Corridor',
      type: 'corridor',
      level: 1,
      x: 460,
      y: 280,
      category: 'transit',
      description: 'Corridor leading to Classroom 201 and Lecture Hall 2.'
    },
    {
      id: 'n-dest-library',
      name: 'College Library Main Entrance',
      type: 'destination',
      level: 1,
      x: 320,
      y: 420,
      category: 'library',
      isDestination: true,
      description: 'Security RFID speed gates with designated 950mm wide accessible lane.'
    },
    {
      id: 'n-dest-classroom-201',
      name: 'Classroom 201 (Smart Seminar)',
      type: 'destination',
      level: 1,
      x: 520,
      y: 200,
      category: 'classroom',
      isDestination: true,
      description: 'Flexible teaching space with movable desks.'
    },
    {
      id: 'n-dest-lecture-hall',
      name: 'Main Lecture Hall 2',
      type: 'destination',
      level: 1,
      x: 540,
      y: 360,
      category: 'lecture_hall',
      isDestination: true,
      description: 'Tiered auditorium. Tier 1 front row has 3 dedicated wheelchair positions.'
    },
    {
      id: 'n-dest-lab',
      name: 'Computer Lab B',
      type: 'destination',
      level: 1,
      x: 80,
      y: 280,
      category: 'lab',
      isDestination: true,
      description: 'Specialist media suite with height-adjustable assistive workstations.'
    },
    {
      id: 'n-dest-toilet-1',
      name: 'Level 1 Toilet Entrance',
      type: 'destination',
      level: 1,
      x: 200,
      y: 380,
      category: 'toilet',
      isDestination: true,
      description: 'Upper floor toilet entrance. Doorway width measured at 760mm (narrow clearance).'
    }
  ],
  connections: [
    // --- Level 0 Connections ---
    // Short stair route from Main Entrance to Foyer
    {
      id: 'c-ent-main-steps',
      fromNodeId: 'n-ent-main',
      toNodeId: 'n-f0-steps-entrance',
      distanceMetres: 4.5,
      connectionType: 'stairs',
      clearWidthMm: 1200,
      stepFree: false,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T10:00:00Z',
      notes: 'Direct 3-step masonry plinth. Not accessible without step climbing.',
      bidirectional: true
    },
    {
      id: 'c-steps-foyer',
      fromNodeId: 'n-f0-steps-entrance',
      toNodeId: 'n-f0-foyer',
      distanceMetres: 3.5,
      connectionType: 'doorway',
      clearWidthMm: 900,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T10:00:00Z',
      notes: 'Glazed lobby doors leading from stairs to foyer.',
      bidirectional: true
    },
    // Step-free ramp route from Main Entrance to Foyer
    {
      id: 'c-ent-main-ramp',
      fromNodeId: 'n-ent-main',
      toNodeId: 'n-f0-ramp-entrance',
      distanceMetres: 9.0,
      connectionType: 'ramp',
      clearWidthMm: 1050,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T10:15:00Z',
      notes: 'Exterior 1:14 gradual covered ramp with continuous handrail and slip-resistant pavers.',
      bidirectional: true
    },
    {
      id: 'c-ramp-foyer',
      fromNodeId: 'n-f0-ramp-entrance',
      toNodeId: 'n-f0-foyer',
      distanceMetres: 12.0,
      connectionType: 'corridor',
      clearWidthMm: 1250,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T10:20:00Z',
      notes: 'Sheltered ground corridor leading into reception concourse.',
      bidirectional: true
    },
    // West Entrance Connection (Card access restricted in baseline - used for Scenario C)
    {
      id: 'c-ent-side-door',
      fromNodeId: 'n-ent-side',
      toNodeId: 'n-f0-corridor-w',
      distanceMetres: 6.0,
      connectionType: 'doorway',
      clearWidthMm: 950,
      stepFree: true,
      operationalStatus: 'closed', // Closed in baseline! Scenario C opens this.
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T11:00:00Z',
      notes: 'Authorised staff/student proximity card reader door. Closed to casual visitors in baseline.',
      bidirectional: true
    },
    // West Corridor to Lift Landing and Foyer
    {
      id: 'c-f0-corridor-w-lift',
      fromNodeId: 'n-f0-corridor-w',
      toNodeId: 'n-f0-lift',
      distanceMetres: 8.5,
      connectionType: 'corridor',
      clearWidthMm: 1100,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T11:15:00Z',
      notes: 'Level terrazzo floor corridor.',
      bidirectional: true
    },
    {
      id: 'c-f0-lift-foyer',
      fromNodeId: 'n-f0-lift',
      toNodeId: 'n-f0-foyer',
      distanceMetres: 10.0,
      connectionType: 'corridor',
      clearWidthMm: 1400,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T11:30:00Z',
      notes: 'Main ground transit corridor between lift landing and central foyer.',
      bidirectional: true
    },
    // Foyer to Ground Stairs Foot
    {
      id: 'c-f0-foyer-stairs',
      fromNodeId: 'n-f0-foyer',
      toNodeId: 'n-f0-stairs',
      distanceMetres: 8.0,
      connectionType: 'corridor',
      clearWidthMm: 1300,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T11:35:00Z',
      notes: 'Open circulation pathway to central staircase.',
      bidirectional: true
    },
    // Foyer to East Corridor
    {
      id: 'c-f0-foyer-corridor-e',
      fromNodeId: 'n-f0-foyer',
      toNodeId: 'n-f0-corridor-e',
      distanceMetres: 9.5,
      connectionType: 'corridor',
      clearWidthMm: 1150,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T11:45:00Z',
      notes: 'East ground circulation hallway.',
      bidirectional: true
    },
    // East Corridor to Administration Office
    {
      id: 'c-f0-corridor-e-office',
      fromNodeId: 'n-f0-corridor-e',
      toNodeId: 'n-dest-office',
      distanceMetres: 7.0,
      connectionType: 'doorway',
      clearWidthMm: 900,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T12:00:00Z',
      notes: 'Double leaf door, active leaf clear width 900mm with automated push pad.',
      bidirectional: true
    },
    // East Corridor to Ground Accessible Toilet
    {
      id: 'c-f0-corridor-e-toilet',
      fromNodeId: 'n-f0-corridor-e',
      toNodeId: 'n-dest-toilet-g',
      distanceMetres: 5.5,
      connectionType: 'doorway',
      clearWidthMm: 920,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T12:15:00Z',
      notes: 'Outward opening door with privacy latch. Note: route to entrance only, internal layout requires verification.',
      bidirectional: true
    },
    // Ground Stairs Foot to Seminar Room G04 (Doorway width UNKNOWN - used for Scenario D)
    {
      id: 'c-f0-stairs-seminar',
      fromNodeId: 'n-f0-stairs',
      toNodeId: 'n-dest-seminar',
      distanceMetres: 8.0,
      connectionType: 'doorway',
      clearWidthMm: null, // Unmeasured width! Null triggers Scenario D!
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'unknown', // Unknown evidence status!
      verifiedAt: null,
      notes: 'Wood veneer single leaf door into Seminar Room G04. Not yet measured on physical audit.',
      bidirectional: true
    },

    // --- Vertical Connections between Level 0 and Level 1 ---
    // Central Staircase (Scenario A & B: not step-free!)
    {
      id: 'c-vert-stairs',
      fromNodeId: 'n-f0-stairs',
      toNodeId: 'n-f1-stairs',
      distanceMetres: 14.0,
      connectionType: 'stairs',
      clearWidthMm: 1500,
      stepFree: false, // NOT STEP FREE
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T13:00:00Z',
      notes: 'Concrete staircase, 2 flights of 11 steps with intermediate landing and dual handrails.',
      bidirectional: true
    },
    // Passenger Lift 1 (Shared asset: 'lift-1')
    {
      id: 'c-vert-lift',
      fromNodeId: 'n-f0-lift',
      toNodeId: 'n-f1-lift',
      distanceMetres: 8.0,
      connectionType: 'lift',
      clearWidthMm: 900,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-10-10T08:00:00Z',
      notes: 'Traction passenger lift, cabin size 1400x1100mm, door opening 900mm.',
      sharedAssetId: 'lift-1',
      bidirectional: true
    },

    // --- Level 1 (First Floor) Connections ---
    // Lift landing to Level 1 Lobby
    {
      id: 'c-f1-lift-lobby',
      fromNodeId: 'n-f1-lift',
      toNodeId: 'n-f1-lobby',
      distanceMetres: 6.5,
      connectionType: 'corridor',
      clearWidthMm: 1350,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:00:00Z',
      notes: 'Level linoleum corridor with flush threshold.',
      bidirectional: true
    },
    // Stair head to Level 1 Lobby
    {
      id: 'c-f1-stairs-lobby',
      fromNodeId: 'n-f1-stairs',
      toNodeId: 'n-f1-lobby',
      distanceMetres: 5.0,
      connectionType: 'corridor',
      clearWidthMm: 1400,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:10:00Z',
      notes: 'Stair landing threshold.',
      bidirectional: true
    },
    // Lobby to College Library
    {
      id: 'c-f1-lobby-library',
      fromNodeId: 'n-f1-lobby',
      toNodeId: 'n-dest-library',
      distanceMetres: 11.0,
      connectionType: 'doorway',
      clearWidthMm: 950,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:20:00Z',
      notes: 'Double security barrier with wide accessible pass gate.',
      bidirectional: true
    },
    // Lobby to Level 1 West Corridor
    {
      id: 'c-f1-lobby-corridor-w',
      fromNodeId: 'n-f1-lobby',
      toNodeId: 'n-f1-corridor-w',
      distanceMetres: 9.0,
      connectionType: 'corridor',
      clearWidthMm: 1200,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:30:00Z',
      notes: 'West upper corridor.',
      bidirectional: true
    },
    // West Corridor to Computer Lab B
    {
      id: 'c-f1-corridor-w-lab',
      fromNodeId: 'n-f1-corridor-w',
      toNodeId: 'n-dest-lab',
      distanceMetres: 7.5,
      connectionType: 'doorway',
      clearWidthMm: 860,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:40:00Z',
      notes: 'Manual swing door into computer lab with lever handle.',
      bidirectional: true
    },
    // West Corridor to Level 1 Toilet (Narrow doorway: 760mm!)
    {
      id: 'c-f1-corridor-w-toilet',
      fromNodeId: 'n-f1-corridor-w',
      toNodeId: 'n-dest-toilet-1',
      distanceMetres: 6.0,
      connectionType: 'doorway',
      clearWidthMm: 760, // NARROW CLEARANCE (fails min 800mm or 850mm test)
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T14:50:00Z',
      notes: 'Narrow doorway clear opening 760mm. Inadequate for manual or power chairs requiring >=800mm.',
      bidirectional: true
    },
    // Lobby to Level 1 East Corridor
    {
      id: 'c-f1-lobby-corridor-e',
      fromNodeId: 'n-f1-lobby',
      toNodeId: 'n-f1-corridor-e',
      distanceMetres: 9.0,
      connectionType: 'corridor',
      clearWidthMm: 1200,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T15:00:00Z',
      notes: 'East upper hallway.',
      bidirectional: true
    },
    // East Corridor to Classroom 201
    {
      id: 'c-f1-corridor-e-c201',
      fromNodeId: 'n-f1-corridor-e',
      toNodeId: 'n-dest-classroom-201',
      distanceMetres: 8.0,
      connectionType: 'doorway',
      clearWidthMm: 880,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T15:10:00Z',
      notes: 'Standard classroom door with vision panel and kick plate.',
      bidirectional: true
    },
    // East Corridor to Main Lecture Hall 2
    {
      id: 'c-f1-corridor-e-lecture',
      fromNodeId: 'n-f1-corridor-e',
      toNodeId: 'n-dest-lecture-hall',
      distanceMetres: 10.5,
      connectionType: 'doorway',
      clearWidthMm: 950,
      stepFree: true,
      operationalStatus: 'open',
      evidenceStatus: 'verified',
      verifiedAt: '2026-09-15T15:20:00Z',
      notes: 'Acoustic seal door with automatic hold-open connected to fire alarm.',
      bidirectional: true
    }
  ],
  sharedAssets: {
    'lift-1': {
      id: 'lift-1',
      name: 'Passenger Lift 1 (Central)',
      assetType: 'lift',
      operationalStatus: 'open', // Centralized shared asset
      evidenceStatus: 'verified',
      verifiedAt: '2026-10-10T08:00:00Z',
      notes: 'Serves Level 0 and Level 1. Capacity 8 persons / 630 kg. Annual maintenance certified Oct 2026.',
      capacity: '8 persons / 630 kg',
      doorClearWidthMm: 900
    }
  }
};
