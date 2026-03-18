import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0C0C0E', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#FF5C00', marginBottom: 8 }}>
              Startivo
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Jedno miejsce. Wszystkie starty.<br />
              Największy agregator wydarzeń sportowych w Polsce.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.88)', fontFamily: 'DM Sans', fontWeight: 500, marginBottom: 12, fontSize: '0.9rem' }}>
              Nawigacja
            </h4>
            {[
              { to: '/', label: 'Strona główna' },
              { to: '/kalendarz', label: 'Kalendarz' },
              { to: '/mapa', label: 'Mapa wydarzeń' },
              { to: '/dodaj', label: 'Dodaj event' },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8, fontSize: '0.9rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#FF5C00'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Sports */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.88)', fontFamily: 'DM Sans', fontWeight: 500, marginBottom: 12, fontSize: '0.9rem' }}>
              Dyscypliny
            </h4>
            {[
              { label: '🏃 Bieganie' },
              { label: '💪 OCR / Przeszkody' },
              { label: '🏋️ Hyrox' },
              { label: '🏊 Triathlon' },
              { label: '🚴 Kolarstwo' },
              { label: '⛰️ Trail Running' },
            ].map((s) => (
              <div key={s.label} style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontSize: '0.9rem' }}>
                {s.label}
              </div>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.88)', fontFamily: 'DM Sans', fontWeight: 500, marginBottom: 12, fontSize: '0.9rem' }}>
              Informacje
            </h4>
            {[
              { to: '/wspolpraca', label: 'Współpraca' },
              { to: '/polityka-prywatnosci', label: 'Polityka prywatności' },
              { to: '/moje-starty', label: 'Moje starty' },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ display: 'block', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8, fontSize: '0.9rem', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#FF5C00'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 32, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} Startivo. Wszelkie prawa zastrzeżone.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            Made for active Poland 🇵🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
