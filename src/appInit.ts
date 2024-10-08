// appInit.ts
import { initOpenAIApi } from "./services/openaiService";
import { clearAllAudioBlobs } from './idb';
import { apiKey, base64Images } from "./stores/stores";
import { conversations, chosenConversationId, settingsVisible } from "./stores/stores";
import { get, writable } from "svelte/store";

// Function to set the app height for mobile viewport issues
function setAppHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-height', `${vh}px`);
}

// Initialization function for the app
export async function initApp() {
    if (get(conversations).length > 0) {
      chosenConversationId.set(get(conversations).length - 1);
    }

  // Set the app height
  setAppHeight();

  // Add event listener to reset app height on resize
  window.addEventListener('resize', setAppHeight);

  // Clear all audio blobs from IndexedDB on init
  try {
    await clearAllAudioBlobs();
  } catch (error) {
    console.error('Failed to clear audio blobs:', error);
  }
  base64Images.set([]);

  // Set the API key from environment variable
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (envApiKey) {
    apiKey.set(envApiKey);
    console.log("API Key set from environment variable:", envApiKey.substring(0, 10) + "...");
    initOpenAIApi();
  } else {
    console.warn("API Key not found in environment variables");
    settingsVisible.set(true); // Open settings modal if no API key is found
  }

  // Subscribe to changes in the API key
  apiKey.subscribe((value) => {
    if (value) {
      console.log("API Key updated in store:", value.substring(0, 10) + "...");
      initOpenAIApi();
    } else {
      console.warn("API Key cleared or set to null/undefined");
    }
  });

  // Additional initialization logic can go here
}

// Function to perform any cleanup on app unload or similar scenarios
export function cleanupApp() {
  window.removeEventListener('resize', setAppHeight);
  // Any additional cleanup logic can go here
}
