import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  Maximize2,
  ExternalLink,
  CloudRain,
  Activity,
  AlertTriangle,
  Info,
  RotateCcw,
  Clock,
  Sparkles,
  Shield,
  Compass,
  X,
  ChevronRight,
} from 'lucide-react';
import { MonitoredLocation, RiskLevel } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface NerRiskMapProps {
  locations: MonitoredLocation[];
  selectedLocationId?: string;
  onSelectLocation: (locationId: string) => void;
  onNavigateToDetails: (locationId: string) => void;
  height?: string;
}

export const getLocationContributingFactors = (loc: MonitoredLocation): string[] => {
  if (loc.mainContributingFactors && loc.mainContributingFactors.length > 0) {
    return loc.mainContributingFactors;
  }
  const factors: string[] = [];
  if (loc.rainfall24h >= 100) factors.push(`Heavy rainfall (${loc.rainfall24h} mm/24h)`);
  else if (loc.rainfall24h > 0) factors.push(`Rainfall (${loc.rainfall24h} mm/24h)`);

  if (loc.groundMovementRate >= 2.0) factors.push(`Accelerated displacement (${loc.groundMovementRate} mm/d)`);
  else if (loc.groundMovementRate > 0) factors.push(`Ground movement (${loc.groundMovementRate} mm/d)`);

  if (loc.soilMoisture >= 65) factors.push(`High soil moisture (${loc.soilMoisture}% VWC)`);
  else if (loc.soilMoisture > 0) factors.push(`Soil moisture (${loc.soilMoisture}%)`);

  if (loc.slope >= 38) factors.push(`Steep slope gradient (${loc.slope}°)`);
  if (loc.poreWaterPressure >= 45) factors.push(`Elevated pore pressure (${loc.poreWaterPressure} kPa)`);

  if (loc.riskLevel === 'insufficient_data') {
    return ['Telemetry node offline >48h', 'Sensor telemetry missing'];
  }
  return factors.length > 0 ? factors : ['Baseline parameters within safe seasonal tolerance'];
};

export const getLocationHazardType = (loc: MonitoredLocation): string => {
  return loc.hazardType || 'Landslide';
};

