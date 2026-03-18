import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSportInfo, getDifficultyInfo, formatDateShort, getDaysUntil, getCountdownColor, formatPrice } from '../utils/sports';

export default function EventCard({ event, onSaveToggle }) {
  const sport = getSportInfo(event.sport_type);
  const difficulty = getDifficultyInfo(event.difficulty);
  const daysUntil = getDaysUntil(event.date_start);
  const countdownColor = getCountdownColor(daysUntil);

  const savedIds = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
  const [isSaved, setIsSaved] = useState(savedIds.includes(event.id));

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
    let newIds;
    if (ids.includes(event.id)) {
      newIds = ids.filter((id) => id !== event.id);
      setIsSaved(false);
    } else {
      newIds = [...ids, event.id];
      setIsSaved(true);
    }
    localStorage.setItem('startivo_saved', JSON.stringify(newIds));
    if (onSaveToggle) onSaveToggle(event.id, newIds.includes(event.id));
  };

  return (
    <Link to={`/event/${event.slug || event.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card-hover"
        style={{
          background: '#141416',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          position: 'relative',
          borderLeft: `3px solid ${sport.color}`,
        }}
      >
        {/* Sport badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: `${sport.color}20`,
          color: sport.color,
          padding: '3px 10px',
          borderRadius: 100,
          fontSize: '0.75rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          border: `1px solid ${sport.color}40`,
        }}>
          {sport.emoji} {sport.label}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${isSaved ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
          title={isSaved ? 'Usuń z moich startów' : 'Idę na to!'}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>

        <div style={{ padding: '48px 16px 16px' }}>
          {/* Event name */}
          <h3 style={{
            fontFamily: 'Syne',
            fontWeight: 800,
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.88)',
            marginBottom: 8,
            lineHeight: 1.3,
          }}>
            {event.name}
          </h3>

          {/* Date & City */}
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: 4 }}>
            📅 {formatDateShort(event.date_start)}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', marginBottom: 12 }}>
            📍 {event.city}, {event.voivodeship}
          </p>

          {/* Details row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            {event.distance && (
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                🏁 {event.distance}
              </span>
            )}
            {event.difficulty && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: difficulty.color }}>
                {[1, 2, 3, 4].map((d) => (
                  <span key={d} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: d <= difficulty.dots ? difficulty.color : 'rgba(255,255,255,0.15)',
                    display: 'inline-block',
                  }} />
                ))}
                <span style={{ marginLeft: 4 }}>{difficulty.label}</span>
              </span>
            )}
          </div>

          {/* Bottom row: price + countdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#FF5C00', fontWeight: 500, fontSize: '0.95rem' }}>
              {formatPrice(event.price)}
            </span>
            <span style={{
              color: countdownColor,
              fontSize: '0.8rem',
              fontWeight: 500,
              background: `${countdownColor}15`,
              padding: '3px 8px',
              borderRadius: 100,
              border: `1px solid ${countdownColor}30`,
            }}>
              {daysUntil < 0 ? 'Zakończone' : daysUntil === 0 ? 'Dziś!' : `Za ${daysUntil} dni`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
