import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/apiAuth';

/**
 * GET /api/complaints/[id]
 * Enforces strict per-record RBAC:
 * - Citizen can only read their own complaint
 * - Officer can only read complaints matching their assigned department
 * - Admin can read any complaint
 */
export async function GET(request, { params }) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const { id } = params;
    await connectDB();

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email phone avatar')
      .populate('assignedTo', 'name email department')
      .populate('remarks.author', 'name email role')
      .lean();

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Citizen RBAC check
    if (user.role === 'citizen') {
      const submittedById = complaint.submittedBy?._id
        ? complaint.submittedBy._id.toString()
        : complaint.submittedBy?.toString();

      if (submittedById !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You are not authorized to view another citizen’s complaint',
          },
          { status: 403 }
        );
      }
    }

    // Officer RBAC check
    if (user.role === 'officer') {
      if (!user.department || complaint.department !== user.department) {
        return NextResponse.json(
          {
            success: false,
            error: `Forbidden: This complaint belongs to '${complaint.department}', but you are assigned to '${user.department}'`,
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
    }

    return NextResponse.json({
      success: true,
      complaint,
    });
  } catch (err) {
    console.error('Fetch complaint by ID error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve complaint' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/complaints/[id]
 * Officer or Admin updates complaint fields:
 * - Assign officer
 * - Change status / priority
 * - Add resolution evidence
 */
export async function PATCH(request, { params }) {
  const { error, user } = await requireAuth(['officer', 'admin']);
  if (error) return error;

  try {
    const { id } = params;
    const body = await request.json();
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
            error: 'Forbidden: Cannot update complaint belonging to another department',
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
      if (body.assignedTo !== undefined || body.assignedToName !== undefined || body.assignedToEmail !== undefined) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Officers cannot assign complaints' },
          { status: 403 }
        );
      }
    }

    const allowedUpdates = [
      'status',
      'priority',
      'department',
      'assignedTo',
      'assignedToName',
      'resolutionEvidence',
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        complaint[field] = body[field];
      }
    });

    if (body.status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    } else if (body.status !== 'Resolved') {
      complaint.resolvedAt = null;
    }

    await complaint.save();

    return NextResponse.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (err) {
    console.error('Update complaint error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/complaints/[id]
 * Admin may delete any complaint.
 * Officers may delete only complaints in their assigned department.
 */
export async function DELETE(request, { params }) {
  const { error, user } = await requireAuth(['officer', 'admin']);
  if (error) return error;

  try {
    await connectDB();
    const { id } = params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    if (
      user.role === 'officer'
      && (!user.department || complaint.department !== user.department)
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot delete another department complaint' },
        { status: 403 }
      );
    }
    if (user.role === 'officer') {
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
    }

    await Complaint.deleteOne({ _id: complaint._id });

    return NextResponse.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (err) {
    console.error('Delete complaint error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete complaint' },
      { status: 500 }
    );
  }
}
