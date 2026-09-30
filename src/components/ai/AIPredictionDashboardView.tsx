import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Info,
  TrendingUp,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  MonitoredLocation,
  AIPredictionResult,
  LandslideFeatureVector,
  WeatherRecord,
  SensorRecord,
  CitizenReport,
} from '../../types';
import { aiPredictionService } from '../../services/aiPredictionService';
import { DEMO_TRAINING_DATASET, MODEL_TRAINING_METRICS } from '../../data/trainingData';
import { RiskBadge } from '../common/RiskBadge';

interface AIPredictionDashboardViewProps {
  locations: MonitoredLocation[];
  weather: WeatherRecord[];
  sensors: SensorRecord[];
  reports: CitizenReport[];
  selectedLocationId: string;
  onSelectLocation: (locId: string) => void;
  onNavigateToLocation: (locId: string) => void;
  onNavigateToMap: (locId?: string) => void;
}

export const AIPredictionDashboardView: React.FC<AIPredictionDashboardViewProps> = ({
  locations,
  weather,
  sensors,
  reports,
  selectedLocationId,
  onSelectLocation,
  onNavigateToLocation,
  onNavigateToMap,
}) => {
  // Input parameters state
  const [rainfall1h, setRainfall1h] = useState<number>(22.0);
  const [rainfall6h, setRainfall6h] = useState<number>(75.0);
  const [rainfall24h, setRainfall24h] = useState<number>(185.0);
  const [rainfall72h, setRainfall72h] = useState<number>(310.0);
  const [soilMoisture, setSoilMoisture] = useState<number>(92.0);
  const [slope, setSlope] = useState<number>(46);
  const [elevation, setElevation] = useState<number>(1380);
  const [groundMovement, setGroundMovement] = useState<number>(6.4);
  const [waterLevel, setWaterLevel] = useState<number>(78.0);
  const [historicalIncidents, setHistoricalIncidents] = useState<number>(14);

  // Additional geotechnical toggles
  const [hasTensionCracks, setHasTensionCracks] = useState<boolean>(true);
  const [hasWaterSeepage, setHasWaterSeepage] = useState<boolean>(true);

  // Compute prediction
  const simulatedVector: LandslideFeatureVector = useMemo(() => {
    return {
      rainfall1h,
      rainfall6h,
      rainfall24h,
      rainfall48h: Math.round(rainfall24h * 1.35),
      rainfall72h,
      rainfallIntensity: rainfall1h,
      soilMoisture,
      soilType: 'Weathered Silty Sandstone & Metamorphic Regolith',
      slope,
      elevation,
      groundMovement,
      waterLevel,
      historicalEventsCount: historicalIncidents,
      recentReportsCount: (hasTensionCracks ? 2 : 0) + (hasWaterSeepage ? 2 : 0),
      hasVisibleCracks: hasTensionCracks,
      hasWaterSeepage,
      hasSoilMovement: groundMovement > 2.0,
      hasRoadDamage: groundMovement > 3.0,
    };
  }, [
    rainfall1h,
    rainfall6h,
    rainfall24h,
    rainfall72h,
    soilMoisture,
    slope,
    elevation,
    groundMovement,
    waterLevel,
    historicalIncidents,
    hasTensionCracks,
    hasWaterSeepage,
  ]);

  const activeModel = aiPredictionService.getActiveModel();
  const prediction: AIPredictionResult = useMemo(() => {
    return activeModel.predict(simulatedVector, {
      locationName: 'Analytical Workspace Custom Vector',
      state: 'Regional Hill Corridor',
    });
  }, [activeModel, simulatedVector]);

  // Presets
  const applyPreset = (type: 'sih' | 'normal' | 'moderate') => {
    if (type === 'sih') {
      // SIH Test Scenario: Very High Risk
      setRainfall1h(28.0);
      setRainfall6h(85.0);
      setRainfall24h(195.0);
      setRainfall72h(340.0);
      setSoilMoisture(94.0);
      setSlope(48);
      setElevation(1420);
      setGroundMovement(6.8);
      setWaterLevel(82.0);
      setHistoricalIncidents(18);
      setHasTensionCracks(true);
      setHasWaterSeepage(true);
    } else if (type === 'normal') {
      setRainfall1h(1.2);
      setRainfall6h(4.5);
      setRainfall24h(14.0);
      setRainfall72h(28.0);
      setSoilMoisture(38.0);
      setSlope(24);
      setElevation(800);
      setGroundMovement(0.2);
      setWaterLevel(15.0);
      setHistoricalIncidents(2);
      setHasTensionCracks(false);
      setHasWaterSeepage(false);
    } else {
      setRainfall1h(8.0);
      setRainfall6h(28.0);
      setRainfall24h(65.0);
      setRainfall72h(110.0);
      setSoilMoisture(64.0);
      setSlope(34);
      setElevation(1100);
      setGroundMovement(1.2);
      setWaterLevel(42.0);
      setHistoricalIncidents(6);
      setHasTensionCracks(false);
      setHasWaterSeepage(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Machine Learning Susceptibility Engine
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600 font-mono font-medium">Model: RF-Ensemble v2.4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              AI Landslide Risk Prediction &amp; Analytical Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              14-feature multi-hazard classifier estimating slope failure probability for disaster decision support.
            </p>
          </div>

          {/* Model Status Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500">Validation F1: </span>
              <span className="font-bold text-slate-900">94.2%</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500">Trees: </span>
              <span className="font-bold text-slate-900">100 Estimators</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500">Inference Latency: </span>
              <span className="font-bold text-emerald-700">12 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Analytical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Input Parameters (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>Geotechnical &amp; Hydrological Input Parameters</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Adjust parameters to evaluate landslide susceptibility under varying storm regimes
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => applyPreset('sih')}
                className="px-2.5 py-1 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer"
                title="Rainfall: High, Soil Moisture: High, Slope: Steep, Movement: High"
              >
                Test: Extreme Surcharge
              </button>
              <button
                onClick={() => applyPreset('normal')}
                className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Normal Baseline
              </button>
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-4">
            {/* Rainfall 24h */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Rainfall (24-Hour Surcharge):</span>
                <span className="font-mono font-bold text-slate-900">{rainfall24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={rainfall24h}
                onChange={(e) => setRainfall24h(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0mm (Dry)</span>
                <span>120mm (Hazard Threshold)</span>
                <span>250mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Soil Moisture (Volumetric Saturation):</span>
                <span className="font-mono font-bold text-slate-900">{soilMoisture}% VWC</span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                step="1"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20% (Drainage)</span>
                <span>70% (Field Capacity)</span>
                <span>95% (Full Liquefaction)</span>
              </div>
            </div>

            {/* Slope Gradient */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Slope Gradient:</span>
                <span className="font-mono font-bold text-slate-900">{slope}° Angle</span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                step="1"
                value={slope}
                onChange={(e) => setSlope(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>15° (Stable Valley)</span>
                <span>35° (Critical Angle)</span>
                <span>65° (Shear Cliff)</span>
              </div>
            </div>

            {/* Elevation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Elevation:</span>
                <span className="font-mono font-bold text-slate-900">{elevation} m ASL</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>200m (Foothills)</span>
                <span>1200m (Mid-Hill Range)</span>
                <span>2500m (High Ridge)</span>
              </div>
            </div>

            {/* Ground Movement */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Ground Movement (Inclinometer Rate):</span>
                <span className="font-mono font-bold text-red-600">{groundMovement} mm/day</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={groundMovement}
                onChange={(e) => setGroundMovement(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.1 mm/d (Stationary)</span>
                <span>2.0 mm/d (Active Creep)</span>
                <span>8.0+ mm/d (Impending Failure)</span>
              </div>
            </div>

            {/* Water Level / Pore Pressure */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Water Table / Pore Pressure:</span>
                <span className="font-mono font-bold text-slate-900">{waterLevel} kPa</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={waterLevel}
                onChange={(e) => setWaterLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10 kPa (Normal Hydrostatic)</span>
                <span>50 kPa (Elevated Pressure)</span>
                <span>90+ kPa (Basal Uplift)</span>
              </div>
            </div>

            {/* Historical Incidents */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Historical Failure Frequency:</span>
                <span className="font-mono font-bold text-slate-900">{historicalIncidents} Recorded Events</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={historicalIncidents}
                onChange={(e) => setHistoricalIncidents(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            {/* Field Hazard Toggles */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={hasTensionCracks}
                  onChange={(e) => setHasTensionCracks(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Visible Crown Tension Cracks</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={hasWaterSeepage}
                  onChange={(e) => setHasWaterSeepage(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span>Active Toe Spring Seepage</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Prediction Result (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-red-600" />
              <span>Inference Result</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Evaluated probability &amp; hazard classification
            </p>
          </div>

          {/* Clean Probability Display */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Estimated Failure Probability
              </div>
              <div className="text-4xl font-extrabold font-mono text-slate-900 mt-1">
                {prediction.riskProbability}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Data Quality: {prediction.dataQuality}
              </div>
            </div>

            <div className="text-right">
              <RiskBadge level={prediction.riskLevel} size="lg" variant="solid" />
              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {prediction.timestamp.split(' ')[1] || 'Just computed'}
              </div>
            </div>
          </div>

          {/* Clean Segmented Probability Visualization */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Risk Severity Spectrum</span>
              <span>{prediction.riskLevel.toUpperCase()} LEVEL</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: '25%' }} className="bg-emerald-500/30 h-full border-r border-white" />
              <div style={{ width: '25%' }} className="bg-amber-500/30 h-full border-r border-white" />
              <div style={{ width: '25%' }} className="bg-orange-500/30 h-full border-r border-white" />
              <div style={{ width: '25%' }} className="bg-red-500/30 h-full" />
            </div>
            <div className="relative">
              <div
                style={{ left: `${Math.min(prediction.riskProbability ?? 0, 98)}%` }}
                className="absolute -top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-sm -translate-x-1/2"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>Low (0-24%)</span>
              <span>Mod (25-49%)</span>
              <span>High (50-74%)</span>
              <span>Crit (75-100%)</span>
            </div>
          </div>

          {/* Risk Contributors Table */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-900">Primary Risk Contributors</div>
            <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Factor</th>
                    <th className="py-2 px-3">Condition</th>
                    <th className="py-2 px-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-medium">Rainfall</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{rainfall24h} mm/24h</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={rainfall24h > 120 ? 'text-red-600' : 'text-slate-600'}>
                        {rainfall24h > 150 ? 'High' : rainfall24h > 90 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Soil Moisture</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{soilMoisture}% VWC</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={soilMoisture > 75 ? 'text-red-600' : 'text-slate-600'}>
                        {soilMoisture > 80 ? 'High' : soilMoisture > 60 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Slope Gradient</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{slope}°</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={slope > 40 ? 'text-red-600' : 'text-slate-600'}>
                        {slope > 42 ? 'High' : slope > 30 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Ground Movement</td>
                    <td className="py-2 px-3 text-slate-600 font-mono">{groundMovement} mm/d</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={groundMovement > 2.5 ? 'text-red-600' : 'text-slate-600'}>
                        {groundMovement > 4.0 ? 'High' : groundMovement > 1.5 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistical Disclaimer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-snug">
            <span className="font-semibold text-slate-800 block">Notice:</span>
            {prediction.disclaimer}
          </div>
        </div>
      </div>

      {/* 3. NER Monitored Sectors AI Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              North Eastern Region Hotspots — Automated Inferences
            </h3>
            <p className="text-[11px] text-slate-500">
              Live automated model outputs across all currently monitored hill sectors
            </p>
          </div>
          <span className="text-xs text-slate-500">8 Sectors Streaming</span>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/60">
                <th className="py-2 px-3">Sector</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Predicted Probability</th>
                <th className="py-2 px-3">Risk Level</th>
                <th className="py-2 px-3">Primary Trigger</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{loc.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{loc.state}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {loc.riskProbability}%
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={loc.riskLevel} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-xs">
                    {loc.rainfall24h > 100
                      ? 'Precipitation surcharge & high pore saturation'
                      : 'Stable drainage under seasonal limits'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigateToLocation(loc.id)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
