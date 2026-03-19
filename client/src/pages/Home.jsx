import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';
import PolandMap from '../components/PolandMap';
import { SkeletonCard, SkeletonArticleCard } from '../components/Skeleton';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS, getSportInfo } from '../utils/sports';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// ─── Animated counter ─────────────────────────────────────────────────────────
function StatCounter({ value, label, prefix = '', suffix = '+' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          current = Math.min(Math.round(increment * step), value);
          setDisplay(current);
          if (step >= steps) clearInterval(timer);
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: 'var(--accent)', lineHeight: 1 }}>
        {prefix}{display.toLocaleString('pl-PL')}{suffix}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 6, fontWeight: 400 }}>{label}</div>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, delay }) {
  const sport = getSportInfo(article.sport_type);
  return (
    <Link to={`/artykuly/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div className={`card fade-in-up delay-${delay}`} style={{ padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <span className="sport-badge" style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}30`, marginBottom: 14, alignSelf: 'flex-start' }}>
          {sport.emoji} {sport.label}
        </span>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.35, flex: 1 }}>
          {article.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 16, fontWeight: 300 }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--bg-border)', marginTop: 'auto' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>{article.author_name}</span>
          <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 500 }}>Czytaj →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [voivodeshipFilter, setVoivodeshipFilter] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ total_events: 150, total_regions: 16, sport_categories: 6, events_this_month: 12 });
  const [sportCounts, setSportCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [geoBanner, setGeoBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(!!sessionStorage.getItem('startivo_geo_dismissed'));

  const statsRef = useScrollAnimation();
  const disciplinesRef = useScrollAnimation();
  const featuredRef = useScrollAnimation();
  const articlesRef = useScrollAnimation();

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

    // Geolocation banner after 3s
    if (!sessionStorage.getItem('startivo_geo_dismissed')) {
      const timer = setTimeout(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const data = await r.json();
            const city = data.address?.city || data.address?.town || data.address?.village;
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
    if (search) p.set('search', search);
    if (sportFilter) p.set('sport_type', sportFilter);
    if (voivodeshipFilter) p.set('voivodeship', voivodeshipFilter);
    navigate(`/kalendarz?${p.toString()}`);
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
          background: 'rgba(255,92,0,0.08)',
          borderBottom: '1px solid rgba(255,92,0,0.2)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 100,
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            📍 Jesteś w okolicach <strong style={{ color: 'var(--accent)' }}>{geoBanner.city}</strong>?
            Mamy <strong style={{ color: 'var(--accent)' }}>{geoBanner.count}</strong> startów w Twoim regionie
          </span>
          <button
            onClick={() => navigate(`/kalendarz?voivodeship=${encodeURIComponent(geoBanner.state)}`)}
            className="btn-primary"
            style={{ padding: '5px 16px', fontSize: '0.8rem' }}
          >
            Zobacz →
          </button>
          <button onClick={dismissBanner} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 }}>
            ×
          </button>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(60px, 8vw, 96px) 20px clamp(48px, 6vw, 72px)',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,92,0,0.06) 0%, transparent 100%)',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)',
          gap: '40px 64px',
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <div>
            <div className="section-label fade-in-up visible" style={{ marginBottom: 20 }}>
              🏆 #1 platforma sportowa w Polsce
            </div>

            <h1 className="fade-in-up visible delay-1" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', marginBottom: 20, letterSpacing: '-0.02em' }}>
              Znajdź swój<br />
              <span className="gradient-text">następny start.</span>
            </h1>

            <p className="fade-in-up visible delay-2" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: 460, lineHeight: 1.75, marginBottom: 36, fontWeight: 300 }}>
              Biegi, triathlony, OCR, Hyrox i więcej — wszystkie polskie zawody sportowe w jednym miejscu.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="search-bar fade-in-up visible delay-3" style={{ padding: 8, display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 600 }}>
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
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  padding: '8px 10px',
                  fontFamily: 'DM Sans',
                }}
              />
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                style={{ flex: '1 1 140px', minWidth: 0, background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 10, color: 'var(--text-secondary)', padding: '8px 10px', fontSize: '0.82rem', outline: 'none', fontFamily: 'DM Sans', cursor: 'pointer' }}
              >
                <option value="">Dyscyplina</option>
                {Object.entries(SPORT_TYPES).map(([k, s]) => (
                  <option key={k} value={k}>{s.emoji} {s.label}</option>
                ))}
              </select>
              <select
                value={voivodeshipFilter}
                onChange={(e) => setVoivodeshipFilter(e.target.value)}
                style={{ flex: '1 1 140px', minWidth: 0, background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 10, color: 'var(--text-secondary)', padding: '8px 10px', fontSize: '0.82rem', outline: 'none', fontFamily: 'DM Sans', cursor: 'pointer' }}
              >
                <option value="">Województwo</option>
                {VOIVODESHIPS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <button type="submit" className="btn-primary" style={{ flex: '0 0 auto', padding: '10px 22px', fontSize: '0.9rem' }}>
                Szukaj →
              </button>
            </form>
          </div>

          {/* Right: Poland map */}
          <div className="hide-mobile fade-in-up visible delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
            <PolandMap />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)', padding: '36px 20px' }}>
        <div ref={statsRef} style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="grid-2-mobile">
          {[
            { value: stats.total_events || 150, label: 'Wydarzeń' },
            { value: stats.total_regions || 16, label: 'Województw' },
            { value: stats.sport_categories || 6, label: 'Dyscyplin' },
            { value: stats.events_this_month || 12, label: 'Startów w tym miesiącu' },
          ].map((s, i) => (
            <div key={s.label} className={`fade-in-up delay-${i + 1}`} style={{ position: 'relative' }}>
              {i > 0 && <div style={{ position: 'absolute', left: -12, top: '20%', height: '60%', width: 1, background: 'var(--bg-border)' }} />}
              <StatCounter value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCIPLINE CARDS ─────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: 28 }}>
            <span className="section-label">🏅 Dyscypliny</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text-primary)' }}>
              Przeglądaj dyscypliny
            </h2>
          </div>
          <div ref={disciplinesRef} className="scroll-x" style={{ display: 'flex', gap: 14, paddingBottom: 4 }}>
            {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport], i) => (
              <button
                key={key}
                onClick={() => navigate(`/kalendarz?sport_type=${key}`)}
                className={`fade-in-up delay-${i + 1}`}
                style={{
                  flex: '0 0 auto',
                  width: 160,
                  background: 'var(--bg-card)',
                  border: `1px solid var(--bg-border)`,
                  borderLeft: `4px solid ${sport.color}`,
                  borderRadius: 'var(--radius-card)',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s var(--ease-expo)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = sport.color;
                  e.currentTarget.style.background = `${sport.color}0C`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-border)';
                  e.currentTarget.style.borderLeftColor = sport.color;
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10, lineHeight: 1 }}>{sport.emoji}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{sport.label}</div>
                <div style={{ color: sport.color, fontSize: '0.8rem', fontWeight: 500 }}>
                  {sportCounts[key] || 0} startów
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ──────────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="section-label">⭐ Polecane</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text-primary)' }}>
                Polecane starty
              </h2>
            </div>
            <Link to="/kalendarz" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Zobacz wszystkie →
            </Link>
          </div>

          <div ref={featuredRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {loading
              ? [1,2,3].map((i) => <div key={i} className={`fade-in-up delay-${i}`}><SkeletonCard /></div>)
              : featuredEvents.length === 0
                ? <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>Brak wyróżnionych wydarzeń.</p>
                : featuredEvents.map((e, i) => (
                    <div key={e.id} className={`fade-in-up delay-${(i % 6) + 1}`}>
                      <EventCard event={e} />
                    </div>
                  ))
            }
          </div>
        </div>
      </section>

      {/* ── ARTICLES ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)', paddingTop: 64, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="section-label">📖 Wiedza</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text-primary)' }}>
                Poradniki i inspiracje
              </h2>
            </div>
            <Link to="/artykuly" style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 500 }}>
              Wszystkie artykuły →
            </Link>
          </div>

          <div ref={articlesRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {loading
              ? [1,2,3].map((i) => <div key={i} className={`fade-in-up delay-${i}`}><SkeletonArticleCard /></div>)
              : articles.length === 0
                ? <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>Brak artykułów.</p>
                : articles.map((a, i) => <ArticleCard key={a.id} article={a} delay={(i % 3) + 1} />)
            }
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <Newsletter />
    </div>
  );
}
