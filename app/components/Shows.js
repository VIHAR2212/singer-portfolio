import Reveal from "./Reveal";
import { upcomingShows } from "@/lib/content";

export default function Shows() {
  if (!upcomingShows.length) return null;

  return (
    <section id="shows" className="section">
      <div className="wrap">
        <Reveal>
          <h2 className="display">Coming up on stage</h2>
        </Reveal>

        <ul className="show-list">
          {upcomingShows.map((s, i) => (
            <Reveal as="li" key={s.title + s.date} delay={i * 100} className="show">
              <span className="show-date display">{s.date}</span>
              <span className="show-title display">{s.title}</span>
              <span className="show-place">{s.place}</span>
              <a href="#book" className="show-link" aria-label={`Book for ${s.title}`}>Book</a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
