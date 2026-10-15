/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette – DESIGN.md exact values
        'bg':         '#08080A',
        'surface':    '#111114',
        'border':     '#27272A',
        'tally':      '#FF3B30',
        'acid':       '#E2F952',
        // Utility shades
        'muted':      '#52525B',
        'subtle':     '#3F3F46',
        'text':       '#E4E4E7',
        'text-dim':   '#A1A1AA',
      },
      fontFamily: {
        syne:   ['Syne', 'sans-serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(3rem,8vw,7rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'hero':    ['clamp(2rem,5vw,4.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'meta':    ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],
      },
      animation: {
        'tally-pulse': 'tallyPulse 1.2s ease-in-out infinite',
        'scan-line':   'scanLine 8s linear infinite',
        'fade-up':     'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        tallyPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.85)' },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-dark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40L40 0M0 0l40 40' stroke='%2327272A' stroke-width='0.3' stroke-opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'tally-glow': '0 0 12px 2px rgba(255,59,48,0.45)',
        'acid-glow':  '0 0 14px 3px rgba(226,249,82,0.35)',
      },
    },
  },
  plugins: [],
}
