'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  Save,
  Upload,
  User,
} from 'lucide-react';

export default function OfficerProfileForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar: String(reader.result || '') }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          avatar: form.avatar,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="civic-card p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-border">
        {form.avatar ? (
          <img
            src={form.avatar}
            alt={form.name || 'Officer'}
            className="w-16 h-16 rounded-2xl object-cover border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-teal/10 text-teal flex items-center justify-center font-display font-black text-2xl">
            {form.name ? form.name.charAt(0).toUpperCase() : 'O'}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold font-display text-navy">{form.name}</h2>
          <div className="text-xs text-text-secondary mt-1">
            Government Officer • {user?.department || 'Department not assigned'}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Profile Photo
          </label>
          <label className="btn-outline-navy inline-flex items-center gap-2 cursor-pointer text-xs">
            <Upload size={15} />
            Upload photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhoto}
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Full Name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="civic-input pl-11 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="civic-input pl-11 text-sm bg-[#F3F3EC] text-text-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="civic-input pl-11 text-sm"
              placeholder="+92 300 0000000"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F3F3EC] border border-border">
          <div className="flex items-center gap-2 text-xs font-bold text-navy">
            <Building2 size={16} className="text-teal" />
            <span>{user?.department || 'Department not assigned'}</span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            Department and email are managed by the municipal administrator.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-coral py-3 px-6 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60"
        >
          <Save size={15} />
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
