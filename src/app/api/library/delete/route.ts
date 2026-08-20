import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { cloudinary } from '@/lib/library/cloudinary-server';

async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken || !adminAuth) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Deletes a file from Cloudinary. Requires the API secret, so this must run server-side. */
export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { publicId, resourceType } = await req.json();
  if (!publicId || typeof publicId !== 'string') {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
  }
  // Only allow deleting files under this user's own folder.
  if (!publicId.startsWith(`library/${uid}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Cloudinary delete failed', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}