import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Database,
  ExternalLink,
  Activity,
  CloudRain,
  Compass,
} from 'lucide-react';
import { AIPredictionResult, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface AIRiskPredictionCardProps {
  prediction: AIPredictionResult;
  onRefresh?: () => void;
  onViewDeepDetails?: () => void;
  compact?: boolean;
}

export const AIRiskPredictionCard: React.FC<AIRiskPredictionCardProps> = ({
  prediction,
  onRefresh,
  onViewDeepDetails,
  compact = false,
}) => {
  const [showWhyDetails, setShowWhyDetails] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'factors' | 'history' | 'geotech'>('factors');

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/80',
          gauge: '#f43f5e',
          glow: 'shadow-rose-900/40',
        };
      case 'high':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-950/40',
          border: 'border-orange-800/80',
          gauge: '#f97316',
          glow: 'shadow-orange-900/40',
        };
      case 'moderate':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-950/40',
          border: 'border-yellow-800/80',
          gauge: '#eab308',
          glow: 'shadow-yellow-900/40',
        };
      case 'low':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-800/80',
          gauge: '#10b981',
          glow: 'shadow-emerald-900/40',
        };
    }
  };

  const colors = getRiskColor(prediction.riskLevel);
  const prob = prediction.riskProbability ?? 0;

  // SVG circular gauge geometry
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (prob / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border ${colors.border} bg-slate-900 shadow-xl ${colors.glow} overflow-hidden transition-all`}
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400">
                AI Landslide Risk Prediction Engine
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                {prediction.modelVersion}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
              <span>{prediction.locationName}</span>
              <span className="text-xs text-slate-400 font-normal">({prediction.state})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{prediction.dataQuality}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Inference: {prediction.timestamp}
          </span>
        </div>
      </div>

      {/* Main Prediction Score & Highlights Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Left: Circular Probability Gauge */}
        <div className="flex items-center justify-center sm:justify-start gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke={colors.gauge}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono tracking-tighter ${colors.text}`}>
                {prob}%
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                Est. Risk
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] uppercase font-semibold text-slate-400">Hazard Level</div>
            <RiskBadge level={prediction.riskLevel} size="md" />
            <div className="text-[10px] text-slate-400 pt-1">
              Confidence Score: <span className="font-mono text-slate-200 font-bold">{prediction.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Center: Top Contributing Trigger */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Primary Trigger
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Ensemble Attribution</span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {prediction.whyThisRisk.primaryTrigger}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <span>Terrain gradient: <b className="text-slate-200">{prediction.rawFeatures.slope ?? 30}°</b></span>
            <span>·</span>
            <span>Soil: <b className="text-slate-200">{'soilType' in prediction.rawFeatures ? prediction.rawFeatures.soilType : 'Regional regolith'}</b></span>
          </div>
        </div>

        {/* Right: Recommendation & Action Directives */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              Direct Action Advisory
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {prediction.whyThisRisk.recommendedMitigation}
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Field Reports Corroboration: <b className="text-amber-400 font-semibold">{'recentReportsCount' in prediction.rawFeatures ? prediction.rawFeatures.recentReportsCount : 0}</b>
            </span>
            {onViewDeepDetails && (
              <button
                onClick={onViewDeepDetails}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Diagnostics</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Deep Breakdown: Contributing Factors vs Historical Trend vs Soil Mechanics */}
      <div className="px-5 pt-1 border-t border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('factors')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'factors'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Contributing Factors ({prediction.contributingFactors.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk History Trend &amp; Outlook
            </button>
            <button
              onClick={() => setActiveTab('geotech')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'geotech'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              "Why this risk?" Geotechnical Reasoning
            </button>
          </div>

          <button
            onClick={() => setShowWhyDetails(!showWhyDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 cursor-pointer"
          >
            <span>{showWhyDetails ? 'Collapse' : 'Expand'}</span>
            {showWhyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {showWhyDetails && (
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40">
          {/* TAB 1: CONTRIBUTING FACTORS */}
          {activeTab === 'factors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Key Environmental &amp; Kinematic Drivers (Weighted Impact)</span>
                <span>Threshold Evaluation</span>
              </div>

              <div className="space-y-2.5">
                {prediction.contributingFactors.map((factor) => {
                  const factorSevColor =
                    factor.severity === 'critical'
                      ? 'bg-rose-500'
                      : factor.severity === 'high'
                      ? 'bg-orange-500'
                      : factor.severity === 'moderate'
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500';

                  return (
                    <div
                      key={factor.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              factor.severity === 'critical' ? 'bg-rose-500 animate-ping' : factorSevColor
                            }`}
                          />
                          <span className="font-bold text-slate-200">{factor.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {factor.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300 font-semibold">
                            {factor.actualValue}
                          </span>
                          <span className="text-[11px] font-bold text-amber-400 font-mono">
                            +{factor.impactPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Weight Progress Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${factorSevColor} transition-all duration-500`}
                          style={{ width: `${Math.min(100, factor.impactPercentage * 2.5)}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                        <p className="leading-snug max-w-xl">{factor.description}</p>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                          Ref: {factor.thresholdOrNorm}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RISK HISTORY CHART */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>7-Day Risk Probability Trend &amp; +12h Forecast Outlook</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Inference Historical</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Forecast Model</span>
                  </span>
                </div>
              </div>

              {/* SVG Line / Bar Chart */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 pb-1">
                  {prediction.riskHistory.map((pt, idx) => {
                    const isForecast = pt.isForecast;
                    const isNow = pt.label === 'Now';
                    const barColor = isForecast
                      ? 'from-blue-600 to-blue-400'
                      : pt.probability >= 80
                      ? 'from-rose-600 to-rose-400'
                      : pt.probability >= 60
                      ? 'from-orange-600 to-orange-400'
                      : pt.probability >= 35
                      ? 'from-yellow-600 to-yellow-400'
                      : 'from-emerald-600 to-emerald-400';

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        {/* Hover Tooltip Details */}
                        <div className="text-[10px] font-mono text-slate-300 font-bold mb-1 opacity-90 group-hover:scale-110 transition-transform">
                          {pt.probability}%
                        </div>

                        {/* Bar fill */}
                        <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 relative">
                          <div
                            className={`w-full bg-gradient-to-t ${barColor} rounded-t-lg transition-all duration-500`}
                            style={{ height: `${Math.max(8, pt.probability)}%` }}
                          />
                          {isNow && (
                            <span className="absolute top-1 inset-x-0 mx-auto w-2 h-2 rounded-full bg-white animate-ping" />
                          )}
                        </div>

                        {/* Axis Labels */}
                        <div className="text-[10px] font-mono text-slate-400 mt-2 font-semibold truncate max-w-full text-center">
                          {pt.label}
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono hidden sm:block">
                          {pt.rainfall24h}mm
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                  Horizontal Timeline: Days Before Trigger (T-6d to T-24h) → Current In-situ Inference (Now) → Next 12h Numerical Prediction (+12h)
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: "WHY THIS RISK?" GEOTECHNICAL REASONING */}
          {activeTab === 'geotech' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  Analytical Summary
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  {prediction.whyThisRisk.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-blue-400 flex items-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    Antecedent Hydrology Dynamics
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {prediction.whyThisRisk.antecedentRainfallImpact}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Subsurface Geomechanical State
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {prediction.whyThisRisk.geotechnicalMechanics}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-400 flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  Field &amp; Citizen Reconnaissance Corroboration
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {prediction.whyThisRisk.fieldIntelligenceCorroboration}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Statistical Disclaimer (SIH Constraint) */}
      <div className="px-5 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-tight">
          <strong className="text-slate-300">Statistical Risk Model Disclaimer:</strong>{' '}
          {prediction.disclaimer}
        </p>
      </div>
    </div>
  );
};
