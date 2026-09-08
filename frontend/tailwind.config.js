/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#D8582B',
          dark: '#B84318',
          deep: '#933513',
          light: '#E56D43',
          bg: '#FBF8F5',
          border: 'rgba(216, 88, 43, 0.3)',
        },
        editorial: {
          ivory: '#F4EFEA',
          paper: '#EFEAE3',
          parchment: '#E8E2D8',
          dark: '#161412',
          obsidian: '#0E0D0C',
          text: '#221F1C',
          muted: '#6E6760',
          stroke: '#4A443E',
        },
        gov: {
          blue: '#3B82F6',
          blueDark: '#1E40AF',
          blueLight: '#93C5FD',
          navy: '#1E3A5F',
          slate: '#475569',
          gray: '#F1F5F9',
          grayDark: '#334155',
          bg: '#FFFFFF',
          bgAlt: '#F8FAFC',
          text: '#1E293B',
          textMuted: '#64748B',
          border: '#E2E8F0',
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
          critical: '#991B1B',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Source Code Pro"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'gov-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'gov-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'gov-xl': '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
