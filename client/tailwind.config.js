/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f5',
          100: '#dfefe6',
          200: '#c1dfcf',
          300: '#95c7ae',
          400: '#65a888',
          500: '#3f8a68',
          600: '#2d6e51',
          700: '#245842',
          800: '#1f4736',
          900: '#1a3b2e',
          950: '#0d211a',
        },
        charcoal: {
          DEFAULT: '#181A18',
          light: '#2D312E',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
