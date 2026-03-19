import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { SkeletonCard } from '../components/Skeleton';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS } from '../utils/sports';

const SELECT_STYLE = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--bg-border)',
  borderRadius: 10,
  color: 'var(--text-secondary)',
  padding: '9px 12px',
  fontSize: '0.85rem',
  outline: 'none',
  fontFamily: 'DM Sans',
  cursor: 'pointer',
};

const LABEL_STYLE = {
  color: 'var(--text-tertiary)',
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 7,
};

export default function Kalendarz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSports, setSelectedSports] = useState(
    searchParams.get('sport_type') ? [searchParams.get('sport_type')] : []
  );
  const [voivodeship, setVoivodeship] = useState(searchParams.get('voivodeship') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMax, setPriceMax] = useState(500);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  // Data
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (selectedSports.length === 1) params.set('sport_type', selectedSports[0]);
      if (voivodeship) params.set('voivodeship', voivodeship);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (search) params.set('search', search);
      const data = await api.get(`/events?${params.toString()}`);
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSports, voivodeship, dateFrom, dateTo, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const toggleSport = (key) => {
    setSelectedSports((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
    setPage(1);
  };

  const removeFilter = (type) => {
    if (type === 'search') setSearch('');
    if (type === 'voivodeship') setVoivodeship('');
    if (type === 'dateFrom') setDateFrom('');
    if (type === 'dateTo') setDateTo('');
    if (type.startsWith('sport:')) setSelectedSports((p) => p.filter((s) => s !== type.replace('sport:', '')));
    setPage(1);
  };

  const clearAll = () => {
    setSearch(''); setSelectedSports([]); setVoivodeship('');
    setDateFrom(''); setDateTo(''); setPriceMax(500); setPage(1);
  };

  const activeFilters = [
    ...(search ? [{ label: `"${search}"`, type: 'search' }] : []),
    ...(voivodeship ? [{ label: voivodeship, type: 'voivodeship' }] : []),
    ...(dateFrom ? [{ label: `Od ${dateFrom}`, type: 'dateFrom' }] : []),
    ...(dateTo ? [{ label: `Do ${dateTo}`, type: 'dateTo' }] : []),
    ...selectedSports.map((s) => ({ label: SPORT_TYPES[s]?.label || s, type: `sport:${s}` })),
  ];

  const sortedEvents = [...events].filter((e) => priceMax >= 500 || !e.price || e.price <= priceMax).sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'pl');
    return new Date(a.date_start) - new Date(b.date_start);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--bg-border)', padding: '24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: 4 }}>
            Kalendarz startów
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {loading ? '...' : `${total} wydarzeń`} · Polska
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ────────────────────────────────────────────────── */}
        <aside className="hide-mobile" style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 80 }}>

          {/* Search */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
            <label style={LABEL_STYLE}>Szukaj</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', fontSize: '0.85rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Nazwa, miasto..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input"
                style={{ paddingLeft: 30 }}
              />
            </div>
          </div>

          {/* Sport type */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
            <label style={LABEL_STYLE}>Dyscyplina</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport]) => {
                const active = selectedSports.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleSport(key)}
                    style={{
                      background: active ? `${sport.color}20` : 'rgba(255,255,255,0.04)',
                      color: active ? sport.color : 'var(--text-secondary)',
                      border: `1px solid ${active ? sport.color + '50' : 'var(--bg-border)'}`,
                      borderRadius: 100,
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: active ? 500 : 400,
                      cursor: 'pointer',
                      fontFamily: 'DM Sans',
                      transition: 'all 0.2s var(--ease-expo)',
                    }}
                  >
                    {sport.emoji} {sport.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voivodeship */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
            <label style={LABEL_STYLE}>Województwo</label>
            <select value={voivodeship} onChange={(e) => { setVoivodeship(e.target.value); setPage(1); }} style={SELECT_STYLE}>
              <option value="">Wszystkie</option>
              {VOIVODESHIPS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Date */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
            <label style={LABEL_STYLE}>Zakres dat</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input" style={{ marginBottom: 8 }} />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="input" />
          </div>

          {/* Price */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
            <label style={LABEL_STYLE}>
              Cena maks.: {priceMax >= 500 ? 'bez limitu' : `${priceMax} zł`}
            </label>
            <input type="range" min={0} max={500} step={10} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
          </div>

          {/* Reset */}
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Wyczyść filtry
            </button>
          )}
        </aside>

        {/* ── EVENTS ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            {/* Active filter pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {activeFilters.map((f) => (
                <span key={f.type} style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(255,92,0,0.2)',
                  borderRadius: 100,
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  {f.label}
                  <button onClick={() => removeFilter(f.type)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {/* Sort */}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...SELECT_STYLE, width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}>
                <option value="date">Data</option>
                <option value="price_asc">Cena ↑</option>
                <option value="price_desc">Cena ↓</option>
                <option value="name">Nazwa</option>
              </select>
              {/* View toggle */}
              {['grid', 'list'].map((v) => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  background: viewMode === v ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${viewMode === v ? 'rgba(255,92,0,0.3)' : 'var(--bg-border)'}`,
                  borderRadius: 8,
                  padding: '6px 9px',
                  cursor: 'pointer',
                  color: viewMode === v ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  fontSize: '0.9rem',
                }} title={v === 'grid' ? 'Siatka' : 'Lista'}>
                  {v === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>

          {/* Events */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 12 }}>
              {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : sortedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😔</div>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Brak wyników</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: 24 }}>
                Nie znaleźliśmy startów dla wybranych kryteriów.
              </p>
              <button onClick={clearAll} className="btn-primary">Zresetuj filtry</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 12, marginBottom: 32 }}>
                {sortedEvents.map((e) => (
                  <EventCard key={e.id} event={e} variant={viewMode === 'list' ? 'list' : 'grid'} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>← Poprzednia</button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                    return start + i;
                  }).map((p) => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      background: p === page ? 'var(--accent)' : 'var(--bg-card)',
                      color: p === page ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 8,
                      padding: '7px 13px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans',
                      fontWeight: p === page ? 600 : 400,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}>{p}</button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Następna →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
