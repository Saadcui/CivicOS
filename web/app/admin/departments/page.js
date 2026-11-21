import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Department from '@/models/Department';
import User from '@/models/User';
import DepartmentsClientManager from './DepartmentsClientManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Departments Management – CivicOS Admin',
};

export default async function AdminDepartmentsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  let departments = [];
  try {
    await connectDB();
    departments = await Department.find({}).sort({ name: 1 }).lean();
  } catch (err) {
    departments = [];
  }

  return (
    <DepartmentsClientManager
      initialDepartments={JSON.parse(JSON.stringify(departments))}
    />
  );
}
