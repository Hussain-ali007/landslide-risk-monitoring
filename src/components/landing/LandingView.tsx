import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Activity,
  CloudRain,
  Map,
  Send,
  Sliders,
  CheckCircle,
  Sparkles,
  Layers,
  AlertTriangle,
  Users,
  Brain,
} from 'lucide-react';
import { MonitoredLocation } from '../../types';

interface LandingViewProps {
  locations: MonitoredLocation[];
  onNavigate: (tab: string) => void;
  onSimulateHighRisk: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  locations,
  onNavigate,
  onSimulateHighRisk,
}) => {
  const criticalCount = locations.filter((l) => l.riskLevel === 'critical').length;
  const highCount = locations.filter((l) => l.riskLevel === 'high').length;
  const modCount = locations.filter((l) => l.riskLevel === 'moderate').length;
  const lowCount = locations.filter((l) => l.riskLevel === 'low').length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 border-b border-slate-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_20%,rgba(245,158,11,0.12),rgba(15,23,42,0))]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart India Hackathon (SIH) · Disaster Management &amp; Early Warning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
            AI-Based Early Warning &amp; Landslide Risk Monitoring System
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 mt-2">
              North Eastern Region (NER)
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            An integrated decision-support platform fusing real-time rainfall thresholds, geotechnical sensor telemetry (inclinometers &amp; piezometers), terrain slope analysis, and crowd-sourced ground verification for rapid disaster mitigation.
          </p>

          {/* Key CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Enter Authority Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-amber-400" />
              <span>Explore Interactive NER Map</span>
            </button>

            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-semibold text-sm border border-emerald-600/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Submit Citizen Hazard Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Status Metric Summary Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Monitored Corridors
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {locations.length} Hotspots
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across 8 NER States</div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50">
            <div className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold mb-1">
              Critical Risk
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount} Nodes</div>
            <div className="text-[11px] text-rose-400/80 mt-1">SDRF teams on alert</div>
          </div>

          <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-900/50">
            <div className="text-[11px] uppercase tracking-wider text-orange-400 font-semibold mb-1">
              High Risk
            </div>
            <div className="text-2xl font-bold font-mono text-orange-400">{highCount} Nodes</div>
            <div className="text-[11px] text-orange-400/80 mt-1">Elevated rainfall surcharge</div>
          </div>

          <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-900/50">
            <div className="text-[11px] uppercase tracking-wider text-yellow-400 font-semibold mb-1">
              Moderate Risk
            </div>
            <div className="text-2xl font-bold font-mono text-yellow-400">{modCount} Nodes</div>
            <div className="text-[11px] text-yellow-400/80 mt-1">Continuous sensor watch</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 col-span-2 md:col-span-1">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              Low Risk
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{lowCount} Nodes</div>
            <div className="text-[11px] text-emerald-400/80 mt-1">Normal slope drainage</div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Modular Disaster Decision-Support Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured for seamless expansion into AI prediction engines, IoT sensor hardware, and live IMD APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => onNavigate('ai-predictions')}
            className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-900/90 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer group shadow-lg shadow-amber-500/5"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              AI Risk Prediction &amp; What-If
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular ensemble classifier predicting landslide hazard probability (0–100%) from 14 hydrologic and kinematic inputs with real-time test scenario runner.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Run AI Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('weather')}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CloudRain className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              Precipitation Threshold Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors 1h, 6h, 24h, 48h, and 72h rainfall accumulations alongside Antecedent Soil Moisture Indices (ASI) to detect saturation surcharges.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400">
              <span>View Weather Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('sensors')}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              Geotechnical IoT Sensor Array
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects in-situ borehole inclinometers, vibrating-wire piezometers, and TDR soil moisture probes transmitting over LoRaWAN and 4G.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span>Inspect Sensor Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('report')}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">
              Crowd-Sourced Field Hazard Reports
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowers citizens and highway patrols to report ground fissures, spring seepage, road slumps, and debris movement with unique tracking IDs.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Open Reporting Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Role-Based User Access Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Multi-Role Operational Personas</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Phase 1 supports 4 tailored operational views with dedicated authority controls.
              </p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors self-start md:self-auto cursor-pointer"
            >
              Switch Role in Login Portal →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-purple-300 mb-1">1. Authority</div>
              <div className="text-sm font-semibold text-slate-200">SDMA / NDMA Command</div>
              <div className="text-xs text-slate-400 mt-2">
                Evaluates regional hazard indices, issues public evacuation orders, and elevates alerts to formal incidents.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-blue-300 mb-1">2. Field Officer</div>
              <div className="text-sm font-semibold text-slate-200">SDRF &amp; Border Roads</div>
              <div className="text-xs text-slate-400 mt-2">
                Dispatched to investigate tension cracks, verifies citizen reports, updates field logs, and coordinates roadblock diversions.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-emerald-300 mb-1">3. Public / Reporter</div>
              <div className="text-sm font-semibold text-slate-200">Citizen &amp; Commuter</div>
              <div className="text-xs text-slate-400 mt-2">
                Submits geolocated photo observations of cracks, seepage, and rock falls; accesses public travel safety advisories.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs font-bold text-rose-300 mb-1">4. Administrator</div>
              <div className="text-sm font-semibold text-slate-200">Systems &amp; Data Admin</div>
              <div className="text-xs text-slate-400 mt-2">
                Configures rainfall and displacement thresholds, monitors sensor node battery health, and audits incident workflows.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstration Trigger Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Test the Emergency Early Warning Simulation
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Clicking this button injects simulated cloudburst rainfall (110mm+), saturates soil moisture (&gt;88%), spikes inclinometer shear rates, generates an urgent alert, and escalates to an active incident for authority review.
              </p>
            </div>
          </div>

          <button
            onClick={onSimulateHighRisk}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            SIMULATE HIGH-RISK EVENT
          </button>
        </div>
      </section>
    </div>
  );
};
