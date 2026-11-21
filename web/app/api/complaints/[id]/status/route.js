import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/apiAuth';

/**
 * POST /api/complaints/[id]/status
 * Authorized officer / admin workflow:
 * - Update status
 * - Add official officer remarks
 * - Attach resolution evidence photos / documents
 * - Verify AI detection
 */
export async function POST(request, { params }) {
  const { error, user } = await requireAuth(['officer', 'admin']);
  if (error) return error;

  try {
    const { id } = params;
    const body = await request.json();
    const { status, remark, resolutionEvidence, assignedTo, assignedToName } = body;

    await connectDB();
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Officer department check
    if (user.role === 'officer') {
      if (complaint.department && complaint.department !== user.department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You cannot modify status for another department’s complaint',
          },
          { status: 403 }
        );
      }
    }

    if (status) {
      const validStatuses = ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status value' },
          { status: 400 }
        );
      }
      complaint.status = status;
      if (status === 'Resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    if (assignedTo) {
      complaint.assignedTo = assignedTo;
      complaint.assignedToName = assignedToName || user.name;
    }

    if (resolutionEvidence && Array.isArray(resolutionEvidence)) {
      complaint.resolutionEvidence.push(...resolutionEvidence);
    }

    if (remark && typeof remark === 'string' && remark.trim().length > 0) {
      complaint.remarks.push({
        author: user.userId,
        authorName: user.name,
        authorRole: user.role,
        text: remark.trim(),
        createdAt: new Date(),
      });
    }

    await complaint.save();

    return NextResponse.json({
      success: true,
      message: 'Complaint workflow updated successfully',
      complaint,
    });
  } catch (err) {
    console.error('Complaint status workflow error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process status update' },
      { status: 500 }
    );
  }
}
