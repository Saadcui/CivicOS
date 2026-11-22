import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, COOKIE_NAME, getCookieOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account status
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account has been deactivated. Please contact your city administrator.',
        },
        { status: 403 }
      );
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token with verified role and department from database
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || null,
      avatar: user.avatar || null,
    };

    const token = await signToken(tokenPayload);

    // Build response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });

    const cookieOpts = getCookieOptions();
    response.cookies.set(COOKIE_NAME, token, cookieOpts);

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
