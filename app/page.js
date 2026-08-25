'use client';

import { useState, useEffect } from 'react';

// Il browser chiama sempre /api/..., lo stesso dominio del frontend.
// È il server Next.js (vedi next.config.js) a inoltrare la richiesta
// al backend vero: il browser non conosce mai l'indirizzo del backend.
const API_URL = '/api';

const PREFISSO_WHATSAPP = '+39';

const LIVELLI_WANSPORT = ['C4', 'C3', 'C2', 'C1', 'B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'];

// Livelli Playtomic da 0 a 7, a intervalli di 0.25 (scelta a click invece
// di digitazione libera, come per Wansport)
function generaLivelliPlaytomic() {
  const livelli = [];
  for (let i = 0; i <= 28; i++) {
    livelli.push((i * 0.25).toFixed(2));
  }
  return livelli;
}
const LIVELLI_PLAYTOMIC = generaLivelliPlaytomic();

// Ore e minuti selezionabili per le fasce orarie (coerenti con la fascia
// gestita dal sistema, 07:00-23:00, slot da 30 minuti - vedi app/config.py)
const ORE_DISPONIBILI = Array.from({ length: 17 }, (_, i) => String(i + 7).padStart(2, '0')); // 07..23
const MINUTI_DISPONIBILI = ['00', '30'];

function soloNumeri(testo) {
  return testo.replace(/\D/g, '');
}

function nuovaFasciaOraria() {
  return { oraInizio: '08', minutoInizio: '00', oraFine: '23', minutoFine: '00' };
}

