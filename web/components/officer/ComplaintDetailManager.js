'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Camera,
  MessageSquare,
  Sparkles,
  Send,
  Upload,
  Cpu,
  Layers,
  Trash2,
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export default function ComplaintDetailManager({ complaint, user, backHref = '/officer/complaints' }) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState(complaint.status);
  const [remarkInput, setRemarkInput] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [assignedToInput, setAssignedToInput] = useState(complaint.assignedToName || user.name);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdateWorkflow = async (newStatusOverride = null) => {
    setSavingStatus(true);
    setMessage({ text: '', type: '' });

    const targetStatus = newStatusOverride || currentStatus;

    try {
      const res = await fetch(`/api/complaints/${complaint._id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          remark: remarkInput.trim() || undefined,
          assignedToName: assignedToInput.trim() || undefined,
          resolutionEvidence: evidenceUrl.trim() ? [evidenceUrl.trim()] : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to update workflow', type: 'error' });
        setSavingStatus(false);
        return;
      }

      setCurrentStatus(targetStatus);
      setRemarkInput('');
      setEvidenceUrl('');
      setMessage({ text: 'Complaint status and remarks updated successfully!', type: 'success' });
      setSavingStatus(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Network error occurred while saving', type: 'error' });
      setSavingStatus(false);
    }
  };

  const isAiSource = complaint.source === 'ai_cctv';

  const handleDelete = async () => {
    if (!window.confirm(`Delete complaint ${complaint.complaintId || complaint._id}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch(`/api/complaints/${complaint._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete complaint');
      }
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete complaint', type: 'error' });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints Queue</span>
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-60"
        >
          <Trash2 size={15} />
          {deleting ? 'Deleting...' : 'Delete Complaint'}
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="civic-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-navy text-white px-2.5 py-1 rounded-md">
                {complaint.complaintId || 'CIV-TICKET'}
              </span>

              {isAiSource ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-navy text-white">
                  <Cpu size={13} className="text-teal-light" />
                  <span>CCTV Optical AI Detection</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-coral/10 text-coral">
                  <User size={13} />
                  <span>Citizen Submission</span>
                </span>
              )}

              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F3F3EC] text-navy">
                {complaint.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display text-navy pt-2">
              {complaint.title}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-xs text-text-secondary">Incident Timestamp</div>
            <div className="text-xs font-bold text-navy mt-0.5">
              {new Date(complaint.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI Camera Telemetry Banner (If AI CCTV source) */}
        {isAiSource && (
          <div className="p-4 rounded-2xl bg-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal/20 text-teal-light flex items-center justify-center shrink-0">
                <Camera size={20} />
              </div>
              <div>
                <div className="text-xs font-bold font-display text-white">
                  Automated CCTV Optical Telemetry
                </div>
                <div className="text-[11px] text-white/70">
                  Camera Node: {complaint.cctvCameraId || 'CCTV-SURV-CLUSTER-09'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-white/60">
                  Confidence Score
                </div>
                <div className="text-lg font-black font-mono text-teal-light">
                  {complaint.aiConfidence ? `${(complaint.aiConfidence * 100).toFixed(1)}%` : '94.2%'}
                </div>
              </div>

              {currentStatus === 'Under Review' && (
                <button
                  type="button"
                  onClick={() => handleUpdateWorkflow('Assigned')}
                  className="btn-coral py-2 px-4 text-xs font-bold shadow-md"
                >
                  Verify AI Detection
                </button>
              )}
            </div>
          </div>
        )}

        {/* Image & Description Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Photos */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
              Optical Evidence Frame / Attached Image
            </span>
            <div className="rounded-2xl overflow-hidden border border-border h-64 bg-navy/5 relative group">
              {complaint.aiDetectionFrame || complaint.images?.length > 0 ? (
                <img
                  src={complaint.aiDetectionFrame || complaint.images[0]}
                  alt="Stored AI detection frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary text-xs p-6 text-center">
                  <Camera size={32} className="opacity-40 mb-2" />
                  <span>No photographic frame available</span>
                </div>
              )}
              {isAiSource && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-navy/80 text-teal-light text-[10px] font-mono backdrop-blur-md">
                  Stored AI Detection Frame
                </div>
              )}
            </div>
          </div>

          {/* Description & Citizen Info */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Incident Description
              </span>
              <p className="text-sm text-text-primary leading-relaxed bg-[#F3F3EC] p-4 rounded-xl border border-border">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-border">
                <span className="text-text-secondary block mb-0.5">Submitted By:</span>
                <span className="font-bold text-navy">{complaint.submittedByName || 'Citizen'}</span>
                <span className="text-[11px] text-text-secondary block truncate">
                  {complaint.submittedByEmail || 'Registered Citizen'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-border">
                <span className="text-text-secondary block mb-0.5">Assigned Department:</span>
                <span className="font-bold text-teal">{complaint.department || 'General Admin'}</span>
                <span className="text-[11px] text-text-secondary block">
                  Priority: {complaint.priority}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-border flex items-start gap-2 text-xs">
              <MapPin size={15} className="text-coral shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-navy block">Physical Geolocation:</span>
                <span className="text-text-secondary">{complaint.location?.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Status & Assignment Controls */}
      <div className="civic-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-border pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            Officer Action Center
          </span>
          <h2 className="text-xl font-bold font-display text-navy">
            Update Status, Assign Crew & Add Remarks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
              Current Workflow Status
            </label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="civic-input font-bold text-navy bg-white"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-secondary mt-1">
              Updating to "Resolved" timestamps completion and alerts the citizen.
            </p>
          </div>

          {/* Assigned Officer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
              Assigned Field Officer Name
            </label>
            <input
              type="text"
              value={assignedToInput}
              onChange={(e) => setAssignedToInput(e.target.value)}
              placeholder="e.g. Marcus Brody"
              className="civic-input"
            />
          </div>
        </div>

        {/* Remark text */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Add Official Department Remark / Work Order Note
          </label>
          <textarea
            rows={3}
            placeholder="Document field findings, dispatched equipment, estimated completion timeline, or contractor details..."
            value={remarkInput}
            onChange={(e) => setRemarkInput(e.target.value)}
            className="civic-input resize-y"
          ></textarea>
        </div>

        {/* Resolution Evidence URL (if resolving) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Resolution Evidence Photo URL (Optional)
          </label>
          <input
            type="url"
            placeholder="e.g. https://images.unsplash.com/... or field camera upload"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            className="civic-input text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={savingStatus}
            onClick={() => handleUpdateWorkflow()}
            className="btn-coral py-3 px-8 text-xs font-bold shadow-md disabled:opacity-60"
          >
            {savingStatus ? 'Processing Update...' : 'Commit Status & Remark'}
          </button>
        </div>
      </div>

      {/* History Audit of Remarks */}
      <div className="civic-card p-6 sm:p-8 space-y-4">
        <h3 className="font-display font-bold text-base text-navy flex items-center gap-2">
          <MessageSquare size={18} className="text-coral" />
          <span>Audit History of Officer Remarks ({complaint.remarks?.length || 0})</span>
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
                      {r.authorName || 'Officer'}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-navy text-white">
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
            No remarks logged yet. Use the action center above to log the first official response.
          </div>
        )}

        {/* Existing Resolution Evidence Gallery */}
        {complaint.resolutionEvidence?.length > 0 && (
          <div className="pt-4 border-t border-border space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              ✅ Verifiable Field Resolution Evidence:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {complaint.resolutionEvidence.map((ev, idx) => (
                <a
                  key={idx}
                  href={ev}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl overflow-hidden border border-emerald-300 h-28 block group"
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
