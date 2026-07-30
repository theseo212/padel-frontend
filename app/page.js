'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const LIVELLI_WANSPORT = ['C4', 'C3', 'C2', 'C1', 'B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1'];

function nuovaFasciaOraria() {
  return { inizio: '18:00', fine: '20:00' };
}

export default function Pagina() {
  // --- dati anagrafici (usati solo alla primissima richiesta) ---
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [latoPreferito, setLatoPreferito] = useState('INDIFFERENTE');
  const [livelloScala, setLivelloScala] = useState('PLAYTOMIC');
  const [livelloValore, setLivelloValore] = useState('');

  // --- dati della richiesta specifica ---
  const [tipoPartita, setTipoPartita] = useState('MISTA');
  const [giorno, setGiorno] = useState('');
  const [fasceOrarie, setFasceOrarie] = useState([nuovaFasciaOraria()]);
  const [circoli, setCircoli] = useState([]);
  const [circoliSelezionati, setCircoliSelezionati] = useState([]);

  // --- stato della UI ---
  const [schermata, setSchermata] = useState('form'); // form | otp | successo
  const [errore, setErrore] = useState(null);
  const [conflitto, setConflitto] = useState(null);
  const [inviando, setInviando] = useState(false);
  const [codiceOtp, setCodiceOtp] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/circoli?solo_attivi=true`)
      .then((r) => r.json())
      .then((dati) => setCircoli(dati))
      .catch(() => setErrore('Non riesco a caricare la lista dei circoli. Riprova più tardi.'));
  }, []);

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
    return {
      nome,
      cognome,
      whatsapp_numero: whatsapp,
      livello_scala: livelloScala,
      livello_valore: livelloValore,
      lato_preferito: latoPreferito,
      tipo_partita: tipoPartita,
      giorno,
      fasce_orarie: fasceOrarie.map((f) => [f.inizio, f.fine]),
      circoli_ids: circoliSelezionati,
    };
  }

  function validaForm() {
    if (!nome.trim() || !cognome.trim()) return 'Inserisci nome e cognome.';
    if (!whatsapp.trim()) return 'Inserisci il tuo numero WhatsApp (formato internazionale, es. +39...).';
    if (!livelloValore.trim()) return 'Inserisci il tuo livello di gioco.';
    if (livelloScala === 'PLAYTOMIC') {
      const valoreNumerico = parseFloat(livelloValore);
      if (isNaN(valoreNumerico) || valoreNumerico < 0 || valoreNumerico > 7) {
        return 'Il livello Playtomic deve essere un numero da 0 a 7 (es. 3.5).';
      }
    }
    if (!giorno) return 'Scegli il giorno in cui vuoi giocare.';
    if (fasceOrarie.length === 0) return 'Inserisci almeno una fascia oraria.';
    for (const f of fasceOrarie) {
      if (f.fine <= f.inizio) return 'In ogni fascia oraria, l\'orario di fine deve essere dopo quello di inizio.';
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
      setErrore(erroreValidazione);
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
        setErrore(messaggio);
        return;
      }

      if (dati.richiede_validazione_otp) {
        setSchermata('otp');
      } else {
        setSchermata('successo');
      }
    } catch {
      setErrore('Non riesco a contattare il server. Controlla la connessione e riprova.');
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
      setErrore('Non sono riuscito ad annullare la richiesta precedente. Riprova.');
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
        body: JSON.stringify({ whatsapp_numero: whatsapp, codice_otp: codiceOtp }),
      });
      const dati = await risposta.json();

      if (!risposta.ok) {
        setErrore(dati.detail || 'Codice non valido, riprova.');
        return;
      }
      setSchermata('successo');
    } catch {
      setErrore('Non riesco a contattare il server. Controlla la connessione e riprova.');
    } finally {
      setInviando(false);
    }
  }

  if (schermata === 'successo') {
    return (
      <main className="pagina">
        <div className="sezione">
          <p className="messaggio-successo">
            ✅ Fatto! Riceverai una conferma su WhatsApp con il riepilogo della tua richiesta.
            Ti avviseremo appena troveremo compagni compatibili con te.
          </p>
        </div>
      </main>
    );
  }

  if (schermata === 'otp') {
    return (
      <main className="pagina">
        <div className="intestazione">
          <h1>Verifica il tuo numero</h1>
          <p>Ti abbiamo inviato un codice via WhatsApp al numero {whatsapp}.</p>
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
    <main className="pagina">
      <div className="intestazione">
        <h1>Trova la tua prossima partita di padel</h1>
        <p>Inserisci la tua disponibilità: ti avviseremo su WhatsApp appena troveremo 3 compagni compatibili con te.</p>
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
          <h2>I tuoi dati</h2>
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="cognome">Cognome</label>
            <input id="cognome" type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="whatsapp">Numero WhatsApp</label>
            <input
              id="whatsapp"
              type="tel"
              placeholder="+39 333 1234567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <p className="testo-piccolo">Usato per inviarti conferme e proposte di partita.</p>
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
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="7"
                  placeholder="Es. 3.5"
                  value={livelloValore}
                  onChange={(e) => setLivelloValore(e.target.value)}
                />
                <p className="testo-piccolo">Inserisci un numero da 0 a 7 (es. 3.5).</p>
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

          <div className="campo">
            <label>Lato di gioco preferito</label>
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
                <input
                  type="time"
                  step="1800"
                  value={fascia.inizio}
                  onChange={(e) => aggiornaFasciaOraria(indice, 'inizio', e.target.value)}
                />
                <span>—</span>
                <input
                  type="time"
                  step="1800"
                  value={fascia.fine}
                  onChange={(e) => aggiornaFasciaOraria(indice, 'fine', e.target.value)}
                />
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
          <div className="lista-circoli">
            {circoli.length === 0 && <p style={{ padding: 12, color: '#888' }}>Caricamento circoli…</p>}
            {circoli.map((c) => (
              <label className="circolo-riga" key={c.id} htmlFor={`circolo-${c.id}`}>
                <input
                  type="checkbox"
                  id={`circolo-${c.id}`}
                  checked={circoliSelezionati.includes(c.id)}
                  onChange={() => toggleCircolo(c.id)}
                />
                <span>
                  <span className="circolo-nome">{c.nome}</span>
                  {c.indirizzo && <span className="circolo-indirizzo"> — {c.indirizzo}</span>}
                </span>
              </label>
            ))}
          </div>
        </section>

        <button className="bottone-primario" type="submit" disabled={inviando}>
          {inviando ? 'Invio in corso…' : 'Invia la mia disponibilità'}
        </button>
      </form>
    </main>
  );
}
