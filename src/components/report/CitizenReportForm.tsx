import React, { useState } from 'react';
import {
  Send,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Shield,
  RotateCcw,
  Navigation,
  Upload,
  Plus,
  X,
  AlertCircle,
  Eye,
  FileSearch,
  Search,
  Check,
  Clock,
  Phone,
  Mail,
  UserCheck,
  Mountain,
  Waves,
  CloudRain,
  Wind,
  Activity,
  ShieldAlert,
  Split,
  Droplets,
  Flame,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { CitizenReport, MonitoredLocation, ReportStatus, User } from '../../types';
import { ReportLocationMap } from './ReportLocationMap';
import { store } from '../../services/storageService';

export type HazardType =
  | 'Landslide'
  | 'Flood'
  | 'Heavy Rainfall'
  | 'Storm'
  | 'Earthquake'
  | 'Road Damage'
  | 'Ground Crack'
  | 'Water Seepage'
  | 'Fire'
  | 'Other';

interface HazardOptionConfig {
  id: HazardType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const HAZARD_OPTIONS: HazardOptionConfig[] = [
  {
    id: 'Landslide',
    label: 'Landslide',
    description: 'Slope failure, mudflow, rock fall or falling debris',
    icon: Mountain,
  },
  {
    id: 'Flood',
    label: 'Flood',
    description: 'River overflow, flash flooding, or submerged roadways',
    icon: Waves,
  },
  {
    id: 'Heavy Rainfall',
    label: 'Heavy Rainfall',
    description: 'Torrential downpour threatening slope saturation',
    icon: CloudRain,
  },
  {
    id: 'Storm',
    label: 'Storm',
    description: 'High-velocity gales, cyclonic wind, or tree fall',
    icon: Wind,
  },
  {
    id: 'Earthquake',
    label: 'Earthquake',
    description: 'Ground tremors, slope destabilization or scarp movement',
    icon: Activity,
  },
  {
    id: 'Road Damage',
    label: 'Road Damage',
    description: 'Asphalt subsidence, road fissures or blocked culvert',
    icon: ShieldAlert,
  },
  {
    id: 'Ground Crack',
    label: 'Ground Crack',
    description: 'Tension cracks, soil fissures or slope detachment lines',
    icon: Split,
  },
  {
    id: 'Water Seepage',
    label: 'Water Seepage',
    description: 'Abnormal spring water emergence or bubbling mud',
    icon: Droplets,
  },
  {
    id: 'Fire',
    label: 'Fire',
    description: 'Slope brush fire, forest wildfire or infrastructure fire',
    icon: Flame,
  },
  {
    id: 'Other',
    label: 'Other',
    description: 'Any other geological, weather or environmental hazard',
    icon: HelpCircle,
  },
];

interface CitizenReportFormProps {
  locations: MonitoredLocation[];
  currentUser: User;
  onSubmitReport: (report: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>) => CitizenReport;
  onNavigateToDashboard: () => void;
  onNavigateToIncidents: () => void;
  onNavigateToReports?: () => void;
}

export const CitizenReportForm: React.FC<CitizenReportFormProps> = ({
  locations,
  currentUser,
  onSubmitReport,
  onNavigateToDashboard,
  onNavigateToIncidents,
  onNavigateToReports,
}) => {
  // Page mode: 'report' or 'status-lookup'
  const [activeMode, setActiveMode] = useState<'report' | 'lookup'>('report');

  // Hazard Type (Requirement 1)
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('Landslide');
  const [otherHazardText, setOtherHazardText] = useState('');

  // Location state (Requirement 2)
  const defaultLoc = locations[0];
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
  const [selectedLocId, setSelectedLocId] = useState(defaultLoc?.id || 'LOC-DH-01');
  const [customLocationName, setCustomLocationName] = useState(
    defaultLoc ? `${defaultLoc.name}, ${defaultLoc.district} (${defaultLoc.state})` : 'Haflong - Jatinga Ridge (Assam)'
  );
  const [currentLat, setCurrentLat] = useState<number>(defaultLoc?.lat || 25.176);
  const [currentLng, setCurrentLng] = useState<number>(defaultLoc?.lng || 93.034);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Description (Requirement 3)
  const [description, setDescription] = useState('');
  const maxDescriptionLength = 1000;

  // Photo Upload (Requirements 4 & 5)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewingPhotoUrl, setPreviewingPhotoUrl] = useState<string | null>(null);

  // Contact Info & Anonymity (Requirements 6 & 7)
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Confirmation modal & submission state (Requirements 8 & 9)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CitizenReport | null>(null);

  // Status Lookup state (Public tracking)
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<CitizenReport | null | undefined>(undefined);

  // ==========================================
  // Geolocation Handler (Requirement 2)
  // ==========================================
  const handleUseMyLocation = () => {
    setGpsError(null);
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser. Please click directly on the map to set location.');
      setIsLocating(false);
      setLocationMode('manual');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setCurrentLat(lat);
        setCurrentLng(lng);
        setLocationMode('gps');
        setCustomLocationName(`GPS Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationMode('manual');
        if (err.code === 1) {
          setGpsError('Location permission denied. You can select your location manually by clicking on the map.');
        } else {
          setGpsError('Could not obtain GPS location. Please click directly on the map below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleSelectPredefinedLocation = (locId: string) => {
    setSelectedLocId(locId);
    if (locId === 'custom') {
      // User will enter custom text
    } else {
      const loc = locations.find((l) => l.id === locId);
      if (loc) {
        setCustomLocationName(`${loc.name}, ${loc.district} (${loc.state})`);
        setCurrentLat(loc.lat);
        setCurrentLng(loc.lng);
      }
    }
  };

  // ==========================================
  // Photo Upload Handler with Validation (Requirement 5)
  // Supported: JPG, JPEG, PNG, WEBP, 10MB limit
  // ==========================================
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedPhotos.length + files.length > 6) {
      setUploadError('Maximum 6 photos allowed per hazard report.');
      return;
    }

    const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const acceptedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB per image

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lowerName = file.name.toLowerCase();
      const hasValidExt = acceptedExtensions.some((ext) => lowerName.endsWith(ext));
      const hasValidMime = acceptedMimeTypes.includes(file.type.toLowerCase());

      // File format validation (Requirement 5: JPG, JPEG, PNG, WEBP)
      if (!hasValidExt && !hasValidMime) {
        setUploadError(`File "${file.name}" is not supported. Please upload JPG, JPEG, PNG, or WEBP images.`);
        return;
      }

      // Reasonable file-size limit validation (Requirement 5)
      if (file.size > maxSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError(`File "${file.name}" (${sizeMb} MB) exceeds the 10 MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ==========================================
  // Submission Validation (Requirement 8)
  // ==========================================
  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHazard) {
      alert('Please select the hazard type you observed.');
      return;
    }

    if (selectedHazard === 'Other' && !otherHazardText.trim()) {
      alert('Please specify the hazard description for "Other".');
      return;
    }

    if (!customLocationName.trim()) {
      alert('Please provide a location, village or landmark name.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a brief description of the observed hazard.');
      return;
    }

    if (description.length > maxDescriptionLength) {
      alert(`Description exceeds the ${maxDescriptionLength} character limit.`);
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleExecuteSubmission = () => {
    setConfirmModalOpen(false);

    const hazardName =
      selectedHazard === 'Other' && otherHazardText.trim()
        ? `Other: ${otherHazardText.trim()}`
        : selectedHazard;

    const selectedLoc = locations.find((l) => l.id === selectedLocId);
    const locState = selectedLoc?.state || 'Assam';

    // Call persistent store (Requirement 8)
    const newReport = onSubmitReport({
      locationName: customLocationName.trim(),
      state: locState,
      lat: currentLat,
      lng: currentLng,
      hazardType: hazardName,
      hazardTypes: [hazardName],
      description: description.trim(),
      reporterName: isAnonymous ? 'Anonymous Reporter' : contactName.trim() || 'Citizen Observer',
      reporterPhone: !isAnonymous && contactPhone.trim() ? contactPhone.trim() : undefined,
      reporterEmail: !isAnonymous && contactEmail.trim() ? contactEmail.trim() : undefined,
      isAnonymous,
      photos: uploadedPhotos,
      photoUrl: uploadedPhotos[0] || undefined,
      visibleCracks: selectedHazard === 'Ground Crack' || selectedHazard === 'Road Damage',
      waterSeepage: selectedHazard === 'Water Seepage',
      soilMovement: selectedHazard === 'Landslide',
      rockfallDebris: selectedHazard === 'Landslide',
      roadDamage: selectedHazard === 'Road Damage',
      heavyRainfall: selectedHazard === 'Heavy Rainfall',
    });

    setSubmittedReport(newReport);
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setDescription('');
    setSelectedHazard('Landslide');
    setOtherHazardText('');
    setUploadedPhotos([]);
    setUploadError(null);
    setIsAnonymous(true);
    setContactPhone('');
    setContactEmail('');
    setLocationMode('manual');
    setSelectedLocId(locations[0]?.id || 'LOC-DH-01');
    if (locations[0]) {
      setCustomLocationName(`${locations[0].name}, ${locations[0].district} (${locations[0].state})`);
      setCurrentLat(locations[0].lat);
      setCurrentLng(locations[0].lng);
    }
  };

  const handleLookupReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    const found = store.getReportById(lookupId.trim());
    setLookupResult(found || null);
  };

  // Helper for Status Badge styling
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

  // ========================================================
  // REQUIREMENT 9: CONFIRMATION VIEW
  // "Report submitted successfully"
  // with: Report ID, Current status, Submitted time
  // ========================================================
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Report submitted successfully
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your hazard report has been recorded persistently and is immediately available to the Disaster Management Authority for review and dispatch.
            </p>
          </div>

          {/* Report ID, Status & Submitted Time Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3.5 max-w-md mx-auto font-medium">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Report ID:</span>
              <span className="font-mono font-extrabold text-blue-700 text-sm tracking-wide">
                {submittedReport.id}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Current Status:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                {submittedReport.status}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Submitted Time:</span>
              <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{submittedReport.timestamp}</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Hazard Type:</span>
              <span className="font-bold text-slate-800">
                {submittedReport.hazardType}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Location:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                {submittedReport.locationName}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Coordinates:</span>
              <span className="font-mono text-slate-700">
                {submittedReport.lat.toFixed(4)}° N, {submittedReport.lng.toFixed(4)}° E
              </span>
            </div>

            {submittedReport.photos && submittedReport.photos.length > 0 && (
              <div className="py-1 border-b border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-semibold block">
                  Attached Photos ({submittedReport.photos.length}):
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {submittedReport.photos.map((url, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs"
                      onClick={() => setPreviewingPhotoUrl(url)}
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirement 7: Do not display private reporter information publicly */}
            <div className="flex items-center justify-between py-1 text-slate-500">
              <span className="font-semibold">Reporter Privacy:</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>
                  {submittedReport.isAnonymous
                    ? 'Anonymous (Protected)'
                    : 'Confidential (Authority Only)'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setLookupId(submittedReport.id);
                setLookupResult(submittedReport);
                setActiveMode('lookup');
                setSubmittedReport(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Report Status</span>
            </button>

            {onNavigateToReports && (
              <button
                onClick={() => {
                  onNavigateToReports();
                  setSubmittedReport(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View in Authority Reports</span>
              </button>
            )}

            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Report Another Hazard
            </button>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewingPhotoUrl && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewingPhotoUrl(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-3 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Photo Evidence Preview</span>
                <button
                  onClick={() => setPreviewingPhotoUrl(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-900">
                <img
                  src={previewingPhotoUrl}
                  alt="Enlarged evidence"
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveMode('report')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'report'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Report Hazard</span>
        </button>
        <button
          onClick={() => setActiveMode('lookup')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'lookup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Check Report Status</span>
        </button>
      </div>

      {/* ========================================================
          MODE 2: STATUS LOOKUP (Public Tracking Tool)
          Requirement 7: Do NOT publicly display private reporter info
          ======================================================== */}
      {activeMode === 'lookup' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Public Tracking
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Check Report Status
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Look up any submitted hazard report using its unique Report ID (e.g. RPT-2026-00001).
            </p>
          </div>

          <form onSubmit={handleLookupReport} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter Report ID (e.g. RPT-2026-00001)..."
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Lookup
            </button>
          </form>

          {lookupResult === null && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                No report found with ID <strong>"{lookupId}"</strong>. Please verify the ID format (e.g. RPT-2026-00001).
              </span>
            </div>
          )}

          {lookupResult && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {lookupResult.id}
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Submitted: {lookupResult.timestamp}</span>
                  </div>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(
                      lookupResult.status
                    )}`}
                  >
                    {lookupResult.status}
                  </span>
                </div>
              </div>

              {/* Status progression bar */}
              <div className="py-2">
                <div className="text-[11px] font-bold text-slate-700 mb-2">Review Progress:</div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                  {[
                    { label: 'NEW', active: true },
                    {
                      label: 'UNDER REVIEW',
                      active:
                        lookupResult.status === 'Under Review' ||
                        lookupResult.status === 'Verified' ||
                        lookupResult.status === 'Incident Created' ||
                        lookupResult.status === 'Resolved' ||
                        lookupResult.status === 'Closed',
                    },
                    {
                      label: 'VERIFIED',
                      active:
                        lookupResult.status === 'Verified' ||
                        lookupResult.status === 'Incident Created' ||
                        lookupResult.status === 'Resolved' ||
                        lookupResult.status === 'Closed',
                    },
                    {
                      label: 'DISPATCHED',
                      active:
                        lookupResult.status === 'Incident Created' ||
                        lookupResult.status === 'Resolved' ||
                        lookupResult.status === 'Closed',
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border ${
                        step.active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hazard Type:</span>
                  <span className="font-bold text-slate-800">{lookupResult.hazardType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{lookupResult.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-slate-700">
                    {lookupResult.lat.toFixed(4)}° N, {lookupResult.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>

              {lookupResult.description && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Description:</span>
                  <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    {lookupResult.description}
                  </p>
                </div>
              )}

              {lookupResult.photos && lookupResult.photos.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1.5">Submitted Photos:</span>
                  <div className="flex flex-wrap gap-2">
                    {lookupResult.photos.map((url, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs"
                        onClick={() => setPreviewingPhotoUrl(url)}
                      >
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement 7: Private reporter information is NEVER displayed in public tracking */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>
                  <strong>Privacy Notice:</strong> Reporter identity and private contact information are securely masked and only accessible to authorized emergency response personnel.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 1: REPORT A HAZARD (Main Form)
          ======================================================== */}
      {activeMode === 'report' && (
        <>
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Public Hazard Reporting
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Report Hazard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Submit observations of geological and meteorological hazards. Your submission directly alerts the regional Disaster Management Authority.
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handlePreSubmitCheck} className="space-y-7 text-xs">
              {/* ========================================================
                  REQUIREMENT 1: SELECT HAZARD TYPE
                  - Landslide, Flood, Heavy Rainfall, Storm, Earthquake,
                    Road Damage, Ground Crack, Water Seepage, Fire, Other
                  ======================================================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-sm block">
                    1. Select Hazard Type <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Choose observed condition
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {HAZARD_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedHazard === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedHazard(item.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[90px] relative ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-md ring-2 ring-blue-500/20'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span
                            className={`p-1.5 rounded-xl ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                          </span>
                        </div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* If 'Other' selected, display custom input */}
                {selectedHazard === 'Other' && (
                  <div className="pt-1 animate-in fade-in">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Specify Hazard Details <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      placeholder="Specify custom hazard (e.g. Subsidence, Sinkhole, Gas odor, Culvert rupture)..."
                      value={otherHazardText}
                      onChange={(e) => setOtherHazardText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* ========================================================
                  REQUIREMENT 2: SELECT LOCATION
                  - Use My Location
                  - OR manually select location on the map
                  - Store latitude and longitude
                  ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-slate-900 text-sm block">
                    2. Select Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        locationMode === 'gps'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use My Location'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLocationMode('manual');
                        setGpsError(null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        locationMode === 'manual'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Select Location on Map</span>
                    </button>
                  </div>
                </div>

                {gpsError && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{gpsError}</span>
                  </div>
                )}

                {/* Location Landmark & Sector input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Choose Nearest Known Sector (Optional):
                    </label>
                    <select
                      value={selectedLocId}
                      onChange={(e) => handleSelectPredefinedLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}, {loc.district} ({loc.state})
                        </option>
                      ))}
                      <option value="custom">Other / Custom Hill Sector or Landmark</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Landmark, Village, or Road Milepost <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Haflong Overpass, NH-54E Km 18..."
                      value={customLocationName}
                      onChange={(e) => setCustomLocationName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Interactive Map: Click or Drag to adjust coordinates */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>Interactive Location Map:</span>
                    <span className="text-blue-600 font-medium">Click anywhere on map to position pin</span>
                  </div>
                  <ReportLocationMap
                    lat={currentLat}
                    lng={currentLng}
                    locationName={customLocationName}
                    interactive={true}
                    onLocationChange={(coords) => {
                      setCurrentLat(coords.lat);
                      setCurrentLng(coords.lng);
                      setLocationMode('manual');
                    }}
                    height="220px"
                  />
                </div>

                {/* Coordinates stored (Requirement 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Latitude (Stored)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {currentLat.toFixed(4)}° N
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Longitude (Stored)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {currentLng.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block font-medium">Region / Location</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {customLocationName || 'Specified on map'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================
                  REQUIREMENT 3: ENTER A DESCRIPTION
                  ======================================================== */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 text-sm block">
                    3. Hazard Description <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      description.length > maxDescriptionLength
                        ? 'text-red-500 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {description.length} / {maxDescriptionLength} characters
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Describe what you observed (e.g. crack dimensions, rockfall frequency, bubbling water, road blockage, rate of movement).
                </p>
                <textarea
                  rows={4}
                  placeholder="Describe the hazard conditions in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={maxDescriptionLength}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  required
                />
              </div>

              {/* ========================================================
                  REQUIREMENTS 4 & 5: UPLOAD ONE OR MORE PHOTOGRAPHS
                  - Validate: JPG, JPEG, PNG, WEBP
                  - File size limit (10MB)
                  - Show image preview
                  - Allow removing an image before submission
                  ======================================================== */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 text-sm block">
                      4. Upload Photograph(s)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Formats: JPG, JPEG, PNG, WEBP (Max 10 MB each)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Field photographs allow rapid verification and triage by geotechnical engineers.
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {uploadedPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden relative shadow-xs group bg-slate-100"
                    >
                      <img
                        src={photoUrl}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlays: Preview and Remove before submission (Requirement 5) */}
                      <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewingPhotoUrl(photoUrl)}
                          className="p-1.5 rounded-lg bg-white/90 text-slate-900 hover:bg-white text-xs cursor-pointer shadow-sm"
                          title="Preview full image"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs cursor-pointer shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {uploadedPhotos.length < 6 && (
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-500 hover:text-blue-600 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer select-none">
                      <Plus className="w-6 h-6" />
                      <span className="text-[10px] font-bold">+ Add Photo</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* ========================================================
                  REQUIREMENTS 6 & 7: ANONYMOUS SUBMISSION & PRIVACY
                  - Allow anonymous submission
                  - Do not publicly display private reporter information
                  ======================================================== */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 pt-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Submit anonymously (Recommended)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Your identity and private contact info will not be collected or displayed publicly.
                    </span>
                  </div>
                </label>

                {!isAnonymous && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-blue-800 text-[11px] font-semibold">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Confidential details — used solely for official field inquiry; never displayed publicly.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Email (Optional)
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            placeholder="reporter@example.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>SUBMIT HAZARD REPORT</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ========================================================
          CONFIRMATION MODAL BEFORE DISPATCH
          ======================================================== */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Hazard Report Submission
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div>
                <span className="text-slate-500 block">Hazard Type:</span>
                <span className="font-bold text-blue-700 text-sm block">
                  {selectedHazard === 'Other' && otherHazardText.trim()
                    ? `Other: ${otherHazardText.trim()}`
                    : selectedHazard}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block">Location:</span>
                <span className="font-semibold text-slate-900 block truncate">
                  {customLocationName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block">Description:</span>
                <span className="text-slate-700 block line-clamp-2">
                  {description}
                </span>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Photographs:</span>
                  <span className="font-semibold text-slate-800">
                    {uploadedPhotos.length} photo(s) attached
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block">Reporter Privacy:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>{isAnonymous ? 'Anonymous Submission' : 'Confidential Submission'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSubmission}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {previewingPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewingPhotoUrl(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Photo Preview</span>
              <button
                onClick={() => setPreviewingPhotoUrl(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-900">
              <img
                src={previewingPhotoUrl}
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
