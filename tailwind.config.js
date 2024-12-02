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
        primary: {
          DEFAULT: '#1C3B3B',  // Dark teal
          50: '#E6EDED',
          100: '#C2D1D1',
          200: '#9EB5B5',
          300: '#7A9999',
          400: '#567D7D',
          500: '#326161',
          600: '#1C3B3B',
          700: '#152E2E',
          800: '#0E2020',
          900: '#071313'
        },
        background: {
          DEFAULT: '#1A2426',  // Dark blue-gray
          darker: '#141B1D',   
          lighter: '#202C2E'   
        },
        surface: {
          DEFAULT: '#243438',  // Slightly lighter blue-gray
          dark: '#1A2426',
          light: '#2C3E42'
        },
        accent: {
          DEFAULT: '#7AB800',  // Bright green
          light: '#96D119',
          dark: '#5C8A00'
        },
        status: {
          success: '#7AB800',
          warning: '#F5A623',
          error: '#D0021B',
          info: '#4A90E2'
        },
        text: {
          primary: '#E6EDED',    // Very light teal
          secondary: '#9EB5B5',  // Mid teal
          disabled: '#567D7D'    // Darker teal
        }
      }
    }
  },
  plugins: [],
}
