/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'basetitan': {
          'dark': '#0d1117',
          'light': '#161b22',
          'border': '#30363d',
          'text': '#c9d1d9',
          'text-secondary': '#8b949e',
        },
        'accent': {
          'primary': '#2f81f7',
          'primary-hover': '#58a6ff',
          'secondary': '#2ea043',
          'secondary-hover': '#3fb950',
          'danger': '#f85149',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'notification-in': 'notification-in 0.5s ease-out forwards',
        'notification-out': 'notification-out 0.5s ease-in forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        'infinite-scroll': 'infinite-scroll 25s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in-up': 'slide-in-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'finger-tap': 'finger-tap 8s ease-in-out infinite',
        'mobile-sidebar': 'mobile-sidebar 8s ease-in-out infinite',
        'draw-sparkline': 'draw-sparkline 3s ease-out infinite',
        'shimmer-text': 'shimmer-text 4s infinite linear',
        'fade-in-list-item': 'fade-in-list-item 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'notification-in': {
            '0%': { opacity: '0', transform: 'translateX(-100%)' },
            '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'notification-out': {
            '0%': { opacity: '1', transform: 'translateX(0)' },
            '100%': { opacity: '0', transform: 'translateX(-100%)' },
        },
         'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'infinite-scroll': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-100%)' },
        },
        'glow': {
          'from': { 'box-shadow': '0 0 10px -5px #2f81f7' },
          'to': { 'box-shadow': '0 0 20px 5px #2f81f7' }
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'finger-tap': {
          '0%, 100%': { transform: 'translate(20px, 18px) scale(1)', opacity: '0' },
          '5%, 95%': { transform: 'translate(20px, 18px) scale(1)', opacity: '1' },
          '10%': { transform: 'translate(20px, 18px) scale(0.9)' }, // tap menu
          '15%, 50%': { transform: 'translate(20px, 18px) scale(1)', opacity: '1' },
          '60%': { transform: 'translate(100px, 150px) scale(1)' }, // move to content
          '70%': { transform: 'translate(100px, 150px) scale(0.9)' }, // tap content
          '75%, 90%': { transform: 'translate(100px, 150px) scale(1)', opacity: '1' },
        },
        'mobile-sidebar': {
          '0%, 15%, 75%, 100%': { transform: 'translateX(-100%)', opacity: '0' }, // Hidden
          '20%, 70%': { transform: 'translateX(0)', opacity: '1' }, // Visible
        },
        'draw-sparkline': {
          'from': { 'stroke-dashoffset': '120' },
          'to': { 'stroke-dashoffset': '0' },
        },
        'shimmer-text': {
            '0%': { 'background-position': '-200% 0' },
            '100%': { 'background-position': '200% 0' },
        },
         'fade-in-list-item': {
          'from': { opacity: '0', transform: 'translateX(-10px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
      }
    }
  },
  plugins: [],
}