import { NextResponse } from 'next/server';
import { getAdminClient, getEnv, getNormalizedSupabaseUrl } from '@/lib/supabase';
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
    
    // Check if Supabase client is configured
    if (!supabase) {
      const url = getNormalizedSupabaseUrl();
      const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
      const missing = [];
      if (!url) {
        missing.push('NEXT_PUBLIC_SUPABASE_URL');
      }
      if (!key || key.includes('YOUR_SERVICE_ROLE_KEY')) {
        missing.push('SUPABASE_SERVICE_ROLE_KEY');
      }

      const errorMsg = `Supabase is not configured. Missing or placeholder credentials: [${missing.join(', ')}]. Please configure real Supabase credentials in your environment variables.`;
      console.error('[Upload API Error]:', errorMsg);
      return NextResponse.json({ 
        error: errorMsg,
        missing,
        storage: null 
      }, { status: 500 });
    }

    // Convert file to ArrayBuffer for universal edge/node streaming
    const arrayBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, arrayBuffer, { 
        contentType: file.type || 'image/jpeg', 
        upsert: true 
      });

    if (uploadError) {
      console.error('[Supabase Storage Upload Error]:', uploadError.message, uploadError);
      return NextResponse.json({ 
        error: `Supabase Storage upload failed: ${uploadError.message}`,
        details: uploadError
      }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    if (!publicUrlData?.publicUrl) {
      const errorMsg = 'Failed to retrieve public URL from Supabase Storage.';
      console.error('[Upload API Error]:', errorMsg);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl, 
      fileName,
      storage: 'supabase' 
    });
  } catch (err) {
    console.error('[Upload API Fatal Error]:', err);
    return NextResponse.json({ 
      error: `Upload failed: ${err.message || 'Unknown error'}`,
      details: err?.message || String(err)
    }, { status: 500 });
  }
}