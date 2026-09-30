import React, { useState, useEffect } from 'react';
import { store } from './services/storageService';
import {
  MonitoredLocation,
  Alert,
  Incident,
  CitizenReport,
  SensorRecord,
  WeatherRecord,
  ThresholdConfig,
  User,
  UserRole,
  IncidentStatus,
  ReportStatus,
  AuthorityNotification,
} from './types';
import { TopNavigation } from './components/common/TopNavigation';
import { SimulationModal } from './components/common/SimulationModal';
import { AuthorityDashboard } from './components/dashboard/AuthorityDashboard';
import { RiskMapPage } from './components/map/RiskMapPage';
import { WeatherDashboard } from './components/weather/WeatherDashboard';
import { AlertsView } from './components/alerts/AlertsView';
import { IncidentManagementView } from './components/incidents/IncidentManagementView';
import { CitizenReportForm } from './components/report/CitizenReportForm';
import { AuthorityReportsView } from './components/report/AuthorityReportsView';
import { LocationDetailView } from './components/location/LocationDetailView';
import { DisasterRiskPredictionView } from './components/ai/DisasterRiskPredictionView';
import { LoginView } from './components/auth/LoginView';
import { AlertTriangle, X, Shield } from 'lucide-react';

export default function App() {
  const [locations, setLocations] = useState<MonitoredLocation[]>(store.getLocations());
  const [alerts, setAlerts] = useState<Alert[]>(store.getAlerts());
  const [incidents, setIncidents] = useState<Incident[]>(store.getIncidents());
  const [reports, setReports] = useState<CitizenReport[]>(store.getReports());
  const [notifications, setNotifications] = useState<AuthorityNotification[]>(store.getNotifications());
  const [sensors, setSensors] = useState<SensorRecord[]>(store.getSensors());
  const [weather, setWeather] = useState<WeatherRecord[]>(store.getWeather());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(store.getThresholds());
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations[0]?.id || 'LOC-AS-01'
  );
  const [selectedReportIdForReview, setSelectedReportIdForReview] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [simulationModalOpen, setSimulationModalOpen] = useState<boolean>(false);

  // High-Risk simulation notification
  const [simulatedNotification, setSimulatedNotification] = useState<{
    title: string;
    message: string;
    alertId?: string;
    incidentId?: string;
  } | null>(null);

  // Subscribe to state changes from central store
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setLocations([...store.getLocations()]);
      setAlerts([...store.getAlerts()]);
      setIncidents([...store.getIncidents()]);
      setReports([...store.getReports()]);
      setNotifications([...store.getNotifications()]);
      setSensors([...store.getSensors()]);
      setWeather([...store.getWeather()]);
      setThresholds({ ...store.getThresholds() });
      setCurrentUser({ ...store.getCurrentUser() });
    });
    return () => unsubscribe();
  }, []);

  const handleSwitchRole = (role: UserRole) => {
    store.setCurrentUserByRole(role);
  };

  const handleRunSimulation = (
    locationId: string,
    customValues?: { rainfall: number; soilMoisture: number; groundMovement: number }
  ) => {
    const result = store.simulateHighRiskEvent(locationId, customValues);
    setSelectedLocationId(result.alert.locationId);
    setSimulatedNotification({
      title: `Critical Early Warning Activated: ${result.alert.locationName}`,
      message: `Triggered by ${result.alert.rainfall24h} mm/24h rainfall surcharge and ${result.alert.groundMovement} mm/d displacement. Alert ${result.alert.id} generated.`,
      alertId: result.alert.id,
      incidentId: result.incident?.id,
    });
    setActiveTab('alerts');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    store.acknowledgeAlert(alertId);
  };

  const handleCreateIncidentFromAlert = (alertId: string) => {
    const inc = store.createIncidentFromAlert(alertId);
    if (inc) {
      setSelectedIncidentId(inc.id);
      setActiveTab('incidents');
    }
  };

  const handleVerifyReport = (reportId: string) => {
    store.updateReportStatus(reportId, 'Verified');
  };

  const handleUpdateReportStatus = (reportId: string, status: ReportStatus, notes?: string) => {
    store.updateReportStatus(reportId, status, undefined, notes);
  };

  const handleCreateIncidentFromReport = (rep: CitizenReport) => {
    const inc = store.convertReportToIncident(rep.id);
    if (inc) {
      setSelectedIncidentId(inc.id);
      setActiveTab('incidents');
    }
  };

  const handleNavigateToIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('incidents');
  };

  const handleViewNotificationReport = (reportId: string) => {
    setSelectedReportIdForReview(reportId);
    setActiveTab('reports');
  };

  const handleUpdateIncidentStatus = (
    incidentId: string,
    status: IncidentStatus,
    note?: string
  ) => {
    store.updateIncidentStatus(incidentId, status, note);
  };

  const handleAddIncidentNote = (incidentId: string, note: string) => {
    store.addIncidentNote(incidentId, note);
  };

  const handleSubmitCitizenReport = (
    reportData: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ) => {
    return store.addReport(reportData);
  };

  const handleResetData = () => {
    store.resetToDefaultData();
    setSimulatedNotification(null);
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;
  const newReportsCount = reports.filter((r) => r.status === 'New').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Clean Top Navigation (Replaces bulky sidebar & header) */}
      <TopNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeAlertCount={activeAlertCount}
        newReportsCount={newReportsCount}
        notifications={notifications}
        onOpenSimulation={() => setSimulationModalOpen(true)}
        onViewNotificationReport={handleViewNotificationReport}
        onMarkNotificationRead={(id) => store.markNotificationAsRead(id)}
        onMarkAllNotificationsRead={() => store.markAllNotificationsAsRead()}
      />

      {/* 2. Simulation Notification Alert Banner */}
      {simulatedNotification && (
        <div className="bg-amber-600 text-white px-4 py-3 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2 border-b border-amber-700">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-white/20">
                <AlertTriangle className="w-4 h-4 text-white" />
              </span>
              <div>
                <span className="inline-block px-1.5 py-0.5 rounded bg-white text-amber-800 font-mono font-bold text-[10px] mr-2 uppercase">
                  SIMULATION MODE • DEMO
                </span>
                <strong className="mr-1">{simulatedNotification.title}</strong>
                <span className="text-amber-100 hidden md:inline">
                  — {simulatedNotification.message}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('alerts');
                  setSimulatedNotification(null);
                }}
                className="px-3 py-1 rounded-xl bg-white text-amber-900 font-bold hover:bg-amber-50 text-xs shadow-xs transition-colors cursor-pointer"
              >
                View in Alerts
              </button>
              <button
                onClick={() => setSimulatedNotification(null)}
                className="p-1 text-white hover:text-amber-200 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent SIMULATION MODE Banner when simulated entities exist */}
      {(alerts.some((a) => a.isSimulated) || incidents.some((i) => i.isSimulated)) && !simulatedNotification && (
        <div className="bg-amber-500/15 border-b border-amber-300 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500 text-white shadow-2xs">
                SIMULATION MODE
              </span>
              <span className="font-semibold text-amber-950">
                Active simulated high-risk event in progress. Isolated from real-world geotechnical data.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('alerts')}
                className="font-bold text-amber-900 hover:text-amber-700 underline text-xs cursor-pointer"
              >
                View Simulated Alert
              </button>
              <button
                onClick={handleResetData}
                className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Exit &amp; Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Tab 1: Home / Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <AuthorityDashboard
            locations={locations}
            alerts={alerts}
            incidents={incidents}
            reports={reports}
            sensors={sensors}
            weather={weather}
            currentUser={currentUser}
            notifications={notifications}
            onNavigate={(tab, locId) => {
              if (locId) setSelectedLocationId(locId);
              setActiveTab(tab);
            }}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onCreateIncidentFromAlert={handleCreateIncidentFromAlert}
            onVerifyReport={handleVerifyReport}
            onSimulateHighRisk={() => setSimulationModalOpen(true)}
            onViewNotificationReport={handleViewNotificationReport}
            onMarkNotificationRead={(id) => store.markNotificationAsRead(id)}
          />
        )}

        {/* Tab 2: Regional Landslide Risk Map */}
        {activeTab === 'map' && (
          <RiskMapPage
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(locId) => setSelectedLocationId(locId)}
            onNavigateToDetails={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}

        {/* Tab 3: Weather */}
        {activeTab === 'weather' && (
          <WeatherDashboard
            weather={weather}
            onSelectLocation={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
          />
        )}

        {/* Tab 4: Report Hazard (Public) */}
        {activeTab === 'report' && (
          <CitizenReportForm
            locations={locations}
            currentUser={currentUser}
            onSubmitReport={handleSubmitCitizenReport}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToIncidents={() => setActiveTab('incidents')}
            onNavigateToReports={() => setActiveTab('reports')}
          />
        )}

        {/* Tab 5: Authority Reports Review */}
        {activeTab === 'reports' && (
          <AuthorityReportsView
            reports={reports}
            currentUser={currentUser}
            notifications={notifications}
            onVerifyReport={handleVerifyReport}
            onUpdateReportStatus={handleUpdateReportStatus}
            onCreateIncidentFromReport={handleCreateIncidentFromReport}
            onNavigateToLocation={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
            onNavigateToIncident={handleNavigateToIncident}
            initialSelectedReportId={selectedReportIdForReview}
            onClearInitialSelectedReportId={() => setSelectedReportIdForReview(null)}
            onMarkNotificationRead={(id) => store.markNotificationAsRead(id)}
          />
        )}

        {/* Tab 6: Alerts */}
        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            currentUser={currentUser}
            onAcknowledge={handleAcknowledgeAlert}
            onCreateIncident={handleCreateIncidentFromAlert}
            onNavigateToLocation={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
            onNavigateToIncident={handleNavigateToIncident}
          />
        )}

        {/* Tab 7: Incidents */}
        {activeTab === 'incidents' && (
          <IncidentManagementView
            incidents={incidents}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateIncidentStatus}
            onAddNote={handleAddIncidentNote}
            onNavigateToLocation={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
            onViewReport={handleViewNotificationReport}
            initialSelectedIncidentId={selectedIncidentId}
          />
        )}

        {/* Tab 8: Location Detail (with "Why this risk?" section) */}
        {activeTab === 'location-detail' && (
          <LocationDetailView
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(id) => setSelectedLocationId(id)}
            alerts={alerts}
            incidents={incidents}
            sensors={sensors}
            weather={weather}
            onNavigateToIncidents={() => setActiveTab('incidents')}
            onNavigateToReport={() => setActiveTab('report')}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* Tab: Disaster Risk Prediction Module */}
        {activeTab === 'prediction' && (
          <DisasterRiskPredictionView
            locations={locations}
            weather={weather}
            sensors={sensors}
            currentUser={currentUser}
            onNavigateToLocation={(locId) => {
              setSelectedLocationId(locId);
              setActiveTab('location-detail');
            }}
            onNavigateToMap={(locId) => {
              if (locId) setSelectedLocationId(locId);
              setActiveTab('map');
            }}
          />
        )}

        {/* Tab 9: Authority Login */}
        {activeTab === 'login' && (
          <LoginView
            currentUser={currentUser}
            onLoginAs={(role: UserRole) => {
              handleSwitchRole(role);
              setActiveTab('dashboard');
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* 4. Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800">
              Landslide Early Warning System
            </span>
            <span className="text-slate-400">• North Eastern Region</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Disaster Management Authority</span>
            <span>•</span>
            <span>Geotechnical Hazard Network</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('report')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Report Hazard
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Dedicated Simulation Modal (Single instance, clearly labeled DEMO / SIMULATED DATA) */}
      <SimulationModal
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        locations={locations}
        onRunSimulation={handleRunSimulation}
        onResetData={handleResetData}
      />
    </div>
  );
}
