import "./globals.css";
import { artist } from "@/lib/content";

export const metadata = {
  title: `${artist.name} | Singer | Live Shows and Bookings`,
  description: `${artist.name} performs classical, devotional, Gujarati Garba and Bollywood songs live. Book her for weddings, Navratri nights, bhajan sandhyas and stage shows.`,
  openGraph: {
    title: `${artist.name} | Live Singer`,
    description: "Classical, devotional, Garba and Bollywood. Book a live show.",
    type: "website",
  },
};

export const viewport = { themeColor: "#0d0907" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Noto+Serif+Gujarati:wght@400;500;600;700&family=Outfit:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
