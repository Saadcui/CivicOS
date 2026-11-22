import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import ComplaintsTable from '@/components/officer/ComplaintsTable';
import { Building2, AlertCircle, FileText, Users, Camera, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OfficerDashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let complaints = [];
  let totalCount = 0;
  let citizenCount = 0;
  let aiCount = 0;
  let pendingCount = 0;
  let resolvedCount = 0;
  let categoryStats = [];
  let dbError = null;

  try {
    await connectDB();

    const scopeQuery = {};
    if (user.role === 'officer') {
      if (!user.department) {
        scopeQuery._id = null;
      } else {
        scopeQuery.department = user.department;
      }
    }

    [
      complaints,
      totalCount,
      citizenCount,
      aiCount,
      pendingCount,
      resolvedCount,
      categoryStats,
    ] = await Promise.all([
      Complaint.find(scopeQuery).sort({ createdAt: -1 }).limit(20).lean(),
      Complaint.countDocuments(scopeQuery),
      Complaint.countDocuments({ ...scopeQuery, source: 'citizen' }),
      Complaint.countDocuments({ ...scopeQuery, source: 'ai_cctv' }),
      Complaint.countDocuments({
        ...scopeQuery,
        status: { $in: ['Pending', 'Under Review'] },
      }),
      Complaint.countDocuments({ ...scopeQuery, status: 'Resolved' }),
      Complaint.aggregate([
        { $match: scopeQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
  } catch (err) {
    dbError = 'Database offline or MONGODB_URI not configured in .env.local';
    complaints = [];
    totalCount = 0;
    citizenCount = 0;
    aiCount = 0;
    pendingCount = 0;
    resolvedCount = 0;
    categoryStats = [];
  }

  const stats = {
    total: totalCount,
    citizen: citizenCount,
    ai: aiCount,
    pending: pendingCount,
    resolved: resolvedCount,
    resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
  };

  return (
    <div className="space-y-8">
      {dbError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-600" />
            <span>
              <strong>Database Status:</strong> Connect MongoDB in <code>.env.local</code> to sync live department state.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-200/50 px-2 py-0.5 rounded">
            Offline Resilient
          </span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="civic-card bg-navy text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-teal-light">
              <Building2 size={14} />
              <span>
                Department Authorization:{' '}
                {user.department || 'No Department Assigned'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Officer Administration Console
            </h1>
            <p className="text-sm text-white/70 max-w-xl">
              Real-time dispatch, AI CCTV anomaly review, and municipal resolution tracking for{' '}
              <strong className="text-white">
                {user.department || 'No Department Assigned'}
              </strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl font-bold font-display text-teal-light">
                {stats.resolutionRate}%
              </div>
              <div className="text-[10px] text-white/60">Resolution Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Department Complaints', value: stats.total, icon: FileText, color: 'text-navy bg-navy/5' },
          { label: 'Citizen Reports', value: stats.citizen, icon: Users, color: 'text-coral bg-coral/10' },
          { label: 'CCTV / AI', value: stats.ai, icon: Camera, color: 'text-teal bg-teal/10' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-700 bg-amber-50' },
        ].map((item) => (
          <div key={item.label} className="civic-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {item.label}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                <item.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-black font-display text-navy">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Complaints Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-navy">
            Active Department Complaints
          </h2>
          <span className="text-xs text-text-secondary">
            Authorized Scope: {user.department || 'No Department Assigned'}
          </span>
        </div>

        <ComplaintsTable
          complaints={JSON.parse(JSON.stringify(complaints))}
          baseRoute="/officer/complaints"
          currentRole="officer"
          department={user.department}
          officerId={user.userId}
        />
      </div>
    </div>
  );
}
