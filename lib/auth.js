// Server-side Z+ Security Authentication & Token Engine
// Compatible with Cloudflare Edge Runtime (uses Web Crypto API)

import { getEnv } from '@/lib/supabase';

const TOKEN_COOKIE_NAME = 'sm_admin_token';
const DEFAULT_FALLBACK_SECRET = 'SonalMakwana#ZPlus2026!SecureKey';

// In-memory failed login tracking for brute-force prevention
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function getAdminPassphrase() {
  return getEnv('ADMIN_PASSWORD') || 'sonal2026';
}

function getJwtSecret() {
  return getEnv('ADMIN_JWT_SECRET') || getEnv('SUPABASE_SERVICE_ROLE_KEY') || DEFAULT_FALLBACK_SECRET;
}

// Check and record failed login attempts per IP
export function checkRateLimit(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return { allowed: true, remaining: MAX_ATTEMPTS };

  // Clear expired window
  if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
    failedAttempts.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil((record.firstAttempt + LOCKOUT_WINDOW_MS - now) / 60000);
    return { 
      allowed: false, 
      error: `Too many failed login attempts. IP temporarily locked for ${minutesLeft} minutes to protect against attacks.` 
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, firstAttempt: now };
  record.count += 1;
  failedAttempts.set(ip, record);
}

export function resetRateLimit(ip) {
  failedAttempts.delete(ip);
}

// Convert string to Uint8Array
function strToBuf(str) {
  return new TextEncoder().encode(str);
}

// Base64Url encode/decode
function base64UrlEncode(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate cryptographic HMAC-SHA256 signature
async function signData(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    strToBuf(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, strToBuf(data));
  return base64UrlEncode(signature);
}

// Verify cryptographic HMAC-SHA256 signature
async function verifySignature(data, signature, secret) {
  const expectedSig = await signData(data, secret);
  return expectedSig === signature;
}

// Create signed session token (24 hours expiry)
export async function createSessionToken() {
  const payload = {
    sub: 'admin',
    role: 'superadmin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    nonce: crypto.randomUUID()
  };

  const encodedPayload = base64UrlEncode(strToBuf(JSON.stringify(payload)));
  const signature = await signData(encodedPayload, getJwtSecret());
  return `${encodedPayload}.${signature}`;
}

// Verify session token
export async function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const isValid = await verifySignature(encodedPayload, signature, getJwtSecret());
  if (!isValid) return null;

  try {
    const payloadStr = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadStr);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Verify request from Cookies or Authorization header
export async function verifyAdminRequest(req) {
  let token = null;

  // 1. Try Cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
  if (cookies[TOKEN_COOKIE_NAME]) {
    token = cookies[TOKEN_COOKIE_NAME];
  }

  // 2. Try Bearer header
  if (!token) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    return { authenticated: false, error: 'Unauthorized: Missing admin session.' };
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Unauthorized: Invalid or expired session.' };
  }

  return { authenticated: true, user: payload };
}

export { TOKEN_COOKIE_NAME };
