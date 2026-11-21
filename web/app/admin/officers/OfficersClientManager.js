'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Mail,
  Lock,
  Phone,
  Shield,
  X,
} from 'lucide-react';

export default function OfficersClientManager({ initialOfficers = [], departments = [] }) {
  const router = useRouter();

  const [officers, setOfficers] = useState(initialOfficers);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: departments[0]?.name || 'Public Works',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filteredOfficers = officers.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.department?.toLowerCase().includes(q)
    );
  });

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create officer account');
        setLoading(false);
        return;
      }

      setOfficers([data.officer, ...officers]);
      setSuccess(`Officer ${data.officer.name} successfully created and assigned to ${data.officer.department}!`);
      setForm({
        name: '',
        email: '',
        password: '',
        department: departments[0]?.name || 'Public Works',
        phone: '',
      });
      setModalOpen(false);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Network communication failed');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (officerId, currentActive) => {
    try {
      const res = await fetch('/api/officers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId,
          isActive: !currentActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to update status');
        return;
      }

      setOfficers(
        officers.map((o) => (o._id === officerId ? { ...o, isActive: !currentActive } : o))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Network communication failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            Municipal Personnel & Access Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            Officers Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Provision official government accounts, assign departmental jurisdiction, and manage authorization status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="btn-coral py-2.5 px-5 text-xs font-bold shrink-0 self-start sm:self-auto shadow-md inline-flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>Provision New Officer</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="civic-card p-0 overflow-hidden">
        {/* Search header */}
        <div className="p-5 border-b border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by officer name, email or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="civic-input pl-10 text-xs py-2"
            />
          </div>

          <div className="text-xs text-text-secondary font-mono">
            {officers.length} Registered Officers
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F3EC] text-text-secondary uppercase tracking-wider font-bold border-b border-border text-[10px]">
              <tr>
                <th className="py-3 px-6">Officer Name</th>
                <th className="py-3 px-6">Email Address</th>
                <th className="py-3 px-6">Assigned Department</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No officer accounts match search query.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((o) => (
                  <tr key={o._id} className="hover:bg-[#F3F3EC]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal/10 text-teal font-bold flex items-center justify-center shrink-0">
                          {o.name?.charAt(0) || 'O'}
                        </div>
                        <div className="font-bold text-navy">{o.name}</div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-text-secondary font-mono text-[11px]">
                      {o.email}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-teal px-2 py-0.5 rounded-md bg-teal/10 text-xs">
                        {o.department || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-text-secondary">
                      {o.phone || '—'}
                    </td>

                    <td className="py-4 px-6">
                      {o.isActive ? (
                        <span className="badge-resolved text-[10px]">Active</span>
                      ) : (
                        <span className="badge-rejected text-[10px]">Deactivated</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(o._id, o.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                          o.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {o.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Provision New Officer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="civic-card max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-navy"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
                Admin Privilege
              </span>
              <h2 className="text-xl font-bold font-display text-navy">
                Provision Government Officer
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Creates an officer account with strict departmental jurisdiction. Role is verified server-side.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOfficer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Brody"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="civic-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="officer.name@civicos.gov"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="civic-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Assigned Department *
                </label>
                <select
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="civic-input text-xs bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                  {departments.length === 0 && (
                    <>
                      <option value="Public Works">Public Works</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Water & Sewage">Water & Sewage</option>
                      <option value="Electrical & Lighting">Electrical & Lighting</option>
                      <option value="Public Safety">Public Safety</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Temporary Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="civic-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1-555-0199"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="civic-input text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline-navy py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-coral py-2 px-5 text-xs font-bold disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Provision Officer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
