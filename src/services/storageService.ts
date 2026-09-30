import {
  MonitoredLocation,
  WeatherRecord,
  SensorRecord,
  Alert,
  Incident,
  IncidentStatus,
  IncidentActivityItem,
  normalizeIncidentStatus,
  CitizenReport,
  ReportStatus,
  ReportActivityItem,
  User,
  UserRole,
  ThresholdConfig,
  AIPredictionResult,
  AuthorityNotification,
  PredictionHistoryRecord,
  AuditLogEntry,
} from '../types';
import {
  INITIAL_LOCATIONS,
  INITIAL_WEATHER,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  INITIAL_REPORTS,
  INITIAL_USERS,
  INITIAL_THRESHOLDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PREDICTION_HISTORY,
} from '../data/mockData';
import { aiPredictionService } from './aiPredictionService';
import { formatOperationalTimestamp } from '../utils/securityUtils';

type Listener = () => void;

class StateStore {
  private listeners: Set<Listener> = new Set();

  private locations: MonitoredLocation[] = [];
  private weather: WeatherRecord[] = [];
  private sensors: SensorRecord[] = [];
  private alerts: Alert[] = [];
  private incidents: Incident[] = [];
  private reports: CitizenReport[] = [];
  private notifications: AuthorityNotification[] = [];
  private predictionHistory: PredictionHistoryRecord[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private thresholds: ThresholdConfig = INITIAL_THRESHOLDS;
  private currentUser: User = INITIAL_USERS[0]; // Default: Authority
  private predictions: Map<string, AIPredictionResult> = new Map();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedLocations = localStorage.getItem('ner_locations');
      const parsedLocs = storedLocations ? JSON.parse(storedLocations) : INITIAL_LOCATIONS;
      this.locations = INITIAL_LOCATIONS.map((initLoc) => {
        const match = Array.isArray(parsedLocs) ? parsedLocs.find((p: MonitoredLocation) => p.id === initLoc.id) : null;
        return match
          ? {
              ...initLoc,
              ...match,
              hazardType: match.hazardType || initLoc.hazardType,
              mainContributingFactors: match.mainContributingFactors || initLoc.mainContributingFactors,
              isSimulated: true,
            }
          : initLoc;
      });

      const storedWeather = localStorage.getItem('ner_weather');
      this.weather = storedWeather ? JSON.parse(storedWeather) : INITIAL_WEATHER;

      const storedSensors = localStorage.getItem('ner_sensors');
      this.sensors = storedSensors ? JSON.parse(storedSensors) : INITIAL_SENSORS;

      const storedAlerts = localStorage.getItem('ner_alerts');
      this.alerts = storedAlerts ? JSON.parse(storedAlerts) : INITIAL_ALERTS;

      const storedIncidents = localStorage.getItem('ner_incidents');
      const rawIncidents: Incident[] = storedIncidents ? JSON.parse(storedIncidents) : INITIAL_INCIDENTS;
      this.incidents = rawIncidents.map((inc) => ({
        ...inc,
        status: normalizeIncidentStatus(inc.status),
        activityHistory: inc.activityHistory && inc.activityHistory.length > 0
          ? inc.activityHistory
          : this.generateFallbackIncidentHistory(inc),
      }));

      const storedReports = localStorage.getItem('ner_reports');
      this.reports = storedReports ? JSON.parse(storedReports) : INITIAL_REPORTS;

      const storedNotifications = localStorage.getItem('ner_notifications');
      let parsedNotifs: AuthorityNotification[] = storedNotifications ? JSON.parse(storedNotifications) : [];
      // Purge any legacy fake hardcoded notifications
      parsedNotifs = parsedNotifs.filter((n) => n.id !== 'NOTIF-001');
      this.notifications = parsedNotifs;

      const storedHistory = localStorage.getItem('ner_prediction_history');
      this.predictionHistory = storedHistory ? JSON.parse(storedHistory) : INITIAL_PREDICTION_HISTORY;

      const storedThresholds = localStorage.getItem('ner_thresholds');
      this.thresholds = storedThresholds ? JSON.parse(storedThresholds) : INITIAL_THRESHOLDS;

      const storedUser = localStorage.getItem('ner_current_user');
      this.currentUser = storedUser ? JSON.parse(storedUser) : INITIAL_USERS[0];

      const storedAudit = localStorage.getItem('ner_audit_logs');
      this.auditLogs = storedAudit ? JSON.parse(storedAudit) : this.generateSeedAuditLogs();
    } catch {
      this.locations = INITIAL_LOCATIONS;
      this.weather = INITIAL_WEATHER;
      this.sensors = INITIAL_SENSORS;
      this.alerts = INITIAL_ALERTS;
      this.incidents = INITIAL_INCIDENTS.map((inc) => ({
        ...inc,
        status: normalizeIncidentStatus(inc.status),
        activityHistory: inc.activityHistory && inc.activityHistory.length > 0
          ? inc.activityHistory
          : this.generateFallbackIncidentHistory(inc),
      }));
      this.reports = INITIAL_REPORTS;
      this.notifications = [];
      this.predictionHistory = INITIAL_PREDICTION_HISTORY;
      this.thresholds = INITIAL_THRESHOLDS;
      this.currentUser = INITIAL_USERS[0];
      this.auditLogs = this.generateSeedAuditLogs();
    }
    this.recomputePredictions();
  }

  private generateSeedAuditLogs(): AuditLogEntry[] {
    return [
      {
        id: 'AUD-2026-0001',
        timestamp: formatOperationalTimestamp('2026-09-30T04:15:00Z'),
        action: 'System Boot & Telemetry Network Initialized',
        category: 'CONFIG',
        actorName: 'System Core',
        actorRole: 'admin',
        details: 'Loaded 12 monitored sectors, 12 sensor nodes, and GIS hill corridor vectors.',
      },
      {
        id: 'AUD-2026-0002',
        timestamp: formatOperationalTimestamp('2026-09-30T04:30:12Z'),
        action: 'Critical Alert Verified',
        category: 'ALERT_ACTION',
        actorName: 'Disaster Management Authority',
        actorRole: 'authority',
        targetId: 'ALT-NER-2026-001',
        targetType: 'ALERT',
        details: 'Acknowledged high-risk alert for Dzüdza Bridge Sector (NH-29). Risk probability 92%.',
      },
      {
        id: 'AUD-2026-0003',
        timestamp: formatOperationalTimestamp('2026-09-30T05:00:22Z'),
        action: 'Citizen Hazard Report Verified',
        category: 'REPORT_ACTION',
        actorName: 'Field Officer',
        actorRole: 'field_officer',
        targetId: 'RPT-2026-00124',
        targetType: 'REPORT',
        details: 'Verified citizen report for Haflong-Jatinga Ridge. Photographic evidence of tension crack validated.',
      },
    ];
  }

  public logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName' | 'actorRole'> & {
    actorName?: string;
    actorRole?: UserRole;
    timestamp?: string;
  }): AuditLogEntry {
    const id = `AUD-2026-${String(this.auditLogs.length + 1).padStart(4, '0')}`;
    const newEntry: AuditLogEntry = {
      id,
      timestamp: entry.timestamp || formatOperationalTimestamp(),
      action: entry.action,
      category: entry.category,
      actorName: entry.actorName || this.currentUser.name,
      actorRole: entry.actorRole || this.currentUser.role,
      targetId: entry.targetId,
      targetType: entry.targetType,
      details: entry.details,
      isSimulated: entry.isSimulated,
    };
    this.auditLogs = [newEntry, ...this.auditLogs];
    this.saveState();
    return newEntry;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public recomputePredictions() {
    this.locations.forEach((loc) => {
      const pred = aiPredictionService.predictForLocation(
        loc,
        this.weather,
        this.sensors,
        this.reports
      );
      this.predictions.set(loc.id, pred);
    });
  }

  private saveState() {
    try {
      localStorage.setItem('ner_locations', JSON.stringify(this.locations));
      localStorage.setItem('ner_weather', JSON.stringify(this.weather));
      localStorage.setItem('ner_sensors', JSON.stringify(this.sensors));
      localStorage.setItem('ner_alerts', JSON.stringify(this.alerts));
      localStorage.setItem('ner_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('ner_reports', JSON.stringify(this.reports));
      localStorage.setItem('ner_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('ner_prediction_history', JSON.stringify(this.predictionHistory));
      localStorage.setItem('ner_thresholds', JSON.stringify(this.thresholds));
      localStorage.setItem('ner_current_user', JSON.stringify(this.currentUser));
      localStorage.setItem('ner_audit_logs', JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getLocations(): MonitoredLocation[] {
    return this.locations;
  }

  public getLocationById(id: string): MonitoredLocation | undefined {
    return this.locations.find((loc) => loc.id === id);
  }

  public getWeather(): WeatherRecord[] {
    return this.weather;
  }

  public getSensors(): SensorRecord[] {
    return this.sensors;
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getReports(): CitizenReport[] {
    return this.reports;
  }

  public getReportById(reportId: string): CitizenReport | undefined {
    return this.reports.find(
      (r) => r.id.toLowerCase() === reportId.trim().toLowerCase()
    );
  }

  public getNotifications(): AuthorityNotification[] {
    return this.notifications;
  }

  public getPredictionHistory(): PredictionHistoryRecord[] {
    return [...this.predictionHistory];
  }

  public addPredictionToHistory(
    record: Omit<PredictionHistoryRecord, 'prediction_id'> & { prediction_id?: string }
  ): PredictionHistoryRecord {
    const newRecord: PredictionHistoryRecord = {
      ...record,
      prediction_id: record.prediction_id || `PRED-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    this.predictionHistory = [newRecord, ...this.predictionHistory];
    this.saveState();
    return newRecord;
  }

  public clearPredictionHistory(): void {
    this.predictionHistory = [];
    this.saveState();
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.saveState();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.saveState();
  }

  public getThresholds(): ThresholdConfig {
    return this.thresholds;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public getPredictionForLocation(locId: string): AIPredictionResult {
    const existing = this.predictions.get(locId);
    if (existing) return existing;
    const loc = this.getLocationById(locId) || this.locations[0];
    const computed = aiPredictionService.predictForLocation(
      loc,
      this.weather,
      this.sensors,
      this.reports
    );
    this.predictions.set(loc.id, computed);
    return computed;
  }

  public getAllPredictions(): AIPredictionResult[] {
    return this.locations.map((loc) => this.getPredictionForLocation(loc.id));
  }

  public setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveState();
  }

  public setCurrentUserByRole(role: User['role']) {
    const found = INITIAL_USERS.find((u) => u.role === role);
    if (found) {
      this.currentUser = found;
      this.logAudit({
        action: `Session Identity Switched to ${found.name} (${found.role})`,
        category: 'SECURITY_AUTH',
        targetId: found.id,
        targetType: 'SESSION',
        details: `Active role updated to ${found.designation} (${found.department}).`,
      });
      this.saveState();
    }
  }

  // Actions
  public addReport(data: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>): CitizenReport {
    // Generate unique sequential report ID e.g. RPT-2026-00001 or RPT-2026-00125
    let maxSeq = 0;
    for (const r of this.reports) {
      const match = r.id.match(/^RPT-2026-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    const nextSeq = maxSeq + 1;
    const reportId = `RPT-2026-${String(nextSeq).padStart(5, '0')}`;

    const hazardName = data.hazardType || 'Other';
    const photos = data.photos && data.photos.length > 0
      ? data.photos
      : data.photoUrl
      ? [data.photoUrl]
      : [];

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;

    const initialActivity: ReportActivityItem = {
      id: `act-${Date.now()}-1`,
      status: 'New',
      action: 'Report Created',
      actor: data.isAnonymous ? 'Public User (Anonymous)' : (data.reporterName || 'Citizen Reporter'),
      role: data.isAnonymous ? 'Public User (Anonymous)' : 'Public Reporter',
      timestamp: timestampStr,
      notes: `Citizen hazard submission registered: ${hazardName} observed near ${data.locationName}.`,
    };

    const newReport: CitizenReport = {
      ...data,
      id: reportId,
      hazardType: hazardName,
      hazardTypes: data.hazardTypes || [hazardName],
      photos,
      photoUrl: photos[0] || undefined,
      timestamp: timestampStr,
      status: 'New',
      source: 'USER_SUBMITTED',
      aiAssistanceSummary: `Preliminary triage: Citizen hazard reported (${hazardName}). AI image analysis: Not available (Human authority review required). Priority flagged for field reconnaissance.`,
      activityHistory: [initialActivity],
    };

    // Add to reports list (newest first)
    this.reports = [newReport, ...this.reports];

    // Compute sequential Notification ID e.g. NOTIF-2026-00001
    let maxNotifSeq = 0;
    for (const n of this.notifications) {
      const match = n.id.match(/^NOTIF-2026-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNotifSeq) {
          maxNotifSeq = num;
        }
      }
    }
    const nextNotifSeq = maxNotifSeq + 1;
    const notifId = `NOTIF-2026-${String(nextNotifSeq).padStart(5, '0')}`;

    // Create dynamic in-app Authority Notification record from submitted report
    const locationFormatted = `${newReport.locationName} (${newReport.lat.toFixed(4)}°N, ${newReport.lng.toFixed(4)}°E)`;
    const newNotification: AuthorityNotification = {
      id: notifId,
      reportId: newReport.id,
      hazardType: hazardName,
      location: locationFormatted,
      locationName: newReport.locationName,
      lat: newReport.lat,
      lng: newReport.lng,
      riskStatus: 'NEW',
      status: 'New',
      time: timestampStr,
      createdAt: timestampStr,
      isRead: false,
      read: false,
      type: 'NEW_HAZARD_REPORT',
      title: 'NEW HAZARD REPORT',
      message: `Citizen reported ${hazardName} at ${newReport.locationName}.`,
      recipientRole: 'authority',
      photosCount: photos.length,
    };
    this.notifications = [newNotification, ...this.notifications];

    this.saveState();
    return newReport;
  }

  public generateFallbackHistory(report: CitizenReport): ReportActivityItem[] {
    const baseTime = report.timestamp || '28 Sep 2026 at 08:30 AM';
    const reporterName = report.isAnonymous
      ? 'Public User (Anonymous)'
      : (report.reporterName || 'Citizen Observer');

    const items: ReportActivityItem[] = [
      {
        id: `act-init-${report.id}-1`,
        status: 'New',
        action: 'Report Created',
        actor: reporterName,
        role: report.isAnonymous ? 'Public User (Anonymous)' : 'Public Reporter',
        timestamp: baseTime,
        notes: `Citizen hazard submission registered: ${report.hazardType} observed near ${report.locationName}.`,
      },
    ];

    if (report.status === 'New') {
      return items;
    }

    if (report.status === 'Under Review') {
      items.push({
        id: `act-init-${report.id}-2`,
        status: 'Under Review',
        action: 'Under Review',
        actor: 'Disaster Management Authority',
        role: 'Duty Operations Desk',
        timestamp: '1 hour after submission',
        notes: 'Assigned for geotechnical satellite & sensor telemetry correlation.',
      });
      return items;
    }

    if (report.status === 'Verified') {
      items.push(
        {
          id: `act-init-${report.id}-2`,
          status: 'Under Review',
          action: 'Under Review',
          actor: 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '1 hour after submission',
          notes: 'Preliminary triage confirmed slope distress indicators.',
        },
        {
          id: `act-init-${report.id}-3`,
          status: 'Verified',
          action: 'Report Verified',
          actor: report.verifiedBy || 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '2 hours after submission',
          notes: 'Field intelligence and slope hazard severity confirmed valid.',
        }
      );
      return items;
    }

    if (report.status === 'Incident Created') {
      items.push(
        {
          id: `act-init-${report.id}-2`,
          status: 'Under Review',
          action: 'Under Review',
          actor: 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '1 hour after submission',
          notes: 'Preliminary triage confirmed slope distress indicators.',
        },
        {
          id: `act-init-${report.id}-3`,
          status: 'Verified',
          action: 'Report Verified',
          actor: report.verifiedBy || 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '2 hours after submission',
          notes: 'Field intelligence and slope hazard severity confirmed valid.',
        },
        {
          id: `act-init-${report.id}-4`,
          status: 'Incident Created',
          action: `Incident Created (${report.assignedIncidentId || 'INC-2026-001'})`,
          actor: 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '3 hours after submission',
          notes: 'Emergency operational dispatch ticket issued.',
        }
      );
      return items;
    }

    if (report.status === 'Resolved' || report.status === 'Closed') {
      items.push(
        {
          id: `act-init-${report.id}-2`,
          status: 'Under Review',
          action: 'Under Review',
          actor: 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '1 hour after submission',
          notes: 'Preliminary triage confirmed slope distress indicators.',
        },
        {
          id: `act-init-${report.id}-3`,
          status: 'Verified',
          action: 'Report Verified',
          actor: report.verifiedBy || 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '2 hours after submission',
          notes: 'Field intelligence and slope hazard severity confirmed valid.',
        },
        {
          id: `act-init-${report.id}-4`,
          status: 'Resolved',
          action: 'Report Resolved',
          actor: report.verifiedBy || 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '4 hours after submission',
          notes: 'Hazard barrier installed and slope movement stabilized.',
        }
      );
      if (report.status === 'Closed') {
        items.push({
          id: `act-init-${report.id}-5`,
          status: 'Closed',
          action: 'Report Closed',
          actor: 'Disaster Management Authority',
          role: 'Duty Operations Desk',
          timestamp: '5 hours after submission',
          notes: 'Post-incident slope audit completed. File formally archived.',
        });
      }
      return items;
    }

    if (report.status === 'Rejected') {
      items.push({
        id: `act-init-${report.id}-2`,
        status: 'Rejected',
        action: 'Report Rejected',
        actor: 'Disaster Management Authority',
        role: 'Duty Operations Desk',
        timestamp: '1 hour after submission',
        notes: 'Physical reconnaissance revealed non-hazardous surface grading. No intervention required.',
      });
      return items;
    }

    return items;
  }

  public generateFallbackIncidentHistory(inc: Incident): IncidentActivityItem[] {
    const items: IncidentActivityItem[] = [
      {
        id: `inc-act-init-${inc.id}-1`,
        status: 'NEW',
        action: inc.originAlertId ? `Incident Created from Alert ${inc.originAlertId}` : inc.relatedReportId ? `Incident Created from Report ${inc.relatedReportId}` : 'Incident Created',
        actor: inc.assignedOfficer || 'Disaster Management Authority',
        role: inc.assignedRole || 'Duty Operations Desk',
        timestamp: inc.createdAt || 'Initial Incident Registration',
        notes: inc.description || 'Emergency incident ticket opened.',
      },
    ];

    const currentStatus = normalizeIncidentStatus(inc.status);
    if (
      currentStatus === 'ACKNOWLEDGED' ||
      currentStatus === 'INVESTIGATING' ||
      currentStatus === 'ACTION IN PROGRESS' ||
      currentStatus === 'RESOLVED' ||
      currentStatus === 'CLOSED'
    ) {
      items.push({
        id: `inc-act-init-${inc.id}-2`,
        status: 'ACKNOWLEDGED',
        action: 'Incident Acknowledged',
        actor: inc.assignedOfficer || 'Disaster Management Authority',
        role: inc.assignedRole || 'Operations Controller',
        timestamp: '15 mins after creation',
        notes: 'Priority dispatch acknowledged by regional response headquarters.',
      });
    }

    if (
      currentStatus === 'INVESTIGATING' ||
      currentStatus === 'ACTION IN PROGRESS' ||
      currentStatus === 'RESOLVED' ||
      currentStatus === 'CLOSED'
    ) {
      items.push({
        id: `inc-act-init-${inc.id}-3`,
        status: 'INVESTIGATING',
        action: 'Investigation In Progress',
        actor: inc.assignedOfficer || 'Geotechnical Squad Lead',
        role: inc.assignedRole || 'Field Engineering Team',
        timestamp: '45 mins after creation',
        notes: 'Field reconnaissance team deployed with portable inclinometer prisms.',
      });
    }

    if (
      currentStatus === 'ACTION IN PROGRESS' ||
      currentStatus === 'RESOLVED' ||
      currentStatus === 'CLOSED'
    ) {
      items.push({
        id: `inc-act-init-${inc.id}-4`,
        status: 'ACTION IN PROGRESS',
        action: 'Action In Progress',
        actor: inc.assignedOfficer || 'SDRF Rapid Team',
        role: inc.assignedRole || 'Highway Response Unit',
        timestamp: '2 hours after creation',
        notes: 'Traffic diversion checkpoints active and barrier stabilization commenced.',
      });
    }

    if (currentStatus === 'RESOLVED' || currentStatus === 'CLOSED') {
      items.push({
        id: `inc-act-init-${inc.id}-5`,
        status: 'RESOLVED',
        action: 'Incident Resolved',
        actor: inc.assignedOfficer || 'Disaster Management Authority',
        role: inc.assignedRole || 'Operations Controller',
        timestamp: '4 hours after creation',
        notes: 'Slope stabilized, road cleared, and continuous monitoring activated.',
      });
    }

    if (currentStatus === 'CLOSED') {
      items.push({
        id: `inc-act-init-${inc.id}-6`,
        status: 'CLOSED',
        action: 'Incident Closed',
        actor: 'Disaster Management Authority',
        role: 'Duty Operations Desk',
        timestamp: '6 hours after creation',
        notes: 'Post-action slope engineering debrief completed and ticket archived.',
      });
    }

    return items;
  }

  public updateReportStatus(reportId: string, status: ReportStatus, verifiedBy?: string, notes?: string) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;

    this.reports = this.reports.map((r) => {
      if (r.id === reportId) {
        const actorName = verifiedBy || r.verifiedBy || this.currentUser.name;
        const actorRole = this.currentUser.designation || 'Duty Operations Desk';

        let actionTitle = `Status changed to ${status}`;
        if (status === 'Under Review') actionTitle = 'Under Review';
        else if (status === 'Verified') actionTitle = 'Report Verified';
        else if (status === 'Incident Created') actionTitle = 'Incident Created';
        else if (status === 'Resolved') actionTitle = 'Report Resolved';
        else if (status === 'Closed') actionTitle = 'Report Closed';
        else if (status === 'Rejected') actionTitle = 'Report Rejected';
        else if (status === 'New') actionTitle = 'Re-opened as New';

        const historyItem: ReportActivityItem = {
          id: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          status,
          action: actionTitle,
          actor: actorName,
          role: actorRole,
          timestamp: timestampStr,
          notes: notes || undefined,
        };

        const existingHistory = r.activityHistory && r.activityHistory.length > 0
          ? r.activityHistory
          : this.generateFallbackHistory(r);

        return {
          ...r,
          status,
          verifiedBy: actorName,
          activityHistory: [...existingHistory, historyItem],
        };
      }
      return r;
    });

    // Synchronize notification status with report
    this.notifications = this.notifications.map((n) => {
      if (n.reportId === reportId) {
        return {
          ...n,
          status,
          riskStatus: status.toUpperCase(),
        };
      }
      return n;
    });

    this.saveState();
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return { ...a, status: 'acknowledged' as const, assignedTo: this.currentUser.name };
      }
      return a;
    });

    if (alert) {
      this.logAudit({
        action: `Alert ${alertId} Acknowledged`,
        category: 'ALERT_ACTION',
        targetId: alertId,
        targetType: 'ALERT',
        details: `Disaster Management Authority acknowledged warning for ${alert.locationName} (${alert.state}). Risk level: ${alert.riskLevel.toUpperCase()}.`,
        isSimulated: alert.isSimulated,
      });
    }

    this.saveState();
  }

  public createIncidentFromAlert(alertId: string, customOfficer?: string): Incident | null {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return null;

    // If an incident is already associated with this alert, return it
    if (alert.incidentId) {
      const existing = this.incidents.find((i) => i.id === alert.incidentId);
      if (existing) return existing;
    }

    let maxIncSeq = 0;
    for (const inc of this.incidents) {
      const match = inc.id.match(/^INC-2026-(\d{5})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxIncSeq) {
          maxIncSeq = num;
        }
      }
    }
    const nextIncSeq = maxIncSeq + 1;
    const incidentId = `INC-2026-${String(nextIncSeq).padStart(5, '0')}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;

    const newIncident: Incident = {
      id: incidentId,
      title: alert.isSimulated
        ? `[SIMULATED] High-Risk Surcharge at ${alert.locationName}`
        : `${alert.locationName} Landslide Risk Surcharge`,
      locationId: alert.locationId,
      locationName: alert.locationName,
      state: alert.state,
      severity: alert.riskLevel === 'critical' ? 'Critical' : alert.riskLevel === 'high' ? 'High' : 'Moderate',
      status: 'NEW',
      createdAt: timestampStr,
      updatedAt: timestampStr,
      assignedOfficer: customOfficer || this.currentUser.name || 'Field Officer (SDRF Rapid Team)',
      assignedRole: this.currentUser.designation || 'Authority Operations Desk',
      hazardType: alert.isSimulated ? 'Simulated Landslide' : 'Landslide',
      description: `Elevated from Alert ${alert.id}. Rainfall 24h: ${alert.rainfall24h}mm, Soil Moisture: ${alert.soilMoisture}%. Factors: ${alert.contributingFactors.join('; ')}`,
      originAlertId: alert.id,
      isSimulated: alert.isSimulated || false,
      notes: [
        {
          id: `note-${Date.now()}-1`,
          author: this.currentUser.name,
          role: this.currentUser.designation || 'Duty Operations Desk',
          timestamp: timestampStr,
          content: `Incident ticket created from ${alert.isSimulated ? 'Simulated ' : ''}Alert ${alert.id} by ${this.currentUser.name}. Response protocol initiated.`,
        },
      ],
      activityHistory: [
        {
          id: `inc-act-${Date.now()}-1`,
          status: 'NEW',
          action: `Incident Created from ${alert.isSimulated ? 'Simulated ' : ''}Alert ${alert.id}`,
          actor: this.currentUser.name,
          role: this.currentUser.designation || 'Duty Operations Desk',
          timestamp: timestampStr,
          notes: `Incident escalated from ${alert.isSimulated ? 'Simulated ' : ''}Alert ${alert.id}. Rainfall: ${alert.rainfall24h}mm/24h, Soil Moisture: ${alert.soilMoisture}%.`,
        },
      ],
    };

    // Link alert
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return { ...a, incidentId: newIncident.id };
      }
      return a;
    });

    this.incidents = [newIncident, ...this.incidents];
    this.logAudit({
      action: `Incident Ticket ${newIncident.id} Created`,
      category: 'INCIDENT_ACTION',
      targetId: newIncident.id,
      targetType: 'INCIDENT',
      details: `Created incident "${newIncident.title}" from alert ${alertId} at ${newIncident.locationName}.`,
      isSimulated: newIncident.isSimulated,
    });
    this.saveState();
    return newIncident;
  }

  public convertReportToIncident(reportId: string, title?: string, officer?: string): Incident | null {
    const rep = this.reports.find((r) => r.id === reportId);
    if (!rep) return null;

    let maxIncSeq = 0;
    for (const inc of this.incidents) {
      const match = inc.id.match(/^INC-2026-(\d{5})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxIncSeq) {
          maxIncSeq = num;
        }
      }
    }
    const nextIncSeq = maxIncSeq + 1;
    const incidentId = `INC-2026-${String(nextIncSeq).padStart(5, '0')}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;

    const photos = rep.photos && rep.photos.length > 0
      ? [...rep.photos]
      : rep.photoUrl
      ? [rep.photoUrl]
      : [];

    const assignedOfficerName = officer || this.currentUser.name || 'SDRF Rapid Response Team';
    const assignedOfficerRole = this.currentUser.designation || 'Disaster Management Authority';
    const matchedLoc = this.locations.find((l) => l.name.toLowerCase() === rep.locationName.toLowerCase());
    const locationId = rep.locationId || matchedLoc?.id || 'LOC-GEN';

    const newIncident: Incident = {
      id: incidentId,
      title: title || `${rep.hazardType} Incident at ${rep.locationName}`,
      locationId,
      locationName: rep.locationName,
      state: rep.state,
      severity:
        rep.hazardType === 'Landslide' || (rep.visibleCracks && rep.soilMovement)
          ? 'Critical'
          : 'High',
      status: 'NEW',
      createdAt: timestampStr,
      updatedAt: timestampStr,
      assignedOfficer: assignedOfficerName,
      assignedRole: assignedOfficerRole,
      hazardType: rep.hazardType,
      description: rep.description,
      photos,
      photoUrl: photos[0],
      lat: rep.lat,
      lng: rep.lng,
      relatedReportId: rep.id,
      sourceReportId: rep.id,
      reportTime: rep.timestamp,
      sourceReportTime: rep.timestamp,
      evacuationOrdered: false,
      notes: [
        {
          id: `note-${Date.now()}-1`,
          author: this.currentUser.name,
          role: assignedOfficerRole,
          timestamp: timestampStr,
          content: `Incident ticket created from verified report ${rep.id} (${rep.hazardType}). Immediate ground reconnaissance and barrier installation dispatched.`,
        },
      ],
      activityHistory: [
        {
          id: `inc-act-${Date.now()}-1`,
          status: 'NEW',
          action: 'Incident Created from Verified Report',
          actor: this.currentUser.name,
          role: assignedOfficerRole,
          timestamp: timestampStr,
          notes: `Incident ticket generated from verified hazard report ${rep.id} (${rep.hazardType} at ${rep.locationName}). Copied coordinates (${rep.lat.toFixed(4)}°N, ${rep.lng.toFixed(4)}°E), ${photos.length} photo(s), and original citizen description.`,
        },
      ],
    };

    this.reports = this.reports.map((r) => {
      if (r.id === reportId) {
        const existingHistory = r.activityHistory && r.activityHistory.length > 0
          ? r.activityHistory
          : this.generateFallbackHistory(r);

        const incActivityItem: ReportActivityItem = {
          id: `act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          status: 'Incident Created',
          action: `Incident Created (${newIncident.id})`,
          actor: this.currentUser.name,
          role: assignedOfficerRole,
          timestamp: timestampStr,
          notes: `Report escalated to Incident Ticket ${newIncident.id}. Rapid field teams and response units dispatched.`,
        };

        return {
          ...r,
          status: 'Incident Created',
          assignedIncidentId: newIncident.id,
          verifiedBy: this.currentUser.name,
          activityHistory: [...existingHistory, incActivityItem],
        };
      }
      return r;
    });

    // Synchronize notification status
    this.notifications = this.notifications.map((n) => {
      if (n.reportId === reportId) {
        return {
          ...n,
          status: 'Incident Created',
          riskStatus: 'INCIDENT CREATED',
        };
      }
      return n;
    });

    this.incidents = [newIncident, ...this.incidents];
    this.saveState();
    return newIncident;
  }

  public updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    noteContent?: string,
    officerName?: string,
    officerRole?: string
  ) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;
    const normalized = normalizeIncidentStatus(status);

    this.incidents = this.incidents.map((inc) => {
      if (inc.id === incidentId) {
        const actorName = officerName || this.currentUser.name || 'Duty Operations Desk';
        const actorRole = officerRole || this.currentUser.designation || 'Authority Operations Desk';

        const updatedNotes = [...(inc.notes || [])];
        if (noteContent && noteContent.trim()) {
          updatedNotes.push({
            id: `note-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            author: actorName,
            role: actorRole,
            timestamp: timestampStr,
            content: noteContent.trim(),
          });
        }

        const existingTimeline = inc.activityHistory && inc.activityHistory.length > 0
          ? inc.activityHistory
          : this.generateFallbackIncidentHistory(inc);

        const newActivityItem: IncidentActivityItem = {
          id: `inc-act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          status: normalized,
          action: `Status updated to ${normalized}`,
          actor: actorName,
          role: actorRole,
          timestamp: timestampStr,
          notes: noteContent?.trim() || `Operational status progressed to ${normalized}.`,
        };

        return {
          ...inc,
          status: normalized,
          updatedAt: timestampStr,
          notes: updatedNotes,
          activityHistory: [...existingTimeline, newActivityItem],
        };
      }
      return inc;
    });

    const targetInc = this.incidents.find((i) => i.id === incidentId);
    this.logAudit({
      action: `Incident ${incidentId} Status Transition: ${normalized}`,
      category: 'INCIDENT_ACTION',
      targetId: incidentId,
      targetType: 'INCIDENT',
      details: `Status progressed to ${normalized} by ${officerName || this.currentUser.name}. ${noteContent ? `Note: "${noteContent}"` : ''}`,
      isSimulated: targetInc?.isSimulated,
    });

    this.saveState();
  }

  public addIncidentNote(incidentId: string, content: string) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestampStr = `${formattedDate} at ${formattedTime}`;

    this.incidents = this.incidents.map((inc) => {
      if (inc.id === incidentId) {
        const actorName = this.currentUser.name;
        const actorRole = this.currentUser.designation || this.currentUser.role || 'Duty Operations Desk';

        const newNote = {
          id: `note-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          author: actorName,
          role: actorRole,
          timestamp: timestampStr,
          content: content.trim(),
        };

        const existingTimeline = inc.activityHistory && inc.activityHistory.length > 0
          ? inc.activityHistory
          : this.generateFallbackIncidentHistory(inc);

        const newActivityItem: IncidentActivityItem = {
          id: `inc-act-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          status: normalizeIncidentStatus(inc.status),
          action: 'Operational Field Note Added',
          actor: actorName,
          role: actorRole,
          timestamp: timestampStr,
          notes: content.trim(),
        };

        return {
          ...inc,
          updatedAt: timestampStr,
          notes: [...(inc.notes || []), newNote],
          activityHistory: [...existingTimeline, newActivityItem],
        };
      }
      return inc;
    });

    this.saveState();
  }

  public updateThresholds(newThresholds: Partial<ThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.saveState();
  }

  // Feature: Simulate High-Risk Event (Demo Feature)
  public simulateHighRiskEvent(
    targetLocationId?: string,
    customValues?: { rainfall?: number; soilMoisture?: number; groundMovement?: number }
  ): { alert: Alert; notification: AuthorityNotification; incident?: Incident } {
    const locId = targetLocationId || 'LOC-MZ-05'; // Champhai by default or specified
    const loc = this.locations.find((l) => l.id === locId) || this.locations[0];

    // 1. Simulate increasing rainfall, soil moisture, and ground movement
    const simulatedRain24h = customValues?.rainfall !== undefined
      ? customValues.rainfall
      : Math.round((loc.rainfall24h + 75.4) * 10) / 10;
    const simulatedSoilMoist = customValues?.soilMoisture !== undefined
      ? customValues.soilMoisture
      : Math.min(96, Math.round((loc.soilMoisture + 22.0) * 10) / 10);
    const simulatedMovement = customValues?.groundMovement !== undefined
      ? customValues.groundMovement
      : Math.round((loc.groundMovementRate + 5.2) * 10) / 10;

    // 2. Run AI Prediction Engine on simulated conditions
    const aiPrediction = aiPredictionService.predictForLocation(
      {
        ...loc,
        rainfall24h: simulatedRain24h,
        rainfall72h: loc.rainfall72h + 90,
        soilMoisture: simulatedSoilMoist,
        groundMovementRate: simulatedMovement,
        poreWaterPressure: loc.poreWaterPressure + 26.5,
      },
      this.weather,
      this.sensors,
      this.reports
    );

    const calculatedRiskProbability = Math.max(aiPrediction.riskProbability || 0, 94);

    // 3. Update Monitored Location with increased values and calculated risk
    this.locations = this.locations.map((l) => {
      if (l.id === loc.id) {
        return {
          ...l,
          riskLevel: 'critical' as const,
          riskProbability: calculatedRiskProbability,
          rainfall24h: simulatedRain24h,
          rainfall72h: l.rainfall72h + 90,
          soilMoisture: simulatedSoilMoist,
          groundMovementRate: simulatedMovement,
          poreWaterPressure: l.poreWaterPressure + 26.5,
          lastUpdated: 'Surge Triggered Just Now (Simulated)',
          activeAdvisory: 'CRITICAL ALERT: Sudden slope acceleration detected. Evacuate downstream gullies.',
        };
      }
      return l;
    });

    // 4. Update Weather record
    this.weather = this.weather.map((w) => {
      if (w.locationId === loc.id) {
        return {
          ...w,
          rainfall24h: simulatedRain24h,
          rainfallIntensity: 36.5,
          intensityCategory: 'Extremely Heavy',
          forecast24h: 'Extreme cloudburst simulation in progress. Extreme saturated runoff.',
          updatedAt: 'Live Surge Triggered (Simulated)',
        };
      }
      return w;
    });

    // 5. Update Sensors
    this.sensors = this.sensors.map((s) => {
      if (s.locationId === loc.id) {
        if (s.sensorType === 'Inclinometer') {
          return { ...s, metricValue: simulatedMovement, status: 'critical', lastPing: 'Live Surge (Simulated)' };
        }
        if (s.sensorType === 'TDR Soil Moisture') {
          return { ...s, metricValue: simulatedSoilMoist, status: 'critical', lastPing: 'Live Surge (Simulated)' };
        }
      }
      return s;
    });

    this.predictions.set(loc.id, {
      ...aiPrediction,
      riskProbability: calculatedRiskProbability,
      riskLevel: 'critical',
    });

    // 6. Create a Simulated High-Risk Alert
    const alertId = `ALT-SIM-${Date.now().toString().slice(-4)}`;
    const newAlert: Alert = {
      id: alertId,
      locationId: loc.id,
      locationName: loc.name,
      state: loc.state,
      riskLevel: 'critical',
      riskProbability: calculatedRiskProbability,
      rainfall24h: simulatedRain24h,
      soilMoisture: simulatedSoilMoist,
      slope: loc.slope,
      groundMovement: simulatedMovement,
      contributingFactors: [
        `Extreme 24h Rainfall: ${simulatedRain24h} mm (Critical Cloudburst Surcharge)`,
        `Soil Saturation: ${simulatedSoilMoist}% VWC (Liquefaction Danger)`,
        `Active Slope Creep: ${simulatedMovement} mm/day (Shear Failure Imminent)`,
        `AI Warning: ${aiPrediction.whyThisRisk?.summary || 'Geotechnical displacement threshold breached'}`,
      ],
      timestamp: 'Triggered just now (Simulated)',
      status: 'active',
      severity: 'urgent',
      isSimulated: true,
    };
    this.alerts = [newAlert, ...this.alerts];

    // 7. Create an Authority Notification
    const notifId = `NOTIF-SIM-${Date.now().toString().slice(-4)}`;
    const newNotification: AuthorityNotification = {
      id: notifId,
      reportId: alertId,
      hazardType: 'Landslide Risk Surcharge (Simulated)',
      location: `${loc.name} (${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E)`,
      locationName: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      riskStatus: 'CRITICAL (SIMULATED)',
      status: 'active',
      time: 'Just now (Simulated)',
      createdAt: 'Just now',
      isRead: false,
      type: 'HIGH_RISK_ALERT',
      title: `SIMULATED HIGH-RISK ALERT: ${loc.name}`,
      message: `Simulated rainfall increased to ${simulatedRain24h} mm, soil moisture to ${simulatedSoilMoist}%, ground movement to ${simulatedMovement} mm/d. Calculated risk probability escalated to ${calculatedRiskProbability}%.`,
      isSimulated: true,
    };
    this.notifications = [newNotification, ...this.notifications];

    this.logAudit({
      action: `High-Risk Simulation Triggered: ${loc.name}`,
      category: 'SIMULATION',
      targetId: alertId,
      targetType: 'ALERT',
      details: `Simulated rainfall increased to ${simulatedRain24h}mm, moisture to ${simulatedSoilMoist}%, movement to ${simulatedMovement}mm/d. Alert ${alertId} generated.`,
      isSimulated: true,
    });

    this.saveState();
    return { alert: newAlert, notification: newNotification };
  }

  public resetToDefaultData() {
    this.locations = INITIAL_LOCATIONS;
    this.weather = INITIAL_WEATHER;
    this.sensors = INITIAL_SENSORS;
    this.alerts = INITIAL_ALERTS;
    this.incidents = INITIAL_INCIDENTS;
    this.reports = INITIAL_REPORTS;
    this.thresholds = INITIAL_THRESHOLDS;
    this.currentUser = INITIAL_USERS[0];
    this.recomputePredictions();
    this.saveState();
  }
}

export const store = new StateStore();
