import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS } from '../utils/sports';

export default function Kalendarz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters from URL
  const [selectedSports, setSelectedSports] = useState(
    searchParams.get('sport_type') ? [searchParams.get('sport_type')] : []
  );
  const [voivodeship, setVoivodeship] = useState(searchParams.get('voivodeship') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [priceMax, setPriceMax] = useState(500);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  useEffect(() => {
    fetchEvents();
  }, [selectedSports, voivodeship, dateFrom, dateTo, search, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (selectedSports.length === 1) params.set('sport_type', selectedSports[0]);
      if (voivodeship) params.set('voivodeship', voivodeship);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (search) params.set('search', search);

      const data = await api.get(`/events?${params.toString()}`);
      setEvents(data.events);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (key) => {
    setSelectedSports((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedSports([]);
    setVoivodeship('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPriceMax(500);
    setPage(1);
  };

  const inputStyle = {
    width: '100%',
    background: '#0C0C0E',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: 'rgba(255,255,255,0.88)',
    padding: '9px 12px',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'DM Sans',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E' }}>
      {/* Header */}
      <div style={{ background: '#1C1C1F', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px' }}>
        <div className="max-w-7xl mx-auto">
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>
            Kalendarz startów
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
            {total} wydarzeń • Polska
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }} className="lg:grid-cols-sidebar">
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            <div style={{ background: '#141416', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                WYSZUKAJ
              </label>
              <input
                type="text"
                placeholder="Nazwa, miasto..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={inputStyle}
              />
            </div>

            {/* Sport types */}
            <div style={{ background: '#141416', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 12 }}>
                DYSCYPLINA
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(SPORT_TYPES).map(([key, sport]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(key)}
                      onChange={() => toggleSport(key)}
                      style={{ accentColor: sport.color, width: 15, height: 15 }}
                    />
                    <span style={{ color: selectedSports.includes(key) ? sport.color : 'rgba(255,255,255,0.6)', fontSize: '0.875rem', transition: 'color 0.2s' }}>
                      {sport.emoji} {sport.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Voivodeship */}
            <div style={{ background: '#141416', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                WOJEWÓDZTWO
              </label>
              <select
                value={voivodeship}
                onChange={(e) => { setVoivodeship(e.target.value); setPage(1); }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Wszystkie</option>
                {VOIVODESHIPS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div style={{ background: '#141416', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                ZAKRES DAT
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder="Od"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                style={inputStyle}
                placeholder="Do"
              />
            </div>

            {/* Price range */}
            <div style={{ background: '#141416', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                CENA MAKS: {priceMax === 500 ? 'brak limitu' : `${priceMax} zł`}
              </label>
              <input
                type="range"
                min={0}
                max={500}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Clear */}
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.5)',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'DM Sans',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF5C00'; e.currentTarget.style.color = '#FF5C00'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              Wyczyść filtry
            </button>
          </div>

          {/* Events grid */}
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ background: '#141416', borderRadius: 14, height: 200, border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 2s infinite' }} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏁</div>
                <h3 style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  Brak wydarzeń
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                  Spróbuj zmienić filtry lub wróć później.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {events
                    .filter((e) => !priceMax || priceMax === 500 || !e.price || e.price <= priceMax)
                    .map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  }
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      style={{
                        background: '#141416',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                        padding: '8px 16px',
                        cursor: page === 1 ? 'default' : 'pointer',
                        fontFamily: 'DM Sans',
                      }}
                    >
                      ← Poprzednia
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          style={{
                            background: p === page ? '#FF5C00' : '#141416',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            color: p === page ? 'white' : 'rgba(255,255,255,0.7)',
                            padding: '8px 14px',
                            cursor: 'pointer',
                            fontFamily: 'DM Sans',
                            fontWeight: p === page ? 500 : 400,
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      style={{
                        background: '#141416',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                        padding: '8px 16px',
                        cursor: page === totalPages ? 'default' : 'pointer',
                        fontFamily: 'DM Sans',
                      }}
                    >
                      Następna →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
