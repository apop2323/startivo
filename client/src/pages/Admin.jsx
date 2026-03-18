import React, { useState, useEffect } from 'react';
import { getSportInfo, formatDateShort } from '../utils/sports';
import api from '../utils/api';

const TABS = ['Oczekujące', 'Wszystkie', 'Statystyki', 'Subskrybenci', 'Zapytania'];

function AdminHeader({ password, onLogout }) {
  return (
    <div style={{ background: '#141416', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#FF5C00', fontSize: '1.2rem' }}>
        Startivo Admin
      </span>
      <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, color: 'rgba(255,255,255,0.5)', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans' }}>
        Wyloguj
      </button>
    </div>
  );
}

function EventRow({ event, onApprove, onReject, onDelete, showActions = true }) {
  const sport = getSportInfo(event.sport_type);
  return (
    <div style={{ background: '#1C1C1F', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: '0.9rem', marginBottom: 4 }}>{event.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          {sport.emoji} {sport.label} · {event.city} · {formatDateShort(event.date_start)}
        </div>
      </div>
      <div style={{
        background: event.status === 'published' ? 'rgba(34,197,94,0.15)' : event.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
        color: event.status === 'published' ? '#22C55E' : event.status === 'pending' ? '#F59E0B' : '#EF4444',
        padding: '3px 10px',
        borderRadius: 100,
        fontSize: '0.75rem',
        fontWeight: 500,
      }}>
        {event.status === 'published' ? 'Opublikowane' : event.status === 'pending' ? 'Oczekujące' : 'Odrzucone'}
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: 6 }}>
          {event.status === 'pending' && (
            <>
              <button onClick={() => onApprove(event.id)} style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans' }}>
                ✓ Zatwierdź
              </button>
              <button onClick={() => onReject(event.id)} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans' }}>
                ✗ Odrzuć
              </button>
            </>
          )}
          <button onClick={() => onDelete(event.id)} style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans' }}>
            🗑
          </button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [inputPw, setInputPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pending, setPending] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = { 'x-admin-password': password };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPw }),
      });
      if (res.ok) {
        setPassword(inputPw);
        setInputPw('');
      } else {
        setLoginError('Nieprawidłowe hasło');
      }
    } catch {
      setLoginError('Błąd połączenia');
    }
  };

  useEffect(() => {
    if (!password) return;
    loadData();
  }, [password, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        const data = await fetch('/api/admin/events/pending', { headers: authHeader }).then(r => r.json());
        setPending(Array.isArray(data) ? data : []);
      } else if (activeTab === 1) {
        const data = await fetch('/api/admin/events/all', { headers: authHeader }).then(r => r.json());
        setAllEvents(Array.isArray(data) ? data : []);
      } else if (activeTab === 2) {
        const data = await fetch('/api/stats/admin', { headers: authHeader }).then(r => r.json());
        setStats(data);
      } else if (activeTab === 3) {
        const data = await fetch('/api/subscribers', { headers: authHeader }).then(r => r.json());
        setSubscribers(Array.isArray(data) ? data : []);
      } else if (activeTab === 4) {
        const data = await fetch('/api/contact', { headers: authHeader }).then(r => r.json());
        setInquiries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    await fetch(`/api/admin/events/${id}/approve`, { method: 'PUT', headers: authHeader });
    setPending((prev) => prev.filter((e) => e.id !== id));
  };

  const reject = async (id) => {
    await fetch(`/api/admin/events/${id}/reject`, { method: 'PUT', headers: authHeader });
    setPending((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE', headers: authHeader });
    setPending((prev) => prev.filter((e) => e.id !== id));
    setAllEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Login screen
  if (!password) {
    return (
      <div style={{ minHeight: '100vh', background: '#0C0C0E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 40, width: '100%', maxWidth: 360, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, color: '#FF5C00', fontSize: '1.5rem', marginBottom: 8 }}>Startivo</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 24, fontSize: '1.1rem' }}>Panel administracyjny</h2>
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="Hasło administratora"
              value={inputPw}
              onChange={(e) => setInputPw(e.target.value)}
              required
              style={{ background: '#1C1C1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.88)', padding: '12px 14px', fontSize: '0.95rem', outline: 'none', fontFamily: 'DM Sans' }}
            />
            {loginError && <div style={{ color: '#EF4444', fontSize: '0.85rem' }}>{loginError}</div>}
            <button type="submit" style={{ background: '#FF5C00', color: 'white', border: 'none', borderRadius: 100, padding: '12px', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans', fontSize: '0.95rem' }}>
              Zaloguj →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      <AdminHeader password={password} onLogout={() => setPassword('')} />

      {/* Tabs */}
      <div style={{ background: '#141416', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0, padding: '0 24px', overflowX: 'auto' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === i ? '2px solid #FF5C00' : '2px solid transparent',
              color: activeTab === i ? '#FF5C00' : 'rgba(255,255,255,0.5)',
              padding: '14px 16px',
              cursor: 'pointer',
              fontFamily: 'DM Sans',
              fontSize: '0.875rem',
              fontWeight: activeTab === i ? 500 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
            {i === 0 && pending.length > 0 && (
              <span style={{ marginLeft: 6, background: '#EF4444', color: 'white', borderRadius: 100, padding: '1px 6px', fontSize: '0.7rem' }}>
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {loading && <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>Ładowanie...</div>}

        {/* Pending */}
        {!loading && activeTab === 0 && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              Oczekujące ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>✅ Brak oczekujących wydarzeń</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map((e) => (
                  <EventRow key={e.id} event={e} onApprove={approve} onReject={reject} onDelete={deleteEvent} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All events */}
        {!loading && activeTab === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              Wszystkie wydarzenia ({allEvents.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allEvents.map((e) => (
                <EventRow key={e.id} event={e} onApprove={approve} onReject={reject} onDelete={deleteEvent} />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && activeTab === 2 && stats && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>Statystyki</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 4 }}>SUBSKRYBENCI</div>
                <div style={{ fontFamily: 'Syne', fontSize: '2rem', color: '#FF5C00' }}>{stats.total_subscribers}</div>
              </div>
              <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 4 }}>NOWE ZAPYTANIA</div>
                <div style={{ fontFamily: 'Syne', fontSize: '2rem', color: '#F59E0B' }}>{stats.new_inquiries}</div>
              </div>
            </div>

            <h3 style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: 12 }}>Statusy wydarzeń</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {stats.by_status?.map((s) => (
                <div key={s.status} style={{ background: '#141416', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: 4 }}>{s.status?.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Syne', fontSize: '1.5rem', color: 'rgba(255,255,255,0.88)' }}>{s.count}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: 12 }}>Wg dyscypliny</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {stats.by_sport?.map((s) => {
                const sport = getSportInfo(s.sport_type);
                return (
                  <div key={s.sport_type} style={{ background: `${sport.color}15`, border: `1px solid ${sport.color}30`, borderRadius: 10, padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{sport.emoji}</span>
                    <span style={{ color: sport.color, fontWeight: 500, fontSize: '0.875rem' }}>{s.count}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{sport.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscribers */}
        {!loading && activeTab === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              Subskrybenci ({subscribers.length})
            </h2>
            <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              {subscribers.map((s, i) => (
                <div key={s.id} style={{ padding: '12px 16px', borderBottom: i < subscribers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.875rem', flex: 1 }}>{s.email}</span>
                  {s.region && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{s.region}</span>}
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{new Date(s.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiries */}
        {!loading && activeTab === 4 && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 16 }}>
              Zapytania ({inquiries.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inquiries.map((inq) => (
                <div key={inq.id} style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: '0.9rem' }}>{inq.name || 'Anonim'}</span>
                      {inq.company && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}> — {inq.company}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#FF5C00', fontSize: '0.8rem' }}>{inq.inquiry_type}</span>
                      <span style={{
                        background: inq.status === 'new' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                        color: inq.status === 'new' ? '#F59E0B' : '#6B7280',
                        padding: '2px 8px',
                        borderRadius: 100,
                        fontSize: '0.75rem',
                      }}>
                        {inq.status === 'new' ? 'Nowe' : 'Przeczytane'}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>{inq.email}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: 1.6 }}>{inq.message}</div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: 8 }}>{new Date(inq.created_at).toLocaleString('pl-PL')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
