/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        dark: '#2c2c2c',
        orange: '#ff6b00',
        blue: '#007bff',
      },
    },
  },
  plugins: [],
}

