// appInit.ts
import { initOpenAIApi, isConfigured } from "./services/openaiService";
import { clearAllAudioBlobs } from './idb';
import { apiKey, base64Images } from "./stores/stores";
import { conversations, chosenConversationId, settingsVisible } from "./stores/stores";
import { get } from "svelte/store";

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

  // Try to get the API key from localStorage
  const storedApiKey = localStorage.getItem('api_key');
  
  if (storedApiKey) {
    apiKey.set(JSON.parse(storedApiKey));
    console.log("API Key loaded from localStorage");
  } else {
    console.warn("API Key not found in localStorage");
    settingsVisible.set(true); // Open settings modal if no API key is found
  }

  // Initialize OpenAI API if the key is set
  if (get(apiKey)) {
    initOpenAIApi();
    if (isConfigured()) {
      console.log("OpenAI API initialized successfully");
    } else {
      console.warn("Failed to initialize OpenAI API");
      settingsVisible.set(true);
    }
  }

  // Log the current API key status for debugging
  console.log("API Key status:", get(apiKey) ? "Set" : "Not set");

  // Subscribe to changes in the API key
  apiKey.subscribe((value) => {
    if (value) {
      console.log("API Key updated in store:", value.substring(0, 10) + "...");
      initOpenAIApi();
      if (!isConfigured()) {
        console.warn("Failed to initialize OpenAI API after key update");
        settingsVisible.set(true);
      }
    } else {
      console.warn("API Key cleared or set to null/undefined");
      settingsVisible.set(true);
    }
  });

  // Additional initialization logic can go here

  // Additional initialization logic can go here
}

// Function to perform any cleanup on app unload or similar scenarios
export function cleanupApp() {
  window.removeEventListener('resize', setAppHeight);
  // Any additional cleanup logic can go here
}
