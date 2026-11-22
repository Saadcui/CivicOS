import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OfficerProfileForm from './OfficerProfileForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Officer Profile – CivicOS',
};

export default async function OfficerProfilePage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  await connectDB();
  const user = await User.findById(authUser.userId).lean();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
          Officer Identity
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          My Profile
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your identity, profile photo, and contact details.
        </p>
      </div>

      <OfficerProfileForm user={JSON.parse(JSON.stringify(user || authUser))} />
    </div>
  );
}
