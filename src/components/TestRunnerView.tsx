import React, { useState } from 'react';
import { runAllLogicTests, TestCaseResult } from '../lib/tests';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Beaker,
  ShieldCheck,
  Info
} from 'lucide-react';

interface TestRunnerViewProps {
  onRerunTests: () => void;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>(runAllLogicTests());
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResults(runAllLogicTests());
      setIsRunning(false);
    }, 200);
  };

  const passCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const allPassed = passCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Beaker className="w-5 h-5 text-teal-400" />
              Deterministic Logic Verification Test Suite
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${
                allPassed
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700'
              }`}
            >
              {passCount}/{totalCount} Passed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validates graph algorithms, door width thresholds, shared asset cascades, and simulation sandbox isolation.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunning ? 'Executing Tests...' : 'Re-Run All Verification Tests'}</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-3">
        {testResults.map((t, idx) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border transition-all ${
              t.passed
                ? 'bg-slate-900 border-slate-800'
                : 'bg-rose-950/40 border-rose-700/80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">
                      Test {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{t.description}</p>
                </div>
              </div>

              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                  t.passed
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                }`}
              >
                {t.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-teal-400 uppercase font-sans font-bold block mb-1">
                Execution Assertion Trace:
              </span>
              <span className="text-slate-300">{t.actualDetails}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
