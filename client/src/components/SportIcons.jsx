import React from 'react';

// Minimalistyczne, monolinijne SVG ikony — styl: Nike Training
export const SportIcons = {
  running: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="3.5" r="1.5"/>
      <path d="M9 8.5l3.5 2 1.5-3 3.5 1"/>
      <path d="M8.5 13l2 5.5"/>
      <path d="M14.5 10l1 5.5-3.5 2"/>
    </svg>
  ),
  ocr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="2" width="2.5" height="20" rx="1.25"/>
      <path d="M4 7l6 4"/>
      <path d="M4 17l6-4"/>
      <path d="M20 7l-6 4"/>
      <path d="M20 17l-6-4"/>
    </svg>
  ),
  hyrox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12h12"/>
      <path d="M4 9h2.5v6H4z"/>
      <path d="M17.5 9H20v6h-2.5z"/>
      <rect x="2" y="10.5" width="2" height="3" rx="1"/>
      <rect x="20" y="10.5" width="2" height="3" rx="1"/>
    </svg>
  ),
  triathlon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"/>
      <circle cx="7" cy="17" r="3.5"/>
      <circle cx="17" cy="17" r="3.5"/>
      <path d="M10.5 17h3"/>
      <path d="M12 13.5l2-6"/>
    </svg>
  ),
  cycling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="16" r="4"/>
      <circle cx="18" cy="16" r="4"/>
      <path d="M6 16l5.5-10h3.5L18 16"/>
      <path d="M12 6l3.5 10"/>
    </svg>
  ),
  trail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21l6-11 4 6 4-9 6 14z"/>
      <circle cx="18.5" cy="5.5" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
};

export function SportIcon({ sport, size = 28, color = 'currentColor' }) {
  const icon = SportIcons[sport] || SportIcons.other;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}
