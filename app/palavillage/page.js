'use client';

import { useState } from 'react';

// Stesso schema del sito generico: il browser chiama sempre /api/...,
// è next.config.js a inoltrare al backend vero (vedi rewrites()).
const API_URL = '/api';

const PREFISSO_WHATSAPP = '+39';

const LIVELLI_WANSPORT = ['C4', 'C3', 'C2', 'C1', 'B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'];

function generaLivelliPlaytomic() {
  const livelli = [];
  for (let i = 0; i <= 28; i++) {
    livelli.push((i * 0.25).toFixed(2));
  }
  return livelli;
}
const LIVELLI_PLAYTOMIC = generaLivelliPlaytomic();

const GIORNI = [
  { valore: 'LUN', etichetta: 'Lunedì' },
  { valore: 'MAR', etichetta: 'Martedì' },
  { valore: 'MER', etichetta: 'Mercoledì' },
  { valore: 'GIO', etichetta: 'Giovedì' },
  { valore: 'VEN', etichetta: 'Venerdì' },
];

function soloNumeri(testo) {
  return testo.replace(/\D/g, '');
}

export default function PaginaPalavillage() {
  // --- dati anagrafici (usati solo se l'utente NON viene riconosciuto) ---
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [whatsappLocale, setWhatsappLocale] = useState('');
  const [latoPreferito, setLatoPreferito] = useState('INDIFFERENTE');
  const [livelloScala, setLivelloScala] = useState('PLAYTOMIC');
  const [livelloValore, setLivelloValore] = useState('');

  // --- mattine scelte ---
  const [giorniSelezionati, setGiorniSelezionati] = useState([]);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);

  // --- riconoscimento utente esistente ---
  const [profilo, setProfilo] = useState(null);
  const [trovatoNelGenerico, setTrovatoNelGenerico] = useState(false);
  const [caricandoProfilo, setCaricandoProfilo] = useState(false);

  // --- stato della UI ---
  const [schermata, setSchermata] = useState('form'); // form | otp | successo
  const [errore, setErrore] = useState(null);
  const [inviando, setInviando] = useState(false);
  const [codiceOtp, setCodiceOtp] = useState('');

  const whatsappCompleto = PREFISSO_WHATSAPP + soloNumeri(whatsappLocale);

  function mostraErrore(messaggio) {
    setErrore(messaggio);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function verificaNumeroConosciuto() {
    const numeroPulito = soloNumeri(whatsappLocale);
    if (numeroPulito.length < 9) {
      setProfilo(null);
      return;
    }

    setCaricandoProfilo(true);
    try {
      const risposta = await fetch(
        `${API_URL}/palavillage/utenti/profilo?whatsapp_numero=${encodeURIComponent(whatsappCompleto)}`
      );
      const dati = await risposta.json();

      if (dati.esiste) {
        setProfilo(dati);
        setTrovatoNelGenerico(false);
        setNome(dati.nome);
        setCognome(dati.cognome);
        setLatoPreferito(dati.lato_preferito);
        setGiorniSelezionati(dati.giorni || []);
        if (dati.livello_dichiarato_scala === 'WANSPORT') {
          setLivelloScala('WANSPORT');
          setLivelloValore(dati.livello_dichiarato_originale);
        } else {
          setLivelloScala('PLAYTOMIC');
          setLivelloValore(dati.livello_playtomic.toFixed(2));
        }
      } else if (dati.trovato_nel_generico) {
        // Numero già conosciuto da Anna sul sistema generico, ma è la
        // prima volta qui su Palavillage: precompiliamo nome/cognome/
        // livello (niente da rifare), ma lato e mattine restano da
        // scegliere per la prima volta - quindi NON impostiamo "profilo"
        // (che nasconderebbe anche quelle sezioni).
        setProfilo(null);
        setTrovatoNelGenerico(true);
        setNome(dati.nome);
        setCognome(dati.cognome);
        if (dati.livello_dichiarato_scala === 'WANSPORT') {
          setLivelloScala('WANSPORT');
          setLivelloValore(dati.livello_dichiarato_originale);
        } else {
          setLivelloScala('PLAYTOMIC');
          setLivelloValore(dati.livello_playtomic.toFixed(2));
        }
      } else {
        setProfilo(null);
        setTrovatoNelGenerico(false);
      }
    } catch {
      setProfilo(null);
    } finally {
      setCaricandoProfilo(false);
    }
  }

  function gestisciModificaWhatsapp(valore) {
    setWhatsappLocale(valore);
    if (profilo) {
      setProfilo(null);
    }
    setTrovatoNelGenerico(false);
  }

  function toggleGiorno(valore) {
    setGiorniSelezionati((precedenti) =>
      precedenti.includes(valore) ? precedenti.filter((g) => g !== valore) : [...precedenti, valore]
    );
  }

  function costruisciCorpoIscrizione() {
    return {
      nome,
      cognome,
      whatsapp_numero: whatsappCompleto,
      livello_scala: livelloScala,
      livello_valore: livelloValore,
      lato_preferito: latoPreferito,
      giorni: giorniSelezionati,
      accetta_termini: accettaTermini,
      accetta_privacy: accettaPrivacy,
    };
  }

  function validaForm() {
    if (!profilo) {
      if (!nome.trim() || !cognome.trim()) return 'Inserisci nome e cognome.';
      if (!livelloValore) return 'Scegli il tuo livello di gioco.';
      if (!accettaTermini || !accettaPrivacy) {
        return 'Devi accettare i Termini e Condizioni e la Privacy Policy per continuare.';
      }
    }
    if (soloNumeri(whatsappLocale).length < 9) return 'Inserisci un numero WhatsApp valido.';
    if (giorniSelezionati.length === 0) return 'Scegli almeno una mattina in cui vuoi giocare.';
    return null;
  }

  async function inviaIscrizione(event) {
    event?.preventDefault();
    setErrore(null);

    const erroreValidazione = validaForm();
    if (erroreValidazione) {
      mostraErrore(erroreValidazione);
      return;
    }

    setInviando(true);
    try {
      const risposta = await fetch(`${API_URL}/palavillage/iscrizione`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costruisciCorpoIscrizione()),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        const messaggio = typeof dati.detail === 'string' ? dati.detail : 'Si è verificato un errore, riprova.';
        mostraErrore(messaggio);
        return;
      }

      if (dati.richiede_validazione_otp) {
        setSchermata('otp');
      } else {
        setSchermata('successo');
      }
    } catch {
      mostraErrore('Non riesco a contattare il server. Controlla la connessione e riprova.');
    } finally {
      setInviando(false);
    }
  }

  async function confermaOtp(event) {
    event.preventDefault();
    setErrore(null);
    setInviando(true);
    try {
      const risposta = await fetch(`${API_URL}/palavillage/iscrizione/valida-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_numero: whatsappCompleto, codice_otp: codiceOtp }),
      });
      const dati = await risposta.json();

      if (!risposta.ok) {
        mostraErrore(dati.detail || 'Codice non valido, riprova.');
        return;
      }
      setSchermata('successo');
    } catch {
      mostraErrore('Non riesco a contattare il server. Controlla la connessione e riprova.');
    } finally {
      setInviando(false);
    }
  }

  if (schermata === 'successo') {
    const giorniLeggibili = GIORNI.filter((g) => giorniSelezionati.includes(g.valore))
      .map((g) => g.etichetta)
      .join(', ');
    const latoLabel = { DX: 'destra', SX: 'sinistra', INDIFFERENTE: 'indifferente' }[latoPreferito] || latoPreferito;

    return (
      <main className="pagina">
        <div className="sezione">
          <p className="messaggio-successo">✅ Iscrizione inviata con successo!</p>
          <div className="riepilogo-richiesta">
            <p>
              Hai scelto di giocare i tornei del mattino di <strong>Palavillage</strong> il/i:{' '}
              <strong>{giorniLeggibili}</strong>, lato <strong>{latoLabel}</strong>,
              livello compatibile con <strong>{livelloValore}</strong>.
            </p>
            <p>Ti manderò anche su WhatsApp una conferma con questo riepilogo.</p>
            <p>
              Ti scriverò io qualche giorno prima di ogni torneo per chiederti conferma della tua
              partecipazione — nel frattempo puoi tornare qui in qualsiasi momento per cambiare le
              mattine scelte.
            </p>
          </div>
          <a href="/palavillage" className="bottone-primario" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
            Torna qui per modificare la tua iscrizione
          </a>
        </div>
      </main>
    );
  }

  if (schermata === 'otp') {
    return (
      <main className="pagina">
        <div className="intestazione">
          <h1>Verifica il tuo numero</h1>
          <p>
            È la prima volta che utilizzi Anna: ho bisogno di verificare il tuo numero di
            telefono, quindi ti ho inviato un codice su WhatsApp al numero{' '}
            {PREFISSO_WHATSAPP} {whatsappLocale}, che ti chiedo di scrivere qua sotto.
            Tutte le prossime volte non sarà più necessario.
          </p>
        </div>
        <form className="sezione" onSubmit={confermaOtp}>
          {errore && <p className="messaggio-errore">{errore}</p>}
          <div className="campo">
            <label htmlFor="otp">Codice di verifica</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codiceOtp}
              onChange={(e) => setCodiceOtp(e.target.value)}
              placeholder="Es. 123456"
            />
          </div>
          <button className="bottone-primario" type="submit" disabled={inviando}>
            {inviando ? 'Verifica in corso…' : 'Conferma codice'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="pagina" id="form-iscrizione-palavillage">
      <div className="intestazione">
        <h1>
          <img src="/racchetta-icona.svg" alt="" width="24" height="24" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Palavillage
        </h1>
        <p>Ciao! Dimmi quando vuoi giocare e gestirò le tue iscrizioni ai nostri tornei del mattino, avvisandoti su WhatsApp.</p>
      </div>

      {errore && <p className="messaggio-errore">{errore}</p>}

      <form onSubmit={inviaIscrizione}>
        <section className="sezione">
          <h2>Il tuo numero WhatsApp</h2>
          <div className="campo">
            <label htmlFor="whatsapp">Numero di telefono</label>
            <div className="campo-con-prefisso">
              <span className="prefisso-whatsapp">{PREFISSO_WHATSAPP}</span>
              <input
                id="whatsapp"
                name="tel"
                type="tel"
                autoComplete="tel-national"
                placeholder="333 1234567"
                value={whatsappLocale}
                onChange={(e) => gestisciModificaWhatsapp(e.target.value)}
                onBlur={verificaNumeroConosciuto}
              />
            </div>
            <p className="testo-piccolo">Usato per inviarti richieste di conferma e la classifica.</p>

            {caricandoProfilo && <p className="testo-piccolo">Verifico se ti conosco già…</p>}

            {profilo && (
              <p className="profilo-riconosciuto">
                👋 Bentornato/a {profilo.nome} {profilo.cognome} (liv. {profilo.livello_playtomic.toFixed(2)})!<br />
                Ho memorizzato le tue preferenze: puoi comunque cambiare mattine e lato di gioco qui sotto.
              </p>
            )}

            {trovatoNelGenerico && !profilo && (
              <p className="profilo-riconosciuto">
                👋 Ti conosco già, {nome}! Ho recuperato i tuoi dati da AnnaPadel: ti manca solo
                scegliere lato di gioco e mattine qui sotto per completare l'iscrizione a Palavillage.
              </p>
            )}
          </div>
        </section>

        {!profilo && (
          <section className="sezione">
            <h2>I tuoi dati</h2>
            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input id="nome" name="given-name" autoComplete="given-name" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="cognome">Cognome</label>
              <input id="cognome" name="family-name" autoComplete="family-name" type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} />
            </div>

            <div className="campo">
              <label>Il tuo livello di gioco</label>
              <div className="gruppo-scelte" style={{ marginBottom: 10 }}>
                <div className="scelta-opzione">
                  <input
                    type="radio"
                    id="scala-playtomic"
                    checked={livelloScala === 'PLAYTOMIC'}
                    onChange={() => { setLivelloScala('PLAYTOMIC'); setLivelloValore(''); }}
                  />
                  <label htmlFor="scala-playtomic">Playtomic</label>
                </div>
                <div className="scelta-opzione">
                  <input
                    type="radio"
                    id="scala-wansport"
                    checked={livelloScala === 'WANSPORT'}
                    onChange={() => { setLivelloScala('WANSPORT'); setLivelloValore(''); }}
                  />
                  <label htmlFor="scala-wansport">Wansport</label>
                </div>
              </div>

              {livelloScala === 'PLAYTOMIC' ? (
                <>
                  <select value={livelloValore} onChange={(e) => setLivelloValore(e.target.value)}>
                    <option value="">Scegli il tuo livello…</option>
                    {LIVELLI_PLAYTOMIC.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <p className="testo-piccolo">Da 0.00 (livello base) a 7.00 (livello più alto).</p>
                </>
              ) : (
                <>
                  <select value={livelloValore} onChange={(e) => setLivelloValore(e.target.value)}>
                    <option value="">Scegli il tuo livello…</option>
                    {LIVELLI_WANSPORT.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <p className="testo-piccolo">Da C4 (livello base) ad A1 (livello più alto).</p>
                </>
              )}
              <p className="testo-piccolo">
                Attenzione: questo livello verrà registrato una sola volta e non sarà più modificabile
                da qui in poi (cambierà solo in base ai punteggi ottenuti nei tornei).
              </p>
            </div>
          </section>
        )}

        <section className="sezione">
          <h2>Il tuo lato di gioco</h2>
          <div className="campo">
            <label>Lato preferito</label>
            <div className="gruppo-scelte">
              {[
                { valore: 'DX', etichetta: 'Destra' },
                { valore: 'SX', etichetta: 'Sinistra' },
                { valore: 'INDIFFERENTE', etichetta: 'Indifferente' },
              ].map((opzione) => (
                <div className="scelta-opzione" key={opzione.valore}>
                  <input
                    type="radio"
                    id={`lato-${opzione.valore}`}
                    checked={latoPreferito === opzione.valore}
                    onChange={() => setLatoPreferito(opzione.valore)}
                  />
                  <label htmlFor={`lato-${opzione.valore}`}>{opzione.etichetta}</label>
                </div>
              ))}
            </div>
            <p className="testo-piccolo">(con INDIFFERENTE hai più probabilità di giocare)</p>
          </div>
        </section>

        <section className="sezione">
          <h2>Quali mattine?</h2>
          <div className="campo">
            <label>Indica in quali mattine vuoi giocare (potrai cambiare questa scelta in qualsiasi momento)</label>
            <div className="gruppo-scelte">
              {GIORNI.map((giorno) => (
                <div className="scelta-opzione" key={giorno.valore}>
                  <input
                    type="checkbox"
                    id={`giorno-${giorno.valore}`}
                    checked={giorniSelezionati.includes(giorno.valore)}
                    onChange={() => toggleGiorno(giorno.valore)}
                  />
                  <label htmlFor={`giorno-${giorno.valore}`}>{giorno.etichetta}</label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!profilo && (
          <div className="accettazione-legale">
            <label>
              <input
                type="checkbox"
                checked={accettaTermini}
                onChange={(e) => setAccettaTermini(e.target.checked)}
              />
              {' '}Accetto i <a href="/termini" target="_blank" rel="noopener noreferrer">Termini e Condizioni</a>
            </label>
            <label>
              <input
                type="checkbox"
                checked={accettaPrivacy}
                onChange={(e) => setAccettaPrivacy(e.target.checked)}
              />
              {' '}Accetto la <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
          </div>
        )}

        <button className="bottone-primario" type="submit" disabled={inviando}>
          {inviando ? 'Invio in corso…' : 'Invia la mia iscrizione'}
        </button>
      </form>
    </main>
  );
}
