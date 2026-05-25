import React from 'react';

/**
 * Carré noir avec monogramme MH.
 * Si un PNG logo existe dans /assets/mh-logo.png, il est affiché.
 * Sinon fallback sur le texte "MH" en Geist.
 */
export default function BrandLogo({ size = 32 }) {
  const radius = Math.round(size * 0.22);

  return (
    <div
      className="bg-mh-noir flex items-center justify-center shrink-0 overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {/* Essaie d'afficher le PNG logo ; si absent, fallback texte */}
      <img
        src="/assets/mh-logo.png"
        alt="MH"
        style={{ width: size * 0.72, height: size * 0.72, objectFit: 'contain' }}
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
      />
      <span
        style={{
          display: 'none',
          color: '#fff',
          fontFamily: 'Geist, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: size * 0.36,
          letterSpacing: '-0.02em',
        }}
      >
        MH
      </span>
    </div>
  );
}
