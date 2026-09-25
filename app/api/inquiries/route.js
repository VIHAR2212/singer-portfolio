import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
export const runtime = 'edge';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const supabase = getAdminClient();

    let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, inquiries: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email, eventType, eventDate, city, message } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required.' }, { status: 400 });
    }

    const id = `SM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
    const newInquiry = {
      id,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      event_type: eventType ? String(eventType).trim() : 'General Inquiry',
      event_date: eventDate ? String(eventDate).trim() : null,
      city: city ? String(city).trim() : null,
      message: message ? String(message).trim() : null,
      status: 'new'
    };

    const supabase = getAdminClient();
    const { error } = await supabase.from('inquiries').insert(newInquiry);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;
    if (!id) return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, inquiry: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });

    const supabase = getAdminClient();
    await supabase.from('inquiries').delete().eq('id', id);

    const { data: inquiries } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ success: true, inquiries });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}