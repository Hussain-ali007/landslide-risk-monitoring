import React from 'react';
import {
  LayoutDashboard,
  Map,
  Brain,
  CloudRain,
  Activity,
  AlertTriangle,
  FolderGit2,
  Send,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  collapsed,
  onToggleCollapse,
  currentUser,
  onSwitchRole,
  mobileOpen,
  onCloseMobile,
}) => {
  const navSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Risk Map', icon: Map },
        { id: 'ai-predictions', label: 'AI Risk Prediction', icon: Brain },
      ],
    },
    {
      title: 'Monitoring',
      items: [
        { id: 'weather', label: 'Weather & Rainfall', icon: CloudRain },
        { id: 'sensors', label: 'Soil & Sensors', icon: Activity },
      ],
    },
    {
      title: 'Response',
      items: [
        {
          id: 'alerts',
          label: 'Alerts',
          icon: AlertTriangle,
          badge: activeAlertCount > 0 ? activeAlertCount : undefined,
          badgeCritical: true,
        },
        { id: 'incidents', label: 'Incidents', icon: FolderGit2 },
        { id: 'report', label: 'Citizen Reports', icon: Send },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'admin', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const roleLabelMap: Record<UserRole, string> = {
    authority: 'Authority',
    field_officer: 'Field Officer',
    admin: 'Administrator',
    public: 'Public / Reporter',
  };

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          collapsed ? 'w-18' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & App Branding */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer overflow-hidden"
              title="NER-LEWS Home"
            >
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-md">
                <Shield className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <span>NER-LEWS</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      EOC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Landslide Early Warning
                  </p>
                </div>
              )}
            </button>

            {/* Collapse toggle button on desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={collapsed ? item.label : undefined}
                        style={item.id === 'dashboard' ? { backgroundColor: '#41cdad' } : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer relative ${
                          isActive
                            ? 'bg-slate-800 text-white font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}

                        {/* Alert Badges */}
                        {item.badge !== undefined && (
                          <span
                            className={`${
                              collapsed
                                ? 'absolute top-1 right-1'
                                : 'ml-auto'
                            } px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              item.badgeCritical
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Current Role & User Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Role</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="truncate flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {roleLabelMap[currentUser.role]}
                  </div>
                </div>
              </div>

              {/* Quick Role Switcher */}
              <div className="grid grid-cols-2 gap-1 pt-1">
                {(['authority', 'field_officer', 'admin', 'public'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => onSwitchRole(r)}
                    className={`px-1.5 py-1 rounded text-[10px] font-medium border text-center transition-colors truncate cursor-pointer ${
                      currentUser.role === r
                        ? 'bg-slate-800 text-white border-slate-600'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {r === 'authority' ? 'Authority' : r === 'field_officer' ? 'Officer' : r === 'admin' ? 'Admin' : 'Public'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => onSwitchRole(currentUser.role === 'authority' ? 'field_officer' : 'authority')}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                title={`Role: ${roleLabelMap[currentUser.role]} (Click to toggle)`}
              >
                {currentUser.role[0].toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
