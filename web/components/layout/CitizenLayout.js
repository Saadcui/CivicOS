'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Home,
} from 'lucide-react';

export default function CitizenLayout({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/citizen', icon: LayoutDashboard },
    { label: 'Submit New Complaint', href: '/citizen/complaints/new', icon: PlusCircle },
    { label: 'My Complaints', href: '/citizen/complaints', icon: FileText },
    { label: 'My Profile', href: '/citizen/profile', icon: User },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-border shrink-0 fixed inset-y-0 left-0 z-40">
        <div>
          {/* Logo Header */}
          <div className="h-20 px-6 flex items-center border-b border-border">
            <Link
              href="/"
              title="CivicOS Home - Return to Website"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Shield size={18} className="fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-navy leading-none group-hover:text-coral transition-colors">
                  Civic<span className="text-coral">OS</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-text-secondary mt-0.5">
                  Citizen Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Back to Home Website Action */}
          <div className="px-4 pt-3 pb-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-navy hover:text-coral bg-[#F3F3EC] hover:bg-coral/10 border border-border transition-all shadow-sm group"
            >
              <Home size={15} className="text-coral group-hover:scale-110 transition-transform" />
              <span>Back to Home Page</span>
            </Link>
          </div>

          {/* Navigation Links (Hides unauthorized officer/admin items) */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-text-secondary/70">
              Citizen Navigation
            </div>
            {navItems.map((item) => {
              const isActive =
                item.href === '/citizen'
                  ? pathname === '/citizen'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-coral text-white shadow-sm'
                      : 'text-text-secondary hover:text-navy hover:bg-[#F3F3EC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-80" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="p-3 rounded-xl bg-[#F3F3EC] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-coral/10 text-coral font-bold flex items-center justify-center shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-navy truncate">{user?.name}</div>
              <div className="text-[10px] uppercase font-semibold text-coral truncate">
                Role: Citizen
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={15} />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-white border-b border-border px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" title="CivicOS Home - Return to Website" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center text-white">
            <Shield size={16} />
          </div>
          <span className="font-display font-bold text-base text-navy">
            Civic<span className="text-coral">OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-navy"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm flex">
          <div className="w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <Link
                  href="/"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center text-white">
                    <Shield size={16} />
                  </div>
                  <span className="font-display font-bold text-base text-navy">Citizen Portal</span>
                </Link>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>

              {/* Quick Return to Home */}
              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-coral bg-coral/10 hover:bg-coral/15 transition-colors"
              >
                <Home size={15} />
                <span>Back to Home Page</span>
              </Link>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-[#F3F3EC]"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="text-xs text-text-secondary truncate">
                Signed in as: <strong className="text-navy">{user?.email}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="w-full btn-outline-navy py-2 text-xs font-bold justify-center"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden lg:flex h-20 bg-white border-b border-border px-8 items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Citizen Workspace
            </h2>
            <div className="text-sm font-bold text-navy">
              Welcome back, {user?.name || 'Citizen'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-navy hover:text-coral bg-[#F3F3EC] hover:bg-coral/10 border border-border transition-colors"
              title="Return to public homepage"
            >
              <Home size={14} />
              <span>Back to Home</span>
            </Link>

            <div className="h-6 w-px bg-border"></div>

            <Link
              href="/citizen/complaints/new"
              className="btn-coral py-2 px-4 text-xs font-bold"
            >
              <PlusCircle size={15} />
              <span>Report An Issue</span>
            </Link>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <span className="text-xs font-bold text-navy">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
