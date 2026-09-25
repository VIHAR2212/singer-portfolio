import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'inquiries.json');

function readInquiries() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading inquiries.json:', err);
    return [];
  }
}

function writeInquiries(items) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing inquiries.json:', err);
    return false;
  }
}

// GET /api/inquiries - Fetch all inquiries
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let inquiries = readInquiries();

    // Sort newest first
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (status && status !== 'all') {
      inquiries = inquiries.filter((inq) => inq.status === status);
    }

    return NextResponse.json({ success: true, inquiries });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// POST /api/inquiries - Submit new inquiry
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email, eventType, eventDate, city, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    const inquiries = readInquiries();
    const id = `SM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;

    const newInquiry = {
      id,
      createdAt: new Date().toISOString(),
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      eventType: eventType ? String(eventType).trim() : 'General Inquiry',
      eventDate: eventDate ? String(eventDate).trim() : null,
      city: city ? String(city).trim() : null,
      message: message ? String(message).trim() : null,
      status: 'new'
    };

    inquiries.unshift(newInquiry);
    writeInquiries(inquiries);

    return NextResponse.json({ success: true, inquiry: newInquiry }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

// PATCH /api/inquiries - Update status or notes
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    const inquiries = readInquiries();
    const index = inquiries.findIndex((inq) => inq.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    if (status) inquiries[index].status = status;
    if (notes !== undefined) inquiries[index].notes = notes;
    inquiries[index].updatedAt = new Date().toISOString();

    writeInquiries(inquiries);
    return NextResponse.json({ success: true, inquiry: inquiries[index] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

// DELETE /api/inquiries - Delete an inquiry
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    let inquiries = readInquiries();
    inquiries = inquiries.filter((inq) => inq.id !== id);

    writeInquiries(inquiries);
    return NextResponse.json({ success: true, inquiries });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
