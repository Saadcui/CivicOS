import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import AdminComplaintMap from '@/components/admin/AdminComplaintMap';

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
    complaints = await Complaint.find({}).sort({ createdAt: -1 }).limit(50).lean();
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
        <AdminComplaintMap complaints={JSON.parse(JSON.stringify(complaints))} />
      </div>
    </div>
  );
}
