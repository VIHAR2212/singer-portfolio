import { createClient } from "@supabase/supabase-js";

// Safe cross-platform environment variable resolver (supports Node.js, Vercel, and Cloudflare Pages Edge)
export function getEnv(key) {
  // 1. Check process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 2. Check Cloudflare request context on globalThis (populated by @cloudflare/next-on-pages)
  try {
    const symbol = Symbol.for("__cloudflare-request-context__");
    const cfContext = globalThis[symbol];
    if (cfContext?.env && cfContext.env[key]) {
      return cfContext.env[key];
    }
  } catch {}

  // 3. Check direct globalThis
  if (typeof globalThis !== 'undefined' && globalThis[key]) {
    return globalThis[key];
  }

  return undefined;
}

// Check if valid Supabase environment variables are provided (not default placeholders)
export function isSupabaseConfigured() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR_SERVICE_ROLE_KEY')) return false;
  if (!url.startsWith('https://')) return false;
  return true;
}

// Server-only client. Uses the service role key, which must never reach the browser.
export function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// Deep health check for cloud database tables and storage bucket
export async function checkSupabaseHealth() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const envSource = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR-PROJECT'))
    ? 'process.env'
    : (typeof globalThis !== 'undefined' && globalThis[Symbol.for("__cloudflare-request-context__")]?.env?.NEXT_PUBLIC_SUPABASE_URL)
      ? 'cloudflare-context'
      : 'none';

  if (!isSupabaseConfigured()) {
    const missing = [];
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
      envSource,
      message: 'Cloud database credentials are not detected. If you already set them in Cloudflare Pages, please trigger a Redeploy (Cloudflare only injects new variables to fresh deployments created after saving).',
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
