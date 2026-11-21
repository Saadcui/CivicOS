import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':
      return <span className="badge-pending">⏳ Pending</span>;
    case 'Under Review':
      return <span className="badge-review">🔍 Under Review</span>;
    case 'Assigned':
      return <span className="badge-assigned">👷 Assigned</span>;
    case 'In Progress':
      return <span className="badge-progress">⚙️ In Progress</span>;
    case 'Resolved':
      return <span className="badge-resolved">✅ Resolved</span>;
    case 'Rejected':
      return <span className="badge-rejected">❌ Rejected</span>;
    default:
      return <span className="badge-pending">{status}</span>;
  }
}

export default async function MyComplaintsPage({ searchParams }) {
  const user = await getAuthUser();
  if (!user) return null;

  await connectDB();

  const activeStatus = searchParams?.status || 'All';
  const activeCategory = searchParams?.category || 'All';
  const searchQuery = searchParams?.search || '';

  // Strictly enforce citizen boundary: ONLY find complaints submitted by this user
  const query = { submittedBy: user.userId };

  if (activeStatus !== 'All') {
    query.status = activeStatus;
  }
  if (activeCategory !== 'All') {
    query.category = activeCategory;
  }
  if (searchQuery.trim()) {
    const regex = new RegExp(searchQuery.trim(), 'i');
    query.$or = [{ title: regex }, { description: regex }, { complaintId: regex }];
  }

  let complaints = [];
  try {
    await connectDB();
    complaints = await Complaint.find(query).sort({ createdAt: -1 }).lean();
  } catch (err) {
    complaints = [];
  }

  const statuses = ['All', 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            Citizen Case Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time status updates and municipal department execution notes.
          </p>
        </div>

        <Link
          href="/citizen/complaints/new"
          className="btn-coral py-2.5 px-5 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="civic-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          {statuses.map((s) => {
            const isSelected = activeStatus === s;
            const href =
              s === 'All'
                ? '/citizen/complaints'
                : `/citizen/complaints?status=${encodeURIComponent(s)}`;

            return (
              <Link
                key={s}
                href={href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-coral text-white shadow-sm'
                    : 'bg-[#F3F3EC] text-text-secondary hover:text-navy hover:bg-[#DADAD2]/60'
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            Showing <strong className="text-navy">{complaints.length}</strong> incident ticket
            {complaints.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] font-mono text-teal">
            🔒 Scope: User ID verified ({user.email})
          </span>
        </div>
      </div>

      {/* Complaint List */}
      <div className="civic-card p-0 overflow-hidden">
        {complaints.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F3F3EC] flex items-center justify-center text-text-secondary mx-auto">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                No Complaints Match Current Filter
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                You have not submitted any complaints under the "{activeStatus}" status filter.
              </p>
            </div>
            <Link
              href="/citizen/complaints"
              className="btn-outline-navy py-2 px-4 text-xs font-bold inline-flex"
            >
              Clear Filter
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.map((c) => (
              <Link
                key={c._id.toString()}
                href={`/citizen/complaints/${c._id}`}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F3F3EC]/50 transition-colors group block"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-md">
                      {c.complaintId || 'CIV-TICKET'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-navy/5 text-navy">
                      {c.category}
                    </span>
                    {c.department && (
                      <span className="text-xs text-text-secondary">
                        → Routed to: <strong className="text-navy">{c.department}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-navy group-hover:text-coral transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-coral shrink-0" />
                      <span>{c.location?.address}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="shrink-0" />
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </span>
                    {c.remarks?.length > 0 && (
                      <span className="text-teal font-semibold">
                        💬 {c.remarks.length} Official Remark{c.remarks.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <StatusBadge status={c.status} />
                  <div className="btn-outline-navy py-2 px-3 text-xs font-bold group-hover:bg-coral group-hover:border-coral group-hover:text-white transition-all">
                    Track Status
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