export default function Pagina() {
  // --- dati anagrafici (usati solo se l'utente NON viene riconosciuto) ---
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [whatsappLocale, setWhatsappLocale] = useState('');
  const [latoPreferito, setLatoPreferito] = useState('INDIFFERENTE');
  const [livelloScala, setLivelloScala] = useState('PLAYTOMIC');
  const [livelloValore, setLivelloValore] = useState('');

  // --- dati della richiesta specifica ---
  const [tipoPartita, setTipoPartita] = useState('MASCHILE');
  const [giorno, setGiorno] = useState('');
  const [fasceOrarie, setFasceOrarie] = useState([nuovaFasciaOraria()]);
  const [circoli, setCircoli] = useState([]);
  const [circoliSelezionati, setCircoliSelezionati] = useState([]);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);
  const [filtroTesto, setFiltroTesto] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('');

  // --- riconoscimento utente esistente ---
  const [profilo, setProfilo] = useState(null); // null = non ancora verificato / non trovato
  const [caricandoProfilo, setCaricandoProfilo] = useState(false);

  // --- stato della UI ---
  const [schermata, setSchermata] = useState('form'); // form | otp | successo
  const [mostraAvvisoTest, setMostraAvvisoTest] = useState(true);
  const [errore, setErrore] = useState(null);

  function mostraErrore(messaggio) {
    setErrore(messaggio);
    // Se l'utente ha già scorso in fondo alla pagina (es. per premere il
    // bottone finale), il messaggio d'errore in cima altrimenti resta
    // fuori dallo sguardo - senza questo, chi non sa che deve tornare su
    // pensa semplicemente che il bottone "non abbia fatto niente".
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const [conflitto, setConflitto] = useState(null);
  const [inviando, setInviando] = useState(false);
  const [codiceOtp, setCodiceOtp] = useState('');

  const whatsappCompleto = PREFISSO_WHATSAPP + soloNumeri(whatsappLocale);

  useEffect(() => {
    fetch(`${API_URL}/circoli?solo_attivi=true`)
      .then((r) => r.json())
      .then((dati) => setCircoli(dati))
      .catch(() => setErrore('Non riesco a caricare la lista dei circoli. Riprova più tardi.'));
  }, []);

  // Province disponibili, calcolate dai circoli caricati (nessuna chiamata extra)
  const province = [...new Set(circoli.map((c) => c.provincia).filter(Boolean))].sort();

  // Filtro combinato: ricerca testuale (nome o indirizzo) + provincia selezionata
  const circoliFiltrati = circoli.filter((c) => {
    const passaProvincia = !filtroProvincia || c.provincia === filtroProvincia;
    const testoRicerca = filtroTesto.trim().toLowerCase();
    const passaTesto = !testoRicerca || `${c.nome} ${c.indirizzo || ''}`.toLowerCase().includes(testoRicerca);
    return passaProvincia && passaTesto;
  });

  async function verificaNumeroConosciuto() {
    const numeroPulito = soloNumeri(whatsappLocale);
    if (numeroPulito.length < 9) {
      setProfilo(null);
      return;
    }

    setCaricandoProfilo(true);
    try {
      const risposta = await fetch(
        `${API_URL}/utenti/profilo?whatsapp_numero=${encodeURIComponent(whatsappCompleto)}`
      );
      const dati = await risposta.json();

      if (dati.esiste) {
        setProfilo(dati);
        setNome(dati.nome);
        setCognome(dati.cognome);
        setLatoPreferito(dati.lato_preferito);
        if (dati.livello_dichiarato_scala === 'WANSPORT') {
          setLivelloScala('WANSPORT');
          setLivelloValore(dati.livello_dichiarato_originale);
        } else {
          setLivelloScala('PLAYTOMIC');
          setLivelloValore(dati.livello_playtomic.toFixed(2));
        }
        if (dati.ultima_richiesta) {
          setTipoPartita(dati.ultima_richiesta.tipo_partita);
          setCircoliSelezionati(dati.ultima_richiesta.circoli_ids);
        }
      } else {
        setProfilo(null);
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
  }

  function aggiornaFasciaOraria(indice, campo, valore) {
    setFasceOrarie((precedenti) =>
      precedenti.map((f, i) => (i === indice ? { ...f, [campo]: valore } : f))
    );
  }

  function aggiungiFasciaOraria() {
    setFasceOrarie((precedenti) => [...precedenti, nuovaFasciaOraria()]);
  }

  function rimuoviFasciaOraria(indice) {
    setFasceOrarie((precedenti) => precedenti.filter((_, i) => i !== indice));
  }

  function toggleCircolo(id) {
    setCircoliSelezionati((precedenti) =>
      precedenti.includes(id) ? precedenti.filter((c) => c !== id) : [...precedenti, id]
    );
  }

  function costruisciCorpoRichiesta() {
    const fasceFormattate = fasceOrarie.map((f) => [
      `${f.oraInizio}:${f.minutoInizio}`,
      `${f.oraFine}:${f.minutoFine}`,
    ]);

    return {
      nome,
      cognome,
      whatsapp_numero: whatsappCompleto,
      livello_scala: livelloScala,
      livello_valore: livelloValore,
      lato_preferito: latoPreferito,
      tipo_partita: tipoPartita,
      giorno,
      fasce_orarie: fasceFormattate,
      circoli_ids: circoliSelezionati,
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
    if (!giorno) return 'Scegli il giorno in cui vuoi giocare.';
    if (fasceOrarie.length === 0) return 'Inserisci almeno una fascia oraria.';
    for (const f of fasceOrarie) {
      const inizio = `${f.oraInizio}:${f.minutoInizio}`;
      const fine = `${f.oraFine}:${f.minutoFine}`;
      if (fine <= inizio) return 'In ogni fascia oraria, l\'orario di fine deve essere dopo quello di inizio.';
    }
    if (circoliSelezionati.length === 0) return 'Scegli almeno un circolo.';
    return null;
  }

  async function inviaRichiesta(event) {
    event?.preventDefault();
    setErrore(null);
    setConflitto(null);

    const erroreValidazione = validaForm();
    if (erroreValidazione) {
      mostraErrore(erroreValidazione);
      return;
    }

    setInviando(true);
    try {
      const risposta = await fetch(`${API_URL}/richieste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costruisciCorpoRichiesta()),
      });

      const dati = await risposta.json();

      if (risposta.status === 409) {
        setConflitto(dati.detail);
        return;
      }

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

  async function annullaEReinvia() {
    setErrore(null);
    setInviando(true);
    try {
      await fetch(`${API_URL}${conflitto.azione_annulla}`, { method: 'POST' });
      setConflitto(null);
      await inviaRichiesta();
    } catch {
      mostraErrore('Non sono riuscito ad annullare la richiesta precedente. Riprova.');
    } finally {
      setInviando(false);
    }
  }

  async function confermaOtp(event) {
    event.preventDefault();
    setErrore(null);
    setInviando(true);
    try {
      const risposta = await fetch(`${API_URL}/richieste/valida-otp`, {
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
    const nomiCircoliScelti = circoli.filter((c) => circoliSelezionati.includes(c.id)).map((c) => c.nome);
    const tipoPartitaLabel = { MASCHILE: 'maschile', FEMMINILE: 'femminile', MISTA: 'mista' }[tipoPartita] || tipoPartita;
    const fasceLeggibili = fasceOrarie
      .map((f) => `${f.oraInizio}:${f.minutoInizio}-${f.oraFine}:${f.minutoFine}`)
      .join(', ');
    const giornoLeggibile = giorno
      ? new Date(`${giorno}T00:00:00`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : giorno;
    const latoLabel = { DX: 'destra', SX: 'sinistra', INDIFFERENTE: 'indifferente' }[latoPreferito] || latoPreferito;

    return (
      <main className="pagina">
        <div className="sezione">
          <p className="messaggio-successo">✅ Richiesta inviata con successo!</p>
          <div className="riepilogo-richiesta">
            <p>
              Hai correttamente inserito una richiesta per giocare una partita <strong>{tipoPartitaLabel}</strong>{' '}
              il giorno <strong>{giornoLeggibile}</strong>, dalle <strong>{fasceLeggibili}</strong>,
              lato <strong>{latoLabel}</strong>, livello compatibile con <strong>{livelloValore}</strong>,
              nei circoli: <strong>{nomiCircoliScelti.join(', ')}</strong>.
            </p>
            <p>Ti manderò anche su WhatsApp una conferma con questo stesso riepilogo.</p>
            <p>
              Ti avviserò su WhatsApp appena si formerà la partita e, in ogni caso, un'ora prima
              dell'inizio della tua fascia di disponibilità ti aggiornerò sulla situazione.
            </p>
          </div>
          <a href="/" className="bottone-primario" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
            Clicca qui per inserire una nuova richiesta
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
            È la prima volta che utilizzi AnnaPadel: ho bisogno di verificare il tuo
            numero di telefono, quindi ti ho inviato un codice su WhatsApp al numero{' '}
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
    <>
      {/* ===================================================================
          INIZIO POP-UP "SITO IN FASE DI TEST"
          Per RIMUOVERLA in futuro: cancella questo intero blocco, dalla
          riga di apertura del commento fino alla riga "FINE POP-UP" più
          sotto - non serve toccare nient'altro nel resto del file.
      ==================================================================== */}
      {mostraAvvisoTest && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(27, 58, 99, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px', padding: '28px',
              maxWidth: '420px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚧</div>
            <h2 style={{ fontFamily: 'var(--font-titoli)', color: 'var(--colore-primario)', fontSize: '19px', margin: '0 0 10px' }}>
              Sito in fase di test
            </h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.5, margin: '0 0 20px' }}>
              Stiamo ancora perfezionando alcuni dettagli: potresti incontrare qualche imprecisione
              o funzionalità non ancora completa. Grazie per la pazienza!
            </p>
            <button
              onClick={() => setMostraAvvisoTest(false)}
              className="bottone-primario"
              style={{ margin: 0 }}
            >
              Ho capito, continua
            </button>
          </div>
        </div>
      )}
      {/* ===================================================================
          FINE POP-UP "SITO IN FASE DI TEST"
      ==================================================================== */}

      <section className="hero-anna">
        <div className="hero-contenuto">
          <div className="hero-testo">
            <h1 className="hero-titolo">Anna</h1>
            <p className="hero-sottotitolo">La tua segretaria personale per il padel</p>
            <p className="hero-tagline">Tu indica quando puoi giocare.<br />Al resto ci pensa Anna.</p>
            <button
              className="hero-cta"
              onClick={() => document.getElementById('form-disponibilita')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Trova la tua partita ↓
            </button>
          </div>
          <div className="hero-immagine-contenitore">
            <img
              src="/anna-scrivania.png"
              alt="Anna, la tua segretaria personale per il padel"
              className="hero-immagine"
            />
          </div>
        </div>
      </section>

      <main className="pagina" id="form-disponibilita">
      <div className="intestazione">
        <h1>
          <img src="/racchetta-icona.svg" alt="" width="24" height="24" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          AnnaPadel
        </h1>
        <p>Ciao! Dimmi quando puoi giocare e troverò 3 persone compatibili con te, avvisandoti subito su WhatsApp.</p>
      </div>

      {errore && <p className="messaggio-errore">{errore}</p>}

      {conflitto && (
        <div className="conflitto-box">
          <p>
            Hai già una richiesta attiva per questo giorno
            {conflitto.stato_richiesta_esistente === 'LOCKED'
              ? ' (è già stata proposta a un gruppo di 4 in attesa di conferma).'
              : '.'}
          </p>
          <div className="conflitto-azioni">
            <button className="bottone-secondario" type="button" onClick={() => setConflitto(null)}>
              Mantieni quella esistente
            </button>
            <button className="bottone-primario" type="button" onClick={annullaEReinvia} disabled={inviando}>
              Annulla e invia questa
            </button>
          </div>
        </div>
      )}

      <form onSubmit={inviaRichiesta}>
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
            <p className="testo-piccolo">Usato per inviarti conferme e proposte di partita.</p>

            {caricandoProfilo && <p className="testo-piccolo">Verifico se ti conosco già…</p>}

            {profilo && (
              <p className="profilo-riconosciuto">
                👋 Bentornato/a {profilo.nome} {profilo.cognome} (liv.{profilo.livello_playtomic.toFixed(2)})!<br />
                Ho memorizzato le tue preferenze di gioco (ma se vuoi puoi cambiarle), tu devi solo più
                inserire il giorno e la fascia oraria, al resto penso tutto io!
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
                da qui in poi (cambierà solo in base alle valutazioni ricevute dopo le partite).
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
            {profilo && (
              <p className="testo-piccolo">
                Questa è la tua preferenza attuale: puoi cambiarla in qualsiasi momento, anche dopo
                allenamenti o esperienza in campo.
              </p>
            )}
          </div>
        </section>

        <section className="sezione">
          <h2>La partita che cerchi</h2>

          <div className="campo">
            <label>Tipo di partita</label>
            <div className="gruppo-scelte">
              {[
                { valore: 'MASCHILE', etichetta: 'Maschile' },
                { valore: 'FEMMINILE', etichetta: 'Femminile' },
                { valore: 'MISTA', etichetta: 'Mista' },
              ].map((opzione) => (
                <div className="scelta-opzione" key={opzione.valore}>
                  <input
                    type="radio"
                    id={`tipo-${opzione.valore}`}
                    checked={tipoPartita === opzione.valore}
                    onChange={() => setTipoPartita(opzione.valore)}
                  />
                  <label htmlFor={`tipo-${opzione.valore}`}>{opzione.etichetta}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="campo">
            <label htmlFor="giorno">Giorno in cui vuoi giocare</label>
            <input id="giorno" type="date" value={giorno} onChange={(e) => setGiorno(e.target.value)} />
            <p className="testo-piccolo">Un solo giorno per richiesta. Per un altro giorno, invia una richiesta separata.</p>
          </div>

          <div className="campo">
            <label>Fasce orarie in cui puoi giocare</label>
            {fasceOrarie.map((fascia, indice) => (
              <div className="fascia-oraria-riga" key={indice}>
                <select value={fascia.oraInizio} onChange={(e) => aggiornaFasciaOraria(indice, 'oraInizio', e.target.value)}>
                  {ORE_DISPONIBILI.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <span>:</span>
                <select value={fascia.minutoInizio} onChange={(e) => aggiornaFasciaOraria(indice, 'minutoInizio', e.target.value)}>
                  {MINUTI_DISPONIBILI.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span>—</span>
                <select value={fascia.oraFine} onChange={(e) => aggiornaFasciaOraria(indice, 'oraFine', e.target.value)}>
                  {ORE_DISPONIBILI.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <span>:</span>
                <select value={fascia.minutoFine} onChange={(e) => aggiornaFasciaOraria(indice, 'minutoFine', e.target.value)}>
                  {MINUTI_DISPONIBILI.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {fasceOrarie.length > 1 && (
                  <button type="button" className="bottone-rimuovi" onClick={() => rimuoviFasciaOraria(indice)}>
                    Rimuovi
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="bottone-secondario" onClick={aggiungiFasciaOraria}>
              + Aggiungi un'altra fascia oraria
            </button>
          </div>
        </section>

        <section className="sezione">
          <h2>Circoli in cui puoi giocare</h2>
          {profilo && profilo.ultima_richiesta && (
            <p className="testo-piccolo">
              Abbiamo già selezionato i circoli della tua ultima richiesta: puoi togliere o aggiungere quelli che vuoi.
            </p>
          )}

          <div className="filtri-circoli">
            <input
              type="text"
              className="ricerca-circoli"
              placeholder="Cerca per nome o indirizzo…"
              value={filtroTesto}
              onChange={(e) => setFiltroTesto(e.target.value)}
            />
            {province.length > 0 && (
              <select value={filtroProvincia} onChange={(e) => setFiltroProvincia(e.target.value)}>
                <option value="">Tutte le province</option>
                {province.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>

          <div className="lista-circoli">
            {circoli.length === 0 && <p style={{ padding: 12, color: '#888' }}>Caricamento circoli…</p>}
            {circoli.length > 0 && circoliFiltrati.length === 0 && (
              <p style={{ padding: 12, color: '#888' }}>Nessun circolo trovato con questi filtri.</p>
            )}
            {circoliFiltrati.map((c) => (
              <label className="circolo-riga" key={c.id} htmlFor={`circolo-${c.id}`}>
                <input
                  type="checkbox"
                  id={`circolo-${c.id}`}
                  checked={circoliSelezionati.includes(c.id)}
                  onChange={() => toggleCircolo(c.id)}
                />
                <span>
                  <span className="circolo-nome">{c.nome}</span>
                  {c.indirizzo && (
                    c.gmaps_url ? (
                      <>
                        {' — '}
                        <a
                          href={c.gmaps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="circolo-indirizzo-link"
                        >
                          {c.indirizzo}
                        </a>
                      </>
                    ) : (
                      <span className="circolo-indirizzo"> — {c.indirizzo}</span>
                    )
                  )}
                  {c.provincia && <span className="circolo-provincia"> ({c.provincia})</span>}
                </span>
              </label>
            ))}
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
          {inviando ? 'Invio in corso…' : 'Invia la mia disponibilità'}
        </button>
      </form>
      </main>
    </>
  );
}
