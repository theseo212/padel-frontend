'use client';

import { useState, useEffect } from 'react';

const CHIAVE_LOCALSTORAGE = 'annapadel-consenso-cookie';

function aggiornaConsensoGoogle(analyticsConsentito) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: analyticsConsentito ? 'granted' : 'denied',
    // Già predisposto per quando AdSense verrà approvato: per ora
    // restano sempre "denied", nessuno script pubblicitario è ancora
    // attivo sul sito.
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

export default function GestioneConsenso() {
  const [mostraBanner, setMostraBanner] = useState(false);
  const [mostraPersonalizza, setMostraPersonalizza] = useState(false);
  const [analyticsAttivo, setAnalyticsAttivo] = useState(true);

  useEffect(() => {
    const scelta = localStorage.getItem(CHIAVE_LOCALSTORAGE);
    if (scelta) {
      // Scelta già fatta in passato: applichiamo subito senza mostrare
      // di nuovo il banner.
      const dati = JSON.parse(scelta);
      aggiornaConsensoGoogle(dati.analytics);
    } else {
      // Prima visita: nessuna scelta salvata, mostriamo il banner.
      setMostraBanner(true);
    }

    // Il link "Preferenze cookie" nel footer permette di riaprire questo
    // banner in qualsiasi momento, anche dopo aver già scelto.
    function riapri() {
      setMostraBanner(true);
      setMostraPersonalizza(false);
    }
    window.addEventListener('riapri-preferenze-cookie', riapri);
    return () => window.removeEventListener('riapri-preferenze-cookie', riapri);
  }, []);

  function salvaScelta(analyticsConsentito) {
    localStorage.setItem(CHIAVE_LOCALSTORAGE, JSON.stringify({ analytics: analyticsConsentito }));
    aggiornaConsensoGoogle(analyticsConsentito);
    setMostraBanner(false);
    setMostraPersonalizza(false);
  }

  if (!mostraBanner) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000,
        background: 'white', borderTop: '1px solid #e0e0e0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.12)', padding: '20px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p style={{ fontSize: '14px', color: '#333', margin: '0 0 14px', lineHeight: 1.5 }}>
          Usiamo cookie tecnici (sempre attivi, necessari al funzionamento del sito) e, solo con il
          tuo consenso, cookie statistici (Google Analytics) per capire come viene usato il sito.
          Puoi cambiare idea in qualsiasi momento dal link "Preferenze cookie" nel footer.
        </p>

        {mostraPersonalizza && (
          <div style={{ marginBottom: '14px', padding: '12px', background: '#f7f8f5', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444' }}>
              <input
                type="checkbox"
                checked={analyticsAttivo}
                onChange={(e) => setAnalyticsAttivo(e.target.checked)}
              />
              Cookie statistici (Google Analytics)
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => salvaScelta(true)} className="bottone-primario" style={{ width: 'auto', margin: 0, flex: '1 1 auto' }}>
            Accetta tutti
          </button>
          <button onClick={() => salvaScelta(false)} className="bottone-secondario" style={{ flex: '1 1 auto' }}>
            Rifiuta non necessari
          </button>
          {!mostraPersonalizza ? (
            <button onClick={() => setMostraPersonalizza(true)} className="bottone-secondario" style={{ flex: '1 1 auto' }}>
              Personalizza
            </button>
          ) : (
            <button onClick={() => salvaScelta(analyticsAttivo)} className="bottone-secondario" style={{ flex: '1 1 auto' }}>
              Salva preferenze
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
