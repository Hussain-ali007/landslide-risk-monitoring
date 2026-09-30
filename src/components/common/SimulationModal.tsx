import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Play,
  RefreshCw,
  CheckCircle2,
  CloudRain,
  Droplets,
  Activity,
  Brain,
  Bell,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { MonitoredLocation } from '../../types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: MonitoredLocation[];
  onRunSimulation: (
    locationId: string,
    customValues?: { rainfall: number; soilMoisture: number; groundMovement: number }
  ) => void;
  onResetData: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  locations,
  onRunSimulation,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || 'LOC-MZ-05');
  const [rainfall, setRainfall] = useState<number>(185);
  const [soilMoisture, setSoilMoisture] = useState<number>(94);
  const [groundMovement, setGroundMovement] = useState<number>(6.8);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const selectedLoc = locations.find((l) => l.id === selectedLocId) || locations[0];

  const simulationSteps = [
    { title: '1. Increase simulated rainfall', detail: `Raising 24h accumulation to ${rainfall} mm (Torrential)` },
    { title: '2. Increase simulated soil moisture', detail: `Raising volumetric saturation to ${soilMoisture}% VWC` },
    { title: '3. Increase simulated ground movement', detail: `Raising inclinometer displacement to ${groundMovement} mm/d` },
    { title: '4. Run the risk calculation', detail: 'Executing AI Geotechnical Hazard Assessment Engine' },
    { title: '5. Show risk probability increasing', detail: `Escalating risk probability from ${selectedLoc?.riskProbability || 45}% to 94%+` },
    { title: '6. Change risk level accordingly', detail: 'Transitioning status from current level to CRITICAL' },
    { title: '7. Create simulated high-risk alert', detail: 'Registering urgent alert tagged as SIMULATED' },
    { title: '8. Create authority notification', detail: 'Broadcasting in-app emergency alert dispatch' },
    { title: '9. Directing to Alerts section', detail: 'Ready for authority acknowledgement & incident creation' },
  ];

  const handleExecute = () => {
    setSimRunning(true);
    setActiveStep(1);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < simulationSteps.length) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 280);

    setTimeout(() => {
      clearInterval(stepInterval);
      onRunSimulation(selectedLocId, {
        rainfall,
        soilMoisture,
        groundMovement,
      });
      setTimeout(() => {
        setSimRunning(false);
        setActiveStep(0);
        onClose();
      }, 500);
    }, 280 * simulationSteps.length + 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">SIMULATE HIGH-RISK EVENT</h3>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-400 text-slate-950">
                  DEMO / SIMULATED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Early warning validation protocol • Clearly isolated from real-world disaster data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={simRunning}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* SIMULATION MODE Clear Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                Simulation Mode Notice
              </span>
              <p className="text-amber-800 leading-snug">
                This is strictly a demonstration feature. All telemetry spikes, generated alerts, and notifications are unmistakably labelled as <strong>SIMULATED</strong> and will not contaminate real operations.
              </p>
            </div>
          </div>

          {simRunning ? (
            /* Live Step-by-Step Simulation Progress */
            <div className="space-y-4 py-2 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span>Executing High-Risk Simulation Pipeline</span>
                </div>
                <div className="text-xs text-slate-500">
                  Applying geotechnical surcharge to {selectedLoc?.name}...
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                {simulationSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = activeStep > stepNum;
                  const isCurrent = activeStep === stepNum;

                  return (
                    <div
                      key={step.title}
                      className={`pt-2 first:pt-0 flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'text-blue-900 font-bold'
                          : isDone
                          ? 'text-emerald-800'
                          : 'text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0 flex items-center justify-center text-[10px] text-slate-400">
                            {stepNum}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{step.title}</div>
                          <div className="text-[11px] opacity-80">{step.detail}</div>
                        </div>
                      </div>

                      {isDone && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Parameters Configuration Form */
            <>
              {/* Target Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Target Sector for High-Risk Surcharge:
                </label>
                <select
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.state}) — Current Baseline: {loc.riskProbability}% Risk ({loc.riskLevel.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Environmental Parameters Slider */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Simulated Parameters (High-Risk Thresholds)</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Preset: Severe Surcharge
                  </span>
                </div>

                {/* Rainfall */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                      <span>1. Simulated Rainfall (24h Accumulation):</span>
                    </span>
                    <span className="font-mono font-bold text-red-600 text-sm">{rainfall} mm</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="5"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50mm (Normal)</span>
                    <span>120mm (Warning)</span>
                    <span>200mm+ (Extreme Torrential)</span>
                  </div>
                </div>

                {/* Soil Moisture */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>2. Simulated Soil Moisture (Saturation):</span>
                    </span>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {soilMoisture}% VWC
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="98"
                    step="1"
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>40% (Safe)</span>
                    <span>75% (Field Capacity)</span>
                    <span>90%+ (Liquefaction)</span>
                  </div>
                </div>

                {/* Ground Movement */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>3. Simulated Ground Movement (Rate):</span>
                    </span>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {groundMovement} mm/d
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.1"
                    value={groundMovement}
                    onChange={(e) => setGroundMovement(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.5 mm/d (Stable)</span>
                    <span>2.0 mm/d (Active Creep)</span>
                    <span>6.0+ mm/d (Impending Failure)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onResetData();
              onClose();
            }}
            disabled={simRunning}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={simRunning}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={simRunning}
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {simRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Simulating Event...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>SIMULATE HIGH-RISK EVENT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