export const NerRiskMap: React.FC<NerRiskMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  onNavigateToDetails,
  height = '620px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filters State
  const [selectedHazardFilter, setSelectedHazardFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePopupLocation, setActivePopupLocation] = useState<MonitoredLocation | null>(null);

  // Unique lists for filter dropdowns
  const availableHazards = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((loc) => set.add(getLocationHazardType(loc)));
    return Array.from(set);
  }, [locations]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((loc) => set.add(loc.state));
    return Array.from(set).sort();
  }, [locations]);

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((loc) => {
      if (selectedRegionFilter === 'all' || loc.state === selectedRegionFilter) {
        set.add(loc.district);
      }
    });
    return Array.from(set).sort();
  }, [locations, selectedRegionFilter]);

  // Requirement 3: Marker Colors strictly mapped:
  // Green = Low, Yellow = Moderate, Orange = High, Red = Critical, Gray = Insufficient Data
  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'moderate':
        return '#eab308'; // Yellow
      case 'low':
        return '#10b981'; // Green
      case 'insufficient_data':
      default:
        return '#64748b'; // Gray
    }
  };

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const hazard = getLocationHazardType(loc);
      if (selectedHazardFilter !== 'all' && hazard !== selectedHazardFilter) {
        return false;
      }
      if (selectedRiskFilter !== 'all' && loc.riskLevel !== selectedRiskFilter) {
        return false;
      }
      if (selectedRegionFilter !== 'all' && loc.state !== selectedRegionFilter) {
        return false;
      }
      if (selectedDistrictFilter !== 'all' && loc.district !== selectedDistrictFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = loc.name.toLowerCase().includes(q);
        const matchDist = loc.district.toLowerCase().includes(q);
        const matchState = loc.state.toLowerCase().includes(q);
        const matchHazard = hazard.toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchState && !matchHazard) return false;
      }
      return true;
    });
  }, [
    locations,
    selectedHazardFilter,
    selectedRiskFilter,
    selectedRegionFilter,
    selectedDistrictFilter,
    searchQuery,
  ]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on North Eastern Region (around 25.8° N, 92.8° E)
    const map = L.map(mapContainerRef.current, {
      center: [25.8, 92.8],
      zoom: 7,
      minZoom: 5,
      maxZoom: 15,
      zoomControl: true,
    });

    // Dark sleek OpenStreetMap tiles via CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size after layout completes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when filters, locations, or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredLocations.forEach((loc) => {
      const color = getRiskColor(loc.riskLevel);
      const isSelected = selectedLocationId === loc.id;
      const isCritical = loc.riskLevel === 'critical';
      const labelText =
        loc.riskLevel === 'insufficient_data'
          ? '?'
          : loc.riskProbability > 0
          ? `${loc.riskProbability}%`
          : '0%';

      // Custom marker HTML conforming to specified colors
      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isCritical
              ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${color}; opacity: 0.7; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
              : ''
          }
          <div style="
            width: ${isSelected ? '26px' : '20px'};
            height: ${isSelected ? '26px' : '20px'};
            border-radius: 9999px;
            background-color: ${color};
            border: 2.5px solid ${isSelected ? '#ffffff' : '#0f172a'};
            box-shadow: 0 0 14px ${color}99;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${loc.riskLevel === 'moderate' ? '#000000' : '#ffffff'};
            font-weight: 800;
            font-size: 9px;
            font-family: ui-monospace, monospace;
            transition: all 0.2s;
          " title="${loc.name} (${loc.state}) - ${loc.riskLevel.toUpperCase()}">
            ${labelText}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-risk-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      // Click handler to open information panel
      marker.on('click', () => {
        onSelectLocation(loc.id);
        setActivePopupLocation(loc);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredLocations, selectedLocationId]);

  // Sync active popup location if selectedLocationId changes from parent
  useEffect(() => {
    if (selectedLocationId) {
      const match = locations.find((l) => l.id === selectedLocationId);
      if (match) {
        setActivePopupLocation(match);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([match.lat, match.lng], 9, { animate: true });
        }
      }
    }
  }, [selectedLocationId, locations]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([25.8, 92.8], 7, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  const handleResetFilters = () => {
    setSelectedHazardFilter('all');
    setSelectedRiskFilter('all');
    setSelectedRegionFilter('all');
    setSelectedDistrictFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedHazardFilter !== 'all' ||
    selectedRiskFilter !== 'all' ||
    selectedRegionFilter !== 'all' ||
    selectedDistrictFilter !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-3">
      {/* 1. Interactive Filters Bar (Requirement 5) */}
      <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 text-xs shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Filter Map:</span>
            </div>

            {/* Filter 1: Hazard Type */}
            <select
              value={selectedHazardFilter}
              onChange={(e) => setSelectedHazardFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Hazard Types</option>
              {availableHazards.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {/* Filter 2: Risk Level */}
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical (Red)</option>
              <option value="high">High (Orange)</option>
              <option value="moderate">Moderate (Yellow)</option>
              <option value="low">Low (Green)</option>
              <option value="insufficient_data">Insufficient Data (Gray)</option>
            </select>

            {/* Filter 3: Region / State */}
            <select
              value={selectedRegionFilter}
              onChange={(e) => {
                setSelectedRegionFilter(e.target.value);
                setSelectedDistrictFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Regions / States</option>
              {availableRegions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Filter 4: District */}
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
            />

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Recenter & Matching Count */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-400 text-[11px] font-mono">
              Showing <strong className="text-white">{filteredLocations.length}</strong> of{' '}
              {locations.length} locations
            </span>
            <button
              onClick={handleRecenter}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Center Map
            </button>
          </div>
        </div>

        {/* 2. Color Legend (Requirement 6) */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Risk Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span className="font-medium text-emerald-400">Green = Low (0–24%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-xs shadow-yellow-500/50" />
              <span className="font-medium text-yellow-300">Yellow = Moderate (25–49%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs shadow-orange-500/50" />
              <span className="font-medium text-orange-400">Orange = High (50–74%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-xs shadow-red-500/50" />
              <span className="font-medium text-rose-400">Red = Critical (75–100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="font-medium text-slate-400">Gray = Insufficient Data</span>
            </div>
          </div>

          {/* Demo Data Tag (Requirement 7 & 8) */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>DEMO / SIMULATED LOCATIONS — NOT REAL-TIME DISASTER EVENTS</span>
          </div>
        </div>
      </div>

      {/* 3. Map Viewport & Marker Information Panel (Requirement 4 & 9) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} />

        {/* Marker Information Panel (Requirement 4) */}
        {activePopupLocation && (
          <div className="absolute top-4 right-4 z-20 w-[calc(100%-2rem)] sm:w-96 max-w-sm rounded-3xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 text-white space-y-3.5">
            {/* Header: Location & Close Button */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase tracking-wider">
                    {getLocationHazardType(activePopupLocation)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activePopupLocation.id}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-100 mt-1 leading-snug">
                  {activePopupLocation.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activePopupLocation.district}, {activePopupLocation.state} • Coordinates:{' '}
                  {activePopupLocation.lat.toFixed(3)}°N, {activePopupLocation.lng.toFixed(3)}°E
                </p>
              </div>

              <button
                onClick={() => setActivePopupLocation(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Probability & Risk Level Card */}
            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Risk Level
                </div>
                <div className="mt-1">
                  <RiskBadge level={activePopupLocation.riskLevel} size="md" variant="solid" />
                </div>
              </div>

              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Risk Probability
                </div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-0.5">
                  {activePopupLocation.riskLevel === 'insufficient_data'
                    ? 'Insufficient Data'
                    : `${activePopupLocation.riskProbability}%`}
                </div>
              </div>
            </div>

            {/* Main Contributing Factors (Requirement 4) */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Main Contributing Factors:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Telemetry attribution
                </span>
              </div>
              <div className="space-y-1">
                {getLocationContributingFactors(activePopupLocation).map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-200 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="leading-snug">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated Time */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated:</span>
              </span>
              <span className="font-mono text-slate-300">{activePopupLocation.lastUpdated}</span>
            </div>

            {/* Simulated Data Disclaimer (Requirement 7 & 8) */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 leading-snug">
              <strong>Simulated Demo Location:</strong> Decision support estimate. Not a confirmed
              real-world disaster event.
            </div>

            {/* Action Directives */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => onNavigateToDetails(activePopupLocation.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>Full Diagnostics</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActivePopupLocation(null)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
