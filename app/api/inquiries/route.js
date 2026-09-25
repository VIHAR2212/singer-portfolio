import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth';
import initialInquiries from '@/data/inquiries.json';

export const runtime = 'edge';

// In-memory cache for inquiries when Supabase is not yet populated
let inMemoryInquiries = [...initialInquiries];

// Normalize record from either Supabase `bookings` or `inquiries`
function normalizeInquiry(row) {
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    name: row.name || 'Anonymous',
    phone: row.phone || '',
    email: row.email || null,
    eventType: row.event_type || row.eventType || 'General Inquiry',
    eventDate: row.event_date || row.eventDate || null,
    city: row.city || row.location || null,
    message: row.message || row.notes || null,
    status: row.status || 'new',
    notes: row.notes || ''
  };
}

export async function GET(req) {
  // Z+ Security check: Only authenticated admins can view booking forms filled by organisers!
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const supabase = getAdminClient();

    let combined = [];

    if (supabase) {
      // 1. Try fetching from bookings table (primary table where booking form saves)
      try {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bookingsData && bookingsData.length > 0) {
          combined = bookingsData.map(normalizeInquiry);
        }
      } catch (err) {
        console.warn('Could not read from bookings table:', err.message);
      }

      // 2. Also check inquiries table if any records exist
      try {
        const { data: inquiriesData } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (inquiriesData && inquiriesData.length > 0) {
          const ids = new Set(combined.map(c => String(c.id)));
          for (const item of inquiriesData) {
            if (!ids.has(String(item.id))) {
              combined.push(normalizeInquiry(item));
            }
          }
        }
      } catch {
        // Table may not exist yet
      }
    }

    // 3. If no DB records yet, use in-memory / fallback data
    if (combined.length === 0) {
      combined = inMemoryInquiries.map(normalizeInquiry);
    }

    // Apply status filter if specified
    if (status && status !== 'all') {
      combined = combined.filter(inq => inq.status === status);
    }

    // Sort newest first
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, inquiries: combined });
  } catch (err) {
    console.error('Failed to fetch inquiries:', err);
    return NextResponse.json({ success: true, inquiries: inMemoryInquiries });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email, eventType, eventDate, city, message, website } = body;

    // Honeypot check for bots
    if (website) return NextResponse.json({ ok: true });

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required.' }, { status: 400 });
    }

    const id = `SM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
    const newRecord = {
      id,
      created_at: new Date().toISOString(),
      name: String(name).trim().slice(0, 100),
      phone: String(phone).trim().slice(0, 20),
      email: email ? String(email).trim().slice(0, 120) : null,
      event_type: eventType ? String(eventType).trim().slice(0, 80) : 'Live Concert / Sangeet',
      event_date: eventDate ? String(eventDate).trim().slice(0, 10) : null,
      city: city ? String(city).trim().slice(0, 80) : null,
      message: message ? String(message).trim().slice(0, 1500) : null,
      status: 'new'
    };

    const supabase = getAdminClient();
    if (supabase) {
      // Save to bookings table
      try {
        await supabase.from('bookings').insert(newRecord);
      } catch (e) {
        console.warn('Insert to bookings failed, saving to cache:', e);
      }
    }

    inMemoryInquiries.unshift(normalizeInquiry(newRecord));

    return NextResponse.json({ success: true, inquiry: normalizeInquiry(newRecord) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit inquiry.' }, { status: 500 });
  }
}

export async function PATCH(req) {
  // Z+ Security check: Only authenticated admins can update inquiry status
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;
    if (!id) return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });

    const supabase = getAdminClient();
    if (supabase) {
      // Try updating in bookings table
      try {
        await supabase
          .from('bookings')
          .update({ status, ...(notes !== undefined ? { notes } : {}) })
          .eq('id', id);
      } catch {
        // Fallback to inquiries table
        try {
          await supabase
            .from('inquiries')
            .update({ status, ...(notes !== undefined ? { notes } : {}) })
            .eq('id', id);
        } catch {
          // pass
        }
      }
    }

    inMemoryInquiries = inMemoryInquiries.map(item => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          status: status || item.status,
          notes: notes !== undefined ? notes : item.notes
        };
      }
      return item;
    });

    const updated = inMemoryInquiries.find(item => String(item.id) === String(id));
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update inquiry.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  // Z+ Security check: Only authenticated admins can delete organizer inquiries
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });

    const supabase = getAdminClient();
    if (supabase) {
      try {
        await supabase.from('bookings').delete().eq('id', id);
      } catch {
        try {
          await supabase.from('inquiries').delete().eq('id', id);
        } catch {
          // pass
        }
      }
    }

    inMemoryInquiries = inMemoryInquiries.filter(item => String(item.id) !== String(id));
    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete inquiry.' }, { status: 500 });
  }
}