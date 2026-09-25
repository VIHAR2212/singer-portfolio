import { artist, social, contact } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <hr className="rule" />
      <div className="wrap footer-inner">
        <p className="display footer-name">{artist.name}</p>
        <nav className="footer-links" aria-label="Social and contact">
          <a href={social.instagram.url} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={social.youtube.url} target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href={contact.phoneHref}>{contact.phone}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </nav>
        <p className="footer-copy">© {new Date().getFullYear()} {artist.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
