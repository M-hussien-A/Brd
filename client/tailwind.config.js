/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F7',
          100: '#D4DFED',
          200: '#A9BFDB',
          300: '#7E9FC9',
          400: '#2C5F8A',
          500: '#1B3A5C',
          600: '#162F4A',
          700: '#112438',
          800: '#0F1923',
          900: '#0A1018',
        },
        accent: {
          50: '#FFF3EB',
          100: '#FFE0CC',
          200: '#FFC099',
          300: '#FFA166',
          400: '#E8792F',
          500: '#D06520',
          600: '#B85318',
          700: '#8A3E12',
          800: '#5C290C',
          900: '#2E1506',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'gauge-fill': 'gaugeFill 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
