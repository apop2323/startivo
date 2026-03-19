import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/subscribe', { email });
      setDone(true);
      addToast('Zapisano! Będziesz pierwszy/a o nowych startach. 🎉', 'success');
    } catch {
      addToast('Coś poszło nie tak. Spróbuj ponownie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      background: 'linear-gradient(135deg, rgba(255,92,0,0.07) 0%, var(--bg-base) 100%)',
      borderTop: '1px solid rgba(255,92,0,0.12)',
      borderBottom: '1px solid var(--bg-border)',
      padding: '72px 20px',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <span className="section-label" style={{ marginBottom: 16 }}>📬 Newsletter</span>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'var(--text-primary)', marginBottom: 12 }}>
          Bądź pierwszy o nowych startach
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 36, lineHeight: 1.7, fontWeight: 300 }}>
          Zero spamu. Tylko starty, które Cię interesują.<br />
          Najnowsze zawody prosto na Twoją skrzynkę.
        </p>

        {done ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--radius-card)',
            padding: '20px 28px',
            color: '#22C55E',
            fontWeight: 500,
            fontSize: '1rem',
          }}>
            ✓ Zapisano! Będziesz pierwszy/a o nowych startach.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twój@email.pl"
              required
              className="input"
              style={{
                flex: '1 1 220px',
                maxWidth: 320,
                borderRadius: 'var(--radius-btn)',
                padding: '12px 22px',
                fontSize: '0.95rem',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Zapisuję...' : 'Zapisz się →'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
