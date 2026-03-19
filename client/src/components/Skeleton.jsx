import React from 'react';

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      padding: 0,
    }}>
      <div className="skeleton" style={{ height: 8, borderRadius: 0 }} />
      <div style={{ padding: '44px 16px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 14, width: 60 }} />
          <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 100 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonArticleCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 100, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '85%' }} />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 14, width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export default { SkeletonCard, SkeletonArticleCard, SkeletonText };
