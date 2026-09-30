import React, { useState, useMemo } from 'react';
import {
  MapPin,
  AlertTriangle,
  CloudRain,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Shield,
  Send,
  Droplets,
  Brain,
  Bell,
  Zap,
  Radio,
  Eye,
  Check,
  Compass,
} from 'lucide-react';
import {
  MonitoredLocation,
  Alert,
  Incident,
  CitizenReport,
  SensorRecord,
  WeatherRecord,
  User,
  AuthorityNotification,
} from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { NerRiskMap } from '../map/NerRiskMap';

interface AuthorityDashboardProps {
  locations: MonitoredLocation[];
  alerts: Alert[];
  incidents: Incident[];
  reports: CitizenReport[];
  sensors: SensorRecord[];
  weather: WeatherRecord[];
  currentUser: User;
  notifications?: AuthorityNotification[];
  onNavigate: (tab: string, locationId?: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onCreateIncidentFromAlert: (alertId: string) => void;
  onVerifyReport: (reportId: string) => void;
  onSimulateHighRisk: () => void;
  onViewNotificationReport?: (reportId: string) => void;
  onMarkNotificationRead?: (id: string) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  locations,
  alerts,
  incidents,
  reports,
  sensors,
  weather,
  currentUser,
  notifications = [],
  onNavigate,
  onAcknowledgeAlert,
  onCreateIncidentFromAlert,
  onVerifyReport,
  onSimulateHighRisk,
  onViewNotificationReport,
  onMarkNotificationRead,
}) => {
  const isAuthority =
    currentUser.role === 'authority' ||
    currentUser.role === 'field_officer' ||
    currentUser.role === 'admin';

  // Active alerts sorted by urgency
  const activeAlerts = useMemo(() => {
    return alerts
      .filter((a) => a.status === 'active')
      .sort((a, b) => {
        const order: Record<string, number> = {
          critical: 0,
          high: 1,
          moderate: 2,
          low: 3,
          insufficient_data: 4,
        };
        return (order[a.riskLevel] ?? 5) - (order[b.riskLevel] ?? 5);
      });
  }, [alerts]);

  // Overall regional risk determination
  const hasCritical = locations.some((l) => l.riskLevel === 'critical');
  const hasHigh = locations.some((l) => l.riskLevel === 'high');
  const regionalRiskLevel = hasCritical
    ? 'CRITICAL RISK'
    : hasHigh
    ? 'HIGH RISK'
    : 'MODERATE RISK';

  const regionalRiskColor = hasCritical
    ? 'text-red-400'
    : hasHigh
    ? 'text-orange-400'
    : 'text-amber-300';

  const regionalRiskBadgeClass = hasCritical
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : hasHigh
    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    : 'bg-amber-500/20 text-amber-300 border-amber-400/30';

  // Risk summary counts
  const riskCounts = useMemo(() => {
    const counts = { low: 0, moderate: 0, high: 0, critical: 0 };
    locations.forEach((loc) => {
      if (loc.riskLevel in counts) {
        counts[loc.riskLevel as keyof typeof counts]++;
      }
    });
    return counts;
  }, [locations]);

  // Selected Location for Map Inspector
  const [inspectedLocId, setInspectedLocId] = useState<string>(
    locations.find((l) => l.riskLevel === 'critical')?.id || locations[0]?.id || ''
  );

  const inspectedLocation =
    locations.find((l) => l.id === inspectedLocId) || locations[0];

  // Averages for environmental indicators
  const avgRainfall = Math.round(
    locations.reduce((acc, l) => acc + l.rainfall24h, 0) / (locations.length || 1)
  );
  const avgMoisture = Math.round(
    locations.reduce((acc, l) => acc + l.soilMoisture, 0) / (locations.length || 1)
  );
  const peakMovement = Math.max(
    ...locations.map((l) => l.groundMovementRate || 0),
    0
  );
  const maxRiskProb = Math.max(
    ...locations.map((l) => l.riskProbability || 0),
    0
  );

  // Workflow steps definition
  const workflowSteps = [
    {
      key: 'PREDICT',
      label: 'PREDICT',
      desc: 'AI calculates risk from rainfall, soil saturation, and ground displacement in real-time.',
      icon: Brain,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'WARN',
      label: 'WARN',
      desc: 'Automated early warning alerts issued before geotechnical thresholds are breached.',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      key: 'REPORT',
      label: 'REPORT',
      desc: 'Citizens and field observers submit verified ground hazard reports and photos.',
      icon: Send,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      key: 'RESPOND',
      label: 'RESPOND',
      desc: 'Disaster authorities verify hazards, dispatch field teams, and launch incident workflows.',
      icon: Shield,
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      key: 'RESOLVE',
      label: 'RESOLVE',
      desc: 'Coordinated slope stabilization, community protection, and verified hazard resolution.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* ========================================================
          1. HERO SECTION (Clear, Simple, Modern)
          ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 shadow-xl p-6 sm:p-10 text-white">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Badge & Network Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              North Eastern Region • 8 Monitored Hill States
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5" />
              Live Sensor Telemetry
            </span>
          </div>

          {/* Hero Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI-Based Disaster Risk Monitoring &amp; Early Warning System
            </h1>
            <p className="text-lg sm:text-xl font-medium text-blue-200/90 leading-relaxed">
              Monitor risks. Receive early warnings. Report hazards. Respond faster.
            </p>
          </div>

          {/* One-Sentence Core Explanation */}
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed border-l-2 border-blue-400/80 pl-4 py-0.5">
            AI analyzes multiple data sources to provide early risk estimates and support faster disaster response.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Prominent REPORT A HAZARD Button */}
            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>REPORT A HAZARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Clearly Labelled DEMO Simulation Feature */}
            <button
              onClick={onSimulateHighRisk}
              className="px-4 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Test the complete early warning alert and incident workflow with simulated data"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>SIMULATE HIGH-RISK EVENT</span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                DEMO
              </span>
            </button>

            {/* Quick Map Link */}
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Explore Risk Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          8. SIMPLE WORKFLOW: PREDICT → WARN → REPORT → RESPOND → RESOLVE
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Workflow Architecture
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              PREDICT → WARN → REPORT → RESPOND → RESOLVE
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            End-to-end disaster risk reduction cycle
          </span>
        </div>

        {/* 5-Step Workflow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 relative group hover:border-slate-300 hover:bg-white transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      STEP 0{idx + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">
                    {step.label}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 shadow-2xs">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2 & 3. REGIONAL RISK CARD & RISK SUMMARY (Low, Moderate, High, Critical)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Current Regional Risk Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Regional Risk
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${regionalRiskBadgeClass}`}>
                {regionalRiskLevel}
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span className={regionalRiskColor.replace('text-', 'text-')}>
                  {regionalRiskLevel}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Based on continuous AI synthesis across 8 North Eastern hill states
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {hasCritical
                ? 'Severe antecedent precipitation surcharge detected across vulnerable hill corridors. Immediate precautionary watch active.'
                : hasHigh
                ? 'High rainfall saturation and active slope creep detected in select hill sectors. Field teams alerted.'
                : 'Environmental and geotechnical parameters are currently within moderate operational thresholds across monitored sectors.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Peak Risk Probability:</span>
              <strong className="text-slate-900 font-mono text-sm ml-1.5">{maxRiskProb}%</strong>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Risk Summary: Low, Moderate, High, Critical */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Risk Summary by Category</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of monitored slope sectors across danger tiers
                </p>
              </div>
              <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                {locations.length} Total Sectors
              </span>
            </div>

            {/* Proportional Distribution Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  style={{ width: `${(riskCounts.low / (locations.length || 1)) * 100}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Low: ${riskCounts.low}`}
                />
                <div
                  style={{ width: `${(riskCounts.moderate / (locations.length || 1)) * 100}%` }}
                  className="bg-amber-400 transition-all"
                  title={`Moderate: ${riskCounts.moderate}`}
                />
                <div
                  style={{ width: `${(riskCounts.high / (locations.length || 1)) * 100}%` }}
                  className="bg-orange-500 transition-all"
                  title={`High: ${riskCounts.high}`}
                />
                <div
                  style={{ width: `${(riskCounts.critical / (locations.length || 1)) * 100}%` }}
                  className="bg-red-500 transition-all"
                  title={`Critical: ${riskCounts.critical}`}
                />
              </div>
            </div>

            {/* 4 Cards: Low, Moderate, High, Critical */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Low */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Low
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 font-mono">
                  {riskCounts.low}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Safe Slope</div>
              </div>

              {/* Moderate */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    Moderate
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-950 font-mono">
                  {riskCounts.moderate}
                </div>
                <div className="text-[11px] text-amber-700 font-medium">Elevated Watch</div>
              </div>

              {/* High */}
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wide">
                    High
                  </span>
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                </div>
                <div className="text-2xl font-extrabold text-orange-950 font-mono">
                  {riskCounts.high}
                </div>
                <div className="text-[11px] text-orange-700 font-medium">Precautionary</div>
              </div>

              {/* Critical */}
              <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide">
                    Critical
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="text-2xl font-extrabold text-red-950 font-mono">
                  {riskCounts.critical}
                </div>
                <div className="text-[11px] text-red-700 font-medium">Emergency Alert</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated AI recalculations run upon sensor telemetry pings</span>
            <span className="font-semibold text-slate-700">Updated: Real-time</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. CURRENT ENVIRONMENTAL CONDITIONS
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Real-Time Geotechnical Telemetry
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Current Environmental Conditions
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Aggregated across monitored hill slopes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Rainfall */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-blue-700">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span>Rainfall (24h Avg)</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Precipitation
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {avgRainfall} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {avgRainfall >= 120 ? (
                <span className="text-red-600 font-bold">Cloudburst threshold exceeded (≥ 120mm)</span>
              ) : (
                <span>Threshold: 120 mm / 24h</span>
              )}
            </div>
          </div>

          {/* Metric 2: Soil Moisture */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-blue-700">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Soil Moisture</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Saturation
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {avgMoisture} <span className="text-xs font-normal text-slate-500">% VWC</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {avgMoisture >= 85 ? (
                <span className="text-red-600 font-bold">Near pore liquefaction (&gt;85%)</span>
              ) : (
                <span>Field capacity threshold: 75%</span>
              )}
            </div>
          </div>

          {/* Metric 3: Ground Movement */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-blue-700">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Ground Movement</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Inclinometer
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {peakMovement.toFixed(1)} <span className="text-xs font-normal text-slate-500">mm/d</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {peakMovement >= 5 ? (
                <span className="text-red-600 font-bold">Severe slope shear detected</span>
              ) : (
                <span>Normal stable creep &lt; 2.0 mm/d</span>
              )}
            </div>
          </div>

          {/* Metric 4: AI Risk Assessment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-blue-700">
                <Brain className="w-4 h-4 text-blue-600" />
                <span>AI Risk Assessment</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {maxRiskProb}% <span className="text-xs font-normal text-slate-500">Peak Risk</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Multi-source data fusion operational
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. INTERACTIVE RISK MAP PREVIEW
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Geographic Spatial View
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Interactive Risk Map Preview</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any sector pin to inspect live telemetry and geotechnical slope vulnerability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Full Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map Preview Container */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <NerRiskMap
            locations={locations}
            selectedLocationId={inspectedLocId}
            onSelectLocation={(locId) => setInspectedLocId(locId)}
            onNavigateToDetails={(locId) => onNavigate('location-detail', locId)}
            height="320px"
          />
        </div>

        {/* Inspected Location Summary Pill */}
        {inspectedLocation && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Inspected Sector
              </div>
              <div className="font-extrabold text-slate-900 text-sm">
                {inspectedLocation.name}, {inspectedLocation.state}
              </div>
              <div className="text-slate-600 text-xs flex flex-wrap items-center gap-3">
                <span>Rainfall: <strong className="text-slate-900 font-mono">{inspectedLocation.rainfall24h} mm</strong></span>
                <span>•</span>
                <span>Moisture: <strong className="text-slate-900 font-mono">{inspectedLocation.soilMoisture}%</strong></span>
                <span>•</span>
                <span>Movement: <strong className="text-slate-900 font-mono">{inspectedLocation.groundMovementRate} mm/d</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <RiskBadge level={inspectedLocation.riskLevel} size="md" />
              <button
                onClick={() => onNavigate('location-detail', inspectedLocation.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Sector Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          6. ACTIVE ALERTS
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Active Alerts</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {activeAlerts.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Critical and high-risk threshold warnings requiring immediate attention
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Alerts ({alerts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-slate-800 text-sm">No Active Emergency Alerts</div>
              <div className="mt-0.5">All monitored hill slopes are currently within safe operational limits.</div>
            </div>
          ) : (
            activeAlerts.slice(0, 4).map((alert) => {
              const isCritical = alert.riskLevel === 'critical';
              const isHigh = alert.riskLevel === 'high';

              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    alert.isSimulated
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                      : isCritical
                      ? 'bg-red-50/70 border-red-200 hover:border-red-300'
                      : isHigh
                      ? 'bg-orange-50/70 border-orange-200 hover:border-orange-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <RiskBadge level={alert.riskLevel} size="sm" />
                        {alert.isSimulated && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                            SIMULATED
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {alert.riskProbability}% Risk Probability
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">
                        {alert.locationName}, {alert.state}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        {alert.contributingFactors?.[0] || 'Physical geotechnical surcharge detected on hill slope.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => onNavigate('location-detail', alert.locationId)}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        View Sector
                      </button>

                      {isAuthority && (
                        <>
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => onCreateIncidentFromAlert(alert.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            Respond
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          7. PROMINENT "REPORT A HAZARD" SECTION
          ======================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold uppercase tracking-wider">
            <Send className="w-3.5 h-3.5" />
            <span>Community Hazard Reporting</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Observed Ground Cracks, Rockfalls, or Water Seepage?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Submit a public or anonymous hazard report immediately. Your report helps disaster management authorities detect slope instability early and safeguard vulnerable communities.
          </p>
        </div>

        <button
          onClick={() => onNavigate('report')}
          className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer active:scale-98"
        >
          <Send className="w-4 h-4 text-blue-600 fill-current" />
          <span>REPORT A HAZARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
