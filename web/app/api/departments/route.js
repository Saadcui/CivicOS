import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Department from '@/models/Department';
import { requireAuth } from '@/lib/apiAuth';

/**
 * GET /api/departments
 * List active departments.
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    await connectDB();
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (err) {
    console.error('Fetch departments error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve departments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/departments
 * ADMIN ONLY: Create a municipal department
 */
export async function POST(request) {
  const { error } = await requireAuth(['admin']);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, code, description, contactEmail, contactPhone, categories } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Department name and unique code are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const dept = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || '',
      contactEmail: contactEmail?.trim() || '',
      contactPhone: contactPhone?.trim() || '',
      categories: Array.isArray(categories) ? categories : [],
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Department created successfully',
        department: dept,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create department error:', err);
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A department with this name or code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
