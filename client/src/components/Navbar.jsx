import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/kalendarz', label: 'Kalendarz' },
  { to: '/mapa',      label: 'Mapa'      },
  { to: '/artykuly',  label: 'Artykuły'  },
  { to: '/wspolpraca',label: 'Współpraca'},
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location              = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (p) =>
    location.pathname === p || location.pathname.startsWith(p + '/');

  const navBg = scrolled
    ? 'rgba(17, 19, 24, 0.92)'
    : 'rgba(17, 19, 24, 0.65)';

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          background: navBg,
          backdropFilter: `blur(${scrolled ? 28 : 20}px) saturate(180%)`,
          WebkitBackdropFilter: `blur(${scrolled ? 28 : 20}px) saturate(180%)`,
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(255,255,255,0.04)',
          boxShadow: scrolled
            ? '0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)'
            : '0 1px 0 rgba(255,255,255,0.04)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
              <path
                d="M14 2L26 8.5V21.5L14 28L2 21.5V8.5L14 2Z"
                fill="#FF5C00"
                opacity="0.15"
                stroke="#FF5C00"
                strokeWidth="1.2"
              />
              <path
                d="M14 8L19.5 11.5V18.5L14 22L8.5 18.5V11.5L14 8Z"
                fill="#FF5C00"
                opacity="0.9"
              />
            </svg>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.35rem',
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: '-0.02em',
            }}>
              Startivo
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '7px 15px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: isActive(l.to) ? '#FF5C00' : 'rgba(255,255,255,0.60)',
                  background: isActive(l.to) ? 'rgba(255,92,0,0.10)' : 'transparent',
                  border: isActive(l.to) ? '1px solid rgba(255,92,0,0.20)' : '1px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(l.to)) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(l.to)) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/moje-starty"
              style={{
                padding: '7px 15px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                transition: 'color 0.2s',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.92)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Moje starty
            </Link>
            <Link to="/dodaj" className="btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px' }}>
              + Dodaj event
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="hide-desktop"
            onClick={() => setOpen(!open)}
            style={{
              background: open ? 'rgba(255,92,0,0.10)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${open ? 'rgba(255,92,0,0.30)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10,
              padding: '8px 11px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: 18,
                  height: 1.5,
                  background: open ? '#FF5C00' : 'rgba(255,255,255,0.7)',
                  borderRadius: 1,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform:
                    open && i === 0 ? 'rotate(45deg) translate(4px, 4px)' :
                    open && i === 1 ? 'scaleX(0)' :
                    open && i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          className="nav-overlay hide-desktop"
          style={{
            position: 'fixed',
            top: 64,
            left: 0, right: 0,
            background: 'rgba(17,19,24,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            zIndex: 999,
            padding: '16px 24px 28px',
          }}
        >
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontSize: '1rem',
                fontWeight: 500,
                color: isActive(l.to) ? '#FF5C00' : 'rgba(255,255,255,0.88)',
                textDecoration: 'none',
                opacity: 0,
                animation: `fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s forwards`,
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              to="/moje-starty"
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ♥ Moje starty
            </Link>
            <Link to="/dodaj" className="btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.9rem' }}>
              + Dodaj event
            </Link>
          </div>
        </div>
      )}

      {/* Fixed nav spacer */}
      <div style={{ height: 64 }} />
    </>
  );
}
