import React from 'react';
import {
  LayoutDashboard,
  Map,
  MapPin,
  CloudRain,
  Activity,
  AlertTriangle,
  FolderGit2,
  Send,
  Settings,
  Home,
  LogIn,
  Brain,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  userRole: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole,
}) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-predictions', label: 'AI Risk Prediction', icon: Brain, isAi: true },
    { id: 'map', label: 'NER Risk Map', icon: Map },
    { id: 'location-detail', label: 'Location Details', icon: MapPin },
    { id: 'weather', label: 'Weather & Rain', icon: CloudRain },
    { id: 'sensors', label: 'Soil & Sensors', icon: Activity },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
    },
    { id: 'incidents', label: 'Incidents', icon: FolderGit2 },
    { id: 'report', label: 'Citizen Report', icon: Send, highlight: true },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'login', label: 'Login / Roles', icon: LogIn },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-sm">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden lg:flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : item.highlight
                  ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1 divide-y divide-slate-800">
          <div className="grid grid-cols-2 gap-1 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
