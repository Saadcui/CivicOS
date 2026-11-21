'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Camera,
  Users,
  MapPin,
  Calendar,
  ChevronRight,
  ExternalLink,
  Cpu,
} from 'lucide-react';

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

export default function ComplaintsTable({
  complaints = [],
  baseRoute = '/officer/complaints',
  currentRole = 'officer',
  department = null,
}) {
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Filter complaints in memory
  const filteredComplaints = complaints.filter((c) => {
    if (sourceFilter !== 'All') {
      if (sourceFilter === 'Citizen' && c.source !== 'citizen') return false;
      if (sourceFilter === 'AI' && c.source !== 'ai_cctv') return false;
    }
    if (statusFilter !== 'All' && c.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchId = c.complaintId?.toLowerCase().includes(q);
      const matchAddress = c.location?.address?.toLowerCase().includes(q);
      const matchCategory = c.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchAddress && !matchCategory) return false;
    }
    return true;
  });

  return (
    <div className="civic-card p-0 overflow-hidden space-y-0">
      {/* Table Header & Controls */}
      <div className="p-6 border-b border-border bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-navy">
              Complaints Management Queue
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {department ? (
                <>
                  Scoped to: <strong className="text-navy">{department}</strong> Department
                </>
              ) : (
                'All Municipal Departments • Municipal-Wide Administrative View'
              )}
            </p>
          </div>

          {/* Source Filter Buttons (All, Citizen, CCTV / AI) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3F3EC] border border-border w-fit">
            {['All', 'Citizen', 'AI'].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sourceFilter === src
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                {src === 'All' ? 'All Sources' : src === 'Citizen' ? '👤 Citizen' : '⚡ CCTV / AI'}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by ID, title, category or street address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="civic-input pl-10 text-xs py-2.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="civic-input text-xs py-2.5 bg-white sm:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F3F3EC] text-text-secondary uppercase tracking-wider font-bold border-b border-border text-[10px]">
            <tr>
              <th className="py-3 px-6">Complaint ID</th>
              <th className="py-3 px-6">Issue Category</th>
              <th className="py-3 px-6">Source</th>
              <th className="py-3 px-6">Location</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-secondary">
                  No complaints found matching current filters.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c._id.toString()} className="hover:bg-[#F3F3EC]/50 transition-colors">
                  {/* ID */}
                  <td className="py-4 px-6 font-mono font-bold text-navy">
                    <Link
                      href={`${baseRoute}/${c._id}`}
                      className="hover:text-coral transition-colors flex items-center gap-1"
                    >
                      <span>{c.complaintId || 'CIV-TICKET'}</span>
                    </Link>
                  </td>

                  {/* Category & Title */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-navy text-xs truncate max-w-[200px]">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{c.category}</div>
                  </td>

                  {/* Source */}
                  <td className="py-4 px-6">
                    {c.source === 'ai_cctv' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy text-white">
                        <Cpu size={11} className="text-teal-light" />
                        <span>CCTV AI ({c.aiConfidence ? `${Math.round(c.aiConfidence * 100)}%` : 'Active'})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-coral/10 text-coral">
                        <Users size={11} />
                        <span>Citizen</span>
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 text-text-secondary">
                    <div className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin size={12} className="text-coral shrink-0" />
                      <span className="truncate">{c.location?.address}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-text-secondary whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <Link
                      href={`${baseRoute}/${c._id}`}
                      className="btn-outline-navy py-1.5 px-3 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-coral hover:border-coral hover:text-white"
                    >
                      <span>Review</span>
                      <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Count */}
      <div className="p-4 bg-[#F3F3EC] border-t border-border flex items-center justify-between text-xs text-text-secondary">
        <span>
          Showing <strong className="text-navy">{filteredComplaints.length}</strong> of{' '}
          <strong className="text-navy">{complaints.length}</strong> complaints
        </span>
        <span className="text-[11px] font-mono">CivicOS Dynamic Triage Table</span>
      </div>
    </div>
  );
}
