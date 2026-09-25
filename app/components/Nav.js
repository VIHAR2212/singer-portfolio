"use client";
import { useState } from "react";
import { artist, upcomingShows } from "@/lib/content";

const links = [
  { href: "#about", label: "About" },
  { href: "#music", label: "Music" },
  ...(upcomingShows.length ? [{ href: "#shows", label: "Shows" }] : []),
  { href: "#follow", label: "Follow" },
  { href: "#book", label: "Book" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="nav">
        <a href="#top" className="nav-name display">{artist.name}</a>
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <button
          className={`burger ${open ? "open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span />
        </button>
      </header>

      <div className={`sheet ${open ? "open" : ""}`} aria-hidden={!open}>
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className="display"
            style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
          >
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
