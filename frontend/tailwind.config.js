/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', // Background utama
          800: '#1e293b', // Card background
          700: '#334155', // Border
        }
      }
    },
  },
  plugins: [],
}