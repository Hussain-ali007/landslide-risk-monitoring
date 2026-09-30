import React, { useState } from 'react';
import { MapPin, Info, AlertTriangle, Layers, ChevronRight, Send } from 'lucide-react';
import { MonitoredLocation } from '../../types';
import { NerRiskMap } from './NerRiskMap';

interface RiskMapPageProps {
  locations: MonitoredLocation[];
  selectedLocationId: string;
  onSelectLocation: (locationId: string) => void;
  onNavigateToDetails: (locationId: string) => void;
  onNavigateToReport: () => void;
}

export const RiskMapPage: React.FC<RiskMapPageProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  onNavigateToDetails,
  onNavigateToReport,
}) => {
  const criticalCount = locations.filter((l) => l.riskLevel === 'critical').length;
  const highCount = locations.filter((l) => l.riskLevel === 'high').length;
  const modCount = locations.filter((l) => l.riskLevel === 'moderate').length;
  const lowCount = locations.filter((l) => l.riskLevel === 'low').length;
  const noDataCount = locations.filter((l) => l.riskLevel === 'insufficient_data').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Hazard Cartography
            </span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
              DEMO / SIMULATED DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Disaster Risk Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Geospatial risk classification across monitored North Eastern sectors. All values simulated for testing.
          </p>
        </div>

        {/* Risk summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
            {criticalCount} Critical
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700">
            {highCount} High
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            {modCount} Moderate
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            {lowCount} Low
          </div>
          {noDataCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700">
              {noDataCount} Insufficient Data
            </div>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <NerRiskMap
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
          onNavigateToDetails={onNavigateToDetails}
          height="650px"
        />

        {/* Bottom Helper Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Click any location marker on the map to inspect real-time rainfall, soil moisture, and ground displacement.</span>
          </div>

          <button
            onClick={onNavigateToReport}
            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Report Hazard at a New Location</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
