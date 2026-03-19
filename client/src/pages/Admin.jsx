import React, { useState, useEffect, useCallback } from 'react';
import { getSportInfo, formatDateShort } from '../utils/sports';

const TABS = ['Przegląd', 'Oczekujące', 'Wszystkie eventy', 'Artykuły', 'Subskrybenci', 'Zapytania'];

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getToken() { return sessionStorage.getItem('startivo_admin_token'); }
function setToken(t) { sessionStorage.setItem('startivo_admin_token', t); }
function clearToken() { sessionStorage.removeItem('startivo_admin_token'); }

async function adminFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': token || '',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401) { clearToken(); window.location.reload(); }
  return res;
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        onLogin(data.token);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'RATE_LIMITED') {
          setLocked(true);
          setError('Zbyt wiele prób. Spróbuj ponownie za 15 minut.');
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setError(newAttempts >= 4 ? `Nieprawidłowe hasło (${5 - newAttempts} próba pozostała)` : 'Nieprawidłowe hasło');
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className={shake ? 'shake' : ''} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-card)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 360,
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 4 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 4 }}>Panel administracyjny</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 28 }}>Dostęp tylko dla administratora Startivo</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            placeholder="Hasło administratora"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={locked || loading}
            className="input"
            style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.95rem' }}
            autoFocus
          />
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '8px 14px', color: '#EF4444', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading || locked} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem', opacity: (loading || locked) ? 0.6 : 1 }}>
            {loading ? 'Sprawdzam...' : 'Zaloguj się →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'var(--accent)' }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color }}>{value ?? '—'}</div>
    </div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────
function EventRow({ event, onApprove, onReject, onDelete, onFeatured }) {
  const sport = getSportInfo(event.sport_type);
  const statusColors = { published: '#22C55E', pending: '#F59E0B', rejected: '#EF4444' };
  const statusLabels = { published: 'Opublikowane', pending: 'Oczekujące', rejected: 'Odrzucone' };

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem', marginBottom: 3 }}>{event.name}</div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
          {sport.emoji} {sport.label} · {event.city} · {formatDateShort(event.date_start)}
          {event.organizer_email && ` · ${event.organizer_email}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {event.featured && <span style={{ background: 'rgba(255,92,0,0.12)', color: 'var(--accent)', border: '1px solid rgba(255,92,0,0.2)', borderRadius: 100, padding: '2px 8px', fontSize: '0.72rem' }}>⭐ Featured</span>}
        <span style={{
          background: `${statusColors[event.status]}18`,
          color: statusColors[event.status] || 'var(--text-secondary)',
          padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 500,
        }}>
          {statusLabels[event.status] || event.status}
        </span>
        {event.status === 'pending' && onApprove && (
          <button onClick={() => onApprove(event.id)} style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '4px 11px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
            ✓ Zatwierdź
          </button>
        )}
        {event.status === 'pending' && onReject && (
          <button onClick={() => onReject(event.id)} style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '4px 11px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
            ✗ Odrzuć
          </button>
        )}
        {event.status === 'published' && onFeatured && (
          <button onClick={() => onFeatured(event.id, !event.featured)} style={{ background: event.featured ? 'rgba(255,92,0,0.12)' : 'rgba(255,255,255,0.04)', color: event.featured ? 'var(--accent)' : 'var(--text-secondary)', border: `1px solid ${event.featured ? 'rgba(255,92,0,0.25)' : 'var(--bg-border)'}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
            {event.featured ? '⭐' : '☆'} Featured
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(event.id)} style={{ background: 'transparent', border: '1px solid var(--bg-border)', borderRadius: 8, padding: '4px 9px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'DM Sans' }}>🗑</button>
        )}
      </div>
    </div>
  );
}

