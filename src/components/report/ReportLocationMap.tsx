import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

interface ReportLocationMapProps {
  lat: number;
  lng: number;
  locationName?: string;
  interactive?: boolean;
  onLocationChange?: (coords: { lat: number; lng: number }) => void;
  height?: string;
}

export const ReportLocationMap: React.FC<ReportLocationMapProps> = ({
  lat,
  lng,
  locationName,
  interactive = false,
  onLocationChange,
  height = '240px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom hazard marker icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-hazard-pin',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #2563eb;
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(37,99,235,0.45);
          border: 2px solid white;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager or OSM tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(),
        draggable: interactive,
      }).addTo(map);

      if (interactive && onLocationChange) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onLocationChange({
            lat: Math.round(pos.lat * 10000) / 10000,
            lng: Math.round(pos.lng * 10000) / 10000,
          });
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          onLocationChange({
            lat: Math.round(e.latlng.lat * 10000) / 10000,
            lng: Math.round(e.latlng.lng * 10000) / 10000,
          });
        });
      }

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    return () => {
      // Cleanup on unmount handled on next effect or re-render
    };
  }, [lat, lng, interactive, onLocationChange]);

  // Clean cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
      <div ref={containerRef} style={{ height, width: '100%' }} />

      {/* Coordinate & Instruction Badge */}
      <div className="absolute top-2.5 left-2.5 z-[400] flex flex-wrap items-center gap-1.5 pointer-events-none">
        <span className="px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono font-medium shadow-sm flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span>
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
        </span>
        {interactive && (
          <span className="px-2 py-0.5 rounded-lg bg-blue-600/90 text-white text-[10px] font-semibold">
            Click map to adjust pin
          </span>
        )}
      </div>

      {locationName && (
        <div className="absolute bottom-2.5 left-2.5 z-[400] px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold border border-slate-200/80 shadow-xs pointer-events-none">
          {locationName}
        </div>
      )}
    </div>
  );
};
