import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Department from '@/models/Department';
import OfficersClientManager from './OfficersClientManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Officers Management – CivicOS Admin',
};

export default async function AdminOfficersPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let officers = [];
  let departments = [];
  try {
    await connectDB();
    [officers, departments] = await Promise.all([
      User.find({ role: 'officer' }).select('-password').sort({ createdAt: -1 }).lean(),
      Department.find({ isActive: true }).select('name code').sort({ name: 1 }).lean(),
    ]);
  } catch (err) {
    officers = [];
    departments = [];
  }

  return (
    <OfficersClientManager
      initialOfficers={JSON.parse(JSON.stringify(officers))}
      departments={JSON.parse(JSON.stringify(departments))}
    />
  );
}
