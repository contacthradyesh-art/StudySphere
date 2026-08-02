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

/**
 * Generates a short-lived signed-upload authorization so the browser can
 * upload directly to Cloudinary (bypassing our serverless function's body
 * size limit) without ever seeing the Cloudinary API secret.
 */
export async function POST(req: NextRequest) {
  const uid = await getUidFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `library/${uid}`;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({ timestamp, folder, signature, apiKey, cloudName });
}