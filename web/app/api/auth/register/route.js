import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Strict input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name is required and must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // First user created in the database is automatically assigned the Administrator role.
    // Subsequent users default to Citizen privileges.
    const isFirstUser = (await User.countDocuments()) === 0;
    const assignedRole = isFirstUser ? 'admin' : 'citizen';
    const assignedDepartment = isFirstUser ? 'Municipal Commission' : null;

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: assignedRole,
      department: assignedDepartment,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully. Please proceed to login.',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Server error occurred during registration' },
      { status: 500 }
    );
  }
}
