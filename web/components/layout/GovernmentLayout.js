'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Users,
  Camera,
  Building2,
  UserCheck,
  User,
  BarChart3,
  MapPin,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCircle2,
  Sparkles,
  Home,
} from 'lucide-react';

export default function GovernmentLayout({ children, user }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';

  // Navigation Items with RBAC access levels
  const allNavItems = [
    {
      label: 'Dashboard',
      href: isAdmin ? '/admin' : '/officer',
      icon: LayoutDashboard,
      roles: ['officer', 'admin'],
    },
    {
      label: 'All Complaints',
      href: isAdmin ? '/admin/complaints' : '/officer/complaints',
      icon: FileText,
      roles: ['officer', 'admin'],
    },
    {
      label: 'Assigned to Me',
      href: '/officer/complaints?assigned=me',
      icon: UserCheck,
      roles: ['officer'],
    },
    {
      label: 'My Profile',
      href: '/officer/profile',
      icon: User,
      roles: ['officer'],
    },
    {
      label: 'Citizen Complaints',
      href: isAdmin ? '/admin/complaints?source=citizen' : '/officer/complaints?source=citizen',
      icon: Users,
      roles: ['officer', 'admin'],
    },
    {
      label: 'AI Detections',
      href: isAdmin ? '/admin/complaints?source=ai_cctv' : '/officer/complaints?source=ai_cctv',
      icon: Camera,
      badge: 'CCTV AI',
      roles: ['officer', 'admin'],
    },
    {
      label: 'Live CCTV',
      href: isAdmin ? '/admin/cctv' : '/officer/cctv',
      icon: Camera,
      badge: 'Live',
      roles: ['admin'],
    },
    {
      label: 'Departments',
      href: '/admin/departments',
      icon: Building2,
      roles: ['admin'], // Hidden from officers!
    },
    {
      label: 'Officers Management',
      href: '/admin/officers',
      icon: UserCheck,
      roles: ['admin'], // Hidden from officers!
    },
    {
      label: 'Reports & Analytics',
      href: isAdmin ? '/admin/reports' : '/officer/reports',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      label: 'Geographic Map',
      href: isAdmin ? '/admin/map' : '/officer/map',
      icon: MapPin,
      roles: ['officer', 'admin'],
    },
  ];

  // Filter items visible to current user's role
  const visibleNavItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isNavActive = (item) => {
    const [basePath, queryString = ''] = item.href.split('?');
    if (pathname !== basePath) {
      const isComplaintDetail =
        (basePath === '/admin/complaints' || basePath === '/officer/complaints')
        && pathname.startsWith(`${basePath}/`);
      if (!isComplaintDetail || queryString) return false;
    }

    if (!queryString) {
      if (basePath === '/admin/complaints' || basePath === '/officer/complaints') {
        return !searchParams.has('source') && !searchParams.has('assigned');
      }
      return pathname === basePath;
    }

    const expectedParams = new URLSearchParams(queryString);
    for (const [key, value] of expectedParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

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
    <div className="min-h-screen bg-[#F3F3EC] flex flex-col lg:flex-row text-text-primary">
      {/* Desktop Sidebar (Linear/Stripe inspired navy dark aesthetic) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-navy text-white shrink-0 fixed inset-y-0 left-0 z-40 border-r border-navy-light shadow-xl">
        <div>
          {/* Logo */}
          <div className="h-20 px-6 flex items-center border-b border-white/10">
            <Link
              href="/"
              title="CivicOS Home - Return to Website"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Shield size={18} className="fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-white leading-none group-hover:text-coral transition-colors">
                  Civic<span className="text-coral">OS</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-0.5">
                  {isAdmin ? 'Admin Console' : 'Officer Workspace'}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Back to Home Website Action */}
          <div className="px-4 pt-3 pb-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shadow-sm group"
            >
              <Home size={15} className="text-coral group-hover:scale-110 transition-transform" />
              <span>Back to Home Page</span>
            </Link>
          </div>

          {/* Department badge for officers */}
          {user?.department && (
            <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/60">Dept Scope:</span>
              <span className="font-bold text-teal-light truncate max-w-[130px]">
                {user.department}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
              Government Control
            </div>

            {visibleNavItems.map((item) => {
              const isActive = isNavActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-coral text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal text-white">
                      {item.badge}
                    </span>
                  ) : (
                    isActive && <ChevronRight size={14} className="opacity-80" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                isAdmin ? 'bg-coral' : 'bg-teal'
              }`}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] uppercase font-semibold text-white/50 truncate">
                {user?.role} {user?.department ? `• ${user.department}` : ''}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut size={15} />
            <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden h-16 bg-navy text-white px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" title="CivicOS Home - Return to Website" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center text-white">
            <Shield size={16} />
          </div>
          <span className="font-display font-bold text-base text-white">
            CivicOS <span className="text-coral">{isAdmin ? 'Admin' : 'Officer'}</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/80 hover:text-white"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 flex">
          <div className="w-72 bg-navy text-white h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display font-bold text-base text-white hover:text-coral transition-colors flex items-center gap-2"
                >
                  <Shield size={16} className="text-coral" />
                  <span>CivicOS {isAdmin ? 'Admin' : 'Officer'}</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {/* Quick Return to Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-coral bg-white/10 hover:bg-white/15 transition-colors"
              >
                <Home size={15} />
                <span>Back to Home Page</span>
              </Link>

              <div className="space-y-1">
                {visibleNavItems.map((item) => {
                  const isActive = isNavActive(item);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-coral text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <item.icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-80" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full btn-outline-white py-2 text-xs font-bold justify-center"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden lg:flex h-20 bg-white border-b border-border px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {isAdmin
                ? 'Municipal Executive Administration'
                : `Department: ${user?.department || 'Not Assigned'}`}
            </span>
            <span className="text-xs text-text-secondary">•</span>
            <span className="text-xs text-teal font-mono">🟢 Optical AI Vision Online</span>
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
              href={isAdmin ? '/admin/complaints' : '/officer/complaints'}
              className="text-xs font-bold text-navy hover:text-coral transition-colors"
            >
              Complaints Queue
            </Link>

            <div className="h-6 w-px bg-border"></div>

            <Link
              href={isAdmin ? '/admin/complaints' : '/officer/profile'}
              className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-[#F3F3EC] transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Officer'}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                    isAdmin ? 'bg-coral' : 'bg-teal'
                  }`}
                >
                  {user?.name?.charAt(0) || 'G'}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-navy leading-none">{user?.name}</div>
                <div className="text-[10px] text-text-secondary uppercase mt-0.5">
                  {user?.role}
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
