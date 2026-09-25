import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
export const runtime = 'edge';

// Basic per-instance rate limit: 5 submissions per IP per 10 minutes.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (body.website) return NextResponse.json({ ok: true });

  const record = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 20),
    email: clean(body.email, 120) || null,
    event_type: clean(body.event_type, 80),
    event_date: clean(body.event_date, 10) || null,
    city: clean(body.city, 80) || null,
    message: clean(body.message, 1500) || null,
  };

  if (record.name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[+\d][\d\s-]{7,17}$/.test(record.phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!record.event_type) {
    return NextResponse.json({ error: "Please choose an event type." }, { status: 400 });
  }
  if (record.event_date && !/^\d{4}-\d{2}-\d{2}$/.test(record.event_date)) {
    return NextResponse.json({ error: "Please enter a valid date." }, { status: 400 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    console.error("Supabase environment variables are missing.");
    return NextResponse.json({ error: "Booking is temporarily unavailable. Please call directly." }, { status: 503 });
  }

  const { error } = await supabase.from("bookings").insert(record);
  if (error) {
    console.error("Booking insert failed:", error.message);
    return NextResponse.json({ error: "Could not save your request. Please call directly." }, { status: 500 });
  }

  // Optional email notification through Resend. Skipped silently if not configured.
  if (process.env.RESEND_API_KEY && process.env.BOOKING_NOTIFY_EMAIL) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bookings <onboarding@resend.dev>",
          to: [process.env.BOOKING_NOTIFY_EMAIL],
          subject: `New booking enquiry: ${record.event_type} (${record.name})`,
          text: [
            `Name: ${record.name}`,
            `Phone: ${record.phone}`,
            `Email: ${record.email ?? "-"}`,
            `Event: ${record.event_type}`,
            `Date: ${record.event_date ?? "-"}`,
            `City: ${record.city ?? "-"}`,
            `Message: ${record.message ?? "-"}`,
          ].join("\n"),
        }),
      });
    } catch (e) {
      console.error("Email notification failed:", e.message);
    }
  }

  return NextResponse.json({ ok: true });
}
