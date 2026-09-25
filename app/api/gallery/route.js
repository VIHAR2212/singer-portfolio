import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
export const runtime = 'edge';

export async function GET() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, items: data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, category, designation, quote, image } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { count } = await supabase.from('gallery').select('*', { count: 'exact', head: true });
    const newNumber = String((count || 0) + 1).padStart(2, '0');

    const newItem = {
      id: String(Date.now()),
      number: newNumber,
      title: title.trim(),
      category: category || 'Navratri',
      designation: designation || 'Live Festive Performance',
      quote: quote || '',
      image: image.trim()
    };

    const { error } = await supabase.from('gallery').insert(newItem);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, category, designation, quote, image, items: newOrderedItems } = body;
    const supabase = getAdminClient();

    if (newOrderedItems && Array.isArray(newOrderedItems)) {
      for (const item of newOrderedItems) {
        await supabase.from('gallery').update(item).eq('id', item.id);
      }
      return NextResponse.json({ success: true, items: newOrderedItems });
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (designation !== undefined) updates.designation = designation;
    if (quote !== undefined) updates.quote = quote;
    if (image !== undefined) updates.image = image.trim();

    const { data, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    const supabase = getAdminClient();
    await supabase.from('gallery').delete().eq('id', id);

    const { data: items } = await supabase.from('gallery').select('*').order('created_at', { ascending: true });
    const reindexed = (items || []).map((it, idx) => ({ ...it, number: String(idx + 1).padStart(2, '0') }));

    for (const it of reindexed) {
      await supabase.from('gallery').update({ number: it.number }).eq('id', it.id);
    }

    return NextResponse.json({ success: true, items: reindexed });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}