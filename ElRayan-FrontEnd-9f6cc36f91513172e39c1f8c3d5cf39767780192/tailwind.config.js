/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8102E',
          50: '#FEE7EA',
          100: '#FDCED5',
          200: '#FA9DAB',
          300: '#F76C81',
          400: '#F43B57',
          500: '#C8102E',
          600: '#A00D25',
          700: '#780A1C',
          800: '#500613',
          900: '#28030A',
        },
        dark: {
          DEFAULT: '#1A1F2E',
          light: '#252B3B',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
