import './globals.css';

export const metadata = {
  title: 'Prenota la tua partita di padel',
  description: 'Inserisci la tua disponibilità e trova compagni di gioco compatibili nella tua zona.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
