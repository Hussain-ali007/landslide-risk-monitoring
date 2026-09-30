import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Radio,
  Database,
  RefreshCw,
  CheckCircle2,
  Users,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { ThresholdConfig, User, SensorRecord } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';

interface AdminViewProps {
  thresholds: ThresholdConfig;
  sensors: SensorRecord[];
  currentUser: User;
  onUpdateThresholds: (thresholds: Partial<ThresholdConfig>) => void;
  onResetData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  thresholds,
  sensors,
  currentUser,
  onUpdateThresholds,
  onResetData,
}) => {
  const [formData, setFormData] = useState<ThresholdConfig>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System Administration
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">Governance &amp; Warning Calibrations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Settings &amp; Threshold Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Calibrate early warning trigger parameters, review user access tiers, and manage system baselines.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default baseline?')) {
                onResetData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Threshold calibrations successfully committed to active telemetry engine.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Threshold Configuration (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <span>Geotechnical Warning Thresholds</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              When physical readings exceed these values, automated early warning alerts trigger.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Critical Rainfall 24h (mm):
                </label>
                <input
                  type="number"
                  value={formData.rain24hCriticalMm}
                  onChange={(e) =>
                    setFormData({ ...formData, rain24hCriticalMm: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Warning Rainfall 24h (mm):
                </label>
                <input
                  type="number"
                  value={formData.rain24hWarningMm}
                  onChange={(e) =>
                    setFormData({ ...formData, rain24hWarningMm: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Critical Soil Moisture (% VWC):
                </label>
                <input
                  type="number"
                  value={formData.soilMoistureCriticalPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, soilMoistureCriticalPercent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Warning Soil Moisture (% VWC):
                </label>
                <input
                  type="number"
                  value={formData.soilMoistureWarningPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, soilMoistureWarningPercent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Critical Ground Movement (mm/day):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.inclinometerCriticalMmPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, inclinometerCriticalMmPerDay: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Warning Ground Movement (mm/day):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.inclinometerWarningMmPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, inclinometerWarningMmPerDay: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Save Calibration Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right: User Roles & Access Control (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Operational Access Roles</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Role-Based Access Control (RBAC) tiers
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            {INITIAL_USERS.map((usr) => (
              <div
                key={usr.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{usr.name}</div>
                  <div className="text-[11px] text-slate-500">{usr.designation}</div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                    {usr.role.replace('_', ' ')}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{usr.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
