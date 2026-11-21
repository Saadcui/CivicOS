import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/apiAuth';

/**
 * GET /api/officers
 * Returns list of government officers.
 * Accessible by: Admin and Officer
 */
export async function GET(request) {
  const { error } = await requireAuth(['admin', 'officer']);
  if (error) return error;

  try {
    await connectDB();
    const officers = await User.find({ role: 'officer' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      officers,
    });
  } catch (err) {
    console.error('Fetch officers error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve officers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/officers
 * Admin creates an authorized government officer with an assigned department.
 * ADMIN ONLY
 */
export async function POST(request) {
  const { error } = await requireAuth(['admin']);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, password, department, phone } = body;

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password and department are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Role is strictly set to 'officer' by Admin
    const officer = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'officer',
      department: department.trim(),
      phone: phone || null,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Government officer account provisioned successfully',
        officer: officer.toSafeObject ? officer.toSafeObject() : officer,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create officer error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to provision officer account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/officers
 * Admin updates officer status, department, or profile.
 * ADMIN ONLY
 */
export async function PATCH(request) {
  const { error } = await requireAuth(['admin']);
  if (error) return error;

  try {
    const body = await request.json();
    const { officerId, isActive, department, name, phone } = body;

    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'officerId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updates = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (department) updates.department = department.trim();
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone;

    const officer = await User.findOneAndUpdate(
      { _id: officerId, role: 'officer' },
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!officer) {
      return NextResponse.json(
        { success: false, error: 'Officer record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Officer record updated successfully',
      officer,
    });
  } catch (err) {
    console.error('Update officer error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update officer' },
      { status: 500 }
    );
  }
}
