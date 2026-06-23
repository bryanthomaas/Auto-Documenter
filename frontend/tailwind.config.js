/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#0A0A1A',
        'starlight': '#E0E7FF',
        'neon-blue': '#3B82F6',
      }
    },
  },
  plugins: [],
}
