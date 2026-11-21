'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Network communication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Editorial Visual Column */}
      <div className="lg:w-1/2 bg-coral relative overflow-hidden flex flex-col justify-between p-8 sm:p-14 text-white">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-coral shadow-sm">
              <Shield size={20} className="fill-coral/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                Civic<span className="text-navy">OS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 mt-0.5">
                Citizen Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-white/80 hover:text-white transition-colors"
          >
            ← Return to Public Site
          </Link>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 my-16 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
            <CheckCircle2 size={14} />
            <span>Official Metropolitan Citizen Portal</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-tight">
            BE HEARD. SHAPE YOUR NEIGHBORHOOD.
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Create your citizen account to submit photographic infrastructure reports, track repair stages directly, and hold city departments accountable.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Direct ticket submission with photo uploads and map pins',
              'Real-time status updates: Pending, In Progress, Resolved',
              'Officer remarks and verifiable completion evidence',
              '100% private: Citizens only access their own submitted complaints',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-xs sm:text-sm text-white/90">
                <CheckCircle2 size={16} className="text-navy shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/70 pt-6 border-t border-white/20">
          <span>Official Civic Identity System</span>
          <span>© {new Date().getFullYear()} CivicOS</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-2">
              Citizen Registration
            </span>
            <h1 className="text-3xl font-black font-display text-navy tracking-tight">
              Create Citizen Account
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Join your city's official digital complaint and monitoring platform.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-bold">Role-Based Security Policy:</span> Public self-registration provisions <span className="font-semibold underline">Citizen</span> privileges only. Government Officer and Municipal Administrator roles are strictly credentialed by municipal authorities.
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
              <div>
                <div className="font-bold">Account created successfully!</div>
                <div className="text-xs text-emerald-700 mt-0.5">Redirecting you to sign in...</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="civic-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="civic-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="civic-input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-navy"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="civic-input pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-coral w-full py-3.5 text-sm font-bold justify-center shadow-md disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Registering Citizen Profile...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Complete Citizen Registration</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>

          <div className="pt-4 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-coral hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
