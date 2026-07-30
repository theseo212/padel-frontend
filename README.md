# Frontend — Form pubblico (Step 01)

Il form web che i giocatori useranno per inserire la loro disponibilità.
Costruito con Next.js. Stile volutamente neutro e pulito: quando la
grafica definitiva sarà pronta, la applicheremo sopra questa struttura
già funzionante, senza dover toccare la logica.

## Cosa fa

- Raccoglie tutti i dati previsti dallo Step 01: nome, cognome, WhatsApp,
  livello (Playtomic o Wansport), lato di gioco, tipo di partita, giorno,
  una o più fasce orarie, e i circoli scelti (checkbox, ordinati
  alfabeticamente, solo quelli attivi)
- Gestisce la validazione OTP dopo il primo invio
- Gestisce il caso di richiesta duplicata per lo stesso giorno (HTTP 409
  dal backend), mostrando le due azioni "Mantieni quella esistente" /
  "Annulla e invia questa"
- Messaggi di errore chiari per ogni caso (campi mancanti, orari non
  validi, server irraggiungibile, ecc.)

## Come avviarlo in locale

1. `npm install`
2. Copia `.env.local.example` in `.env.local` e verifica che
   `NEXT_PUBLIC_API_URL` punti al backend (es. `http://127.0.0.1:8000`)
3. Assicurati che il backend sia già avviato (vedi il README del progetto
   `padel-system`) e che abbia almeno un circolo attivo inserito
4. `npm run dev`
5. Apri `http://localhost:3000`

## Nota tecnica importante: CORS

Il frontend e il backend girano su indirizzi/porte diverse (es. porta
3000 il frontend, porta 8000 il backend). Per questo motivo, il backend
FastAPI ora ha il middleware CORS configurato (`app/main.py`, progetto
`padel-system`) per accettare richieste da altre origini. **In produzione,
ricordarsi di restringere `allow_origins` all'indirizzo reale del sito**
(oggi è impostato su `"*"`, va bene solo per lo sviluppo locale).

## Test effettuati

- Build di produzione (`npm run build`) completata senza errori
- Pagina caricata correttamente (HTTP 200), con tutti gli elementi del
  form presenti nell'HTML
- Richiesta CORS accettata correttamente dal backend (verificato con
  header `Origin` simulato)
- Invio di una richiesta reale al backend, con risposta corretta
  (creazione utente, OTP generato)
- Simulazione del caso di conflitto (409): il backend restituisce
  esattamente i dati che il frontend usa per mostrare le due azioni

## Cosa NON è ancora incluso (di proposito)

- Nessuno stile grafico definitivo — in attesa della grafica che stai
  preparando tu
- Nessun deploy: da fare più avanti, insieme al deploy del backend su Railway
