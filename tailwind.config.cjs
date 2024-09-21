/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A', 
        secondary: '#252525', 
        warningHover: '#FF6B6B',
        warning: '#D64545',
        good3: '#A0E57E',
        good2: '#4EA8DE',
        good: '#3B82F6',
        hover: '#333333',
        hover2: '#404040',
        chat: '#2A2A2A',
        accent: '#10A37F',
      },
            opacity: {
        'hover': '.2',
      }
    }
  },
  plugins: []
};
