import React from 'react';
import { getDifficultyInfo } from '../utils/sports';

export default function DifficultyDots({ difficulty, showLabel = true }) {
  const info = getDifficultyInfo(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4].map((d) => (
        <span key={d} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: d <= info.dots ? info.color : 'rgba(255,255,255,0.15)',
          display: 'inline-block',
        }} />
      ))}
      {showLabel && (
        <span style={{ marginLeft: 6, color: info.color, fontSize: '0.85rem', fontWeight: 500 }}>
          {info.label}
        </span>
      )}
    </span>
  );
}
