import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Compass,
  AlertCircle,
  FileText,
  Radio,
  Sliders,
  CloudRain,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenWorkflowGuide: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenWorkflowGuide,
  activeAlertCount,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'authority':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/50';
      case 'field_officer':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
      case 'admin':
        return 'bg-rose-900/60 text-rose-300 border-rose-700/50';
      case 'public':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
    }
  };

  const roleLabelMap: Record<UserRole, string> = {
    authority: 'Authority',
    field_officer: 'Field Officer',
    admin: 'Administrator',
    public: 'Public / Reporter',
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('landing')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-100">
                    NER-LEWS
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    SIH Phase 1
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Landslide Early Warning &amp; Risk Monitoring · North Eastern Region
                </p>
              </div>
            </button>
          </div>

          {/* Role Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Test Workflow Guide Button */}
            <button
              onClick={onOpenWorkflowGuide}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Workflow Guide</span>
            </button>

            {/* Role Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[10px] text-slate-400">Current Role</div>
                  <div className="font-semibold">{roleLabelMap[currentUser.role]}</div>
                </div>
                <span className="sm:hidden font-semibold">{roleLabelMap[currentUser.role]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-20 py-2 divide-y divide-slate-700/60 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[11px] text-slate-400">
                      Switch Role for Testing (Phase 1):
                    </div>
                    <div className="py-1">
                      {INITIAL_USERS.map((user) => {
                        const isSelected = currentUser.role === user.role;
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSwitchRole(user.role);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-700/60 transition-colors cursor-pointer ${
                              isSelected ? 'bg-slate-700/40 text-amber-300' : 'text-slate-200'
                            }`}
                          >
                            <div className="pt-0.5">
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-600" />
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                                <span>{user.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({roleLabelMap[user.role]})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {user.designation}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
