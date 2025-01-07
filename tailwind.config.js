/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF0000', // Logex Red
          hover: '#E60000',
          light: '#FFE5E5',
        },
        secondary: {
          DEFAULT: '#666666', // Logex Gray
          light: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
};