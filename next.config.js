/** @type {import('next').NextConfig} */

// NOTA IMPORTANTE: per un problema non ancora chiarito sul lato Railway
// (la variabile d'ambiente non arriva al container di questo servizio,
// nonostante risulti salvata correttamente nell'interfaccia - verificato
// sia nei log di avvio sia nella Console diretta del container), usiamo
// temporaneamente l'indirizzo del backend scritto qui come valore fisso.
// Se in futuro il problema di Railway si risolve, si può tornare a
// leggerlo da process.env.PADEL_BACKEND_URL (il codice lo prova comunque
// per primo, quindi basterà che la variabile inizi a funzionare).
const BACKEND_URL_DI_RISERVA = 'https://web-production-3d15f.up.railway.app';

console.log('=== DIAGNOSTICA FRONTEND: variabili d\'ambiente disponibili ===');
console.log('PADEL_BACKEND_URL vale:', process.env.PADEL_BACKEND_URL || '(NON IMPOSTATA, uso il valore di riserva)');
console.log('=== FINE DIAGNOSTICA ===');

const nextConfig = {
  reactStrictMode: true,

  // Il circolo Brangi si chiama ora "Brangis": la pagina vive su /brangis,
  // e il vecchio indirizzo /brangi (e le sue sottopagine) rimanda lì in
  // modo permanente, così i link già condivisi continuano a funzionare.
  // Le chiamate al backend (/api/brangi/...) NON cambiano.
  async redirects() {
    return [
      { source: '/brangi', destination: '/brangis', permanent: true },
      { source: '/brangi/:path*', destination: '/brangis/:path*', permanent: true },
    ];
  },

  async rewrites() {
    const backendUrl = process.env.PADEL_BACKEND_URL || BACKEND_URL_DI_RISERVA;
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
