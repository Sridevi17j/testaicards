/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {animation: {
      'hoverAnimation': 'hoverAnimation 1s ease-in-out infinite',
      'scroll': 'scroll 30s linear infinite',
    },keyframes: {
      scroll: {
        '0%': { transform: 'translateY(0)' },
        '100%': { transform: 'translateY(-50%)' },
      }
    },backdropBlur: {
      sm: '4px',
    }},
  },
  variants: {
    extend: {},
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities);
    },
  ],
  
}