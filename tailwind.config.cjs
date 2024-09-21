/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a1c23', 
        secondary: '#282c34', 
        warningHover: '#e56865',
        warning: '#c23e45',
        good3: '#96c561',
        good2: '#4889fe',
        good: '#2563eb',
        hover: '#2b3038',
        hover2: '#333943',
        chat: '#3a3f4b',
        accent: '#61dafb',
      },
            opacity: {
        'hover': '.2',
      }
    }
  },
  plugins: []
};
