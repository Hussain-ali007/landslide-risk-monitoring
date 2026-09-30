import React, { useState } from 'react';
import {
  CloudRain,
  Wind,
  Sun,
  CloudLightning,
  Droplets,
  Calendar,
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { WeatherRecord } from '../../types';

interface WeatherDashboardProps {
  weather: WeatherRecord[];
  onSelectLocation: (locId: string) => void;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  weather,
  onSelectLocation,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    weather[0]?.locationId || ''
  );

  const selectedStation =
    weather.find((w) => w.locationId === selectedLocationId) || weather[0];

  const totalStations = weather.length;
  const criticalRain = weather.filter((w) => w.rainfall24h >= 120).length;
  const avg24h = Math.round(
    weather.reduce((acc, w) => acc + w.rainfall24h, 0) / (totalStations || 1)
  );
  const maxRainStation = [...weather].sort((a, b) => b.rainfall24h - a.rainfall24h)[0];

  // 7-day forecast mock data for selected station
  const sevenDayForecast = [
    { day: 'Wed', date: 'Jul 12', icon: CloudRain, condition: 'Heavy Rain', temp: '22°C', rain: selectedStation ? Math.round(selectedStation.rainfall24h * 0.8) : 95 },
    { day: 'Thu', date: 'Jul 13', icon: CloudLightning, condition: 'Thunderstorm', temp: '20°C', rain: selectedStation ? Math.round(selectedStation.rainfall24h * 1.1) : 140 },
    { day: 'Fri', date: 'Jul 14', icon: CloudRain, condition: 'Continuous Showers', temp: '21°C', rain: selectedStation ? Math.round(selectedStation.rainfall24h * 0.9) : 110 },
    { day: 'Sat', date: 'Jul 15', icon: CloudRain, condition: 'Scattered Showers', temp: '23°C', rain: 60 },
    { day: 'Sun', date: 'Jul 16', icon: Sun, condition: 'Partly Sunny', temp: '26°C', rain: 25 },
    { day: 'Mon', date: 'Jul 17', icon: CloudRain, condition: 'Light Rain', temp: '24°C', rain: 35 },
    { day: 'Tue', date: 'Jul 18', icon: Sun, condition: 'Clear Spells', temp: '27°C', rain: 15 },
  ];

  // Hourly curve points (inspired by the reference weather app hourly forecast!)
  const hourlyPoints = [
    { time: '6:00 AM', rain: 8, temp: 19 },
    { time: '8:00 AM', rain: 16, temp: 20 },
    { time: '10:00 AM', rain: 32, temp: 22 },
    { time: '12:00 PM', rain: 48, temp: 24 },
    { time: '2:00 PM', rain: 82, temp: 23 },
    { time: '4:00 PM', rain: 64, temp: 22 },
    { time: '6:00 PM', rain: 38, temp: 21 },
    { time: '8:00 PM', rain: 22, temp: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Large Hero Weather Section (Inspired by Reference App) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Precipitation &amp; Meteorological Monitoring
              </span>
            </div>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-4">
              <span>{avg24h} mm</span>
              <span className="text-base sm:text-lg font-medium text-blue-300 bg-blue-900/60 px-3 py-1 rounded-xl border border-blue-700/50">
                24h Regional Avg
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monsoon cloud systems active over North Eastern hill tracts. Surcharge exceeding threshold (&gt;120mm) recorded at {criticalRain} corridor stations.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <Wind className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">Wind:</span>
                <span className="font-bold text-white font-mono">{selectedStation?.windSpeed || 18} km/h</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">Humidity:</span>
                <span className="font-bold text-white font-mono">{selectedStation?.humidity || 86}%</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">Peak Hotspot:</span>
                <span className="font-bold text-rose-300">{maxRainStation?.locationName} ({maxRainStation?.rainfall24h}mm)</span>
              </div>
            </div>
          </div>

          {/* Right Selector Card */}
          <div className="lg:w-80 shrink-0 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 backdrop-blur-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Corridor Weather Station:
            </div>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {weather.map((w) => (
                <option key={w.locationId} value={w.locationId}>
                  {w.locationName} ({w.rainfall24h} mm)
                </option>
              ))}
            </select>

            {selectedStation && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Condition:</span>
                  <span className="font-bold text-white">{selectedStation.forecast24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intensity:</span>
                  <span className="font-bold text-amber-300">{selectedStation.intensityCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">72h Cumulative:</span>
                  <span className="font-bold text-white font-mono">{selectedStation.rainfall72h} mm</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Hourly Precipitation Forecast Curve (Inspired by Reference App) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-600" />
              <span>Hourly Rainfall Forecast Curve</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Station: <strong className="text-slate-800">{selectedStation?.locationName}</strong>
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            24h Surcharge: {selectedStation?.rainfall24h} mm
          </span>
        </div>

        {/* Clean hourly curve chart representation */}
        <div className="mt-6">
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-200 relative">
            {hourlyPoints.map((pt, idx) => {
              const heightPct = Math.min(Math.round((pt.rain / 100) * 100), 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {pt.rain} mm
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-blue-600 to-sky-400 group-hover:from-blue-700 group-hover:to-sky-500 transition-all"
                  />
                  <span className="text-[11px] text-slate-500 font-medium truncate mt-1">
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 7-Day Rainfall Trend & Forecast (Inspired by Reference App) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>7-Day Rainfall &amp; Weather Trend</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Anticipated precipitation across the weekly cycle
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {sevenDayForecast.map((fc, idx) => {
            const Icon = fc.icon;
            const isHeavy = fc.rain >= 100;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isHeavy
                    ? 'bg-red-50/60 border-red-200'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{fc.day}</div>
                <div className="text-[11px] text-slate-500">{fc.date}</div>

                <div className="my-3 flex justify-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHeavy ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-800 truncate">
                  {fc.condition}
                </div>

                <div className="mt-2 text-sm font-bold font-mono text-slate-900">
                  {fc.rain} <span className="text-[10px] font-normal text-slate-500">mm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Station Overview Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">All Regional Weather Stations</h2>
          <span className="text-xs text-slate-500">{weather.length} active reporting stations</span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {weather.map((st) => {
            const isCritical = st.rainfall24h >= 120;
            return (
              <div
                key={st.locationId}
                onClick={() => onSelectLocation(st.locationId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isCritical
                    ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{st.locationName}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">{st.forecast24h}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCritical ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {st.rainfall24h} mm
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>72h: <strong>{st.rainfall72h} mm</strong></span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
