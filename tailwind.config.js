/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: { 
    extend: {
      colors: {
        primary: { 400: '#34d399',  500: '#10b981', 600: '#059669', },
        surface: { 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b', }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    }
  },
  plugins: [],
}