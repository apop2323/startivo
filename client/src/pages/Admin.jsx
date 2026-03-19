import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSportInfo, formatDateShort, SPORT_TYPES } from '../utils/sports';

const TABS = ['Przegląd', 'Oczekujące', 'Wszystkie eventy', 'Artykuły', 'Subskrybenci', 'Zapytania', 'Ustawienia'];

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getToken() { return sessionStorage.getItem('startivo_jwt'); }
function setToken(t) { sessionStorage.setItem('startivo_jwt', t); }
function clearToken() { sessionStorage.removeItem('startivo_jwt'); }

async function adminFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token || ''}`,
      ...(options.headers || {}),
    },
    body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  });
  if (res.status === 401) { clearToken(); window.location.reload(); }
  return res;
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#0D0F14',
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'DM Sans, sans-serif',
  },
  topbar: {
    background: '#111318',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  card: {
    background: '#161A21',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.88)',
    padding: '10px 14px',
    fontSize: '0.88rem',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
  },
  label: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block', fontWeight: 500 },
  btnPrimary: {
    background: 'linear-gradient(135deg, #FF6B1A, #FF5C00)',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    padding: '9px 22px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  btnDanger: {
    background: 'transparent',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 100,
    padding: '7px 16px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  btnGhost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 100,
    padding: '7px 16px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  tag: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
    background: `${color}22`, color,
  }),
};

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        const data = await res.json();
        setError(data.error || 'Nieprawidłowe hasło');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0F14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#161A21',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
              <path d="M14 2L26 8.5V21.5L14 28L2 21.5V8.5L14 2Z" fill="#FF5C00" opacity="0.15" stroke="#FF5C00" strokeWidth="1.2"/>
              <path d="M14 8L19.5 11.5V18.5L14 22L8.5 18.5V11.5L14 8Z" fill="#FF5C00" opacity="0.9"/>
            </svg>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'rgba(255,255,255,0.92)' }}>
              Startivo
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>Panel administratora</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={shake ? 'shake' : ''}>
            <label style={S.label}>Hasło administratora</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...S.input, marginBottom: 16 }}
              placeholder="••••••••"
              autoFocus
            />
            {error && (
              <div style={{
                color: '#EF4444', fontSize: '0.82rem', marginBottom: 16,
                padding: '10px 14px', background: 'rgba(239,68,68,0.08)',
                borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)',
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              style={{ ...S.btnPrimary, width: '100%', padding: '12px', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    adminFetch('/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div style={{ color: 'rgba(255,255,255,0.35)', padding: '40px 0' }}>Ładowanie…</div>;

  const items = [
    { label: 'Opublikowane eventy', value: stats.published_events, color: '#22C55E' },
    { label: 'Oczekujące', value: stats.pending_events, color: '#F59E0B' },
    { label: 'Artykuły', value: stats.published_articles, color: '#4A90E2' },
    { label: 'Subskrybenci', value: stats.subscribers, color: '#FF5C00' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {items.map(item => (
        <div key={item.label} style={S.card}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: item.color, letterSpacing: '-0.04em' }}>
            {item.value ?? '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────
function EventsTab({ mode }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const path = mode === 'pending' ? '/admin/events/pending' : '/admin/events/all';
    adminFetch(path).then(r => r.json()).then(data => {
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    await adminFetch(`/admin/events/${id}/approve`, { method: 'PUT' });
    load();
  };
  const reject = async (id) => {
    await adminFetch(`/admin/events/${id}/reject`, { method: 'PUT' });
    load();
  };
  const toggleFeatured = async (id, current) => {
    await adminFetch(`/admin/events/${id}/featured`, { method: 'PUT', body: { featured: !current } });
    load();
  };
  const remove = async (id) => {
    if (!window.confirm('Usunąć event?')) return;
    await adminFetch(`/admin/events/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.35)', padding: 24 }}>Ładowanie…</div>;
  if (!events.length) return <div style={{ color: 'rgba(255,255,255,0.35)', padding: 24 }}>Brak eventów.</div>;

  return (
    <div>
      {events.map(ev => {
        const sport = getSportInfo(ev.sport_type);
        return (
          <div key={ev.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.95rem' }}>{ev.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={S.tag(sport.color)}>{sport.label}</span>
                <span>{formatDateShort(ev.date_start)}</span>
                <span>{ev.city}</span>
                {ev.featured && <span style={S.tag('#FF5C00')}>★ Wyróżniony</span>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
                Status: <span style={{ color: ev.status === 'published' ? '#22C55E' : ev.status === 'pending' ? '#F59E0B' : '#EF4444' }}>
                  {ev.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              {ev.status === 'pending' && (
                <>
                  <button style={S.btnPrimary} onClick={() => approve(ev.id)}>Zatwierdź</button>
                  <button style={S.btnDanger} onClick={() => reject(ev.id)}>Odrzuć</button>
                </>
              )}
              <button style={S.btnGhost} onClick={() => toggleFeatured(ev.id, ev.featured)}>
                {ev.featured ? '★ Odznacz' : '☆ Wyróżnij'}
              </button>
              <button style={S.btnDanger} onClick={() => remove(ev.id)}>Usuń</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Articles tab ─────────────────────────────────────────────────────────────
function ArticlesTab() {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | article object
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    adminFetch('/admin/articles').then(r => r.json()).then(data => {
      setArticles(Array.isArray(data) ? data : []);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', author_name: 'Redakcja Startivo', sport_type: 'running', status: 'draft', image_url: '' });
    setEditing('new');
  };
  const openEdit = (a) => { setForm({ ...a }); setEditing(a); };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await adminFetch('/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, image_url: data.url }));
    } catch {
      alert('Błąd uploadu');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const isNew = editing === 'new';
    const method = isNew ? 'POST' : 'PUT';
    const path = isNew ? '/admin/articles' : `/admin/articles/${form.id}`;
    const res = await adminFetch(path, { method, body: form });
    if (res.ok) { setEditing(null); load(); }
    else { const d = await res.json(); alert(d.error || 'Błąd zapisu'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Usunąć artykuł?')) return;
    await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
    load();
  };

  const autoSlug = (title) => title.toLowerCase()
    .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
    .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (editing !== null) {
    return (
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '1.1rem' }}>
            {editing === 'new' ? 'Nowy artykuł' : 'Edytuj artykuł'}
          </h3>
          <button style={S.btnGhost} onClick={() => setEditing(null)}>Anuluj</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Tytuł *</label>
            <input
              style={S.input}
              value={form.title || ''}
              onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: autoSlug(e.target.value) }))}
              placeholder="Tytuł artykułu"
            />
          </div>
          <div>
            <label style={S.label}>Slug</label>
            <input
              style={S.input}
              value={form.slug || ''}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Autor</label>
            <input style={S.input} value={form.author_name || ''} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
          </div>
          <div>
            <label style={S.label}>Dyscyplina</label>
            <select style={S.input} value={form.sport_type || ''} onChange={e => setForm(f => ({ ...f, sport_type: e.target.value }))}>
              {Object.entries(SPORT_TYPES).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Status</label>
            <select style={S.input} value={form.status || 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft">Szkic</option>
              <option value="published">Opublikowany</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Zdjęcie główne</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              style={{ ...S.input, flex: 1 }}
              value={form.image_url || ''}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="/images/articles/photo.jpg"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleImageUpload(e.target.files?.[0])}
            />
            <button
              style={{ ...S.btnGhost, whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '↑ Wgrywanie…' : '↑ Wgraj zdjęcie'}
            </button>
          </div>
          {form.image_url && (
            <img
              src={form.image_url}
              alt="preview"
              style={{ marginTop: 10, height: 120, borderRadius: 10, objectFit: 'cover', maxWidth: '100%' }}
            />
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Zajawka (excerpt)</label>
          <textarea
            style={{ ...S.input, resize: 'vertical', minHeight: 80 }}
            value={form.excerpt || ''}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Krótki opis artykułu…"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>Treść (Markdown / plain text)</label>
          <textarea
            style={{ ...S.input, resize: 'vertical', minHeight: 300, fontFamily: 'monospace', fontSize: '0.82rem' }}
            value={form.content || ''}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Treść artykułu…"
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btnPrimary} onClick={save}>Zapisz artykuł</button>
          <button style={S.btnGhost} onClick={() => setEditing(null)}>Anuluj</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button style={S.btnPrimary} onClick={openNew}>+ Nowy artykuł</button>
      </div>
      {!articles.length && <div style={{ color: 'rgba(255,255,255,0.35)' }}>Brak artykułów.</div>}
      {articles.map(a => {
        const sport = getSportInfo(a.sport_type);
        return (
          <div key={a.id} style={{ ...S.card, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {a.image_url && (
              <img src={a.image_url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={S.tag(sport.color)}>{sport.label}</span>
                <span>{a.author_name}</span>
                <span style={{ color: a.status === 'published' ? '#22C55E' : '#F59E0B' }}>{a.status}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button style={S.btnGhost} onClick={() => openEdit(a)}>Edytuj</button>
              <button style={S.btnDanger} onClick={() => remove(a.id)}>Usuń</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Subscribers tab ──────────────────────────────────────────────────────────
function SubscribersTab() {
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    adminFetch('/admin/subscribers').then(r => r.json()).then(d => setSubs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  return (
    <div>
      <div style={{ marginBottom: 16, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
        Łącznie: <strong style={{ color: '#fff' }}>{subs.length}</strong>
      </div>
      {subs.map(s => (
        <div key={s.id} style={{ ...S.card, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem' }}>{s.email}</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{formatDateShort(s.created_at)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Inquiries tab ────────────────────────────────────────────────────────────
function InquiriesTab() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    adminFetch('/admin/inquiries').then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  return (
    <div>
      {!items.length && <div style={{ color: 'rgba(255,255,255,0.35)' }}>Brak zapytań.</div>}
      {items.map(item => (
        <div key={item.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>{item.name}</strong>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{formatDateShort(item.created_at)}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            {item.email} · {item.inquiry_type}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>{item.message}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const [form, setForm] = useState({
    hero_image: '',
    hero_headline_1: '',
    hero_headline_2: '',
    hero_subtitle: '',
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    adminFetch('/admin/settings')
      .then(r => r.json())
      .then(d => setForm(f => ({ ...f, ...d })))
      .catch(() => {});
  }, []);

  const handleHeroUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await adminFetch('/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, hero_image: data.url }));
    } catch {
      alert('Błąd uploadu');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const res = await adminFetch('/admin/settings', { method: 'PUT', body: form });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div style={S.card}>
      <h3 style={{ margin: '0 0 24px', fontFamily: 'Syne, sans-serif', fontSize: '1.1rem' }}>Ustawienia strony głównej</h3>

      <div style={{ marginBottom: 20 }}>
        <label style={S.label}>Zdjęcie hero (URL lub wgraj)</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            style={{ ...S.input, flex: 1 }}
            value={form.hero_image || ''}
            onChange={e => setForm(f => ({ ...f, hero_image: e.target.value }))}
            placeholder="/images/hero-ocr.jpg"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleHeroUpload(e.target.files?.[0])}
          />
          <button
            style={{ ...S.btnGhost, whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Wgrywanie…' : '↑ Wgraj'}
          </button>
        </div>
        {form.hero_image && (
          <img
            src={form.hero_image}
            alt="Hero preview"
            style={{ marginTop: 12, height: 140, objectFit: 'cover', borderRadius: 12, maxWidth: '100%' }}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={S.label}>Nagłówek hero — linia 1</label>
          <input
            style={S.input}
            value={form.hero_headline_1 || ''}
            onChange={e => setForm(f => ({ ...f, hero_headline_1: e.target.value }))}
            placeholder="ZNAJDŹ SWÓJ"
          />
        </div>
        <div>
          <label style={S.label}>Nagłówek hero — linia 2</label>
          <input
            style={S.input}
            value={form.hero_headline_2 || ''}
            onChange={e => setForm(f => ({ ...f, hero_headline_2: e.target.value }))}
            placeholder="NASTĘPNY START."
          />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={S.label}>Podtytuł hero</label>
        <textarea
          style={{ ...S.input, minHeight: 80, resize: 'vertical' }}
          value={form.hero_subtitle || ''}
          onChange={e => setForm(f => ({ ...f, hero_subtitle: e.target.value }))}
        />
      </div>

      <button style={S.btnPrimary} onClick={save}>
        {saved ? '✓ Zapisano!' : 'Zapisz ustawienia'}
      </button>
    </div>
  );
}

// ─── Main Admin page ──────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setTokenState] = useState(getToken());
  const [tab, setTab] = useState(0);

  const handleLogin = (t) => { setToken(t); setTokenState(t); };
  const handleLogout = () => { clearToken(); setTokenState(null); };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const tabContent = [
    <OverviewTab key="overview" />,
    <EventsTab key="pending" mode="pending" />,
    <EventsTab key="all" mode="all" />,
    <ArticlesTab key="articles" />,
    <SubscribersTab key="subs" />,
    <InquiriesTab key="inquiries" />,
    <SettingsTab key="settings" />,
  ];

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="24" viewBox="0 0 28 30" fill="none">
            <path d="M14 2L26 8.5V21.5L14 28L2 21.5V8.5L14 2Z" fill="#FF5C00" opacity="0.15" stroke="#FF5C00" strokeWidth="1.2"/>
            <path d="M14 8L19.5 11.5V18.5L14 22L8.5 18.5V11.5L14 8Z" fill="#FF5C00" opacity="0.9"/>
          </svg>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
            Startivo Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{ ...S.btnGhost, fontSize: '0.78rem', padding: '6px 14px' }}
        >
          Wyloguj
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#111318',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 0, padding: '0 24px', whiteSpace: 'nowrap' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 18px',
                fontSize: '0.85rem',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: tab === i ? 600 : 400,
                color: tab === i ? '#FF5C00' : 'rgba(255,255,255,0.45)',
                borderBottom: `2px solid ${tab === i ? '#FF5C00' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={S.container}>
        {tabContent[tab]}
      </div>
    </div>
  );
}
