import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import ComplaintsTable from '@/components/officer/ComplaintsTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Department Complaints Queue – CivicOS Officer',
};

export default async function OfficerComplaintsPage({ searchParams }) {
  const user = await getAuthUser();
  if (!user) return null;

  // Strict RBAC: filter by department
  const query = {};
  if (user.role === 'officer') {
    if (!user.department) {
      query._id = null;
    } else {
      query.department = user.department;
    }
  }

  if (searchParams?.source) {
    query.source = searchParams.source;
  }
  if (searchParams?.status && searchParams.status !== 'All') {
    query.status = searchParams.status;
  }
  if (searchParams?.assigned === 'me') {
    query.assignedTo = user.userId;
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
        <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
          {searchParams?.assigned === 'me' ? 'My Field Assignments' : 'Authorized Case Records'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          {searchParams?.assigned === 'me'
            ? 'Assigned to Me'
            : user.department
              ? `${user.department} Complaints`
              : 'Department Complaints'}
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Triage incoming citizen reports and verify autonomous CCTV anomaly detections.
        </p>
      </div>

      <ComplaintsTable
        complaints={JSON.parse(JSON.stringify(complaints))}
        baseRoute="/officer/complaints"
        currentRole="officer"
        department={user.department}
        officerId={user.userId}
      />
    </div>
  );
}
