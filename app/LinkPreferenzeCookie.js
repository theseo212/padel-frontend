'use client';

export default function LinkPreferenzeCookie() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('riapri-preferenze-cookie'))}
      style={{
        background: 'none', border: 'none', color: '#999', textDecoration: 'underline',
        cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit',
      }}
    >
      Preferenze cookie
    </button>
  );
}
