# Singer Portfolio Website

Cinematic dark portfolio with About, Music, Shows, Instagram/YouTube, and a booking form that saves to a database.

## 1. Run locally
```bash
npm install
cp .env.local.example .env.local   # then fill in the values (step 3)
npm run dev
```
Open http://localhost:3000

## 2. Edit content (no code needed)
Open `lib/content.js` and replace: her name, phone, email, Instagram and YouTube links,
the featured YouTube video ID, about text, stats and upcoming shows.
Put her photo at `public/mom.jpg`.

## 3. Set up the booking database (Supabase, free)
1. Create a project at supabase.com
2. SQL Editor -> paste and run `supabase/schema.sql`
3. Project Settings -> API -> copy the Project URL and the **service_role** key
4. Paste them into `.env.local` as NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

Every booking then appears in Supabase -> Table Editor -> bookings.
To get an Excel sheet: open the table and click Export -> CSV (opens directly in Excel).

The service_role key is used only on the server (app/api/booking/route.js).
Never put it in a NEXT_PUBLIC_ variable.

## 4. Optional: email on every booking
Create a free key at resend.com, then set RESEND_API_KEY and BOOKING_NOTIFY_EMAIL.
Leave them blank to skip emails.

## 5. Deploy to Vercel
Push to GitHub, import the repo in Vercel, and add the same environment variables
under Project Settings -> Environment Variables. Deploy.
