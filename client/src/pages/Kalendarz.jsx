import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { SkeletonCard } from '../components/Skeleton';
import { SportIcon } from '../components/SportIcons';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS } from '../utils/sports';

const INPUT_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.92)',
  padding: '9px 12px',
  fontSize: '0.84rem',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
};

export default function Kalendarz() {
  const [searchParams] = useSearchParams();

  // Filters
  const [search, setSearch]           = useState(searchParams.get('search') || '');
  const [selectedSports, setSelectedSports] = useState(
    searchParams.get('sport_type') ? [searchParams.get('sport_type')] : []
  );
  const [voivodeship, setVoivodeship] = useState(searchParams.get('voivodeship') || '');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [priceMax, setPriceMax]       = useState(500);
  const [sortBy, setSortBy]           = useState('date');
  const [viewMode, setViewMode]       = useState('grid');
  const [page, setPage]               = useState(1);

  // Data
  const [events, setEvents]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (selectedSports.length === 1) params.set('sport_type', selectedSports[0]);
      if (voivodeship) params.set('voivodeship', voivodeship);
      if (dateFrom)    params.set('date_from', dateFrom);
      if (dateTo)      params.set('date_to', dateTo);
      if (search)      params.set('search', search);
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
    if (type === 'search')      setSearch('');
    if (type === 'voivodeship') setVoivodeship('');
    if (type === 'dateFrom')    setDateFrom('');
    if (type === 'dateTo')      setDateTo('');
    if (type.startsWith('sport:'))
      setSelectedSports((p) => p.filter((s) => s !== type.replace('sport:', '')));
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
    ...(dateTo   ? [{ label: `Do ${dateTo}`,   type: 'dateTo'   }] : []),
    ...selectedSports.map((s) => ({ label: SPORT_TYPES[s]?.label || s, type: `sport:${s}` })),
  ];

  const sortedEvents = [...events]
    .filter((e) => priceMax >= 500 || !e.price || e.price <= priceMax)
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name')       return a.name.localeCompare(b.name, 'pl');
      return new Date(a.date_start) - new Date(b.date_start);
    });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <span className="section-label" style={{ marginBottom: 10 }}>📅 Starty</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'rgba(255,255,255,0.92)', marginBottom: 6 }}>
            Kalendarz startów
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: 20 }}>
            {loading ? '...' : `${total} wydarzeń`} · Polska 2026
          </p>

          {/* ── SPORT FILTER PILLS — horizontal scroll ─────────────────────── */}
          <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 16, marginBottom: 0 }}>
            {/* ALL pill */}
            <button
              onClick={() => { setSelectedSports([]); setPage(1); }}
              style={{
                flexShrink: 0,
                background: selectedSports.length === 0 ? 'rgba(255,92,0,0.15)' : 'var(--bg-card)',
                color: selectedSports.length === 0 ? '#FF5C00' : 'rgba(255,255,255,0.55)',
                border: `1px solid ${selectedSports.length === 0 ? 'rgba(255,92,0,0.40)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 100,
                padding: '7px 18px',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s',
                boxShadow: selectedSports.length === 0
                  ? '0 0 14px rgba(255,92,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '2px 2px 6px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.02)',
              }}
            >
              Wszystkie
            </button>

            {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport]) => {
              const active = selectedSports.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleSport(key)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: active ? `${sport.color}18` : 'var(--bg-card)',
                    color: active ? sport.color : 'rgba(255,255,255,0.55)',
                    border: `1px solid ${active ? sport.color + '50' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 100,
                    padding: '7px 18px',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: active ? 600 : 400,
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                    boxShadow: active
                      ? `0 0 14px ${sport.color}30, inset 0 1px 0 rgba(255,255,255,0.06)`
                      : '2px 2px 6px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.02)',
                  }}
                >
                  <SportIcon sport={key} size={14} color={active ? sport.color : 'rgba(255,255,255,0.40)'}/>
                  {sport.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>

        {/* ── SECONDARY FILTERS ROW ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 16,
          padding: '14px 18px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          boxShadow: '3px 3px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)',
        }}>
          {/* Text search */}
          <div style={{ position: 'relative', flex: '2 1 200px', minWidth: 0 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Szukaj po nazwie, mieście..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ ...INPUT_STYLE, width: '100%', paddingLeft: 30 }}
            />
          </div>

          {/* Voivodeship */}
          <select
            value={voivodeship}
            onChange={(e) => { setVoivodeship(e.target.value); setPage(1); }}
            style={{ ...INPUT_STYLE, flex: '1 1 150px', minWidth: 0 }}
          >
            <option value="">Województwo</option>
            {VOIVODESHIPS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            style={{ ...INPUT_STYLE, flex: '1 1 130px', minWidth: 0 }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            style={{ ...INPUT_STYLE, flex: '1 1 130px', minWidth: 0 }}
          />

          {/* Price slider */}
          <div style={{ flex: '1 1 150px', minWidth: 120 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
              Cena maks.: {priceMax >= 500 ? 'bez limitu' : `${priceMax} zł`}
            </div>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
            />
          </div>
        </div>

        {/* ── TOOLBAR: active pills + sort + view ────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          {/* Active filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
            {activeFilters.length > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginRight: 4 }}>Filtry:</span>
            )}
            {activeFilters.map((f) => (
              <span
                key={f.type}
                style={{
                  background: 'rgba(255,92,0,0.12)',
                  color: '#FF5C00',
                  border: '1px solid rgba(255,92,0,0.25)',
                  borderRadius: 100,
                  padding: '3px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {f.label}
                <button
                  onClick={() => removeFilter(f.type)}
                  style={{ background: 'none', border: 'none', color: '#FF5C00', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1, opacity: 0.7 }}
                >
                  ×
                </button>
              </span>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={clearAll}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', cursor: 'pointer', fontSize: '0.76rem', fontFamily: 'DM Sans, sans-serif', padding: '3px 8px' }}
              >
                Wyczyść wszystko
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
              {loading ? '...' : `${sortedEvents.length} wyników`}
            </span>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...INPUT_STYLE, padding: '7px 12px', fontSize: '0.8rem' }}
            >
              <option value="date">Data ↑</option>
              <option value="price_asc">Cena ↑</option>
              <option value="price_desc">Cena ↓</option>
              <option value="name">Nazwa A-Z</option>
            </select>
            {/* View toggle */}
            {[
              { v: 'grid', icon: '⊞', title: 'Siatka' },
              { v: 'list', icon: '☰', title: 'Lista'  },
            ].map(({ v, icon, title }) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                title={title}
                style={{
                  background: viewMode === v ? 'rgba(255,92,0,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${viewMode === v ? 'rgba(255,92,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '7px 11px',
                  cursor: 'pointer',
                  color: viewMode === v ? '#FF5C00' : 'rgba(255,255,255,0.50)',
                  transition: 'all 0.2s',
                  fontSize: '1rem',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── EVENTS GRID / LIST ─────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 14 }}>
            {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i}/>)}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😔</div>
            <h3 style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>Brak wyników</h3>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.9rem', marginBottom: 28 }}>
              Nie znaleźliśmy startów dla wybranych kryteriów.
            </p>
            <button onClick={clearAll} className="btn-primary">Zresetuj filtry</button>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
              gap: 14,
              marginBottom: 36,
            }}>
              {sortedEvents.map((e) => (
                <EventCard key={e.id} event={e} variant={viewMode === 'list' ? 'list' : 'grid'}/>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-secondary"
                  style={{ padding: '7px 16px', fontSize: '0.85rem', opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Poprzednia
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  return start + i;
                }).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      background: p === page ? '#FF5C00' : 'var(--bg-card)',
                      color: p === page ? 'white' : 'rgba(255,255,255,0.55)',
                      border: `1px solid ${p === page ? '#FF5C00' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      padding: '7px 14px',
                      cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: p === page ? 700 : 400,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      boxShadow: p === page ? '0 4px 12px rgba(255,92,0,0.35)' : 'none',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn-secondary"
                  style={{ padding: '7px 16px', fontSize: '0.85rem', opacity: page === totalPages ? 0.4 : 1 }}
                >
                  Następna →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
