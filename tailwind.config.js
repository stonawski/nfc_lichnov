/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5FFF8',
          100: '#E8F7ED',
          500: '#00923F',
          700: '#14532D',
          900: '#18352A'
        },
        sand: {
          50: '#FAF8F3',
          100: '#F3EFE6',
          200: '#E2DED4'
        },
        ink: {
          900: '#202621',
          500: '#6B746E'
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(24, 53, 42, 0.08)',
        nav: '0 10px 40px rgba(24, 53, 42, 0.07)'
      },
      fontFamily: {
        sans: ['Inter', 'Avenir Next', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
