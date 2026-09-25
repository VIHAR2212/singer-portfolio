import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'gallery.json');

function readGallery() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading gallery.json:', err);
    return [];
  }
}

function writeGallery(items) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing gallery.json:', err);
    return false;
  }
}

// GET /api/gallery - Fetch all gallery items
export async function GET() {
  const items = readGallery();
  return NextResponse.json({ success: true, items });
}

// POST /api/gallery - Add new gallery item
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, category, designation, quote, image } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required.' },
        { status: 400 }
      );
    }

    const items = readGallery();
    const newNumber = String(items.length + 1).padStart(2, '0');
    const newItem = {
      id: String(Date.now()),
      number: newNumber,
      title: title.trim(),
      category: category || 'Navratri',
      designation: designation || 'Live Festive Performance',
      quote: quote || '',
      image: image.trim(),
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    writeGallery(items);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}

// PUT /api/gallery - Update an existing gallery item
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, category, designation, quote, image, items: newOrderedItems } = body;

    // Handle batch reorder if provided
    if (newOrderedItems && Array.isArray(newOrderedItems)) {
      writeGallery(newOrderedItems);
      return NextResponse.json({ success: true, items: newOrderedItems });
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
    }

    const items = readGallery();
    const index = items.findIndex((it) => String(it.id) === String(id));

    if (index === -1) {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    }

    items[index] = {
      ...items[index],
      title: title !== undefined ? title.trim() : items[index].title,
      category: category !== undefined ? category : items[index].category,
      designation: designation !== undefined ? designation : items[index].designation,
      quote: quote !== undefined ? quote : items[index].quote,
      image: image !== undefined ? image.trim() : items[index].image,
      updatedAt: new Date().toISOString()
    };

    writeGallery(items);
    return NextResponse.json({ success: true, item: items[index] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

// DELETE /api/gallery - Delete a gallery item
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    let items = readGallery();
    items = items.filter((it) => String(it.id) !== String(id));

    // Re-index item numbers
    items = items.map((it, idx) => ({
      ...it,
      number: String(idx + 1).padStart(2, '0')
    }));

    writeGallery(items);
    return NextResponse.json({ success: true, items });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
