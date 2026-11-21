import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function POST(request) {
  const { error } = await requireAuth(['citizen', 'officer', 'admin']);
  if (error) return error;

  const aiUrl = process.env.AI_DETECTION_URL || 'http://127.0.0.1:8001';
  const threshold = process.env.AI_CONFIDENCE_THRESHOLD || '0.25';

  try {
    const incoming = await request.formData();
    const file = incoming.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'An image file is required' },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image uploads are supported' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image must be smaller than 10 MB' },
        { status: 413 }
      );
    }

    const form = new FormData();
    form.append('image', file, file.name || 'camera-frame.jpg');
    form.append('threshold', threshold);

    const response = await fetch(`${aiUrl.replace(/\/$/, '')}/detect`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('AI detection service error:', detail);
      return NextResponse.json(
        { success: false, error: 'The AI detection service is unavailable' },
        { status: 502 }
      );
    }

    return NextResponse.json(await response.json());
  } catch (err) {
    console.error('AI analysis error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
