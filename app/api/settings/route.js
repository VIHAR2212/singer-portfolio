import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth';
import defaultSettings from '@/data/site-settings.json';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Persistent process-level cache across edge requests
if (!globalThis.__settingsCache) {
  globalThis.__settingsCache = { ...defaultSettings };
}

// Helper to extract YouTube video ID from various link formats
function extractYouTubeId(input) {
  if (!input) return '';
  const str = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = str.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const liveMatch = str.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  return str;
}

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export async function GET() {
  try {
    const supabase = getAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (!error && data && data.length > 0) {
        const merged = { ...globalThis.__settingsCache };
        for (const row of data) {
          if (row.key === 'livePerformance') merged.livePerformance = { ...merged.livePerformance, ...row.value };
          if (row.key === 'featuredSong') merged.featuredSong = { ...merged.featuredSong, ...row.value };
          if (row.key === 'heroPortrait') merged.heroPortrait = { ...merged.heroPortrait, ...row.value };
          if (row.key === 'riyazPhoto') merged.riyazPhoto = { ...merged.riyazPhoto, ...row.value };
        }
        globalThis.__settingsCache = merged;
        return NextResponse.json({ success: true, settings: merged }, { headers: noCacheHeaders });
      }
    }

    return NextResponse.json({ success: true, settings: globalThis.__settingsCache }, { headers: noCacheHeaders });
  } catch (err) {
    console.error('Failed to get settings:', err);
    return NextResponse.json({ success: true, settings: globalThis.__settingsCache }, { headers: noCacheHeaders });
  }
}

export async function PUT(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { livePerformance, featuredSong, heroPortrait, riyazPhoto } = body;

    const updated = { ...globalThis.__settingsCache };

    if (heroPortrait) {
      updated.heroPortrait = {
        ...updated.heroPortrait,
        ...heroPortrait
      };
    }

    if (riyazPhoto) {
      updated.riyazPhoto = {
        ...updated.riyazPhoto,
        ...riyazPhoto
      };
    }

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

    globalThis.__settingsCache = updated;

    const supabase = getAdminClient();
    if (supabase) {
      try {
        if (heroPortrait) {
          await supabase
            .from('site_settings')
            .upsert({ 
              key: 'heroPortrait', 
              value: updated.heroPortrait, 
              updated_at: new Date().toISOString() 
            });
        }
        if (riyazPhoto) {
          await supabase
            .from('site_settings')
            .upsert({ 
              key: 'riyazPhoto', 
              value: updated.riyazPhoto, 
              updated_at: new Date().toISOString() 
            });
        }
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
        console.warn('Supabase site_settings table not configured, saved to global cache:', dbErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Site settings updated successfully.',
      settings: updated 
    });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Failed to update site settings.' }, { status: 500 });
  }
}
