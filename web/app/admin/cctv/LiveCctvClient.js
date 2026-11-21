'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, MapPin, Navigation, Play, Square, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveCctvClient() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [detections, setDetections] = useState([]);
  const [annotatedImage, setAnnotatedImage] = useState('');
  const [threshold, setThreshold] = useState('0.25');

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (scanRef.current) clearInterval(scanRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    scanRef.current = null;
    setRunning(false);
  };

  const searchLocations = async () => {
    const query = search.trim();
    if (!query) return;
    setSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&countrycodes=pk`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      setLocations(data);
    } catch {
      setError('Unable to search Pakistan locations.');
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=pk`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          setLocation({
            display_name: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}, Pakistan`,
            lat: String(lat),
            lon: String(lng),
          });
          setSearch(data.display_name || '');
        } catch {
          setLocation({
            display_name: `${lat.toFixed(5)}, ${lng.toFixed(5)}, Pakistan`,
            lat: String(lat),
            lon: String(lng),
          });
        }
      },
      () => setError('Location permission was denied or unavailable.')
    );
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !location) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const form = new FormData();
      form.append('frame', blob, 'camera-frame.jpg');
      form.append('cameraId', 'BROWSER-CCTV-01');
      form.append('address', location.display_name);
      form.append('city', location.address?.city || location.address?.town || 'Pakistan');
      form.append('lat', location.lat);
      form.append('lng', location.lon);
      form.append('threshold', threshold);

      try {
        const response = await fetch('/api/detections/live', { method: 'POST', body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Camera scan failed');

        setDetections(data.detections || []);
        setAnnotatedImage(data.annotatedImage || '');
        if (data.created > 0) {
          setMessage(`${data.created} new CCTV complaint${data.created === 1 ? '' : 's'} registered.`);
        } else if (data.detections?.length) {
          setMessage('Detection found, but an unresolved complaint already exists at this category and location.');
        } else {
          setMessage('No complaint-level detection above the threshold.');
        }
      } catch (err) {
        setError(err.message);
      }
    }, 'image/jpeg', 0.85);
  };

  const startCamera = async () => {
    setError('');
    setMessage('');
    if (!location) {
      setError('Search or select a street/location before starting CCTV.');
      return;
    }

    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      await scanFrame();
      scanRef.current = setInterval(scanFrame, 5000);
    } catch (err) {
      setError(err.message || 'Could not access the camera.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">Live Browser CCTV</span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">AI Camera Detection</h1>
        <p className="text-xs text-text-secondary mt-1">
          Select the physical location, start the camera, and each detected category creates one open complaint until resolved.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="civic-card p-5 space-y-4 lg:col-span-1">
          <h2 className="font-display font-bold text-navy">1. Camera location</h2>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && searchLocations()}
              placeholder="Search street or area in Pakistan"
              className="civic-input text-xs flex-1"
            />
            <button type="button" onClick={searchLocations} className="btn-outline-navy px-3">
              <Search size={15} />
            </button>
          </div>
          <button type="button" onClick={useCurrentLocation} className="btn-outline-navy w-full text-xs">
            <Navigation size={15} /> Use current location
          </button>

          {searching && <div className="text-xs text-text-secondary">Searching OpenStreetMap...</div>}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {locations.map((item) => (
              <button
                type="button"
                key={`${item.place_id}-${item.lat}-${item.lon}`}
                onClick={() => { setLocation(item); setLocations([]); setSearch(item.display_name); }}
                className={`w-full text-left p-3 rounded-xl border text-xs ${
                  location?.place_id === item.place_id
                    ? 'border-coral bg-coral/5 text-navy'
                    : 'border-border hover:border-coral'
                }`}
              >
                <MapPin size={12} className="inline mr-1" />
                {item.display_name}
              </button>
            ))}
          </div>

          {location && (
            <>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <strong>Selected:</strong> {location.display_name}
              </div>
              {Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon)) && (
                <iframe
                  title="Selected OpenStreetMap location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.lon) - 0.01}%2C${Number(location.lat) - 0.01}%2C${Number(location.lon) + 0.01}%2C${Number(location.lat) + 0.01}&layer=mapnik&marker=${Number(location.lat)}%2C${Number(location.lon)}`}
                  className="w-full h-44 rounded-xl border border-border"
                />
              )}
            </>
          )}

          <label className="block text-xs font-bold text-navy">
            Confidence threshold
            <input
              type="number"
              min="0.05"
              max="0.99"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              className="civic-input mt-1 text-xs"
            />
          </label>

          {!running ? (
            <button type="button" onClick={startCamera} disabled={starting} className="btn-primary-coral w-full">
              <Play size={16} /> {starting ? 'Starting camera...' : 'Start Camera'}
            </button>
          ) : (
            <button type="button" onClick={stopCamera} className="btn-outline-navy w-full">
              <Square size={16} /> Stop Camera
            </button>
          )}
        </div>

        <div className="civic-card p-5 space-y-4 lg:col-span-2">
          <h2 className="font-display font-bold text-navy">2. Live video</h2>
          <div className="relative aspect-video bg-navy/95 rounded-xl overflow-hidden flex items-center justify-center">
            <video ref={videoRef} muted playsInline className="w-full h-full object-contain" />
            {!running && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xs">
                <Camera size={18} className="mr-2" /> Camera is stopped
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {annotatedImage && (
            <img src={annotatedImage} alt="AI annotated camera frame" className="w-full rounded-xl border border-border" />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detections.map((item, index) => (
              <div key={`${item.className}-${index}`} className="p-3 rounded-xl bg-[#F3F3EC] text-xs">
                <div className="font-bold text-navy">{item.className.replaceAll('_', ' ')}</div>
                <div className="text-text-secondary">
                  {Math.round(item.confidence * 100)}% • {item.created ? `Created ${item.complaintId}` : `Open ${item.complaintId}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
