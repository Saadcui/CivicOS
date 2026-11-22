'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ComplaintLocationMap({ location, height = 'h-52' }) {
  const [coordinates, setCoordinates] = useState(() => {
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
      ? { lat, lng }
      : null;
  });

  useEffect(() => {
    if (coordinates || !location?.address) return;

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location.address)}`,
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    )
      .then((response) => response.ok ? response.json() : [])
      .then((results) => {
        if (results?.[0]) {
          setCoordinates({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [location?.address, coordinates]);

  if (!coordinates) {
    return (
      <div className={`${height} rounded-xl border border-border bg-slate-50 flex items-center justify-center text-[11px] text-text-secondary px-4 text-center`}>
        Locating {location?.address || 'complaint address'} on OpenStreetMap...
      </div>
    );
  }

  const { lat, lng } = coordinates;

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <iframe
        title={`Map showing ${location?.address || 'complaint location'}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
        className={`block ${height} w-full border-0`}
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 bg-white text-[11px] font-bold text-navy flex items-center justify-between hover:text-coral"
      >
        Open exact complaint location in OpenStreetMap
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
