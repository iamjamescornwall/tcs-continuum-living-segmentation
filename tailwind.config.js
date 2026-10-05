/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B2740',
          700: '#13293D',
        },
        slate: {
          500: '#5C7080',
          200: '#CFE0EA',
        },
        canvas: '#F6F8FA',
        teal: {
          600: '#0E7C86',
        },
        gold: {
          500: '#E9B44C',
        },
        amber: {
          700: '#8A6D1F',
        },
        rust: {
          600: '#B0603C',
        },
        red: {
          700: '#B03A2E',
        },
        indigo: {
          500: '#5B6ABF',
        },
        // AI-intervention badges
        ai: {
          agent: '#8A6D1F',
          ml: '#0E7C86',
          genai: '#5B6ABF',
          rules: '#B0603C',
          human: '#B03A2E',
        },
        // Market colors
        market: {
          a: '#0E7C86',
          b: '#5B6ABF',
          c: '#B0603C',
        },
        // Segment colors A -> E
        segment: {
          a: '#0B2740',
          b: '#1B4A63',
          c: '#0E7C86',
          d: '#9DB4C4',
          e: '#CFE0EA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'section-title': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
