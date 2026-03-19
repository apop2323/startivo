import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { getSportInfo, getDifficultyInfo, formatDate, formatPrice, getDaysUntil } from '../utils/sports';
import EventCard from '../components/EventCard';
import { useToast } from '../context/ToastContext';

function DifficultyDots({ difficulty }) {
  const info = getDifficultyInfo(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4].map((d) => (
        <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: d <= info.dots ? info.color : 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
      ))}
      <span style={{ marginLeft: 6, color: info.color, fontSize: '0.85rem', fontWeight: 500 }}>{info.label}</span>
    </span>
  );
}

function InfoBox({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ color: highlight ? 'var(--accent)' : 'var(--text-primary)', fontFamily: highlight ? 'Syne' : 'DM Sans', fontWeight: highlight ? 800 : 500, fontSize: highlight ? '1.2rem' : '0.95rem' }}>{value}</div>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--bg-border)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Link to="/kalendarz" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ← Kalendarz startów
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* ── ANSWER BOX ─────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-card)',
          borderLeft: `4px solid ${sport.color}`,
          padding: 28,
          marginBottom: 20,
        }}>
          {/* Top row: sport + difficulty + countdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18, alignItems: 'center' }}>
            <span className="sport-badge" style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}30` }}>
              {sport.emoji} {sport.label}
            </span>
            {event.difficulty && <DifficultyDots difficulty={event.difficulty} />}
            {days >= 0 && (
              <span style={{
                marginLeft: 'auto',
                background: days <= 7 ? 'rgba(239,68,68,0.12)' : days <= 30 ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
                color: days <= 7 ? '#EF4444' : days <= 30 ? '#F59E0B' : 'var(--accent)',
                border: `1px solid ${days <= 7 ? 'rgba(239,68,68,0.25)' : days <= 30 ? 'rgba(245,158,11,0.25)' : 'rgba(255,92,0,0.25)'}`,
                borderRadius: 100,
                padding: '3px 12px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}>
                {days === 0 ? 'Dziś!' : `Za ${days} dni`}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: 24, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
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
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 16 }}>O wydarzeniu</h2>
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
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 14 }}>📍 Lokalizacja</h2>
            <div ref={mapRef} style={{ height: 300, borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--bg-border)' }} />
          </div>
        )}

        {/* ── SHARE + ALERT ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Share */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 22 }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>Udostępnij</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ background: '#1877F2', color: 'white', padding: '7px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                Facebook
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.name)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer"
                style={{ background: '#000', color: 'white', padding: '7px 14px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                X / Twitter
              </a>
              <button onClick={copyUrl} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>🔗 Kopiuj</button>
            </div>
          </div>

          {/* Alert */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 22 }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>🔔 Powiadom mnie</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12 }}>Przypomnienie 7 dni przed startem</p>
            {alertSent ? (
              <div style={{ color: '#22C55E', fontSize: '0.875rem' }}>✓ Ustawiono przypomnienie!</div>
            ) : (
              <form onSubmit={handleAlert} style={{ display: 'flex', gap: 6 }}>
                <input type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} placeholder="email@przykład.pl" required className="input" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem', flexShrink: 0 }}>Ustaw</button>
              </form>
            )}
          </div>
        </div>

        {/* ── SIMILAR ─────────────────────────────────────────────────── */}
        {similar?.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 16 }}>Podobne starty</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {similar.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
