/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0E1015',
        accent: {
          DEFAULT: '#01D375',
          hover: '#00B865',
          light: 'rgba(1, 211, 117, 0.1)',
        }
      }
    },
  },
  plugins: [],
};
