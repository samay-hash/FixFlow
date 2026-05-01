/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:  '#F2EDE4',
        cream2: '#EAE4D9',
        brutal: {
          black:  '#0A0A0A',
          lime:   '#C8FF00',
          pink:   '#FF2D78',
          blue:   '#0050FF',
          yellow: '#FFE500',
        },
        // Keep dark for recharts compatibility
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a2e',
        },
      },
      fontFamily: {
        sans:  ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
        space: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        brutal:    '4px 4px 0px #0A0A0A',
        'brutal-lg': '6px 6px 0px #0A0A0A',
        'brutal-lime': '4px 4px 0px #C8FF00',
        'brutal-pink': '4px 4px 0px #FF2D78',
      },
    },
  },
  plugins: [],
};
