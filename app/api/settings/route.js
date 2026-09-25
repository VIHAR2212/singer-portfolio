import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth';
import defaultSettings from '@/data/site-settings.json';

export const runtime = 'edge';

// Helper to extract YouTube video ID from various link formats
function extractYouTubeId(input) {
  if (!input) return '';
  const str = String(input).trim();
  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  // youtu.be/<id>
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/watch?v=<id>
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtube.com/embed/<id>
  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // youtube.com/live/<id>
  const liveMatch = str.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  return str;
}

// In-memory cache for edge instances
let cachedSettings = { ...defaultSettings };

export async function GET() {
  try {
    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (!error && data && data.length > 0) {
        const merged = { ...cachedSettings };
        for (const row of data) {
          if (row.key === 'livePerformance') merged.livePerformance = { ...merged.livePerformance, ...row.value };
          if (row.key === 'featuredSong') merged.featuredSong = { ...merged.featuredSong, ...row.value };
        }
        cachedSettings = merged;
        return NextResponse.json({ success: true, settings: merged });
      }
    }

    return NextResponse.json({ success: true, settings: cachedSettings });
  } catch (err) {
    console.error('Failed to get settings:', err);
    return NextResponse.json({ success: true, settings: cachedSettings });
  }
}

export async function PUT(req) {
  // Z+ Security check: Only authenticated admins can change site settings
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { livePerformance, featuredSong } = body;

    const updated = { ...cachedSettings };

    if (livePerformance) {
      const videoId = extractYouTubeId(livePerformance.youtubeUrl || livePerformance.videoId);
      updated.livePerformance = {
        ...updated.livePerformance,
        ...livePerformance,
        videoId: videoId || updated.livePerformance.videoId,
        youtubeUrl: livePerformance.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`
      };
    }

    if (featuredSong) {
      const songVideoId = extractYouTubeId(featuredSong.youtubeUrl || featuredSong.videoId);
      updated.featuredSong = {
        ...updated.featuredSong,
        ...featuredSong,
        videoId: songVideoId || updated.featuredSong.videoId,
        youtubeUrl: featuredSong.youtubeUrl || `https://www.youtube.com/watch?v=${songVideoId}`
      };
    }

    cachedSettings = updated;

    // Persist to Supabase if configured
    const supabase = getAdminClient();
    if (supabase) {
      try {
        if (livePerformance) {
          await supabase
            .from('site_settings')
            .upsert({ 
              key: 'livePerformance', 
              value: updated.livePerformance, 
              updated_at: new Date().toISOString() 
            });
        }
        if (featuredSong) {
          await supabase
            .from('site_settings')
            .upsert({ 
              key: 'featuredSong', 
              value: updated.featuredSong, 
              updated_at: new Date().toISOString() 
            });
        }
      } catch (dbErr) {
        console.warn('Supabase site_settings table not configured, saved to edge cache:', dbErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Site performance & featured song settings updated successfully.',
      settings: updated 
    });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Failed to update site settings.' }, { status: 500 });
  }
}
