import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { getSportInfo, getDifficultyInfo, formatDate, formatPrice } from '../utils/sports';
import EventCard from '../components/EventCard';
import DifficultyDots from '../components/DifficultyDots';

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{message}</div>;
}

export default function EventDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertStatus, setAlertStatus] = useState('idle');
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const savedIds = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
  const [isSaved, setIsSaved] = useState(savedIds.includes(parseInt(slug)) || false);

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${slug}`)
      .then((d) => {
        setData(d);
        setIsSaved(JSON.parse(localStorage.getItem('startivo_saved') || '[]').includes(d.event.id));
        // Increment view
        api.post(`/events/${d.event.id}/view`, {}).catch(() => {});
        // SEO: set page title
        document.title = `${d.event.name} | Startivo`;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!data?.event || !mapRef.current) return;
    const event = data.event;
    if (!event.lat || !event.lng) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Load Leaflet from window (loaded via CDN in HTML)
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current).setView([event.lat, event.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const sport = getSportInfo(event.sport_type);
    const marker = L.circleMarker([event.lat, event.lng], {
      radius: 12,
      fillColor: sport.color,
      color: 'white',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(map);

    marker.bindPopup(`<strong>${event.name}</strong><br>${event.city}`).openPopup();
    mapInstanceRef.current = map;
    return () => { if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, [data]);

  const toggleSave = () => {
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    const newIds = ids.includes(data.event.id)
      ? ids.filter((id) => id !== data.event.id)
      : [...ids, data.event.id];
    localStorage.setItem('startivo_saved', JSON.stringify(newIds));
    setIsSaved(newIds.includes(data.event.id));
    setToast(isSaved ? 'Usunięto z moich startów' : '❤️ Dodano do moich startów!');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast('🔗 Skopiowano link!');
  };

  const handleAlert = async (e) => {
    e.preventDefault();
    setAlertStatus('loading');
    try {
      await api.post(`/events/${data.event.id}/alert`, { email: alertEmail });
      setAlertStatus('success');
      setAlertEmail('');
    } catch (err) {
      setAlertStatus('error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C0C0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans' }}>Ładowanie...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C0C0E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>🏁</div>
        <h2 style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.6)' }}>Nie znaleziono wydarzenia</h2>
        <Link to="/kalendarz" style={{ color: '#FF5C00', textDecoration: 'none' }}>← Wróć do kalendarza</Link>
      </div>
    );
  }

  const { event, similar } = data;
  const sport = getSportInfo(event.sport_type);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.name,
    startDate: event.date_start,
    endDate: event.date_end || event.date_start,
    location: {
      '@type': 'Place',
      name: event.city,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressRegion: event.voivodeship,
        addressCountry: 'PL',
      },
    },
    organizer: event.organizer_name ? {
      '@type': 'Organization',
      name: event.organizer_name,
      email: event.organizer_email,
    } : undefined,
    url: event.event_website || window.location.href,
    description: event.description,
    offers: event.price ? {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: 'PLN',
      url: event.registration_url,
    } : undefined,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ background: '#141416', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
        <div className="max-w-4xl mx-auto">
          <Link to="/kalendarz" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Kalendarz startów
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Answer box */}
        <div style={{
          background: '#141416',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${sport.color}`,
          padding: 24,
          marginBottom: 24,
        }}>
          {/* Sport badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: `${sport.color}20`,
            color: sport.color,
            padding: '4px 12px',
            borderRadius: 100,
            fontSize: '0.8rem',
            fontWeight: 500,
            border: `1px solid ${sport.color}40`,
            marginBottom: 16,
          }}>
            {sport.emoji} {sport.label}
          </div>

          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'rgba(255,255,255,0.88)', marginBottom: 20, lineHeight: 1.2 }}>
            {event.name}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>DATA</div>
              <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                {formatDate(event.date_start)}
                {event.date_end && event.date_end !== event.date_start && ` — ${formatDate(event.date_end)}`}
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>MIASTO</div>
              <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                {event.city}, {event.voivodeship}
              </div>
            </div>
            {event.distance && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>DYSTANS</div>
                <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{event.distance}</div>
              </div>
            )}
            {event.difficulty && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>TRUDNOŚĆ</div>
                <DifficultyDots difficulty={event.difficulty} />
              </div>
            )}
            {event.price !== undefined && event.price !== null && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>CENA</div>
                <div style={{ color: '#FF5C00', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(event.price)}</div>
              </div>
            )}
            {event.max_participants && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>LIMIT</div>
                <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{event.max_participants.toLocaleString('pl-PL')} osób</div>
              </div>
            )}
            {event.organizer_name && (
              <div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginBottom: 4 }}>ORGANIZATOR</div>
                <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{event.organizer_name}</div>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#FF5C00',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: 100,
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Zarejestruj się →
              </a>
            )}
            <button
              onClick={toggleSave}
              style={{
                background: isSaved ? 'rgba(239,68,68,0.15)' : '#1C1C1F',
                color: isSaved ? '#EF4444' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isSaved ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                padding: '12px 20px',
                borderRadius: 100,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'DM Sans',
              }}
            >
              {isSaved ? '❤️ Idę na to!' : '🤍 Idę na to'}
            </button>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              O wydarzeniu
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {event.description}
            </p>

            {event.registration_deadline && (
              <div style={{
                marginTop: 16,
                background: 'rgba(255,92,0,0.08)',
                border: '1px solid rgba(255,92,0,0.2)',
                borderRadius: 10,
                padding: '10px 16px',
                color: '#FF5C00',
                fontSize: '0.875rem',
              }}>
                ⏰ Rejestracja do: <strong>{formatDate(event.registration_deadline)}</strong>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {event.lat && event.lng && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'rgba(255,255,255,0.88)', marginBottom: 12 }}>
              📍 Lokalizacja
            </h2>
            <div
              ref={mapRef}
              style={{
                height: 300,
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
          </div>
        )}

        {/* Share */}
        <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
            Udostępnij
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#1877F2', color: 'white', padding: '8px 16px', borderRadius: 100, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.name)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#000', color: 'white', padding: '8px 16px', borderRadius: 100, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}
            >
              X / Twitter
            </a>
            <button
              onClick={copyUrl}
              style={{ background: '#1C1C1F', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 100, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'DM Sans' }}
            >
              🔗 Kopiuj link
            </button>
          </div>
        </div>

        {/* Alert form */}
        <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.88)', marginBottom: 8 }}>
            🔔 Powiadom mnie
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: 16 }}>
            Wyślij mi przypomnienie 7 dni przed wydarzeniem.
          </p>
          {alertStatus === 'success' ? (
            <div style={{ color: '#22C55E', fontSize: '0.9rem' }}>✅ Ustawiono przypomnienie!</div>
          ) : (
            <form onSubmit={handleAlert} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="twój@email.pl"
                required
                style={{
                  flex: 1,
                  background: '#1C1C1F',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.88)',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'DM Sans',
                }}
              />
              <button
                type="submit"
                disabled={alertStatus === 'loading'}
                style={{
                  background: '#FF5C00',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                }}
              >
                Ustaw
              </button>
            </form>
          )}
        </div>

        {/* Similar events */}
        {similar && similar.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              Podobne starty
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
