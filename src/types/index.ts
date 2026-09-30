export type UserRole = 'public' | 'field_officer' | 'authority' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  email: string;
  avatar?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'insufficient_data';

export interface MonitoredLocation {
  id: string;
  name: string;
  district: string;
  state: 'Assam' | 'Meghalaya' | 'Sikkim' | 'Nagaland' | 'Mizoram' | 'Manipur' | 'Arunachal Pradesh' | 'Tripura';
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  riskProbability: number; // 0 - 100
  hazardType?: string; // e.g. 'Landslide' | 'Flash Flood' | 'Severe Storm' | 'Ground Movement'
  mainContributingFactors?: string[];
  isSimulated?: boolean;
  rainfall1h: number; // mm
  rainfall24h: number; // mm
  rainfall72h: number; // mm
  soilMoisture: number; // % (VWC)
  slope: number; // degrees
  elevation: number; // meters
  groundMovementRate: number; // mm/day
  poreWaterPressure: number; // kPa
  lastUpdated: string; // ISO or formatted
  sensorNodeId: string;
  sensorStatus: 'online' | 'degraded' | 'offline';
  soilType: string;
  lithology: string;
  activeAdvisory?: string;
  historicalEventsCount: number;
}

export interface WeatherRecord {
  locationId: string;
  locationName: string;
  temperature: number; // °C
  humidity: number; // %
  rainfall1h: number;
  rainfall6h: number;
  rainfall24h: number;
  rainfall48h: number;
  rainfall72h: number;
  rainfallIntensity: number; // mm/hr
  intensityCategory: 'Normal' | 'Moderate' | 'Heavy' | 'Very Heavy' | 'Extremely Heavy';
  windSpeed: number; // km/h
  atmosphericPressure: number; // hPa
  forecast24h: string;
  updatedAt: string;
}

export interface SensorRecord {
  sensorId: string;
  locationId: string;
  locationName: string;
  sensorType: 'Inclinometer' | 'Piezometer' | 'TDR Soil Moisture' | 'Tipping Bucket Rain Gauge' | 'Geophone';
  metricValue: number;
  unit: string;
  thresholdWarn: number;
  thresholdDanger: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  batteryPercent: number;
  connectivity: '4G LTE' | 'LoRaWAN' | 'Satellite';
  signalStrength: number; // %
  lastPing: string;
}

export interface Alert {
  id: string;
  locationId: string;
  locationName: string;
  state: string;
  riskLevel: RiskLevel;
  riskProbability: number;
  rainfall24h: number;
  soilMoisture: number;
  slope: number;
  groundMovement: number;
  contributingFactors: string[];
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  severity: 'warning' | 'priority' | 'urgent';
  assignedTo?: string;
  incidentId?: string;
  isSimulated?: boolean;
}

export type IncidentStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'ACTION IN PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'New'
  | 'Acknowledged'
  | 'Investigating'
  | 'Action In Progress'
  | 'Resolved'
  | 'Closed';

export type CanonicalIncidentStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'ACTION IN PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export function normalizeIncidentStatus(status?: string): CanonicalIncidentStatus {
  if (!status) return 'NEW';
  const clean = status.trim().toUpperCase();
  if (clean === 'NEW') return 'NEW';
  if (clean === 'ACKNOWLEDGED') return 'ACKNOWLEDGED';
  if (clean === 'INVESTIGATING') return 'INVESTIGATING';
  if (
    clean === 'ACTION IN PROGRESS' ||
    clean === 'ACTION_IN_PROGRESS' ||
    clean === 'ACTIONINPROGRESS'
  )
    return 'ACTION IN PROGRESS';
  if (clean === 'RESOLVED') return 'RESOLVED';
  if (clean === 'CLOSED') return 'CLOSED';
  return 'NEW';
}

export interface IncidentActivityItem {
  id: string;
  status: IncidentStatus;
  action: string;
  actor: string;
  role?: string;
  timestamp: string;
  notes?: string;
}

export interface IncidentNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

