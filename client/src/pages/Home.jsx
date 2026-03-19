import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SPORT_TYPES, getSportInfo, formatDate, getDaysUntil } from '../utils/sports';
import { SportIcon } from '../components/SportIcons';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ─── Animated counter ───────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1200;
        const steps = 40;
        let step = 0;
        const inc = target / steps;
        const interval = setInterval(() => {
          step++;
          setVal(Math.round(Math.min(inc * step, target)));
          if (step >= steps) clearInterval(interval);
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Scroll fade hook ────────────────────────────────────────────────────────
function useScrollFade() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add('animate-in');
    }, { threshold: 0.08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── NumberedEvent row ────────────────────────────────────────────────────────
function NumberedEvent({ event, index }) {
  const sport = getSportInfo(event.sport_type);
  const days = getDaysUntil(event.date_start);
  const navigate = useNavigate();

  return (
    <div
      className="numbered-event"
      onClick={() => navigate(`/event/${event.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/event/${event.slug}`)}
    >
      <span className="numbered-event__num">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <div className="numbered-event__name">{event.name}</div>
        <div className="numbered-event__meta">
          <span>{formatDate(event.date_start)}</span>
          <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
          <span>{event.city}</span>
          {days >= 0 && days <= 30 && (
            <>
              <span style={{ color: 'rgba(0,0,0,0.2)' }}>·</span>
              <span style={{ color: '#EF4444', fontWeight: 600 }}>
                {days === 0 ? 'Dzisiaj!' : `${days} dni`}
              </span>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span
          className="numbered-event__badge"
          style={{ background: `${sport.color}18`, color: sport.color }}
        >
          {sport.label}
        </span>
        <span className="numbered-event__arrow">→</span>
      </div>
    </div>
  );
}

// ─── Featured card (dark section) ─────────────────────────────────────────────
function FeaturedCard({ event }) {
  const sport = getSportInfo(event.sport_type);
  const days = getDaysUntil(event.date_start);
  return (
    <Link to={`/event/${event.slug}`} className="featured-card">
      <div
        className="featured-card__img"
        style={event.image_url ? { backgroundImage: `url(${event.image_url})` } : {
          background: `linear-gradient(135deg, ${sport.color}22 0%, #1C2028 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!event.image_url && (
          <div style={{ opacity: 0.25, width: 56, height: 56, color: sport.color }}>
            <SportIcon sport={event.sport_type} size={56} color={sport.color} />
          </div>
        )}
      </div>
      <div className="featured-card__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
            background: `${sport.color}22`, color: sport.color,
          }}>
            {sport.label}
          </span>
          {days >= 0 && days <= 14 && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, color: '#EF4444',
              background: 'rgba(239,68,68,0.1)', padding: '3px 10px', borderRadius: 100,
            }}>
              {days === 0 ? 'Dzisiaj!' : `Za ${days} dni`}
            </span>
          )}
        </div>
        <div className="featured-card__title">{event.name}</div>
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 8 }}>
          <span>{formatDate(event.date_start)}</span>
          <span>·</span>
          <span>{event.city}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Article preview card ─────────────────────────────────────────────────────
function ArticleCard({ article }) {
  const sport = getSportInfo(article.sport_type);
  return (
    <Link to={`/artykuly/${article.slug}`} className="article-preview">
      <span className="article-preview__tag">{sport.label}</span>
      <div className="article-preview__title">{article.title}</div>
      {article.excerpt && (
        <div className="article-preview__excerpt">{article.excerpt}</div>
      )}
      <div style={{ fontSize: '0.78rem', color: '#8A8A8A', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>{article.author_name || 'Redakcja Startivo'}</span>
        <span style={{ color: 'rgba(0,0,0,0.2)' }}>→</span>
      </div>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [settings, setSettings] = useState({
    hero_image: '/images/hero-ocr.jpg',
    hero_headline_1: 'ZNAJDŹ SWÓJ',
    hero_headline_2: 'NASTĘPNY START.',
    hero_subtitle: 'Największy agregator wydarzeń sportowych w Polsce. Biegi, OCR, Hyrox, Triathlon i wiele więcej.',
  });
  const [events, setEvents] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, sports: 0, cities: 0, this_month: 0 });
  const [sportCounts, setSportCounts] = useState({});

  const statsRef = useScrollFade();
  const disciplinesRef = useScrollFade();
  const numberedRef = useScrollFade();
  const articlesRef = useScrollFade();

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(data => setSettings(s => ({ ...s, ...data })))
      .catch(() => {});

    fetch(`${API}/api/stats`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch(`${API}/api/events?status=published&limit=50&sort=date_asc`)
      .then(r => r.json())
      .then(data => {
        const evs = Array.isArray(data) ? data : (data.events || []);
        const now = new Date();
        const upcoming = evs
          .filter(e => new Date(e.date_start) >= now)
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        setFeatured(evs.filter(e => e.featured).slice(0, 3));
        setEvents(upcoming.slice(0, 10));

        const counts = {};
        evs.forEach(e => {
          if (e.sport_type) counts[e.sport_type] = (counts[e.sport_type] || 0) + 1;
        });
        setSportCounts(counts);
      })
      .catch(() => {});

    fetch(`${API}/api/articles?status=published&limit=4`)
      .then(r => r.json())
      .then(data => setArticles(Array.isArray(data) ? data : (data.articles || [])))
      .catch(() => {});
  }, []);

  const sportEntries = Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other');

  return (
    <>
      <Helmet>
        <title>Startivo — Jedno miejsce. Wszystkie starty.</title>
        <meta name="description" content="Największy agregator wydarzeń sportowych w Polsce. Znajdź biegi, triatlony, OCR, Hyrox, Trail Running i inne zawody." />
      </Helmet>

      {/* ──────────────────── HERO ──────────────────────────────────────────── */}
      <section className="hero-fullbleed">
        <div
          className="hero-fullbleed__bg"
          style={{ backgroundImage: `url(${settings.hero_image})` }}
        />
        <div className="hero-fullbleed__overlay" />
        <div className="hero-fullbleed__content">
          <div style={{ marginBottom: 12 }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}>
              Agregator sportowy · Polska
            </span>
          </div>
          <h1 className="hero-headline">
            {settings.hero_headline_1}<br />
            <span style={{ color: '#FF5C00' }}>{settings.hero_headline_2}</span>
          </h1>
          <p style={{
            marginTop: 24,
            color: 'rgba(255,255,255,0.62)',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            lineHeight: 1.65,
            maxWidth: 520,
          }}>
            {settings.hero_subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <Link to="/kalendarz" className="btn-primary" style={{ fontSize: '0.95rem', padding: '13px 30px' }}>
              Przeglądaj starty →
            </Link>
            <Link to="/mapa" className="btn-outline-white" style={{ fontSize: '0.95rem' }}>
              Mapa wydarzeń
            </Link>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 32, right: 48,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.25))' }} />
          Scroll
        </div>
      </section>

      {/* ──────────────────── STATS STRIP ────────────────────────────────────── */}
      <section className="stats-strip section-dark">
        <div className="container">
          <div
            ref={statsRef}
            className="scroll-fade"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {[
              { n: stats.total || stats.published_events || 0, label: 'Wydarzeń' },
              { n: sportEntries.length, label: 'Dyscyplin' },
              { n: stats.cities || 0, suffix: '+', label: 'Miast' },
              { n: stats.this_month || stats.monthly_new || 0, suffix: '+', label: 'Nowych / miesiąc' },
            ].map((item, i) => (
              <div key={i} className="stats-strip__item" style={{
                borderRight: '1px solid rgba(255,255,255,0.06)',
                paddingLeft: 32, paddingRight: 32,
              }}>
                <div className="stats-strip__number">
                  <AnimatedNumber target={item.n} suffix={item.suffix || ''} />
                </div>
                <div className="stats-strip__label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── DISCIPLINES (CREAM) ────────────────────────────── */}
      <section className="section-cream" style={{ padding: '96px 0' }}>
        <div className="container">
          <div ref={disciplinesRef} className="scroll-fade">
            <div style={{ marginBottom: 48 }}>
              <div className="editorial-label">Dyscypliny</div>
              <h2 className="editorial-h2" style={{ color: '#0D0D0D' }}>
                TWOJA<br />DYSCYPLINA
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}>
              {sportEntries.map(([key, sport]) => (
                <button
                  key={key}
                  className="discipline-card"
                  onClick={() => navigate(`/kalendarz?sport_type=${key}`)}
                >
                  <div className="discipline-card__icon" style={{ color: sport.color }}>
                    <SportIcon sport={key} size={44} color={sport.color} />
                  </div>
                  <div className="discipline-card__name">{sport.label}</div>
                  <div className="discipline-card__count">
                    {sportCounts[key] || 0} startów
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── FEATURED EVENTS (DARK) ─────────────────────────── */}
      {featured.length > 0 && (
        <section className="section-dark" style={{ padding: '96px 0' }}>
          <div className="container">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div className="editorial-label">Wyróżnione</div>
                <h2 className="editorial-h2" style={{ color: '#FFFFFF' }}>
                  POLECANE<br />STARTY
                </h2>
              </div>
              <Link
                to="/kalendarz?featured=true"
                style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#FF5C00'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                Wszystkie →
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {featured.map(ev => <FeaturedCard key={ev.id} event={ev} />)}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────── NUMBERED EVENTS (LIGHT) ────────────────────────── */}
      <section className="section-light" style={{ padding: '96px 0' }}>
        <div className="container">
          <div ref={numberedRef} className="scroll-fade">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <div className="editorial-label">Nadchodzące</div>
                <h2 className="editorial-h2" style={{ color: '#0D0D0D' }}>
                  NAJBLIŻSZE<br />STARTY
                </h2>
              </div>
              <Link to="/kalendarz" className="btn-outline-black" style={{ alignSelf: 'flex-end' }}>
                Pełny kalendarz →
              </Link>
            </div>

            <div>
              {events.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#8A8A8A' }}>
                  Ładowanie wydarzeń…
                </div>
              ) : (
                events.map((ev, i) => <NumberedEvent key={ev.id} event={ev} index={i} />)
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/kalendarz" className="btn-primary">
                Pokaż wszystkie starty →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── CTA SPLIT ──────────────────────────────────────── */}
      <div className="cta-split">
        <div className="cta-split__left">
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.72rem',
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
            marginBottom: 14,
          }}>
            Organizatorzy
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.04em',
            textTransform: 'uppercase', color: '#fff', lineHeight: 1.05, margin: 0,
          }}>
            DODAJ SWÓJ EVENT
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 400 }}>
            Bezpłatna publikacja na największym agregatorze startów w Polsce.
            Dotrzyj do tysięcy aktywnych sportowców.
          </p>
          <div>
            <Link to="/dodaj" className="btn-outline-white">Dodaj event →</Link>
          </div>
        </div>
        <div className="cta-split__right">
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.72rem',
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: 14,
          }}>
            Współpraca
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.04em',
            textTransform: 'uppercase', color: '#fff', lineHeight: 1.05, margin: 0,
          }}>
            PARTNERSTWO & REKLAMA
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 400 }}>
            Promuj swoją markę wśród aktywnych Polaków.
          </p>
          <div>
            <Link to="/wspolpraca" className="btn-outline-white">Dowiedz się więcej →</Link>
          </div>
        </div>
      </div>

      {/* ──────────────────── ARTICLES (CREAM) ───────────────────────────────── */}
      {articles.length > 0 && (
        <section className="section-cream" style={{ padding: '96px 0' }}>
          <div className="container">
            <div ref={articlesRef} className="scroll-fade">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: 80,
                alignItems: 'start',
              }}>
                <div style={{ position: 'sticky', top: 100 }}>
                  <div className="editorial-label">Wiedza</div>
                  <h2 className="editorial-h2" style={{ color: '#0D0D0D' }}>
                    ARTYKUŁY<br />& PORADY
                  </h2>
                  <p style={{ color: '#8A8A8A', fontSize: '0.9rem', lineHeight: 1.6, marginTop: 16, marginBottom: 28 }}>
                    Poradniki i opisy dyscyplin dla sportowców.
                  </p>
                  <Link to="/artykuly" className="btn-outline-black">
                    Wszystkie artykuły →
                  </Link>
                </div>
                <div>
                  {articles.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .section-cream > .container > div > div[style*="grid-template-columns: 280px"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .section-cream > .container > div > div[style*="grid-template-columns: 280px"] > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
}
