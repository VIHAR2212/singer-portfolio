import { createClient } from "@supabase/supabase-js";
import { getRequestContext } from "@cloudflare/next-on-pages";

// Known aliases for environment variables that users frequently configure
const ENV_ALIASES = {
  NEXT_PUBLIC_SUPABASE_URL: ['NEXT_PUBLIC_SUPABASE_U', 'SUPABASE_URL', 'SUPABASE_U', 'NEXT_PUBLIC_SUPABASE_PROJECT_URL'],
  SUPABASE_SERVICE_ROLE_KEY: ['SUPABASE_SERVICE_ROLE_', 'SUPABASE_SERVICE_ROLE', 'SUPABASE_SERVICE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_KEY', 'SERVICE_ROLE_KEY'],
  ADMIN_PASSWORD: ['ADMIN_PASS', 'PASSCODE', 'PASSWORD'],
  ADMIN_JWT_SECRET: ['JWT_SECRET', 'SECRET']
};

function cleanEnvValue(val) {
  if (val === undefined || val === null) return undefined;
  let str = String(val).trim();
  // Strip surrounding quotes if the user entered them in dashboard
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

function getRawFromSource(targetKey) {
  // 1. Cloudflare Pages Request Context via official @cloudflare/next-on-pages API
  try {
    const cf = getRequestContext();
    if (cf?.env && cf.env[targetKey] !== undefined && cf.env[targetKey] !== null) {
      return String(cf.env[targetKey]);
    }
  } catch {}

  // 2. Next.js Static Build-Time Inlining (MUST use literal dot-notation for Next compiler to inline)
  if (targetKey === 'NEXT_PUBLIC_SUPABASE_URL' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return String(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }
  if (targetKey === 'NEXT_PUBLIC_SUPABASE_U' && process.env.NEXT_PUBLIC_SUPABASE_U) {
    return String(process.env.NEXT_PUBLIC_SUPABASE_U);
  }
  if (targetKey === 'SUPABASE_SERVICE_ROLE_KEY' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return String(process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  if (targetKey === 'SUPABASE_SERVICE_ROLE_' && process.env.SUPABASE_SERVICE_ROLE_) {
    return String(process.env.SUPABASE_SERVICE_ROLE_);
  }
  if (targetKey === 'ADMIN_PASSWORD' && process.env.ADMIN_PASSWORD) {
    return String(process.env.ADMIN_PASSWORD);
  }
  if (targetKey === 'ADMIN_JWT_SECRET' && process.env.ADMIN_JWT_SECRET) {
    return String(process.env.ADMIN_JWT_SECRET);
  }

  // 3. Cloudflare Pages globalThis request-context Proxy fallback
  try {
    const symbol = Symbol.for("__cloudflare-request-context__");
    const cfContext = globalThis[symbol];
    if (cfContext?.env && cfContext.env[targetKey] !== undefined && cfContext.env[targetKey] !== null) {
      return String(cfContext.env[targetKey]);
    }
  } catch {}

  // 4. Node.js process.env dynamic lookup (for local development or server environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[targetKey] !== undefined && process.env[targetKey] !== null) {
      return String(process.env[targetKey]);
    }
  } catch {}

  // 5. Global scope bindings
  try {
    if (typeof globalThis !== 'undefined') {
      if (globalThis[targetKey] !== undefined && globalThis[targetKey] !== null) {
        return String(globalThis[targetKey]);
      }
      if (globalThis.__env__ && globalThis.__env__[targetKey] !== undefined && globalThis.__env__[targetKey] !== null) {
        return String(globalThis.__env__[targetKey]);
      }
    }
  } catch {}

  return undefined;
}

// Safe cross-platform environment variable resolver (supports Cloudflare Pages Edge, Node.js, and Vercel)
export function getEnv(key) {
  // Check exact key
  let value = cleanEnvValue(getRawFromSource(key));
  if (value && value.length > 0) return value;

  // Check aliases
  const aliases = ENV_ALIASES[key] || [];
  for (const alias of aliases) {
    let aliasVal = cleanEnvValue(getRawFromSource(alias));
    if (aliasVal && aliasVal.length > 0) return aliasVal;
  }

  return undefined;
}

// Normalize Supabase URL (ensure https:// protocol is included)
export function getNormalizedSupabaseUrl() {
  let url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!url) return null;
  url = url.trim();
  if (url.includes('YOUR-PROJECT')) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

// Check if valid Supabase environment variables are provided (not default placeholders)
export function isSupabaseConfigured() {
  const url = getNormalizedSupabaseUrl();
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR_SERVICE_ROLE_KEY')) return false;
  return true;
}

// Server-only client. Uses the service role key, which must never reach the browser.
export function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  const url = getNormalizedSupabaseUrl();
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// Deep health check for cloud database tables, storage bucket, and environment diagnostics
export async function checkSupabaseHealth() {
  const url = getNormalizedSupabaseUrl();
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Discover which Cloudflare/environment keys are present
  let cloudflareKeys = [];
  let hasCloudflareContext = false;
  try {
    const cf = getRequestContext();
    if (cf?.env) {
      hasCloudflareContext = true;
      cloudflareKeys = Object.keys(cf.env);
    }
  } catch {}

  let processKeys = [];
  try {
    if (typeof process !== 'undefined' && process.env) {
      processKeys = Object.keys(process.env).filter(k => 
        k.includes('SUPABASE') || k.includes('ADMIN') || k.includes('NEXT_PUBLIC') || k.includes('RESEND')
      );
    }
  } catch {}

  // Determine JWT key role if available (service_role vs anon)
  let keyRole = null;
  if (key && key.includes('.')) {
    try {
      const parts = key.split('.');
      if (parts.length >= 2) {
        let p = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (p.length % 4) p += '=';
        const decoded = JSON.parse(atob(p));
        keyRole = decoded.role || null;
      }
    } catch {}
  }

  const diagnostics = {
    hasCloudflareContext,
    cloudflareEnvKeysFound: cloudflareKeys,
    processEnvKeysFound: processKeys,
    detectedUrl: url ? `${url.substring(0, 16)}...${url.slice(-10)}` : null,
    detectedKeyLength: key ? key.length : 0,
    detectedKeyRole: keyRole
  };

  if (!isSupabaseConfigured()) {
    const missing = [];
    if (!url || url.includes('YOUR-PROJECT')) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!key || key.includes('YOUR_SERVICE_ROLE_KEY')) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }

    return {
      configured: false,
      connected: false,
      missing,
      diagnostics,
      message: 'Cloud database credentials are not detected. In Cloudflare Pages, please ensure variables are added to the "Production" environment under Settings -> Environment Variables, then trigger a Redeploy.',
      tables: { bookings: false, gallery: false, site_settings: false, storage: false }
    };
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return {
      configured: false,
      connected: false,
      missing: ['Invalid client'],
      diagnostics,
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

  const allConnected = tables.bookings && tables.gallery && tables.site_settings && tables.storage;

  return {
    configured: true,
    connected: allConnected,
    tables,
    errors,
    diagnostics,
    message: allConnected
      ? 'Supabase Cloud Database & Storage are active! Inquiries and photo updates will synchronize across the entire world in real-time.'
      : 'Supabase credentials are valid, but database tables or storage need to be initialized via SQL Editor.'
  };
}

