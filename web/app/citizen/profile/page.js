import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ProfileClientForm from './ProfileClientForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Profile – CivicOS Citizen',
};

export default async function CitizenProfilePage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  await connectDB();
  const userDoc = await User.findById(authUser.userId).lean();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
          Identity & Contact
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          Citizen Profile
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your verified contact coordinates and public identity.
        </p>
      </div>

      <ProfileClientForm user={JSON.parse(JSON.stringify(userDoc || authUser))} />
    </div>
  );
}
