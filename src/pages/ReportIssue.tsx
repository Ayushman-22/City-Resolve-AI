import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../lib/api';
import { IssueCategory } from '../lib/types';
import { CheckCircle2, MapPin, Navigation } from 'lucide-react';
import ImageAnalyzer from '../components/ImageAnalyzer';
import { VisionAnalysis } from '../lib/vision';

const CATEGORIES: { value: IssueCategory; label: string; icon: string }[] = [
  { value: 'roads', label: 'Roads & Footpaths', icon: '🚧' },
  { value: 'sanitation', label: 'Sanitation & Waste', icon: '🗑️' },
  { value: 'lighting', label: 'Street Lighting', icon: '💡' },
  { value: 'parks', label: 'Parks & Gardens', icon: '🌳' },
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'noise', label: 'Noise Pollution', icon: '🔊' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const DEPT_MAP: Record<IssueCategory, string> = {
  roads: 'Roads & Transport', sanitation: 'Sanitation', lighting: 'Electricity Board',
  parks: 'Parks & Recreation', water: 'Water Works', electricity: 'Electricity Board',
  noise: 'Municipal Corporation', other: 'Municipal Corporation',
};

// Mini Leaflet map for dropping a pin
function MiniMap({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const L = (window as any).L;
    if (!L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;
    const L = (window as any).L;
    const map = L.map(containerRef.current).setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#2783DE"/>
        <circle cx="14" cy="14" r="6" fill="white"/></svg>`,
      iconSize: [28, 36], iconAnchor: [14, 36], className: '',
    });

    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      // Reverse geocode via Nominatim (free, no API key)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        onLocationSelect(lat, lng, address);
      } catch {
        onLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
    mapRef.current = map;
  }, [loaded, onLocationSelect]);

  const detectMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const L = (window as any).L;
      mapRef.current.setView([lat, lng], 16);
      if (markerRef.current) markerRef.current.remove();
      const pinIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#2783DE"/>
          <circle cx="14" cy="14" r="6" fill="white"/></svg>`,
        iconSize: [28, 36], iconAnchor: [14, 36], className: '',
      });
      markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapRef.current);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        onLocationSelect(lat, lng, data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } catch {
        onLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
      setDetecting(false);
    }, () => setDetecting(false));
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Click map to drop a pin — or</span>
        <button type="button" onClick={detectMyLocation} disabled={detecting}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline disabled:opacity-50">
          <Navigation size={12} /> {detecting ? 'Detecting...' : 'Use my location'}
        </button>
      </div>
      {!loaded ? (
        <div className="h-52 bg-gray-100 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={containerRef} style={{ height: '210px' }} />
      )}
    </div>
  );
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'roads' as IssueCategory,
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    reporter_name: '',
    reporter_email: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Called when AI finishes analyzing an image
  const handleAIResult = (result: VisionAnalysis, preview: string) => {
    setImagePreview(preview);
    setForm(f => ({
      ...f,
      title: result.title || f.title,
      description: result.description || f.description,
      location: result.location || f.location,
      priority: result.severity || f.priority,
      category: (result.category as IssueCategory) || f.category,
    }));
  };

  const handleMapPin = (lat: number, lng: number, address: string) => {
    set('latitude', lat);
    set('longitude', lng);
    set('location', address.length > 120 ? address.substring(0, 120) + '...' : address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createIssue({
        ...form,
        status: 'open',
        votes: 0,
        department: DEPT_MAP[form.category],
        image_url: imagePreview || undefined,
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Issue Reported!</h2>
        <p className="text-gray-500 mb-6">
          Your issue has been logged and routed to <strong>{DEPT_MAP[form.category]}</strong>. You'll get email updates as it progresses.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSubmitted(false); setForm({ title: '', description: '', category: 'roads', location: '', latitude: undefined, longitude: undefined, reporter_name: '', reporter_email: '', priority: 'medium' }); setImagePreview(null); }}
            className="border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Report Another
          </button>
          <button onClick={() => navigate('/issues')}
            className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">
            View All Issues
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Report an Issue</h1>
        <p className="text-gray-500">Upload a photo and AI will auto-fill the form. Review and submit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* AI Image Analyzer */}
        <ImageAnalyzer onAnalysis={handleAIResult} />

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Issue Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(c => (
              <button type="button" key={c.value} onClick={() => set('category', c.value)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-sm ${
                  form.category === c.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}>
                <span className="text-2xl mb-1">{c.icon}</span>
                <span className="font-medium text-xs text-center">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Issue Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Issue Title <span className="text-red-500">*</span>
            {form.title && <span className="ml-2 text-xs text-green-600 font-normal">✓ AI filled</span>}
          </label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Large pothole on Main Street near bus stop"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
            {form.description && <span className="ml-2 text-xs text-green-600 font-normal">✓ AI filled</span>}
          </label>
          <textarea required value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe the issue in detail. Include how long it's been there and who it affects."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Location <span className="text-red-500">*</span>
              {form.latitude && <span className="ml-2 text-xs text-green-600 font-normal">✓ Pin dropped</span>}
            </label>
            <button type="button" onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
              <MapPin size={12} /> {showMap ? 'Hide map' : 'Pin on map'}
            </button>
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input required value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Street name, landmark, or area"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {showMap && (
            <div className="mt-3">
              <MiniMap onLocationSelect={handleMapPin} />
              {form.latitude && (
                <p className="mt-2 text-xs text-green-600">
                  ✓ Coordinates captured: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Severity <span className="text-red-500">*</span>
            {form.priority !== 'medium' && <span className="ml-2 text-xs text-green-600 font-normal">✓ AI detected</span>}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([['low', 'Low', 'border-gray-300 hover:border-gray-400', 'border-gray-400 bg-gray-50 text-gray-700'],
               ['medium', 'Medium', 'border-yellow-300 hover:border-yellow-400', 'border-yellow-400 bg-yellow-50 text-yellow-700'],
               ['high', 'High', 'border-orange-300 hover:border-orange-400', 'border-orange-400 bg-orange-50 text-orange-700'],
               ['critical', 'Critical', 'border-red-300 hover:border-red-400', 'border-red-500 bg-red-50 text-red-700']] as const).map(
              ([v, l, inactive, active]) => (
                <button type="button" key={v} onClick={() => set('priority', v)}
                  className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.priority === v ? active : `border-gray-200 text-gray-500 ${inactive}`
                  }`}>{l}</button>
              )
            )}
          </div>
        </div>

        {/* Reporter */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name <span className="text-red-500">*</span></label>
            <input required value={form.reporter_name} onChange={e => set('reporter_name', e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input required type="email" value={form.reporter_email} onChange={e => set('reporter_email', e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-700">
            Your report will be auto-routed to <strong>{DEPT_MAP[form.category]}</strong>.
            You'll receive email updates on progress.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm">
          {loading ? 'Submitting...' : 'Submit Issue Report'}
        </button>
      </form>
    </div>
  );
}
