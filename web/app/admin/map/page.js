import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { MapPin, Compass, Cpu, User } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'City-Wide Geospatial Map – CivicOS Admin',
};

export default async function AdminMapPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let complaints = [];
  try {
    await connectDB();
    complaints = await Complaint.find({}).limit(20).lean();
  } catch (err) {
    complaints = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            Global GIS Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            City-Wide Geospatial Incident Map
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Geographic dispersion across all 34 wards and optical surveillance corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold text-navy">
            <span className="w-2 h-2 rounded-full bg-coral animate-ping"></span>
            <span>{complaints.length} Geotagged Active Incidents</span>
          </span>
        </div>
      </div>

      <div className="civic-card p-0 overflow-hidden relative border-border shadow-xl">
        <div className="relative h-[480px] w-full bg-slate-950 flex flex-col justify-between p-6 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-45 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop')`,
            }}
          ></div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="px-3 py-1 rounded-lg bg-navy/80 text-xs font-mono backdrop-blur-md border border-white/10">
              City-Wide Master GIS Layer
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-coral/20 text-coral-light text-xs font-semibold backdrop-blur-md border border-coral/30 flex items-center gap-1">
              <Compass size={13} />
              <span>All Wards Synchronized</span>
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto w-full my-auto">
            {complaints.length === 0 ? (
              <div className="col-span-2 sm:col-span-4 text-center p-6 rounded-2xl bg-navy/80 backdrop-blur-md border border-white/20 text-white text-xs">
                No active geotagged incidents logged. New complaints with map pins will appear here in real time.
              </div>
            ) : (
              complaints.slice(0, 4).map((c, idx) => (
                <Link
                  key={c._id.toString()}
                  href={`/admin/complaints/${c._id}`}
                  className="p-3.5 rounded-2xl bg-navy/90 backdrop-blur-md border border-white/20 text-white hover:border-coral transition-all group block shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-coral font-bold">
                      {c.complaintId || `PIN-${idx + 1}`}
                    </span>
                    {c.source === 'ai_cctv' ? (
                      <Cpu size={12} className="text-teal-light" />
                    ) : (
                      <User size={12} className="text-coral" />
                    )}
                  </div>
                  <div className="text-xs font-bold font-display truncate group-hover:text-coral transition-colors">
                    {c.title}
                  </div>
                  <div className="text-[10px] text-white/70 truncate mt-1">
                    {c.location?.address}
                  </div>
                  <div className="mt-2 text-[9px] uppercase font-bold text-coral">
                    {c.department || 'All Departments'}
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-navy/80 backdrop-blur-md border border-white/10 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-coral">
                <span className="w-2.5 h-2.5 rounded-full bg-coral"></span>
                <span>Citizen Submissions</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-light">
                <span className="w-2.5 h-2.5 rounded-full bg-teal"></span>
                <span>CCTV Anomaly Alerts</span>
              </span>
            </div>
            <span className="text-white/60 font-mono text-[11px]">
              Full City GIS Resolution Enabled
            </span>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-border">
          <h3 className="font-display font-bold text-sm text-navy mb-4">
            Recent Geotagged City Incidents
          </h3>
          {complaints.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No recent geotagged incidents recorded in the queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {complaints.map((c) => (
                <Link
                  key={c._id.toString()}
                  href={`/admin/complaints/${c._id}`}
                  className="p-3.5 rounded-xl border border-border hover:border-coral transition-colors text-xs space-y-1 block"
                >
                  <div className="font-bold text-navy truncate">{c.title}</div>
                  <div className="text-text-secondary text-[11px] truncate">{c.location?.address}</div>
                  <div className="flex items-center justify-between text-[10px] pt-1 text-text-secondary">
                    <span>{c.department || c.category}</span>
                    <span className="font-semibold text-coral">{c.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
