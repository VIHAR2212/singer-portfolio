import Reveal from "./Reveal";
import { styles, social } from "@/lib/content";

export default function Music() {
  // A channel's uploads playlist ID is its channel ID with the "UC" prefix swapped for "UU".
  const { featuredVideoId, channelId } = social.youtube;
  const embedSrc = featuredVideoId
    ? `https://www.youtube-nocookie.com/embed/${featuredVideoId}?rel=0`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=UU${channelId.slice(2)}&rel=0`;

  return (
    <section id="music" className="section music">
      <div className="wrap">
        <Reveal>
          <h2 className="display">Four styles, one voice</h2>
          <p className="lede">
            From a quiet raag at dawn to a full Garba ground at midnight.
          </p>
        </Reveal>

        <div className="style-grid">
          {styles.map((s, i) => (
            <Reveal key={s.title} delay={i * 90} className="style-card">
              <div className="shell">
                <div className="core">
                  <h3 className="display">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="video-block">
          <div className="shell">
            <div className="core video-core">
              <iframe
                src={embedSrc}
                title="Latest performances by Sonal Makwana"
                loading="lazy"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
