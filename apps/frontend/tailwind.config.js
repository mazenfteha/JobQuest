/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm off-white base + white cards (ui-spec: neutral base, soft cards)
        base: {
          DEFAULT: '#FBFAF7',
          card: '#FFFFFF',
          sunk: '#F4F2EC',
        },
        // Slate text
        ink: {
          DEFAULT: '#0F172A',
          soft: '#475569',
          muted: '#94A3B8',
        },
        // Primary accent — warm gold/amber (XP, progress, CTAs)
        primary: {
          50: '#FEF6E7',
          100: '#FDECC8',
          200: '#FBD88C',
          300: '#F9C24E',
          400: '#F5A623',
          500: '#E8890C',
          600: '#C26F06',
        },
        // Secondary accent — streak / fire (orange-red)
        streak: {
          DEFAULT: '#F9552B',
          deep: '#E23D14',
          soft: '#FFE8E0',
        },
        // Success — offers / achievements (green)
        success: {
          DEFAULT: '#17A34A',
          soft: '#DCFCE7',
          deep: '#15803D',
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
        card: '0 1px 3px rgba(15,23,42,0.04), 0 10px 30px -12px rgba(15,23,42,0.12)',
        'card-hover':
          '0 4px 12px rgba(15,23,42,0.06), 0 18px 44px -14px rgba(15,23,42,0.20)',
        glow: '0 0 0 4px rgba(245,166,35,0.15)',
      },
    },
  },
  plugins: [],
}
