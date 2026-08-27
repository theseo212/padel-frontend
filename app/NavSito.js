'use client';

import { usePathname } from 'next/navigation';

export default function NavSito() {
  const pathname = usePathname();
  const inPalavillage = pathname?.startsWith('/palavillage');

  const linkHome = inPalavillage ? '/palavillage' : '/';
  const linkFaq = inPalavillage ? '/palavillage/faq' : '/faq';

  return (
    <nav className="nav-sito">
      <a href={linkHome} className="nav-logo">
        <img src="/racchetta-icona.svg" alt="" width="22" height="22" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
        {inPalavillage ? 'Palavillage' : 'AnnaPadel'}
      </a>
      <div className="nav-link-gruppo">
        <a href={linkFaq}>FAQ</a>
        <a href="/contatti">Contatti</a>
      </div>
    </nav>
  );
}
