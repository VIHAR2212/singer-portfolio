import { createClient } from "@supabase/supabase-js";

// Check if valid Supabase environment variables are provided (not default placeholders)
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR_SERVICE_ROLE_KEY')) return false;
  if (!url.startsWith('https://')) return false;
  return true;
}

// Server-only client. Uses the service role key, which must never reach the browser.
export function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// Deep health check for cloud database tables and storage bucket
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured()) {
    const missing = [];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || url.includes('YOUR-PROJECT') || !url.startsWith('https://')) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!key || key.includes('YOUR_SERVICE_ROLE_KEY')) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }

    return {
      configured: false,
      connected: false,
      missing,
      message: 'Cloud database is not connected. The website is currently running on temporary memory. Changes and inquiries will not persist across reloads or for visitors worldwide.',
      tables: { bookings: false, gallery: false, site_settings: false, storage: false }
    };
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return {
      configured: false,
      connected: false,
      missing: ['Invalid client'],
      message: 'Unable to initialize Supabase client.',
      tables: { bookings: false, gallery: false, site_settings: false, storage: false }
    };
  }

  const tables = {
    bookings: false,
    gallery: false,
    site_settings: false,
    storage: false
  };
  const errors = [];

  // 1. Test bookings table
  try {
    const { error } = await supabase.from('bookings').select('id').limit(1);
    if (!error) {
      tables.bookings = true;
    } else {
      errors.push(`bookings table: ${error.message}`);
    }
  } catch (e) {
    errors.push(`bookings: ${e.message}`);
  }

  // 2. Test gallery table
  try {
    const { error } = await supabase.from('gallery').select('id').limit(1);
    if (!error) {
      tables.gallery = true;
    } else {
      errors.push(`gallery table: ${error.message}`);
    }
  } catch (e) {
    errors.push(`gallery: ${e.message}`);
  }

  // 3. Test site_settings table
  try {
    const { error } = await supabase.from('site_settings').select('key').limit(1);
    if (!error) {
      tables.site_settings = true;
    } else {
      errors.push(`site_settings table: ${error.message}`);
    }
  } catch (e) {
    errors.push(`site_settings: ${e.message}`);
  }

  // 4. Test storage bucket 'uploads'
  try {
    const { data: bucket, error } = await supabase.storage.getBucket('uploads');
    if (!error && bucket) {
      tables.storage = true;
    } else {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets?.some(b => b.name === 'uploads')) {
        tables.storage = true;
      } else {
        errors.push(`uploads bucket: ${error?.message || 'Bucket "uploads" not found'}`);
      }
    }
  } catch (e) {
    errors.push(`storage: ${e.message}`);
  }

  const allConnected = tables.bookings && tables.gallery && tables.site_settings;

  return {
    configured: true,
    connected: allConnected,
    tables,
    errors,
    message: allConnected
      ? 'Supabase Cloud Database & Storage are active! Inquiries and photo updates will synchronize across the entire world in real-time.'
      : 'Supabase credentials are valid, but database tables or storage need to be initialized via SQL Editor.'
  };
}
