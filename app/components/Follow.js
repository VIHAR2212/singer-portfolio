import Reveal from "./Reveal";
import { social } from "@/lib/content";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Follow() {
  const items = [
    {
      key: "instagram",
      Icon: InstagramIcon,
      title: "Instagram",
      handle: social.instagram.handle,
      text: "Reels, rehearsals and behind-the-scenes from every show.",
      cta: "Follow on Instagram",
      url: social.instagram.url,
    },
    {
      key: "youtube",
      Icon: YouTubeIcon,
      title: "YouTube",
      handle: social.youtube.handle,
      text: "Full performances, bhajans and Garba nights. Subscribe so you never miss one.",
      cta: "Subscribe on YouTube",
      url: social.youtube.url,
    },
  ];

  return (
    <section id="follow" className="section follow">
      <div className="wrap">
        <Reveal className="follow-head">
          <h2 className="display">Stay close to the music</h2>
          <p className="lede">
            New songs and show announcements land here first.
          </p>
        </Reveal>

        <div className="follow-grid">
          {items.map((it, i) => (
            <Reveal key={it.key} delay={i * 120}>
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="follow-card shell"
              >
                <span className="core follow-core">
                  <span className="follow-icon"><it.Icon /></span>
                  <span className="follow-title display">{it.title}</span>
                  <span className="follow-handle">{it.handle}</span>
                  <span className="follow-text">{it.text}</span>
                  <span className="btn btn-ghost follow-btn">
                    {it.cta}
                    <span className="dot" aria-hidden="true">↗</span>
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
