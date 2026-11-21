import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/apiAuth';

// Category to Department Auto-routing map
const CATEGORY_DEPARTMENT_MAP = {
  'Road Damage': 'Public Works',
  'Street Lighting': 'Electrical & Lighting',
  'Drainage': 'Water & Sewage',
  'Garbage': 'Sanitation',
  'Water Supply': 'Water & Sewage',
  'Electricity': 'Electrical & Lighting',
  'Public Safety': 'Public Safety',
  'Parks & Recreation': 'Parks & Recreation',
  'Other': 'General Administration',
};

/**
 * GET /api/complaints
 * Returns complaints filtered strictly by role:
 * - Citizen: ONLY complaints submitted by this citizen
 * - Officer: ONLY complaints belonging to the officer's department
 * - Admin: ALL complaints across the municipality
 */
export async function GET(request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    // BUILD STRICT RBAC FILTER
    const query = {};

    if (user.role === 'citizen') {
      // Citizen restriction: ONLY their own complaints
      query.submittedBy = user.userId;
    } else if (user.role === 'officer') {
      // Officer restriction: ONLY their authorized department
      if (!user.department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Officer has no department assigned. Please contact municipal admin.',
          },
          { status: 403 }
        );
      }
      query.department = user.department;
    }
    // Admin has no role filter restriction

    // Additional optional filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (source && source !== 'All') {
      query.source = source;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { complaintId: searchRegex },
        { 'location.address': searchRegex },
      ];
    }

    const [complaints, total, stats] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email department')
        .lean(),
      Complaint.countDocuments(query),
      // Aggregate stats scoped to user's permissions
      Complaint.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = {
      total,
      pending: 0,
      underReview: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };

    stats.forEach((s) => {
      if (s._id === 'Pending') statusCounts.pending = s.count;
      else if (s._id === 'Under Review') statusCounts.underReview = s.count;
      else if (s._id === 'Assigned') statusCounts.assigned = s.count;
      else if (s._id === 'In Progress') statusCounts.inProgress = s.count;
      else if (s._id === 'Resolved') statusCounts.resolved = s.count;
      else if (s._id === 'Rejected') statusCounts.rejected = s.count;
    });

    return NextResponse.json({
      success: true,
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statusCounts,
    });
  } catch (err) {
    console.error('Fetch complaints API error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve complaints' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints
 * Citizen submits a new complaint
 */
export async function POST(request) {
  const { error, user } = await requireAuth(['citizen', 'admin']);
  if (error) return error;

  try {
    const body = await request.json();
    const { title, description, category, location, images, priority } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Complaint title must be at least 4 characters' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!location || !location.address || location.address.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Valid location address is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const assignedDept = CATEGORY_DEPARTMENT_MAP[category] || 'General Administration';

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category,
      department: assignedDept,
      priority: priority || 'Medium',
      status: 'Pending',
      source: 'citizen',
      submittedBy: user.userId,
      submittedByName: user.name,
      submittedByEmail: user.email,
      location: {
        address: location.address.trim(),
        city: location.city || 'Metropolis',
        lat: location.lat || null,
        lng: location.lng || null,
      },
      images: Array.isArray(images) ? images : [],
      remarks: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint submitted successfully and routed to ' + assignedDept,
        complaint,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create complaint error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit complaint' },
      { status: 500 }
    );
  }
}
