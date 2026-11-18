import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getIssues } from '../lib/api';
import { Issue } from '../lib/types';
import { StatusBadge } from '../components/StatusBadge';
import { MapPin, Layers, X } from 'lucide-react';

// Status → pin colour
const STATUS_COLOR: Record<string, string> = {
  open: '#D5803B',
  in_progress: '#2783DE',
  resolved: '#46A171',
  rejected: '#E56458',
};

const CATEGORY_ICON: Record<string, string> = {
  roads: '🚧', sanitation: '🗑️', lighting: '💡', parks: '🌳',
  water: '💧', electricity: '⚡', noise: '🔊', other: '📋',
};

// Simple SVG pin marker
function pinSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
}

export default function MapView() {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filter, setFilter] = useState('');
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically load Leaflet CSS + JS
  useEffect(() => {
    if ((window as any).L) { setLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => { getIssues().then(setIssues); }, []);

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapRef.current) return;
    const L = (window as any).L;
    const map = L.map(containerRef.current).setView([28.6139, 77.2090], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
  }, [leafletLoaded]);

  // Add / refresh markers
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = issues.filter(i => !filter || i.status === filter);
    filtered.forEach(issue => {
      const lat = issue.latitude ?? (28.60 + Math.random() * 0.04);
      const lng = issue.longitude ?? (77.19 + Math.random() * 0.04);
      const color = STATUS_COLOR[issue.status] || '#888';
      const icon = L.divIcon({
        html: pinSvg(color),
        iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36],
        className: '',
      });
      const marker = L.marker([lat, lng], { icon })
        .addTo(mapRef.current)
        .on('click', () => setSelected(issue));
      markersRef.current.push(marker);
    });
  }, [issues, filter, leafletLoaded]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap z-10">
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <Layers size={18} className="text-blue-600" /> Issue Map
        </div>
        <div className="flex gap-1.5 ml-4 flex-wrap">
          {[['', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                filter === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>{l}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              <span className="capitalize">{s.replace('_', ' ')}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex-1">
        {/* Map container */}
        <div ref={containerRef} className="w-full h-full" />

        {!leafletLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {/* Issue detail panel */}
        {selected && (
          <div className="absolute top-4 right-4 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[1000] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{CATEGORY_ICON[selected.category] || '📋'}</span>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <StatusBadge status={selected.status} />
              <p className="text-xs text-gray-600 leading-relaxed">{selected.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} /> {selected.location}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{selected.votes} votes</span>
                <span className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleDateString()}</span>
              </div>
              <Link to={`/issues/${selected.id}`}
                className="block w-full text-center bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors">
                View Full Details
              </Link>
            </div>
          </div>
        )}

        {/* FAB - report issue */}
        <Link to="/report"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-[1000]">
          <MapPin size={16} /> Report New Issue
        </Link>
      </div>
    </div>
  );
}
