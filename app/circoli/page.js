export const metadata = {
  title: 'AnnaPadel per i Circoli - Sistema Tornei Ricorrenti',
  description: 'Il sistema che organizza da solo i tuoi tornei interni ricorrenti: conferme su WhatsApp, quartetti bilanciati, tabelle pronte e classifica sempre aggiornata.',
};

export default function AnnaPadelPerICircoli() {
  return (
    <main className="pagina">
      <div className="intestazione">
        <img src="/anna-avatar.png" alt="Anna" className="avatar-pagina" />
        <h1>Anna, la segretaria automatica per i tornei ricorrenti</h1>
        <p>
          Tu decidi giorno, orario e cadenza del torneo. Anna organizza tutto il resto, in automatico.
        </p>
      </div>

      <div className="sezione">
        <h2>Come funziona, in pratica</h2>
        <p>
          Ogni giocatore si iscrive una sola volta al torneo che preferisce (es. "Torneo del lunedì
          mattina") — non deve più ricordarsi di farlo ogni settimana, e può cambiare scelta quando vuole.
        </p>
        <p>
          Prima di ogni tappa, Anna scrive <strong>individualmente</strong> a ogni iscritto su WhatsApp per
          chiedere conferma, con due bottoni: Confermo la presenza / Non ci sarò. Due giorni dopo, sollecita
          solo chi non ha ancora risposto — nessun messaggio superfluo a chi ha già dato la sua conferma.
        </p>
        <p>
          Poche ore prima, Anna forma da sola i quartetti: bilanciati per livello e lato di gioco, e sempre
          diversi rispetto alla tappa precedente. Prepara anche il PDF con le tabelle pronte da stampare, e
          scrive a ciascuno il proprio gruppo e l'orario di gioco.
        </p>
        <p>
          A fine torneo, chiede a ognuno il punteggio ottenuto, e aggiorna da sola la classifica generale —
          che arriva a tutti i partecipanti pochi minuti dopo la fine.
        </p>
      </div>

      <div className="sezione">
        <h2>Un pannello semplice, per chi gestisce il circolo</h2>
        <p>
          Nessuna azione manuale richiesta per il funzionamento quotidiano — ma quando vuoi dare
          un'occhiata, o intervenire su qualcosa, è tutto a portata di clic: lo stato di ogni torneo in
          tempo reale, un nome personalizzato per ogni edizione del campionato, e la classifica sempre
          consultabile.
        </p>
      </div>

      <div className="sezione">
        <h2>Prima e dopo AnnaPadel</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Prima</th>
                <th style={{ padding: '10px 8px' }}>Con AnnaPadel</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 8px' }}>Ogni giocatore deve ricordarsi di andare nella chat ed iscriversi</td>
                <td style={{ padding: '10px 8px' }}>Anna scrive individualmente a ognuno, in automatico</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 8px' }}>I quartetti si fanno a mano, spesso a caso</td>
                <td style={{ padding: '10px 8px' }}>I quartetti cambiano ogni volta, bilanciati per livello</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 8px' }}>Le tabelle si preparano a mano prima di ogni torneo</td>
                <td style={{ padding: '10px 8px' }}>Le tabelle arrivano già pronte da stampare</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 8px' }}>La classifica si aggiorna manualmente, tappa dopo tappa</td>
                <td style={{ padding: '10px 8px' }}>La classifica si aggiorna da sola dopo ogni tappa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="sezione" style={{ textAlign: 'center' }}>
        <h2>Vuoi vederlo dal vivo?</h2>
        <p>
          Scarica la brochure completa con tutti i dettagli, o scrivici per un incontro e una demo dal vivo.
        </p>
        <a
          href="/AnnaPadel_Brochure_Tornei.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="bottone-primario"
          style={{ display: 'inline-block', textDecoration: 'none', maxWidth: '320px', margin: '10px auto 0' }}
        >
          Scarica la brochure (PDF)
        </a>
        <br />
        <a
          href="/contatti"
          className="bottone-secondario"
          style={{ display: 'inline-block', textDecoration: 'none', marginTop: '12px' }}
        >
          Parliamone insieme
        </a>
      </div>
    </main>
  );
}
