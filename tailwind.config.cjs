/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E1E1E', 
        secondary: '#2D2D2D', 
        warningHover: '#FF6B6B',
        warning: '#D64545',
        good3: '#A0E57E',
        good2: '#4EA8DE',
        good: '#3B82F6',
        hover: '#383838',
        hover2: '#454545',
        chat: '#4A4A4A',
        accent: '#61DAFB',
      },
            opacity: {
        'hover': '.2',
      }
    }
  },
  plugins: []
};
