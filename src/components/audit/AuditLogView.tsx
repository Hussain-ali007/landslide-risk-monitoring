import React, { useState, useMemo } from 'react';
import {
  Shield,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Zap,
  ArrowRight,
  Download,
  Lock,
} from 'lucide-react';
import { AuditLogEntry, User } from '../../types';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  currentUser: User;
  onNavigateToIncident?: (incidentId: string) => void;
  onNavigateToReport?: (reportId: string) => void;
  onNavigateToLocation?: (locId: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  currentUser,
  onNavigateToIncident,
  onNavigateToReport,
  onNavigateToLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          (log.targetId && log.targetId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const getCategoryBadge = (cat: AuditLogEntry['category']) => {
    switch (cat) {
      case 'ALERT_ACTION':
        return { label: 'Alert Action', style: 'bg-red-50 text-red-700 border-red-200' };
      case 'INCIDENT_ACTION':
        return { label: 'Incident Workflow', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'REPORT_ACTION':
        return { label: 'Citizen Report', style: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SECURITY_AUTH':
        return { label: 'Security & Auth', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SIMULATION':
        return { label: 'Simulation Demo', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'CONFIG':
        return { label: 'Configuration', style: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: 'General', style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `authority_audit_trail_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Regulatory Compliance &amp; Traceability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
            <span>Authority Audit Trail</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {auditLogs.length} Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable chronological log of alert acknowledgements, incident escalations, report verifications, and auth events.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start md:self-center"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, officer, or target ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'ALERT_ACTION', label: 'Alerts' },
            { id: 'INCIDENT_ACTION', label: 'Incidents' },
            { id: 'REPORT_ACTION', label: 'Reports' },
            { id: 'SECURITY_AUTH', label: 'Security & Auth' },
            { id: 'SIMULATION', label: 'Simulation' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
            <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="font-bold text-slate-800 text-sm">No audit records matching query.</div>
            <p className="mt-1">Perform actions in the console to generate verifiable audit entries.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getCategoryBadge(log.category);

            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{log.id}</span>
                    {log.isSimulated && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[9px] uppercase border border-amber-300">
                        SIMULATED
                      </span>
                    )}
                    {log.targetId && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 text-[10px] font-semibold">
                        Target: {log.targetId}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{log.timestamp}</span>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-900">
                  {log.action}
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {log.details}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Officer: <strong className="text-slate-800">{log.actorName}</strong> ({log.actorRole})</span>
                  </div>

                  {/* Context Links */}
                  <div className="flex items-center gap-3">
                    {log.targetId && log.targetId.startsWith('INC-') && onNavigateToIncident && (
                      <button
                        onClick={() => onNavigateToIncident(log.targetId!)}
                        className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Open Incident</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {log.targetId && log.targetId.startsWith('RPT-') && onNavigateToReport && (
                      <button
                        onClick={() => onNavigateToReport(log.targetId!)}
                        className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
