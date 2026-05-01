/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a2e',
          600: '#16213e',
          500: '#0f3460',
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        danger: { DEFAULT: '#ef4444', light: '#fca5a5' },
        warning: { DEFAULT: '#f59e0b', light: '#fcd34d' },
        success: { DEFAULT: '#10b981', light: '#6ee7b7' },
        critical: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideIn: { '0%': { transform: 'translateX(100%)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(-8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