// ─── Main admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setTokenState] = useState(getToken());
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [newArticle, setNewArticle] = useState({ title: '', slug: '', excerpt: '', content: '', author_name: 'Redakcja Startivo', sport_type: 'running', status: 'published' });

  const handleLogin = (t) => setTokenState(t);
  const handleLogout = () => { clearToken(); setTokenState(null); };

  const loadTab = useCallback(async (tab) => {
    if (!getToken()) return;
    setLoading(true);
    try {
      let url = '';
      if (tab === 0) url = '/stats/admin';
      else if (tab === 1) url = '/admin/events/pending';
      else if (tab === 2) url = `/admin/events/all${eventSearch ? `?search=${eventSearch}` : ''}`;
      else if (tab === 3) url = '/admin/articles';
      else if (tab === 4) url = '/subscribers';
      else if (tab === 5) url = '/contact';

      const res = await adminFetch(url);
      const json = await res.json();
      setData((prev) => ({ ...prev, [tab]: json }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [eventSearch]);

  useEffect(() => { if (token) loadTab(activeTab); }, [token, activeTab, loadTab]);

  const approve = async (id) => {
    await adminFetch(`/admin/events/${id}/approve`, { method: 'PUT' });
    setData((p) => ({ ...p, 1: (p[1] || []).filter((e) => e.id !== id) }));
  };
  const reject = async (id) => {
    await adminFetch(`/admin/events/${id}/reject`, { method: 'PUT' });
    setData((p) => ({ ...p, 1: (p[1] || []).filter((e) => e.id !== id) }));
  };
  const deleteEvent = async (id) => {
    if (!window.confirm('Usunąć to wydarzenie?')) return;
    await adminFetch(`/events/${id}`, { method: 'DELETE' });
    setData((p) => ({ ...p, 1: (p[1] || []).filter((e) => e.id !== id), 2: (p[2] || []).filter((e) => e.id !== id) }));
  };
  const toggleFeatured = async (id, val) => {
    await adminFetch(`/admin/events/${id}/featured`, { method: 'PUT', body: { featured: val } });
    setData((p) => ({ ...p, 2: (p[2] || []).map((e) => e.id === id ? { ...e, featured: val } : e) }));
  };
  const deleteArticle = async (id) => {
    if (!window.confirm('Usunąć ten artykuł?')) return;
    await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
    setData((p) => ({ ...p, 3: (p[3] || []).filter((a) => a.id !== id) }));
  };
  const saveArticle = async (e) => {
    e.preventDefault();
    const res = await adminFetch('/admin/articles', { method: 'POST', body: newArticle });
    if (res.ok) {
      const art = await res.json();
      setData((p) => ({ ...p, 3: [art, ...(p[3] || [])] }));
      setNewArticle({ title: '', slug: '', excerpt: '', content: '', author_name: 'Redakcja Startivo', sport_type: 'running', status: 'published' });
      alert('Artykuł dodany!');
    }
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const pending = data[1] || [];
  const stats = data[0] || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--bg-border)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>⚡ Startivo Admin</span>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>Wyloguj</button>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--bg-border)', display: 'flex', overflowX: 'auto', padding: '0 16px' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === i ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '14px 16px',
            cursor: 'pointer',
            fontFamily: 'DM Sans',
            fontSize: '0.875rem',
            fontWeight: activeTab === i ? 500 : 400,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.2s',
          }}>
            {tab}
            {i === 1 && pending.length > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: 100, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 600 }}>{pending.length}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>Ładowanie...</div>}

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {!loading && activeTab === 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 20 }}>Przegląd</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
              {(stats.by_status || []).map((s) => (
                <StatCard key={s.status} label={s.status || 'brak'} value={s.count}
                  color={s.status === 'published' ? '#22C55E' : s.status === 'pending' ? '#F59E0B' : '#EF4444'} />
              ))}
              <StatCard label="Subskrybenci" value={stats.total_subscribers} />
              <StatCard label="Nowe zapytania" value={stats.new_inquiries} color="#F59E0B" />
            </div>

            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Wg dyscypliny</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              {(stats.by_sport || []).map((s) => {
                const sport = getSportInfo(s.sport_type);
                return (
                  <div key={s.sport_type} style={{ background: `${sport.color}12`, border: `1px solid ${sport.color}25`, borderRadius: 10, padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{sport.emoji}</span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, color: sport.color }}>{s.count}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{sport.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PENDING ───────────────────────────────────────────────── */}
        {!loading && activeTab === 1 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 20 }}>Oczekujące ({pending.length})</h2>
            {!pending.length ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>✅ Brak oczekujących wydarzeń</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map((e) => <EventRow key={e.id} event={e} onApprove={approve} onReject={reject} onDelete={deleteEvent} />)}
              </div>
            )}
          </div>
        )}

        {/* ── ALL EVENTS ────────────────────────────────────────────── */}
        {!loading && activeTab === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0 }}>Wszystkie eventy ({(data[2] || []).length})</h2>
              <input type="text" placeholder="🔍 Szukaj..." value={eventSearch} onChange={(e) => setEventSearch(e.target.value)}
                className="input" style={{ width: 220 }} onKeyDown={(e) => e.key === 'Enter' && loadTab(2)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data[2] || []).map((e) => <EventRow key={e.id} event={e} onDelete={deleteEvent} onFeatured={toggleFeatured} />)}
            </div>
          </div>
        )}

        {/* ── ARTICLES ──────────────────────────────────────────────── */}
        {!loading && activeTab === 3 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 20 }}>Artykuły</h2>

            {/* Add form */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 22, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16 }}>Nowy artykuł</h3>
              <form onSubmit={saveArticle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input required placeholder="Tytuł *" value={newArticle.title} onChange={(e) => setNewArticle((p) => ({ ...p, title: e.target.value }))} className="input" />
                <input required placeholder="Slug (np. jak-zaczac-biegac)" value={newArticle.slug} onChange={(e) => setNewArticle((p) => ({ ...p, slug: e.target.value }))} className="input" />
                <textarea required placeholder="Excerpt (krótki opis) *" value={newArticle.excerpt} onChange={(e) => setNewArticle((p) => ({ ...p, excerpt: e.target.value }))} className="input" style={{ resize: 'vertical', height: 80 }} />
                <select value={newArticle.sport_type} onChange={(e) => setNewArticle((p) => ({ ...p, sport_type: e.target.value }))} className="input">
                  {['running','ocr','hyrox','triathlon','cycling','trail','other'].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <textarea placeholder="Treść artykułu (pełna)" value={newArticle.content} onChange={(e) => setNewArticle((p) => ({ ...p, content: e.target.value }))} className="input" style={{ resize: 'vertical', height: 100, gridColumn: '1/-1' }} />
                <button type="submit" className="btn-primary" style={{ gridColumn: '1/-1', justifyContent: 'center' }}>Dodaj artykuł</button>
              </form>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data[3] || []).map((a) => {
                const sport = getSportInfo(a.sport_type);
                return (
                  <div key={a.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', borderRadius: 12, padding: '13px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem' }}>{sport.emoji}</span>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{a.title}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>{a.slug} · {a.status}</div>
                    </div>
                    <button onClick={() => deleteArticle(a.id)} style={{ background: 'transparent', border: '1px solid var(--bg-border)', borderRadius: 8, padding: '4px 9px', cursor: 'pointer', color: 'var(--text-tertiary)', fontFamily: 'DM Sans', fontSize: '0.8rem' }}>🗑 Usuń</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUBSCRIBERS ───────────────────────────────────────────── */}
        {!loading && activeTab === 4 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 20 }}>Subskrybenci ({(data[4] || []).length})</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              {(data[4] || []).map((s, i) => (
                <div key={s.id} style={{ padding: '11px 18px', borderBottom: i < (data[4].length - 1) ? '1px solid var(--bg-border)' : 'none', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1 }}>{s.email}</span>
                  {s.region && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.region}</span>}
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{new Date(s.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              ))}
              {!(data[4] || []).length && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Brak subskrybentów</div>}
            </div>
          </div>
        )}

        {/* ── INQUIRIES ─────────────────────────────────────────────── */}
        {!loading && activeTab === 5 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 20 }}>Zapytania ({(data[5] || []).length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(data[5] || []).map((inq) => (
                <div key={inq.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{inq.name || 'Anonim'}</span>
                      {inq.company && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> — {inq.company}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>{inq.inquiry_type}</span>
                      <span style={{ background: inq.status === 'new' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)', color: inq.status === 'new' ? '#F59E0B' : 'var(--text-tertiary)', padding: '2px 8px', borderRadius: 100, fontSize: '0.72rem' }}>
                        {inq.status === 'new' ? 'Nowe' : 'Przeczytane'}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 8 }}>{inq.email}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px 14px' }}>{inq.message}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginTop: 8 }}>{new Date(inq.created_at).toLocaleString('pl-PL')}</div>
                </div>
              ))}
              {!(data[5] || []).length && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>Brak zapytań</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
