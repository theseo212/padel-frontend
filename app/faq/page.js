export const metadata = {
  title: 'Domande frequenti - AnnaPadel',
};

const FAQ = [
  {
    domanda: 'Come funziona AnnaPadel?',
    risposta: 'Inserisci il giorno e le fasce orarie in cui puoi giocare, il tuo livello e il circolo che preferisci. Appena trovo altri 3 giocatori compatibili con te, ti avviso su WhatsApp con la proposta di partita.',
  },
  {
    domanda: 'Il servizio è gratuito?',
    risposta: 'Sì, l\'uso di AnnaPadel è completamente gratuito. Paghi solo il campo, direttamente al circolo, come fai già oggi.',
  },
  {
    domanda: 'Come vengono scelti i miei compagni di partita?',
    risposta: 'In base al tuo livello di gioco, agli orari in comune, al circolo scelto e al lato preferito (destra, sinistra o indifferente), il mio algoritmo cerca la combinazione più equilibrata possibile tra i giocatori disponibili.',
  },
  {
    domanda: 'Cosa succede se qualcuno del gruppo non conferma in tempo?',
    risposta: 'Hai 15 minuti per confermare ogni proposta. Se qualcuno rifiuta o non risponde in tempo, gli altri tornano automaticamente in ricerca, senza nessuna penalità per chi aveva già confermato.',
  },
    {
    domanda: 'Come si fa ad inserire un nuovo circolo dove poter giocare?',
    risposta: 'Scrivimi tramite il modulo dei contatti e ti spiegherò come procedere.',
  },
  {
    domanda: 'Devo pagare il campo tramite il sito?',
    risposta: 'No. Il pagamento del campo si effettua sempre direttamente al circolo, come sei abituato a fare.',
  },
  {
    domanda: 'Posso cambiare la mia disponibilità dopo averla inviata?',
    risposta: 'Sì. Se invii una nuova richiesta per lo stesso giorno, ti verrà chiesto se vuoi mantenere quella precedente o sostituirla con quella nuova.',
  },
    {
    domanda: 'Posso inviare più richieste per lo stesso giorno?',
    risposta: 'No, si può inviare una sola richiesta al giorno.',
  },
  {
    domanda: 'Il mio livello di gioco può cambiare nel tempo?',
    risposta: 'Sì, ma non lo modifichi tu manualmente: si aggiorna automaticamente in base alle valutazioni che ricevi dai tuoi compagni dopo le partite giocate mediate dal mio algoritmo.',
  },
    {
    domanda: 'Il mio livello di gioco non è corretto, come posso modificarlo?',
    risposta: 'Scrivimi tramite il modulo dei contatti e analizzeremo la situazione insieme.',
  },
  {
    domanda: 'I miei dati sono al sicuro?',
    risposta: 'Sì. Trovi tutti i dettagli nella nostra Privacy Policy, consultabile in qualsiasi momento dal sito.',
  },
];

export default function DomandeFrequenti() {
  return (
    <main className="pagina">
      <div className="intestazione">
        <img src="/anna-avatar.png" alt="Anna" className="avatar-pagina" />
        <h1>Domande frequenti</h1>
        <p>Le risposte più comuni su come funziona AnnaPadel. Non trovi quello che cerchi? Scrivimi dalla pagina Contatti.</p>
      </div>

      {FAQ.map((voce, indice) => (
        <div className="sezione" key={indice}>
          <h2>{voce.domanda}</h2>
          <p style={{ margin: 0, color: '#444', fontSize: '14px', lineHeight: 1.6 }}>{voce.risposta}</p>
        </div>
      ))}
    </main>
  );
}
