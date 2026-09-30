import React, { useMemo, useState } from 'react';
import {
  MapPin,
  CloudRain,
  Activity,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Brain,
  Droplets,
  ArrowLeft,
  Send,
  FolderGit2,
} from 'lucide-react';
import { MonitoredLocation, Alert, Incident, SensorRecord, WeatherRecord } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { aiPredictionService } from '../../services/aiPredictionService';
import { store } from '../../services/storageService';

interface LocationDetailViewProps {
  locations: MonitoredLocation[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  alerts: Alert[];
  incidents: Incident[];
  sensors: SensorRecord[];
  weather: WeatherRecord[];
  onNavigateToIncidents: () => void;
  onNavigateToReport: () => void;
  onBackToMap?: () => void;
}

export const LocationDetailView: React.FC<LocationDetailViewProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  alerts,
  incidents,
  sensors,
  weather,
  onNavigateToIncidents,
  onNavigateToReport,
  onBackToMap,
}) => {
  const currentLocation =
    locations.find((l) => l.id === selectedLocationId) || locations[0];

  const locationSensors = sensors.filter(
    (s) => s.locationId === currentLocation.id
  );

  const locationAlerts = alerts.filter(
    (a) => a.locationId === currentLocation.id
  );

  const aiPrediction = useMemo(() => {
    return aiPredictionService.predictForLocation(
      currentLocation,
      weather,
      sensors,
      []
    );
  }, [currentLocation, weather, sensors]);

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleAcknowledge = () => {
    const active = locationAlerts.find((a) => a.status === 'active');
    if (active) {
      store.acknowledgeAlert(active.id);
      setActionFeedback(`Alert ${active.id} acknowledged.`);
    } else {
      setActionFeedback('All alerts for this sector are already acknowledged.');
    }
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleCreateIncident = () => {
    const active = locationAlerts.find((a) => a.status === 'active');
    if (active) {
      store.createIncidentFromAlert(active.id);
      setActionFeedback(`Incident ticket initiated for ${currentLocation.name}.`);
      onNavigateToIncidents();
    } else {
      setActionFeedback('No unhandled active alert to escalate. View existing incidents.');
    }
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAssignOfficer = () => {
    setActionFeedback('Field Officer (Disaster Response Unit) assigned to sector inspection.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Sector Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Risk Map</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sector Risk Profile
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">{currentLocation.id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {currentLocation.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentLocation.district}, {currentLocation.state} • Coordinates: {currentLocation.lat.toFixed(3)}°N, {currentLocation.lng.toFixed(3)}°E
          </p>
        </div>

        {/* Location Selector & Risk Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={currentLocation.id}
            onChange={(e) => onSelectLocation(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.state})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <RiskBadge level={currentLocation.riskLevel} size="md" />
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 leading-none">
                {currentLocation.riskProbability}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Probability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="p-3.5 bg-slate-900 text-white text-xs rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* 2. Four Core Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rainfall */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rainfall (24h)</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-slate-900">
            {currentLocation.rainfall24h} <span className="text-xs font-normal text-slate-500">mm</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>1h Rate: {currentLocation.rainfall1h} mm/h</span>
            <span className={currentLocation.rainfall24h >= 120 ? 'text-red-600 font-bold' : 'text-slate-600'}>
              {currentLocation.rainfall24h >= 120 ? 'Trigger Exceeded' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Soil Moisture</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-slate-900">
            {currentLocation.soilMoisture} <span className="text-xs font-normal text-slate-500">%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Sensor: TDR Array</span>
            <span className={currentLocation.soilMoisture > 75 ? 'text-red-600 font-bold' : 'text-slate-600'}>
              {currentLocation.soilMoisture > 75 ? 'High Saturation' : 'Stable'}
            </span>
          </div>
        </div>

        {/* Slope Gradient */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Slope Gradient</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-slate-900">
            {currentLocation.slope}° <span className="text-xs font-normal text-slate-500">angle</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Elevation: {currentLocation.elevation}m</span>
            <span className="text-slate-700 font-medium">
              {currentLocation.slope > 35 ? 'Steep Escarpment' : 'Moderate'}
            </span>
          </div>
        </div>

        {/* Ground Movement */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ground Movement</span>
            <Activity className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold font-mono text-red-600">
            {currentLocation.groundMovementRate} <span className="text-xs font-normal text-slate-500">mm/d</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
            <span>Inclinometer Telemetry</span>
            <span className={currentLocation.groundMovementRate > 2 ? 'text-red-600 font-bold' : 'text-slate-600'}>
              {currentLocation.groundMovementRate > 2 ? 'Active Displacement' : 'Stationary'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section 16: "WHY THIS RISK?" (AI Contributing Factors) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Why This Risk?</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Geotechnical attribution model assessing slope equilibrium and precipitation surcharge.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Confidence: {aiPrediction.confidenceScore}%
          </span>
        </div>

        {/* Factors Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiPrediction.contributingFactors.map((factor, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>{factor.name}</span>
                <span className="font-mono text-blue-600">{factor.impactPercentage}% Impact</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${factor.impactPercentage}%` }}
                  className={`h-full rounded-full ${
                    factor.impactPercentage >= 30
                      ? 'bg-red-500'
                      : factor.impactPercentage >= 20
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Observed: {factor.actualValue}</span>
                <span>Threshold: {factor.thresholdOrNorm}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
                {factor.description}
              </p>
            </div>
          ))}
        </div>

        {/* Physical Advisory Note */}
        {currentLocation.activeAdvisory && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Advisory:</span>
              <p className="mt-0.5 leading-relaxed">{currentLocation.activeAdvisory}</p>
            </div>
          </div>
        )}

        {/* Model Transparency Disclaimer */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center justify-between">
          <span className="font-medium text-slate-700">
            AI-generated risk estimate — decision support only.
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {aiPrediction.modelVersion}
          </span>
        </div>
      </div>

      {/* 4. Authority Action Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Authority Response Actions
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            Manage Early Warnings &amp; Escalation for {currentLocation.name}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAcknowledge}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Acknowledge Alert
          </button>

          <button
            onClick={handleAssignOfficer}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Assign Field Officer
          </button>

          <button
            onClick={handleCreateIncident}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Create Incident
          </button>
        </div>
      </div>
    </div>
  );
};
