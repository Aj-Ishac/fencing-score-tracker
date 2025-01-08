/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'airbnb': {
          'rausch': '#FF5A5F',
          'babu': '#00A699',
          'arches': '#FC642D',
          'hof': '#484848',
          'foggy': '#767676',
        },
      },
      fontFamily: {
        'airbnb': ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'airbnb': '8px',
      },
      boxShadow: {
        'airbnb': '0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'airbnb-hover': '0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
} 