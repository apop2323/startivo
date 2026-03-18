import React, { useState } from 'react';
import api from '../utils/api';

export default function Wspolpraca() {
  const [form, setForm] = useState({ name: '', company: '', email: '', inquiry_type: 'organizer', message: '' });
  const [status, setStatus] = useState('idle');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/contact', form);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

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
  };

  return (
    <div style={{ background: '#0C0C0E', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'radial-gradient(ellipse at top, rgba(255,92,0,0.06) 0%, transparent 60%), #0C0C0E',
        padding: '72px 16px 56px',
        textAlign: 'center',
      }}>
        <div className="max-w-3xl mx-auto">
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'rgba(255,255,255,0.88)', marginBottom: 16, lineHeight: 1.15 }}>
            Dotrzyj do aktywnej Polski
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px' }}>
            Startivo to jedyna platforma skupiająca wszystkich aktywnych Polaków w jednym miejscu. Dotrzyj do swojej grupy docelowej.
          </p>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, margin: '0 auto' }}>
            {[
              { value: '50K+', label: 'Użytkowników miesięcznie' },
              { value: '16', label: 'Województw' },
              { value: '6', label: 'Dyscyplin sportowych' },
            ].map((m) => (
              <div key={m.value} style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#FF5C00' }}>{m.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer offers */}
      <section style={{ background: '#1C1C1F', padding: '56px 16px' }}>
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', textAlign: 'center', marginBottom: 8 }}>
            Dla organizatorów
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 40 }}>
            Wypromuj swoje wydarzenie wśród tysięcy aktywnych Polaków
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="md:grid-cols-2">
            {/* Free */}
            <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 28 }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', fontSize: '1.3rem', marginBottom: 8 }}>
                Darmowe ogłoszenie
              </h3>
              <div style={{ fontFamily: 'Syne', fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 20 }}>
                0 zł
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Widoczność na liście wydarzeń',
                  'Pełna strona wydarzenia',
                  'Mapa lokalizacji',
                  'Formularz rejestracji (link)',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                    <span style={{ color: '#22C55E' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                style={{ marginTop: 24, background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '10px 20px', cursor: 'pointer', width: '100%', fontFamily: 'DM Sans', transition: 'all 0.2s' }}
              >
                Dodaj wydarzenie →
              </button>
            </div>

            {/* Premium */}
            <div style={{ background: '#141416', borderRadius: 14, border: '2px solid #FF5C00', padding: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 20, background: '#FF5C00', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: 100 }}>
                POLECANE
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.88)', fontSize: '1.3rem', marginBottom: 8 }}>
                Premium
              </h3>
              <div style={{ fontFamily: 'Syne', fontSize: '2rem', color: '#FF5C00', marginBottom: 4 }}>
                299 zł
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginBottom: 20 }}>miesięcznie</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Wszystko z planu darmowego',
                  '⭐ Wyróżnienie na stronie głównej',
                  'Pierwsze miejsce na liście',
                  'Badge "Polecane"',
                  'Statystyki wyświetleń',
                  'Priorytetowa weryfikacja (24h)',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
                    <span style={{ color: '#FF5C00' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                style={{ marginTop: 24, background: '#FF5C00', color: 'white', border: 'none', borderRadius: 100, padding: '12px 20px', cursor: 'pointer', width: '100%', fontWeight: 500, fontFamily: 'DM Sans', fontSize: '0.95rem', transition: 'opacity 0.2s' }}
              >
                Skontaktuj się →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Advertiser section */}
      <section style={{ padding: '56px 16px' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 8 }}>
            Dla reklamodawców
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.6, maxWidth: 560 }}>
            Twoja marka przed oczami najaktywniejszych Polaków. Sprzęt sportowy, suplementy, ubezpieczenia, aplikacje fitness — Startivo to Twój kanał.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '📧', label: 'Newsletter sponsoring', desc: 'Dedykowane mailing do subskrybentów' },
              { icon: '🏷️', label: 'Banner reklamowy', desc: 'Widoczny na stronie głównej i kalendarzu' },
              { icon: '⭐', label: 'Sponsored events', desc: 'Twoje wydarzenie na szczycie listy' },
              { icon: '🤝', label: 'Partnerstwo długoterm.', desc: 'Negocjujemy indywidualne pakiety' },
            ].map((o) => (
              <div key={o.label} style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{o.icon}</div>
                <div style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: '0.9rem', marginBottom: 4 }}>{o.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" style={{ background: '#1C1C1F', padding: '56px 16px' }}>
        <div className="max-w-xl mx-auto">
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: 'rgba(255,255,255,0.88)', marginBottom: 8 }}>
            Napisz do nas
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 28, fontSize: '0.9rem' }}>Odpiszemy w ciągu 24 godzin.</p>

          {status === 'success' ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: 24, color: '#22C55E', textAlign: 'center' }}>
              ✅ Wiadomość wysłana! Odpowiemy wkrótce.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="Imię i nazwisko" value={form.name} onChange={set('name')} style={inputStyle} />
                <input type="text" placeholder="Firma / Klub" value={form.company} onChange={set('company')} style={inputStyle} />
              </div>
              <input type="email" placeholder="Email *" value={form.email} onChange={set('email')} required style={inputStyle} />
              <select value={form.inquiry_type} onChange={set('inquiry_type')} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="organizer">Organizator — chcę dodać wydarzenie</option>
                <option value="premium">Zapytanie o plan Premium</option>
                <option value="advertiser">Reklamodawca</option>
                <option value="partnership">Partnerstwo długoterminowe</option>
                <option value="other">Inne</option>
              </select>
              <textarea placeholder="Wiadomość *" value={form.message} onChange={set('message')} required style={{ ...inputStyle, height: 120, resize: 'vertical' }} />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ background: '#FF5C00', color: 'white', border: 'none', borderRadius: 100, padding: '13px 28px', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans', fontSize: '0.95rem', alignSelf: 'flex-start' }}
              >
                {status === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość →'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
