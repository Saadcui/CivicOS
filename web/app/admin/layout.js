import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import GovernmentLayout from '@/components/layout/GovernmentLayout';

export const metadata = {
  title: 'Executive Admin Console – CivicOS',
};

export default async function Layout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // STRICT RBAC: Only admin role can access /admin
  if (user.role !== 'admin') {
    redirect('/access-denied');
  }

  return <GovernmentLayout user={user}>{children}</GovernmentLayout>;
}
