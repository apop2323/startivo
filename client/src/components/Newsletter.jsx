import React, { useState } from 'react';
import api from '../utils/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await api.post('/subscribe', { email });
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Coś poszło nie tak. Spróbuj ponownie.');
    }
  };

  return (
    <section style={{ background: '#1C1C1F', padding: '64px 16px' }}>
      <div className="max-w-2xl mx-auto text-center">
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,92,0,0.1)',
          color: '#FF5C00',
          padding: '4px 16px',
          borderRadius: 100,
          fontSize: '0.8rem',
          fontWeight: 500,
          marginBottom: 16,
          border: '1px solid rgba(255,92,0,0.2)',
        }}>
          📬 Newsletter
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', marginBottom: 12, color: 'rgba(255,255,255,0.88)' }}>
          Bądź pierwszy o nowych startach
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
          Otrzymuj powiadomienia o nowych wydarzeniach w Twojej okolicy.<br />
          Zero spamu — tylko to, co ważne dla aktywnych.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 14,
            padding: '16px 24px',
            color: '#22C55E',
            fontWeight: 500,
          }}>
            ✅ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twój@email.pl"
              required
              style={{
                flex: 1,
                minWidth: 240,
                background: '#141416',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 100,
                padding: '12px 24px',
                color: 'rgba(255,255,255,0.88)',
                fontSize: '0.95rem',
                outline: 'none',
                maxWidth: 320,
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: '#FF5C00',
                color: 'white',
                border: 'none',
                borderRadius: 100,
                padding: '12px 28px',
                fontWeight: 500,
                fontSize: '0.95rem',
                cursor: status === 'loading' ? 'wait' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'opacity 0.2s',
                fontFamily: 'DM Sans',
              }}
            >
              {status === 'loading' ? 'Zapisuję...' : 'Zapisz się →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p style={{ color: '#EF4444', marginTop: 8, fontSize: '0.9rem' }}>{message}</p>
        )}
      </div>
    </section>
  );
}
