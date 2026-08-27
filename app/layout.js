import './globals.css';
import Script from 'next/script';
import NavSito from './NavSito';

// Sostituisci con il tuo ID vero di Google Analytics (es. "G-ABC1234XYZ")
const GOOGLE_ANALYTICS_ID = 'G-1KNM2JBV6J';

export const metadata = {
  title: 'AnnaPadel - La tua segretaria personale per il padel',
  description: 'Dimmi quando puoi giocare: trovo i tuoi compagni, prenoto il campo e ti avviso su WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <meta name="facebook-domain-verification" content="5z99j6zlhgm87x9lcdpvqubt0bfi0u" />
        <meta name="google-adsense-account" content="ca-pub-4346532305433003" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics: DEVE stare nell'head (non nel body) - è lì
            che Google Search Console cerca il tag per la verifica proprietà. */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} strategy="beforeInteractive" />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body>
        <NavSito />

        {children}

        <footer className="footer-sito">
          © 2026 AnnaPadel. Tutti i diritti riservati.<br />
          AnnaPadel è un marchio di Internet Voice - P.IVA IT09980330014
        </footer>
      </body>
    </html>
  );
}
