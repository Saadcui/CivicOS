import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Complaint from '@/models/Complaint';
import { requireAuth } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const CATEGORY_MAP = {
  cracks: ['Road Damage', 'Public Works', 'High'],
  open_manhole: ['Public Safety', 'Public Safety', 'Critical'],
  pothole: ['Road Damage', 'Public Works', 'High'],
  waste_container: ['Garbage', 'Sanitation', 'High'],
};

function locationKey(category, location) {
  if (Number.isFinite(location?.lat) && Number.isFinite(location?.lng)) {
    return `${category}|${location.lat.toFixed(4)}|${location.lng.toFixed(4)}`;
  }
  return `${category}|${String(location?.address || '').trim().toLowerCase()}`;
}

export async function POST(request) {
  const { error, user } = await requireAuth(['officer', 'admin']);
  if (error) return error;

  const aiUrl = process.env.AI_DETECTION_URL || 'http://127.0.0.1:8001';

  try {
    const form = await request.formData();
    const frame = form.get('frame');
    const cameraId = String(form.get('cameraId') || 'BROWSER-CCTV-01').trim();
    const address = String(form.get('address') || '').trim();
    const city = String(form.get('city') || 'Pakistan').trim();
    const lat = Number(form.get('lat'));
    const lng = Number(form.get('lng'));
    const threshold = Math.max(0.05, Math.min(0.99, Number(form.get('threshold') || 0.25)));

    if (!frame || typeof frame === 'string') {
      return NextResponse.json({ success: false, error: 'A camera frame is required' }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ success: false, error: 'Select a location before starting the camera' }, { status: 400 });
    }

    const aiForm = new FormData();
    aiForm.append('image', frame, 'browser-camera-frame.jpg');
    aiForm.append('threshold', String(threshold));

    const response = await fetch(`${aiUrl.replace(/\/$/, '')}/detect`, {
      method: 'POST',
      body: aiForm,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'AI detector unavailable' }, { status: 502 });
    }

    const result = await response.json();
    await connectDB();
    const created = [];
    const detected = [];

    for (const detection of result.detections || []) {
      if (detection.confidence < threshold) continue;
      const mapping = CATEGORY_MAP[detection.className];
      if (!mapping) continue;

      const [category, department, priority] = mapping;
      const location = {
        address,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
      };
      const key = locationKey(category, location);

      const openComplaint = await Complaint.findOne({
        source: 'ai_cctv',
        category,
        aiLocationKey: key,
        status: { $nin: ['Resolved', 'Rejected'] },
      }).lean();

      if (openComplaint) {
        await Complaint.updateOne(
          { _id: openComplaint._id },
          {
            $set: {
              aiConfidence: detection.confidence,
              aiDetectionFrame: result.annotatedImage || null,
              updatedAt: new Date(),
            },
          }
        );
        detected.push({
          className: detection.className,
          confidence: detection.confidence,
          complaintId: openComplaint.complaintId,
          created: false,
        });
        continue;
      }

      const label = detection.className.replaceAll('_', ' ');
      const complaint = await Complaint.create({
        title: `${label} detected by CCTV`,
        description: `Automated browser CCTV detection at ${address}: ${label} with ${Math.round(detection.confidence * 100)}% confidence.`,
        category,
        department,
        priority,
        status: 'Pending',
        source: 'ai_cctv',
        submittedBy: null,
        submittedByName: 'CCTV AI System',
        submittedByEmail: 'system@civicos.local',
        location: { address, city, lat: location.lat, lng: location.lng },
        aiConfidence: detection.confidence,
        cctvCameraId: cameraId,
        aiLocationKey: key,
        aiDetectionFrame: result.annotatedImage || null,
        images: result.annotatedImage ? [result.annotatedImage] : [],
        remarks: [],
      });

      created.push(complaint);
      detected.push({
        className: detection.className,
        confidence: detection.confidence,
        complaintId: complaint.complaintId,
        created: true,
      });
    }

    return NextResponse.json({
      success: true,
      detections: detected,
      annotatedImage: result.annotatedImage,
      created: created.length,
    });
  } catch (err) {
    console.error('Browser CCTV detection error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process camera frame' }, { status: 500 });
  }
}
