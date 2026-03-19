import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSportInfo, getDifficultyInfo, formatDateShort, getDaysUntil, formatPrice } from '../utils/sports';

function DifficultyDots({ difficulty }) {
  const info = getDifficultyInfo(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4].map((d) => (
        <span key={d} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: d <= info.dots ? info.color : 'rgba(255,255,255,0.12)',
          display: 'inline-block',
        }} />
      ))}
      <span style={{ marginLeft: 5, color: info.color, fontSize: '0.78rem', fontWeight: 500 }}>
        {info.label}
      </span>
    </span>
  );
}

export default function EventCard({ event, variant = 'grid', onSaveToggle }) {
  const sport = getSportInfo(event.sport_type);
  const daysUntil = getDaysUntil(event.date_start);

  const savedIds = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
  const [isSaved, setIsSaved] = useState(savedIds.includes(event.id));

  const countdownClass =
    daysUntil < 0 ? 'countdown-past' :
    daysUntil <= 7 ? 'countdown-urgent' :
    daysUntil <= 30 ? 'countdown-soon' : 'countdown-normal';

  const countdownText =
    daysUntil < 0 ? 'Zakończone' :
    daysUntil === 0 ? 'Dziś!' :
    `Za ${daysUntil} dni`;

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    const newIds = ids.includes(event.id)
      ? ids.filter((id) => id !== event.id)
      : [...ids, event.id];
    localStorage.setItem('startivo_saved', JSON.stringify(newIds));
    setIsSaved(newIds.includes(event.id));
    if (onSaveToggle) onSaveToggle(event.id, newIds.includes(event.id));
  };

  const href = `/event/${event.slug || event.id}`;

  if (variant === 'list') {
    return (
      <Link to={href} style={{ textDecoration: 'none' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
          {/* Sport stripe */}
          <div style={{ width: 4, background: sport.color, flexShrink: 0, borderRadius: 'var(--radius-card) 0 0 var(--radius-card)' }} />
          <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{sport.emoji}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.25 }}>{event.name}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📅 {formatDateShort(event.date_start)}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📍 {event.city}</span>
                {event.distance && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>🏁 {event.distance}</span>}
                {event.difficulty && <DifficultyDots difficulty={event.difficulty} />}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)', fontSize: '1rem' }}>{formatPrice(event.price)}</span>
              <span className={`countdown-pill ${countdownClass}`} style={{ fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px', borderRadius: 100 }}>{countdownText}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleSave}
                style={{
                  background: isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSaved ? 'rgba(239,68,68,0.3)' : 'var(--bg-border)'}`,
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isSaved ? '#EF4444' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {isSaved ? '❤️' : '🤍'}
              </button>
              <div className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>
                Zobacz →
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default)
  return (
    <Link to={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Top color strip */}
        <div style={{ height: 8, background: `linear-gradient(90deg, ${sport.color} 0%, ${sport.color}80 100%)` }} />

        {/* Sport badge + save button */}
        <div style={{ padding: '12px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sport-badge" style={{ background: `${sport.color}18`, color: sport.color, border: `1px solid ${sport.color}30` }}>
            {sport.emoji} {sport.label}
          </span>
          <button
            onClick={handleSave}
            style={{
              background: isSaved ? 'rgba(239,68,68,0.12)' : 'transparent',
              border: `1px solid ${isSaved ? 'rgba(239,68,68,0.35)' : 'var(--bg-border)'}`,
              borderRadius: '50%',
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s var(--ease-expo)',
              flexShrink: 0,
            }}
            title={isSaved ? 'Usuń z moich startów' : 'Idę na to!'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '10px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3, flex: '0 0 auto' }}>
            {event.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, flex: 1 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              📅 {new Date(event.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              📍 {event.city}, {event.voivodeship}
            </span>
            {event.distance && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>🏁 {event.distance}</span>
            )}
          </div>

          {event.difficulty && (
            <div style={{ marginBottom: 10 }}>
              <DifficultyDots difficulty={event.difficulty} />
            </div>
          )}

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--bg-border)' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)', fontSize: '1.05rem' }}>
              {formatPrice(event.price)}
            </span>
            <span
              className={countdownClass}
              style={{ fontSize: '0.75rem', fontWeight: 500, padding: '3px 9px', borderRadius: 100 }}
            >
              {countdownText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
