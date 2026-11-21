'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect');

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Check role and redirect accordingly
      const role = data.user?.role;
      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'officer') {
        router.push('/officer');
      } else {
        router.push('/citizen');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Network communication failed. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-2">
          Authentication Portal
        </span>
        <h1 className="text-3xl font-black font-display text-navy tracking-tight">
          Sign In to CivicOS
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Enter your credentials to access your authorized municipal dashboard.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              required
              placeholder="Enter your registered email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="civic-input pl-11"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-coral hover:underline">
              Forgot password?
            </a>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="btn-coral w-full py-3.5 text-sm font-bold justify-center shadow-md disabled:opacity-60"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Verifying Authorization...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} />
            </div>
          )}
        </button>
      </form>

      <div className="pt-4 text-center text-xs text-text-secondary">
        Don't have a citizen account?{' '}
        <Link href="/register" className="font-bold text-coral hover:underline">
          Register as Citizen
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Editorial Visual Column */}
      <div className="lg:w-1/2 bg-navy relative overflow-hidden flex flex-col justify-between p-8 sm:p-14 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm">
              <Shield size={20} className="fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                Civic<span className="text-coral">OS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-0.5">
                Smart City Platform
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
          >
            ← Return to Public Site
          </Link>
        </div>

        <div className="relative z-10 my-16 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-coral">
            <Sparkles size={14} />
            <span>Unified Role-Based Access Control</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-tight">
            ACCESSIBLE CIVIC INFRASTRUCTURE.
          </h2>
          <p className="text-white/75 text-sm sm:text-base leading-relaxed">
            Log in with your verified credentials. The platform will automatically direct you to your authorized Citizen, Department Officer, or Municipal Administrator workspace.
          </p>

          <div className="pt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-coral font-bold text-lg font-display">Citizen</div>
              <div className="text-[11px] text-white/60">Report & Track</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-teal-light font-bold text-lg font-display">Officer</div>
              <div className="text-[11px] text-white/60">Manage & Resolve</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-white font-bold text-lg font-display">Admin</div>
              <div className="text-[11px] text-white/60">Oversight & Config</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/50 pt-6 border-t border-white/10">
          <span>Protected with HTTP-only JWT & bcrypt hashing</span>
          <span>© {new Date().getFullYear()} CivicOS</span>
        </div>
      </div>

      {/* Right Form Column with Suspense */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <Suspense fallback={<div className="text-xs text-text-secondary">Loading authentication interface...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
