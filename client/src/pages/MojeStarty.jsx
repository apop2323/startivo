import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import api from '../utils/api';

export default function MojeStarty() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    if (ids.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch all events and filter by saved IDs (simple approach for MVP)
      const data = await api.get('/events?limit=500&status=published');
      const saved = (data.events || []).filter((e) => ids.includes(e.id));
      setEvents(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = (eventId) => {
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    const newIds = ids.filter((id) => id !== eventId);
    localStorage.setItem('startivo_saved', JSON.stringify(newIds));
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E', padding: '32px 16px' }}>
      <div className="max-w-5xl mx-auto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>
              ❤️ Moje starty
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
              Zapisane lokalnie w Twojej przeglądarce
            </p>
          </div>
          {events.length > 0 && (
            <span style={{
              background: '#FF5C00',
              color: 'white',
              padding: '4px 14px',
              borderRadius: 100,
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              {events.length} {events.length === 1 ? 'event' : 'eventów'}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: '#141416', borderRadius: 14, height: 200 }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{
            background: '#141416',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '64px 32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤍</div>
            <h2 style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
              Brak zapisanych startów
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
              Kliknij ikonę serca ❤️ na karcie wydarzenia,<br />
              żeby dodać je do swojej listy.
            </p>
            <Link
              to="/kalendarz"
              style={{
                background: '#FF5C00',
                color: 'white',
                padding: '12px 28px',
                borderRadius: 100,
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              Przeglądaj starty →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {events.map((event) => (
              <div key={event.id} style={{ position: 'relative' }}>
                <EventCard event={event} onSaveToggle={(id, saved) => { if (!saved) handleRemove(id); }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
