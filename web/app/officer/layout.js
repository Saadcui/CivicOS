import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import GovernmentLayout from '@/components/layout/GovernmentLayout';

export const metadata = {
  title: 'Officer Administration – CivicOS',
};

export default async function Layout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login?redirect=/officer');
  }

  // Officer and Admin have access to officer portal
  if (!['officer', 'admin'].includes(user.role)) {
    redirect('/access-denied');
  }

  return <GovernmentLayout user={user}>{children}</GovernmentLayout>;
}
