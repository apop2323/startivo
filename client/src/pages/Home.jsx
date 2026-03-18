import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS } from '../utils/sports';

function AnimatedStat({ value, label }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1500;
        const step = value / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, value);
          setDisplay(Math.floor(current));
          if (current >= value) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: '#FF5C00', lineHeight: 1 }}>
        {display.toLocaleString('pl-PL')}+
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [voivodeshipFilter, setVoivodeshipFilter] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({ total_events: 0, total_regions: 0, sport_categories: 0, events_this_month: 0 });
  const [sportCounts, setSportCounts] = useState({});
  const [geoBanner, setGeoBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/events/featured'),
      api.get('/stats'),
      api.get('/stats/by-sport'),
    ]).then(([featured, statsData, bySport]) => {
      setFeaturedEvents(featured);
      setStats(statsData);
      setSportCounts(bySport);
    }).catch(console.error);

    // Geolocation banner after 3s
    const dismissed = sessionStorage.getItem('startivo_geo_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
              );
              const data = await res.json();
              const city = data.address.city || data.address.town || data.address.village;
              const state = data.address.state;
              if (city) {
                const eventsRes = await api.get(`/events?voivodeship=${encodeURIComponent(state)}&limit=1`);
                setGeoBanner({ city, count: eventsRes.total, state });
              }
            } catch (e) { /* ignore */ }
          }, () => { /* ignore permission denied */ });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sportFilter) params.set('sport_type', sportFilter);
    if (voivodeshipFilter) params.set('voivodeship', voivodeshipFilter);
    navigate(`/kalendarz?${params.toString()}`);
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('startivo_geo_dismissed', '1');
  };

  return (
    <div>
      {/* Geo banner */}
      {geoBanner && !bannerDismissed && (
        <div style={{
          background: '#1C1C1F',
          borderBottom: '1px solid rgba(255,92,0,0.3)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            📍 Jesteś w okolicach <strong style={{ color: '#FF5C00' }}>{geoBanner.city}</strong>?
            Mamy <strong style={{ color: '#FF5C00' }}>{geoBanner.count}</strong> startów w Twoim regionie →
          </span>
          <button
            onClick={() => navigate(`/kalendarz?voivodeship=${encodeURIComponent(geoBanner.state)}`)}
            style={{ background: '#FF5C00', color: 'white', border: 'none', borderRadius: 100, padding: '4px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Zobacz
          </button>
          <button
            onClick={dismissBanner}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse at top, rgba(255,92,0,0.08) 0%, transparent 60%), #0C0C0E',
        padding: '80px 16px 64px',
        textAlign: 'center',
      }}>
        <div className="max-w-4xl mx-auto">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,92,0,0.1)',
            border: '1px solid rgba(255,92,0,0.2)',
            borderRadius: 100,
            padding: '6px 16px',
            marginBottom: 24,
          }}>
            <span style={{ color: '#FF5C00', fontSize: '0.8rem', fontWeight: 500 }}>🏅 Platforma #1 dla aktywnych w Polsce</span>
          </div>

          <h1 style={{
            fontFamily: 'Syne',
            fontWeight: 800,
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            lineHeight: 1.1,
            marginBottom: 16,
            color: 'rgba(255,255,255,0.88)',
          }}>
            Jedno miejsce.<br />
            <span className="gradient-text">Wszystkie starty.</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.6,
            fontWeight: 300,
          }}>
            Biegi, triatlony, OCR, Hyrox i więcej — wszystkie polskie zawody sportowe w jednym miejscu.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{
            background: '#141416',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 8,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            maxWidth: 700,
            margin: '0 auto',
          }}>
            <input
              type="text"
              placeholder="Szukaj wydarzeń, miast, dyscyplin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 2,
                minWidth: 200,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255,255,255,0.88)',
                fontSize: '0.95rem',
                padding: '8px 12px',
                fontFamily: 'DM Sans',
              }}
            />
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              style={{
                flex: 1,
                minWidth: 140,
                background: '#1C1C1F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.7)',
                padding: '8px 12px',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'DM Sans',
              }}
            >
              <option value="">Dyscyplina</option>
              {Object.entries(SPORT_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.emoji} {val.label}</option>
              ))}
            </select>
            <select
              value={voivodeshipFilter}
              onChange={(e) => setVoivodeshipFilter(e.target.value)}
              style={{
                flex: 1,
                minWidth: 140,
                background: '#1C1C1F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.7)',
                padding: '8px 12px',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'DM Sans',
              }}
            >
              <option value="">Województwo</option>
              {VOIVODESHIPS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                background: '#FF5C00',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontFamily: 'DM Sans',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Szukaj →
            </button>
          </form>
        </div>
      </section>

      {/* Animated Stats */}
      <section style={{ background: '#1C1C1F', padding: '40px 16px' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedStat value={stats.total_events || 150} label="Wydarzeń" />
          <AnimatedStat value={stats.total_regions || 16} label="Województw" />
          <AnimatedStat value={stats.sport_categories || 6} label="Dyscyplin" />
          <AnimatedStat value={stats.events_this_month || 12} label="Startów w tym miesiącu" />
        </div>
      </section>

      {/* Category cards */}
      <section style={{ padding: '48px 0 32px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', marginBottom: 24, color: 'rgba(255,255,255,0.88)' }}>
            Przeglądaj dyscypliny
          </h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {Object.entries(SPORT_TYPES).map(([key, sport]) => (
              <button
                key={key}
                onClick={() => navigate(`/kalendarz?sport_type=${key}`)}
                style={{
                  flex: '0 0 auto',
                  width: 140,
                  background: '#141416',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderLeft: `3px solid ${sport.color}`,
                  borderRadius: 14,
                  padding: '16px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: 'DM Sans',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = sport.color}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderLeftColor = sport.color; }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{sport.emoji}</div>
                <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: '0.9rem', marginBottom: 4 }}>
                  {sport.label}
                </div>
                <div style={{ color: sport.color, fontSize: '0.8rem' }}>
                  {sportCounts[key] || 0} startów
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section style={{ padding: '32px 0 48px', background: '#1C1C1F' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: 'rgba(255,255,255,0.88)' }}>
                ⭐ Wyróżnione starty
              </h2>
              <button
                onClick={() => navigate('/kalendarz')}
                style={{ color: '#FF5C00', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '0.9rem' }}
              >
                Zobacz wszystkie →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
