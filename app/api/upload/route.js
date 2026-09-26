import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No valid file uploaded.' }, { status: 400 });
    }

    const originalName = file.name || 'stage-photo.jpg';
    const ext = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : 'jpg';
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${baseName}_${Date.now()}.${ext}`;

    const supabase = getAdminClient();
    
    // 1. Try Supabase storage if available
    if (supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: false });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ success: true, url: publicUrlData.publicUrl, fileName });
          }
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload unsuccessful, falling back to data URL:', storageErr);
      }
    }

    // 2. Resilient Edge Fallback: Convert to Base64 Data URL (Supported everywhere with 0 external dependencies)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const mimeType = file.type || 'image/jpeg';
    const base64DataUrl = `data:${mimeType};base64,${btoa(binary)}`;

    return NextResponse.json({
      success: true,
      url: base64DataUrl,
      fileName,
      note: 'Processed securely via buffer'
    });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}