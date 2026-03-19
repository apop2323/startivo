import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { SPORT_TYPES, getSportInfo } from '../utils/sports';
import { SkeletonArticleCard } from '../components/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function ArticleCard({ article, index }) {
  const sport = getSportInfo(article.sport_type);
  const readTime = Math.max(2, Math.ceil((article.content?.length || 500) / 1200));
  return (
    <Link to={`/artykuly/${article.slug || article.id}`} style={{ textDecoration: 'none' }}>
      <div className={`card fade-in-up delay-${(index % 6) + 1}`} style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <span className="sport-badge" style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}30`, marginBottom: 16, alignSelf: 'flex-start' }}>
          {sport.emoji} {sport.label}
        </span>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.35, flex: 1 }}>
          {article.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 18, fontWeight: 300 }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--bg-border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{article.author_name}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{readTime} min czytania</span>
          </div>
          <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 500 }}>Czytaj →</span>
        </div>
      </div>
    </Link>
  );
}

export default function Artykuly() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('');
  const ref = useScrollAnimation();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (sportFilter) params.set('sport_type', sportFilter);
    api.get(`/articles?${params.toString()}`)
      .then((data) => {
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sportFilter]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Helmet>
        <title>Artykuły sportowe — Startivo</title>
        <meta name="description" content="Poradniki i artykuły o bieganiu, OCR, Hyrox, triatlonie i innych dyscyplinach. Wiedza dla aktywnych Polaków." />
      </Helmet>
      {/* Header */}
      <div style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,92,0,0.05) 0%, transparent 100%)', padding: 'clamp(48px, 6vw, 72px) 20px clamp(32px, 4vw, 48px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="section-label">📖 Wiedza sportowa</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--text-primary)', margin: '12px 0 12px', letterSpacing: '-0.02em' }}>
            Poradniki i inspiracje
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 300, lineHeight: 1.7 }}>
            Wszystko, co musisz wiedzieć przed swoim pierwszym startem. Sprawdzone porady od aktywnych.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 72px' }}>
        {/* Sport filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            onClick={() => setSportFilter('')}
            style={{
              background: !sportFilter ? 'var(--accent)' : 'var(--bg-card)',
              color: !sportFilter ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${!sportFilter ? 'var(--accent)' : 'var(--bg-border)'}`,
              borderRadius: 100,
              padding: '6px 16px',
              cursor: 'pointer',
              fontFamily: 'DM Sans',
              fontSize: '0.85rem',
              transition: 'all 0.2s var(--ease-expo)',
            }}
          >
            Wszystkie ({total})
          </button>
          {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport]) => {
            const active = sportFilter === key;
            return (
              <button
                key={key}
                onClick={() => setSportFilter(active ? '' : key)}
                style={{
                  background: active ? `${sport.color}20` : 'var(--bg-card)',
                  color: active ? sport.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? sport.color + '50' : 'var(--bg-border)'}`,
                  borderRadius: 100,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  fontSize: '0.85rem',
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.2s var(--ease-expo)',
                }}
              >
                {sport.emoji} {sport.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {loading
            ? [1,2,3,4,5,6].map((i) => <SkeletonArticleCard key={i} />)
            : articles.length === 0
              ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <p style={{ color: 'var(--text-secondary)' }}>Brak artykułów dla wybranej dyscypliny.</p>
                </div>
              )
              : articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
