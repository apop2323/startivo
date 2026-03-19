export const SPORT_TYPES = {
  running:   { label: 'Bieganie',        emoji: '🏃', color: '#4A90E2' },
  ocr:       { label: 'OCR / Przeszkody',emoji: '💪', color: '#E25C5C' },
  hyrox:     { label: 'Hyrox',           emoji: '🏋️', color: '#FF5C00' },
  triathlon: { label: 'Triathlon',       emoji: '🏊', color: '#26C6DA' },
  cycling:   { label: 'Kolarstwo',       emoji: '🚴', color: '#4CAF50' },
  trail:     { label: 'Trail Running',   emoji: '⛰️', color: '#AB47BC' },
  other:     { label: 'Inne',            emoji: '🏅', color: '#6B7280' },
};

export const DIFFICULTY_LABELS = {
  easy: { label: 'Łatwy', dots: 1, color: '#22C55E' },
  medium: { label: 'Średni', dots: 2, color: '#F59E0B' },
  hard: { label: 'Trudny', dots: 3, color: '#F97316' },
  extreme: { label: 'Ekstremalny', dots: 4, color: '#EF4444' },
};

export const VOIVODESHIPS = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
];

export const getSportInfo = (sportType) =>
  SPORT_TYPES[sportType] || SPORT_TYPES.other;

export const getDifficultyInfo = (difficulty) =>
  DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDaysUntil = (dateStr) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

export const getCountdownColor = (days) => {
  if (days < 0) return '#6B7280';
  if (days <= 7) return '#EF4444';
  if (days <= 30) return '#F59E0B';
  return '#FF5C00';
};

export const formatPrice = (price) => {
  if (!price || price === 0) return 'Bezpłatny';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(price);
};
