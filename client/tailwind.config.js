/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#FF5C00',
        'bg-dark': '#0C0C0E',
        'bg-card': '#141416',
        'bg-section': '#1C1C1F',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        btn: '100px',
      },
    },
  },
  plugins: [],
};
