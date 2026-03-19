import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { getSportInfo, formatDateShort } from '../utils/sports';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';

export default function ArtykulDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/articles/${slug}`)
      .then((d) => {
        setData(d);
        if (d?.article) document.title = `${d.article.title} | Startivo`;
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Ładowanie...</div>
      </div>
    );
  }

  if (!data?.article) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: '3.5rem' }}>📭</div>
        <h2 style={{ color: 'var(--text-secondary)' }}>Artykuł nie znaleziony</h2>
        <Link to="/artykuly" className="btn-primary">← Wszystkie artykuły</Link>
      </div>
    );
  }

  const { article, related } = data;
  const sport = getSportInfo(article.sport_type);
  const readTime = Math.max(2, Math.ceil((article.content?.length || 500) / 1200));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${sport.color}12 0%, var(--bg-base) 60%)`,
        borderBottom: '1px solid var(--bg-border)',
        padding: 'clamp(40px, 6vw, 72px) 20px clamp(32px, 4vw, 56px)',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link to="/artykuly" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20, transition: 'color 0.2s', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ← Wszystkie artykuły
          </Link>

          <span className="sport-badge" style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}30`, display: 'inline-flex', marginBottom: 16 }}>
            {sport.emoji} {sport.label}
          </span>

          <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {article.title}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, marginBottom: 24 }}>
            {article.excerpt}
          </p>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${sport.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                ✍️
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{article.author_name}</span>
            </div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>·</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{readTime} min czytania</span>
            {article.created_at && (
              <>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>·</span>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                  {new Date(article.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content + sidebar */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 72px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 40, alignItems: 'flex-start' }}>
        {/* Article body */}
        <article>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-card)',
            padding: 'clamp(24px, 4vw, 40px)',
          }}>
            <div className="article-content" style={{ whiteSpace: 'pre-line' }}>
              {article.content || article.excerpt}
            </div>
          </div>

          {/* Share */}
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Podziel się:</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
              style={{ background: '#1877F2', color: 'white', padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
              Facebook
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
              style={{ background: '#000', color: 'white', padding: '6px 14px', borderRadius: 100, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
              X / Twitter
            </a>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hide-mobile">
          {related?.length > 0 && (
            <div style={{ position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                Nadchodzące {sport.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {related.map((e) => (
                  <Link key={e.id} to={`/event/${e.slug || e.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 5, lineHeight: 1.3 }}>{e.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{e.city} · {formatDateShort(e.date_start)}</div>
                      {e.price && <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, marginTop: 4 }}>{e.price} zł</div>}
                    </div>
                  </Link>
                ))}
                <Link to={`/kalendarz?sport_type=${article.sport_type}`} style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', marginTop: 4 }}>
                  Wszystkie {sport.label} →
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      <Newsletter />
    </div>
  );
}