export interface Incident {
  id: string; // e.g. INC-2026-00001
  title: string;
  locationId: string;
  locationName: string;
  state: string;
  severity: 'Moderate' | 'High' | 'Critical';
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
  assignedRole?: string;
  description: string;
  hazardType?: string;
  notes: IncidentNote[];
  activityHistory?: IncidentActivityItem[];
  originAlertId?: string;
  relatedReportId?: string; // e.g. RPT-2026-00123
  sourceReportId?: string; // alias for relatedReportId
  reportTime?: string; // submission time of source report
  sourceReportTime?: string;
  evacuationOrdered?: boolean;
  photos?: string[];
  photoUrl?: string;
  lat?: number;
  lng?: number;
  isSimulated?: boolean;
}

export type ReportStatus =
  | 'New'
  | 'Under Review'
  | 'Verified'
  | 'Incident Created'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export interface ReportActivityItem {
  id: string;
  status: ReportStatus;
  action: string;
  actor: string;
  role?: string;
  timestamp: string;
  notes?: string;
}

export interface CitizenReport {
  id: string; // e.g. RPT-2026-00124
  locationId?: string;
  locationName: string;
  state: string;
  lat: number;
  lng: number;
  hazardType: string;
  hazardTypes?: string[];
  description: string;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  isAnonymous: boolean;
  timestamp: string;
  photos: string[];
  photoUrl?: string; // backwards compatibility
  visibleCracks: boolean;
  waterSeepage: boolean;
  soilMovement: boolean;
  rockfallDebris: boolean;
  roadDamage: boolean;
  heavyRainfall: boolean;
  status: ReportStatus;
  verifiedBy?: string;
  assignedIncidentId?: string;
  aiAssistanceSummary?: string;
  source?: 'USER_SUBMITTED' | 'DEMO_DATA';
  activityHistory?: ReportActivityItem[];
}

export interface AuthorityNotification {
  id: string; // Notification ID e.g. NOTIF-2026-00001
  reportId: string; // Report ID e.g. RPT-2026-00001
  hazardType: string; // Hazard category e.g. Landslide, Flood, etc.
  location: string; // Location string with coordinates e.g. "Haflong - Jatinga Ridge (25.1780°N, 93.0320°E)"
  locationName: string;
  lat?: number;
  lng?: number;
  riskStatus: string; // Risk/status e.g. "NEW", "UNDER REVIEW", "VERIFIED"
  status: ReportStatus | string; // Synced report status
  time: string; // Human-readable submitted time
  createdAt: string;
  isRead: boolean; // Read/unread state
  read?: boolean;
  type?: 'NEW_HAZARD_REPORT' | 'HIGH_RISK_ALERT' | 'INCIDENT_CREATED';
  title?: string;
  message?: string;
  recipientRole?: UserRole;
  photosCount?: number;
  isSimulated?: boolean;
}

export interface ThresholdConfig {
  rain24hWarningMm: number;
  rain24hCriticalMm: number;
  soilMoistureWarningPercent: number;
  soilMoistureCriticalPercent: number;
  inclinometerWarningMmPerDay: number;
  inclinometerCriticalMmPerDay: number;
  porePressureWarningKpa: number;
}

// ==========================================
// PHASE 2: AI / ML RISK PREDICTION TYPES
// ==========================================

export interface LandslideFeatureVector {
  rainfall1h: number; // mm in last 1 hour
  rainfall6h: number; // mm in last 6 hours
  rainfall24h: number; // mm in last 24 hours
  rainfall48h: number; // mm in last 48 hours
  rainfall72h: number; // mm in last 72 hours
  rainfallIntensity: number; // mm/hr peak
  soilMoisture: number; // % Volumetric Water Content
  soilType: string; // Geological soil/rock classification
  slope: number; // degrees
  elevation: number; // meters ASL
  groundMovement: number; // Inclinometer displacement rate (mm/day)
  waterLevel: number; // Pore water pressure (kPa) or GW level
  historicalEventsCount: number; // Prior documented slope failures
  recentReportsCount: number; // Citizen/field hazard reports logged in last 48h
  visibleCracksReported?: boolean;
  waterSeepageReported?: boolean;
  soilMovementReported?: boolean;
  roadDamageReported?: boolean;
}

export interface ContributingFactor {
  id: string;
  name: string;
  category: 'Rainfall' | 'Geotechnical' | 'Terrain' | 'Field Intelligence' | 'Historical';
  impactPercentage: number; // Contribution weight, e.g. +34%
  severity: 'low' | 'moderate' | 'high' | 'critical';
  actualValue: string | number;
  thresholdOrNorm: string | number;
  description: string;
}

