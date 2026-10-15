import React, { useState } from 'react';
import {
  BuildingData,
  BuildingNode,
  Connection,
  RouteResult,
  SharedAsset
} from '../types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DoorOpen,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  FileText,
  X,
  Compass,
  Footprints,
  Info
} from 'lucide-react';

interface BuildingMapProps {
  building: BuildingData;
  routeResult: RouteResult | null;
  onSelectConnection?: (conn: Connection) => void;
  onSelectNode?: (node: BuildingNode) => void;
  heightClassName?: string;
}

export const BuildingMap: React.FC<BuildingMapProps> = ({
  building,
  routeResult,
  onSelectConnection,
  onSelectNode,
  heightClassName = 'h-[640px]'
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | 'both'>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [inspectedConnection, setInspectedConnection] = useState<Connection | null>(null);
  const [inspectedNode, setInspectedNode] = useState<BuildingNode | null>(null);

  // Filter nodes & connections by selected level
  const activeLevel = selectedLevel;

  const visibleNodes = building.nodes.filter(
    (n) => activeLevel === 'both' || n.level === activeLevel
  );

  const nodeMap = new Map<string, BuildingNode>();
  building.nodes.forEach((n) => nodeMap.set(n.id, n));

  const visibleConnections = building.connections.filter((conn) => {
    const from = nodeMap.get(conn.fromNodeId);
    const to = nodeMap.get(conn.toNodeId);
    if (!from || !to) return false;
    if (activeLevel === 'both') return true;
    return from.level === activeLevel || to.level === activeLevel;
  });

  // Active route sets
  const routeNodeIds = new Set(routeResult?.nodes.map((n) => n.id) || []);
  const routeConnIds = new Set(routeResult?.connections.map((c) => c.id) || []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Helper for shared asset
  const getSharedAsset = (conn: Connection): SharedAsset | null => {
    if (conn.sharedAssetId && building.sharedAssets[conn.sharedAssetId]) {
      return building.sharedAssets[conn.sharedAssetId];
    }
    return null;
  };

  return (
    <div className={`relative w-full ${heightClassName} bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none flex flex-col`}>
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border-b border-slate-800 z-10">
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedLevel(0)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedLevel === 0
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Level 0: Ground Floor
          </button>
          <button
            onClick={() => setSelectedLevel(1)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedLevel === 1
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Level 1: First Floor
          </button>
          <button
            onClick={() => setSelectedLevel('both')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              selectedLevel === 'both'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Both Levels
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <div className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Schematic Diagram (Not live GPS)</span>
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.4))}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetViewport}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Reset map view"
            aria-label="Reset map view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="flex-1 cursor-grab active:cursor-grabbing overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 620 540"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Active route glow filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker for directional route */}
            <marker
              id="routeArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#14b8a6" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="#090d16" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Architectural Background Rooms Outline */}
            <g opacity="0.35">
              {/* Level 0 Rooms */}
              {(activeLevel === 0 || activeLevel === 'both') && (
                <>
                  {/* Foyer zone */}
                  <rect
                    x="150"
                    y="310"
                    width="260"
                    height="170"
                    rx="8"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="165" y="335" fill="#64748b" fontSize="11" fontWeight="bold">
                    Ground Floor Concourse &amp; Foyer
                  </text>

                  {/* Office zone */}
                  <rect
                    x="480"
                    y="310"
                    width="110"
                    height="90"
                    rx="6"
                    fill="#0f172a"
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <text x="490" y="330" fill="#2dd4bf" fontSize="10" fontWeight="bold">
                    Admin Office
                  </text>

                  {/* Toilet zone */}
                  <rect
                    x="380"
                    y="400"
                    width="90"
                    height="70"
                    rx="6"
                    fill="#0f172a"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                  <text x="390" y="420" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Accessible WC
                  </text>

                  {/* Seminar Room G04 */}
                  <rect
                    x="440"
                    y="160"
                    width="100"
                    height="80"
                    rx="6"
                    fill="#0f172a"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text x="450" y="180" fill="#fbbf24" fontSize="9" fontWeight="bold">
                    Seminar G04
                  </text>
                </>
              )}

              {/* Level 1 Rooms */}
              {(activeLevel === 1 || activeLevel === 'both') && (
                <>
                  {/* Library Zone */}
                  <rect
                    x="240"
                    y="380"
                    width="160"
                    height="90"
                    rx="6"
                    fill="#0f172a"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <text x="255" y="405" fill="#38bdf8" fontSize="11" fontWeight="bold">
                    College Library
                  </text>

                  {/* Classroom 201 */}
                  <rect
                    x="480"
                    y="160"
                    width="110"
                    height="80"
                    rx="6"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text x="495" y="185" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    Classroom 201
                  </text>

                  {/* Lecture Hall 2 */}
                  <rect
                    x="500"
                    y="320"
                    width="95"
                    height="90"
                    rx="6"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text x="510" y="340" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Lecture Hall 2
                  </text>

                  {/* Computer Lab B */}
                  <rect
                    x="40"
                    y="240"
                    width="90"
                    height="80"
                    rx="6"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text x="50" y="260" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    Computer Lab B
                  </text>
                </>
              )}

              {/* Shared Lift Shaft indicator */}
              <rect
                x="255"
                y="175"
                width="50"
                height="50"
                rx="4"
                fill="#2e1065"
                stroke="#a855f7"
                strokeWidth="1.5"
              />
              <text x="265" y="205" fill="#d8b4fe" fontSize="10" fontWeight="bold">
                Lift-1
              </text>
            </g>

            {/* Render Base Connections */}
            {visibleConnections.map((conn) => {
              const from = nodeMap.get(conn.fromNodeId);
              const to = nodeMap.get(conn.toNodeId);
              if (!from || !to) return null;

              const isRouteActive = routeConnIds.has(conn.id);
              const isInspected = inspectedConnection?.id === conn.id;

              // Style based on connection type
              let strokeColor = '#334155';
              let strokeDasharray = 'none';
              let strokeWidth = 3.5;

              if (conn.connectionType === 'ramp') {
                strokeColor = '#0d9488'; // teal
                strokeDasharray = '6 3';
              } else if (conn.connectionType === 'stairs') {
                strokeColor = '#e11d48'; // red/pink for stairs
                strokeDasharray = '3 3';
              } else if (conn.connectionType === 'lift') {
                strokeColor = '#9333ea'; // purple
                strokeDasharray = '5 4';
                strokeWidth = 4;
              } else if (conn.connectionType === 'doorway') {
                strokeColor = '#64748b';
                strokeWidth = 4;
              }

              if (conn.operationalStatus === 'closed') {
                strokeColor = '#ef4444';
                strokeDasharray = '2 4';
              }

              // Shift slightly if vertical stair/lift between floors when viewing both
              const x1 = from.x;
              const y1 = from.y;
              const x2 = to.x;
              const y2 = to.y;

              return (
                <g key={conn.id} className="cursor-pointer group">
                  {/* Invisible thicker stroke for easy clicking */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth="18"
                    onClick={() => {
                      setInspectedConnection(conn);
                      setInspectedNode(null);
                      if (onSelectConnection) onSelectConnection(conn);
                    }}
                  />

                  {/* Visible edge line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-150 group-hover:stroke-teal-300"
                  />

                  {/* Highlight if inspected */}
                  {isInspected && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#38bdf8"
                      strokeWidth="6"
                      strokeOpacity="0.6"
                      strokeLinecap="round"
                    />
                  )}

                  {/* If closed, show a clear visual barrier indicator with text badge */}
                  {conn.operationalStatus === 'closed' && (
                    <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                      <circle r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                      <rect x="-22" y="10" width="44" height="15" rx="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                      <text x="0" y="21" fill="#fecaca" fontSize="8" fontWeight="bold" textAnchor="middle">
                        BLOCKED
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Active Route Overlay */}
            {routeResult &&
              routeResult.connections.map((conn, idx) => {
                const from = nodeMap.get(conn.fromNodeId);
                const to = nodeMap.get(conn.toNodeId);
                if (!from || !to) return null;

                const isPotential = routeResult.status === 'potential_match';
                const routeStroke = isPotential ? '#fbbf24' : '#14b8a6'; // amber if potential, teal if verified

                return (
                  <g key={`route-line-${conn.id}-${idx}`}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={routeStroke}
                      strokeWidth="5"
                      strokeLinecap="round"
                      filter="url(#routeGlow)"
                      className="animate-pulse"
                    />
                  </g>
                );
              })}

            {/* Render Nodes */}
            {visibleNodes.map((node) => {
              const isRouteActive = routeNodeIds.has(node.id);
              const isInspected = inspectedNode?.id === node.id;
              const isStart = routeResult?.nodes[0]?.id === node.id;
              const isEnd =
                routeResult &&
                routeResult.nodes.length > 1 &&
                routeResult.nodes[routeResult.nodes.length - 1]?.id === node.id;

              // Node icon/styling
              let fillColor = '#1e293b';
              let strokeColor = '#475569';
              let radius = 9;

              if (node.isEntrance) {
                fillColor = '#065f46';
                strokeColor = '#10b981';
                radius = 12;
              } else if (node.isDestination) {
                fillColor = '#0c4a6e';
                strokeColor = '#0284c7';
                radius = 12;
              } else if (node.type === 'lift_landing') {
                fillColor = '#3b0764';
                strokeColor = '#a855f7';
                radius = 11;
              } else if (node.type === 'stairs_landing') {
                fillColor = '#4c0519';
                strokeColor = '#f43f5e';
                radius = 10;
              }

              if (isStart) {
                fillColor = '#047857';
                strokeColor = '#34d399';
                radius = 14;
              } else if (isEnd) {
                fillColor = '#0369a1';
                strokeColor = '#38bdf8';
                radius = 14;
              }

              // Waypoint step number if part of route
              const stepIndex = routeResult?.nodes.findIndex((n) => n.id === node.id);

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setInspectedNode(node);
                    setInspectedConnection(null);
                    if (onSelectNode) onSelectNode(node);
                  }}
                >
                  {/* Touch/click target */}
                  <circle cx={node.x} cy={node.y} r={radius + 8} fill="transparent" />

                  {/* Outer active highlight ring */}
                  {isRouteActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 4}
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={fillColor}
                    stroke={isInspected ? '#38bdf8' : strokeColor}
                    strokeWidth={isInspected ? 3 : 2}
                    className="transition-all duration-150 group-hover:scale-110"
                  />

                  {/* Icon or indicator letter */}
                  {isStart && (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      A
                    </text>
                  )}
                  {isEnd && (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      B
                    </text>
                  )}
                  {!isStart && !isEnd && node.isEntrance && (
                    <text
                      x={node.x}
                      y={node.y + 3.5}
                      fill="#34d399"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      E
                    </text>
                  )}
                  {!isStart && !isEnd && node.isDestination && (
                    <text
                      x={node.x}
                      y={node.y + 3.5}
                      fill="#38bdf8"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      D
                    </text>
                  )}
                  {node.type === 'lift_landing' && (
                    <text
                      x={node.x}
                      y={node.y + 3.5}
                      fill="#d8b4fe"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      L
                    </text>
                  )}
                  {node.type === 'stairs_landing' && (
                    <text
                      x={node.x}
                      y={node.y + 3.5}
                      fill="#fda4af"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      S
                    </text>
                  )}

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y - (radius + 4)}
                    fill={isRouteActive ? '#f8fafc' : '#94a3b8'}
                    fontSize="9"
                    fontWeight={isRouteActive ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {node.name.length > 22 ? `${node.name.slice(0, 20)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Map Legend (Never relying on color alone, icons + labels) */}
      <div className="bg-slate-900 border-t border-slate-800 p-2.5 px-4 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-200">Legend:</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-teal-500 rounded inline-block" />
            <span>Ramp (Step-Free)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-rose-500 border-dashed border-t border-rose-300 inline-block" />
            <span>Stairs (Not Step-Free)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-purple-500 rounded inline-block" />
            <span>Lift-1 (Shared Asset)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-emerald-400 inline-block" />
            <span>Entrance</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-700 border border-sky-400 inline-block" />
            <span>Destination</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-teal-400 shadow-sm shadow-teal-400 inline-block" />
            <span>Active Calculated Route</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Click any path or node to inspect recorded audit measurements
        </div>
      </div>

      {/* Slide-out Inspector Drawer when a Connection or Node is Clicked */}
      {(inspectedConnection || inspectedNode) && (
        <div className="absolute right-3 top-14 bottom-14 w-80 bg-slate-900/95 backdrop-blur border border-slate-700 shadow-2xl rounded-xl p-4 flex flex-col z-20 text-slate-200 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm text-white">
                {inspectedConnection ? 'Audit Connection Inspector' : 'Node Inspector'}
              </h3>
            </div>
            <button
              onClick={() => {
                setInspectedConnection(null);
                setInspectedNode(null);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {inspectedConnection && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Connection ID
                </span>
                <p className="font-mono text-teal-300 font-semibold">{inspectedConnection.id}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Endpoints
                </span>
                <p className="text-white font-medium">
                  {nodeMap.get(inspectedConnection.fromNodeId)?.name || inspectedConnection.fromNodeId}
                  <span className="text-slate-400 mx-1.5">↔</span>
                  {nodeMap.get(inspectedConnection.toNodeId)?.name || inspectedConnection.toNodeId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Connection Type</span>
                  <p className="capitalize font-semibold text-white">
                    {inspectedConnection.connectionType}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Distance</span>
                  <p className="font-semibold text-white">
                    {inspectedConnection.distanceMetres} metres
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Clear Passage Width</span>
                  <p className="font-semibold">
                    {inspectedConnection.clearWidthMm !== null ? (
                      <span className="text-teal-300">{inspectedConnection.clearWidthMm} mm</span>
                    ) : (
                      <span className="text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Unmeasured (null)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Step-Free Status</span>
                  <p className="font-semibold">
                    {inspectedConnection.stepFree === true ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Step-Free (Yes)
                      </span>
                    ) : inspectedConnection.stepFree === false ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Stairs / Steps (No)
                      </span>
                    ) : (
                      <span className="text-amber-400">Unknown</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Operational Status</span>
                  <p className="font-semibold">
                    {inspectedConnection.operationalStatus === 'open' ? (
                      <span className="text-emerald-400">Open / Usable</span>
                    ) : inspectedConnection.operationalStatus === 'closed' ? (
                      <span className="text-rose-400">Closed / Locked</span>
                    ) : (
                      <span className="text-amber-400">Unknown</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Evidence Status</span>
                  <p className="font-semibold">
                    {inspectedConnection.evidenceStatus === 'verified' ? (
                      <span className="text-teal-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Audit
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        {inspectedConnection.evidenceStatus}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {inspectedConnection.verifiedAt && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Verified:{' '}
                    {new Date(inspectedConnection.verifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {inspectedConnection.sharedAssetId && (
                <div className="bg-purple-950/60 border border-purple-800/60 p-2 rounded text-[11px]">
                  <span className="font-bold text-purple-200">Shared Asset:</span>{' '}
                  <span className="text-purple-300">{inspectedConnection.sharedAssetId}</span>
                  {getSharedAsset(inspectedConnection) && (
                    <p className="text-slate-300 mt-1">
                      Status:{' '}
                      <strong className="text-white">
                        {getSharedAsset(inspectedConnection)!.operationalStatus}
                      </strong>{' '}
                      — {getSharedAsset(inspectedConnection)!.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Auditor Notes</span>
                <p className="text-slate-300 mt-0.5 italic bg-slate-800/80 p-2 rounded border border-slate-700/50">
                  {inspectedConnection.notes || 'No specific field notes recorded.'}
                </p>
              </div>

              <div className="pt-1">
                <p className="text-[10px] text-slate-400">
                  * Note: Photo attachments or physical documents do not automatically establish accessibility without verified measurements.
                </p>
              </div>
            </div>
          )}

          {inspectedNode && (
            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Node ID
                </span>
                <p className="font-mono text-teal-300 font-semibold">{inspectedNode.id}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Location Name
                </span>
                <p className="text-white font-medium text-sm">{inspectedNode.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400">Floor Level</span>
                  <p className="font-semibold text-white">Level {inspectedNode.level}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Category</span>
                  <p className="capitalize font-semibold text-white">
                    {inspectedNode.category || inspectedNode.type}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">Description</span>
                <p className="text-slate-300 mt-0.5 bg-slate-800/80 p-2 rounded border border-slate-700/50">
                  {inspectedNode.description || 'Standard transit/junction node.'}
                </p>
              </div>

              {inspectedNode.category === 'toilet' && (
                <div className="bg-amber-950/60 border border-amber-800/60 p-2 rounded text-[11px] text-amber-200">
                  <strong>Scope boundary:</strong> Route guidance directs visitors to the toilet entrance door. Internal layout, turning circle, and transfer rails require independent interior audit.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
