/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        'ultralight': '100',
        'thin': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      colors: {
        adlaan: {
          dark: '#000000',
          primary: '#1a1a1a',
          secondary: '#f8f9fa',
          accent: '#007AFF',
          text: '#1d1d1f',
          light: '#ffffff',
        },
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          pink: '#FF2D92',
          yellow: '#FFCC00',
          gray: {
            50: '#F2F2F7',
            100: '#E5E5EA',
            200: '#D1D1D6',
            300: '#C7C7CC',
            400: '#AEAEB2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#3A3A3C',
            900: '#1C1C1E',
          }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in': 'slideInFromRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left': 'slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'shake': 'shake 0.5s ease-in-out',
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInFromRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
      },
      animationDelay: {
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '900': '900ms',
        '1000': '1000ms',
        '1100': '1100ms',
        '1300': '1300ms',
        '1500': '1500ms',
        '1700': '1700ms',
        '2000': '2000ms',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const animationDelayUtilities = {
        '.animation-delay-300': {
          'animation-delay': '300ms',
        },
        '.animation-delay-500': {
          'animation-delay': '500ms',
        },
        '.animation-delay-700': {
          'animation-delay': '700ms',
        },
        '.animation-delay-900': {
          'animation-delay': '900ms',
        },
        '.animation-delay-1000': {
          'animation-delay': '1000ms',
        },
        '.animation-delay-1100': {
          'animation-delay': '1100ms',
        },
        '.animation-delay-1200': {
          'animation-delay': '1200ms',
        },
        '.animation-delay-1300': {
          'animation-delay': '1300ms',
        },
        '.animation-delay-1500': {
          'animation-delay': '1500ms',
        },
        '.animation-delay-1700': {
          'animation-delay': '1700ms',
        },
        '.animation-delay-2000': {
          'animation-delay': '2000ms',
        },
      }
      addUtilities(animationDelayUtilities)
    }
  ],
}
