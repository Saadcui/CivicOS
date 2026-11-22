import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/apiAuth';
import { signToken, COOKIE_NAME, getCookieOptions } from '@/lib/auth';

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
    const { name, phone, avatar } = body;

    await connectDB();

    const updates = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updates.name = name.trim();
    }
    if (phone !== undefined) {
      updates.phone = typeof phone === 'string' ? phone.trim() : null;
    }
    if (avatar !== undefined) {
      if (
        typeof avatar === 'string'
        && (avatar === '' || /^data:image\/(jpeg|png|webp);base64,/i.test(avatar))
        && avatar.length <= 2 * 1024 * 1024
      ) {
        updates.avatar = avatar || null;
      } else if (avatar !== '') {
        return NextResponse.json(
          { success: false, error: 'Invalid profile photo format' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    const refreshedToken = await signToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      department: updatedUser.department || null,
      avatar: updatedUser.avatar || null,
    });
    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
    response.cookies.set(COOKIE_NAME, refreshedToken, getCookieOptions());
    return response;
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
