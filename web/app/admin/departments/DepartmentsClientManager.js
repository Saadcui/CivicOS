'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Tag,
  Layers,
  X,
} from 'lucide-react';

export default function DepartmentsClientManager({ initialDepartments = [] }) {
  const router = useRouter();

  const [departments, setDepartments] = useState(initialDepartments);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    categoriesStr: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const categories = form.categoriesStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          description: form.description,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          categories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create department');
        setLoading(false);
        return;
      }

      setDepartments([...departments, data.department]);
      setSuccess(`Department ${data.department.name} (${data.department.code}) created successfully!`);
      setForm({
        name: '',
        code: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        categoriesStr: '',
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
            Municipal Organizational Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            Departments Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure municipal agencies, service routing tags, and communication channels.
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
          <span>Add New Department</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="civic-card p-6 flex flex-col justify-between hover:border-teal transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center font-black font-display text-sm">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-navy group-hover:text-teal transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-[10px] font-mono text-text-secondary uppercase">
                      Code: {dept.code}
                    </span>
                  </div>
                </div>

                <span className="badge-resolved text-[10px]">Active</span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                {dept.description || 'No formal description logged.'}
              </p>

              {/* Tag Categories */}
              {dept.categories?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Handled Complaint Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md bg-[#F3F3EC] text-navy text-[11px] font-semibold"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-coral" />
                <span className="truncate max-w-[140px]">{dept.contactEmail || 'desk@civicos.gov'}</span>
              </div>
              <span className="font-mono text-[10px]">{dept.contactPhone || '+1-555-0100'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Department */}
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
              <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
                Admin Privilege
              </span>
              <h2 className="text-xl font-bold font-display text-navy">
                Register Municipal Department
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Creates a new municipal organizational unit with its own complaints queue and officer staff.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Parks & Urban Forestry"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="civic-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                    Code (3-4 char) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="PRK"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="civic-input text-xs uppercase font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Jurisdiction & Operational Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe public responsibilities, services covered, and equipment managed..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="civic-input text-xs resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  Handled Incident Categories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fallen Trees, Park Lights, Public Benches, Grass Maintenance"
                  value={form.categoriesStr}
                  onChange={(e) => setForm({ ...form, categoriesStr: e.target.value })}
                  className="civic-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="parks@civicos.gov"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="civic-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1-555-0180"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className="civic-input text-xs"
                  />
                </div>
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
                  {loading ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
