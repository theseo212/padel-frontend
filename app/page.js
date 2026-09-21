import HomeClient from './HomeClient';

export const metadata = {
  title: 'AnnaPadel - La tua segretaria personale per il padel',
  description: 'Dimmi quando puoi giocare: trovo i tuoi compagni, prenoto il campo e ti avviso su WhatsApp.',
  alternates: {
    // Il sito risponde correttamente sia su annapadel.it sia su
    // www.annapadel.it (voluto, vedi la configurazione DNS su Cloudflare) -
    // ma senza questo tag, Google vede le due versioni come contenuto
    // duplicato e non sa quale delle due indicizzare ("Pagina duplicata
    // senza URL canonico selezionato dall'utente" in Search Console).
    // Dichiariamo qui esplicitamente www.annapadel.it come versione
    // ufficiale, la stessa già registrata come proprietà su Search Console.
    canonical: 'https://www.annapadel.it',
  },
};

export default function Home() {
  return <HomeClient />;
}
