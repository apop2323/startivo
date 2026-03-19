import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/kalendarz', label: 'Kalendarz' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/artykuly', label: 'Artykuły' },
  { to: '/wspolpraca', label: 'Współpraca' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(8,8,10,0.85)' : 'rgba(8,8,10,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
        transition: 'all 0.35s var(--ease-expo)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            {/* Hexagon icon */}
            <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
              <path d="M13 1L24.2 7.5V20.5L13 27L1.8 20.5V7.5L13 1Z"
                fill="var(--accent)" opacity="0.15" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M13 7L18.5 10.5V17.5L13 21L7.5 17.5V10.5L13 7Z"
                fill="var(--accent)" opacity="0.8"/>
            </svg>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Startivo
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  color: isActive(l.to) ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive(l.to) ? 'var(--accent-dim)' : 'transparent',
                  transition: 'all 0.2s var(--ease-expo)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => { if (!isActive(l.to)) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                onMouseLeave={(e) => { if (!isActive(l.to)) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/moje-starty" style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 5,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ❤ Moje starty
            </Link>
            <Link to="/dodaj" className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
              + Dodaj event
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="hide-desktop"
            onClick={() => setOpen(!open)}
            style={{
              background: 'none',
              border: '1px solid var(--bg-border)',
              borderRadius: 8,
              padding: '7px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,92,0,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--bg-border)'}
            aria-label="Menu"
          >
            {[0,1,2].map((i) => (
              <span key={i} style={{
                display: 'block',
                width: 18,
                height: 1.5,
                background: 'var(--text-secondary)',
                borderRadius: 1,
                transition: 'all 0.2s',
                transform: open && i === 0 ? 'rotate(45deg) translate(4px, 4px)' :
                           open && i === 1 ? 'scaleX(0)' :
                           open && i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="nav-overlay hide-desktop" style={{
          position: 'fixed',
          top: 62,
          left: 0, right: 0,
          background: 'rgba(8,8,10,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--bg-border)',
          zIndex: 999,
          padding: '12px 20px 24px',
        }}>
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                display: 'block',
                padding: '13px 0',
                borderBottom: '1px solid var(--bg-border)',
                fontSize: '1rem',
                fontWeight: 400,
                color: isActive(l.to) ? 'var(--accent)' : 'var(--text-primary)',
                textDecoration: 'none',
                opacity: 0,
                animation: `fadeInUp 0.35s var(--ease-expo) ${i * 0.06}s forwards`,
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/moje-starty" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>
              ❤ Moje starty
            </Link>
            <Link to="/dodaj" className="btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.9rem' }}>
              + Dodaj event
            </Link>
          </div>
        </div>
      )}

      {/* Spacer so content doesn't go under fixed nav */}
      <div style={{ height: 62 }} />
    </>
  );
}
