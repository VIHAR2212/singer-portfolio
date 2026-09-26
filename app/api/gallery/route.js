import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/auth';
import initialGallery from '@/data/gallery.json';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Persistent process-level cache across edge requests
if (!globalThis.__galleryCache) {
  globalThis.__galleryCache = initialGallery.map((item, idx) => ({
    ...item,
    number: item.number || String(idx + 1).padStart(2, '0'),
    objectPosition: item.objectPosition || 'center 20%',
    scale: typeof item.scale === 'number' ? item.scale : 1,
    rotation: typeof item.rotation === 'number' ? item.rotation : 0
  }));
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
      try {
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'gallery_items')
          .single();

        if (settingsData?.value && Array.isArray(settingsData.value) && settingsData.value.length > 0) {
          globalThis.__galleryCache = settingsData.value;
          return NextResponse.json({ success: true, items: settingsData.value }, { headers: noCacheHeaders });
        }
      } catch {
        // Fallback to table
      }

      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('number', { ascending: true });

      if (!error && data && data.length > 0) {
        const normalized = data.map((item, idx) => ({
          id: String(item.id),
          number: item.number || String(idx + 1).padStart(2, '0'),
          title: item.title,
          category: item.category || 'Navratri',
          designation: item.designation || 'Live Festive Performance',
          quote: item.quote || '',
          image: item.image,
          objectPosition: item.object_position || item.objectPosition || 'center 20%',
          scale: typeof item.scale === 'number' ? item.scale : 1,
          rotation: typeof item.rotation === 'number' ? item.rotation : 0,
          createdAt: item.created_at || item.createdAt || new Date().toISOString()
        }));
        globalThis.__galleryCache = normalized;
        return NextResponse.json({ success: true, items: normalized }, { headers: noCacheHeaders });
      }
    }

    return NextResponse.json({ success: true, items: globalThis.__galleryCache }, { headers: noCacheHeaders });
  } catch (err) {
    console.error('Failed to get gallery items:', err);
    return NextResponse.json({ success: true, items: globalThis.__galleryCache }, { headers: noCacheHeaders });
  }
}

export async function POST(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, category, designation, quote, image, objectPosition } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required.' }, { status: 400 });
    }

    const nextNumber = String(globalThis.__galleryCache.length + 1).padStart(2, '0');
    const newItem = {
      id: String(Date.now()),
      number: nextNumber,
      title: String(title).trim(),
      category: category || 'Navratri',
      designation: designation || 'Live Festive Performance',
      quote: quote ? String(quote).trim() : '',
      image: String(image).trim(),
      objectPosition: objectPosition || '50% 20%',
      scale: typeof body.scale === 'number' ? body.scale : 1,
      rotation: typeof body.rotation === 'number' ? body.rotation : 0,
      createdAt: new Date().toISOString()
    };

    globalThis.__galleryCache.push(newItem);

    const supabase = getAdminClient();
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'gallery_items',
          value: globalThis.__galleryCache,
          updated_at: new Date().toISOString()
        });
      } catch {}

      try {
        await supabase.from('gallery').insert({
          id: newItem.id,
          number: newItem.number,
          title: newItem.title,
          category: newItem.category,
          designation: newItem.designation,
          quote: newItem.quote,
          image: newItem.image,
          object_position: newItem.objectPosition,
          created_at: newItem.createdAt
        });
      } catch (dbErr) {
        console.warn('Supabase gallery insert skipped:', dbErr);
      }
    }

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err) {
    console.error('Failed to add gallery item:', err);
    return NextResponse.json({ error: 'Failed to add gallery item.' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, category, designation, quote, image, objectPosition, scale, rotation, items: newOrderedItems } = body;
    const supabase = getAdminClient();

    // Reordering multiple items
    if (newOrderedItems && Array.isArray(newOrderedItems)) {
      const renumbered = newOrderedItems.map((item, idx) => ({
        ...item,
        number: String(idx + 1).padStart(2, '0'),
        objectPosition: item.objectPosition || '50% 20%',
        scale: typeof item.scale === 'number' ? item.scale : 1,
        rotation: typeof item.rotation === 'number' ? item.rotation : 0
      }));

      globalThis.__galleryCache = renumbered;

      if (supabase) {
        try {
          await supabase.from('site_settings').upsert({
            key: 'gallery_items',
            value: globalThis.__galleryCache,
            updated_at: new Date().toISOString()
          });
        } catch {}

        try {
          for (const item of renumbered) {
            await supabase.from('gallery').upsert({
              id: String(item.id),
              number: item.number,
              title: item.title,
              category: item.category,
              designation: item.designation,
              quote: item.quote,
              image: item.image,
              object_position: item.objectPosition,
              updated_at: new Date().toISOString()
            });
          }
        } catch (dbErr) {
          console.warn('Supabase batch update skipped:', dbErr);
        }
      }

      return NextResponse.json({ success: true, items: renumbered });
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    // Update single item
    let found = false;
    globalThis.__galleryCache = globalThis.__galleryCache.map(item => {
      if (String(item.id) === String(id)) {
        found = true;
        return {
          ...item,
          ...(title !== undefined && { title: String(title).trim() }),
          ...(category !== undefined && { category }),
          ...(designation !== undefined && { designation: String(designation).trim() }),
          ...(quote !== undefined && { quote: String(quote).trim() }),
          ...(image !== undefined && { image: String(image).trim() }),
          ...(objectPosition !== undefined && { objectPosition }),
          ...(scale !== undefined && { scale: Number(scale) }),
          ...(rotation !== undefined && { rotation: Number(rotation) })
        };
      }
      return item;
    });

    if (!found) {
      return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 });
    }

    const updatedItem = globalThis.__galleryCache.find(item => String(item.id) === String(id));

    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'gallery_items',
          value: globalThis.__galleryCache,
          updated_at: new Date().toISOString()
        });
      } catch {}

      try {
        await supabase
          .from('gallery')
          .update({
            ...(title !== undefined && { title: updatedItem.title }),
            ...(category !== undefined && { category: updatedItem.category }),
            ...(designation !== undefined && { designation: updatedItem.designation }),
            ...(quote !== undefined && { quote: updatedItem.quote }),
            ...(image !== undefined && { image: updatedItem.image }),
            ...(objectPosition !== undefined && { object_position: updatedItem.objectPosition }),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (dbErr) {
        console.warn('Supabase update single item skipped:', dbErr);
      }
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Failed to update gallery item:', err);
    return NextResponse.json({ error: 'Failed to update gallery item.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized: Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });

    globalThis.__galleryCache = globalThis.__galleryCache
      .filter(item => String(item.id) !== String(id))
      .map((item, idx) => ({
        ...item,
        number: String(idx + 1).padStart(2, '0')
      }));

    const supabase = getAdminClient();
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          key: 'gallery_items',
          value: globalThis.__galleryCache,
          updated_at: new Date().toISOString()
        });
      } catch {}

      try {
        await supabase.from('gallery').delete().eq('id', id);
        for (const item of globalThis.__galleryCache) {
          await supabase.from('gallery').update({ number: item.number }).eq('id', item.id);
        }
      } catch (dbErr) {
        console.warn('Supabase delete skipped:', dbErr);
      }
    }

    return NextResponse.json({ success: true, items: globalThis.__galleryCache });
  } catch (err) {
    console.error('Failed to delete gallery item:', err);
    return NextResponse.json({ error: 'Failed to delete gallery item.' }, { status: 500 });
  }
}