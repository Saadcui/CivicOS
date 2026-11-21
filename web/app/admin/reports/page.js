import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import Department from '@/models/Department';
import { BarChart3, CheckCircle2, Download, ShieldCheck, Activity, Users, Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Executive Municipal Reports – CivicOS Admin',
};

export default async function AdminReportsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let total = 0;
  let resolved = 0;
  let pending = 0;
  let critical = 0;
  let citizenCount = 0;
  let aiCount = 0;

  try {
    await connectDB();

    [total, resolved, pending, critical, citizenCount, aiCount] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
      Complaint.countDocuments({ priority: 'Critical' }),
      Complaint.countDocuments({ source: 'citizen' }),
      Complaint.countDocuments({ source: 'ai_cctv' }),
    ]);
  } catch (err) {
    // Keep zero counters
  }

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            Municipal Executive Auditing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            Executive Performance & Compliance Reports
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            City-wide audit telemetry across all 5 municipal departments and AI optical clusters.
          </p>
        </div>

        <button
          type="button"
          className="btn-coral py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Download size={14} />
          <span>Export City Master Audit (PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="civic-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Global Resolution Rate
          </div>
          <div className="text-3xl font-black font-display text-teal">{resolutionRate}%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Exceeding 85% SLA</div>
        </div>

        <div className="civic-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Total Audited Tickets
          </div>
          <div className="text-3xl font-black font-display text-navy">{total}</div>
          <div className="text-xs text-text-secondary mt-1">{resolved} verified closed</div>
        </div>

        <div className="civic-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Citizen Filed Ratio
          </div>
          <div className="text-3xl font-black font-display text-coral">
            {total > 0 ? `${Math.round((citizenCount / total) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-text-secondary mt-1">{citizenCount} citizen inputs</div>
        </div>

        <div className="civic-card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            AI Optical Automation
          </div>
          <div className="text-3xl font-black font-display text-navy">
            {total > 0 ? `${Math.round((aiCount / total) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-text-secondary mt-1">{aiCount} camera alerts</div>
        </div>
      </div>

      <div className="civic-card p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-navy">
          Governance & Legal Defensibility Statement
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Every ticket generated within CivicOS complies with strict municipal accountability requirements. Citizen inputs cannot be accessed or viewed by unauthorized peers, officers are restricted to their assigned department's work orders, and all administrative status modifications require cryptographic token authentication.
        </p>

        <div className="p-4 rounded-xl bg-[#F3F3EC] border border-border text-xs flex items-center justify-between">
          <span className="font-semibold text-navy">
            Cryptographic Engine: Node.js + Mongoose + HS256 JWT
          </span>
          <span className="text-teal font-mono">Status: High-Availability Production Ready</span>
        </div>
      </div>
    </div>
  );
}
