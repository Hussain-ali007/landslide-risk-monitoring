import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Users,
  Send,
  Sliders,
  ArrowLeft,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface LoginViewProps {
  currentUser: User;
  onLoginAs: (role: UserRole) => void;
  onNavigate: (tab: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  currentUser,
  onLoginAs,
  onNavigate,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('authority');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const roles = [
    {
      role: 'authority' as UserRole,
      title: 'Disaster Management Authority',
      subtitle: 'State & Regional Disaster Management Authority (NER)',
      description: 'Authority over regional early warnings, emergency dispatches, and incident coordination.',
      icon: Shield,
    },
    {
      role: 'field_officer' as UserRole,
      title: 'Field Officer',
      subtitle: 'Disaster Response Unit / Road Safety Force',
      description: 'On-ground slope reconnaissance, sensor inspection, and citizen report verification.',
      icon: UserCheck,
    },
    {
      role: 'admin' as UserRole,
      title: 'Authorized Administrator',
      subtitle: 'Geotechnical Systems & Telemetry Calibration',
      description: 'Threshold adjustments, telemetry node diagnostics, and system configuration.',
      icon: Sliders,
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    onLoginAs(role);
    setLoginSuccess(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginAs(selectedRole);
    setLoginSuccess(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Public Dashboard</span>
      </button>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 mb-2">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Authority Sign-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Access the Landslide Early Warning System operational dashboard to review alerts, verify hazard reports, and manage incidents.
        </p>
      </div>

      {loginSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Authenticated successfully. Redirecting to Overview...</span>
        </div>
      )}

      {/* Fast 1-Click Role Login Selection */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Operational Role:
        </div>

        <div className="grid grid-cols-1 gap-3">
          {roles.map((item) => {
            const Icon = item.icon;
            const isCurrent = currentUser.role === item.role;

            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50/60 border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                    <div className="text-xs text-blue-600 font-medium">{item.subtitle}</div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 self-end sm:self-center transition-colors cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Email / Password Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Sign in with Official Credentials</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Role Designation</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="authority">Disaster Management Authority</option>
              <option value="field_officer">Field Officer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Official Email Address</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="authority@disaster.gov.in"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Sign In to Authority Console
          </button>
        </form>
      </div>
    </div>
  );
};
