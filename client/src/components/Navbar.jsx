import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/kalendarz', label: 'Kalendarz' },
    { to: '/mapa', label: 'Mapa' },
    { to: '/wspolpraca', label: 'Współpraca' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ background: 'rgba(12,12,14,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black" style={{ fontFamily: 'Syne', color: '#FF5C00' }}>
              Startivo
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: isActive(link.to) ? '#FF5C00' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'DM Sans',
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = '#FF5C00'}
                onMouseLeave={(e) => e.target.style.color = isActive(link.to) ? '#FF5C00' : 'rgba(255,255,255,0.7)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/moje-starty" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>
              ❤️ Moje starty
            </Link>
            <Link
              to="/dodaj"
              style={{
                background: '#FF5C00',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '100px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.85'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              + Dodaj event
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div style={{ width: 22, height: 2, background: 'currentColor', marginBottom: 5, borderRadius: 1 }}></div>
            <div style={{ width: 22, height: 2, background: 'currentColor', marginBottom: 5, borderRadius: 1 }}></div>
            <div style={{ width: 22, height: 2, background: 'currentColor', borderRadius: 1 }}></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 0',
                  color: isActive(link.to) ? '#FF5C00' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontFamily: 'DM Sans',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/moje-starty" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
              ❤️ Moje starty
            </Link>
            <Link
              to="/dodaj"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'inline-block',
                marginTop: 8,
                background: '#FF5C00',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '100px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              + Dodaj event
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
