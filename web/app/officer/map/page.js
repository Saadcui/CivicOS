import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import AdminComplaintMap from '@/components/admin/AdminComplaintMap';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Department Geographic Map – CivicOS',
};

export default async function GeographicMapPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let complaints = [];
  try {
    await connectDB();

    const query = {};
    if (user.role === 'officer') {
      if (!user.department) {
        query._id = null;
      } else {
        query.department = user.department;
      }
    }

    complaints = await Complaint.find(query).sort({ createdAt: -1 }).limit(50).lean();
  } catch (err) {
    complaints = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
            Department Spatial Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            Geographic Incident Map
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Complaints and CCTV detections assigned to {user.department || 'your department'}.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-semibold text-navy">
          <span className="w-2 h-2 rounded-full bg-teal animate-ping"></span>
          <span>{complaints.length} Department Incidents</span>
        </span>
      </div>

      <div className="civic-card p-0 overflow-hidden border-border shadow-xl">
        <AdminComplaintMap
          complaints={JSON.parse(JSON.stringify(complaints))}
          baseRoute="/officer/complaints"
          overviewLabel={`${user.department || 'Department'} GIS Overview`}
        />
      </div>
    </div>
  );
}
