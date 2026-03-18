import React, { useState } from 'react';
import api from '../utils/api';
import { SPORT_TYPES, VOIVODESHIPS } from '../utils/sports';

const inputStyle = {
  width: '100%',
  background: '#0C0C0E',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: 'rgba(255,255,255,0.88)',
  padding: '10px 14px',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'DM Sans',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.8rem',
  fontWeight: 500,
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.02em',
};

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>{label.toUpperCase()}{required && ' *'}</label>
      {children}
    </div>
  );
}

export default function DodajEvent() {
  const [form, setForm] = useState({
    name: '', sport_type: '', date_start: '', date_end: '', city: '',
    voivodeship: '', description: '', distance: '', difficulty: '',
    max_participants: '', price: '', registration_url: '', registration_deadline: '',
    organizer_name: '', organizer_email: '', event_website: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await api.post('/events', form);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Błąd podczas wysyłania. Spróbuj ponownie.');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0C0C0E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(34,197,94,0.3)', padding: 40, textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 12 }}>
            Dziękujemy!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Twoje wydarzenie zostało przesłane do weryfikacji. Pojawi się na stronie po zatwierdzeniu przez administratora.
          </p>
          <button
            onClick={() => { setStatus('idle'); setForm({ name: '', sport_type: '', date_start: '', date_end: '', city: '', voivodeship: '', description: '', distance: '', difficulty: '', max_participants: '', price: '', registration_url: '', registration_deadline: '', organizer_name: '', organizer_email: '', event_website: '' }); }}
            style={{ marginTop: 24, background: '#FF5C00', color: 'white', border: 'none', borderRadius: 100, padding: '12px 28px', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans', fontSize: '0.95rem' }}
          >
            Dodaj kolejne
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0E', padding: '32px 16px' }}>
      <div className="max-w-2xl mx-auto">
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 8 }}>
          Dodaj wydarzenie
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32, fontSize: '0.9rem' }}>
          Twoje wydarzenie zostanie opublikowane po weryfikacji przez nasz zespół.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic info */}
          <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 0 }}>Podstawowe informacje</h3>

            <Field label="Nazwa wydarzenia" required>
              <input type="text" value={form.name} onChange={set('name')} required style={inputStyle} placeholder="np. Runmageddon Warszawa 2026" />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Dyscyplina" required>
                <select value={form.sport_type} onChange={set('sport_type')} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Wybierz dyscyplinę</option>
                  {Object.entries(SPORT_TYPES).map(([key, s]) => (
                    <option key={key} value={key}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trudność">
                <select value={form.difficulty} onChange={set('difficulty')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Wybierz trudność</option>
                  <option value="easy">Łatwy</option>
                  <option value="medium">Średni</option>
                  <option value="hard">Trudny</option>
                  <option value="extreme">Ekstremalny</option>
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Data startu" required>
                <input type="date" value={form.date_start} onChange={set('date_start')} required style={inputStyle} />
              </Field>
              <Field label="Data zakończenia">
                <input type="date" value={form.date_end} onChange={set('date_end')} style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 0 }}>Lokalizacja</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Miasto" required>
                <input type="text" value={form.city} onChange={set('city')} required style={inputStyle} placeholder="np. Warszawa" />
              </Field>
              <Field label="Województwo" required>
                <select value={form.voivodeship} onChange={set('voivodeship')} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Wybierz województwo</option>
                  {VOIVODESHIPS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Details */}
          <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 0 }}>Szczegóły</h3>

            <Field label="Opis">
              <textarea value={form.description} onChange={set('description')} style={{ ...inputStyle, height: 120, resize: 'vertical' }} placeholder="Opisz wydarzenie..." />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Dystans">
                <input type="text" value={form.distance} onChange={set('distance')} style={inputStyle} placeholder="np. 10 km" />
              </Field>
              <Field label="Limit uczestników">
                <input type="number" value={form.max_participants} onChange={set('max_participants')} style={inputStyle} placeholder="np. 500" />
              </Field>
              <Field label="Cena (zł)">
                <input type="number" value={form.price} onChange={set('price')} style={inputStyle} placeholder="np. 150" />
              </Field>
            </div>
          </div>

          {/* Registration & Organizer */}
          <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', marginBottom: 0 }}>Rejestracja i organizator</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Link do rejestracji">
                <input type="url" value={form.registration_url} onChange={set('registration_url')} style={inputStyle} placeholder="https://..." />
              </Field>
              <Field label="Deadline rejestracji">
                <input type="date" value={form.registration_deadline} onChange={set('registration_deadline')} style={inputStyle} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nazwa organizatora">
                <input type="text" value={form.organizer_name} onChange={set('organizer_name')} style={inputStyle} placeholder="np. Runmageddon Sp. z o.o." />
              </Field>
              <Field label="Email organizatora">
                <input type="email" value={form.organizer_email} onChange={set('organizer_email')} style={inputStyle} placeholder="info@event.pl" />
              </Field>
            </div>

            <Field label="Strona www wydarzenia">
              <input type="url" value={form.event_website} onChange={set('event_website')} style={inputStyle} placeholder="https://..." />
            </Field>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: '0.875rem' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: status === 'loading' ? 'rgba(255,92,0,0.5)' : '#FF5C00',
              color: 'white',
              border: 'none',
              borderRadius: 100,
              padding: '14px 32px',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              fontFamily: 'DM Sans',
              transition: 'opacity 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {status === 'loading' ? 'Wysyłanie...' : 'Wyślij do weryfikacji →'}
          </button>
        </form>
      </div>
    </div>
  );
}
