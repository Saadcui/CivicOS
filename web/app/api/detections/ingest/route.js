import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';

export const runtime = 'nodejs';

const DETECTION_CATEGORY_MAP = {
  cracks: 'Road Damage',
  open_manhole: 'Public Safety',
  pothole: 'Road Damage',
  waste_container: 'Garbage',
};

function makeLocationKey(category, location) {
  const address = String(location?.address || '').trim().toLowerCase();
  if (Number.isFinite(location?.lat) && Number.isFinite(location?.lng)) {
    const lat = location.lat.toFixed(4);
    const lng = location.lng.toFixed(4);
    return `${category}|${lat}|${lng}`;
  }
  return `${category}|${address}`;
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request) {
  const apiKey = process.env.CCTV_INGEST_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'CCTV ingest API key is not configured' },
      { status: 503 }
    );
  }

  const suppliedKey = request.headers.get('x-cctv-api-key');
  if (!safeEqual(suppliedKey || '', apiKey)) {
    return NextResponse.json(
      { success: false, error: 'Invalid CCTV ingest API key' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const cameraId = typeof body.cameraId === 'string' ? body.cameraId.trim() : '';
    const address = typeof body.location?.address === 'string'
      ? body.location.address.trim()
      : '';
    const detections = Array.isArray(body.detections) ? body.detections : [];

    if (!cameraId || !address || detections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'cameraId, location.address, and detections are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const threshold = Number(body.threshold ?? 0.25);
    const created = [];

    for (const detection of detections) {
      if (!detection || typeof detection.confidence !== 'number') continue;
      if (detection.confidence < threshold) continue;

      const className = String(detection.className || '');
      const category = DETECTION_CATEGORY_MAP[className];
      if (!category) continue;

      const title = `${className.replaceAll('_', ' ')} detected by CCTV`;
      const department = category === 'Road Damage'
        ? 'Public Works'
        : category === 'Garbage'
          ? 'Sanitation'
          : 'Public Safety';
      const locationKey = makeLocationKey(category, body.location);
      const existingOpenComplaint = await Complaint.findOne({
        source: 'ai_cctv',
        category,
        aiLocationKey: locationKey,
        aiDetectionFrame: typeof body.annotatedImage === 'string' ? body.annotatedImage : null,
        images: typeof body.annotatedImage === 'string' ? [body.annotatedImage] : [],
        status: { $nin: ['Resolved', 'Rejected'] },
      }).lean();

      if (existingOpenComplaint) {
        await Complaint.updateOne(
          { _id: existingOpenComplaint._id },
          {
            $set: {
              aiConfidence: detection.confidence,
              aiDetectionFrame: typeof body.annotatedImage === 'string'
                ? body.annotatedImage
                : null,
            },
          }
        );
        continue;
      }

      const complaint = await Complaint.create({
        title,
        description: `Automated camera detection: ${className.replaceAll('_', ' ')} with ${Math.round(detection.confidence * 100)}% confidence.`,
        category,
        department,
        priority: className === 'open_manhole' ? 'Critical' : 'High',
        status: 'Pending',
        source: 'ai_cctv',
        submittedByName: 'CCTV AI System',
        submittedByEmail: 'system@civicos.local',
        location: {
          address,
          city: body.location.city || 'Metropolis',
          lat: Number.isFinite(body.location.lat) ? body.location.lat : null,
          lng: Number.isFinite(body.location.lng) ? body.location.lng : null,
        },
        images: typeof body.imageUrl === 'string' && body.imageUrl ? [body.imageUrl] : [],
        aiConfidence: detection.confidence,
        cctvCameraId: cameraId,
        aiLocationKey: locationKey,
        remarks: [],
      });

      created.push(complaint);
    }

    return NextResponse.json(
      { success: true, created: created.length, complaints: created },
      { status: 201 }
    );
  } catch (err) {
    console.error('CCTV ingest error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to ingest CCTV detections' },
      { status: 500 }
    );
  }
}
