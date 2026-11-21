'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function ProfileClientForm({ user }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Network communication failed');
      setLoading(false);
    }
  };

  return (
    <div className="civic-card p-6 sm:p-8 space-y-6">
      {/* Avatar & Role Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        <div className="w-16 h-16 rounded-2xl bg-coral/10 text-coral flex items-center justify-center font-display font-black text-2xl">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-navy">{user?.name}</h2>
            <span className="badge-resolved text-[11px]">Active</span>
          </div>
          <div className="text-xs text-text-secondary mt-0.5">
            Role: <strong className="text-coral uppercase font-bold">{user?.role}</strong> • Member since{' '}
            {new Date(user?.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="civic-input pl-11 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Email Address (Verified Identity)
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="civic-input pl-11 text-sm bg-[#F3F3EC] cursor-not-allowed text-text-secondary"
            />
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            Email is your permanent municipal login identity and cannot be changed directly.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Phone Number (for SMS updates)
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="tel"
              placeholder="+1-555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="civic-input pl-11 text-sm"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F3F3EC] border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal" />
            <span>Cryptographic Session Token: Active</span>
          </div>
          <span className="font-mono text-text-secondary">HS256 Verified</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-coral py-3 px-6 text-xs font-bold w-full sm:w-auto shadow-sm disabled:opacity-60"
        >
          {loading ? (
            'Saving Changes...'
          ) : (
            <div className="flex items-center gap-2">
              <Save size={15} />
              <span>Save Permitted Profile Info</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
