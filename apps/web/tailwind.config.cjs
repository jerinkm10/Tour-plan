/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        trip: {
          ink: '#020617',
          panel: '#0b1220',
          sky: '#38bdf8',
          blue: '#2563eb'
        }
      },
      boxShadow: {
        glow: '0 24px 80px rgba(14, 165, 233, 0.18)'
      }
    }
  },
  plugins: []
};