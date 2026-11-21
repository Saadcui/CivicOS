'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Menu, X, ArrowRight, Activity, MapPin } from 'lucide-react';

export default function PublicNav({ user = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'officer') return '/officer';
    return '/citizen';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F3F3EC]/90 backdrop-blur-md border-b border-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* CivicOS Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Shield size={20} className="fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-navy leading-none">
              Civic<span className="text-coral">OS</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mt-0.5">
              Smart City Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
          <Link href="/" className="text-navy hover:text-coral transition-colors">
            Home
          </Link>
          <a href="#services" className="hover:text-navy transition-colors">
            Services
          </a>
          <a href="#how-it-works" className="hover:text-navy transition-colors">
            How It Works
          </a>
          <a href="#impact" className="hover:text-navy transition-colors">
            Impact
          </a>
          <a href="#updates" className="hover:text-navy transition-colors">
            City Updates
          </a>
        </div>

        {/* Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href={getDashboardLink()}
              className="btn-coral py-2.5 px-5 text-sm"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-navy hover:text-coral px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-coral py-2.5 px-5 text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-navy hover:text-coral transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border px-6 py-6 shadow-xl space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-navy hover:text-coral"
          >
            Home
          </Link>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-text-secondary hover:text-navy"
          >
            Services
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-text-secondary hover:text-navy"
          >
            How It Works
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-text-secondary hover:text-navy"
          >
            Impact
          </a>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {user ? (
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-coral w-full justify-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-outline-navy w-full justify-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-coral w-full justify-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
