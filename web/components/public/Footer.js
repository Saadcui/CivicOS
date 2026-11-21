import Link from 'next/link';
import { Shield, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-20 pb-12 border-t border-navy-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm">
                <Shield size={20} className="fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight text-white leading-none">
                  Civic<span className="text-coral">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-0.5">
                  Smart City Platform
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              Empowering citizens and municipal administrations with unified real-time infrastructure oversight, computer vision anomaly detection, and accountable civic workflows.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/60 pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Operational
              </span>
              <span>•</span>
              <span>v2.4.0 High-Availability</span>
            </div>
          </div>

          {/* Citizen Services */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-coral">
              Citizen Services
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Report Infrastructure Issue
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Track Complaint Status
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Citizen Dashboard
                </Link>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Service Level Guarantees
                </a>
              </li>
            </ul>
          </div>

          {/* Government Services */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-teal-light">
              Government Portal
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Officer Administration
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  AI CCTV Incident Feed
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Department Workflows
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Municipal Analytics & KPI
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Official Info */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-white/90">
              Municipal Office
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-coral shrink-0 mt-0.5" />
                <span>Civic Command Center, 100 Innovation Plaza, Metropolis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-coral shrink-0" />
                <span>contact@civicos.gov</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-coral shrink-0" />
                <span>1-800-CIVIC-OS (Toll Free)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} CivicOS Municipal Authority. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Civic Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Data Governance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