export interface RiskHistoryPoint {
  timestamp: string;
  label: string; // e.g. 'T-6d', 'T-24h', 'Now', '+12h Forecast'
  probability: number;
  rainfall24h: number;
  groundMovement: number;
  isForecast?: boolean;
}

export type DataQualityIndicator =
  | 'High Quality (100% In-Situ)'
  | 'Good Telemetry'
  | 'Moderate (Imputed Telemetry)'
  | 'Sparse (Degraded Network)'
  | 'Insufficient Data (Sensors Offline or Stale)';

export interface GeneralDisasterFeatureVector {
  hazardType: string; // e.g. 'Landslide' | 'Flash Flood' | 'Severe Storm' | 'Ground Movement'
  rainfall24h: number; // Heavy rainfall (mm)
  waterLevel: number; // Rising water level (m / kPa pore water pressure)
  soilMoisture: number; // High soil moisture (%)
  groundMovement: number; // Ground movement (mm/day)
  windSpeed: number; // Strong wind (km/h)
  temperature: number; // Extreme temperature (°C)
  historicalActivity: number; // Historical disaster activity (event count)
  slope?: number; // Slope gradient (degrees)
  isMissingData?: boolean; // Key sensor missing/offline
  dataAgeHours?: number; // Age of telemetry in hours (>48h considered stale)
  isSimulated?: boolean;
}

export interface PredictionHistoryRecord {
  prediction_id: string; // e.g. PRED-2026-00124
  location: string;
  hazard_type: string;
  probability: number | null; // 0 - 100 or null if Insufficient Data
  risk_level: RiskLevel; // 'low' | 'moderate' | 'high' | 'critical' | 'insufficient_data'
  contributing_factors: ContributingFactor[];
  timestamp: string;
  model_version: string;
  data_quality: string;
  isSimulated?: boolean;
  explanationSummary?: string;
}

export interface AIPredictionResult {
  predictionId?: string;
  hazardType?: string;
  locationId: string;
  locationName: string;
  state: string;
  riskProbability: number | null; // 0 - 100% estimated probability or null when insufficient_data
  riskLevel: RiskLevel; // 'low' | 'moderate' | 'high' | 'critical' | 'insufficient_data'
  confidenceScore: number; // 0 - 100%
  dataQuality: DataQualityIndicator;
  modelVersion: string; // e.g. 'NER-MultiHazard-v2.6'
  modelType: 'Random Forest Ensemble' | 'Gradient Boosted Trees (XGBoost Approx)' | 'Heuristic Baseline' | 'Multi-Hazard Ensemble';
  timestamp: string; // formatted ISO or relative
  rawFeatures: LandslideFeatureVector | GeneralDisasterFeatureVector;
  contributingFactors: ContributingFactor[];
  whyThisRisk: {
    summary: string;
    primaryTrigger: string;
    geotechnicalMechanics: string;
    antecedentRainfallImpact: string;
    fieldIntelligenceCorroboration: string;
    recommendedMitigation: string;
  };
  riskHistory: RiskHistoryPoint[];
  disclaimer: string;
}

export interface TrainingDataRecord {
  id: string;
  location: string;
  state: string;
  rainfall1h: number;
  rainfall6h: number;
  rainfall24h: number;
  rainfall48h: number;
  rainfall72h: number;
  rainfallIntensity: number;
  soilMoisture: number;
  soilType: string;
  slope: number;
  elevation: number;
  groundMovement: number;
  waterLevel: number;
  historicalEventsCount: number;
  recentReportsCount: number;
  actualOutcome: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  source: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // e.g. "30 Sep 2026, 11:45:00 AM IST"
  action: string;
  category: 'ALERT_ACTION' | 'INCIDENT_ACTION' | 'REPORT_ACTION' | 'SECURITY_AUTH' | 'SIMULATION' | 'CONFIG';
  actorName: string;
  actorRole: UserRole;
  targetId?: string;
  targetType?: 'ALERT' | 'INCIDENT' | 'REPORT' | 'LOCATION' | 'SESSION';
  details: string;
  isSimulated?: boolean;
}
