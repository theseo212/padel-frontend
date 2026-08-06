'use client';

import { useState } from 'react';

const API_URL = '/api';

export default function Contatti() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [inviando, setInviando] = useState(false);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState(null);

  async function inviaMessaggio(evento) {
    evento.preventDefault();
    setErrore(null);

    if (!nome.trim() || !email.trim() || !telefono.trim() || !messaggio.trim()) {
      setErrore('Compila tutti i campi prima di inviare.');
      return;
    }

    setInviando(true);
    try {
      const risposta = await fetch(`${API_URL}/contatti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefono, messaggio }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        const testoErrore = typeof dati.detail === 'string' ? dati.detail : 'Si è verificato un errore, riprova.';
        setErrore(testoErrore);
        return;
      }

      setInviato(true);
    } catch {
      setErrore('Non riesco a contattare il server. Controlla la connessione e riprova.');
    } finally {
      setInviando(false);
    }
  }

  if (inviato) {
    return (
      <main className="pagina">
        <div className="sezione">
          <p className="messaggio-successo">✅ Grazie! Ho ricevuto il tuo messaggio, ti risponderò il prima possibile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pagina">
      <div className="intestazione">
        <img src="/anna-avatar.png" alt="Anna" className="avatar-pagina" />
        <h1>Contattaci</h1>
        <p>Per qualsiasi domanda, richiesta o segnalazione, compila il form: ti risponderò il prima possibile.</p>
      </div>

      {errore && <p className="messaggio-errore">{errore}</p>}

      <form className="sezione" onSubmit={inviaMessaggio}>
        <div className="campo">
          <label htmlFor="nome">Nome</label>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="email">La tua email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="testo-piccolo">Ti risponderemo direttamente a questo indirizzo.</p>
        </div>
        <div className="campo">
          <label htmlFor="telefono">Numero di telefono</label>
          <input id="telefono" type="tel" placeholder="333 1234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="messaggio">Messaggio</label>
          <textarea
            id="messaggio"
            rows={6}
            value={messaggio}
            onChange={(e) => setMessaggio(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', border: '1px solid #d5d7db',
              borderRadius: '8px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical',
            }}
          />
        </div>
        <button className="bottone-primario" type="submit" disabled={inviando}>
          {inviando ? 'Invio in corso…' : 'Invia messaggio'}
        </button>
      </form>
    </main>
  );
}
