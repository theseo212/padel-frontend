/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Il browser chiama sempre /api/... (stesso dominio del frontend).
  // È il server Next.js, non il browser, a inoltrare la richiesta al
  // backend vero, leggendo l'indirizzo da API_URL (variabile "normale",
  // letta ad ogni richiesta quando il server gira - niente più problemi
  // di variabili "congelate" al momento della build).
  async rewrites() {
    const backendUrl = process.env.API_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
