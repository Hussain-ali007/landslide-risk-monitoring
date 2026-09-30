import React from 'react';
import { AlertTriangle, Info, Sparkles, RefreshCw } from 'lucide-react';
import { store } from '../../services/storageService';

interface DemoDataBannerProps {
  onSimulateHighRisk: () => void;
}

export const DemoDataBanner: React.FC<DemoDataBannerProps> = ({ onSimulateHighRisk }) => {
  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
            Demo Environment
          </span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="text-slate-300">
            Weather, sensor telemetries, and rainfall data are simulated for SIH Phase 1 evaluation.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateHighRisk}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Simulate sudden rainfall surge, soil saturation, and trigger emergency early warning"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>SIMULATE HIGH-RISK EVENT</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default initial state?')) {
                store.resetToDefaultData();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors cursor-pointer"
            title="Reset simulated data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
