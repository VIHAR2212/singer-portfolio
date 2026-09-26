import { NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const health = await checkSupabaseHealth();
    return NextResponse.json(
      { success: true, ...health },
      { 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        connected: false,
        error: err.message,
        message: 'Failed to verify cloud database status.'
      },
      { status: 500 }
    );
  }
}
