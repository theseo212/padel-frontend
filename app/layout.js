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
          <a href="/" className="nav-logo">🎾 AnnaPadel</a>
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
