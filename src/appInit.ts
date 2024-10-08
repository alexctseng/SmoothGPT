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

  // Set the API key from environment variable or localStorage
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const storedApiKey = localStorage.getItem("api_key");
  
  if (envApiKey) {
    apiKey.set(envApiKey);
    console.log("API Key set from environment variable");
  } else if (storedApiKey) {
    try {
      const parsedKey = JSON.parse(storedApiKey);
      apiKey.set(parsedKey);
      console.log("API Key retrieved from localStorage");
    } catch (error) {
      console.error("Error parsing stored API key:", error);
      apiKey.set(storedApiKey); // Set as is if parsing fails
    }
  } else {
    console.warn("API Key not found in environment variables or localStorage");
    settingsVisible.set(true); // Open settings modal if no API key is found
  }

  console.log("Current API Key:", get(apiKey)); // Log the current API key (be cautious with this in production)

  // Initialize OpenAI service with API key from store
  initOpenAIApi();
  apiKey.subscribe((value) => {
    if (value) {
      initOpenAIApi();
      localStorage.setItem("api_key", JSON.stringify(value)); // Save to localStorage whenever it changes
    }
  });

  // Additional initialization logic can go here
}

// Function to perform any cleanup on app unload or similar scenarios
export function cleanupApp() {
  window.removeEventListener('resize', setAppHeight);
  // Any additional cleanup logic can go here
}
