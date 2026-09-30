import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  UserCheck,
  Send,
  CheckCircle2,
  MessageSquare,
  Shield,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  MapPin,
  FileText,
  Layers,
  History,
  Check,
  X,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import {
  Incident,
  IncidentStatus,
  User,
  normalizeIncidentStatus,
  IncidentActivityItem,
} from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface IncidentManagementViewProps {
  incidents: Incident[];
  currentUser: User;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, note?: string) => void;
  onAddNote: (incidentId: string, note: string) => void;
  onNavigateToLocation: (locId: string) => void;
  onViewReport?: (reportId: string) => void;
  initialSelectedIncidentId?: string | null;
}

export const IncidentManagementView: React.FC<IncidentManagementViewProps> = ({
  incidents,
  currentUser,
  onUpdateStatus,
  onAddNote,
  onNavigateToLocation,
  onViewReport,
  initialSelectedIncidentId,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    initialSelectedIncidentId || incidents[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState<IncidentStatus | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const isAuthority =
    currentUser.role === 'authority' ||
    currentUser.role === 'field_officer' ||
    currentUser.role === 'admin';

  useEffect(() => {
    if (initialSelectedIncidentId) {
      setSelectedIncidentId(initialSelectedIncidentId);
    }
  }, [initialSelectedIncidentId]);

  // Keep selected incident synchronized
  useEffect(() => {
    if (!selectedIncidentId && incidents.length > 0) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [incidents, selectedIncidentId]);

  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const workflowSteps: { key: IncidentStatus; label: string; number: number }[] = [
    { key: 'NEW', label: 'NEW', number: 1 },
    { key: 'ACKNOWLEDGED', label: 'ACKNOWLEDGED', number: 2 },
    { key: 'INVESTIGATING', label: 'INVESTIGATING', number: 3 },
    { key: 'ACTION IN PROGRESS', label: 'ACTION IN PROGRESS', number: 4 },
    { key: 'RESOLVED', label: 'RESOLVED', number: 5 },
    { key: 'CLOSED', label: 'CLOSED', number: 6 },
  ];

  const filteredIncidents = incidents.filter((inc) => {
    const norm = normalizeIncidentStatus(inc.status);
    if (filterStatus !== 'ALL' && norm !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = inc.id.toLowerCase().includes(q);
      const matchLoc = inc.locationName.toLowerCase().includes(q);
      const matchState = inc.state.toLowerCase().includes(q);
      const matchHazard = (inc.hazardType || '').toLowerCase().includes(q);
      const matchReport = (inc.sourceReportId || inc.relatedReportId || '').toLowerCase().includes(q);
      const matchOfficer = (inc.assignedOfficer || '').toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      if (
        !matchId &&
        !matchLoc &&
        !matchState &&
        !matchHazard &&
        !matchReport &&
        !matchOfficer &&
        !matchDesc
      ) {
        return false;
      }
    }

    return true;
  });

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeIncident) return;
    onAddNote(activeIncident.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleExecuteStatusChange = (newStatus: IncidentStatus) => {
    if (!activeIncident) return;
    onUpdateStatus(activeIncident.id, newStatus, statusUpdateNote.trim() || undefined);
    setStatusUpdateNote('');
    setShowStatusModal(null);
  };

  const getStepIndex = (status: IncidentStatus) => {
    const norm = normalizeIncidentStatus(status);
    return workflowSteps.findIndex((s) => s.key === norm);
  };

  const getStatusBadgeStyle = (status: IncidentStatus) => {
    const s = normalizeIncidentStatus(status);
    switch (s) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACKNOWLEDGED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'INVESTIGATING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACTION IN PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Compile timeline from activityHistory or notes fallback
  const getTimelineItems = (inc: Incident): IncidentActivityItem[] => {
    if (inc.activityHistory && inc.activityHistory.length > 0) {
      return inc.activityHistory;
    }
    // Fallback if no activity history array yet
    return [
      {
        id: `timeline-init-${inc.id}`,
        status: normalizeIncidentStatus(inc.status),
        action: 'Incident Created',
        actor: inc.assignedOfficer || 'Authority Operations Desk',
        role: inc.assignedRole || 'Duty Operations Desk',
        timestamp: inc.createdAt,
        notes: inc.description,
      },
    ];
  };

  const photosList = activeIncident
    ? activeIncident.photos && activeIncident.photos.length > 0
      ? activeIncident.photos
      : activeIncident.photoUrl
      ? [activeIncident.photoUrl]
      : []
    : [];

  const sourceReportId = activeIncident?.sourceReportId || activeIncident?.relatedReportId;
  const sourceReportTime = activeIncident?.reportTime || activeIncident?.sourceReportTime;

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Authority Operations Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Incident Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Disaster response lifecycle: NEW → ACKNOWLEDGED → INVESTIGATING → ACTION IN PROGRESS → RESOLVED → CLOSED.
          </p>
        </div>

        {/* Workflow Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold">
          {['ALL', 'NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'ACTION IN PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => {
            const count =
              st === 'ALL'
                ? incidents.length
                : incidents.filter((i) => normalizeIncidentStatus(i.status) === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    filterStatus === st ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Two-Column Incident Docket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Incidents List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px]">
          {/* List Search Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Incident Tickets ({filteredIncidents.length})
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Active Operational Roster</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID (INC-...), Report (RPT-...), Location, Hazard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Incident Cards Roster */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {filteredIncidents.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No incident tickets match your criteria.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Clear search query
                  </button>
                )}
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = activeIncident?.id === inc.id;
                const normStatus = normalizeIncidentStatus(inc.status);
                const reportRef = inc.sourceReportId || inc.relatedReportId;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inc.id}</span>
                        {inc.isSimulated && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-bold uppercase border border-amber-300">
                            SIMULATED
                          </span>
                        )}
                        {reportRef && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                            {reportRef}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                          normStatus
                        )}`}
                      >
                        {normStatus}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2 line-clamp-1">
                      {inc.title}
                    </h4>

                    {inc.hazardType && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                          {inc.hazardType}
                        </span>
                        {inc.lat !== undefined && inc.lng !== undefined && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({inc.lat.toFixed(3)}°N, {inc.lng.toFixed(3)}°E)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{inc.locationName}</span>
                      </span>
                      <span className="text-slate-400">{inc.state}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>Officer: {inc.assignedOfficer || 'Operations Desk'}</span>
                      <span className="font-mono">{inc.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Incident Detail & SOP Workflow */}
        {activeIncident ? (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                    {activeIncident.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                      activeIncident.status
                    )}`}
                  >
                    {normalizeIncidentStatus(activeIncident.status)}
                  </span>
                  <RiskBadge level={activeIncident.severity.toLowerCase() as any} size="sm" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {activeIncident.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sector: {activeIncident.locationName}, {activeIncident.state} • Registered:{' '}
                  {activeIncident.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => onNavigateToLocation(activeIncident.locationId)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Location Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Simulation Mode Notice Banner */}
            {activeIncident.isSimulated && (
              <div className="p-3 bg-amber-500/15 border border-amber-400/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider">
                    SIMULATION MODE
                  </span>
                  <span className="font-bold">
                    Simulated High-Risk Emergency Ticket (Demonstration Only)
                  </span>
                </div>
                <span className="text-[11px] text-amber-900 font-medium">
                  Isolated demo scenario — not mixed with real-world disaster data
                </span>
              </div>
            )}

            {/* Comprehensive Metadata Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              {/* 1. Incident ID */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Incident ID</div>
                <div className="font-mono font-bold text-slate-900">{activeIncident.id}</div>
              </div>

              {/* 2. Source Report */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Source Report</div>
                {sourceReportId ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200">
                      {sourceReportId}
                    </span>
                    {onViewReport && (
                      <button
                        onClick={() => onViewReport(sourceReportId)}
                        className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : activeIncident.originAlertId ? (
                  <span className="font-mono font-bold text-purple-700">
                    Alert {activeIncident.originAlertId}
                  </span>
                ) : (
                  <span className="text-slate-400">Direct Incident</span>
                )}
                {sourceReportTime && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Reported: {sourceReportTime}
                  </div>
                )}
              </div>

              {/* 3. Hazard Type */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Hazard Type</div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{activeIncident.hazardType || 'Geotechnical Hazard'}</span>
                </div>
              </div>

              {/* 4. Location & Coordinates */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Location</div>
                <div className="font-semibold text-slate-900 truncate">
                  {activeIncident.locationName}
                </div>
                {activeIncident.lat !== undefined && activeIncident.lng !== undefined && (
                  <div className="font-mono text-[11px] text-slate-500">
                    {activeIncident.lat.toFixed(4)}°N, {activeIncident.lng.toFixed(4)}°E
                  </div>
                )}
              </div>

              {/* 5. Current Status */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Current Status</div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(
                      activeIncident.status
                    )}`}
                  >
                    {normalizeIncidentStatus(activeIncident.status)}
                  </span>
                </div>
              </div>

              {/* 6. Created Time */}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase text-slate-400">Created Time</div>
                <div className="font-semibold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeIncident.createdAt}</span>
                </div>
                {activeIncident.updatedAt && (
                  <div className="text-[10px] text-slate-400">
                    Updated: {activeIncident.updatedAt}
                  </div>
                )}
              </div>

              {/* 7. Assigned Authority & Role */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-0.5 pt-2 border-t border-slate-200/60">
                <div className="text-[11px] font-bold uppercase text-slate-400">
                  Assigned Authority / Role
                </div>
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{activeIncident.assignedOfficer || 'Disaster Management Authority'}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-normal">
                    {activeIncident.assignedRole || 'Duty Operations Desk'}
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow Pipeline Progression (NEW -> ACKNOWLEDGED -> INVESTIGATING -> ACTION IN PROGRESS -> RESOLVED -> CLOSED) */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Incident Workflow Progression:
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Authority can update status to progress through the emergency protocol.
                  </div>
                </div>

                {/* Direct Status Selector & Advance Button */}
                {isAuthority && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-600">Change Status:</span>
                      <select
                        value={normalizeIncidentStatus(activeIncident.status)}
                        onChange={(e) => setShowStatusModal(e.target.value as IncidentStatus)}
                        className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                      >
                        {workflowSteps.map((st) => (
                          <option key={st.key} value={st.key}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {getStepIndex(activeIncident.status) < workflowSteps.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = getStepIndex(activeIncident.status) + 1;
                          const nextStep = workflowSteps[nextIdx];
                          if (nextStep) {
                            onUpdateStatus(activeIncident.id, nextStep.key);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={`Advance to ${workflowSteps[getStepIndex(activeIncident.status) + 1]?.label}`}
                      >
                        <span>Advance to {workflowSteps[getStepIndex(activeIncident.status) + 1]?.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 6 Step Visual Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                {workflowSteps.map((step, idx) => {
                  const currentIdx = getStepIndex(activeIncident.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={step.key}
                      onClick={() => {
                        if (isAuthority && !isCurrent) {
                          setShowStatusModal(step.key);
                        }
                      }}
                      disabled={!isAuthority}
                      className={`p-2.5 rounded-xl text-center border transition-all text-xs ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs ring-2 ring-blue-400'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold hover:bg-emerald-100/60 cursor-pointer'
                          : isAuthority
                          ? 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
                          : 'bg-white text-slate-400 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono">
                        {isDone ? <Check className="w-3 h-3 text-emerald-600" /> : `Step ${step.number}`}
                      </div>
                      <div className="text-[11px] mt-1 font-bold truncate leading-tight">
                        {step.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Incident Description */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Incident Description & Brief:</span>
                {sourceReportId && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                    Copied from {sourceReportId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {activeIncident.description}
              </p>
            </div>

            {/* Photos & Evidence attached from hazard report */}
            {photosList.length > 0 && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Uploaded Hazard Photos ({photosList.length}):
                  </span>
                  <span className="text-[11px] text-slate-400">Click photo to enlarge</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {photosList.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => setPreviewPhoto(photo)}
                      className="group relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs cursor-pointer"
                    >
                      <img
                        src={photo}
                        alt={`Evidence ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline / Activity History */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Timeline & Activity History</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {getTimelineItems(activeIncident).length} Milestone Log(s)
                </span>
              </div>

              {/* Chronological Timeline List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {getTimelineItems(activeIncident).map((act, actIdx) => (
                  <div key={act.id || actIdx} className="flex gap-3 text-xs relative group">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                        {actIdx + 1}
                      </div>
                      {actIdx < getTimelineItems(activeIncident).length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>

                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-slate-900">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-slate-700">{act.actor}</span>
                        {act.role && <span>({act.role})</span>}
                        {act.status && (
                          <span
                            className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getStatusBadgeStyle(
                              act.status
                            )}`}
                          >
                            {normalizeIncidentStatus(act.status)}
                          </span>
                        )}
                      </div>
                      {act.notes && (
                        <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                          {act.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Field Note Form */}
              <form onSubmit={handlePostNote} className="flex gap-2 pt-3 border-t border-slate-200/70">
                <input
                  type="text"
                  placeholder="Append operational field log or observation note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Note</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
            Select an incident ticket to view workflow and actions.
          </div>
        )}
      </div>

      {/* Status Transition Confirmation Modal */}
      {showStatusModal && activeIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Update Incident Status</h3>
              </div>
              <button
                onClick={() => setShowStatusModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are changing the operational status of ticket{' '}
              <strong className="font-mono text-slate-900">{activeIncident.id}</strong> to:
            </p>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Target Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                  showStatusModal
                )}`}
              >
                {showStatusModal}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Operational Note / Action Rationale (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="E.g., Highway team deployed earthmovers; geotechnical survey complete..."
                value={statusUpdateNote}
                onChange={(e) => setStatusUpdateNote(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteStatusChange(showStatusModal)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Status Update</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Ground Evidence Photo</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={previewPhoto}
                alt="Enlarged Hazard Proof"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
