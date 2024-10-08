import './app.css'
import App from './App.svelte';
import chatIcon from './assets/chat.svg';

// Load environment variables
const apiKey = import.meta.env.VITE_API_KEY;

const app = new App({
  target: document.getElementById('app'),
  props: {
    apiKey: apiKey
  }
})

window.addEventListener('load', () => {
  const linkIcon = document.querySelector('link[rel="icon"]');
  if (linkIcon) linkIcon.setAttribute('href', chatIcon);
});

export default app

