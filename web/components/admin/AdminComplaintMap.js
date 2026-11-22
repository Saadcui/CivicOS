'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Cpu, ExternalLink, MapPin, Navigation, User } from 'lucide-react';

export default function AdminComplaintMap({
  complaints,
  baseRoute = '/admin/complaints',
  overviewLabel = 'City-Wide GIS Overview',
}) {
  const geotaggedComplaints = useMemo(
    () => complaints.filter((complaint) => complaint.location?.address),
    [complaints]
  );
  const [selectedId, setSelectedId] = useState(geotaggedComplaints[0]?._id || null);
  const [locationMapActive, setLocationMapActive] = useState(false);
  const [resolvedCoordinates, setResolvedCoordinates] = useState({});
  const selectedComplaint =
    geotaggedComplaints.find((complaint) => complaint._id === selectedId) ||
    geotaggedComplaints[0];

  useEffect(() => {
    if (!selectedComplaint || !locationMapActive) return;

    const lat = Number(selectedComplaint.location?.lat);
    const lng = Number(selectedComplaint.location?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
      setResolvedCoordinates((current) => ({
        ...current,
        [selectedComplaint._id]: { lat, lng },
      }));
      return;
    }

    const address = selectedComplaint.location?.address;
    if (!address) return;

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    )
      .then((response) => response.ok ? response.json() : [])
      .then((results) => {
        if (results?.[0]) {
          setResolvedCoordinates((current) => ({
            ...current,
            [selectedComplaint._id]: {
              lat: Number(results[0].lat),
              lng: Number(results[0].lon),
            },
          }));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [selectedComplaint, locationMapActive]);

  if (!selectedComplaint) {
    return (
      <div className="h-[480px] flex items-center justify-center bg-slate-50 text-sm text-text-secondary">
        No geotagged incidents recorded in the queue.
      </div>
    );
  }

  const coordinates = resolvedCoordinates[selectedComplaint._id];
  const lat = coordinates?.lat;
  const lng = coordinates?.lng;
  const hasCoordinates =
    Number.isFinite(lat) && Number.isFinite(lng);
  const mapSrc = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=66.95%2C24.78%2C67.15%2C24.95&layer=mapnik`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] min-h-[480px]">
      <div className="relative bg-slate-100">
        {locationMapActive ? (
          <>
            {!hasCoordinates && (
              <div className="absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded-lg bg-navy/90 px-3 py-2 text-[11px] text-white">
                Locating complaint address...
              </div>
            )}
            <iframe
              key={`${selectedComplaint._id}-${lat}-${lng}`}
              title={`Map showing ${selectedComplaint.location.address}`}
              src={mapSrc}
              className="h-full min-h-[480px] w-full border-0"
              loading="lazy"
            />
          </>
        ) : (
          <div className="relative h-[480px] w-full overflow-hidden bg-navy">
            <div
              className="absolute inset-0 opacity-55 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-navy/20" />
            <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
              <span className="rounded-lg border border-white/10 bg-navy/80 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
                {overviewLabel}
              </span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral shadow-xl ring-4 ring-white/20">
                <MapPin size={23} />
              </div>
              <span className="mt-3 rounded-lg bg-navy/80 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                Select a complaint to locate it
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t lg:border-l lg:border-t-0 border-border bg-white p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Incident locations
          </span>
          <span className="text-[11px] font-mono text-coral">{geotaggedComplaints.length}</span>
        </div>

        <div className="space-y-2 max-h-[260px] lg:max-h-[300px] overflow-y-auto pr-1">
          {geotaggedComplaints.map((complaint) => {
            const active = complaint._id === selectedComplaint._id;
            return (
              <button
                key={complaint._id}
                type="button"
                onClick={() => {
                  setSelectedId(complaint._id);
                  setLocationMapActive(true);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  active
                    ? 'border-coral bg-coral/5'
                    : 'border-border bg-white hover:border-coral/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-coral">
                    {complaint.complaintId || complaint._id.slice(-6)}
                  </span>
                  {complaint.source === 'ai_cctv'
                    ? <Cpu size={12} className="text-teal" />
                    : <User size={12} className="text-coral" />}
                </div>
                <div className="mt-1 text-xs font-bold text-navy truncate">{complaint.title}</div>
                <div className="mt-1 text-[10px] text-text-secondary truncate">
                  {complaint.location.address}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-border p-3 mb-3">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-coral shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-navy truncate">{selectedComplaint.title}</div>
                <div className="mt-1 text-[10px] text-text-secondary">
                  {selectedComplaint.location.address}
                </div>
              </div>
            </div>
          </div>
          <Link
            href={`${baseRoute}/${selectedComplaint._id}`}
            className="btn-coral w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Navigation size={14} />
            Review complaint
          </Link>
          {hasCoordinates && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-2 text-[11px] font-bold text-navy flex items-center justify-center gap-1.5"
            >
              Open exact location
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
