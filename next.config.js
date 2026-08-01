/** @type {import('next').NextConfig} */

// DIAGNOSTICA TEMPORANEA: stampa nei log del server (non nel browser)
// i nomi delle variabili d'ambiente disponibili, per capire se
// PADEL_BACKEND_URL arriva davvero dentro il container.
console.log('=== DIAGNOSTICA FRONTEND: variabili d\'ambiente disponibili ===');
console.log('PADEL_BACKEND_URL vale:', process.env.PADEL_BACKEND_URL || '(NON IMPOSTATA)');
console.log('Nomi di tutte le variabili presenti:', Object.keys(process.env).sort());
console.log('=== FINE DIAGNOSTICA ===');

const nextConfig = {
  reactStrictMode: true,

  // Il browser chiama sempre /api/... (stesso dominio del frontend).
  // È il server Next.js, non il browser, a inoltrare la richiesta al
  // backend vero, leggendo l'indirizzo da PADEL_BACKEND_URL (variabile
  // "normale", letta ad ogni richiesta quando il server gira - niente
  // più problemi di variabili "congelate" al momento della build).
  async rewrites() {
    const backendUrl = process.env.PADEL_BACKEND_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
