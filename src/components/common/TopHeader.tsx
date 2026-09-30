import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { User as UserType, UserRole, MonitoredLocation } from '../../types';

interface TopHeaderProps {
  activeTab: string;
  locations: MonitoredLocation[];
  selectedLocationId: string;
  onSelectLocation: (id: string) => void;
  activeAlertCount: number;
  currentUser: UserType;
  onSwitchRole: (role: UserRole) => void;
  onOpenSimulation: () => void;
  onToggleMobileMenu: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  locations,
  selectedLocationId,
  onSelectLocation,
  activeAlertCount,
  currentUser,
  onSwitchRole,
  onOpenSimulation,
  onToggleMobileMenu,
  onNavigateToTab,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Tab Title & Subtitle Mapping
  const tabInfoMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'NER Landslide Early Warning System',
      subtitle: 'North Eastern Region — Authority Monitoring Center',
    },
    map: {
      title: 'Regional Landslide Risk Map',
      subtitle: 'Spatial GIS Hazard Layer · 8 Monitored Hotspots Across NER',
    },
    'ai-predictions': {
      title: 'AI Landslide Risk Prediction',
      subtitle: 'Multi-Feature Ensemble Susceptibility & What-If Simulator',
    },
    'location-detail': {
      title: 'Location Emergency Profile',
      subtitle: 'Geotechnical In-Situ Telemetry & Hazard Attribution',
    },
    weather: {
      title: 'Weather & Rainfall Monitoring',
      subtitle: 'IMD Station Precipitation Gauges & Saturation Trends',
    },
    sensors: {
      title: 'Soil Moisture & Kinematic Sensors',
      subtitle: 'Borehole Inclinometers, Piezometers & TDR Moisture Arrays',
    },
    alerts: {
      title: 'Active Early Warning Alerts',
      subtitle: 'Real-Time Emergency Escalation & Protocol Management',
    },
    incidents: {
      title: 'Incident Management System',
      subtitle: 'Disaster Response Dispatch, Officer Allocation & Field Log',
    },
    report: {
      title: 'Citizen Hazard Reporting Portal',
      subtitle: 'Crowdsourced Ground Observations & Public Slope Warnings',
    },
    admin: {
      title: 'System Settings & Thresholds',
      subtitle: 'Geotechnical Warning Triggers & User Access Governance',
    },
    landing: {
      title: 'Overview & Mission Statement',
      subtitle: 'National Disaster Preparedness for North Eastern Hill States',
    },
  };

  const currentTabInfo = tabInfoMap[activeTab] || {
    title: 'NER Landslide Early Warning System',
    subtitle: 'North Eastern Region Monitoring Network',
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white shrink-0 sticky top-0 z-30">
      {/* Left: Mobile hamburger + Page Title + Location Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-md bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {currentTabInfo.title}
          </h1>
          <p className="text-[11px] text-slate-400 truncate">
            {currentTabInfo.subtitle}
          </p>
        </div>

        {/* Location / Region Selector Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedLocationId}
            onChange={(e) => {
              onSelectLocation(e.target.value);
              if (activeTab !== 'location-detail' && activeTab !== 'dashboard' && activeTab !== 'map') {
                // Keep on current page
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500 max-w-[210px] truncate cursor-pointer font-medium"
          >
            <option value="ALL">All 8 NER States (Regional)</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}, {loc.state} ({loc.riskLevel.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions: Telemetry Time, Demo Tag, SIMULATE Button, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Unobtrusive Demo indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Demo Data</span>
        </div>

        {/* Last updated timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Live · Updated 2m ago</span>
        </div>

        {/* PRIMARY SIMULATE HIGH-RISK EVENT BUTTON */}
        <button
          onClick={onOpenSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          title="Open Simulation Panel (Simulate extreme rainfall & ground movement)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SIMULATE HIGH-RISK EVENT</span>
          <span className="sm:hidden">SIMULATE</span>
        </button>

        {/* Active Alert Notification Bell */}
        <button
          onClick={() => onNavigateToTab('alerts')}
          className="relative p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* User / Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
              {currentUser.name[0]}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 text-slate-800 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{currentUser.designation}</div>
                </div>

                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Switch Operational Role
                </div>

                {(['authority', 'field_officer', 'admin', 'public'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      currentUser.role === r ? 'font-bold text-red-600' : 'text-slate-700'
                    }`}
                  >
                    <span className="capitalize">{r.replace('_', ' ')}</span>
                    {currentUser.role === r && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold">Active</span>}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onNavigateToTab('landing');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Public Landing Overview
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
