import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
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
    const { status, remark, resolutionEvidence, assignedTo, assignedToEmail, assignedToName } = body;

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
      if (!user.department || complaint.department !== user.department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You cannot modify status for another department’s complaint',
          },
          { status: 403 }
        );
      }
      const assignedId =
        complaint.assignedTo?._id
          ? complaint.assignedTo._id.toString()
          : complaint.assignedTo?.toString();
      if (!assignedId || assignedId !== user.userId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: This complaint is assigned to another officer' },
          { status: 403 }
        );
      }
      if (assignedTo || assignedToEmail) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Officers cannot assign complaints' },
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

    if (user.role === 'admin' && assignedToEmail) {
      const cleanEmail = String(assignedToEmail).toLowerCase().trim();
      const officer = await User.findOne({
        email: cleanEmail,
        role: 'officer',
        isActive: true,
      }).select('_id name email department');

      if (!officer) {
        return NextResponse.json(
          { success: false, error: 'No active officer account exists with that email' },
          { status: 400 }
        );
      }

      if (!complaint.department || officer.department !== complaint.department) {
        return NextResponse.json(
          {
            success: false,
            error: `Officer must belong to the complaint department: ${complaint.department || 'Unassigned'}`,
          },
          { status: 400 }
        );
      }

      complaint.assignedTo = officer._id;
      complaint.assignedToName = officer.name;
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
