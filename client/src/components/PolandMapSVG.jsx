import React from 'react';

// City positions calculated as pixel values within 500×400 viewBox
const CITIES = [
  { id: 'waw', name: 'Warszawa',   cx: 290, cy: 160, sport: 'running',   color: '#4A90E2', events: 4 },
  { id: 'krk', name: 'Kraków',     cx: 255, cy: 280, sport: 'ocr',       color: '#E25C5C', events: 3 },
  { id: 'gdn', name: 'Gdańsk',     cx: 220, cy:  56, sport: 'triathlon', color: '#26C6DA', events: 2 },
  { id: 'wro', name: 'Wrocław',    cx: 135, cy: 228, sport: 'hyrox',     color: '#FF5C00', events: 2 },
  { id: 'poz', name: 'Poznań',     cx: 125, cy: 144, sport: 'cycling',   color: '#4CAF50', events: 2 },
  { id: 'ldz', name: 'Łódź',       cx: 238, cy: 192, sport: 'running',   color: '#4A90E2', events: 1 },
  { id: 'kat', name: 'Katowice',   cx: 228, cy: 290, sport: 'hyrox',     color: '#FF5C00', events: 1 },
  { id: 'lub', name: 'Lublin',     cx: 348, cy: 222, sport: 'trail',     color: '#AB47BC', events: 1 },
  { id: 'szc', name: 'Szczecin',   cx:  52, cy:  76, sport: 'cycling',   color: '#4CAF50', events: 1 },
  { id: 'rze', name: 'Rzeszów',    cx: 352, cy: 304, sport: 'ocr',       color: '#E25C5C', events: 1 },
  { id: 'bdk', name: 'Bydgoszcz',  cx: 182, cy: 104, sport: 'running',   color: '#4A90E2', events: 1 },
  { id: 'bst', name: 'Białystok',  cx: 368, cy:  96, sport: 'trail',     color: '#AB47BC', events: 1 },
];

const LEGEND = [
  { color: '#4A90E2', label: 'Bieganie'  },
  { color: '#E25C5C', label: 'OCR'       },
  { color: '#FF5C00', label: 'Hyrox'     },
  { color: '#26C6DA', label: 'Triathlon' },
  { color: '#4CAF50', label: 'Kolarstwo' },
  { color: '#AB47BC', label: 'Trail'     },
];

export default function PolandMapSVG() {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1.3' }}>
      <svg
        viewBox="0 0 500 400"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
        className="map-breathe"
      >
        <defs>
          {/* Grid lines — tactical map feel */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8"/>
          </pattern>
          {/* Ambient glow */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(255,92,0,0.06)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>
          {/* Pin glow filter */}
          <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <rect width="500" height="400" fill="url(#grid)"/>
        <rect width="500" height="400" fill="url(#mapGlow)"/>

        {/* Poland outline — simplified polygon */}
        <path
          d="M 115,55 L 145,35 L 175,25 L 220,20 L 265,22 L 300,18 L 330,28 L 355,40 L 370,55 L 380,75 L 375,95 L 390,110 L 395,130 L 385,150 L 375,165 L 385,185 L 380,205 L 360,220 L 355,240 L 340,255 L 325,265 L 310,280 L 295,295 L 270,305 L 255,315 L 240,320 L 215,315 L 195,310 L 175,300 L 160,285 L 145,270 L 125,260 L 110,245 L 100,225 L 90,205 L 85,185 L 80,165 L 85,145 L 80,125 L 85,105 L 95,85 L 105,68 Z"
          fill="rgba(255,92,0,0.05)"
          stroke="rgba(255,92,0,0.40)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* City pins */}
        {CITIES.map((city, i) => (
          <g key={city.id}>
            {/* Outer pulse ring */}
            <circle
              cx={city.cx}
              cy={city.cy}
              r="14"
              fill="none"
              stroke={city.color}
              strokeWidth="1"
              opacity="0.5"
              className="map-pin-ring"
              style={{ animationDelay: `${i * 0.22}s` }}
            />
            {/* Inner glow dot */}
            <circle
              cx={city.cx}
              cy={city.cy}
              r="5"
              fill={city.color}
              filter="url(#pinGlow)"
              className="map-pin-dot"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            {/* Center white dot */}
            <circle cx={city.cx} cy={city.cy} r="2.5" fill="white" opacity="0.9"/>

            {/* Tooltip label */}
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={city.cx - 32}
                y={city.cy - 30}
                width="64"
                height="22"
                rx="6"
                fill="rgba(22,26,33,0.95)"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="0.8"
                opacity="0"
                style={{ transition: 'opacity 0.2s' }}
              />
              <text
                x={city.cx}
                y={city.cy - 18}
                textAnchor="middle"
                fill="white"
                fontSize="8.5"
                fontFamily="DM Sans, sans-serif"
                fontWeight="600"
                opacity="0"
              >
                {city.name}
              </text>
              <text
                x={city.cx}
                y={city.cy - 10}
                textAnchor="middle"
                fill={city.color}
                fontSize="7.5"
                fontFamily="DM Sans, sans-serif"
                opacity="0"
              >
                {city.events} {city.events === 1 ? 'start' : 'starty'}
              </text>
            </g>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        background: 'rgba(22,26,33,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '8px 12px',
      }}>
        {LEGEND.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: item.color,
              boxShadow: `0 0 6px ${item.color}`,
              flexShrink: 0,
            }}/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
