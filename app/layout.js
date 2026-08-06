import './globals.css';

export const metadata = {
  title: 'AnnaPadel - La tua segretaria personale per il padel',
  description: 'Dimmi quando puoi giocare: trovo i tuoi compagni, prenoto il campo e ti avviso su WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="nav-sito">
          <a href="/" className="nav-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
              <ellipse cx="12" cy="9" rx="7" ry="8" fill="#7CB342" stroke="#1B3A63" strokeWidth="1.2" />
              <circle cx="9" cy="6" r="0.8" fill="#1B3A63" /><circle cx="12" cy="5.3" r="0.8" fill="#1B3A63" /><circle cx="15" cy="6" r="0.8" fill="#1B3A63" />
              <circle cx="8" cy="9" r="0.8" fill="#1B3A63" /><circle cx="12" cy="9" r="0.8" fill="#1B3A63" /><circle cx="16" cy="9" r="0.8" fill="#1B3A63" />
              <circle cx="9" cy="12" r="0.8" fill="#1B3A63" /><circle cx="12" cy="12.7" r="0.8" fill="#1B3A63" /><circle cx="15" cy="12" r="0.8" fill="#1B3A63" />
              <rect x="10.5" y="16" width="3" height="7" rx="1.5" fill="#1B3A63" />
            </svg>
            AnnaPadel
          </a>
          <div className="nav-link-gruppo">
            <a href="/faq">FAQ</a>
            <a href="/contatti">Contatti</a>
          </div>
        </nav>

        {children}

        <footer className="footer-sito">
          © 2026 AnnaPadel. Tutti i diritti riservati.
        </footer>
      </body>
    </html>
  );
}
