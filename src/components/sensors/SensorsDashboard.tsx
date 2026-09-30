import React, { useState } from 'react';
import {
  Activity,
  Radio,
  Battery,
  Wifi,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Search,
} from 'lucide-react';
import { SensorRecord } from '../../types';

interface SensorsDashboardProps {
  sensors: SensorRecord[];
  onSelectLocation: (locId: string) => void;
}

export const SensorsDashboard: React.FC<SensorsDashboardProps> = ({
  sensors,
  onSelectLocation,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pingSuccessId, setPingSuccessId] = useState<string | null>(null);

  const sensorTypes = [
    'all',
    'Inclinometer',
    'Piezometer',
    'TDR Soil Moisture',
    'Tipping Bucket Rain Gauge',
    'Geophone',
  ];

  const filteredSensors = sensors.filter((s) => {
    if (filterType !== 'all' && s.sensorType !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (
      searchQuery &&
      !s.locationName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.sensorId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handlePing = (id: string) => {
    setPingSuccessId(id);
    setTimeout(() => setPingSuccessId(null), 1800);
  };

  const operationalCount = sensors.filter((s) => s.status === 'normal').length;
  const warningCount = sensors.filter((s) => s.status === 'warning' || s.status === 'critical').length;
  const offlineCount = sensors.filter((s) => s.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Geotechnical Instrumentation Network
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">32 Downhole &amp; Surface Nodes</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Soil &amp; Sensor Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Borehole inclinometers, vibrating wire piezometers, and time-domain reflectometers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              {operationalCount} Online
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
              {warningCount} Threshold Warning
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600">
              {offlineCount} Offline
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search sensor node ID or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {sensorTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Sensors Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">Node ID</th>
                <th className="py-2.5 px-3">Sensor Type</th>
                <th className="py-2.5 px-3">Sector Location</th>
                <th className="py-2.5 px-3">Live Reading</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3">Battery</th>
                <th className="py-2.5 px-3">Telemetry Time</th>
                <th className="py-2.5 px-3 text-right">Ping Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSensors.map((s) => (
                <tr
                  key={s.sensorId}
                  onClick={() => onSelectLocation(s.locationId)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">
                    {s.sensorId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    {s.sensorType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.locationName}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    <span
                      className={
                        s.status === 'critical'
                          ? 'text-red-600'
                          : s.status === 'warning'
                          ? 'text-amber-700'
                          : 'text-slate-900'
                      }
                    >
                      {s.metricValue} {s.unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        s.status === 'normal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : s.status === 'critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {s.status === 'normal' ? 'OPERATIONAL' : s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {s.batteryPercent}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {s.lastPing.split(' ')[1] || s.lastPing}
                  </td>
                  <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handlePing(s.sensorId)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      {pingSuccessId === s.sensorId ? 'ACK 200' : 'Ping'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
