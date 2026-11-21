import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) return error;

  try {
    await connectDB();
    const dbUser = await User.findById(user.userId).select('-password');
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User record not found' },
        { status: 404 }
      );
    }

    if (!dbUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: dbUser.toSafeObject ? dbUser.toSafeObject() : dbUser,
    });
  } catch (err) {
    console.error('Auth /me error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}
