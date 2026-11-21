'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Compass,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  'Road Damage',
  'Street Lighting',
  'Drainage',
  'Garbage',
  'Water Supply',
  'Electricity',
  'Public Safety',
  'Parks & Recreation',
  'Other',
];

const PRESET_LOCATIONS = [
  { name: 'Metro Center Plaza, 4th Ave', lat: 40.7128, lng: -74.006 },
  { name: 'Oakridge Park West, Pine Rd', lat: 40.718, lng: -74.012 },
  { name: 'Industrial Canal Ward 6', lat: 40.725, lng: -74.02 },
  { name: 'Northside Commercial Corridor', lat: 40.731, lng: -73.998 },
];

export default function NewComplaintPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    address: '',
    city: 'Metropolis',
    lat: 40.7128,
    lng: -74.006,
    priority: 'Medium',
    images: [],
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setForm({
        ...form,
        images: [...form.images, imageUrlInput.trim()],
      });
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, idx) => idx !== index),
    });
  };

  const handleSelectPresetLocation = (loc) => {
    setForm({
      ...form,
      address: loc.name,
      lat: loc.lat,
      lng: loc.lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || form.title.length < 4) {
      setError('Title must be at least 4 characters long.');
      return;
    }
    if (!form.category) {
      setError('Please select an issue category.');
      return;
    }
    if (!form.description.trim() || form.description.length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }
    if (!form.address.trim()) {
      setError('Please provide a physical street location.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          priority: form.priority,
          images: form.images,
          location: {
            address: form.address,
            city: form.city,
            lat: form.lat,
            lng: form.lng,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit complaint.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/citizen/complaints');
      }, 1800);
    } catch (err) {
      console.error(err);
      setError('Network communication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/citizen"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Citizen Overview</span>
        </Link>
      </div>

      <div className="civic-card p-8">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
            New Municipal Incident Report
          </span>
          <h1 className="text-3xl font-black font-display text-navy">
            Report a City Infrastructure Issue
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Submit detailed information and photo evidence. Your report will be automatically routed to the relevant municipal department.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 mb-6 animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 mb-6">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <div className="font-bold">Incident report successfully registered!</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Assigned to authorized department. Redirecting to your complaints...
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous deep pothole on South Boulevard near Bus Stop 12"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="civic-input"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Issue Category *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="civic-input bg-white"
              >
                <option value="">Select Municipal Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Urgency Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="civic-input bg-white"
              >
                <option value="Low">Low – Non-urgent cosmetic repair</option>
                <option value="Medium">Medium – Standard municipal maintenance</option>
                <option value="High">High – Safety concern / service outage</option>
                <option value="Critical">Critical – Immediate public hazard</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide specific details about the issue, affected roadway or water supply, visible dimensions, and public risk..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="civic-input resize-y"
            ></textarea>
          </div>

          {/* Interactive Map & Location Picker UI */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
              Location & Geolocation Verification *
            </label>

            <div className="p-4 rounded-2xl bg-[#F3F3EC] border border-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coral" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100 Main Street, Corner of 4th Ave"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="civic-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Municipality / City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="civic-input"
                  />
                </div>
              </div>

              {/* Interactive Visual Map Picker Simulation */}
              <div className="relative rounded-xl overflow-hidden border border-border h-48 bg-slate-900 flex flex-col justify-between p-4 text-white">
                <div
                  className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop')`,
                  }}
                ></div>

                {/* Simulated Map Controls */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-navy/80 text-[11px] font-mono backdrop-blur-md">
                    GPS Coordinates: {form.lat.toFixed(4)}° N, {Math.abs(form.lng).toFixed(4)}° W
                  </span>
                  <span className="text-[11px] text-teal-light font-bold flex items-center gap-1 bg-navy/80 px-2 py-1 rounded-md">
                    <Compass size={13} />
                    <span>Geo-locked</span>
                  </span>
                </div>

                {/* Pin in center */}
                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-coral/90 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <MapPin size={20} />
                  </div>
                  <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[1px]"></div>
                </div>

                {/* Preset quick location pills */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  <span className="text-[10px] text-white/70 self-center uppercase tracking-wider">
                    Quick Preset Wards:
                  </span>
                  {PRESET_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectPresetLocation(loc)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md transition-colors ${
                        form.address === loc.name
                          ? 'bg-coral text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {loc.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Evidence & Image Upload */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
                Photographic Evidence / Attachments
              </label>
              <span className="text-xs text-text-secondary">
                {form.images.length} Attached
              </span>
            </div>

            {/* Image Preview Grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-border h-24 bg-navy/5"
                  >
                    <img
                      src={img}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-navy/80 hover:bg-rose-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image URL or Mock Upload */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="url"
                  placeholder="Paste direct photo URL of the defect (optional)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="civic-input pl-10 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImage}
                className="btn-outline-navy py-2 px-4 text-xs font-bold shrink-0"
              >
                Add Photo
              </button>
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Info size={14} className="text-teal shrink-0" />
              <span>Complaints are authenticated and timestamped cryptographically.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/citizen"
                className="btn-outline-navy py-3 px-6 text-xs font-bold w-full sm:w-auto justify-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className="btn-coral py-3 px-8 text-xs font-bold w-full sm:w-auto justify-center shadow-md disabled:opacity-60"
              >
                {loading ? 'Submitting Incident Report...' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
