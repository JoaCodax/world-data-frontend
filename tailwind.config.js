/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFB3BA',
          green: '#BAFFC9',
          blue: '#BAE1FF',
          yellow: '#FFFFBA',
          peach: '#FFDFba',
          purple: '#E0BBE4',
          mauve: '#957DAD',
          rose: '#D4A5A5',
          mint: '#A8E6CF',
          sage: '#DCEDC1',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

