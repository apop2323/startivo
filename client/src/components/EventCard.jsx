import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSportInfo, getDifficultyInfo, formatDateShort, getDaysUntil, formatPrice } from '../utils/sports';
import { SportIcon } from './SportIcons';

// Difficulty dots with glow
function DifficultyDots({ difficulty }) {
  const info = getDifficultyInfo(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4].map((d) => (
        <span
          key={d}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: d <= info.dots ? info.color : 'rgba(255,255,255,0.12)',
            boxShadow: d <= info.dots ? `0 0 6px ${info.color}` : 'none',
            display: 'inline-block',
            transition: 'all 0.2s',
          }}
        />
      ))}
      <span style={{ marginLeft: 5, color: info.color, fontSize: '0.75rem', fontWeight: 500 }}>
        {info.label}
      </span>
    </span>
  );
}

// Countdown helper returning inline style info
function getCountdownStyle(daysLeft) {
  if (daysLeft < 0)  return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)', text: 'Zakończony' };
  if (daysLeft === 0) return { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444',  text: 'Dziś!'    };
  if (daysLeft <= 7)  return { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444',  text: `Za ${daysLeft} dni` };
  if (daysLeft <= 30) return { bg: 'rgba(251,211,36,0.12)', color: '#FBD324',  text: `Za ${daysLeft} dni` };
  return { bg: 'rgba(255,92,0,0.10)', color: '#FF5C00', text: `Za ${daysLeft} dni` };
}

export default function EventCard({ event, variant = 'grid', onSaveToggle }) {
  const sport     = getSportInfo(event.sport_type);
  const daysUntil = getDaysUntil(event.date_start);
  const savedIds  = JSON.parse(localStorage.getItem('startivo_saved') || '[]');
  const [isSaved, setIsSaved] = useState(savedIds.includes(event.id));
  const countdown = getCountdownStyle(daysUntil);

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

  // ── LIST variant ──────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <Link to={href} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          className="soft-card"
          style={{ display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}
        >
          {/* Sport stripe left */}
          <div style={{
            width: 5,
            background: `linear-gradient(180deg, ${sport.color} 0%, ${sport.color}60 100%)`,
            flexShrink: 0,
            borderRadius: 'var(--radius-card) 0 0 var(--radius-card)',
          }}/>
          <div style={{
            flex: 1,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            {/* Icon */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${sport.color}14`,
              border: `1px solid ${sport.color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <SportIcon sport={event.sport_type} size={22} color={sport.color}/>
            </div>
            {/* Main info */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.92)',
                marginBottom: 5,
                lineHeight: 1.25,
              }}>
                {event.name}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.8rem' }}>
                  📅 {formatDateShort(event.date_start)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.8rem' }}>
                  📍 {event.city}
                </span>
                {event.distance && (
                  <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.8rem' }}>
                    🏁 {event.distance}
                  </span>
                )}
                {event.difficulty && <DifficultyDots difficulty={event.difficulty}/>}
              </div>
            </div>
            {/* Price + countdown */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                color: '#FF5C00',
                fontSize: '1rem',
              }}>
                {formatPrice(event.price)}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: 100,
                background: countdown.bg,
                color: countdown.color,
              }}>
                {countdown.text}
              </span>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleSave}
                style={{
                  background: isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSaved ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '7px 11px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isSaved ? '#EF4444' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.2s',
                }}
              >
                {isSaved ? '♥' : '♡'}
              </button>
              <div className="btn-primary" style={{ padding: '7px 18px', fontSize: '0.82rem' }}>
                Zobacz →
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── GRID variant (default) ────────────────────────────────────────────────
  return (
    <Link to={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="soft-card"
        style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top color strip */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${sport.color} 0%, ${sport.color}60 100%)`,
        }}/>

        {/* Sport badge + save */}
        <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            className="sport-badge"
            style={{ background: `${sport.color}14`, color: sport.color, border: `1px solid ${sport.color}28` }}
          >
            <SportIcon sport={event.sport_type} size={12} color={sport.color}/>
            {sport.label}
          </span>
          <button
            onClick={handleSave}
            style={{
              background: isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isSaved ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: isSaved ? '#EF4444' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              flexShrink: 0,
            }}
            title={isSaved ? 'Usuń z moich startów' : 'Idę na to!'}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.02rem',
            color: 'rgba(255,255,255,0.92)',
            marginBottom: 10,
            lineHeight: 1.3,
            flex: '0 0 auto',
          }}>
            {event.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10, flex: 1 }}>
            <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.82rem' }}>
              📅 {new Date(event.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.82rem' }}>
              📍 {event.city}{event.voivodeship ? `, ${event.voivodeship}` : ''}
            </span>
            {event.distance && (
              <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '0.82rem' }}>
                🏁 {event.distance}
              </span>
            )}
          </div>

          {event.difficulty && (
            <div style={{ marginBottom: 12 }}>
              <DifficultyDots difficulty={event.difficulty}/>
            </div>
          )}

          {/* Bottom row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#FF5C00', fontSize: '1.05rem' }}>
              {formatPrice(event.price)}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 100,
              background: countdown.bg,
              color: countdown.color,
            }}>
              {countdown.text}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
