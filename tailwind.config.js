/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#30e86e",
        "primary-dark": "#25b355", 
        "background-light": "#f6f8f6",
        "background-dark": "#112116",
        "pastel-mint": "#dcfce7",
        "pastel-lavender": "#f3e8ff", 
        "pastel-peach": "#ffedd5",
        "accent-gray": "#94a3b8",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(48, 232, 110, 0.3)',
      }
    },
  },
  plugins: [],
}

