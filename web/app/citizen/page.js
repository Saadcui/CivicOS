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
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
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

export default async function CitizenOverviewPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let complaints = [];
  let totalCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let dbError = null;

  try {
    await connectDB();

    complaints = await Complaint.find({ submittedBy: user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    [totalCount, pendingCount, inProgressCount, resolvedCount] = await Promise.all([
      Complaint.countDocuments({ submittedBy: user.userId }),
      Complaint.countDocuments({
        submittedBy: user.userId,
        status: { $in: ['Pending', 'Under Review'] },
      }),
      Complaint.countDocuments({
        submittedBy: user.userId,
        status: { $in: ['Assigned', 'In Progress'] },
      }),
      Complaint.countDocuments({
        submittedBy: user.userId,
        status: 'Resolved',
      }),
    ]);
  } catch (err) {
    dbError = 'Database offline or MONGODB_URI not configured in .env.local';
    complaints = [];
    totalCount = 0;
    pendingCount = 0;
    inProgressCount = 0;
    resolvedCount = 0;
  }

  return (
    <div className="space-y-8">
      {dbError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-600" />
            <span>
              <strong>Database Status:</strong> Connect MongoDB in <code>.env.local</code> to sync live database state.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-200/50 px-2 py-0.5 rounded">
            Offline Resilient
          </span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="civic-card bg-navy text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-coral">
              <Sparkles size={13} />
              <span>Citizen Action Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-white/70 max-w-xl">
              Track your active neighborhood repair requests, view official department remarks, or file a new infrastructure issue.
            </p>
          </div>

          <Link
            href="/citizen/complaints/new"
            className="btn-coral py-3 px-6 text-sm shrink-0 self-start md:self-auto shadow-lg"
          >
            <PlusCircle size={17} />
            <span>Submit New Complaint</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="civic-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Total Reported
            </span>
            <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-navy">{totalCount}</div>
          <div className="text-xs text-text-secondary mt-1">Submitted by you</div>
        </div>

        <div className="civic-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending / Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-amber-800">{pendingCount}</div>
          <div className="text-xs text-text-secondary mt-1">Awaiting triage</div>
        </div>

        <div className="civic-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-orange-800">{inProgressCount}</div>
          <div className="text-xs text-text-secondary mt-1">Field crew assigned</div>
        </div>

        <div className="civic-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Resolved Issues
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-emerald-800">{resolvedCount}</div>
          <div className="text-xs text-text-secondary mt-1">Successfully completed</div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="civic-card p-0 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
          <div>
            <h2 className="font-display font-bold text-lg text-navy">
              Your Recent Complaints
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Strictly confidential: Only your submitted tickets are displayed.
            </p>
          </div>

          <Link
            href="/citizen/complaints"
            className="text-xs font-bold text-coral hover:text-coral-dark inline-flex items-center gap-1"
          >
            <span>View All ({totalCount})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F3F3EC] flex items-center justify-center text-text-secondary mx-auto">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                No Complaints Filed Yet
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                Notice an issue with street lighting, damaged road asphalt, or sewage overflows? Submit a complaint to alert city officials.
              </p>
            </div>
            <Link
              href="/citizen/complaints/new"
              className="btn-coral py-2.5 px-5 text-xs font-bold inline-flex"
            >
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {complaints.map((c) => (
              <Link
                key={c._id.toString()}
                href={`/citizen/complaints/${c._id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F3F3EC]/50 transition-colors group block"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-text-secondary">
                      {c.complaintId || 'CIV-TICKET'}
                    </span>
                    <span className="text-xs text-text-secondary">•</span>
                    <span className="text-xs font-semibold text-navy">
                      {c.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-navy group-hover:text-coral transition-colors truncate">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={13} className="text-coral shrink-0" />
                      {c.location?.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="shrink-0" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <StatusBadge status={c.status} />
                  <div className="w-8 h-8 rounded-full bg-[#F3F3EC] flex items-center justify-center text-text-secondary group-hover:bg-coral group-hover:text-white transition-colors">
                    <ChevronRight size={16} />
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
