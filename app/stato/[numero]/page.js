'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_URL = '/api';

export default function StatoRichieste() {
  const { numero } = useParams();

  const [nome, setNome] = useState('');
  const [richieste, setRichieste] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);
  const [annullandoId, setAnnullandoId] = useState(null);

  async function caricaStato() {
    setCaricamento(true);
    setErrore(null);
    try {
      // Il link nel messaggio WhatsApp non contiene il "+" (evita problemi
      // di interpretazione dell'URL) - lo rimettiamo qui prima di
      // interrogare il backend, che si aspetta il numero in formato
      // internazionale completo (es. +393331234567).
      const numeroCompleto = numero.startsWith('+') ? numero : `+${numero}`;
      const risposta = await fetch(`${API_URL}/stato-richieste/${numeroCompleto}`);
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}));
        throw new Error(dati.detail || 'Non riesco a trovare le tue richieste.');
      }
      const dati = await risposta.json();
      setNome(dati.nome);
      setRichieste(dati.richieste);
    } catch (e) {
      setErrore(e.message);
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    if (numero) caricaStato();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numero]);

  async function annullaRichiesta(richiestaId) {
    if (!confirm('Sei sicuro di voler annullare questa richiesta?')) return;

    setAnnullandoId(richiestaId);
    try {
      const risposta = await fetch(`${API_URL}/richieste/${richiestaId}/annulla`, { method: 'POST' });
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}));
        throw new Error(dati.detail || 'Non sono riuscito ad annullare la richiesta.');
      }
      await caricaStato(); // ricarica la lista aggiornata
    } catch (e) {
      alert(e.message);
    } finally {
      setAnnullandoId(null);
    }
  }

  const coloreProbabilita = {
    'Ottime': '#1a7a3a',
    'Molto buone': '#4a9d4f',
    'Buone': '#7CB342',
    'Sufficienti': '#c99a1f',
    'Scarse': '#a3231f',
  };

  return (
    <main className="pagina">
      <div className="intestazione">
        <img src="/anna-avatar.png" alt="Anna" className="avatar-pagina" />
        {nome ? (
          <h1>Ciao {nome}!</h1>
        ) : (
          <h1>Le tue richieste</h1>
        )}
        <p>Ecco il riassunto delle richieste per giocare che mi hai fatto.</p>
      </div>

      {caricamento && <p className="testo-piccolo">Caricamento…</p>}

      {errore && <p className="messaggio-errore">{errore}</p>}

      {!caricamento && !errore && richieste.length === 0 && (
        <div className="sezione">
          <p style={{ margin: 0, color: '#666' }}>
            Non hai nessuna richiesta attiva al momento. Puoi inserirne una nuova dalla home.
          </p>
        </div>
      )}

      {!caricamento && !errore && richieste.length > 0 && (
        <div className="sezione" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px 6px' }}>Giorno</th>
                <th style={{ padding: '8px 6px' }}>Fascia oraria</th>
                <th style={{ padding: '8px 6px' }}>Tipo</th>
                <th style={{ padding: '8px 6px' }}>Persone potenzialmente compatibili</th>
                <th style={{ padding: '8px 6px' }}>Probabilità</th>
                <th style={{ padding: '8px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {richieste.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 6px' }}>{r.giorno}</td>
                  <td style={{ padding: '10px 6px' }}>{r.fasce_orarie}</td>
                  <td style={{ padding: '10px 6px' }}>{r.tipo_partita}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'center' }}>{r.persone_compatibili}</td>
                  <td style={{ padding: '10px 6px', fontWeight: 600, color: coloreProbabilita[r.probabilita] || '#444' }}>
                    {r.probabilita}
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    <button
                      onClick={() => annullaRichiesta(r.id)}
                      disabled={annullandoId === r.id}
                      style={{
                        background: '#fbdcdc', color: '#a3231f', border: 'none',
                        borderRadius: '6px', padding: '7px 12px', fontSize: '13px',
                        fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {annullandoId === r.id ? 'Annullo…' : 'Annulla la richiesta'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
