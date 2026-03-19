import React from 'react';
import { Link } from 'react-router-dom';
import { SPORT_TYPES } from '../utils/sports';
import { SportIcon } from './SportIcons';

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.45)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        textDecoration: 'none',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,92,0,0.12)';
        e.currentTarget.style.borderColor = 'rgba(255,92,0,0.30)';
        e.currentTarget.style.color = '#FF5C00';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,92,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '2px 2px 6px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.03)';
      }}
    >
      {children}
    </a>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        color: 'rgba(255,255,255,0.45)',
        fontSize: '0.875rem',
        marginBottom: 11,
        textDecoration: 'none',
        transition: 'color 0.2s',
        fontWeight: 400,
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#FF5C00'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
    >
      {children}
    </Link>
  );
}

const HEADING_STYLE = {
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.25)',
  fontSize: '0.70rem',
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  marginBottom: 18,
};

export default function Footer() {
  return (
    <footer style={{
      background: '#0D0F14',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 48,
        }}>

          {/* ── Col 1: Brand + socials ──────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <svg width="24" height="26" viewBox="0 0 28 30" fill="none">
                <path d="M14 2L26 8.5V21.5L14 28L2 21.5V8.5L14 2Z" fill="#FF5C00" opacity="0.15" stroke="#FF5C00" strokeWidth="1.2"/>
                <path d="M14 8L19.5 11.5V18.5L14 22L8.5 18.5V11.5L14 8Z" fill="#FF5C00" opacity="0.9"/>
              </svg>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.02em' }}>
                Startivo
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>
              Jedno miejsce. Wszystkie starty.<br/>
              Największy agregator wydarzeń sportowych w Polsce.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://strava.com" label="Strava">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* ── Col 2: Nawigacja ─────────────────────────────────────────── */}
          <div>
            <h4 style={HEADING_STYLE}>Nawigacja</h4>
            <FooterLink to="/">Strona główna</FooterLink>
            <FooterLink to="/kalendarz">Kalendarz startów</FooterLink>
            <FooterLink to="/mapa">Mapa wydarzeń</FooterLink>
            <FooterLink to="/artykuly">Artykuły</FooterLink>
            <FooterLink to="/dodaj">Dodaj event</FooterLink>
          </div>

          {/* ── Col 3: Dyscypliny ────────────────────────────────────────── */}
          <div>
            <h4 style={HEADING_STYLE}>Dyscypliny</h4>
            {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport]) => (
              <Link
                key={key}
                to={`/kalendarz?sport_type=${key}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  marginBottom: 11,
                  textDecoration: 'none',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = sport.color}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              >
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: sport.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${sport.color}80`,
                }}/>
                {sport.label}
              </Link>
            ))}
          </div>

          {/* ── Col 4: Informacje ────────────────────────────────────────── */}
          <div>
            <h4 style={HEADING_STYLE}>Informacje</h4>
            <FooterLink to="/wspolpraca">Współpraca</FooterLink>
            <FooterLink to="/moje-starty">Moje starty</FooterLink>
            <FooterLink to="/polityka-prywatnosci">Polityka prywatności</FooterLink>
            <FooterLink to="/admin">Panel administratora</FooterLink>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Startivo. Wszelkie prawa zastrzeżone.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.78rem' }}>
            Made for active Poland 🇵🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
