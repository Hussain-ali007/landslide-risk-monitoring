import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, UserCheck, ShieldCheck } from 'lucide-react';
import { User } from '../../types';

interface UnauthorizedAccessGuardProps {
  attemptedTab: string;
  currentUser: User;
  onNavigateToLogin: () => void;
  onNavigateToPublic: () => void;
  onQuickLoginAsAuthority?: () => void;
}

const TAB_TITLES: Record<string, { title: string; purpose: string }> = {
  reports: {
    title: 'Authority Reports Review & Verification Desk',
    purpose: 'Review unredacted citizen personal information, verify ground hazards, and dispatch field response units.',
  },
  incidents: {
    title: 'Incident Management & Response Operations',
    purpose: 'Command emergency tickets, assign field officers, authorize evacuation orders, and progress workflow statuses.',
  },
  'audit-log': {
    title: 'Authority Action Audit Trail & Security Logs',
    purpose: 'Inspect chronological compliance records, system modifications, alert acknowledgements, and security actions.',
  },
};

export const UnauthorizedAccessGuard: React.FC<UnauthorizedAccessGuardProps> = ({
  attemptedTab,
  currentUser,
  onNavigateToLogin,
  onNavigateToPublic,
  onQuickLoginAsAuthority,
}) => {
  const tabInfo = TAB_TITLES[attemptedTab] || {
    title: 'Restricted Authority Portal',
    purpose: 'Restricted to authorized Disaster Management Authority personnel only.',
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Security Barrier Card */}
      <div className="bg-white border-2 border-red-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider">
                ACCESS RESTRICTED
              </span>
              <span className="text-xs text-slate-500 font-semibold">Security Protocol 403</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Authority Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Target Resource: <strong className="text-slate-800">{tabInfo.title}</strong>
            </p>
          </div>
        </div>

        {/* Diagnostic Explanation */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Current Active Identity:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentUser.name} ({currentUser.role.toUpperCase()})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Required Access Level:</span>
              <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Authority / Field Officer / Admin
              </span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            This module is strictly guarded to protect confidential citizen contact details (PII), prevent unauthorized changes to disaster response tickets, and ensure integrity in emergency workflow states.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong>Security Rule Enforced:</strong> Public observers cannot access or manipulate {tabInfo.purpose}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onNavigateToPublic}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Dashboard</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            {onQuickLoginAsAuthority && (
              <button
                onClick={onQuickLoginAsAuthority}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Sign in with authorized authority credentials"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Authorize as DMA</span>
              </button>
            )}

            <button
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Authority Sign-In Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Demonstration / Testing Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="font-bold text-slate-200">Security Test Pass: Active Enforcement Verified</div>
            <div className="text-[11px] text-slate-400">
              Route guard successfully trapped unauthorized public attempt to enter &quot;{attemptedTab}&quot;.
            </div>
          </div>
        </div>

        <button
          onClick={onNavigateToPublic}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline shrink-0 cursor-pointer"
        >
          Dismiss &amp; Go Back
        </button>
      </div>
    </div>
  );
};
