import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_U || 
      process.env.SUPABASE_URL || 
      '',
    SUPABASE_SERVICE_ROLE_KEY: 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_SERVICE_ROLE_ || 
      process.env.SUPABASE_SERVICE_KEY || 
      process.env.SUPABASE_KEY || 
      '',
    ADMIN_PASSWORD: 
      process.env.ADMIN_PASSWORD || 
      process.env.ADMIN_PASS || 
      '',
  },
};

export default nextConfig;

