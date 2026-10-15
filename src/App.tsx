/**
 * AccessPath - Accessible Indoor Navigation & Audit Improvement Simulator
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { FindRouteView } from './components/FindRouteView';
import { BuildingMap } from './components/BuildingMap';
import { AuditManagerView } from './components/AuditManagerView';
import { SimulatorView } from './components/SimulatorView';
import { GuidedDemoView } from './components/GuidedDemoView';
import { TestRunnerView } from './components/TestRunnerView';
import { BuildingData, RouteResult, RoutingPreferences } from './types';
import { loadBuildingData, saveBuildingData, resetToSeedData } from './lib/storage';
import { calculateRoute } from './lib/routing';
import { runAllLogicTests } from './lib/tests';
import { Info, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function App() {
  const [building, setBuilding] = useState<BuildingData>(() => loadBuildingData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

  const [preferences, setPreferences] = useState<RoutingPreferences>({
    entranceId: 'n-ent-main',
    destinationId: 'n-dest-office',
    requiresStepFree: true,
    minClearWidthMm: 850,
    allowLift: true
  });

  // Save to localStorage when building state changes
  const handleUpdateBuilding = (newBuilding: BuildingData) => {
    setBuilding(newBuilding);
    saveBuildingData(newBuilding);
  };

  const handleResetData = () => {
    const fresh = resetToSeedData();
    setBuilding(fresh);
  };

  // Recalculate deterministic route whenever building or preferences change
  const currentRoute: RouteResult = useMemo(() => {
    return calculateRoute(building, preferences);
  }, [building, preferences]);

  // Run automated test suite
  const testResults = useMemo(() => runAllLogicTests(), [building]);
  const testPassCount = testResults.filter((t) => t.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        testPassCount={testPassCount}
        totalTests={totalTests}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'route' && (
          <FindRouteView
            building={building}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            routeResult={currentRoute}
            onNavigateToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <h2 className="text-base font-bold text-white">Interactive Building Schematic Map</h2>
                <p className="text-slate-400 mt-0.5">
                  Explore recorded corridors, doors, ramps, stairs, and vertical lift landings across Ground and First Floors.
                </p>
              </div>
              <div className="text-slate-400">
                Active route: {building.nodes.find((n) => n.id === preferences.entranceId)?.name} →{' '}
                {building.nodes.find((n) => n.id === preferences.destinationId)?.name}
              </div>
            </div>
            <BuildingMap building={building} routeResult={currentRoute} />
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditManagerView
            building={building}
            onUpdateBuilding={handleUpdateBuilding}
            onResetToSeed={handleResetData}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            baselineBuilding={building}
            preferences={preferences}
          />
        )}

        {activeTab === 'guided_demo' && (
          <GuidedDemoView
            building={building}
            onUpdateBuilding={handleUpdateBuilding}
            onResetToSeed={handleResetData}
          />
        )}

        {activeTab === 'tests' && (
          <TestRunnerView onRerunTests={() => {}} />
        )}
      </main>

      {/* Footer / Scope Disclaimer */}
      <footer className="bg-slate-900/90 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">AccessPath Engineering Demonstration</span>
              <span className="text-teal-400">·</span>
              <span>Deterministic Graph Algorithm Routing</span>
            </div>
            <p className="text-slate-400 max-w-2xl text-[11px] leading-relaxed">
              Hackathon prototype demonstrating accessibility pathfinding and facility audit simulation.
              Not an official regulatory certification system. Door width alone does not establish interior accessibility;
              turning space, slopes, and door pressures must be physically evaluated.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 shrink-0 text-left sm:text-right">
            <div>College Wing Dataset (Illustrative)</div>
            <div>Browser LocalStorage Persistence</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
