import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const originalName = file.name || 'image.png';
    const ext = originalName.includes('.') ? originalName.split('.').pop() : 'png';
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${baseName}_${Date.now()}.${ext}`;

    const supabase = getAdminClient();
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl, fileName });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}