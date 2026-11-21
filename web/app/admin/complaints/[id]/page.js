import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import ComplaintDetailManager from '@/components/officer/ComplaintDetailManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Review Complaint – CivicOS',
};

export default async function AdminComplaintDetailPage({ params }) {
  const user = await getAuthUser();
  if (!user) return null;

  await connectDB();

  const { id } = params;

  let complaint = null;
  try {
    complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email phone avatar')
      .populate('assignedTo', 'name email department')
      .populate('remarks.author', 'name role')
      .lean();
  } catch (err) {
    notFound();
  }

  if (!complaint) {
    notFound();
  }

  return (
    <ComplaintDetailManager
      complaint={JSON.parse(JSON.stringify(complaint))}
      user={user}
      backHref="/admin/complaints"
    />
  );
}
