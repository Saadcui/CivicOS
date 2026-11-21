import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_PIPELINE = [
  { id: 'Pending', label: '01 Reported', desc: 'Ticket registered & routed' },
  { id: 'Under Review', label: '02 Under Review', desc: 'Triage & initial verification' },
  { id: 'Assigned', label: '03 Assigned', desc: 'Work order given to field officer' },
  { id: 'In Progress', label: '04 In Progress', desc: 'Field repair team dispatched' },
  { id: 'Resolved', label: '05 Resolved', desc: 'Work completed & evidence verified' },
];

function getStepIndex(currentStatus) {
  if (currentStatus === 'Rejected') return -1;
  const idx = STATUS_PIPELINE.findIndex((s) => s.id === currentStatus);
  return idx !== -1 ? idx : 0;
}

export default async function ComplaintDetailPage({ params }) {
  const user = await getAuthUser();
  if (!user) return null;

  await connectDB();

  const { id } = params;

  let complaint = null;
  try {
    complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department')
      .populate('remarks.author', 'name role')
      .lean();
  } catch (err) {
    notFound();
  }

  if (!complaint) {
    notFound();
  }

  // CRITICAL RBAC CHECK:
  // Citizen MUST only view their own complaint.
  const submittedById = complaint.submittedBy?._id
    ? complaint.submittedBy._id.toString()
    : complaint.submittedBy?.toString();

  if (submittedById !== user.userId) {
    redirect('/access-denied');
  }

  const currentStepIdx = getStepIndex(complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/citizen/complaints"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to My Complaints</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="civic-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-navy text-white px-2.5 py-1 rounded-md">
              {complaint.complaintId || 'CIV-TICKET'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-coral/10 text-coral">
              {complaint.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              Priority: {complaint.priority || 'Medium'}
            </span>
          </div>

          <div className="text-xs text-text-secondary">
            Filed on: {new Date(complaint.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          {complaint.title}
        </h1>

        <p className="text-sm text-text-secondary leading-relaxed">
          {complaint.description}
        </p>

        {/* Status Tracker Bar */}
        <div className="pt-6 border-t border-border">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Official Progress Pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STATUS_PIPELINE.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-coral text-white border-coral shadow-md'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-[#F3F3EC] text-text-secondary border-border opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {isPast ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                    </span>
                    {isPast && <Check size={14} className="text-emerald-700 font-bold" />}
                    {isCurrent && <Clock size={14} className="text-white animate-pulse" />}
                  </div>
                  <div className="text-xs font-bold truncate">{step.label}</div>
                  <div className="text-[10px] mt-0.5 line-clamp-1 opacity-80">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location & Routing Card */}
        <div className="civic-card p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
            <Building2 size={18} className="text-coral" />
            <span>Routing & Municipal Assignment</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F3F3EC] space-y-1">
              <span className="text-text-secondary block">Assigned Department</span>
              <span className="font-bold text-navy text-sm">
                {complaint.department || 'General Administration'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F3F3EC] space-y-1">
              <span className="text-text-secondary block">Assigned Field Officer</span>
              <span className="font-bold text-navy text-sm">
                {complaint.assignedToName || 'Awaiting departmental dispatch'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F3F3EC] space-y-1">
              <span className="text-text-secondary block">Incident Location</span>
              <span className="font-bold text-navy flex items-center gap-1.5 mt-0.5">
                <MapPin size={14} className="text-coral shrink-0" />
                <span>{complaint.location?.address}</span>
              </span>
              {complaint.location?.lat && (
                <span className="text-[11px] font-mono text-text-secondary block mt-1">
                  GPS: {complaint.location.lat.toFixed(4)}, {complaint.location.lng?.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Attached Photos Card */}
        <div className="civic-card p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
            <ImageIcon size={18} className="text-teal" />
            <span>Incident Photographs</span>
          </h3>

          {complaint.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {complaint.images.map((img, idx) => (
                <a
                  key={idx}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl overflow-hidden border border-border h-36 bg-navy/5 group relative block"
                >
                  <img
                    src={img}
                    alt="Complaint Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    View Full Size
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F3F3EC] rounded-xl text-xs text-text-secondary">
              No photos attached to this incident report.
            </div>
          )}
        </div>
      </div>

      {/* Official Officer Remarks */}
      <div className="civic-card p-6 sm:p-8 space-y-4">
        <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
          <MessageSquare size={18} className="text-coral" />
          <span>Official Department Remarks & Resolution Audit</span>
        </h3>

        {complaint.remarks?.length > 0 ? (
          <div className="space-y-3">
            {complaint.remarks.map((r, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#F3F3EC] border border-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-navy">
                      {r.authorName || 'Municipal Officer'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal/10 text-teal">
                      {r.authorRole || 'Officer'}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F3F3EC] rounded-xl text-xs text-text-secondary">
            No remarks logged yet by the departmental handling officer. You will be notified when updates are posted.
          </div>
        )}

        {/* Resolution Evidence if resolved */}
        {complaint.status === 'Resolved' && complaint.resolutionEvidence?.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              ✅ Work Completion Proof Uploaded by Field Team:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {complaint.resolutionEvidence.map((ev, idx) => (
                <a
                  key={idx}
                  href={ev}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl overflow-hidden border border-emerald-300 h-24 block group"
                >
                  <img
                    src={ev}
                    alt="Resolution Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
