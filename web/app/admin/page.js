import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import Department from '@/models/Department';
import ComplaintsTable from '@/components/officer/ComplaintsTable';
import {
  Shield,
  Building2,
  UserCheck,
  PlusCircle,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Camera,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let complaints = [];
  let totalCount = 0;
  let citizenCount = 0;
  let aiCount = 0;
  let pendingCount = 0;
  let resolvedCount = 0;
  let officersCount = 0;
  let departmentsCount = 0;
  let categoryStats = [];
  let dbError = null;

  try {
    await connectDB();

    [
      complaints,
      totalCount,
      citizenCount,
      aiCount,
      pendingCount,
      resolvedCount,
      officersCount,
      departmentsCount,
      categoryStats,
    ] = await Promise.all([
      Complaint.find({}).sort({ createdAt: -1 }).limit(20).lean(),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ source: 'citizen' }),
      Complaint.countDocuments({ source: 'ai_cctv' }),
      Complaint.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
      Complaint.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ role: 'officer', isActive: true }),
      Department.countDocuments({ isActive: true }),
      Complaint.aggregate([
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
    officersCount = 0;
    departmentsCount = 0;
    categoryStats = [];
  }

  const stats = {
    total: totalCount,
    citizen: citizenCount,
    ai: aiCount,
    pending: pendingCount,
    resolved: resolvedCount,
    officers: officersCount,
    departments: departmentsCount,
    resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
  };

  return (
    <div className="space-y-8">
      {dbError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-amber-600" />
            <span>
              <strong>Database Status:</strong> Connect MongoDB in <code>.env.local</code> to sync live municipal cluster.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-200/50 px-2 py-0.5 rounded">
            Offline Resilient
          </span>
        </div>
      )}

      {/* Executive Welcome Banner */}
      <div className="civic-card bg-navy text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-coral">
              <Shield size={14} />
              <span>Municipal Command & Executive Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Administrator Oversight Center
            </h1>
            <p className="text-sm text-white/70 max-w-xl">
              Complete administrative authority over municipal departments, officer credentialing, AI vision sensors, and city-wide resolution pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/officers"
              className="btn-coral py-2.5 px-4 text-xs font-bold shadow-md"
            >
              <UserCheck size={15} />
              <span>Manage Officers</span>
            </Link>
            <Link
              href="/admin/departments"
              className="btn-outline-white py-2.5 px-4 text-xs font-bold"
            >
              <Building2 size={15} />
              <span>Manage Departments</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: stats.total, icon: FileText, color: 'text-navy bg-navy/5' },
          { label: 'Citizen Reports', value: stats.citizen, icon: UserCheck, color: 'text-coral bg-coral/10' },
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

      {/* Quick Admin Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/officers"
          className="civic-card p-6 hover:border-coral transition-all group block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <span className="text-xs font-bold text-coral group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-navy">
            Government Officers ({officersCount})
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Provision new officer accounts, assign departmental jurisdiction, and toggle security status.
          </p>
        </Link>

        <Link
          href="/admin/departments"
          className="civic-card p-6 hover:border-teal transition-all group block"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <span className="text-xs font-bold text-teal group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </span>
          </div>
          <h3 className="font-display font-bold text-base text-navy">
            Municipal Departments ({departmentsCount})
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Configure municipal agencies, service code prefixes, categories, and department heads.
          </p>
        </Link>

      </div>

      {/* City-Wide Complaints Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-navy">
            City-Wide Complaints Queue
          </h2>
          <span className="text-xs font-bold text-coral">
            Unrestricted Municipal Administrative View
          </span>
        </div>

        <ComplaintsTable
          complaints={JSON.parse(JSON.stringify(complaints))}
          baseRoute="/admin/complaints"
          currentRole="admin"
          department={null}
        />
      </div>
    </div>
  );
}
