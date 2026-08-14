/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#651F2B',
        gold: '#C8A45D',
        ivory: '#F7F4EE',
        charcoal: '#252323',
        taupe: '#8A8178',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Neue Montreal"', '"PP Neue Montreal"', 'sans-serif'],
        neue: ['"Neue Montreal"', '"PP Neue Montreal"', 'sans-serif'],
        display: ['"Neue Montreal"', '"PP Neue Montreal"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
