import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';
import PolandMapSVG from '../components/PolandMapSVG';
import { SkeletonCard, SkeletonArticleCard } from '../components/Skeleton';
import { SportIcon } from '../components/SportIcons';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS, getSportInfo } from '../utils/sports';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// ─── Animated stat counter ─────────────────────────────────────────────────────
function StatCounter({ value, label, suffix = '+' }) {
  const [display, setDisplay] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400, steps = 60;
        const inc = value / steps;
        let cur = 0, step = 0;
        const t = setInterval(() => {
          step++;
          cur = Math.min(Math.round(inc * step), value);
          setDisplay(cur);
          if (step >= steps) clearInterval(t);
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 800,
        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
        color: '#FF5C00',
        lineHeight: 1,
        textShadow: '0 0 24px rgba(255,92,0,0.35)',
      }}>
        {display.toLocaleString('pl-PL')}{suffix}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.82rem', marginTop: 6, fontWeight: 400 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Article card (left border style) ─────────────────────────────────────────
function ArticleCard({ article, delay }) {
  const sport = getSportInfo(article.sport_type);
  return (
    <Link to={`/artykuly/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className={`soft-card fade-in-up delay-${delay}`}
        style={{
          padding: 22,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `4px solid ${sport.color}`,
        }}
      >
        <span
          className="sport-badge"
          style={{ background: `${sport.color}14`, color: sport.color, border: `1px solid ${sport.color}28`, marginBottom: 14, alignSelf: 'flex-start' }}
        >
          <SportIcon sport={article.sport_type} size={11} color={sport.color}/>
          {sport.label}
        </span>
        <h3 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.02rem',
          color: 'rgba(255,255,255,0.92)',
          marginBottom: 10,
          lineHeight: 1.35,
          flex: 1,
        }}>
          {article.title}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 16, fontWeight: 300 }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.78rem' }}>{article.author_name}</span>
          <span style={{ color: sport.color, fontSize: '0.82rem', fontWeight: 600 }}>Czytaj →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Sport bento card ──────────────────────────────────────────────────────────
function SportBentoCard({ sportKey, sport, count, onClick, large }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      className="sport-bento-card"
      style={{
        background: hovered ? `${sport.color}0E` : 'var(--bg-card)',
        borderColor: hovered ? `${sport.color}40` : 'rgba(255,255,255,0.06)',
        boxShadow: hovered
          ? `8px 8px 24px var(--shadow-dark), -3px -3px 12px var(--shadow-light), 0 0 0 1px ${sport.color}30`
          : '4px 4px 12px var(--shadow-dark), -2px -2px 8px var(--shadow-light)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: large ? 52 : 42,
        height: large ? 52 : 42,
        borderRadius: 14,
        background: `${sport.color}18`,
        border: `1px solid ${sport.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hovered ? `0 0 16px ${sport.color}40` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <SportIcon sport={sportKey} size={large ? 26 : 22} color={sport.color}/>
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: large ? '1.05rem' : '0.92rem', color: 'rgba(255,255,255,0.92)' }}>
        {sport.label}
      </div>
      <div style={{ color: sport.color, fontSize: '0.8rem', fontWeight: 600 }}>
        {count || 0} startów
      </div>
    </button>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [voivFilter, setVoivFilter]   = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [articles, setArticles]       = useState([]);
  const [stats, setStats]             = useState({ total_events: 150, total_regions: 16, sport_categories: 6, events_this_month: 12 });
  const [sportCounts, setSportCounts] = useState({});
  const [loading, setLoading]         = useState(true);
  const [geoBanner, setGeoBanner]     = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(!!sessionStorage.getItem('startivo_geo_dismissed'));

  const statsRef       = useScrollAnimation();
  const disciplinesRef = useScrollAnimation();
  const featuredRef    = useScrollAnimation();
  const articlesRef    = useScrollAnimation();

  useEffect(() => {
    Promise.all([
      api.get('/events/featured').catch(() => []),
      api.get('/stats').catch(() => ({})),
      api.get('/stats/by-sport').catch(() => ({})),
      api.get('/articles?limit=3').catch(() => ({ articles: [] })),
    ]).then(([featured, statsData, bySport, articlesData]) => {
      setFeaturedEvents(featured || []);
      setStats((prev) => ({ ...prev, ...statsData }));
      setSportCounts(bySport || {});
      setArticles(articlesData?.articles || []);
    }).finally(() => setLoading(false));

    if (!sessionStorage.getItem('startivo_geo_dismissed')) {
      const timer = setTimeout(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const data = await r.json();
            const city  = data.address?.city || data.address?.town || data.address?.village;
            const state = data.address?.state;
            if (city) {
              const ev = await api.get(`/events?voivodeship=${encodeURIComponent(state)}&limit=1`);
              setGeoBanner({ city, count: ev.total || 0, state });
            }
          } catch { /* ignore */ }
        }, () => {});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search)      p.set('search',      search);
    if (sportFilter) p.set('sport_type',  sportFilter);
    if (voivFilter)  p.set('voivodeship', voivFilter);
    navigate(`/kalendarz?${p.toString()}`);
  };

  // Bento discipline order: [running, hyrox, ocr(wide), triathlon(wide), trail, cycling]
  const BENTO_SPORTS = [
    { key: 'running',   col: '1',     row: '1' },
    { key: 'hyrox',     col: '2',     row: '1' },
    { key: 'ocr',       col: '3 / 5', row: '1 / 3' },  // right, 2 rows tall
    { key: 'triathlon', col: '1 / 3', row: '2' },       // left 2 wide
    { key: 'trail',     col: '3',     row: '3' },
    { key: 'cycling',   col: '4',     row: '3' },
  ];

  return (
    <div>
      {/* ── Geo banner ────────────────────────────────────────────────────── */}
      {geoBanner && !bannerDismissed && (
        <div style={{
          background: 'rgba(255,92,0,0.08)',
          borderBottom: '1px solid rgba(255,92,0,0.20)',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 100,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>
            📍 Jesteś w okolicach <strong style={{ color: '#FF5C00' }}>{geoBanner.city}</strong>?
            {' '}Mamy <strong style={{ color: '#FF5C00' }}>{geoBanner.count}</strong> startów w Twoim regionie
          </span>
          <button
            onClick={() => navigate(`/kalendarz?voivodeship=${encodeURIComponent(geoBanner.state)}`)}
            className="btn-primary"
            style={{ padding: '5px 16px', fontSize: '0.8rem' }}
          >
            Zobacz →
          </button>
          <button
            onClick={() => { setBannerDismissed(true); sessionStorage.setItem('startivo_geo_dismissed', '1'); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── HERO — asymmetric bento ───────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(56px, 8vw, 96px) 24px clamp(48px, 6vw, 72px)',
        background: 'radial-gradient(ellipse 80% 70% at 60% 0%, rgba(255,92,0,0.07) 0%, transparent 70%)',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,400px)',
          gap: '40px 56px',
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <div>
            <div
              className="section-label fade-in-up visible"
              style={{ marginBottom: 22, fontSize: '0.72rem' }}
            >
              🏆 #1 platforma sportowa w Polsce
            </div>

            <h1
              className="fade-in-up visible delay-1"
              style={{
                fontSize: 'clamp(52px, 9vw, 110px)',
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                marginBottom: 24,
              }}
            >
              ZNAJDŹ SWÓJ<br/>
              <span className="gradient-text">NASTĘPNY</span><br/>
              START.
            </h1>

            <p
              className="fade-in-up visible delay-2"
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                maxWidth: 460,
                lineHeight: 1.75,
                marginBottom: 36,
                fontWeight: 300,
              }}
            >
              Biegi, triathlony, OCR, Hyrox i więcej — wszystkie polskie zawody sportowe w jednym miejscu.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="search-bar fade-in-up visible delay-3"
              style={{ padding: '8px 10px', display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 580 }}
            >
              <input
                type="text"
                placeholder="Szukaj wydarzeń, miast, dyscyplin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: '2 1 200px',
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255,255,255,0.92)',
                  fontSize: '0.9rem',
                  padding: '8px 10px',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                style={{
                  flex: '1 1 130px',
                  minWidth: 0,
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.60)',
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                }}
              >
                <option value="">Dyscyplina</option>
                {Object.entries(SPORT_TYPES).map(([k, s]) => (
                  <option key={k} value={k}>{s.emoji} {s.label}</option>
                ))}
              </select>
              <select
                value={voivFilter}
                onChange={(e) => setVoivFilter(e.target.value)}
                style={{
                  flex: '1 1 130px',
                  minWidth: 0,
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.60)',
                  padding: '8px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                }}
              >
                <option value="">Województwo</option>
                {VOIVODESHIPS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <button type="submit" className="btn-primary" style={{ flex: '0 0 auto', padding: '10px 22px', fontSize: '0.9rem' }}>
                Szukaj →
              </button>
            </form>
          </div>

          {/* Right: Poland SVG map */}
          <div className="hide-mobile fade-in-up visible delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
            <PolandMapSVG/>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}>
        <div
          ref={statsRef}
          style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}
        >
          {[
            { value: stats.total_events      || 150, label: 'Wydarzeń'                },
            { value: stats.total_regions     || 16,  label: 'Województw'              },
            { value: stats.sport_categories  || 6,   label: 'Dyscyplin'               },
            { value: stats.events_this_month || 12,  label: 'Startów w tym miesiącu'  },
          ].map((s, i) => (
            <div key={s.label} className={`fade-in-up delay-${i + 1}`} style={{ position: 'relative' }}>
              {i > 0 && (
                <div style={{ position: 'absolute', left: -12, top: '20%', height: '60%', width: 1, background: 'rgba(255,255,255,0.06)' }}/>
              )}
              <StatCounter value={s.value} label={s.label}/>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCIPLINES — Bento grid ───────────────────────────────────────── */}
      <section style={{ padding: '80px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 32 }}>
            <span className="section-label">🏅 Dyscypliny</span>
            <h2 style={{ color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>Przeglądaj dyscypliny</h2>
          </div>

          <div
            ref={disciplinesRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'auto auto auto',
              gap: 14,
            }}
          >
            {BENTO_SPORTS.map(({ key, col, row }, i) => {
              const sport = SPORT_TYPES[key];
              if (!sport) return null;
              return (
                <div
                  key={key}
                  className={`fade-in-up delay-${(i % 6) + 1}`}
                  style={{ gridColumn: col, gridRow: row }}
                >
                  <SportBentoCard
                    sportKey={key}
                    sport={sport}
                    count={sportCounts[key]}
                    large={col.includes('/')}
                    onClick={() => navigate(`/kalendarz?sport_type=${key}`)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS — bento first card 2× wider ───────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="section-label">⭐ Polecane</span>
              <h2 style={{ color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>Polecane starty</h2>
            </div>
            <Link
              to="/kalendarz"
              style={{ color: '#FF5C00', fontSize: '0.9rem', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Zobacz wszystkie →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1,2,3].map((i) => <div key={i} className={`fade-in-up delay-${i}`}><SkeletonCard/></div>)}
            </div>
          ) : featuredEvents.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.40)' }}>Brak wyróżnionych wydarzeń.</p>
          ) : (
            <div
              ref={featuredRef}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
            >
              {/* First card: 2× wider (featured hero) */}
              {featuredEvents[0] && (
                <div className="fade-in-up delay-1" style={{ gridColumn: '1 / 3' }}>
                  <EventCard event={featuredEvents[0]}/>
                </div>
              )}
              {/* Remaining cards */}
              {featuredEvents.slice(1).map((e, i) => (
                <div key={e.id} className={`fade-in-up delay-${(i + 2) % 6 + 1}`}>
                  <EventCard event={e}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ARTICLES ─────────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 72,
        paddingBottom: 80,
        paddingLeft: 0,
        paddingRight: 0,
        background: 'var(--bg-elevated)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="section-label">📖 Wiedza</span>
              <h2 style={{ color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>Poradniki i inspiracje</h2>
            </div>
            <Link to="/artykuly" style={{ color: '#FF5C00', fontSize: '0.9rem', fontWeight: 600 }}>
              Wszystkie artykuły →
            </Link>
          </div>

          <div
            ref={articlesRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}
          >
            {loading
              ? [1,2,3].map((i) => <div key={i} className={`fade-in-up delay-${i}`}><SkeletonArticleCard/></div>)
              : articles.length === 0
                ? <p style={{ color: 'rgba(255,255,255,0.40)', gridColumn: '1/-1' }}>Brak artykułów.</p>
                : articles.map((a, i) => <ArticleCard key={a.id} article={a} delay={(i % 3) + 1}/>)
            }
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <Newsletter/>
    </div>
  );
}
