import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/apiAuth';

/**
 * PATCH /api/auth/profile
 * Allows authenticated user to update their permitted personal profile fields.
 * Explicitly blocks updating role, email, or department.
 */
export async function PATCH(request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, phone } = body;

    await connectDB();

    const updates = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updates.name = name.trim();
    }
    if (phone !== undefined) {
      updates.phone = typeof phone === 'string' ? phone.trim() : null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
