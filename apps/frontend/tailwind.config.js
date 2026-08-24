/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'var(--color-base)',
          card: 'var(--color-base-card)',
          sunk: 'var(--color-base-sunk)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)',
          muted: 'var(--color-ink-muted)',
        },
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: '#F9C24E',
          400: '#F5A623',
          500: '#E8890C',
          600: '#C26F06',
        },
        streak: {
          DEFAULT: '#EF4444',
          deep: '#DC2626',
          soft: 'var(--color-streak-soft)',
        },
        success: {
          DEFAULT: '#22C55E',
          soft: 'var(--color-success-soft)',
          deep: '#16A34A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '1.25rem',
      },
      boxShadow: {
        card: 'var(--color-card-shadow)',
        'card-hover': 'var(--color-card-shadow-hover)',
        glow: 'var(--color-glow)',
      },
    },
  },
  plugins: [],
}
