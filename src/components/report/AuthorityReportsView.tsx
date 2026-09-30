import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  X,
  FolderPlus,
  FolderGit2,
  Eye,
  Check,
  ShieldAlert,
  Phone,
  Mail,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { CitizenReport, ReportStatus, User, AuthorityNotification } from '../../types';
import { ReportLocationMap } from './ReportLocationMap';

interface AuthorityReportsViewProps {
  reports: CitizenReport[];
  currentUser: User;
  notifications?: AuthorityNotification[];
  onVerifyReport: (reportId: string) => void;
  onUpdateReportStatus?: (reportId: string, status: ReportStatus) => void;
  onCreateIncidentFromReport?: (report: CitizenReport) => void;
  onNavigateToLocation?: (locId: string) => void;
  onNavigateToIncident?: (incidentId: string) => void;
  initialSelectedReportId?: string | null;
  onClearInitialSelectedReportId?: () => void;
  onMarkNotificationRead?: (id: string) => void;
}

export const AuthorityReportsView: React.FC<AuthorityReportsViewProps> = ({
  reports,
  currentUser,
  notifications = [],
  onVerifyReport,
  onUpdateReportStatus,
  onCreateIncidentFromReport,
  onNavigateToLocation,
  onNavigateToIncident,
  initialSelectedReportId,
  onClearInitialSelectedReportId,
  onMarkNotificationRead,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [previewEnlargedPhoto, setPreviewEnlargedPhoto] = useState<string | null>(null);
  const [showNotificationsFeed, setShowNotificationsFeed] = useState<boolean>(true);

  const isAuthority =
    currentUser.role === 'authority' ||
    currentUser.role === 'field_officer' ||
    currentUser.role === 'admin';

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Automatically open report if passed from notification
  useEffect(() => {
    if (initialSelectedReportId) {
      const match = reports.find(
        (r) => r.id.toLowerCase() === initialSelectedReportId.trim().toLowerCase()
      );
      if (match) {
        setSelectedReport(match);
        setStatusFilter('all');
      }
      if (onClearInitialSelectedReportId) {
        onClearInitialSelectedReportId();
      }
    }
  }, [initialSelectedReportId, reports, onClearInitialSelectedReportId]);

  // Keep selected report synchronized if store updates
  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated && updated !== selectedReport) {
        setSelectedReport(updated);
      }
    }
  }, [reports, selectedReport]);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'New') return r.status === 'New';
    if (statusFilter === 'Under Review') return r.status === 'Under Review';
    if (statusFilter === 'Verified') return r.status === 'Verified';
    if (statusFilter === 'Incident Created') return r.status === 'Incident Created';
    if (statusFilter === 'Resolved') return r.status === 'Resolved' || r.status === 'Closed';
    if (statusFilter === 'Rejected') return r.status === 'Rejected';
    return true;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Incident Created':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Resolved':
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleStatusChange = (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    if (onUpdateReportStatus) {
      onUpdateReportStatus(selectedReport.id, newStatus);
    } else if (newStatus === 'Verified') {
      onVerifyReport(selectedReport.id);
    }
    setSelectedReport({ ...selectedReport, status: newStatus });
  };

  const handleCreateIncident = () => {
    if (!selectedReport) return;
    if (onCreateIncidentFromReport) {
      onCreateIncidentFromReport(selectedReport);
      setSelectedReport(null);
    }
  };

  // Auto mark linked notification as read when report is viewed
  useEffect(() => {
    if (selectedReport && onMarkNotificationRead) {
      const match = notifications.find(
        (n) => n.reportId.toLowerCase() === selectedReport.id.toLowerCase()
      );
      if (match && !match.isRead) {
        onMarkNotificationRead(match.id);
      }
    }
  }, [selectedReport, notifications, onMarkNotificationRead]);

  const linkedNotification = selectedReport
    ? notifications.find(
        (n) => n.reportId.toLowerCase() === selectedReport.id.toLowerCase()
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Authority Review Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Hazard Reports Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Incoming public hazard submissions, field validations, and rapid-response escalation.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-semibold">
          {[
            { id: 'all', label: `All (${reports.length})` },
            { id: 'New', label: `New (${reports.filter((r) => r.status === 'New').length})` },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Verified', label: 'Verified' },
            { id: 'Incident Created', label: 'Incident Created' },
            { id: 'Resolved', label: 'Resolved' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Notifications Feed for Submitted Reports */}
      {notifications.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Incoming Hazard Notifications
                  </h2>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                      {unreadCount} Unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      All Read
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Dynamic notification records generated from actual citizen hazard submissions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationsFeed(!showNotificationsFeed)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <span>{showNotificationsFeed ? 'Collapse' : 'Expand'}</span>
              {showNotificationsFeed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showNotificationsFeed && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !n.isRead
                        ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {n.id}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {n.reportId}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          n.riskStatus === 'NEW' || n.status === 'New'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : n.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {n.riskStatus || n.status || 'NEW'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="font-bold text-slate-900 text-xs">
                        {n.hazardType} Report
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {n.message}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="truncate max-w-[140px] flex items-center gap-1" title={n.location || n.locationName}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{n.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{n.time || n.createdAt}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-1">
                      {!n.isRead && onMarkNotificationRead ? (
                        <button
                          type="button"
                          onClick={() => onMarkNotificationRead(n.id)}
                          className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Mark as read
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Read</span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const rep = reports.find(
                            (r) => r.id.toLowerCase() === n.reportId.toLowerCase()
                          );
                          if (rep) {
                            setSelectedReport(rep);
                          }
                          if (onMarkNotificationRead) {
                            onMarkNotificationRead(n.id);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <span>Open Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 text-center font-medium">
                In-App Notification Dispatch Active · External SMS &amp; Email: Optional integration (credentials not configured)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Table / List (Section 11) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <div className="font-bold text-slate-800 text-sm">No reports match this filter.</div>
            <div className="mt-1">All reports in this category have been processed or resolved.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Hazard</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => {
                  const photosCount = report.photos?.length || (report.photoUrl ? 1 : 0);
                  const firstPhoto = report.photos?.[0] || report.photoUrl;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      {/* Report ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {report.id}
                      </td>

                      {/* Hazard */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {report.hazardType || 'Hazard'}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-900 truncate">
                          {report.locationName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {report.lat.toFixed(3)}°N, {report.lng.toFixed(3)}°E
                        </div>
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{report.timestamp}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4">
                        {firstPhoto ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                              <img
                                src={firstPhoto}
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {photosCount > 1 && (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                +{photosCount - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No photo</span>
                        )}
                      </td>

                      {/* Type Tag (Distinguish DEMO vs USER SUBMITTED) */}
                      <td className="py-3.5 px-4">
                        {report.source === 'USER_SUBMITTED' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
                            USER SUBMITTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider border border-slate-200">
                            DEMO DATA
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAuthority && report.status === 'Verified' && onCreateIncidentFromReport && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateIncidentFromReport(report);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                              title="Create Incident from Verified Report"
                            >
                              <FolderPlus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Create Incident</span>
                            </button>
                          )}
                          {isAuthority && report.status === 'Incident Created' && report.assignedIncidentId && onNavigateToIncident && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToIncident(report.assignedIncidentId!);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-xs flex items-center gap-1 border border-blue-200 cursor-pointer transition-colors"
                              title={`View Incident ${report.assignedIncidentId}`}
                            >
                              <FolderGit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{report.assignedIncidentId}</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          AUTHORITY REPORT DETAIL MODAL / PANEL (Section 12)
          ======================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-600">
                    {selectedReport.id}
                  </span>
                  {selectedReport.source === 'USER_SUBMITTED' ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                      USER SUBMITTED REPORT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] uppercase border border-slate-200">
                      DEMO DATA
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                      selectedReport.status
                    )}`}
                  >
                    {selectedReport.status}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedReport.hazardType}
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  {selectedReport.locationName}
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Linked Notification Info Banner */}
            {linkedNotification && (
              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-blue-950">Linked Notification:</span>
                      <span className="font-mono font-bold text-blue-900 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                        {linkedNotification.id}
                      </span>
                      <span className="text-[10px] text-blue-700">
                        ({linkedNotification.time || linkedNotification.createdAt})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!linkedNotification.isRead ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Unread Notification
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Notification Read
                    </span>
                  )}
                  {!linkedNotification.isRead && onMarkNotificationRead && (
                    <button
                      type="button"
                      onClick={() => onMarkNotificationRead(linkedNotification.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Map Preview & Location Coordinates (Section 12) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reported Coordinates &amp; Map Location</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {selectedReport.lat.toFixed(4)}° N, {selectedReport.lng.toFixed(4)}° E
                </span>
              </div>
              <ReportLocationMap
                lat={selectedReport.lat}
                lng={selectedReport.lng}
                locationName={selectedReport.locationName}
                interactive={false}
                height="190px"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-900">
                Citizen Observation Description:
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed">
                {selectedReport.description}
              </p>
            </div>

            {/* Photos Gallery */}
            {(selectedReport.photos?.length > 0 || selectedReport.photoUrl) && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Uploaded Photos ({selectedReport.photos?.length || 1}):
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(selectedReport.photos?.length > 0
                    ? selectedReport.photos
                    : [selectedReport.photoUrl!]
                  ).map((photoUrl, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 relative group cursor-pointer shadow-xs bg-slate-100"
                      onClick={() => setPreviewEnlargedPhoto(photoUrl)}
                    >
                      <img
                        src={photoUrl}
                        alt={`Evidence ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reporter Information & Privacy (Section 5 & 12) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Reporter Identity:</span>
                <span className="font-bold text-slate-800">
                  {selectedReport.isAnonymous ? 'Anonymous Reporter' : selectedReport.reporterName}
                </span>
              </div>

              {/* Confidential Contact Details (Authority Only) */}
              {isAuthority && (selectedReport.reporterPhone || selectedReport.reporterEmail) && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[10px] uppercase tracking-wider">
                    <Lock className="w-3 h-3" />
                    <span>Confidential Contact Details (Authorized Personnel Only)</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-slate-700 text-[11px] pt-0.5">
                    {selectedReport.reporterPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{selectedReport.reporterPhone}</span>
                      </span>
                    )}
                    {selectedReport.reporterEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{selectedReport.reporterEmail}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Geotechnical AI note (Section 12) */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
              <strong>Geotechnical Assessment:</strong> AI image analysis: Not available (Human authority review required). Physical geotechnical inspection recommended.
            </div>

            {/* Assigned Incident Tag if applicable */}
            {selectedReport.assignedIncidentId && (
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between font-medium">
                <span>Incident Ticket Dispatched: <strong>{selectedReport.assignedIncidentId}</strong></span>
              </div>
            )}

            {/* Authority Actions Bar (Section 13) */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-slate-400 text-[11px]">
                {isAuthority
                  ? 'Authority actions apply immediately.'
                  : 'Public view mode (Read-only).'}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>

                {isAuthority && (
                  <>
                    {/* Direct Status Selector Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-700">Status:</span>
                      <select
                        value={selectedReport.status}
                        onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
                        className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Verified">Verified</option>
                        <option value="Incident Created">Incident Created</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Mark Under Review */}
                    {selectedReport.status === 'New' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('Under Review')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Mark Under Review
                      </button>
                    )}

                    {/* Verify Report */}
                    {selectedReport.status !== 'Verified' &&
                      selectedReport.status !== 'Incident Created' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('Verified')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify Report</span>
                        </button>
                      )}

                    {/* Create Incident (from Verified Report) */}
                    {selectedReport.status === 'Verified' &&
                      onCreateIncidentFromReport && (
                        <button
                          type="button"
                          onClick={handleCreateIncident}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FolderPlus className="w-4 h-4" />
                          <span>Create Incident from Verified Report</span>
                        </button>
                      )}

                    {/* Quick Verify & Create Incident if not yet verified */}
                    {selectedReport.status !== 'Verified' &&
                      selectedReport.status !== 'Incident Created' &&
                      onCreateIncidentFromReport && (
                        <button
                          type="button"
                          onClick={() => {
                            handleStatusChange('Verified');
                            setTimeout(() => {
                              handleCreateIncident();
                            }, 50);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Verify &amp; Create Incident</span>
                        </button>
                      )}

                    {/* View Incident if already created */}
                    {selectedReport.status === 'Incident Created' &&
                      selectedReport.assignedIncidentId &&
                      onNavigateToIncident && (
                        <button
                          type="button"
                          onClick={() => onNavigateToIncident(selectedReport.assignedIncidentId!)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>View Incident ({selectedReport.assignedIncidentId})</span>
                        </button>
                      )}

                    {/* Resolve */}
                    {selectedReport.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('Resolved')}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    {/* Reject */}
                    {selectedReport.status !== 'Rejected' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange('Rejected')}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {previewEnlargedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewEnlargedPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Photo Proof Preview</span>
              <button
                onClick={() => setPreviewEnlargedPhoto(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-900">
              <img
                src={previewEnlargedPhoto}
                alt="Enlarged evidence"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
