import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { getSportInfo, getDifficultyInfo, formatDate, formatPrice, getDaysUntil } from '../utils/sports';
import EventCard from '../components/EventCard';
import { SportIcon } from '../components/SportIcons';
import { useToast } from '../context/ToastContext';

function DifficultyDots({ difficulty }) {
  const info = getDifficultyInfo(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4].map((d) => (
        <span
          key={d}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: d <= info.dots ? info.color : 'rgba(255,255,255,0.12)',
            boxShadow: d <= info.dots ? `0 0 6px ${info.color}` : 'none',
            display: 'inline-block',
          }}
        />
      ))}
      <span style={{ marginLeft: 6, color: info.color, fontSize: '0.82rem', fontWeight: 600 }}>{info.label}</span>
    </span>
  );
}

function InfoBox({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.70rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{
        color: highlight ? '#FF5C00' : 'rgba(255,255,255,0.92)',
        fontFamily: highlight ? 'Syne, sans-serif' : 'DM Sans, sans-serif',
        fontWeight: highlight ? 800 : 500,
        fontSize: highlight ? '1.3rem' : '0.95rem',
        textShadow: highlight ? '0 0 20px rgba(255,92,0,0.35)' : 'none',
      }}>
        {value}
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSent, setAlertSent] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const savedIds = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${slug}`)
      .then((d) => {
        setData(d);
        setIsSaved(JSON.parse(localStorage.getItem('startivo_saved') || '[]').includes(d.event.id));
        document.title = `${d.event.name} | Startivo`;
        api.post(`/events/${d.event.id}/view`, {}).catch(() => {});
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Leaflet map
  useEffect(() => {
    if (!data?.event || !mapRef.current) return;
    const event = data.event;
    if (!event.lat || !event.lng) return;
    const L = window.L;
    if (!L) return;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

    const map = L.map(mapRef.current).setView([parseFloat(event.lat), parseFloat(event.lng)], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);

    const sport = getSportInfo(event.sport_type);
    L.circleMarker([parseFloat(event.lat), parseFloat(event.lng)], {
      radius: 14, fillColor: sport.color, color: 'rgba(255,255,255,0.8)', weight: 2, fillOpacity: 0.9,
    }).addTo(map).bindPopup(`<strong>${event.name}</strong><br/>${event.city}`).openPopup();
    mapInstanceRef.current = map;
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [data]);

  const toggleSave = () => {
    if (!data) return;
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    const newIds = ids.includes(data.event.id) ? ids.filter((i) => i !== data.event.id) : [...ids, data.event.id];
    localStorage.setItem('startivo_saved', JSON.stringify(newIds));
    const saved = newIds.includes(data.event.id);
    setIsSaved(saved);
    addToast(saved ? '❤️ Dodano do moich startów!' : 'Usunięto z moich startów', saved ? 'success' : 'info');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('🔗 Skopiowano link!', 'success');
  };

  const handleAlert = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/events/${data.event.id}/alert`, { email: alertEmail });
      setAlertSent(true);
      addToast('🔔 Przypomnienie ustawione!', 'success');
    } catch {
      addToast('Nie udało się ustawić przypomnienia.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-tertiary)', fontFamily: 'DM Sans' }}>Ładowanie...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 }}>
        <div style={{ fontSize: '4rem' }}>🏁</div>
        <h2 style={{ color: 'var(--text-secondary)' }}>Nie znaleziono wydarzenia</h2>
        <Link to="/kalendarz" className="btn-primary">← Wróć do kalendarza</Link>
      </div>
    );
  }

  const { event, similar } = data;
  const sport = getSportInfo(event.sport_type);
  const days = getDaysUntil(event.date_start);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    startDate: event.date_start,
    endDate: event.date_end || event.date_start,
    location: { '@type': 'Place', name: event.city, address: { '@type': 'PostalAddress', addressLocality: event.city, addressRegion: event.voivodeship, addressCountry: 'PL' } },
    organizer: event.organizer_name ? { '@type': 'Organization', name: event.organizer_name } : undefined,
    url: event.event_website || window.location.href,
    description: event.description,
    offers: event.price ? { '@type': 'Offer', price: event.price, priceCurrency: 'PLN' } : undefined,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Helmet>
        <title>{event ? `${event.name} — Startivo` : 'Wydarzenie — Startivo'}</title>
        <meta name="description" content={event?.excerpt || event?.description?.slice(0, 160) || 'Szczegóły wydarzenia sportowego na Startivo.pl'} />
        {event && <meta property="og:title" content={`${event.name} — Startivo`} />}
        {event?.image_url && <meta property="og:image" content={`https://startivo.pl${event.image_url}`} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Breadcrumb */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Link
            to="/kalendarz"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FF5C00'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            ← Kalendarz startów
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── HERO PANEL — Soft UI ────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: `4px solid ${sport.color}`,
          borderRadius: 24,
          padding: '36px 40px',
          marginBottom: 20,
          boxShadow: '8px 8px 24px var(--shadow-dark), -4px -4px 14px var(--shadow-light)',
          position: 'relative',
        }}>
          {/* Top row: sport + difficulty + countdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <span
              className="sport-badge"
              style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}35` }}
            >
              <SportIcon sport={event.sport_type} size={12} color={sport.color}/>
              {sport.label}
            </span>
            {event.difficulty && <DifficultyDots difficulty={event.difficulty}/>}
            {days >= 0 && (
              <span style={{
                marginLeft: 'auto',
                background: days <= 7 ? 'rgba(239,68,68,0.12)' : days <= 30 ? 'rgba(251,211,36,0.12)' : 'rgba(255,92,0,0.10)',
                color: days <= 7 ? '#EF4444' : days <= 30 ? '#FBD324' : '#FF5C00',
                border: `1px solid ${days <= 7 ? 'rgba(239,68,68,0.25)' : days <= 30 ? 'rgba(251,211,36,0.25)' : 'rgba(255,92,0,0.25)'}`,
                borderRadius: 100,
                padding: '4px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {days === 0 ? 'Dziś!' : `Za ${days} dni`}
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            color: 'rgba(255,255,255,0.92)',
            marginBottom: 28,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            fontFamily: 'Syne, sans-serif',
          }}>
            {event.name}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20, marginBottom: 24 }}>
            <InfoBox label="Data" value={`${formatDate(event.date_start)}${event.date_end && event.date_end !== event.date_start ? ` — ${formatDate(event.date_end)}` : ''}`} />
            <InfoBox label="Miasto" value={`${event.city}, ${event.voivodeship}`} />
            {event.distance && <InfoBox label="Dystans" value={event.distance} />}
            {event.price !== null && event.price !== undefined && <InfoBox label="Cena" value={formatPrice(event.price)} highlight />}
            {event.max_participants && <InfoBox label="Limit miejsc" value={`${event.max_participants.toLocaleString('pl-PL')} osób`} />}
            {event.organizer_name && <InfoBox label="Organizator" value={event.organizer_name} />}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {event.registration_url && (
              <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Zarejestruj się →
              </a>
            )}
            <button onClick={toggleSave} className={isSaved ? '' : 'btn-secondary'} style={{
              background: isSaved ? 'rgba(239,68,68,0.12)' : undefined,
              color: isSaved ? '#EF4444' : undefined,
              border: isSaved ? '1px solid rgba(239,68,68,0.3)' : undefined,
              borderRadius: '100px',
              padding: '10px 20px',
              fontFamily: 'DM Sans',
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}>
              {isSaved ? '❤️ Idę na to!' : '🤍 Idę na to'}
            </button>
          </div>
        </div>

        {/* ── DESCRIPTION ────────────────────────────────────────────── */}
        {event.description && (
          <div className="soft-card" style={{ padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.92)', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>O wydarzeniu</h2>
            <p className="article-content" style={{ whiteSpace: 'pre-line' }}>{event.description}</p>

            {event.registration_deadline && (
              <div style={{ marginTop: 18, background: 'rgba(255,92,0,0.07)', border: '1px solid rgba(255,92,0,0.18)', borderRadius: 10, padding: '10px 16px', color: 'var(--accent)', fontSize: '0.875rem' }}>
                ⏰ Rejestracja do: <strong>{formatDate(event.registration_deadline)}</strong>
              </div>
            )}
          </div>
        )}

        {/* ── MAP ────────────────────────────────────────────────────── */}
        {event.lat && event.lng && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.92)', marginBottom: 14, fontFamily: 'Syne, sans-serif' }}>📍 Lokalizacja</h2>
            <div ref={mapRef} style={{ height: 300, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '4px 4px 12px var(--shadow-dark)' }} />
          </div>
        )}

        {/* ── SHARE + ALERT ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Share */}
          <div className="soft-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.92)', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>Udostępnij</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#1877F2',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 100,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 4px 12px rgba(24,119,242,0.35)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.name)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#000',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 100,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                𝕏 Twitter
              </a>
              <button onClick={copyUrl} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                🔗 Kopiuj link
              </button>
            </div>
          </div>

          {/* Alert */}
          <div className="soft-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.92)', marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>🔔 Powiadom mnie</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginBottom: 14 }}>Przypomnienie 7 dni przed startem</p>
            {alertSent ? (
              <div style={{ color: '#4CAF50', fontSize: '0.875rem', fontWeight: 500 }}>✓ Ustawiono przypomnienie!</div>
            ) : (
              <form onSubmit={handleAlert} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="email@przykład.pl"
                  required
                  className="input"
                  style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '9px 16px', fontSize: '0.82rem', flexShrink: 0 }}>Ustaw</button>
              </form>
            )}
          </div>
        </div>

        {/* ── SIMILAR ─────────────────────────────────────────────────── */}
        {similar?.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.92)', marginBottom: 20, fontFamily: 'Syne, sans-serif' }}>Podobne starty</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {similar.map((e) => <EventCard key={e.id} event={e}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
