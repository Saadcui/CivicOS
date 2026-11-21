import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, LogOut } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';

export default async function AccessDeniedPage() {
  const user = await getAuthUser();

  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'officer') return '/officer';
    return '/citizen';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md civic-card p-8 sm:p-10 border-border shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
            Access Restricted
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your authenticated role does not possess the cryptographic permissions required to access this municipal administration resource.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-xl bg-[#F3F3EC] border border-border text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-secondary">Current User:</span>
              <span className="font-bold text-navy">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Active Role:</span>
              <span className="font-bold uppercase text-coral">{user.role}</span>
            </div>
            {user.department && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Assigned Dept:</span>
                <span className="font-bold text-navy">{user.department}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={getDashboardHref()}
            className="btn-coral flex-1 py-3 text-xs font-bold justify-center"
          >
            <ArrowLeft size={14} />
            <span>My Authorized Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="btn-outline-navy flex-1 py-3 text-xs font-bold justify-center"
          >
            <span>Switch Account</span>
          </Link>
        </div>

        <p className="text-[11px] text-text-secondary">
          If you believe this restriction is an error, please contact your Municipal System Administrator.
        </p>
      </div>
    </div>
  );
}
