import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FolderPlus,
  Clock,
  Filter,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Alert, User } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface AlertsViewProps {
  alerts: Alert[];
  currentUser: User;
  onAcknowledge: (alertId: string) => void;
  onCreateIncident: (alertId: string) => void;
  onNavigateToLocation: (locId: string) => void;
  onNavigateToIncident?: (incidentId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  currentUser,
  onAcknowledge,
  onCreateIncident,
  onNavigateToLocation,
  onNavigateToIncident,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const isAuthority =
    currentUser.role === 'authority' ||
    currentUser.role === 'field_officer' ||
    currentUser.role === 'admin';

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'simulated') return a.isSimulated === true;
    if (activeFilter === 'critical') return a.riskLevel === 'critical';
    if (activeFilter === 'high') return a.riskLevel === 'high';
    if (activeFilter === 'moderate') return a.riskLevel === 'moderate';
    if (activeFilter === 'active') return a.status === 'active';
    if (activeFilter === 'acknowledged') return a.status === 'acknowledged';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hazard Early Warnings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Active Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time threshold breaches, AI risk alarms, and sensor warnings across North Eastern corridors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'simulated', label: 'Simulated (Demo)' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'moderate', label: 'Moderate' },
            { id: 'active', label: 'Unacknowledged' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards List (Section 13) */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <div className="font-bold text-slate-800 text-sm">No alerts matching selected filter.</div>
            <div className="mt-1">All monitored hill slopes are currently within safe operational limits.</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.riskLevel === 'critical';
            const isHigh = alert.riskLevel === 'high';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm transition-all ${
                  isCritical
                    ? 'border-red-200 hover:border-red-300 ring-1 ring-red-100'
                    : isHigh
                    ? 'border-orange-200 hover:border-orange-300 ring-1 ring-orange-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Simulation Mode Notice Banner on Alert Card */}
                {alert.isSimulated && (
                  <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider">
                        SIMULATION MODE
                      </span>
                      <span className="font-semibold text-slate-900">
                        Simulated High-Risk Event (Demo Only)
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 hidden sm:inline font-medium">
                      Isolated demo scenario — not mixed with real-world disaster data
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-red-600 text-white'
                            : isHigh
                            ? 'bg-orange-500 text-white'
                            : 'bg-amber-400 text-slate-950'
                        }`}
                      >
                        {alert.riskLevel}
                      </span>
                      {alert.isSimulated && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          SIMULATED
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-900">
                        {isCritical ? 'Landslide risk detected' : 'Increasing ground movement & saturation'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{alert.timestamp}</span>
                      </span>
                    </div>

                    <div className="text-base font-bold text-slate-900">
                      Location: <span className="text-blue-600">{alert.locationName}</span> ({alert.state})
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4">
                      <span>Risk Probability: <strong className="text-slate-900 font-mono text-sm">{alert.riskProbability}%</strong></span>
                      <span>Rainfall (24h): <strong className="text-slate-900 font-mono">{alert.rainfall24h} mm</strong></span>
                      <span>Soil Moisture: <strong className="text-slate-900 font-mono">{alert.soilMoisture}%</strong></span>
                      <span>Ground Movement: <strong className="text-slate-900 font-mono">{alert.groundMovement} mm/d</strong></span>
                    </div>

                    {alert.contributingFactors && alert.contributingFactors.length > 0 && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <strong>Contributing Factors:</strong> {alert.contributingFactors.join(' • ')}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center flex-wrap justify-end">
                    <button
                      onClick={() => onNavigateToLocation(alert.locationId)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Sector
                    </button>

                    {isAuthority && (
                      <>
                        {alert.status === 'active' ? (
                          <button
                            onClick={() => onAcknowledge(alert.id)}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Acknowledge Alert
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Acknowledged</span>
                          </span>
                        )}

                        {alert.incidentId ? (
                          <button
                            onClick={() => onNavigateToIncident && onNavigateToIncident(alert.incidentId!)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>View Incident ({alert.incidentId})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onCreateIncident(alert.id)}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            <span>Create Incident from Alert</span>
                          </button>
                        )}
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
  );
};
