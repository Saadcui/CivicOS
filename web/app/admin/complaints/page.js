import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import ComplaintsTable from '@/components/officer/ComplaintsTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Municipal Complaints – CivicOS Admin',
};

export default async function AdminComplaintsPage({ searchParams }) {
  const user = await getAuthUser();
  if (!user) return null;

  // Admin has global visibility across all municipal departments
  const query = {};

  if (searchParams?.source) {
    query.source = searchParams.source;
  }
  if (searchParams?.status && searchParams.status !== 'All') {
    query.status = searchParams.status;
  }
  if (searchParams?.department && searchParams.department !== 'All') {
    query.department = searchParams.department;
  }

  let complaints = [];
  try {
    await connectDB();
    complaints = await Complaint.find(query).sort({ createdAt: -1 }).lean();
  } catch (err) {
    complaints = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
          City-Wide Master Docket
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          All Municipal Complaints
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Unrestricted administrative oversight across all wards, departments, and AI optical feeds.
        </p>
      </div>

      <ComplaintsTable
        complaints={JSON.parse(JSON.stringify(complaints))}
        baseRoute="/admin/complaints"
        currentRole="admin"
        department={null}
      />
    </div>
  );
}
