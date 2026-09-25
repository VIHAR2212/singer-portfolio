import { artist } from "@/lib/content";

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="beam beam-a" aria-hidden="true" />
      <div className="beam beam-b" aria-hidden="true" />
      <div className="beam beam-c" aria-hidden="true" />
      <div className="hero-floor" aria-hidden="true" />

      <div className="wrap hero-inner">
        <ul className="hero-tag" aria-label="Styles of music">
          {artist.tagline.split("·").map((t) => (
            <li key={t}>{t.trim()}</li>
          ))}
        </ul>

        <h1 className="display hero-name">{artist.name}</h1>

        <p className="display hero-line">
          {artist.firstLine} {artist.secondLine}
        </p>

        <div className="hero-cta">
          <a href="#book" className="btn btn-gold">
            Book a live show
            <span className="dot" aria-hidden="true">↗</span>
          </a>
          <a href="#music" className="btn btn-ghost">
            Listen now
            <span className="dot" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
