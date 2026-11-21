import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import CitizenLayout from '@/components/layout/CitizenLayout';

export const metadata = {
  title: 'Citizen Portal – CivicOS',
};

export default async function Layout({ children }) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login?redirect=/citizen');
  }

  // Strict RBAC: only citizens allowed in citizen portal
  if (user.role !== 'citizen') {
    redirect('/access-denied');
  }

  return <CitizenLayout user={user}>{children}</CitizenLayout>;
}
