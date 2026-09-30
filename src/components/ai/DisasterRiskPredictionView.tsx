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
  Activity,
  CloudRain,
  Wind,
  Thermometer,
  Compass,
  History,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Save,
  Check,
} from 'lucide-react';
import {
  MonitoredLocation,
  AIPredictionResult,
  GeneralDisasterFeatureVector,
  PredictionHistoryRecord,
  RiskLevel,
  WeatherRecord,
  SensorRecord,
  User,
} from '../../types';
import { aiPredictionService } from '../../services/aiPredictionService';
import { store } from '../../services/storageService';
import { RiskBadge } from '../common/RiskBadge';

interface DisasterRiskPredictionViewProps {
  locations: MonitoredLocation[];
  weather: WeatherRecord[];
  sensors: SensorRecord[];
  currentUser: User;
  onNavigateToLocation?: (locId: string) => void;
  onNavigateToMap?: (locId?: string) => void;
}

export const DisasterRiskPredictionView: React.FC<DisasterRiskPredictionViewProps> = ({
  locations,
  weather,
  sensors,
  currentUser,
  onNavigateToLocation,
  onNavigateToMap,
}) => {
  // 1. Hazard Type & Sector Selection
  const [hazardType, setHazardType] = useState<string>('Landslide');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || 'custom');

  // 2. Interactive Input Conditions State (Simulated)
  const [rainfall24h, setRainfall24h] = useState<number>(145.0);
  const [waterLevel, setWaterLevel] = useState<number>(68.0);
  const [soilMoisture, setSoilMoisture] = useState<number>(82.0);
  const [groundMovement, setGroundMovement] = useState<number>(4.2);
  const [windSpeed, setWindSpeed] = useState<number>(42.0);
  const [temperature, setTemperature] = useState<number>(24.0);
  const [historicalActivity, setHistoricalActivity] = useState<number>(12);
  const [slope, setSlope] = useState<number>(42);

  // Missing data / telemetry age controls
  const [isMissingData, setIsMissingData] = useState<boolean>(false);
  const [dataAgeHours, setDataAgeHours] = useState<number>(2);

  // Prediction History state
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryRecord[]>(
    store.getPredictionHistory()
  );
  const [historyFilterHazard, setHistoryFilterHazard] = useState<string>('ALL');
  const [historyFilterLevel, setHistoryFilterLevel] = useState<string>('ALL');
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // When a location is selected, load its initial telemetry as simulated parameters
  const handleLocationChange = (locId: string) => {
    setSelectedLocationId(locId);
    if (locId !== 'custom') {
      const loc = locations.find((l) => l.id === locId);
      const w = weather.find((w) => w.locationId === locId);
      if (loc) {
        setRainfall24h(loc.rainfall24h);
        setSoilMoisture(loc.soilMoisture);
        setGroundMovement(loc.groundMovementRate);
        setSlope(loc.slope);
        setHistoricalActivity(loc.historicalEventsCount);
        setWaterLevel(loc.poreWaterPressure);
        if (w) {
          setWindSpeed(w.windSpeed);
          setTemperature(w.temperature);
        }
        setIsMissingData(false);
        setDataAgeHours(1);
      }
    }
  };

  // Compile General Feature Vector
  const currentVector: GeneralDisasterFeatureVector = useMemo(() => {
    return {
      hazardType,
      rainfall24h,
      waterLevel,
      soilMoisture,
      groundMovement,
      windSpeed,
      temperature,
      historicalActivity,
      slope,
      isMissingData,
      dataAgeHours,
      isSimulated: true, // Clearly labeled simulated
    };
  }, [
    hazardType,
    rainfall24h,
    waterLevel,
    soilMoisture,
    groundMovement,
    windSpeed,
    temperature,
    historicalActivity,
    slope,
    isMissingData,
    dataAgeHours,
  ]);

  // Current selected location object or custom metadata
  const currentLocation = useMemo(() => {
    if (selectedLocationId === 'custom') {
      return {
        id: 'LOC-CUSTOM',
        name: 'Custom Analytical Testing Sector',
        state: 'Regional Terrain',
      };
    }
    return locations.find((l) => l.id === selectedLocationId) || locations[0];
  }, [locations, selectedLocationId]);

  // Calculate Risk Prediction
  const prediction: AIPredictionResult = useMemo(() => {
    return aiPredictionService.predictGeneralDisasterRisk(currentVector, {
      locationId: currentLocation.id,
      locationName: currentLocation.name,
      state: currentLocation.state,
    });
  }, [currentVector, currentLocation]);

  // Presets applicator
  const applyPreset = (presetIndex: number) => {
    const presets = aiPredictionService.getGeneralDisasterTestPresets();
    const p = presets[presetIndex];
    if (p) {
      setHazardType(p.features.hazardType);
      setRainfall24h(p.features.rainfall24h);
      setWaterLevel(p.features.waterLevel);
      setSoilMoisture(p.features.soilMoisture);
      setGroundMovement(p.features.groundMovement);
      setWindSpeed(p.features.windSpeed);
      setTemperature(p.features.temperature);
      setHistoricalActivity(p.features.historicalActivity);
      if (p.features.slope !== undefined) setSlope(p.features.slope);
      setIsMissingData(p.features.isMissingData || false);
      setDataAgeHours(p.features.dataAgeHours || 1);
    }
  };

  // Save current prediction to persistent history
  const handleSaveToHistory = () => {
    const newRecord: PredictionHistoryRecord = {
      prediction_id: prediction.predictionId || `PRED-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      location: `${currentLocation.name} (${currentLocation.state})`,
      hazard_type: hazardType,
      probability: prediction.riskProbability,
      risk_level: prediction.riskLevel,
      contributing_factors: prediction.contributingFactors,
      timestamp: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      model_version: prediction.modelVersion,
      data_quality: prediction.dataQuality,
      isSimulated: true,
      explanationSummary: prediction.whyThisRisk.summary,
    };

    store.addPredictionToHistory(newRecord);
    setPredictionHistory(store.getPredictionHistory());
    setSaveSuccessMsg(`Prediction saved to history (ID: ${newRecord.prediction_id})`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Filtered prediction history
  const filteredHistory = useMemo(() => {
    return predictionHistory.filter((item) => {
      const matchHazard =
        historyFilterHazard === 'ALL' ||
        item.hazard_type.toLowerCase() === historyFilterHazard.toLowerCase();
      const matchLevel =
        historyFilterLevel === 'ALL' || item.risk_level === historyFilterLevel;
      return matchHazard && matchLevel;
    });
  }, [predictionHistory, historyFilterHazard, historyFilterLevel]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Model Transparency */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                Multi-Hazard Predictive Engine
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                Model: NER-MultiHazard-v2.6
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Simulated Test Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Disaster Risk Prediction
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Probabilistic multi-factor risk estimation across geophysical and hydro-meteorological hazards.
              Supports general disaster-risk monitoring with landslide as a core supported hazard type.
            </p>
          </div>

          {/* Model Transparency Mandatory Notice */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 max-w-md shrink-0 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
              <Shield className="w-4 h-4" />
              <span>Model Transparency Notice</span>
            </div>
            <p className="text-xs font-semibold text-slate-100">
              AI-generated risk estimate — decision support only.
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Probabilistic mathematical estimation. Never claims that a disaster is certain.
              Sensor parameters are simulated for analytical testing.
            </p>
          </div>
        </div>

        {/* 2. Supported Hazard Type & Location Selection Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Hazard Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Disaster Hazard Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'Landslide', label: 'Landslide', desc: 'Slope Failure' },
                { type: 'Flash Flood', label: 'Flash Flood', desc: 'Water Surge' },
                { type: 'Severe Storm', label: 'Severe Storm', desc: 'Gale / Wind' },
                { type: 'Ground Movement', label: 'Ground Movement', desc: 'Subsidence' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setHazardType(item.type)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    hazardType === item.type
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      hazardType === item.type ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Evaluation Location / Sector:
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            >
              <option value="custom">-- Custom Analytical Testing Sector (Manual Inputs) --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.district}, {loc.state}) — {loc.id}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span>Selected: {currentLocation.name}</span>
              {selectedLocationId !== 'custom' && onNavigateToLocation && (
                <button
                  onClick={() => onNavigateToLocation(selectedLocationId)}
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  View Sector Profile →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Two Columns (Left: Input Conditions, Right: Risk Output & Factors) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Condition Adjusters (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Input Conditions &amp; Simulated Telemetry</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust input parameters to observe real-time recalculation of risk probability.
              </p>
            </div>

            {/* Test Scenarios Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
              <select
                onChange={(e) => applyPreset(Number(e.target.value))}
                defaultValue=""
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  Load Test Preset...
                </option>
                <option value="0">Critical Surcharge (High Risk)</option>
                <option value="1">Flash Flood Surge</option>
                <option value="2">Severe Storm Squall</option>
                <option value="3">Subsidence Creep</option>
                <option value="4">Normal Baseline (Low Risk)</option>
                <option value="5">Sensor Outage (Insufficient Data)</option>
                <option value="6">Stale Telemetry (&gt;48h Stale)</option>
              </select>
            </div>
          </div>

          {/* 7 Core Parameter Sliders */}
          <div className="space-y-4">
            {/* Factor 1: Heavy Rainfall */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-600" />
                  <span>Heavy Rainfall (24-Hour Accumulation)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-blue-700 font-extrabold">{rainfall24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="260"
                step="5"
                value={rainfall24h}
                onChange={(e) => setRainfall24h(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0mm (Dry)</span>
                <span>45mm (Moderate)</span>
                <span>100mm (Warning)</span>
                <span>180mm+ (Extreme)</span>
              </div>
            </div>

            {/* Factor 2: Rising Water Level / Pore Pressure */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Rising Water Level / Pore Pressure</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-teal-700 font-extrabold">{waterLevel} kPa / index</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={waterLevel}
                onChange={(e) => setWaterLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 kPa (Low)</span>
                <span>25 kPa (Normal)</span>
                <span>50 kPa (High Surcharge)</span>
                <span>75+ kPa (Critical)</span>
              </div>
            </div>

            {/* Factor 3: High Soil Moisture */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-600" />
                  <span>High Soil Moisture (Volumetric Saturation)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-cyan-700 font-extrabold">{soilMoisture}% VWC</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Dry)</span>
                <span>50% (Normal)</span>
                <span>70% (High Saturation)</span>
                <span>85%+ (Liquefaction)</span>
              </div>
            </div>

            {/* Factor 4: Ground Movement */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>Ground Movement (Inclinometer Displacement Rate)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-red-600 font-extrabold">{groundMovement} mm/day</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="10.0"
                step="0.1"
                value={groundMovement}
                onChange={(e) => setGroundMovement(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 mm/d (Stationary)</span>
                <span>0.8 mm/d (Creep)</span>
                <span>2.5 mm/d (Active Strain)</span>
                <span>5.0+ mm/d (Critical Failure)</span>
              </div>
            </div>

            {/* Factor 5: Strong Wind */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-indigo-600" />
                  <span>Strong Wind (Velocity &amp; Gusts)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-indigo-700 font-extrabold">{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 km/h (Calm)</span>
                <span>40 km/h (Breeze)</span>
                <span>70 km/h (Gale)</span>
                <span>110+ km/h (Storm Squall)</span>
              </div>
            </div>

            {/* Factor 6: Extreme Temperature */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>Extreme Temperature (Atmospheric / Freeze-Thaw)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-amber-700 font-extrabold">{temperature} °C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="48"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-10°C (Frost Wedging)</span>
                <span>20°C (Temperate)</span>
                <span>35°C (Warm)</span>
                <span>45°C+ (Extreme Heatwave)</span>
              </div>
            </div>

            {/* Factor 7: Historical Disaster Activity */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>Historical Disaster Activity (Documented Past Events)</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 text-[10px] font-mono font-normal">
                    Simulated
                  </span>
                </span>
                <span className="font-mono text-purple-700 font-extrabold">
                  {historicalActivity} Recorded Events
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={historicalActivity}
                onChange={(e) => setHistoricalActivity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (No history)</span>
                <span>4 (Low)</span>
                <span>9 (Moderate)</span>
                <span>16+ (Chronic Hotspot)</span>
              </div>
            </div>

            {/* Landslide-Specific Slope Parameter */}
            {hazardType === 'Landslide' && (
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>Slope Gradient (Degrees)</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-normal">
                      Landslide Specific
                    </span>
                  </span>
                  <span className="font-mono text-blue-700 font-extrabold">{slope}° Angle</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={slope}
                  onChange={(e) => setSlope(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>15° (Valley)</span>
                  <span>35° (Threshold Angle)</span>
                  <span>50° (Steep Ridge)</span>
                  <span>65° (Cliff)</span>
                </div>
              </div>
            )}
          </div>

          {/* Quality & Freshness Testing Toggles */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Data Quality &amp; Telemetry Freshness Testing:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Toggle Missing Data */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={isMissingData}
                  onChange={(e) => setIsMissingData(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Simulate Missing Data</div>
                  <div className="text-[11px] text-slate-500">Triggers "Insufficient Data" status</div>
                </div>
              </label>

              {/* Stale Telemetry Age Slider */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">Telemetry Age:</span>
                  <span className={`font-mono ${dataAgeHours > 48 ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                    {dataAgeHours} hours {dataAgeHours > 48 ? '(Stale >48h)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="72"
                  step="1"
                  value={dataAgeHours}
                  onChange={(e) => setDataAgeHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1h (Live)</span>
                  <span>48h Limit</span>
                  <span>72h (Expired)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Calculated Risk Output & "Why this risk?" (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Risk Prediction Score Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Calculated Hazard Output
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>{hazardType} Risk Estimate</span>
                </h2>
              </div>
              <RiskBadge level={prediction.riskLevel} size="lg" variant="solid" />
            </div>

            {/* Probability Gauge Display */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Risk Probability
                </div>
                {prediction.riskProbability !== null ? (
                  <div className="text-5xl font-black font-mono text-slate-900 mt-1">
                    {prediction.riskProbability}%
                  </div>
                ) : (
                  <div className="text-2xl font-bold font-mono text-slate-600 mt-1">
                    Insufficient Data
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Quality: {prediction.dataQuality}</span>
                </div>
              </div>

              {/* Classification Summary */}
              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Risk Classification
                </div>
                <div className="text-lg font-black uppercase text-slate-800">
                  {prediction.riskLevel.replace('_', ' ')}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {prediction.timestamp.split('(')[0] || 'Just computed'}
                </div>
              </div>
            </div>

            {/* Strict Band Visualizer: 0-24 Low, 25-49 Mod, 50-74 High, 75-100 Crit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Classification Spectrum</span>
                <span className="font-bold text-slate-900">
                  {prediction.riskProbability !== null ? `${prediction.riskProbability}%` : 'Data Unavailable'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: '25%' }} className="bg-emerald-500/40 h-full border-r border-white" title="0-24% Low" />
                <div style={{ width: '25%' }} className="bg-amber-500/40 h-full border-r border-white" title="25-49% Moderate" />
                <div style={{ width: '25%' }} className="bg-orange-500/40 h-full border-r border-white" title="50-74% High" />
                <div style={{ width: '25%' }} className="bg-red-500/40 h-full" title="75-100% Critical" />
              </div>
              {prediction.riskProbability !== null && (
                <div className="relative">
                  <div
                    style={{ left: `${Math.min(prediction.riskProbability, 98)}%` }}
                    className="absolute -top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-md -translate-x-1/2"
                  />
                </div>
              )}
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Low (0-24%)</span>
                <span>Mod (25-49%)</span>
                <span>High (50-74%)</span>
                <span>Crit (75-100%)</span>
              </div>
            </div>

            {/* Model Transparency Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-snug">
              <span className="font-bold text-slate-800 block">Notice:</span>
              {prediction.disclaimer}
            </div>

            {/* Save to Prediction History Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveToHistory}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Prediction to History</span>
              </button>
              {saveSuccessMsg && (
                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. "WHY THIS RISK?" SECTION (3 to 5 Top Contributing Factors) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Why This Risk?</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  Top Contributing Factors
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {prediction.whyThisRisk.summary}
              </p>
            </div>

            {/* 3-5 Ranked Contributing Factors */}
            <div className="space-y-3">
              {prediction.contributingFactors.map((factor, idx) => (
                <div
                  key={factor.id || idx}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{factor.name}</span>
                    </span>
                    <span className="font-mono text-blue-600 font-extrabold">
                      {factor.impactPercentage}% Impact
                    </span>
                  </div>

                  {/* Factor Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(factor.impactPercentage * 2.5, 100)}%` }}
                      className={`h-full rounded-full ${
                        factor.severity === 'critical'
                          ? 'bg-red-500'
                          : factor.severity === 'high'
                          ? 'bg-orange-500'
                          : factor.severity === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Observed: <strong className="text-slate-700 font-mono">{factor.actualValue}</strong></span>
                    <span>Threshold: {factor.thresholdOrNorm}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 leading-snug">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Mechanical Attribution Note */}
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-blue-900 block">Mechanism Summary:</span>
              <p className="text-[11px] leading-relaxed">
                {prediction.whyThisRisk.geotechnicalMechanics}
              </p>
              <div className="pt-1 text-[11px] text-blue-800">
                <strong>Recommended Mitigation:</strong> {prediction.whyThisRisk.recommendedMitigation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PREDICTION HISTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Prediction History Log</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical hazard inferences stored with unique prediction IDs, timestamps, and contributing factors.
            </p>
          </div>

          {/* History Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Hazard:</span>
              <select
                value={historyFilterHazard}
                onChange={(e) => setHistoryFilterHazard(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                <option value="ALL">All Hazards</option>
                <option value="Landslide">Landslide</option>
                <option value="Flash Flood">Flash Flood</option>
                <option value="Severe Storm">Severe Storm</option>
                <option value="Ground Movement">Ground Movement</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Risk Level:</span>
              <select
                value={historyFilterLevel}
                onChange={(e) => setHistoryFilterLevel(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High Risk</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low Risk</option>
                <option value="insufficient_data">Insufficient Data</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prediction History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-3">Prediction ID</th>
                <th className="py-3 px-3">Hazard Type</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Probability</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Data Quality</th>
                <th className="py-3 px-3 text-right">Factors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No prediction records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isExpanded = expandedHistoryId === item.prediction_id;
                  return (
                    <React.Fragment key={item.prediction_id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">
                          {item.prediction_id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                            {item.hazard_type}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                          {item.location}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {item.probability !== null ? `${item.probability}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={item.risk_level} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {item.timestamp}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <span className="truncate block max-w-[150px]">{item.data_quality}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() =>
                              setExpandedHistoryId(isExpanded ? null : item.prediction_id)
                            }
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Factors'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Contributing Factors Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={8} className="p-4">
                            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                <span>
                                  Contributing Factors for {item.prediction_id} ({item.hazard_type})
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">
                                  Model: {item.model_version}
                                </span>
                              </div>

                              {item.explanationSummary && (
                                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                  "{item.explanationSummary}"
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {item.contributing_factors.map((f, fIdx) => (
                                  <div
                                    key={f.id || fIdx}
                                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                                  >
                                    <div className="flex justify-between font-bold text-slate-800">
                                      <span>{f.name}</span>
                                      <span className="font-mono text-blue-600">
                                        {f.impactPercentage}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex justify-between">
                                      <span>Value: {f.actualValue}</span>
                                      <span className="uppercase text-[10px] font-bold text-slate-600">
                                        {f.severity}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-snug">
                                      {f.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
