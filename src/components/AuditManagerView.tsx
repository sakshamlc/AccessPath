import React, { useState } from 'react';
import {
  BuildingData,
  BuildingNode,
  Connection,
  ConnectionType,
  EvidenceStatus,
  OperationalStatus,
  SharedAsset,
  StepFreeStatus
} from '../types';
import {
  downloadSampleJSON,
  resetToSeedData,
  validateBuildingJSON,
  ValidationResult
} from '../lib/storage';
import {
  ShieldAlert,
  Edit2,
  Plus,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Layers,
  FileText,
  Camera,
  Calendar,
  Save,
  X,
  Search,
  Check
} from 'lucide-react';

interface AuditManagerViewProps {
  building: BuildingData;
  onUpdateBuilding: (updated: BuildingData) => void;
  onResetToSeed: () => void;
}

export const AuditManagerView: React.FC<AuditManagerViewProps> = ({
  building,
  onUpdateBuilding,
  onResetToSeed
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Edit connection modal state
  const [editingConn, setEditingConn] = useState<Connection | null>(null);

  // Import JSON state
  const [importJsonText, setImportJsonText] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Node lookup
  const nodeMap = new Map<string, BuildingNode>();
  building.nodes.forEach((n) => nodeMap.set(n.id, n));

  // Filter connections
  const filteredConnections = building.connections.filter((conn) => {
    const from = nodeMap.get(conn.fromNodeId);
    const to = nodeMap.get(conn.toNodeId);

    if (filterType !== 'all' && conn.connectionType !== filterType) return false;
    if (filterLevel !== 'all') {
      const levelNum = parseInt(filterLevel);
      if (from?.level !== levelNum && to?.level !== levelNum) return false;
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchId = conn.id.toLowerCase().includes(term);
      const matchFrom = from?.name.toLowerCase().includes(term);
      const matchTo = to?.name.toLowerCase().includes(term);
      const matchNotes = conn.notes.toLowerCase().includes(term);
      return matchId || matchFrom || matchTo || matchNotes;
    }
    return true;
  });

  // Handle updating shared asset (e.g. lift-1)
  const handleUpdateSharedAsset = (
    assetId: string,
    newStatus: OperationalStatus,
    newNotes?: string
  ) => {
    const updatedAssets = { ...building.sharedAssets };
    if (!updatedAssets[assetId]) return;

    updatedAssets[assetId] = {
      ...updatedAssets[assetId],
      operationalStatus: newStatus,
      notes: newNotes !== undefined ? newNotes : updatedAssets[assetId].notes,
      verifiedAt: new Date().toISOString()
    };

    const updatedBuilding: BuildingData = {
      ...building,
      lastUpdated: new Date().toISOString(),
      sharedAssets: updatedAssets
    };

    onUpdateBuilding(updatedBuilding);
  };

  // Handle saving an edited connection
  const handleSaveConnection = (updatedConn: Connection) => {
    const newConns = building.connections.map((c) =>
      c.id === updatedConn.id ? updatedConn : c
    );

    const updatedBuilding: BuildingData = {
      ...building,
      lastUpdated: new Date().toISOString(),
      connections: newConns
    };

    onUpdateBuilding(updatedBuilding);
    setEditingConn(null);
  };

  // Handle JSON export
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(building, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accesspath-audit-${building.id}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const val = validateBuildingJSON(content);
      setValidationResult(val);
      setShowImportModal(true);
    };
    reader.readAsText(file);
  };

  // Handle applying validated JSON
  const handleApplyImportedData = () => {
    if (validationResult && validationResult.isValid && validationResult.validatedData) {
      onUpdateBuilding(validationResult.validatedData);
      setShowImportModal(false);
      setImportJsonText('');
      setValidationResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Security and Browser Scope Disclaimer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px]">
              Demo Manager View — Not Authenticated
            </span>
            <span className="text-slate-400">Role toggles are simulated UI previews</span>
          </div>
          <p className="text-slate-300">
            <strong>Local Browser Storage:</strong> Any edits or imported datasets saved here belong exclusively to this web browser (localStorage) and are not shared with other users or devices.
          </p>
        </div>

        {/* Data Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={downloadSampleJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Sample JSON</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Audit</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetToSeed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-200 text-slate-300 border border-slate-700 hover:border-rose-800 transition-colors"
            title="Reset to default seed building audit"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Centralized Shared Assets Card (e.g. Lift-1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Centralized Shared Facility Assets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates to a shared asset automatically cascade to all dependent building connections and trigger route recalculation.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {Object.keys(building.sharedAssets).length} Shared Asset Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(building.sharedAssets).map((asset) => (
            <div
              key={asset.id}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-300 font-bold bg-purple-950/80 border border-purple-800 px-1.5 py-0.5 rounded">
                      {asset.id}
                    </span>
                    <h3 className="font-bold text-sm text-white">{asset.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{asset.notes}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    asset.operationalStatus === 'open'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                  }`}
                >
                  {asset.operationalStatus}
                </span>
              </div>

              {/* Status Controls */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Operational Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateSharedAsset(asset.id, 'open')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      asset.operationalStatus === 'open'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Open / Active
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateSharedAsset(
                        asset.id,
                        'closed',
                        'Marked out of service for maintenance audit test.'
                      )
                    }
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      asset.operationalStatus === 'closed'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Closed / Out of Service
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Capacity: {asset.capacity || 'Standard'}</span>
                <span>Door clear width: {asset.doorClearWidthMm || 900}mm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Building Connections &amp; Passageways Audit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review physical measurements, step-free classification, and verification evidence.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredConnections.length} of {building.connections.length} connections
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, location name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-8 pr-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="corridor">Corridor</option>
              <option value="doorway">Doorway</option>
              <option value="ramp">Ramp</option>
              <option value="stairs">Stairs</option>
              <option value="lift">Lift</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Level:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="all">All Floors</option>
              <option value="0">Level 0 (Ground)</option>
              <option value="1">Level 1 (First Floor)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">ID</th>
                <th className="py-2.5 px-3 font-semibold">Connection</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Distance</th>
                <th className="py-2.5 px-3 font-semibold">Clear Width</th>
                <th className="py-2.5 px-3 font-semibold">Step-Free</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Evidence</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredConnections.map((conn) => {
                const fromNode = nodeMap.get(conn.fromNodeId);
                const toNode = nodeMap.get(conn.toNodeId);

                return (
                  <tr key={conn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-teal-400 font-semibold">
                      {conn.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">
                        {fromNode?.name || conn.fromNodeId}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ↔ {toNode?.name || conn.toNodeId}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                        {conn.connectionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{conn.distanceMetres}m</td>
                    <td className="py-2.5 px-3 font-mono">
                      {conn.clearWidthMm !== null ? (
                        <span className="text-teal-300 font-semibold">{conn.clearWidthMm}mm</span>
                      ) : (
                        <span className="text-amber-400 font-semibold italic">Unmeasured</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {conn.stepFree === true ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : conn.stepFree === false ? (
                        <span className="text-rose-400 flex items-center gap-1 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Steps
                        </span>
                      ) : (
                        <span className="text-amber-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                          conn.operationalStatus === 'open'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {conn.operationalStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          conn.evidenceStatus === 'verified'
                            ? 'text-teal-300 bg-teal-950/60'
                            : 'text-amber-300 bg-amber-950/60'
                        }`}
                      >
                        {conn.evidenceStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setEditingConn(conn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Connection Modal */}
      {editingConn && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-teal-400" />
                  Edit Connection Audit: {editingConn.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update measurements and verification evidence.
                </p>
              </div>
              <button
                onClick={() => setEditingConn(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Distance */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-200">
                  Distance (metres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={editingConn.distanceMetres}
                  onChange={(e) =>
                    setEditingConn({
                      ...editingConn,
                      distanceMetres: parseFloat(e.target.value) || 1
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Clear Width */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-200">
                    Clear Passage Width (mm)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                    <input
                      type="checkbox"
                      checked={editingConn.clearWidthMm === null}
                      onChange={(e) =>
                        setEditingConn({
                          ...editingConn,
                          clearWidthMm: e.target.checked ? null : 850
                        })
                      }
                      className="rounded bg-slate-800 border-slate-700 text-teal-600"
                    />
                    <span>Mark as Unmeasured / Unknown (null)</span>
                  </label>
                </div>
                {editingConn.clearWidthMm !== null ? (
                  <input
                    type="number"
                    step="10"
                    min="400"
                    max="3000"
                    value={editingConn.clearWidthMm}
                    onChange={(e) =>
                      setEditingConn({
                        ...editingConn,
                        clearWidthMm: parseInt(e.target.value) || null
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                  />
                ) : (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs">
                    Clear width is set to <strong>null (unmeasured)</strong>. In strict routing mode, this connection will not be certified verified.
                  </div>
                )}
              </div>

              {/* Step Free Radio */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-200">
                  Step-Free Condition
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stepFree"
                      checked={editingConn.stepFree === true}
                      onChange={() => setEditingConn({ ...editingConn, stepFree: true })}
                      className="text-teal-600"
                    />
                    <span className="text-emerald-400 font-medium">Yes (Step-Free)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stepFree"
                      checked={editingConn.stepFree === false}
                      onChange={() => setEditingConn({ ...editingConn, stepFree: false })}
                      className="text-teal-600"
                    />
                    <span className="text-rose-400 font-medium">No (Stairs / Steps)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stepFree"
                      checked={editingConn.stepFree === 'unknown'}
                      onChange={() => setEditingConn({ ...editingConn, stepFree: 'unknown' })}
                      className="text-teal-600"
                    />
                    <span className="text-amber-400 font-medium">Unknown</span>
                  </label>
                </div>
              </div>

              {/* Operational Status */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-200">
                  Operational Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="operational"
                      checked={editingConn.operationalStatus === 'open'}
                      onChange={() =>
                        setEditingConn({ ...editingConn, operationalStatus: 'open' })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-emerald-400 font-medium">Open</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="operational"
                      checked={editingConn.operationalStatus === 'closed'}
                      onChange={() =>
                        setEditingConn({ ...editingConn, operationalStatus: 'closed' })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-rose-400 font-medium">Closed / Locked</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="operational"
                      checked={editingConn.operationalStatus === 'unknown'}
                      onChange={() =>
                        setEditingConn({ ...editingConn, operationalStatus: 'unknown' })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-amber-400 font-medium">Unknown</span>
                  </label>
                </div>
              </div>

              {/* Evidence Status */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-200">
                  Evidence Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="evidence"
                      checked={editingConn.evidenceStatus === 'verified'}
                      onChange={() =>
                        setEditingConn({
                          ...editingConn,
                          evidenceStatus: 'verified',
                          verifiedAt: new Date().toISOString()
                        })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-teal-300 font-medium">Verified Audit</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="evidence"
                      checked={editingConn.evidenceStatus === 'reported'}
                      onChange={() =>
                        setEditingConn({ ...editingConn, evidenceStatus: 'reported' })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-amber-300 font-medium">Reported / Unaudited</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="evidence"
                      checked={editingConn.evidenceStatus === 'unknown'}
                      onChange={() =>
                        setEditingConn({ ...editingConn, evidenceStatus: 'unknown' })
                      }
                      className="text-teal-600"
                    />
                    <span className="text-slate-400 font-medium">Unknown</span>
                  </label>
                </div>
              </div>

              {/* Auditor Notes */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-200">
                  Auditor Field Notes
                </label>
                <textarea
                  rows={2}
                  value={editingConn.notes}
                  onChange={(e) =>
                    setEditingConn({ ...editingConn, notes: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 flex items-start gap-2">
                <Camera className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Audit standard rule:</strong> Photo attachments provide visual reference, but do not automatically establish a measurement without recorded tape/laser audit verification.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingConn(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveConnection(editingConn)}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes &amp; Recalculate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import & Validation Preview Modal */}
      {showImportModal && validationResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-400" />
                  Building Data Import Validation Preview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect schema validation checks before applying to local storage.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Outcome Banner */}
            {validationResult.isValid ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Validation Passed: Dataset Schema is Compliant
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    No duplicate IDs, missing node references, or invalid numbers were detected.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700 flex items-start gap-2.5">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-300">
                    Validation Failed: Errors Found
                  </h4>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-rose-200">
                    {validationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Nodes</span>
                <p className="text-base font-bold text-white">
                  {validationResult.summary.nodeCount}
                </p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Connections
                </span>
                <p className="text-base font-bold text-white">
                  {validationResult.summary.connectionCount}
                </p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Verified
                </span>
                <p className="text-base font-bold text-teal-300">
                  {validationResult.summary.verifiedConnectionCount}
                </p>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Unverified
                </span>
                <p className="text-base font-bold text-amber-300">
                  {validationResult.summary.unverifiedConnectionCount}
                </p>
              </div>
            </div>

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Audit Integrity Warnings:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-200 text-[11px]">
                  {validationResult.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              {validationResult.isValid && (
                <button
                  onClick={handleApplyImportedData}
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Replace Current Building Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
