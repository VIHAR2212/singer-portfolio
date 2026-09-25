"use client";
import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import { about, stats, artist } from "@/lib/content";

export default function About() {
  // Show the placeholder until her photo exists, so a missing file never shows broken-image text.
  const [hasPhoto, setHasPhoto] = useState(false);

  // Probe the file first. Only render the <img> if it really exists,
  // so no broken-image icon or alt text can ever appear.
  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setHasPhoto(true);
    probe.onerror = () => setHasPhoto(false);
    probe.src = about.photo;
  }, []);

  return (
    <section id="about" className="section">
      <div className="wrap about-grid">
        <Reveal className="about-photo">
          <div className="frame">
            <div className="frame-inner">
              {hasPhoto ? (
                <img
                  src={about.photo}
                  alt={`Portrait of ${artist.name}`}
                  className="portrait"
                />
              ) : (
                <div className="portrait-fallback">
                  <span className="display">Add photo</span>
                  <small>Save it as public/mom.jpg</small>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className="about-copy">
          <Reveal>
            <h2 className="display">{about.heading}</h2>
          </Reveal>
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={100 + i * 90}>
              <p className="lede">{p}</p>
            </Reveal>
          ))}

          {stats.length > 0 && (
            <Reveal delay={300}>
              <dl className="stats">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="display">{s.value}</dt>
                    <dd>{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
