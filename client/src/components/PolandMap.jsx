import React, { useState } from 'react';
import { SPORT_TYPES } from '../utils/sports';

// City pins as % of SVG viewBox (0 0 100 100)
const CITIES = [
  { name: 'Warszawa',   x: 62, y: 38, sport: 'running',   events: 4 },
  { name: 'Kraków',     x: 55, y: 68, sport: 'ocr',       events: 3 },
  { name: 'Gdańsk',     x: 48, y: 12, sport: 'triathlon', events: 2 },
  { name: 'Wrocław',    x: 30, y: 55, sport: 'hyrox',     events: 2 },
  { name: 'Poznań',     x: 28, y: 35, sport: 'cycling',   events: 2 },
  { name: 'Łódź',       x: 52, y: 47, sport: 'running',   events: 2 },
  { name: 'Katowice',   x: 48, y: 72, sport: 'hyrox',     events: 1 },
  { name: 'Lublin',     x: 74, y: 55, sport: 'trail',     events: 1 },
  { name: 'Szczecin',   x: 12, y: 18, sport: 'cycling',   events: 1 },
  { name: 'Rzeszów',    x: 72, y: 75, sport: 'ocr',       events: 1 },
];

// Simplified Poland outline polygon points (x y as % of 100×100 viewBox)
const POLAND_PATH = `
  M 8,19 L 12,13 L 22,6 L 32,4 L 42,4 L 48,7 L 55,5
  L 58,9 L 60,13 L 68,15 L 72,19 L 80,26 L 86,34
  L 88,42 L 88,54 L 85,62 L 82,70 L 77,78 L 70,85
  L 58,90 L 48,91 L 36,86 L 26,80 L 17,72 L 9,60
  L 5,50 L 5,36 L 8,25 Z
`.trim();

// Subtle grid lines
function GridLines() {
  const lines = [];
  for (let i = 10; i < 100; i += 10) {
    lines.push(
      <line key={`h${i}`} x1="0" y1={i} x2="100" y2={i} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />,
      <line key={`v${i}`} x1={i} y1="0" x2={i} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
    );
  }
  return <>{lines}</>;
}

function CityPin({ city, delay }) {
  const [hovered, setHovered] = useState(false);
  const sport = SPORT_TYPES[city.sport] || SPORT_TYPES.other;
  const color = sport.color;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default' }}
    >
      {/* Pulsing ring */}
      <circle
        cx={city.x} cy={city.y} r="3.5"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
        className="map-pin-ring"
        style={{ animationDelay: `${delay}s` }}
      />
      {/* Inner dot */}
      <circle
        cx={city.x} cy={city.y} r="2"
        fill={color}
        className="map-pin-dot"
        style={{ animationDelay: `${delay}s`, filter: `drop-shadow(0 0 3px ${color})` }}
      />
      {/* Tooltip */}
      {hovered && (
        <g>
          {/* Tooltip background */}
          <rect
            x={city.x > 65 ? city.x - 26 : city.x + 4}
            y={city.y - 14}
            width={city.name.length * 3 + 22}
            height={18}
            rx="3"
            fill="rgba(24,24,27,0.95)"
            stroke={color}
            strokeWidth="0.5"
          />
          <text
            x={city.x > 65 ? city.x - 14 : city.x + 15}
            y={city.y - 3}
            textAnchor="middle"
            fontSize="4.5"
            fill="rgba(255,255,255,0.9)"
            fontFamily="DM Sans, sans-serif"
            fontWeight="500"
          >
            {city.name}
          </text>
          <text
            x={city.x > 65 ? city.x - 14 : city.x + 15}
            y={city.y + 2.5}
            textAnchor="middle"
            fontSize="3.5"
            fill={color}
            fontFamily="DM Sans, sans-serif"
          >
            {city.events} {city.events === 1 ? 'start' : 'starty'}
          </text>
        </g>
      )}
    </g>
  );
}

export default function PolandMap() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      {/* Glow behind map */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '40%',
        width: '60%',
        height: '40%',
        background: 'radial-gradient(ellipse, rgba(255,92,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1 }}
        className="map-breathe"
      >
        <GridLines />

        {/* Poland outline */}
        <path
          d={POLAND_PATH}
          fill="rgba(255,92,0,0.04)"
          stroke="rgba(255,92,0,0.25)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* City pins */}
        {CITIES.map((city, i) => (
          <CityPin key={city.name} city={city} delay={i * 0.22} />
        ))}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'rgba(8,8,10,0.7)',
        borderRadius: 8,
        padding: '6px 10px',
        border: '1px solid var(--bg-border)',
        backdropFilter: 'blur(8px)',
      }}>
        {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').slice(0, 5).map(([key, sport]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: sport.color, boxShadow: `0 0 4px ${sport.color}` }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: 'DM Sans' }}>
              {sport.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
